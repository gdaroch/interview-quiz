import { describe, it, expect } from 'vitest';
import { shuffle, createRound, isCorrect, countCorrect } from './round.js';

// Fake random source for tests: gives the same numbers every time for the same seed.
// Each call multiplies the previous number and wraps it, then scales it to 0..1.
const seeded = (seed) => {
  let current = seed;
  return () => {
    current = (current * 16807) % 2147483647;
    return current / 2147483647;
  };
};

// Random source that always returns the same value.
const constant = (value) => () => value;

const makeQuestion = (n, overrides = {}) => ({
  id: `q${n}`,
  topic: 'JavaScript',
  question: `Question ${n}?`,
  options: [`a${n}`, `b${n}`, `c${n}`, `d${n}`],
  answer: n % 4,
  explanation: `Explanation ${n}.`,
  ...overrides,
});

const makeBank = (count) => Array.from({ length: count }, (_, i) => makeQuestion(i));

const ids = (round) => round.map((q) => q.id);

describe('shuffle', () => {
  it('returns a new array with the same elements', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const result = shuffle(input, seeded(1));
    expect(result).not.toBe(input);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5, 6];
    shuffle(input, seeded(1));
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('is deterministic for the same random source', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(shuffle(input, seeded(7))).toEqual(shuffle(input, seeded(7)));
  });

  it('handles empty and single-element arrays', () => {
    expect(shuffle([], seeded(1))).toEqual([]);
    expect(shuffle([9], seeded(1))).toEqual([9]);
  });

  it('works without an injected random source', () => {
    const result = shuffle([1, 2, 3]);
    expect([...result].sort()).toEqual([1, 2, 3]);
  });
});

describe('createRound - selection', () => {
  it('returns exactly size questions when the bank is larger', () => {
    expect(createRound(makeBank(20), 15, seeded(1))).toHaveLength(15);
  });

  it('uses all questions when the bank is smaller than the size', () => {
    const bank = makeBank(8);
    const round = createRound(bank, 15, seeded(1));
    expect(round).toHaveLength(8);
    expect(ids(round).sort()).toEqual(ids(bank).sort());
  });

  it('returns all questions when the bank equals the size', () => {
    expect(createRound(makeBank(15), 15, seeded(1))).toHaveLength(15);
  });

  it('selects distinct questions that all come from the bank', () => {
    const bank = makeBank(30);
    const round = createRound(bank, 15, seeded(3));
    const bankIds = new Set(ids(bank));
    expect(new Set(ids(round)).size).toBe(15);
    round.forEach((q) => expect(bankIds.has(q.id)).toBe(true));
  });

  it('gives a different selection or order for different random sources', () => {
    const bank = makeBank(30);
    const first = ids(createRound(bank, 15, seeded(1)));
    const second = ids(createRound(bank, 15, seeded(2)));
    expect(first).not.toEqual(second);
  });

  it('is deterministic for the same random source', () => {
    const bank = makeBank(30);
    expect(createRound(bank, 15, seeded(5))).toEqual(createRound(bank, 15, seeded(5)));
  });

  it('works without an injected random source', () => {
    expect(createRound(makeBank(5), 3)).toHaveLength(3);
  });
});

describe('createRound - immutability', () => {
  it('does not mutate the bank or its options', () => {
    const bank = makeBank(10);
    const snapshot = structuredClone(bank);
    createRound(bank, 5, seeded(1));
    expect(bank).toEqual(snapshot);
  });

  it('returns new question objects and option arrays', () => {
    const bank = makeBank(3);
    const round = createRound(bank, 3, seeded(1));
    round.forEach((q) => {
      const original = bank.find((b) => b.id === q.id);
      expect(q).not.toBe(original);
      expect(q.options).not.toBe(original.options);
    });
  });
});

describe('createRound - option shuffling', () => {
  it('keeps the same options and shuffles their order', () => {
    const bank = makeBank(20);
    const round = createRound(bank, 20, seeded(4));
    let reordered = 0;
    round.forEach((q) => {
      const original = bank.find((b) => b.id === q.id);
      expect([...q.options].sort()).toEqual([...original.options].sort());
      if (q.options.some((text, i) => text !== original.options[i])) reordered++;
    });
    expect(reordered).toBeGreaterThan(0);
  });

  it('keeps answer pointing to the correct option text', () => {
    const bank = makeBank(20);
    for (const seed of [1, 2, 3, 4, 5]) {
      createRound(bank, 20, seeded(seed)).forEach((q) => {
        const original = bank.find((b) => b.id === q.id);
        expect(q.options[q.answer]).toBe(original.options[original.answer]);
      });
    }
  });

  it('tracks the answer by position when option texts are duplicated', () => {
    // With a constant 0, shuffling positions [0, 1, 2] gives the order [1, 2, 0].
    const question = makeQuestion(1, { options: ['same', 'same', 'other'], answer: 0 });
    const [result] = createRound([question], 1, constant(0));
    expect(result.options).toEqual(['same', 'other', 'same']);
    // The original answer (position 0) moved to position 2, not to the first 'same'.
    expect(result.answer).toBe(2);
  });

  it('keeps the answer valid with duplicates across many seeds', () => {
    const question = makeQuestion(1, { options: ['x', 'x', 'x', 'y'], answer: 3 });
    for (let seed = 1; seed <= 20; seed++) {
      const [result] = createRound([question], 1, seeded(seed));
      expect(result.options[result.answer]).toBe('y');
      expect(result.options.filter((o) => o === 'x')).toHaveLength(3);
    }
  });
});

describe('createRound - preserved fields', () => {
  it('preserves id, topic, question, explanation and code', () => {
    const code = { language: 'javascript', lines: ['const a = 1;', '  a < 2 && b;'] };
    const question = makeQuestion(7, { code });
    const [result] = createRound([question], 1, seeded(1));
    expect(result.id).toBe(question.id);
    expect(result.topic).toBe(question.topic);
    expect(result.question).toBe(question.question);
    expect(result.explanation).toBe(question.explanation);
    expect(result.code).toEqual(code);
  });

  it('does not add a code field to questions without one', () => {
    const [result] = createRound([makeQuestion(1)], 1, seeded(1));
    expect(result).not.toHaveProperty('code');
  });
});

describe('isCorrect', () => {
  it('is true when the selected index matches the answer', () => {
    expect(isCorrect({ answer: 2 }, 2)).toBe(true);
  });

  it('is false when the selected index differs from the answer', () => {
    expect(isCorrect({ answer: 2 }, 1)).toBe(false);
  });

  it('treats index 0 as a valid answer', () => {
    expect(isCorrect({ answer: 0 }, 0)).toBe(true);
    expect(isCorrect({ answer: 0 }, 1)).toBe(false);
  });
});

describe('countCorrect', () => {
  const round = [{ answer: 0 }, { answer: 1 }, { answer: 2 }, { answer: 3 }];

  it('counts all answers when all are correct', () => {
    expect(countCorrect(round, [0, 1, 2, 3])).toBe(4);
  });

  it('returns 0 when none are correct', () => {
    expect(countCorrect(round, [1, 2, 3, 0])).toBe(0);
  });

  it('counts only the correct ones in a mixed set', () => {
    expect(countCorrect(round, [0, 0, 2, 0])).toBe(2);
  });

  it('counts missing or undefined selections as incorrect', () => {
    expect(countCorrect(round, [0, undefined, 2])).toBe(2);
    expect(countCorrect(round, [])).toBe(0);
  });

  it('returns 0 for an empty round', () => {
    expect(countCorrect([], [])).toBe(0);
  });
});
