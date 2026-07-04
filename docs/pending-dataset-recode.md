# Pending: uncommitted dataset recode (snapshot 2026-07-03)

Work that was **already in the working tree** when the Atlas + Dispatch redesign
landed (PR #9) and was **deliberately left uncommitted**, because part of it
breaks CI validation. This note is a pointer so the thread can be picked back up.
Nothing here was authored by the redesign work — it's a parallel datasets pass.

## Why it wasn't committed

The layoffs recode **removes the `meta-2025-10` row** from `data/layoffs/layoffs.csv`,
but `data/events.yaml` still has an event referencing it:

- Event: **"Meta Cuts 600 from AI Research Unit"** (2025-10-22) → `layoff_ids: ["meta-2025-10"]`

`scripts/validate-yaml.py` enforces that every `layoff_ids` entry exists in the
dataset, so committing the recode as-is turns the GitHub Actions validation red.

**Resolve one of two ways before committing the recode:**
1. Restore the `meta-2025-10` row in `layoffs.csv`, or
2. Update/remove the `layoff_ids: ["meta-2025-10"]` reference on that event (and
   decide whether the event keeps its layoff framing at all).

The recode removed 11 rows total (below); `meta-2025-10` is the **only** one an
event references, so it's the single blocker — but re-check after any further pruning.

## The uncommitted changes

### `data/layoffs/layoffs.csv` (modified)
A recode pass that:
- Adds two columns: **`count_scope`** (`global|country|unknown`) and **`causal_link`** (`sole|mixed|contextual`).
- Recodes several rows from `needs_recode` → `verified`/`disputed` with real
  attribution quotes and notes (e.g. `meta-2023-03`, `meta-2026-01`).
- **Removes 11 rows** judged not to clear the causal bar:
  `amazon-2023-01`, `amazon-2024-10`, `ea-2023-03`, `ea-2024-02`,
  `google-2025-08`, `intel-2024-08`, `intel-2025-07`, `meta-2025-10`,
  `tesla-2024-04`, `unity-2024-01`, `ups-2024-01`.

### `scripts/validate-layoffs.py` (modified)
Updated to the new schema: adds `count_scope` and `causal_link` to the expected
header + enum checks, and relaxes the verified-row rule so `none_stated`
attribution rows are valid without an `attribution_quote` (verified by the
documented *absence* of an attribution). This is consistent with the CSV changes
and can ship with them.

### `data/provenance/register.csv` (modified)
Four seed rows fully researched and moved `pending` → `partially_verified`, each
with primary source, original figure-with-conditions, and conditions-stripped notes:
- `water-500ml-per-prompt` — traced to arXiv:2304.03271; 500ml is per ~10–50 responses (GPT-3), not per prompt.
- `ai-layoffs-challenger-counts` — Challenger Gray & Christmas; announced (not realized), US-only, "company cited AI" ≠ caused.
- `gemini-energy-per-prompt` — Google's 0.24 Wh (comprehensive) vs 0.10 Wh (chip-only) from the same disclosure.
- `openai-energy-per-query` — Altman's 0.34 Wh blog figure; no methodology/model/scope disclosed.

This file is independent of the layoffs issue and does **not** break validation
(`validate-provenance.py` passes) — it could be committed on its own.

### `.claude/skills/find-ai-layoffs-monthly/` (untracked)
New skill (`SKILL.md`) for the recurring monthly AI-attributed layoff sweep.
Standalone; safe to commit independently.

## Suggested path to land it
1. Commit `register.csv` and the `find-ai-layoffs-monthly` skill on their own — no blockers.
2. Resolve the `meta-2025-10` reference (option 1 or 2 above).
3. Commit `layoffs.csv` + `validate-layoffs.py` together, then run all three validators.
