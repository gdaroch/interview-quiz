# interview-quiz

A local multiple-choice quiz for interview study. Each round draws random questions from a fixed bank, shows feedback with an explanation after every answer, and ends with a final score.

The bank has 415 questions across 12 topics: JavaScript, TypeScript, Node.js & HTTP, Security, Architecture, OOP & Patterns, Databases, Algorithms, Testing, React, Infra & System Design, and AI & Claude Code.

## Features

- Topic selection on the start screen (all topics selected by default).
- Rounds of random questions, with the options shuffled on every question.
- Feedback with an explanation after each answer, and a final score.
- A "Full explanation" button after answering that opens the study guide section of the question in a dialog, with links between sections, Back and Close, without losing the round progress.
- Syntax highlighting for code snippets (JavaScript, TypeScript, CSS, HTML, SQL, YAML and Dockerfile).
- Startup validation of the question bank and the study guide (structure, unique ids, broken links, and that every `guideId` exists), with an error screen that lists every problem.

## Live demo

Deployed on Cloudflare: https://interview-quiz.gonzalodaroch.workers.dev/

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

Questions live in `src/data/questions.json`, a JSON array of question objects. Example with two questions: a minimal one, and one with the optional `code` field. Both have the required `guideId`.

```json
[
  {
    "id": "js-typeof-null",
    "topic": "JavaScript",
    "question": "What does typeof null return?",
    "options": ["\"null\"", "\"object\"", "\"undefined\""],
    "answer": 1,
    "explanation": "A historical quirk of JavaScript: typeof null is \"object\".",
    "guideId": "js-coercion"
  },
  {
    "id": "js-closure-counter",
    "topic": "JavaScript",
    "question": "What does the last line print?",
    "options": ["0", "1", "2", "undefined"],
    "answer": 2,
    "explanation": "The returned function keeps access to count, so each call increments the same variable.",
    "guideId": "js-closures",
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
| `topic` | string | yes | Name of the question's subject, shown to the player as-is on the question and on the topic buttons. Questions with the exact same value form one topic. |
| `question` | string | yes | The question text. |
| `options` | array of strings | yes | At least 2 entries; each one a non-empty string. |
| `answer` | integer | yes | 0-based index of the correct option in the original `options` order (the game shuffles the options itself). |
| `explanation` | string | yes | Shown after the player answers. |
| `guideId` | string | yes | The `id` of a section of `src/data/guide.json`; it opens from the "Full explanation" button. |
| `code` | object | no | Code snippet shown with the question. |
| `code.language` | string | if `code` is present | Non-empty. Highlighted languages: `javascript`, `typescript`, `css`, `html`, `sql`, `yaml`, `dockerfile`. Any other language is shown as plain text. |
| `code.lines` | array of strings | if `code` is present | Non-empty; one string per line of code. |

The bank and the guide are validated at startup (`src/parse.js` checks that the files are valid JSON, `src/validate.js` checks the questions, `src/guide.js` checks the guide). If a file is not valid JSON, or any question or guide entry is invalid, the game does not start: an error screen lists every problem found, not just the first one.

### Study guide format

The study guide lives in `src/data/guide.json`, an object with a `chapters` array. Each chapter has an `id`, a `title` and `sections`; each section has an `id` (unique in the whole guide), a `title` and `lines`, an array of Markdown lines. Link to another section with `[text](#section-id)`. The Markdown is rendered with `markdown-it` (raw HTML disabled) and code blocks are highlighted with `highlight.js`.

## Round size

`QUESTIONS_PER_ROUND` in `src/config.js` sets how many questions a round has (currently 10). Before a round, the player picks which topics to draw from (all are selected by default); if those topics have fewer questions, all of them are used.

## Project structure

```
src/
  config.js          # QUESTIONS_PER_ROUND
  data/
    questions.json   # question bank
    guide.json       # study guide material
  parse.js           # JSON parsing of the data files
  validate.js        # bank validation
  guide.js           # guide validation, index and Markdown rendering (markdown-it)
  round.js           # round logic (question draw, shuffle, score)
  highlight.js       # syntax highlighting of code snippets
  ui.js              # screens, rendering and the guide dialog
  main.js, style.css # app entry and styles
  *.test.js          # unit tests
e2e/                 # Playwright tests
openspec/            # OpenSpec specs and archived changes (proposal, design, tasks)
```
