# Stage 01: Intake

Collect everything the hotel needs to tell us, once, in one file.

## Inputs

| Source | File/Location | Section/Scope | Why |
|--------|---------------|---------------|-----|
| Layer 3 | `workspaces/hotel-onboarding/stages/01-intake/references/questionnaire.md` | All | The questions, in Arabic and English |
| Layer 3 | `_config/glossary.md` | All | Use the agreed terms when asking |
| Person | The hotel's answers (call, WhatsApp, form, documents) | All | The raw material |

## Process

1. Agree the hotel's slug (lowercase, hyphens) and add its row to
   `workspaces/hotel-onboarding/_config/hotels.md`.
2. Send the questionnaire in the hotel's preferred language. Required questions first.
3. Record each answer under its question number, in the language given. Do not
   translate or improve answers here; that happens in later stages.
4. Mark every unanswered required question as `MISSING` and list them at the top.
5. Note documents received (price list, photos, licence) with where they are stored.
   Do not copy photos into the repo.

## Outputs

| Artifact | Location | Format |
|----------|----------|--------|
| `<slug>-intake.md` | `stages/01-intake/output/` | Markdown: a MISSING list at the top, then answers by question number |

## Done when

No required question is `MISSING`, and the hotel contact has confirmed the answers.
