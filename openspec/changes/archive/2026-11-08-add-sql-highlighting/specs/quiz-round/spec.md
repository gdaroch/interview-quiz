# Spec Delta

## ADDED Requirements

### Requirement: Code snippet syntax coloring
The system SHALL color the code snippet of a question when its `language` is one of the supported languages: JavaScript, TypeScript, CSS, HTML and SQL. A snippet in any other language SHALL be shown as plain text, without error.

#### Scenario: SQL snippet is colored
- **WHEN** the current question has a `code` snippet with `language` set to `sql`
- **THEN** the SQL keywords, strings, numbers and comments in the snippet are shown in distinct colors

#### Scenario: Unsupported language stays plain
- **WHEN** the current question has a `code` snippet whose `language` is not supported
- **THEN** the snippet is shown as plain monospace text and the question remains playable

#### Scenario: Snippet text is not altered
- **WHEN** a snippet in a supported language is colored
- **THEN** its lines, indentation and characters such as `<`, `>` and `&` are shown exactly as written in the bank
