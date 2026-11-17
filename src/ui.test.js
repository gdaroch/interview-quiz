import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  state,
  initUI,
  openGuide,
  followGuideLink,
  guideBack,
  closeGuide,
  renderGuide,
  renderQuestion,
} from './ui.js';

// Minimal fake DOM: the node environment has no document.
// Elements are created on first lookup by id, so ui.js can touch any of them.
const fakeElement = () => {
  const listeners = {};
  const el = {
    textContent: '',
    innerHTML: '',
    className: '',
    hidden: false,
    disabled: false,
    scrollTop: 0,
    style: {},
    children: [],
    focus: vi.fn(),
    addEventListener: (type, fn) => {
      listeners[type] = fn;
    },
    dispatch: (type, event) => listeners[type]?.(event),
    replaceChildren: (...nodes) => {
      el.children = nodes;
    },
    append: (...nodes) => {
      el.children.push(...nodes);
    },
    classList: { add: vi.fn(), toggle: vi.fn(), contains: () => false },
    setAttribute: vi.fn(),
  };
  return el;
};

// The fake <dialog> behaves like the browser: showModal opens it and close()
// closes it and fires the registered close listener (this is what Escape does too).
const fakeDialog = () => {
  const dialog = fakeElement();
  dialog.open = false;
  dialog.showModal = vi.fn(() => {
    dialog.open = true;
  });
  dialog.close = vi.fn(() => {
    dialog.open = false;
    dialog.dispatch('close');
  });
  return dialog;
};

const makeDocument = () => {
  const elements = new Map();
  return {
    elements,
    getElementById: (id) => {
      if (!elements.has(id)) elements.set(id, id === 'guide-dialog' ? fakeDialog() : fakeElement());
      return elements.get(id);
    },
    createElement: () => fakeElement(),
    querySelector: () => fakeElement(),
  };
};

const guideIndex = () =>
  new Map([
    ['A', { title: 'Section A', chapterTitle: 'Chapter 1', lines: ['This is **bold** text.', '', 'See [B](#B).'] }],
    ['B', { title: 'Section B', chapterTitle: 'Chapter 1', lines: ['Second *section*.', '', 'See [C](#C).'] }],
    ['C', { title: 'Section C', chapterTitle: 'Chapter 2', lines: ['Third section.'] }],
  ]);

const question = () => ({
  topic: 'JS',
  question: 'What?',
  options: ['one', 'two'],
  correct: 0,
  explanation: 'Because.',
  guideId: 'A',
});

let doc;
const $ = (id) => doc.getElementById(id);

beforeEach(() => {
  doc = makeDocument();
  vi.stubGlobal('document', doc);
  initUI([], guideIndex());
  state.screen = 'question';
  state.round = [question(), question()];
  state.index = 0;
  state.selections = [0];
  state.selected = 0;
  state.submitted = true;
  state.score = 1;
  state.guide.stack = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('openGuide', () => {
  it('does nothing before the answer is submitted', () => {
    state.submitted = false;
    openGuide();
    expect(state.guide.stack).toEqual([]);
    expect($('guide-dialog').showModal).not.toHaveBeenCalled();
    expect($('guide-dialog').open).toBe(false);
  });

  it('opens the dialog at the section of the current question after submitting', () => {
    openGuide();
    expect(state.guide.stack).toEqual(['A']);
    expect($('guide-dialog').showModal).toHaveBeenCalledTimes(1);
    expect($('guide-dialog').open).toBe(true);
    expect($('guide-title').textContent).toBe('Section A');
    expect($('guide-chapter').textContent).toBe('Chapter 1');
    expect($('guide-body').innerHTML).toContain('<strong>bold</strong>');
  });
});

describe('followGuideLink', () => {
  it('pushes the id and shows that section', () => {
    openGuide();
    followGuideLink('B');
    expect(state.guide.stack).toEqual(['A', 'B']);
    expect($('guide-title').textContent).toBe('Section B');
    expect($('guide-body').innerHTML).toContain('<em>section</em>');
  });

  it('ignores an unknown id', () => {
    openGuide();
    followGuideLink('nope');
    expect(state.guide.stack).toEqual(['A']);
    expect($('guide-title').textContent).toBe('Section A');
  });

  it('is reached by clicking a section link in the guide body', () => {
    openGuide();
    const preventDefault = vi.fn();
    const link = { getAttribute: () => '#B' };
    $('guide-body').dispatch('click', { target: { closest: () => link }, preventDefault });
    expect(preventDefault).toHaveBeenCalled();
    expect(state.guide.stack).toEqual(['A', 'B']);
  });
});

describe('guideBack', () => {
  it('removes the last entry and shows the previous section', () => {
    openGuide();
    followGuideLink('B');
    guideBack();
    expect(state.guide.stack).toEqual(['A']);
    expect($('guide-title').textContent).toBe('Section A');
  });

  it('does nothing with a single entry', () => {
    openGuide();
    guideBack();
    expect(state.guide.stack).toEqual(['A']);
    expect($('guide-title').textContent).toBe('Section A');
    expect($('guide-dialog').open).toBe(true);
  });

  it('goes A -> B -> C and back through B then A', () => {
    openGuide();
    followGuideLink('B');
    followGuideLink('C');
    expect($('guide-title').textContent).toBe('Section C');
    guideBack();
    expect($('guide-title').textContent).toBe('Section B');
    guideBack();
    expect($('guide-title').textContent).toBe('Section A');
    expect(state.guide.stack).toEqual(['A']);
  });
});

describe('Back button visibility', () => {
  it('is hidden with one entry and visible with more than one', () => {
    openGuide();
    expect($('guide-back').hidden).toBe(true);
    followGuideLink('B');
    expect($('guide-back').hidden).toBe(false);
    guideBack();
    expect($('guide-back').hidden).toBe(true);
  });
});

describe('closeGuide', () => {
  it('empties the stack and closes the dialog', () => {
    openGuide();
    followGuideLink('B');
    closeGuide();
    expect(state.guide.stack).toEqual([]);
    expect($('guide-dialog').open).toBe(false);
  });

  it('empties the stack when the dialog fires its close event (Escape)', () => {
    openGuide();
    followGuideLink('B');
    $('guide-dialog').close();
    expect(state.guide.stack).toEqual([]);
    expect($('guide-dialog').open).toBe(false);
  });

  it('does nothing visible when the stack is empty and the dialog is closed', () => {
    renderGuide();
    expect($('guide-dialog').close).not.toHaveBeenCalled();
    expect($('guide-dialog').showModal).not.toHaveBeenCalled();
  });
});

describe('reopening', () => {
  it('starts again at the question section with one entry and Back hidden', () => {
    openGuide();
    followGuideLink('B');
    followGuideLink('C');
    closeGuide();
    openGuide();
    expect(state.guide.stack).toEqual(['A']);
    expect($('guide-title').textContent).toBe('Section A');
    expect($('guide-back').hidden).toBe(true);
    expect($('guide-dialog').open).toBe(true);
  });
});

describe('round independence', () => {
  it('leaves the round state exactly as it was after open, follow, back and close', () => {
    const snapshot = () =>
      structuredClone({
        index: state.index,
        selected: state.selected,
        submitted: state.submitted,
        score: state.score,
        selections: state.selections,
        round: state.round,
      });
    const before = snapshot();
    openGuide();
    followGuideLink('B');
    followGuideLink('C');
    guideBack();
    closeGuide();
    expect(snapshot()).toEqual(before);
  });
});

describe('guide button in renderQuestion', () => {
  it('is hidden before submitting and visible after', () => {
    state.submitted = false;
    state.selected = null;
    renderQuestion();
    expect($('btn-guide').hidden).toBe(true);
    state.submitted = true;
    state.selected = 0;
    renderQuestion();
    expect($('btn-guide').hidden).toBe(false);
  });
});
