# Proposal

## Why

Preparing for programming job interviews means repeatedly recalling concepts (JavaScript, architecture, algorithms, and more). Re-reading study notes is passive; a short multiple-choice game with immediate explanations makes practice active and quick to repeat. The study material already exists as a document, so the missing piece is a small app that turns it into rounds of questions with a final score.

## What Changes

- Add a small local web game: start screen, a round of questions, and a final score screen with "Play again".
- Each round draws `QUESTIONS_PER_ROUND` questions at random from a fixed question bank (a constant in code; making it user-configurable is out of scope). If the bank has fewer questions than that, the round uses all available questions.
- Per question: show the question (and an optional code snippet), the shuffled options, and a Submit button. The answer is evaluated only on Submit; then the game shows correct/incorrect plus the explanation and a Next button (See results on the last question).
- Add a question bank stored as a JSON file, authored by the user from their study document. Each question has `id`, `topic`, `question`, `options`, `answer` (index of the single correct option), `explanation`, and an optional `code` (`language` plus `lines` array).
- Validate the whole bank at startup. If anything is invalid (including an empty bank or a file that is not valid JSON), the game does not start and shows every problem so the user can fix the JSON first.
- All UI text and questions are in English.

Out of scope: score history, filtering by topic (`topic` is stored but unused), changing the number of questions at runtime, deployment, multiple-select questions, images.

## Capabilities

### New Capabilities
- `quiz-round`: Playing a round: random selection of questions, shuffled options, submit-then-feedback flow with explanation, and the final score with replay.
- `question-bank`: The question bank format (including optional code snippets) and the startup validation that blocks the game when the data is invalid.

### Modified Capabilities

None. The project has no existing specs.

## Impact

- New greenfield project: a Vite + vanilla JavaScript app (no framework), run locally only.
- New files: the app source, the `questions.json` bank, and a validator module.
- No external services, backend, or persistence. Runtime dependencies are none beyond the Vite dev tooling; syntax highlighting for code snippets is an open decision for the design.
