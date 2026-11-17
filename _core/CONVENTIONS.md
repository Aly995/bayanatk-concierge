# Conventions

This repository follows the Interpretable Context Methodology (ICM) by Jake Van Clief
and David McDermott: the folder structure is the workflow architecture. Numbered stage
folders encode order, and CONTEXT.md files carry routing and stage contracts.

Source: "Interpretable Context Methodology: Folder Structure as Agentic Architecture",
arXiv 2603.16021 (https://arxiv.org/abs/2603.16021). Reference repo:
https://github.com/RinDig/Interpretable-Context-Methodology-ICM-

## Layers

| Layer | File | Answers |
|-------|------|---------|
| 0 | `CLAUDE.md` | Where am I? What is here? Always loaded, about 800 tokens. |
| 1 | `CONTEXT.md` (project or workspace) | Where do I go for this task? About 300 tokens. |
| 2 | stage `CONTEXT.md` | What does this stage need, do and produce? |
| 3 | `references/`, `_config/` | Stable facts and rules. Read them as constraints. |
| 4 | `output/` | Per-run work. Read it as input for the next stage. |

The agent reads downward and stops when it has enough. It loads only the files a
stage's Inputs table lists, never the whole folder.

## Stage Contract

Every stage `CONTEXT.md` has three sections:

```markdown
## Inputs
| Source | File/Location | Section/Scope | Why |

## Process
1. Step one
2. Step two

## Outputs
| Artifact | Location | Format |
```

## Key Patterns

| Pattern | Rule |
|---------|------|
| Handoffs | Stage N writes to its `output/`; stage N+1 lists that folder in its Inputs. |
| Edit surfaces | A person may edit any `output/` file before the next stage runs. The next stage uses the edited file. |
| One way references | Stages point to references and earlier outputs, never forward. |
| Canonical sources | One home per fact. Other files link to it. |
| Thin routing | A CONTEXT.md stays 25 to 80 lines. Detail lives in references. |
| Factory, not product | Fix a recurring problem in `references/` or `_config/`, not in one output. |

## Five principles (from the paper)

1. One stage, one job.
2. Plain text is the interface.
3. Load context in layers.
4. Every output is an edit surface.
5. Configure the factory, not the product.

## Journal (added for this project)

The paper uses stage outputs and git history as the record. This project adds
`journal/`: one dated file per working session, so the next session starts from
what was decided and what is open. Format in `journal/CONTEXT.md`.

## Naming

- `CLAUDE.md` and `CONTEXT.md` in capitals; everything else lowercase with hyphens.
- Stage folders: `stages/0N-name/`, two digits, hyphen, short name.
- Per-hotel files in a stage's `output/`: `<hotel-slug>-<artifact>.<ext>`.
- Empty folders that must exist get a `.gitkeep`.

## Quality Standards

- CONTEXT.md under 80 lines. Reference files under 200 lines.
- No em dashes. Plain English, short sentences, minimal jargon.
- No secrets anywhere in these files: names of settings only, never values.
