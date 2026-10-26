# Spec Delta

## MODIFIED Requirements

### Requirement: Start a round
The system SHALL show a start screen from which the user begins a round, after choosing the topics the round draws from.

#### Scenario: Begin from start screen
- **WHEN** the user activates the start control
- **THEN** the first question of a new round is shown

#### Scenario: Start with default selection
- **WHEN** the user activates the start control without changing the topic selection
- **THEN** the round draws from the whole bank

### Requirement: Random question selection
A round SHALL consist of `QUESTIONS_PER_ROUND` distinct questions chosen at random from the questions of the selected topics, where `QUESTIONS_PER_ROUND` is a fixed configured value (10 by default). Questions of topics that are not selected SHALL NOT appear in the round.

#### Scenario: Bank larger than the round size
- **WHEN** the selected topics have more questions than the round size
- **THEN** the round contains exactly the round size of distinct questions

#### Scenario: Different rounds differ
- **WHEN** the user plays two rounds from selected topics that have more questions than the round size
- **THEN** the selection and order of questions may differ between rounds

#### Scenario: Only selected topics
- **WHEN** the user selects only JavaScript and TypeScript and starts a round
- **THEN** every question in the round has the topic JavaScript or TypeScript

### Requirement: Bank smaller than the round size
If the questions of the selected topics are fewer than the round size, the round SHALL use all of them, without any warning.

#### Scenario: Short bank
- **WHEN** the selected topics have 8 questions and the round size is 10
- **THEN** the round contains all 8 questions and the score is out of 8
