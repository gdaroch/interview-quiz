# Spec Delta

## MODIFIED Requirements

### Requirement: Question format
Each question in the bank SHALL have a unique string `id`, a string `topic`, a string `question`, an `options` array of strings, an integer `answer` that is the index of the single correct option, and a string `explanation`. The `topic` is the name shown to the player for the question's subject, and questions with the same `topic` value form one topic.

#### Scenario: Valid question
- **WHEN** a question has all required fields with the expected types and `answer` is a valid index into `options`
- **THEN** the question is accepted as valid

#### Scenario: Answer index out of range
- **WHEN** a question's `answer` is negative, not an integer, or not less than the number of options
- **THEN** the question is reported as invalid

#### Scenario: Topic grouping
- **WHEN** two questions have the exact same `topic` string
- **THEN** they belong to the same topic
