# Tasks

## 1. Dependency and syntax coloring

- [x] 1.1 Add `markdown-it` to `dependencies` with `npm install markdown-it` and verify it appears in `package.json` and `npm run build` still succeeds
- [x] 1.2 In `src/highlight.js`, register the `yaml` and `dockerfile` languages and verify `highlightCode` colors a YAML and a Dockerfile snippet
- [x] 1.3 In `src/highlight.js`, add an exported function that returns highlighted HTML for a code string and a language (empty string for an unknown language), reusing the registered languages, wrapped in `<pre><code class="hljs language-x">`; verify with unit tests in `src/highlight.test.js` for a known language, `yaml`, `dockerfile`, the `js`/`jsx`/`ts` aliases, an unknown language, and `<`, `>`, `&` kept as text
- [x] 1.4 Extend the `highlightCode` tests in `src/highlight.test.js` for `yaml` and `dockerfile` and verify `npm test` passes

## 2. Guide data: parsing and validation

- [x] 2.1 Generalize `parseBank` in `src/parse.js` into a function that takes the text and the file name, so invalid JSON is reported for both `questions.json` and `guide.json`; update `src/parse.test.js` and verify it still covers the existing cases plus the `guide.json` name
- [x] 2.2 Create `src/guide.js` with `validateGuide(data)` (structure, unique section ids, `#id` links outside fenced code that point to a missing section) returning the same error records as `validateBank`, and verify with unit tests in `src/guide.test.js` for every scenario of the "Guide format" and "Links between sections" requirements
- [x] 2.3 Add `buildGuideIndex(data)` to `src/guide.js` (section id to title, chapter title and lines) and verify with a unit test; add a test that the real `src/data/guide.json` passes `validateGuide`
- [x] 2.4 In `src/validate.js`, make `validateBank(data, guideIds)` check that `guideId` is a string and, when a guide id set is usable, that it exists in it; update every test question in `src/validate.test.js`, `src/parse.test.js` and `src/round.test.js` that needs a `guideId`, and verify the tests for missing, non-string, unknown and shared `guideId` pass
- [x] 2.5 Add a unit test that the real `src/data/questions.json` passes `validateBank` against the ids of the real `src/data/guide.json`, and verify `npm test` passes

## 3. Markdown rendering

- [x] 3.1 In `src/guide.js`, create the `markdown-it` instance with raw HTML disabled and the code-coloring function from 1.3 as its highlight option, and add `renderSection(section)` returning the HTML of a section; verify with unit tests that bold, a list, a table, a colored code block and the text `<token>` (escaped, not interpreted) render as expected
- [x] 3.2 Verify with a unit test that every section of the real `guide.json` renders without throwing and that no rendered output contains a raw `<script` tag

## 4. Startup wiring

- [x] 4.1 In `src/main.js`, import `guide.json` as raw text, parse and validate it, then validate the bank against the guide ids (skip the `guideId` existence check when the guide is unusable), show the errors of both together on the error screen, and pass the guide index to `initUI`; verify by running `npm run dev` with a broken `guideId`, a broken link and a malformed guide file, and seeing all problems listed and no round available
- [x] 4.2 Make the error screen text in `index.html` accurate for both files (it now says "the questions file") and verify it visually

## 5. Guide dialog UI

- [ ] 5.1 In `index.html`, add the "Full explanation" button (hidden by default) to the question screen actions, and a `<dialog id="guide-dialog">` with a title header, Back and Close buttons and a scrollable body; verify the markup loads without errors
- [ ] 5.2 In `src/ui.js`, add the `guide` field (`stack`) to `state` and the functions to open the guide from the current question, follow a link, go back and close, without reading or changing any round field; verify with unit tests on `state` for open, follow, back at the first section, close and reopen from the question's section
- [ ] 5.3 In `src/ui.js`, draw the dialog from the stack: show the chapter and section title, render the section with `renderSection` (the one documented `innerHTML` assignment), show Back only when the stack has more than one entry, scroll the body to the top on every change; verify in the browser
- [ ] 5.4 In `src/ui.js`, show the "Full explanation" button only when `state.submitted`, open the dialog with `showModal()`, handle links with one delegated click listener on the dialog body (`a[href^="#"]`, preventing navigation), and empty the stack on the dialog `close` event so Escape and Close behave the same; verify manually that Escape, Close and Back work, focus returns to the button, and the question, selection, feedback and score are unchanged after closing
- [ ] 5.5 In `src/style.css`, style the dialog (width, scrolling, backdrop, header, mobile layout) and the rendered Markdown (headings, paragraphs, lists, tables, inline code, code blocks, links) with the existing colors and tokens; verify visually on a desktop and a narrow width

## 6. End-to-end and docs

- [ ] 6.1 Add an e2e happy-path test in `e2e/quiz.spec.js`: answer a question, check the button is not there before submitting and is there after, open the guide, follow an internal link, go Back, close it, and check the question, the selected option, the feedback and the score are unchanged, then continue with Next; verify `npm run test:e2e` passes
- [ ] 6.2 Update `README.md` (features, the SQL-only highlighting sentence now listing YAML and Dockerfile, the project structure with `guide.js`, the dependency on `markdown-it`) and verify the README matches the final file layout
- [ ] 6.3 Run `npm test`, `npm run test:e2e` and `npm run build` together and verify all pass

## Workflow follow-up

- The project flow in `CLAUDE.md` has the `developer` subagent write the code and the `tester` subagent write the unit and e2e tests after Gonzalo approves the code. The test tasks above (1.3, 1.4, 2.x, 3.x, 5.2, 6.1) are executed by the `tester` in that step.
- Archive the change after the review and the tests pass.
