# Stage 05: Pilot Report

At day 30, turn the pilot's numbers into a short report and a clear next step.

## Inputs

| Source | File/Location | Section/Scope | Why |
|--------|---------------|---------------|-----|
| Person | Pilot report tab in the staff inbox (`/dashboard/<slug>`) | All numbers | The measured results |
| Layer 4 | `workspaces/hotel-onboarding/stages/04-launch/output/<slug>-launch.md` | Dates, contacts | Pilot period and who to send it to |
| Layer 4 | `workspaces/hotel-onboarding/stages/01-intake/output/<slug>-intake.md` | Sections A, E | What the hotel cared about |
| Layer 3 | `workspaces/hotel-onboarding/stages/05-pilot-report/references/report-outline.md` | All | Structure of the report |
| Layer 3 | `_config/voice.md` | For hotels | Plain business language, numbers only |

## Process

1. Open the Pilot report tab, print it to PDF, and copy every number into the report.
2. Write the report in the hotel's preferred language, following `report-outline.md`.
3. Use only measured numbers. If a number is small, say so plainly.
4. End with one recommended next step and its price, or a clear "stop here" if the
   pilot did not help.

## Outputs

| Artifact | Location | Format |
|----------|----------|--------|
| `<slug>-pilot-report.md` | `stages/05-pilot-report/output/` | Markdown, one page, ready to export to PDF |

## Done when

The report is sent, the hotel has replied with a decision, and the decision is in
`workspaces/hotel-onboarding/_config/hotels.md` and in the journal.
