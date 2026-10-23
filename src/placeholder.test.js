import { describe, it, expect } from 'vitest';
import { QUESTIONS_PER_ROUND } from './config.js';

// Placeholder: replaced by the real validate/round tests in group 3.
describe('setup', () => {
  it('runs tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('imports QUESTIONS_PER_ROUND from config', () => {
    expect(QUESTIONS_PER_ROUND).toBe(15);
  });
});
