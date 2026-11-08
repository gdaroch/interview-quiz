# Design

## Context

[src/highlight.js](../../../src/highlight.js) uses the `highlight.js/lib/core` build and registers each grammar explicitly, so only the languages in use are bundled. `highlightCode` skips any language that `hljs.getLanguage` does not know, which is how unsupported languages stay plain. The SQL grammar ships in the installed `highlight.js` (`lib/languages/sql.js`), and [src/ui.js](../../../src/ui.js) already passes `q.code.language` straight through, so no caller changes are needed.

## Goals / Non-Goals

**Goals:**
- SQL snippets are colored with the existing token palette.
- Unsupported languages keep their current plain-text behavior.

**Non-Goals:**
- Supporting SQL dialect names such as `postgresql` or `mysql` as separate languages.
- Adding new token colors or changing the theme.

## Decisions

- **Register the grammar in `highlight.js`, following the existing pattern.** One `import sql from "highlight.js/lib/languages/sql"` and one `hljs.registerLanguage("sql", sql)`. Alternative: import the full `highlight.js` bundle. Rejected: it bundles every grammar for the sake of one language.
- **No stylesheet color changes.** The SQL grammar emits `hljs-keyword`, `hljs-type`, `hljs-string`, `hljs-variable`, `hljs-operator`, plus the shared `hljs-number` and `hljs-comment` modes, and all but `hljs-operator` are already styled in [src/style.css](../../../src/style.css). Only the "Token colors" comment is updated to list SQL.
- **Keep the bank value `sql`.** It is the grammar's own name, so no alias is needed and the three existing questions work unchanged.

## Risks / Trade-offs

- [Slightly larger bundle from the SQL grammar] → Accepted; the grammar is small compared with the app's existing dependencies.
- [Some SQL tokens (`hljs-operator`) have no dedicated color and render in the default text color] → Acceptable; operators staying neutral is consistent with how JavaScript operators render today.
