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

Questions live in `src/questions.json`, a JSON array of question objects. Example with two questions: a minimal one, and one with the optional `code` field.

```json
[
  {
    "id": "js-typeof-null",
    "topic": "javascript",
    "question": "What does typeof null return?",
    "options": ["\"null\"", "\"object\"", "\"undefined\""],
    "answer": 1,
    "explanation": "A historical quirk of JavaScript: typeof null is \"object\"."
  },
  {
    "id": "js-closure-counter",
    "topic": "javascript",
    "question": "What does the last line print?",
    "options": ["0", "1", "2", "undefined"],
    "answer": 2,
    "explanation": "The returned function keeps access to count, so each call increments the same variable.",
    "code": {
      "language": "javascript",
      "lines": [
        "function makeCounter() {",
        "  let count = 0;",
        "  return () => ++count;",
        "}",
        "const next = makeCounter();",
        "next();",
        "console.log(next());"
      ]
    }
  }
]
```

Fields of each question:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | yes | Unique in the whole file. |
| `topic` | string | yes | Subject of the question. |
| `question` | string | yes | The question text. |
| `options` | array of strings | yes | At least 2 entries; each one a non-empty string. |
| `answer` | integer | yes | 0-based index of the correct option in the original `options` order (the game shuffles the options itself). |
| `explanation` | string | yes | Shown after the player answers. |
| `code` | object | no | Code snippet shown with the question. |
| `code.language` | string | if `code` is present | Non-empty. Highlighted languages: `javascript`, `typescript`, `css`, `html`. Any other language is shown as plain text. |
| `code.lines` | array of strings | if `code` is present | Non-empty; one string per line of code. |

The bank is validated at startup (`src/parse.js` checks that the file is valid JSON, `src/validate.js` checks the questions). If the file is not valid JSON, or any question is invalid, the game does not start: an error screen lists every problem found, not just the first one.

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
