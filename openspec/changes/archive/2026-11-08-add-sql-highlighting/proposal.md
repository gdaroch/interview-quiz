# Proposal

## Why

The question bank already contains three questions whose code snippet is SQL (`"language": "sql"`), but [src/highlight.js](../../../src/highlight.js) only registers JavaScript, TypeScript, CSS and HTML, so those snippets render as plain text. SQL is the only language in the bank that is not colored.

## What Changes

- Register the SQL grammar in the highlighter so snippets with `language: "sql"` are colored like the other supported languages.
- Document `sql` in the list of highlighted languages in the README.
- Update the token-color comment in the stylesheet to mention SQL (no new colors: the SQL grammar emits the same token classes already styled).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `quiz-round`: adds a requirement that code snippets in a supported language are shown syntax-colored, and that SQL is one of the supported languages. Unsupported languages keep showing as plain text.

## Impact

- Code: `src/highlight.js` (one import and one `registerLanguage` call), `src/style.css` (comment only).
- Docs: `README.md` (supported languages in the `code.language` row).
- Dependencies: none new; `highlight.js` already ships the SQL grammar.
- Bundle: a small increase from the SQL grammar.
