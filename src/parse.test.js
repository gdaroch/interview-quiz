import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseBank } from './parse.js';
import { validateBank } from './validate.js';

const expectInvalidJson = (result) => {
  expect(result).not.toHaveProperty('data');
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toMatchObject({ questionRef: 'questions.json', field: '(file)' });
  expect(result.errors[0].message.startsWith('Invalid JSON: ')).toBe(true);
};

describe('parseBank - valid JSON', () => {
  it('returns the parsed array of questions', () => {
    const questions = [
      { id: 'q1', topic: 'JavaScript', question: 'What?', options: ['a', 'b'], answer: 0, explanation: 'Because.' },
    ];
    const result = parseBank(JSON.stringify(questions));
    expect(result).toEqual({ data: questions });
    expect(result).not.toHaveProperty('errors');
  });

  it.each([
    ['an empty array', '[]', []],
    ['an empty object', '{}', {}],
    ['a number', '42', 42],
    ['null', 'null', null],
  ])('parses without validating the shape (%s)', (_label, text, expected) => {
    const result = parseBank(text);
    expect(result).toEqual({ data: expected });
    expect(result).not.toHaveProperty('errors');
  });
});

describe('parseBank - invalid JSON', () => {
  it.each([
    ['an unclosed brace', '{"a": 1'],
    ['an unclosed bracket', '[{"a": 1}'],
    ['a trailing comma', '[1, 2,]'],
    ['single quotes', "['a', 'b']"],
    ['a missing quote', '{"a: 1}'],
  ])('returns a single error for %s', (_label, text) => {
    expectInvalidJson(parseBank(text));
  });

  it.each([
    ['empty text', ''],
    ['whitespace-only text', '   \n\t  '],
  ])('returns a single error for %s', (_label, text) => {
    expectInvalidJson(parseBank(text));
  });
});

describe('parseBank - bundled question bank', () => {
  it('parses the real questions.json and passes validateBank', () => {
    const text = readFileSync(new URL('./questions.json', import.meta.url), 'utf-8');
    const result = parseBank(text);
    expect(result).not.toHaveProperty('errors');
    expect(validateBank(result.data)).toEqual([]);
  });
});
