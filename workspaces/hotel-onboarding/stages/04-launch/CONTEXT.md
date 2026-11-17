# Stage 04: Launch

Load the hotel into the live system, test every path, and hand over to the staff.

## Inputs

| Source | File/Location | Section/Scope | Why |
|--------|---------------|---------------|-----|
| Layer 4 | `workspaces/hotel-onboarding/stages/01-intake/output/<slug>-intake.md` | Sections A, H | Names, contacts, staff, privacy |
| Layer 4 | `workspaces/hotel-onboarding/stages/02-facts/output/<slug>-knowledge.sql` | All | The facts to load |
| Layer 4 | `workspaces/hotel-onboarding/stages/03-website-content/output/<slug>-site.sql` | All | The website to load |
| Layer 3 | `workspaces/hotel-onboarding/stages/04-launch/references/launch-steps.md` | All | Order of steps and the hotel row SQL |
| Layer 3 | `docs/PILOT.md` | All | The pre-launch checklist |
| Layer 3 | `references/project-facts.md` | Links, Settings | Where things are |

## Process

1. Confirm every box in `docs/PILOT.md` that applies before loading anything.
2. Follow `launch-steps.md` in order: hotel row, facts, website, test, hand-over.
3. Record each step in `<slug>-launch.md` with the date, who did it, and the result.
4. Record the links given to the hotel. Never record the staff key itself.
5. Set the pilot start date in `workspaces/hotel-onboarding/_config/hotels.md`.

## Outputs

| Artifact | Location | Format |
|----------|----------|--------|
| `<slug>-launch.md` | `stages/04-launch/output/` | Markdown: checklist with dates and results, links handed over |

## Done when

A test chat in Arabic and English, a test service request and a test booking request
all reach the hotel's staff inbox, and the staff have confirmed they can see them.
