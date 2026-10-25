# Design

## Context

Greenfield project: the directory contains only OpenSpec scaffolding, no application code. The app is a single-page game that runs locally for one user. See proposal.md - Why for motivation and the specs for required behavior.

The question bank is authored by hand (or from a script/LLM) outside the app, so the data cannot be trusted to be well-formed. That makes validation a first-class part of the design.

## Goals / Non-Goals

**Goals:**
- Minimal tooling: Vite dev server and vanilla JavaScript, no UI framework.
- Keep game logic (selection, shuffling, scoring, validation) separate from DOM code so it can be unit tested without a browser.
- Fail loudly and completely on bad data, before any round starts.

**Non-Goals:**
- No persistence, backend, routing, or deployment setup.
- No runtime configuration UI for the round size.
- No framework-level state management.

## Decisions

### Vite + vanilla JS
Vite gives a dev server and lets the JSON be imported as raw text (`import raw from './questions.json?raw'`), which avoids `fetch` and the `file://` restriction that breaks fetching a local JSON file. The text is parsed by the app (see Validate once at startup) instead of being imported as parsed JSON: with a direct import, a syntax error in the file made Vite's dev error overlay crash (`TypeError: ... .split is not a function`) and left the quiz running without CSS.
Alternatives: plain static files served by a manual static server (extra step, no hot reload); Vite + React (more machinery than three screens need, easy to adopt later if the app grows).

### Module split: pure logic vs. UI
- `parse.js`: `parseBank(text)` runs `JSON.parse` inside a try/catch and returns `{ data }` when the text is valid JSON, or `{ errors }` with one error (`{ questionRef: "questions.json", field: "(file)", message: "Invalid JSON: <parser message>" }`) when it is not.
- `validate.js`: `validateBank(data)` returns a list of error objects (`{ questionRef, field, message }`); an empty list means valid.
- `round.js`: `createRound(bank, size)` picks `min(size, bank.length)` distinct questions with a Fisher-Yates shuffle and shuffles each question's options while tracking the correct option's new position; plus pure scoring helpers.
- `main.js` / `ui.js`: renders the screens (start, question, feedback, results, error) and wires events.
- `config.js`: exports `QUESTIONS_PER_ROUND = 15`.

Pure modules take the random source as an optional parameter (default `Math.random`) so tests can make selection deterministic.

### Single state object, render function per screen
A small state object (`screen`, `round`, `index`, `selected`, `submitted`, `score`) drives a `render()` that rebuilds the view. This is enough for a few screens and avoids a framework. The `submitted` flag implements select-then-submit: options are interactive while it is false, locked once true.

### Validate once at startup, collect all errors
On module load, before the start screen is shown, `parseBank` turns the raw file text into data, and `validateBank` then checks that data. If either returns errors, the app renders only the error screen listing every error (question id, or index when the id is missing, plus the field). Collecting everything in one pass lets the user fix the file in one editing session rather than one error per reload. Because the file is imported as raw text at build/dev time, fixing it triggers a Vite reload and re-validation, and a malformed file reaches the error screen instead of Vite's overlay.

### Option shuffling keeps the answer by identity
When shuffling options, the round stores the shuffled options along with the index of the correct one computed from the original `answer`, instead of comparing option text. This stays correct even if two options share text and keeps the bank format (`answer` as an index) unchanged.

### Code snippets rendered as text
`code.lines` is joined with `\n` and set via `textContent` inside `<pre><code>`, never as HTML, so snippets containing `<`, `&`, or tags display literally and cannot inject markup. The same applies to question, option, and explanation text. Syntax highlighting is layered on top of this (see Syntax highlighting).

### Syntax highlighting
Code snippets are colored with highlight.js, importing only its core and registering the supported languages explicitly: JavaScript, TypeScript, CSS, and HTML (highlight.js registers HTML under its `xml` grammar, which answers to the `html` alias). The bank's `code.language` selects the grammar. After `textContent` is set, `hljs.highlightElement` re-reads that text and rewraps it in escaped token `<span>`s, so snippets containing `<` and `&` still display literally.
If `code.language` is not a registered language, the snippet is left as plain monospace text, uncolored, instead of raising an error. Validation does not reject unknown languages, since the bank is allowed to contain snippets the highlighter does not cover.
Token colors are CSS rules for the `hljs-*` classes in `src/style.css`, using the dark palette; no highlight.js theme stylesheet is imported.
Alternatives: Prism (equivalent, no advantage here); Shiki (editor-quality colors but heavier and asynchronous); a hand-written regex tokenizer (fragile). Registering only four languages keeps the bundle small compared with importing all of highlight.js. Supporting more languages later means registering one more grammar.

### Dark theme only
The interface ships a single dark theme, with no light variant and no `prefers-color-scheme` switching. Colors are defined as CSS custom properties on `:root` with `color-scheme: dark`, so the palette can be adjusted in one place. The approved single-file wireframe (`index.html` before the Vite scaffold) is the visual reference: its CSS moves unchanged to `src/style.css`.
Alternative: support light and dark following the system setting. Rejected because this is a personal study tool and one theme halves the styling and visual checking.

### Testing
Vitest (a natural fit for Vite) covers `validate.js` and `round.js`: each validation rule, short banks, uniqueness of selected questions, answer tracking after shuffling, and scoring. Playwright (Chromium only) runs end-to-end tests from `e2e/` against the Vite dev server and covers only the happy path of a round; Vitest ignores `e2e/`. Remaining DOM details are verified manually.

## Project Structure

The app lives in the project root, next to `openspec/`, so `src/` and `package.json` sit beside the OpenSpec files.

```
index.html          Vite entry point (<div id="app">)
package.json        scripts: dev, build, test
README.md           install, run, test, how to edit the bank
src/
  main.js           startup: validate the bank, choose the first screen
  config.js         QUESTIONS_PER_ROUND
  questions.json    the question bank
  validate.js       validateBank(data)
  validate.test.js  tests for validate.js
  parse.js          parseBank(text)
  parse.test.js     tests for parse.js
  round.js          createRound(), shuffling, scoring
  round.test.js     tests for round.js
  ui.js             state and render() per screen
  style.css         styles
e2e/                Playwright happy-path tests
playwright.config.js  Playwright config (starts the dev server)
vitest.config.js    Vitest config (ignores e2e/)
openspec/           OpenSpec config, specs and changes (unchanged)
```

Dependencies flow one way: `main.js` imports `questions.json` (as raw text), `parse.js`, `validate.js`, `config.js`, `round.js` and `ui.js`. `parse.js`, `validate.js` and `round.js` import nothing from the DOM or from each other, and only `main.js` and `ui.js` touch the page.

Tests are colocated: each module has its test file next to it (`<module>.test.js`), so what a test covers is obvious from the file listing. Vitest picks them up by that naming convention without extra configuration.

## Risks / Trade-offs

- [Hand-edited JSON drifts from the schema] → Startup validation reports every problem with question id and field; the validator is covered by tests.
- [Random shuffles make bugs hard to reproduce] → Injectable random source in the pure modules.
- [Rebuilding the view on each render could drop focus] → Re-focus the primary control after each render, and keep rendering small; revisit if it becomes noticeable.
- [All-or-nothing validation blocks play for one small mistake] → Intentional per the proposal; the complete error list keeps the fix cycle short.
- [Vite adds `node_modules` and a build tool to a tiny app] → Accepted for dev-server convenience and direct JSON import.
