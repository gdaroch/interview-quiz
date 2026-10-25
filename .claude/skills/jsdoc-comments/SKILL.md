---
name: jsdoc-comments
description: Add JSDoc comments to the functions of the JavaScript source files in src/ and short explanatory comments for code that is hard for a human to read. Use when the user asks to document functions, add JSDoc, or comment code.
---

Document the functions of the code files in `src/` with JSDoc and short explanatory comments.

## Scope

- Apply to the code files in `src/` (for example `round.js`, `validate.js`, `main.js`).
- Skip test files (`*.test.js`), `questions.json`, and `style.css`.
- Change comments only. Never change the logic, names, or formatting of the code.

## JSDoc rules

1. Put a JSDoc block (`/** ... */`) directly above every function, exported or not.
2. The first line is a description of what the function does:
   - One line only, at most 100 characters (including the leading ` * `).
   - Simple English: short words, active voice, no jargon when a plain word works.
   - Start with a verb in the third person ("Returns", "Shuffles", "Counts").
   - End without a period is fine; be consistent inside the file.
3. Then add one tag per parameter and one for the return value:
   - `@param {Type} name - short meaning` (use `[name=default]` for optional parameters).
   - `@returns {Type} short meaning`.
   - Use real types: `{Array<object>}`, `{number}`, `{() => number}`, etc.
4. Do not repeat the code in words. Describe the purpose and the contract.

## Explanatory comments

Add a short `//` comment (one line, simple English) above a fragment that a human would need a moment to understand. Typical cases:

- Index tricks and loops that run backwards (for example the Fisher-Yates loop in `shuffle`).
- Destructuring swaps such as `[a, b] = [b, a]`.
- Dense chains like `reduce` with a ternary inside.
- Code that tracks something by position (for example the new index of the correct option).

Explain *what the fragment does and why*, not the syntax. Skip comments for lines that are obvious.

## Example

```js
/**
 * Returns a shuffled copy of an array, leaving the original unchanged.
 * @param {Array} items - The values to shuffle.
 * @param {() => number} [random=Math.random] - Gives a number from 0 up to (not including) 1.
 * @returns {Array} A new array with the same values in random order.
 */
export function shuffle(items, random = Math.random) {
  const result = [...items];
  // Walk from the end: pick a random spot at or before i and swap it with i.
  // After each step, the item at i is final and is not moved again.
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

## After editing

Run `npm test` to confirm nothing changed in behavior.
