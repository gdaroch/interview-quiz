# question-bank Specification

## Purpose

Defines the format of the fixed question bank the quiz draws from and the startup validation that prevents the game from running on invalid data.

## Requirements

### Requirement: Question format
Each question in the bank SHALL have a unique string `id`, a string `topic`, a string `question`, an `options` array of strings, an integer `answer` that is the index of the single correct option, and a string `explanation`.

#### Scenario: Valid question
- **WHEN** a question has all required fields with the expected types and `answer` is a valid index into `options`
- **THEN** the question is accepted as valid

#### Scenario: Answer index out of range
- **WHEN** a question's `answer` is negative, not an integer, or not less than the number of options
- **THEN** the question is reported as invalid

### Requirement: Minimum number of options
Each question SHALL have at least two options, and all options of a question SHALL be non-empty strings.

#### Scenario: Single option
- **WHEN** a question has fewer than two options
- **THEN** the question is reported as invalid

#### Scenario: Empty option text
- **WHEN** an option is an empty or whitespace-only string
- **THEN** the question is reported as invalid

### Requirement: Optional code snippet
A question SHALL accept an optional `code` object; when present it MUST have a non-empty string `language` and a non-empty `lines` array of strings, representing the lines of a code snippet.

#### Scenario: Question without code
- **WHEN** a question has no `code` field
- **THEN** the question is accepted as valid

#### Scenario: Valid code snippet
- **WHEN** a question has `code` with a `language` string and a non-empty `lines` array of strings
- **THEN** the question is accepted as valid

#### Scenario: Malformed code snippet
- **WHEN** `code` is present but `language` is missing or empty, or `lines` is missing, empty, or contains a non-string entry
- **THEN** the question is reported as invalid

### Requirement: Unique question ids
Question ids SHALL be unique across the bank.

#### Scenario: Duplicate id
- **WHEN** two questions share the same `id`
- **THEN** the bank is reported as invalid and the duplicated id is named

### Requirement: Startup validation blocks the game
The system SHALL validate the entire question bank when the application starts and SHALL NOT start a round if any problem is found.

#### Scenario: Valid bank
- **WHEN** the application starts and every question is valid
- **THEN** the game becomes available to play

#### Scenario: Invalid bank
- **WHEN** the application starts and at least one question is invalid
- **THEN** the game is not available and an error screen is shown instead

#### Scenario: Empty bank
- **WHEN** the application starts and the bank contains no questions
- **THEN** the bank is reported as invalid and the game is not available

#### Scenario: Malformed JSON file
- **WHEN** the application starts and the question file is not valid JSON
- **THEN** the game is not available and the error screen shows an invalid-JSON error

#### Scenario: Bank is not a list
- **WHEN** the bank data is missing or is not a list of questions
- **THEN** the bank is reported as invalid and the game is not available

### Requirement: Validation errors are complete and actionable
When the bank is invalid, the system SHALL show all detected problems at once, each identifying the offending question (by id when available, otherwise by its position) and the field at fault, and SHALL tell the user to fix the question data before continuing.

#### Scenario: Multiple problems
- **WHEN** the bank has an invalid `answer` in one question and a missing `explanation` in another
- **THEN** the error screen lists both problems, each with its question and field
