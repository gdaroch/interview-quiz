# Design

## Context

The bank is loaded once in `src/main.js` and handed to `initUI`. `src/ui.js` keeps a single `state` object, draws the screens from it, and calls `createRound(bank, QUESTIONS_PER_ROUND)` from `src/round.js` on Start and Play again. The start screen in `index.html` has one Start button and a count, and `renderStart` runs every time the start screen is shown. `validate.js` already requires `topic` to be a non-empty string. The question badge (`#q-topic`) prints `q.topic` as is.

## Goals / Non-Goals

**Goals:**
- Filter the bank by selected topics before `createRound`, leaving `createRound` itself unchanged.
- Derive the topic list from the bank so no list is maintained by hand.

**Non-Goals:**
- Persisting the selection, a label-mapping function, or validating topic spelling.

## Decisions

**Topic is the display name, no formatting function.** The `topic` values in the JSON are renamed to one-word, display-ready names (see proposal). Buttons and the question badge read the same value, and filtering compares exact strings. Alternative: parse ids like `nodejs-http` into labels; rejected because it cannot produce `JavaScript`, `NestJS` or `Node.js` without an exceptions map, which is a second source of truth.

**Pure helpers in `round.js`.** Add `getTopics(bank)` (distinct topics in order of first appearance) and `filterByTopics(bank, topics)`. They are pure, so they are unit tested without a DOM, like `shuffle` and `createRound`. `createRound` does not change.

**Selection lives in `state`.** `state.selectedTopics` is a `Set`. `renderStart` rebuilds the buttons from `getTopics(bank)` and marks each as selected from the set. `initUI` and every return to the start screen reset it to all topics, which gives "all selected by default, not remembered" with no storage. The "Play again" button already goes through `startRound`; it must instead show the start screen with the reset selection, so the player can choose topics again.

**Buttons are real toggle buttons.** Each is a `<button type="button">` with `aria-pressed`, inside a container with an accessible label. A selected button gets a CSS class for the highlight, reusing the existing accent colors. Disabled state of Start follows `selectedTopics.size === 0`. The displayed question count on the start screen reflects the filtered pool, `Math.min(QUESTIONS_PER_ROUND, pool.length)`.

**Play again goes to the start screen.** The user asked for topic choice "before starting the questions", and the selection is not remembered, so after the results the player returns to the start screen. Alternative: replay with the same topics; rejected because the user chose not to remember the selection, and replaying silently would make the topics invisible.

## Risks / Trade-offs

- [Renaming topics touches all 120 questions] → mechanical replacement by exact string; check that the set of topics after the change is exactly the 14 new names and each count is unchanged (14, 11, 11, 8, 11, 10, 10, 8, 7, 6, 6, 6, 6, 6).
- [Typo in casing creates a duplicate button] → accepted; caught when reviewing the buttons.
- [Narrow topic selection yields a short round (for example 6 questions)] → accepted, existing behavior; no warning.
- [The e2e test clicks Start directly] → still valid because all topics are selected by default.
