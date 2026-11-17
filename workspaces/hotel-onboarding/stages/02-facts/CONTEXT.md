# Stage 02: Facts

Turn the intake answers into the hotel's knowledge items: the only things the AI may say.

## Inputs

| Source | File/Location | Section/Scope | Why |
|--------|---------------|---------------|-----|
| Layer 4 | `workspaces/hotel-onboarding/stages/01-intake/output/<slug>-intake.md` | All | The hotel's answers |
| Layer 3 | `workspaces/hotel-onboarding/stages/02-facts/references/fact-rules.md` | All | How to write a fact, topics, SQL template |
| Layer 3 | `_config/glossary.md` | All | Names of places and services |

## Process

1. For each topic in `fact-rules.md`, write one fact from the intake answers. Skip a
   topic the hotel did not answer; never fill a gap with a guess.
2. Write facts in English, short and exact: times, prices, places, conditions.
3. Put the list in `<slug>-facts.md` as a table (topic, fact, intake question number)
   and send it to the hotel contact to approve.
4. After approval, write `<slug>-knowledge.sql` from the template in `fact-rules.md`.

## Outputs

| Artifact | Location | Format |
|----------|----------|--------|
| `<slug>-facts.md` | `stages/02-facts/output/` | Markdown table: topic, fact, source question |
| `<slug>-knowledge.sql` | `stages/02-facts/output/` | SQL inserts into `public.knowledge_items` |

## Done when

The hotel has approved every fact, and every fact traces back to an intake answer.
