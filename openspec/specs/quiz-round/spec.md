# quiz-round Specification

## Purpose

Defines how a round of the quiz is played: which questions are asked, how each answer is submitted and explained, and how the final score is reported.

## Requirements

### Requirement: Start a round
The system SHALL show a start screen from which the user begins a round.

#### Scenario: Begin from start screen
- **WHEN** the user activates the start control
- **THEN** the first question of a new round is shown

### Requirement: Random question selection
A round SHALL consist of `QUESTIONS_PER_ROUND` distinct questions chosen at random from the question bank, where `QUESTIONS_PER_ROUND` is a fixed configured value (15 by default).

#### Scenario: Bank larger than the round size
- **WHEN** the bank has more questions than the round size
- **THEN** the round contains exactly the round size of distinct questions

#### Scenario: Different rounds differ
- **WHEN** the user plays two rounds from a bank larger than the round size
- **THEN** the selection and order of questions may differ between rounds

### Requirement: Bank smaller than the round size
If the bank has fewer questions than the round size, the round SHALL use all available questions.

#### Scenario: Short bank
- **WHEN** the bank has 8 questions and the round size is 15
- **THEN** the round contains all 8 questions and the score is out of 8

### Requirement: Question presentation
For each question the system SHALL show the progress (current position and total), the question text, the code snippet when the question has one, and the options in a random order.

#### Scenario: Question with code
- **WHEN** the current question has a `code` snippet
- **THEN** the snippet is shown with its lines and indentation preserved, in a monospace presentation

#### Scenario: Shuffled options
- **WHEN** the same question is shown in different rounds
- **THEN** its options may appear in different orders, and the correct option remains the one marked by the bank

### Requirement: Select then submit
The user SHALL be able to select and change an option freely before submitting, and the answer SHALL be evaluated only when the user submits it. Submit SHALL be unavailable while no option is selected.

#### Scenario: Change selection before submit
- **WHEN** the user selects option A and then selects option C without submitting
- **THEN** option C is the selected option and nothing has been evaluated

#### Scenario: Submit without selection
- **WHEN** no option is selected
- **THEN** the submit control is disabled

### Requirement: Immediate feedback with explanation
After the user submits, the system SHALL indicate whether the answer was correct, show the correct option, show the question's explanation, and lock the options so the answer cannot be changed.

#### Scenario: Correct answer
- **WHEN** the user submits the correct option
- **THEN** the system marks the answer as correct and shows the explanation

#### Scenario: Incorrect answer
- **WHEN** the user submits an incorrect option
- **THEN** the system marks the answer as incorrect, highlights the correct option, and shows the explanation

#### Scenario: Options locked after submit
- **WHEN** feedback is being shown
- **THEN** the user cannot select a different option or submit again for that question

### Requirement: Advance to the next question
After feedback, the user SHALL advance with a Next control. On the last question of the round, the control SHALL lead to the results instead.

#### Scenario: Next question
- **WHEN** the user activates Next and more questions remain
- **THEN** the following question is shown with no selection

#### Scenario: Last question
- **WHEN** feedback is shown for the last question
- **THEN** the control is labeled to view results and activating it shows the results screen

### Requirement: Final score
At the end of a round the system SHALL show the number of correct answers out of the number of questions in the round.

#### Scenario: Score shown
- **WHEN** the round ends with 12 correct answers out of 15 questions
- **THEN** the results screen shows a score of 12 out of 15

### Requirement: Play again
The results screen SHALL offer a way to play another round, which starts a new round with a fresh selection of questions and a score of zero.

#### Scenario: Replay
- **WHEN** the user activates Play again
- **THEN** a new round begins from its first question and the previous score does not carry over

### Requirement: English interface
All user-facing text of the game SHALL be in English.

#### Scenario: Interface language
- **WHEN** any screen of the game is displayed
- **THEN** its labels, messages, and feedback are in English
