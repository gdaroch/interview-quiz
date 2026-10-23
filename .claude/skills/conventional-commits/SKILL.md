---
name: conventional-commits
description: Write git commit messages following the Conventional Commits 1.0.0 specification. Use whenever creating a git commit, amending a commit message, or when the user asks to commit changes, stage and commit, or says "commit".
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

Create git commits whose messages follow Conventional Commits.

## Format

```
<type>(<optional scope>): <description>

<optional body>

<optional footer(s)>
```

## Steps

1. Run `git status` and `git diff --staged` (or `git diff` if nothing is staged) to understand the change.
2. Look at `git log --oneline -n 5` to match the scope naming already in use.
3. Pick the type and scope, then write the message.
4. If the diff mixes unrelated concerns, propose splitting it into several commits.
5. Commit only when the user asked for it. Never push unless asked.

## Types

| Type | Use for |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only (including OpenSpec artifacts) |
| `style` | Formatting, whitespace; no logic change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests (unit, e2e) |
| `build` | Build system or dependencies (npm, Playwright install) |
| `ci` | CI configuration |
| `chore` | Maintenance that doesn't touch src or tests (agents, skills, config) |
| `revert` | Reverting a previous commit |

## Rules

- Type is lowercase. Scope is optional, lowercase, in parentheses (e.g. `feat(quiz): ...`).
- Description: imperative mood ("add", not "added"), lowercase first letter, no trailing period, 72 characters or fewer for the whole first line.
- Separate the body from the description with a blank line. The body explains *what* and *why*, not *how*.
- Breaking changes: add `!` after the type/scope (`feat(api)!: ...`) and/or a `BREAKING CHANGE: <explanation>` footer.
- Reference issues in footers (`Closes #12`).
- Write messages in English, even if the conversation is in another language.

## Attribution

If the session's instructions specify a `Co-Authored-By` trailer, place it last in the footer, after a blank line, following any other footers.

## Examples

```
feat(quiz): add score summary screen
```

```
fix(timer): stop countdown when the question is answered

The interval was never cleared, so the next question started
with a stale remaining time.
```

```
build: add playwright for e2e tests
```

```
feat(api)!: rename /questions endpoint to /quiz

BREAKING CHANGE: clients must call /quiz instead of /questions.
```
