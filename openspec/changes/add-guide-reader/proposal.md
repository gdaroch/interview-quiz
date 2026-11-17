# Proposal

## Why

The explanation shown after each answer is short. The full study guide now exists in `src/data/guide.json` (12 chapters, 119 sections), and every question in `src/data/questions.json` already has a `guideId` that points to the guide section it comes from. Nothing in the app uses this link yet, so the player cannot read more about a question after answering it.

## What Changes

- After the player submits an answer, the feedback area shows a button that opens the guide section the question comes from (labeled "Full explanation"). The button is not shown before submitting, so the guide cannot reveal the answer.
- The guide section opens in a modal dialog over the question screen. The guide content is Markdown, so it is rendered with the `markdown-it` library (raw HTML disabled), and fenced code blocks are colored with the existing highlight.js setup.
- Links between guide sections (`[text](#section-id)`) open the target section inside the same dialog. A Back control returns to the previous section, and a Close control (also the Escape key) closes the dialog.
- Opening, navigating and closing the guide never changes the round: the current question, the selected option, the feedback, the score and the progress stay as they were.
- Every question must have a `guideId` that names an existing guide section. The guide itself is checked at startup (structure, unique ids, internal links that point to a missing section). Any problem is shown on the existing error screen and blocks the game, like the question bank.
- Syntax coloring supports two more languages used by the data: YAML and Dockerfile. The other languages found in the guide (`js`, `jsx`, `ts`, `text`) already work through highlight.js aliases and need no change.
- New dependency: `markdown-it`.

## Capabilities

### New Capabilities
- `study-guide`: the format and validation of the study guide data, and how the player reads it from the question screen: when the entry button is available, how a section is shown, navigation between linked sections, and closing without losing the round.

### Modified Capabilities
- `question-bank`: every question gains a required `guideId` that must match an existing guide section; startup validation covers it.
- `quiz-round`: the list of languages with syntax coloring grows from JavaScript, TypeScript, CSS, HTML and SQL to also include YAML and Dockerfile.

## Impact

- Code: `src/main.js` (load and validate the guide), `src/validate.js` (check `guideId`, new guide validation), `src/ui.js` (button, dialog, navigation state), `src/highlight.js` (register `yaml` and `dockerfile`), `index.html` (dialog markup), `src/style.css` (dialog and rendered Markdown styles), and a new `src/guide.js` for the Markdown rendering and section lookup.
- Tests: unit tests for the guide validation, the `guideId` check and the Markdown rendering helper; an e2e happy path for the guide flow; the existing tests that build question objects need a `guideId`.
- Docs: README (features, structure, dependencies).
- Dependencies: adds `markdown-it`. `highlight.js` is already installed.
- Data: no change to `guide.json` or `questions.json`; both already satisfy the new rules (all 415 `guideId` values exist and all 87 internal links resolve).
- Out of scope: showing the guide outside a question (no browse-the-guide screen), search inside the guide, putting the guide state in the URL or the browser history, and rewriting the guide content.
