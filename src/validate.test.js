import { describe, it, expect } from 'vitest';
import { validateBank } from './validate.js';
import bundledQuestions from './questions.json';

const makeQuestion = (overrides = {}) => ({
  id: 'q1',
  topic: 'JavaScript',
  question: 'What is 1 + 1?',
  options: ['1', '2', '3'],
  answer: 1,
  explanation: 'Basic arithmetic.',
  ...overrides,
});

const withoutKey = (obj, key) => {
  const copy = { ...obj };
  delete copy[key];
  return copy;
};

const fieldsOf = (errors) => errors.map((e) => e.field);

describe('validateBank - bank shape', () => {
  it('accepts a valid question', () => {
    expect(validateBank([makeQuestion()])).toEqual([]);
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an object', { id: 'q1' }],
    ['a string', 'questions'],
    ['a number', 42],
  ])('reports non-list data (%s)', (_label, data) => {
    const errors = validateBank(data);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ questionRef: 'bank', field: '(root)' });
    expect(errors[0].message).toMatch(/list/i);
  });

  it('reports an empty bank', () => {
    const errors = validateBank([]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ questionRef: 'bank', field: '(root)' });
    expect(errors[0].message).toMatch(/empty/i);
  });

  it('reports a non-object question entry by position', () => {
    const errors = validateBank([makeQuestion(), 'oops']);
    expect(errors).toEqual([
      expect.objectContaining({ questionRef: 'question #2', field: '(question)' }),
    ]);
  });
});

describe('validateBank - required string fields', () => {
  it.each(['id', 'topic', 'question', 'explanation'])('reports a missing %s', (field) => {
    const errors = validateBank([withoutKey(makeQuestion(), field)]);
    expect(fieldsOf(errors)).toContain(field);
  });

  it.each(['id', 'topic', 'question', 'explanation'])('reports a wrong-type %s', (field) => {
    const errors = validateBank([makeQuestion({ [field]: 123 })]);
    expect(fieldsOf(errors)).toContain(field);
  });
});

describe('validateBank - answer', () => {
  it('reports a negative answer', () => {
    const errors = validateBank([makeQuestion({ answer: -1 })]);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'q1', field: 'answer' })]);
  });

  it('reports a non-integer answer', () => {
    const errors = validateBank([makeQuestion({ answer: 1.5 })]);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'q1', field: 'answer' })]);
  });

  it('reports a string answer', () => {
    const errors = validateBank([makeQuestion({ answer: '1' })]);
    expect(fieldsOf(errors)).toContain('answer');
  });

  it('reports a missing answer', () => {
    const errors = validateBank([withoutKey(makeQuestion(), 'answer')]);
    expect(fieldsOf(errors)).toContain('answer');
  });

  it('reports an answer equal to the options length', () => {
    const errors = validateBank([makeQuestion({ answer: 3 })]);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'q1', field: 'answer' })]);
  });

  it('reports an answer greater than the options length', () => {
    const errors = validateBank([makeQuestion({ answer: 10 })]);
    expect(fieldsOf(errors)).toEqual(['answer']);
  });

  it('accepts the first and last option indexes', () => {
    expect(validateBank([makeQuestion({ answer: 0 })])).toEqual([]);
    expect(validateBank([makeQuestion({ answer: 2 })])).toEqual([]);
  });
});

describe('validateBank - options', () => {
  it('reports fewer than two options', () => {
    const errors = validateBank([makeQuestion({ options: ['only'], answer: 0 })]);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'q1', field: 'options' })]);
  });

  it('reports an empty options array', () => {
    const errors = validateBank([makeQuestion({ options: [], answer: 0 })]);
    expect(fieldsOf(errors)).toContain('options');
  });

  it('reports missing options', () => {
    const errors = validateBank([withoutKey(makeQuestion(), 'options')]);
    expect(fieldsOf(errors)).toContain('options');
  });

  it('reports options that are not an array', () => {
    const errors = validateBank([makeQuestion({ options: 'a,b' })]);
    expect(fieldsOf(errors)).toContain('options');
  });

  it('reports an empty option string with its index', () => {
    const errors = validateBank([makeQuestion({ options: ['a', '', 'c'] })]);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'q1', field: 'options[1]' })]);
  });

  it('reports a whitespace-only option', () => {
    const errors = validateBank([makeQuestion({ options: ['a', 'b', '   '] })]);
    expect(fieldsOf(errors)).toEqual(['options[2]']);
  });

  it('reports a non-string option', () => {
    const errors = validateBank([makeQuestion({ options: ['a', 2, 'c'] })]);
    expect(fieldsOf(errors)).toEqual(['options[1]']);
  });
});

describe('validateBank - unique ids', () => {
  it('reports a duplicate id and names it', () => {
    const errors = validateBank([makeQuestion({ id: 'dup' }), makeQuestion({ id: 'dup' })]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ questionRef: 'dup', field: 'id' });
    expect(errors[0].message).toContain('dup');
  });

  it('reports a triplicated id only once', () => {
    const errors = validateBank([
      makeQuestion({ id: 'dup' }),
      makeQuestion({ id: 'dup' }),
      makeQuestion({ id: 'dup' }),
    ]);
    expect(errors).toHaveLength(1);
  });

  it('accepts distinct ids', () => {
    expect(validateBank([makeQuestion({ id: 'a' }), makeQuestion({ id: 'b' })])).toEqual([]);
  });
});

describe('validateBank - optional code', () => {
  const validCode = { language: 'javascript', lines: ['const a = 1;', 'console.log(a);'] };

  it('accepts a question without code', () => {
    expect(validateBank([makeQuestion()])).toEqual([]);
  });

  it('accepts a valid code snippet', () => {
    expect(validateBank([makeQuestion({ code: validCode })])).toEqual([]);
  });

  it('accepts empty-string lines inside a snippet', () => {
    const code = { language: 'javascript', lines: ['a', '', 'b'] };
    expect(validateBank([makeQuestion({ code })])).toEqual([]);
  });

  it('reports code that is not an object', () => {
    const errors = validateBank([makeQuestion({ code: 'x = 1' })]);
    expect(fieldsOf(errors)).toEqual(['code']);
  });

  it('reports code that is an array', () => {
    const errors = validateBank([makeQuestion({ code: [] })]);
    expect(fieldsOf(errors)).toEqual(['code']);
  });

  it('reports a missing language', () => {
    const errors = validateBank([makeQuestion({ code: withoutKey(validCode, 'language') })]);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'q1', field: 'code.language' })]);
  });

  it('reports an empty language', () => {
    const errors = validateBank([makeQuestion({ code: { ...validCode, language: '' } })]);
    expect(fieldsOf(errors)).toEqual(['code.language']);
  });

  it('reports a whitespace-only language', () => {
    const errors = validateBank([makeQuestion({ code: { ...validCode, language: '  ' } })]);
    expect(fieldsOf(errors)).toEqual(['code.language']);
  });

  it('reports missing lines', () => {
    const errors = validateBank([makeQuestion({ code: withoutKey(validCode, 'lines') })]);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'q1', field: 'code.lines' })]);
  });

  it('reports empty lines', () => {
    const errors = validateBank([makeQuestion({ code: { ...validCode, lines: [] } })]);
    expect(fieldsOf(errors)).toEqual(['code.lines']);
  });

  it('reports lines that are not an array', () => {
    const errors = validateBank([makeQuestion({ code: { ...validCode, lines: 'a\nb' } })]);
    expect(fieldsOf(errors)).toEqual(['code.lines']);
  });

  it('reports a non-string line entry with its index', () => {
    const code = { language: 'javascript', lines: ['ok', 5, 'ok'] };
    const errors = validateBank([makeQuestion({ code })]);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'q1', field: 'code.lines[1]' })]);
  });
});

describe('validateBank - error reporting', () => {
  it('reports multiple errors across questions in one pass', () => {
    const errors = validateBank([
      makeQuestion({ id: 'bad-answer', answer: 9 }),
      withoutKey(makeQuestion({ id: 'no-expl' }), 'explanation'),
    ]);
    expect(errors).toHaveLength(2);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ questionRef: 'bad-answer', field: 'answer' }),
        expect.objectContaining({ questionRef: 'no-expl', field: 'explanation' }),
      ]),
    );
  });

  it('reports multiple errors within a single question', () => {
    const errors = validateBank([
      makeQuestion({ topic: 1, options: ['a', ''], answer: 5, code: { language: '', lines: [] } }),
    ]);
    expect(fieldsOf(errors)).toEqual(
      expect.arrayContaining(['topic', 'options[1]', 'answer', 'code.language', 'code.lines']),
    );
    expect(errors.every((e) => e.questionRef === 'q1')).toBe(true);
  });

  it('identifies a question by position when the id is missing', () => {
    const errors = validateBank([makeQuestion({ id: 'first' }), withoutKey(makeQuestion({ id: 'x' }), 'id')]);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'question #2', field: 'id' })]);
  });

  it('identifies a question by position when the id has the wrong type', () => {
    const errors = validateBank([makeQuestion({ id: 7 })]);
    expect(errors).toEqual([expect.objectContaining({ questionRef: 'question #1', field: 'id' })]);
  });

  it('identifies a question by position when the id is empty', () => {
    const errors = validateBank([makeQuestion({ id: '', answer: 99 })]);
    expect(errors.every((e) => e.questionRef === 'question #1')).toBe(true);
    expect(fieldsOf(errors)).toContain('answer');
  });

  it('returns errors with questionRef, field and message', () => {
    const [error] = validateBank([makeQuestion({ answer: -1 })]);
    expect(error).toEqual({
      questionRef: 'q1',
      field: 'answer',
      message: expect.any(String),
    });
  });
});

describe('bundled question bank', () => {
  it('passes validateBank with no errors', () => {
    expect(validateBank(bundledQuestions)).toEqual([]);
  });
});
