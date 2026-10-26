# Tasks

## 1. Rename topics in the question bank

- [x] 1.1 Replace every `topic` value in `src/questions.json` with the new names from the proposal table; verify with a script that the distinct topics are exactly the 14 new names and each keeps its question count (14, 11, 11, 8, 11, 10, 10, 8, 7, 6, 6, 6, 6, 6)
- [x] 1.2 Update the `topic` row in `README.md` to say it is the name shown to the player and groups questions; verify the README describes topics selectable before a round
- [x] 1.3 Run `npm test` and verify existing unit tests still pass

## 2. Topic helpers

- [x] 2.1 Add `getTopics(bank)` and `filterByTopics(bank, topics)` with JSDoc to `src/round.js`; verify by their unit tests
- [x] 2.2 Add unit tests in `src/round.test.js`: distinct topics in order of first appearance, filter with one topic, with several topics, with an empty selection (returns no questions), and that the input bank is not modified; verify `npm test` passes

## 3. Start screen

- [x] 3.1 In `index.html`, add a labeled container for topic buttons to the start screen and keep the Start button; verify the container exists in the page
- [x] 3.2 In `src/ui.js`, add `state.selectedTopics`, build one toggle button per topic in `renderStart` with `aria-pressed`, toggle on click, disable Start when none are selected, and show the count of the filtered pool; verify in the browser that toggling highlights the button and that Start is disabled with zero topics
- [x] 3.3 In `src/ui.js`, make `startRound` build the round with `createRound(filterByTopics(bank, selectedTopics), QUESTIONS_PER_ROUND)`; verify a round with only JavaScript and TypeScript shows only those topics in the badge
- [x] 3.4 Make `initUI` and "Play again" return to the start screen with all topics selected again; verify after finishing a round that the start screen shows every topic highlighted
- [x] 3.5 In `src/style.css`, add styles for the topic buttons container, the button and its selected state, reusing existing color variables; verify selected and non-selected buttons are visually distinct and wrap on narrow widths

## 4. End-to-end check

- [x] 4.1 Update `e2e/quiz.spec.js` for the happy path: all topics selected by default, deselect all but one topic, start, and verify the round plays through; "Play again" now returns to the start screen, so adjust the final step. Verify `npm run test:e2e` passes
