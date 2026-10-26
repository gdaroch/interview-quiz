# Proposal

## Why

Today every round draws its questions from the whole bank (120 questions, 14 topics). A player who wants to practice only TypeScript and JavaScript cannot do it. Letting the player choose topics before the round makes the quiz useful for focused study.

## What Changes

- The start screen shows one toggle button per topic found in the bank. The buttons are built from the distinct `topic` values, so a new topic in the JSON appears without code changes.
- Selected buttons are visibly highlighted; the player can select any number of topics.
- All topics start selected, so Start works as it does today. If the player deselects every topic, Start is disabled.
- A round draws its random questions only from questions whose `topic` is among the selected topics. If those topics hold fewer questions than the round size, the round uses all of them (existing behavior, no warning shown).
- The selection is not remembered: it resets to "all selected" every time the start screen is shown.
- "Play again" on the results screen returns to the start screen (instead of starting a round at once), so the player can choose topics again.
- The `topic` values in `src/questions.json` are renamed to short, display-ready, one-word names, since they are now shown on buttons as-is (no formatting function):

  | Old | New |
  | --- | --- |
  | javascript | JavaScript |
  | typescript | TypeScript |
  | nodejs-http | Node.js |
  | nestjs | NestJS |
  | databases | Databases |
  | security | Security |
  | architecture | Architecture |
  | testing | Testing |
  | algorithms | Algorithms |
  | interviews | Interviews |
  | solid-patterns | Patterns |
  | react | React |
  | infrastructure | Infrastructure |
  | ai-assisted-development | AI |

- The README is updated: the `topic` field is now the label shown to the player, and rounds can be limited by topic.

Out of scope: remembering the selection, a "questions available" notice, a label-mapping function, and any validation of topic spelling or word count.

## Capabilities

### New Capabilities
- `topic-selection`: choosing which topics a round draws from, via toggle buttons on the start screen.

### Modified Capabilities
- `quiz-round`: question selection for a round is restricted to the selected topics, and the start control requires at least one selected topic.
- `question-bank`: `topic` is the player-facing name of a question's subject, used to group questions and label the topic buttons.

## Impact

- `src/questions.json`: `topic` value of every question is renamed.
- `src/round.js`: new pure function to filter the bank by topics and list distinct topics.
- `src/ui.js`, `index.html`, `src/style.css`: topic buttons, selection state, disabled Start, round creation from the filtered bank.
- Tests: new unit tests for the filter/topic helpers; the existing e2e happy path must still pass (all topics selected by default) and gain a topic-selection step.
- `README.md`: field description of `topic`.
- No new dependencies; `validate.js` is unchanged (`topic` stays a non-empty string).
