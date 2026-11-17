# Journal

One file per working session, so the next session (a person or an agent) starts from
what was decided and what is still open. Git history says what changed; the journal
says why, and what comes next.

## When

- Start of a session: read the newest entry. Its "Next" list is the starting point.
- End of a session: write a new entry before the last commit, and commit it with the work.

## File name

`YYYY-MM-DD-short-topic.md`, for example `2026-11-17-website-redesign.md`.
Two sessions on one day get two files with different topics.

## Template

```markdown
# YYYY-MM-DD: Short topic

## Goal
What the session set out to do, in one or two sentences.

## Done
- What changed, with the commit id where useful.

## Decisions
- Decision, and the reason. Who decided (Ali, or the agent with Ali's approval).

## Open
- Problems found but not fixed, questions waiting for an answer.

## Next
- The first things the next session should do, most important first.
```

## Rules

- Facts only: what happened, not plans dressed as results.
- No secrets, no guest data, no hotel data that is not public.
- Old entries are not rewritten. Correct a mistake in a new entry.
- A decision that changes how the project works also goes into its canonical home
  (`references/`, `_config/`, `docs/`); the journal links there.
