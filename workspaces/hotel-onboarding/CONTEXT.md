# Hotel Onboarding

Layer 1 routing for this workspace. It takes one hotel from first answers to a live
pilot, and 30 days later to the pilot report that makes the case for the paid package.

## Stages

| Stage | Job | Writes |
|-------|-----|--------|
| `stages/01-intake/` | Collect the hotel's answers to the questionnaire | `<slug>-intake.md` |
| `stages/02-facts/` | Turn answers into the facts the AI may use | `<slug>-facts.md`, `<slug>-knowledge.sql` |
| `stages/03-website-content/` | Write the hotel website content and check it | `<slug>-site.json`, `<slug>-site.sql` |
| `stages/04-launch/` | Load everything, test it, hand over to staff | `<slug>-launch.md` |
| `stages/05-pilot-report/` | Day 30: numbers, summary, next step | `<slug>-pilot-report.md` |

Run the stages in order. Each stage reads the previous stage's `output/`. A person may
edit any output before the next stage runs; the next stage uses the edited file.

## How to run a stage

Read this file, then the stage's `CONTEXT.md`. Load only the files in its Inputs
table. Write only the files in its Outputs table, into that stage's `output/`.

## Shared for every stage

| File | Why |
|------|-----|
| `_config/voice.md` | How we write to guests and hotels |
| `_config/glossary.md` | One Arabic term per English term |
| `workspaces/hotel-onboarding/_config/hotels.md` | Which hotels are in which stage |

## Conventions

- One hotel per run. File names start with the hotel's slug: lowercase letters,
  digits and hyphens, for example `al-noor-madinah`.
- Paths in Inputs tables are from the repo root.
- No secrets in outputs. Staff keys and passwords never go in these files.
- Hotel answers are the hotel's data: outputs stay in this private workflow until the
  hotel approves what goes public (website content, facts).
- When a hotel finishes a stage, update its row in `_config/hotels.md`.

## Note on real hotels and git

This repository is public. Before committing a real hotel's outputs, decide with the
hotel whether they may be public. If not, keep that hotel's `output/` files out of git
(add them to `.gitignore`) and store them in the hotel's private folder.
