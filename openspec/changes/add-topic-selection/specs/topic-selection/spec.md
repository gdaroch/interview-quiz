# Spec Delta

## Purpose

Lets the player choose which topics of the question bank a round draws from, using toggle buttons on the start screen.

## ADDED Requirements

### Requirement: One button per topic
The start screen SHALL show one button for each distinct `topic` value in the question bank, labeled with that value as written in the bank.

#### Scenario: Buttons match the bank
- **WHEN** the start screen is shown
- **THEN** there is exactly one topic button for each distinct `topic` in the bank, labeled with its name

#### Scenario: New topic in the bank
- **WHEN** the bank contains a question whose `topic` no other question uses
- **THEN** a button for that topic is shown without any other change to the application

### Requirement: Topics are toggled and highlighted
Activating a topic button SHALL toggle that topic between selected and not selected, and selected topics SHALL be visually highlighted and exposed to assistive technology as pressed. The player SHALL be able to select any number of topics.

#### Scenario: Deselect a topic
- **WHEN** a selected topic button is activated
- **THEN** the topic becomes not selected and its button is no longer highlighted

#### Scenario: Select a topic again
- **WHEN** a non-selected topic button is activated
- **THEN** the topic becomes selected and its button is highlighted

#### Scenario: Several topics selected
- **WHEN** the player selects JavaScript and TypeScript
- **THEN** both buttons are highlighted at the same time

### Requirement: All topics selected by default
Every time the start screen is shown, all topics SHALL be selected. The selection SHALL NOT be remembered between rounds or page loads.

#### Scenario: First visit
- **WHEN** the application starts
- **THEN** every topic button is highlighted

#### Scenario: Play again
- **WHEN** the player finishes a round, plays again and the start screen is shown
- **THEN** every topic button is highlighted, regardless of the previous selection

### Requirement: At least one topic to start
The start control SHALL be disabled while no topic is selected, and enabled while at least one is selected.

#### Scenario: Every topic deselected
- **WHEN** the player deselects all topics
- **THEN** the start control is disabled

#### Scenario: One topic selected again
- **WHEN** the start control is disabled and the player selects one topic
- **THEN** the start control is enabled
