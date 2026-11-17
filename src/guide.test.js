import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateGuide, buildGuideIndex } from './guide.js';
import { parseJson } from './parse.js';

const makeSection = (overrides = {}) => ({
  id: 's1',
  title: 'Section one',
  lines: ['Some text.'],
  ...overrides,
});

const makeChapter = (overrides = {}) => ({
  id: 'c1',
  title: 'Chapter one',
  sections: [makeSection()],
  ...overrides,
});

const makeGuide = (chapters = [makeChapter()]) => ({ chapters });

const withoutKey = (obj, key) => {
  const copy = { ...obj };
  delete copy[key];
  return copy;
};

describe('validateGuide - valid guide', () => {
  it('accepts a valid guide', () => {
    expect(validateGuide(makeGuide())).toEqual([]);
  });

  it('accepts empty-string lines', () => {
    const guide = makeGuide([makeChapter({ sections: [makeSection({ lines: ['a', '', 'b'] })] })]);
    expect(validateGuide(guide)).toEqual([]);
  });
});

describe('validateGuide - chapters', () => {
  it.each(['id', 'title', 'sections'])('reports a chapter with a missing %s', (field) => {
    const errors = validateGuide(makeGuide([withoutKey(makeChapter(), field)]));
    expect(errors).toEqual([expect.objectContaining({ field })]);
  });

  it.each(['id', 'title'])('reports a chapter with a wrong-type %s', (field) => {
    const errors = validateGuide(makeGuide([makeChapter({ [field]: 5 })]));
    expect(errors).toEqual([expect.objectContaining({ field })]);
  });

  it('reports chapter sections that are not an array', () => {
    const errors = validateGuide(makeGuide([makeChapter({ sections: 'x' })]));
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'c1', field: 'sections' })]);
  });

  it('names a chapter by its id', () => {
    const errors = validateGuide(makeGuide([makeChapter({ id: 'js', title: 7 })]));
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'js', field: 'title' })]);
  });

  it('names a chapter by position when it has no usable id', () => {
    const errors = validateGuide(makeGuide([makeChapter(), withoutKey(makeChapter({ sections: [] }), 'id')]));
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'chapter #2', field: 'id' })]);
  });

  it('reports a chapter that is not an object', () => {
    const errors = validateGuide(makeGuide([makeChapter(), 'oops']));
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'chapter #2', field: '(chapter)' })]);
  });
});

describe('validateGuide - sections', () => {
  const guideWith = (section) => makeGuide([makeChapter({ sections: [section] })]);

  it.each(['id', 'title', 'lines'])('reports a section with a missing %s', (field) => {
    const errors = validateGuide(guideWith(withoutKey(makeSection(), field)));
    expect(errors).toEqual([expect.objectContaining({ field })]);
  });

  it.each(['id', 'title'])('reports a section with a wrong-type %s', (field) => {
    const errors = validateGuide(guideWith(makeSection({ [field]: 5 })));
    expect(errors).toEqual([expect.objectContaining({ field })]);
  });

  it('reports section lines that are not an array', () => {
    const errors = validateGuide(guideWith(makeSection({ lines: 'a\nb' })));
    expect(errors).toEqual([expect.objectContaining({ questionRef: 's1', field: 'lines' })]);
  });

  it('reports a non-string line with its index', () => {
    const errors = validateGuide(guideWith(makeSection({ lines: ['ok', 5, 'ok'] })));
    expect(errors).toEqual([expect.objectContaining({ questionRef: 's1', field: 'lines[1]' })]);
  });

  it('names a section by position when it has no usable id', () => {
    const chapter = makeChapter({ sections: [makeSection(), withoutKey(makeSection({ id: 'x' }), 'id')] });
    const errors = validateGuide(makeGuide([chapter]));
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'section #2', field: 'id' })]);
  });

  it('reports a section that is not an object', () => {
    const errors = validateGuide(guideWith('oops'));
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'section #1', field: '(section)' })]);
  });
});

describe('validateGuide - unique section ids', () => {
  it('reports a duplicate id and names it', () => {
    const chapter = makeChapter({ sections: [makeSection({ id: 'dup' }), makeSection({ id: 'dup' })] });
    const errors = validateGuide(makeGuide([chapter]));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ questionRef: 'dup', field: 'id' });
    expect(errors[0].message).toContain('dup');
  });

  it('reports a triplicated id only once', () => {
    const chapter = makeChapter({
      sections: [makeSection({ id: 'dup' }), makeSection({ id: 'dup' }), makeSection({ id: 'dup' })],
    });
    expect(validateGuide(makeGuide([chapter]))).toHaveLength(1);
  });

  it('reports a duplicate id across chapters', () => {
    const guide = makeGuide([
      makeChapter({ id: 'c1', sections: [makeSection({ id: 'dup' })] }),
      makeChapter({ id: 'c2', sections: [makeSection({ id: 'dup' })] }),
    ]);
    const errors = validateGuide(guide);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'dup', field: 'id' })]);
  });
});

describe('validateGuide - links between sections', () => {
  const guideWithLines = (lines) =>
    makeGuide([makeChapter({ sections: [makeSection({ id: 'a', lines }), makeSection({ id: 'b' })] })]);

  it('accepts a link to an existing section', () => {
    expect(validateGuide(guideWithLines(['See [b](#b) for more.']))).toEqual([]);
  });

  it('accepts a link to a section in another chapter', () => {
    const guide = makeGuide([
      makeChapter({ id: 'c1', sections: [makeSection({ id: 'a', lines: ['[x](#z)'] })] }),
      makeChapter({ id: 'c2', sections: [makeSection({ id: 'z' })] }),
    ]);
    expect(validateGuide(guide)).toEqual([]);
  });

  it('reports a link to a missing section, naming the section and the id', () => {
    const errors = validateGuide(guideWithLines(['See [x](#zzz).']));
    expect(errors).toEqual([
      { questionRef: 'a', field: 'lines', message: 'link to unknown section "zzz"' },
    ]);
  });

  it('reports every broken link', () => {
    const errors = validateGuide(guideWithLines(['[x](#one) and [y](#two)', '[z](#b)']));
    expect(errors.map((e) => e.message)).toEqual([
      'link to unknown section "one"',
      'link to unknown section "two"',
    ]);
  });

  it('ignores links inside a fenced code block', () => {
    const lines = ['```md', '[x](#zzz)', '```', 'after'];
    expect(validateGuide(guideWithLines(lines))).toEqual([]);
  });

  it('checks links again after a fenced code block closes', () => {
    const lines = ['```', '[x](#in-fence)', '```', '[y](#after-fence)'];
    const errors = validateGuide(guideWithLines(lines));
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'a', message: 'link to unknown section "after-fence"' })]);
  });
});

describe('validateGuide - root', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an array', []],
    ['a string', 'guide'],
    ['a number', 42],
  ])('reports a root that is not an object (%s)', (_label, data) => {
    const errors = validateGuide(data);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'guide', field: '(root)' })]);
  });

  it.each([
    ['missing', {}],
    ['an object', { chapters: {} }],
    ['a string', { chapters: 'x' }],
  ])('reports chapters that are not an array (%s)', (_label, data) => {
    const errors = validateGuide(data);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'guide', field: '(root)' })]);
  });
});

describe('validateGuide - error reporting', () => {
  it('reports several problems in one pass', () => {
    const guide = makeGuide([
      makeChapter({
        id: 'c1',
        title: 1,
        sections: [
          makeSection({ id: 'a', title: 2, lines: ['[x](#missing)'] }),
          makeSection({ id: 'a' }),
          makeSection({ id: 'b', lines: ['ok', 3] }),
        ],
      }),
    ]);
    const errors = validateGuide(guide);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ questionRef: 'c1', field: 'title' }),
        expect.objectContaining({ questionRef: 'a', field: 'title' }),
        expect.objectContaining({ questionRef: 'a', field: 'id' }),
        expect.objectContaining({ questionRef: 'b', field: 'lines[1]' }),
        expect.objectContaining({ questionRef: 'a', field: 'lines', message: 'link to unknown section "missing"' }),
      ]),
    );
    expect(errors).toHaveLength(5);
  });

  it('returns errors with questionRef, field and message', () => {
    const [err] = validateGuide({});
    expect(err).toEqual({ questionRef: 'guide', field: '(root)', message: expect.any(String) });
  });
});

describe('buildGuideIndex', () => {
  const guide = makeGuide([
    makeChapter({
      id: 'c1',
      title: 'First chapter',
      sections: [
        makeSection({ id: 'a', title: 'Alpha', lines: ['one', 'two'] }),
        makeSection({ id: 'b', title: 'Beta', lines: [] }),
      ],
    }),
    makeChapter({
      id: 'c2',
      title: 'Second chapter',
      sections: [makeSection({ id: 'c', title: 'Gamma', lines: ['three'] })],
    }),
  ]);

  it('returns a Map keyed by section id, in guide order', () => {
    const index = buildGuideIndex(guide);
    expect(index).toBeInstanceOf(Map);
    expect([...index.keys()]).toEqual(['a', 'b', 'c']);
  });

  it('stores title, chapterTitle and lines for each section', () => {
    const index = buildGuideIndex(guide);
    expect(index.get('a')).toEqual({ title: 'Alpha', chapterTitle: 'First chapter', lines: ['one', 'two'] });
    expect(index.get('b')).toEqual({ title: 'Beta', chapterTitle: 'First chapter', lines: [] });
    expect(index.get('c')).toEqual({ title: 'Gamma', chapterTitle: 'Second chapter', lines: ['three'] });
  });

  it('returns an empty Map for a guide without chapters', () => {
    expect(buildGuideIndex({ chapters: [] }).size).toBe(0);
  });
});

describe('bundled study guide', () => {
  it('parses the real guide.json and passes validateGuide', () => {
    const text = readFileSync(new URL('./data/guide.json', import.meta.url), 'utf-8');
    const result = parseJson(text, 'guide.json');
    expect(result).not.toHaveProperty('errors');
    expect(validateGuide(result.data)).toEqual([]);
  });
});
