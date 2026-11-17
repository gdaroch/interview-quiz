import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseJson } from './parse.js';
import { validateBank } from './validate.js';
import { buildGuideIndex } from './guide.js';

const expectInvalidJson = (result, fileName = 'questions.json') => {
  expect(result).not.toHaveProperty('data');
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toMatchObject({ questionRef: fileName, field: '(file)' });
  expect(result.errors[0].message.startsWith('Invalid JSON: ')).toBe(true);
};

describe('parseJson - valid JSON', () => {
  it('returns the parsed array of questions', () => {
    const questions = [
      { id: 'q1', topic: 'JavaScript', question: 'What?', options: ['a', 'b'], answer: 0, explanation: 'Because.' },
    ];
    const result = parseJson(JSON.stringify(questions), 'questions.json');
    expect(result).toEqual({ data: questions });
    expect(result).not.toHaveProperty('errors');
  });

  it.each([
    ['an empty array', '[]', []],
    ['an empty object', '{}', {}],
    ['a number', '42', 42],
    ['null', 'null', null],
  ])('parses without validating the shape (%s)', (_label, text, expected) => {
    const result = parseJson(text, 'questions.json');
    expect(result).toEqual({ data: expected });
    expect(result).not.toHaveProperty('errors');
  });
});

describe('parseJson - invalid JSON', () => {
  it.each([
    ['an unclosed brace', '{"a": 1'],
    ['an unclosed bracket', '[{"a": 1}'],
    ['a trailing comma', '[1, 2,]'],
    ['single quotes', "['a', 'b']"],
    ['a missing quote', '{"a: 1}'],
  ])('returns a single error for %s', (_label, text) => {
    expectInvalidJson(parseJson(text, 'questions.json'));
  });

  it.each(['questions.json', 'guide.json', 'other.json'])('names the received file in the error (%s)', (fileName) => {
    expectInvalidJson(parseJson('{"a": 1', fileName), fileName);
  });

  it.each([
    ['empty text', ''],
    ['whitespace-only text', '   \n\t  '],
  ])('returns a single error for %s', (_label, text) => {
    expectInvalidJson(parseJson(text, 'questions.json'));
  });
});

describe('parseJson - bundled question bank', () => {
  it('parses the real questions.json and passes validateBank', () => {
    const read = (name) => readFileSync(new URL(`./data/${name}`, import.meta.url), 'utf-8');
    const guide = parseJson(read('guide.json'), 'guide.json');
    const result = parseJson(read('questions.json'), 'questions.json');
    expect(guide).not.toHaveProperty('errors');
    expect(result).not.toHaveProperty('errors');
    const guideIds = new Set(buildGuideIndex(guide.data).keys());
    expect(validateBank(result.data, guideIds)).toEqual([]);
  });
});
