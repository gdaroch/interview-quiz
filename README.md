# interview-quiz

A local multiple-choice quiz for interview study. Each round draws random questions from a fixed bank, shows feedback with an explanation after every answer, and ends with a final score.

**Status: work in progress.** The question bank and its startup validation exist. The round logic and the UI are still being built (groups 4-6 of the OpenSpec change `quiz-game`).

## Requirements

- Node.js and npm

## Commands

```bash
npm install            # install dependencies
npm run dev            # start the Vite dev server
npm run build          # production build into dist/
npm test               # unit tests (Vitest)
npm run test:e2e       # end-to-end tests (Playwright, Chromium)
```

The first time you run the e2e tests, install the browser with `npx playwright install chromium`.

## Editing the question bank

Questions live in `src/questions.json`, a JSON array. Each question has:

- `id`: unique string.
- `topic`: string.
- `question`: string.
- `options`: array of at least 2 non-empty strings.
- `answer`: integer index (0-based) of the correct option.
- `explanation`: string shown after answering.
- `code` (optional): `{ "language": "javascript", "lines": ["...", "..."] }`, with a non-empty `language` and a non-empty array of string lines.

```json
{
  "id": "js-typeof-null",
  "topic": "javascript",
  "question": "What does typeof null return?",
  "options": ["\"null\"", "\"object\"", "\"undefined\""],
  "answer": 1,
  "explanation": "A historical quirk of JavaScript: typeof null is \"object\"."
}
```

The bank is validated at startup (`src/validate.js`). All problems are listed at once, not just the first one.

## Round size

`QUESTIONS_PER_ROUND` in `src/config.js` sets how many questions a round has (currently 15). If the bank has fewer questions, all of them are used.

## Project structure

```
src/
  config.js          # QUESTIONS_PER_ROUND
  questions.json     # question bank
  validate.js        # bank validation
  main.js, style.css # app entry and styles
  *.test.js          # unit tests
e2e/                 # Playwright tests
openspec/            # OpenSpec specs and the quiz-game change (proposal, design, tasks)
```
