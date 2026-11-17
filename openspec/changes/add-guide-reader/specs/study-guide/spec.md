# Spec Delta

## Purpose

Defines the study guide the questions are based on and how the player reads it from the question screen: when it can be opened, how a section is shown, how linked sections are followed, and how it is closed without losing the round.

## ADDED Requirements

### Requirement: Guide format
The study guide SHALL be a list of chapters. Each chapter SHALL have a string `id`, a string `title` and a list of sections. Each section SHALL have a string `id`, a string `title` and `lines`, a list of strings with the Markdown text of the section. Section ids SHALL be unique across the whole guide.

#### Scenario: Valid guide
- **WHEN** every chapter and section has the expected fields and no section id is repeated
- **THEN** the guide is accepted as valid

#### Scenario: Malformed chapter or section
- **WHEN** a chapter or a section is missing a field, has a field of the wrong type, or has a `lines` entry that is not a string
- **THEN** the guide is reported as invalid

#### Scenario: Duplicate section id
- **WHEN** two sections share the same `id`
- **THEN** the guide is reported as invalid and the duplicated id is named

### Requirement: Links between sections
A section MAY link to another section with a Markdown link whose target is `#` followed by the id of the target section. Every such link SHALL name an existing section.

#### Scenario: Link to an existing section
- **WHEN** a section contains a link whose target is `#` followed by the id of an existing section
- **THEN** the guide is accepted as valid

#### Scenario: Link to a missing section
- **WHEN** a section contains a link whose target is `#` followed by an id that no section has
- **THEN** the guide is reported as invalid and the section and the missing id are named

### Requirement: Guide validation blocks the game
The system SHALL validate the study guide when the application starts, together with the question bank, and SHALL NOT start a round if any problem is found in either. Problems SHALL be shown on the same error screen, all at once.

#### Scenario: Invalid guide
- **WHEN** the application starts and the guide has at least one problem
- **THEN** the game is not available and the error screen lists the guide problems

#### Scenario: Problems in guide and bank
- **WHEN** the application starts and both the guide and the question bank have problems
- **THEN** the error screen lists the problems of both

#### Scenario: Malformed guide file
- **WHEN** the application starts and the guide file is not valid JSON
- **THEN** the game is not available and the error screen shows an invalid-JSON error

### Requirement: Open the guide after answering
After the user submits an answer, the feedback SHALL include a control that opens the guide section named by the question's `guideId`. The control SHALL NOT be available before the answer is submitted.

#### Scenario: Control shown after submit
- **WHEN** feedback is being shown for a question
- **THEN** the control to open its guide section is available

#### Scenario: Control hidden before submit
- **WHEN** a question is shown and its answer has not been submitted
- **THEN** no control to open the guide is available

#### Scenario: Section of the question
- **WHEN** the user activates the control for a question
- **THEN** the guide opens on the section whose id is the question's `guideId`, showing its title and its content

### Requirement: Guide content is formatted
The guide dialog SHALL show the Markdown of a section formatted: paragraphs, bold and italic text, inline code, lists, tables and fenced code blocks. Code blocks in a supported language SHALL be syntax colored. Text that looks like HTML SHALL be shown as text and SHALL NOT be interpreted.

#### Scenario: Formatted section
- **WHEN** a section with a list, a table and a code block is opened
- **THEN** the list, the table and the code block are shown formatted and the Markdown marks are not visible

#### Scenario: Code block coloring
- **WHEN** a section has a code block in a supported language
- **THEN** the code block is shown colored, with its lines and indentation preserved

#### Scenario: HTML-like text is not interpreted
- **WHEN** a section contains text such as `<token>` or a script tag
- **THEN** it is shown as literal text and nothing is executed or hidden

### Requirement: Follow links between sections
While the guide is open, activating a link to another section SHALL show that section in the same dialog, without leaving the page.

#### Scenario: Follow a link
- **WHEN** the user activates a link to another section in the open guide
- **THEN** the dialog shows the target section and the page does not reload or change address

### Requirement: Go back through the guide
The guide SHALL offer a Back control that returns to the section shown before the current one, in the reverse order the user visited them. Back SHALL be unavailable while the current section is the first one opened from the question.

#### Scenario: Back after following links
- **WHEN** the user opens section A, follows a link to section B, then to section C, and activates Back
- **THEN** section B is shown, and activating Back again shows section A

#### Scenario: Back at the first section
- **WHEN** the dialog shows the section opened from the question
- **THEN** the Back control is not available

### Requirement: Close the guide without losing progress
The user SHALL be able to close the guide with a Close control or the Escape key. Closing SHALL return to the question screen exactly as it was: the same question, the selected option, the feedback, the score and the progress. Opening the guide again for a question SHALL start from that question's section, not from where the user last was.

#### Scenario: Close restores the question screen
- **WHEN** the user answers a question, opens the guide, follows two links and closes it
- **THEN** the same question is shown with the same selected option and feedback, and the score and progress have not changed

#### Scenario: Close with Escape
- **WHEN** the guide is open and the user presses Escape
- **THEN** the guide closes and the question screen is shown as it was

#### Scenario: Reopen starts at the question's section
- **WHEN** the user closes the guide after following links and opens it again from the same question
- **THEN** the dialog shows the section named by the question's `guideId`, and Back is not available

#### Scenario: Round continues after the guide
- **WHEN** the user closes the guide and activates Next
- **THEN** the following question of the same round is shown

### Requirement: Guide is accessible
While the guide is open, the rest of the page SHALL NOT be interactive, keyboard focus SHALL stay inside the guide, and the guide SHALL have an accessible name. When the guide closes, keyboard focus SHALL return to the control that opened it.

#### Scenario: Focus stays inside
- **WHEN** the guide is open and the user moves through the controls with the keyboard
- **THEN** focus moves only between the controls of the guide

#### Scenario: Focus returns on close
- **WHEN** the user closes the guide
- **THEN** keyboard focus is on the control that opened it
