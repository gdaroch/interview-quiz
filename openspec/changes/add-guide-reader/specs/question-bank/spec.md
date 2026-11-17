# Spec Delta

## ADDED Requirements

### Requirement: Guide reference
Each question SHALL have a string `guideId` that is the id of the study guide section the question is based on. The `guideId` MUST match the id of an existing section of the study guide.

#### Scenario: Valid guide reference
- **WHEN** a question has a `guideId` that is the id of a section of the study guide
- **THEN** the question is accepted as valid

#### Scenario: Missing guide reference
- **WHEN** a question has no `guideId`, or its `guideId` is not a string
- **THEN** the question is reported as invalid

#### Scenario: Unknown guide section
- **WHEN** a question's `guideId` is not the id of any section of the study guide
- **THEN** the question is reported as invalid and the unknown `guideId` is named

#### Scenario: Several questions, one section
- **WHEN** several questions have the same `guideId`
- **THEN** all of them are accepted as valid
