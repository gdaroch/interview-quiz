# Tasks

## 1. SQL grammar

- [x] 1.1 In `src/highlight.js`, import `highlight.js/lib/languages/sql` and call `hljs.registerLanguage("sql", sql)`; verify `hljs.getLanguage("sql")` is defined and `npm run build` succeeds
- [x] 1.2 Update the "Token colors" comment in `src/style.css` to list SQL; verify no color rules were added or changed in the diff
- [x] 1.3 Add `sql` to the highlighted languages in the `code.language` row of `README.md`; verify the list matches the registered languages in `src/highlight.js`

## 2. Tests

- [x] 2.1 Add a unit test for `highlightCode` covering a `sql` snippet (token spans are produced) and an unsupported language (text left plain, no error); verify `npm test` passes
- [x] 2.2 Extend the e2e happy path so a SQL question shows colored tokens in its code block; verify `npm run test:e2e` passes (happy path only)

## Workflow follow-up

- Review the change with Gonzalo before calling the `tester`.
- Archive the change and sync the `quiz-round` spec after approval.
