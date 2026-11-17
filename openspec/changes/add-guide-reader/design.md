# Design

## Context

The app is a small vanilla JS app (Vite, no framework). `src/ui.js` keeps the whole game in one `state` object and redraws from it; `src/main.js` parses and validates the bank before starting; `src/highlight.js` registers a few highlight.js languages. The UI builds the DOM with `textContent` and never uses `innerHTML`.

`guide.json` has 12 chapters and 119 sections. Each section is `{ id, title, lines }`, where `lines` is Markdown: bold, inline code, bullet and numbered lists, tables, fenced code blocks (`js`, `ts`, `jsx`, `sql`, `yaml`, `dockerfile`, `text`) and 87 links of the form `[text](#section-id)`. All of them resolve today. See proposal.md for the motivation and scope.

## Goals / Non-Goals

**Goals:**
- Show the Markdown of a section correctly, with the code colored like the quiz snippets.
- Keep the round state completely independent from the guide state.
- Catch bad data (a `guideId` or a link to a missing section) at startup, with the same error screen as the bank.

**Non-Goals:**
- No URL or browser-history integration, no guide search, no screen to browse the guide.
- No lazy loading of the guide: it is about 130 KB of JSON and is bundled with the app.

## Decisions

### Markdown rendering: `markdown-it` with raw HTML disabled
`markdown-it` is created with `html: false`, so HTML-like text in the guide (for example `Bearer <token>`) is escaped instead of interpreted. This avoids adding a sanitizer. Tables are on by default. Its `highlight` option takes the fenced code language.

Alternatives: `marked` does not sanitize, so it would also need DOMPurify (two dependencies); a hand-written renderer would need tables, lists, fences and inline marks and its own tests.

This is the only place that assigns `innerHTML`. It is safe because the source is the repository's own `guide.json` and the library escapes raw HTML; the exception is noted in a comment next to the assignment. markdown-it also rejects `javascript:` links by default.

### Code coloring goes through one function in `highlight.js`
`highlight.js` gets a second export that returns highlighted HTML for a code string (used by markdown-it's `highlight` option), next to `highlightCode(element, language)`. Both share the same registered languages. For an unknown language it returns an empty string, so markdown-it escapes the text and the block stays plain. The function wraps the result in `<pre><code class="hljs language-x">`, so the existing global `.hljs-*` token styles apply with no new colors.

### Language support: register `yaml` and `dockerfile`
`javascript` already answers to `js` and `jsx`, and `typescript` to `ts`, so those need nothing. `text` is highlight.js's built-in plain-text alias. The only languages in the data without a grammar are `yaml` (guide) and `dockerfile` (guide and one question), so those two are registered. This is the full set of missing languages in the data.

### A new `src/guide.js` holds everything about the guide data
- `validateGuide(data)`: returns the same error records as `validateBank` (`questionRef`, `field`, `message`), using the chapter or section id as the reference. Checks the structure, unique section ids and that every `#id` link points to an existing section. Links are found by scanning `lines` for `](#id)`, skipping lines inside fenced code blocks, where the text is code and not a link.
- `buildGuideIndex(data)`: returns a `Map` from section id to `{ title, chapterTitle, lines }`.
- `renderSection(section)`: returns the HTML string for a section (`md.render(lines.join("\n"))`).

`validateBank(data, guideIds)` receives the set of section ids and adds a `guideId` check (string, and present in the set). `parseBank` becomes `parseJson(text, fileName)` so the same function reports invalid JSON for both files; the error `questionRef` is then the file name (`questions.json` or `guide.json`), which is what it already is for the bank.

### Startup flow in `main.js`
Parse both files; validate the guide; validate the bank. If the guide is unusable (bad JSON or structural errors), the existence check of `guideId` is skipped, because it would only add misleading errors. All errors of both are shown together; with any error, only the error screen is shown. Otherwise `initUI(bank, guideIndex)`.

### Guide state is separate from the round state
`state` gets a `guide` field: `{ stack: string[] }`, where the last entry is the section shown and an empty stack means closed. Nothing in the round (`index`, `selected`, `submitted`, `score`, `selections`) is read or written by the guide code. Opening sets `stack = [question.guideId]`; following a link pushes; Back pops; Close empties it. Because opening always starts a new stack, reopening starts at the question's section.

### The dialog is a native `<dialog>`
`index.html` gets a `<dialog id="guide-dialog">` with a header (chapter and section title, Back, Close) and a scrollable body. `showModal()` gives focus trapping, an inert page behind, Escape to close and focus restored to the opener, so there is no custom focus code. The "Full explanation" button is a static element in the question screen's actions (toggled with `hidden`, like Next), so it is not rebuilt and the browser can return focus to it. A `close` event listener empties the stack, so Escape and the Close button end in the same state. `aria-labelledby` points to the section title.

Alternative: a plain `div` overlay. It needs manual focus trapping, Escape handling, inert background and focus return, for no benefit.

### Link handling by delegation
A single `click` listener on the dialog body handles `a[href^="#"]`: it prevents the default (so the address does not change), reads the id from the href and pushes it. Back is hidden when the stack has one entry. The body scrolls to the top on every section change.

### Button label
"Full explanation". It sits right below the short explanation of the feedback, so it reads as the longer version of that text. It only lives in `index.html`.

## Risks / Trade-offs

- [`innerHTML` is now used once] → Raw HTML is disabled in the renderer, the content is first-party, and the exception is documented where it happens.
- [Unregistered highlight.js languages in future guide content stay plain] → Acceptable by the current spec (plain text, no error); a new language is a two-line change.
- [Existing tests build questions without `guideId`] → They are updated as part of the change; `validateBank` gets a guide id set in tests.
- [Bundle grows by `markdown-it` and the guide JSON] → The quiz is a small static app; measured with the existing build output and accepted.
- [Guide validation duplicates part of what the data author already checked] → It is cheap and keeps the guide and the bank in sync as both grow.
