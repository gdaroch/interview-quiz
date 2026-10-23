# Tasks

## 1. UI wireframe

- [x] 1.1 Create a single-file `index.html` (HTML and CSS inline, minimal JavaScript, hard-coded dummy questions) with the start screen, question screen, feedback screen, results screen, and validation-error screen, and verify it opens directly in the browser and every screen is reachable by clicking through
- [x] 1.2 Include in the dummy data a question with a code snippet and one with long text, and verify the snippet keeps its indentation and shows `<` and `&` literally, and that long text wraps correctly
- [x] 1.3 Show both feedback states (correct and incorrect with the correct option highlighted and the explanation) and verify they are visually distinct and the options appear locked
- [x] 1.4 Verify the layout at desktop and phone widths in the browser, with no horizontal scrolling
- [x] 1.5 Review point: show the wireframe to the user, record any requested visual adjustments in the wireframe, and do not start group 2 until the user approves the look

## 2. Project setup

- [x] 2.1 Scaffold a Vite vanilla JavaScript project in the project root, keeping the approved wireframe's markup and CSS (the CSS moves to `src/style.css`, the markup becomes `index.html`), and verify `npm run dev` serves the same screens without errors
- [x] 2.2 Add Vitest and a `test` script and verify `npm test` runs (a trivial placeholder test passes, to be replaced in group 3)
- [x] 2.3 Add `src/config.js` exporting `QUESTIONS_PER_ROUND = 15` and verify it can be imported from a test

## 3. Question bank validation

- [ ] 3.1 Create `src/questions.json` with a small sample set (at least 3 questions, one with a `code` snippet) and verify it is imported by the app entry point
- [ ] 3.2 Implement `validateBank(data)` in `src/validate.js` returning a list of `{ questionRef, field, message }` errors, covering required fields and types, answer index range, minimum two non-empty options, unique ids, empty bank, and non-list data
- [ ] 3.3 Add validation of the optional `code` object (`language` non-empty string, `lines` non-empty array of strings)
- [ ] 3.4 Write Vitest tests for every validation rule above, including multiple errors reported in one pass and questions identified by position when the id is missing, and verify `npm test` passes
- [ ] 3.5 Verify the bundled sample `questions.json` passes `validateBank` with no errors (test)

## 4. Round logic

- [ ] 4.1 Implement `createRound(bank, size, random = Math.random)` in `src/round.js` selecting `min(size, bank.length)` distinct questions with a Fisher-Yates shuffle
- [ ] 4.2 Shuffle each question's options in the round and track the correct option's new index from the original `answer`
- [ ] 4.3 Implement score helpers (check a submitted index, count correct answers) and verify them in tests
- [ ] 4.4 Write Vitest tests with an injected random source covering: bank larger than the round size, bank smaller than the round size, distinct questions, correct index tracking after shuffle (including duplicate option texts), and scoring; verify `npm test` passes

## 5. UI and game flow

- [ ] 5.1 Implement the state object and `render()` in `src/ui.js` / `src/main.js` with the start screen and a Start control that begins a round, and verify it manually in the browser
- [ ] 5.2 Implement the question screen: progress ("n of total"), question text, options in the shuffled order, and `<pre><code>` rendering of `code.lines` via `textContent`; verify manually that a snippet keeps indentation and shows `<` and `&` literally
- [ ] 5.3 Add `highlight.js` (core only), register JavaScript, TypeScript, CSS, and HTML (`xml`), call `highlightElement` only when `code.language` is a registered language, and add `hljs-*` token colors to `src/style.css` using the dark palette; verify manually that JavaScript, TypeScript, CSS, and HTML snippets are colored, that an unknown language (for example `cobol`) stays uncolored without errors, and that `<` and `&` still display literally
- [ ] 5.4 Implement select-then-submit: options can be changed before submitting, Submit is disabled with no selection; verify manually
- [ ] 5.5 Implement the feedback state after Submit: correct/incorrect message, correct option highlighted, explanation shown, options locked; verify manually that the answer cannot be changed or submitted twice
- [ ] 5.6 Implement Next (and "See results" on the last question), then the results screen showing score out of the round size with a Play again control that starts a fresh round with a zero score; verify manually by playing a full round and replaying
- [ ] 5.7 Verify with a bank smaller than `QUESTIONS_PER_ROUND` that the round uses all questions and the score is out of that count

## 6. Startup validation in the app

- [ ] 6.1 Run `validateBank` at startup and render an error screen (instead of the start screen) listing every error with its question and field, plus an instruction to fix the question data; verify manually with a deliberately broken `questions.json` (bad `answer`, missing `explanation`) that both errors are listed and the game cannot start
- [ ] 6.2 Verify manually that an empty bank (`[]`) and a non-list value show the error screen, and that restoring a valid file lets the game start after reload

## 7. Final checks

- [ ] 7.1 Confirm all user-facing text is in English by walking through every screen
- [ ] 7.2 Add a short README with the commands to install, run, and test, and how to edit `questions.json` and `QUESTIONS_PER_ROUND`; verify the documented commands work as written on a clean install
- [ ] 7.3 Run `openspec validate quiz-game` and verify it passes
