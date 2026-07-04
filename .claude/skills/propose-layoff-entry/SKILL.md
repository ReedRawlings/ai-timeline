---
name: propose-layoff-entry
description: Use when an AI-attributed layoff event needs to be added to the layoffs dataset (data/layoffs/layoffs.csv), or when a migrated needs_recode row is ready for its attribution recode. Codes the attribution (who said AI, in what words) from a primary source, produces the CSV row, and optionally the matching timeline event with a layoff_ids reference. Trigger whenever someone shares a layoff announcement, WARN filing, or news report tied to AI and wants it entered — or asks to recode a migrated row.
---

# Propose Layoff Entry

## Goal
Given a layoff event with a claimed AI connection, produce a fully-coded row for `data/layoffs/layoffs.csv` — attribution recorded as who-said-what-in-what-words, never a boolean or an editorial label.

## Read the conventions first
Read `.claude/shared/dataset-conventions.md` and `data/layoffs/schema.md`. Everything below assumes those: attribution discipline, no fabrication, "undisclosed" is valid / a guess is not, flag-don't-decide.

## Scope gate (before anything else)
- **AI-attributed only** (decided 2026-07-03). If no one — company, press, or analyst — attributed the cuts to AI, the event doesn't get a row. Don't infer the attribution yourself; `ai_attribution` codes what a source did, not what seems likely.
- Share-of-job-loss comparisons use external monthly/quarterly job-loss reports as the denominator, not rows here.

## Workflow

1. **Dedup.** Check `layoffs.csv` for an existing row (same company + announcement month). Country-split events get one row per country where the split is known — same event, distinct rows, cross-linked in `notes`.
2. **Fetch the primary source.** The actual statement, filing, or report — not a citation of a citation. No source link, no row.
3. **Code the attribution:**
   - `explicit_company` — the company itself cited AI. `attribution_quote` = their verbatim words.
   - `press_inferred` / `analyst_inferred` — someone else made the link. Quote them, name them.
   - `none_stated` — valid only for rows kept for cross-reference reasons; flag these to the human given the AI-attributed-only scope.
   - Watch for narrative cover: "AI-native transformation" framing around plain cost-cutting goes in `attribution_notes`, not silently upgraded to `explicit_company`.
4. **Fill the row per `schema.md`.** `count` empty if undisclosed (never guess); `count_precision` honest (`approximate`, `range_low`/`range_high` as separate columns' semantics); `press_independent` true only for WARN/ONS/Labour Bureau-class sources; conflicting counts → record both in `notes`, don't average.
5. **Recode pass (migrated rows):** replace `needs_recode` with a real status only after re-fetching the source and coding the attribution from a verbatim quote. The legacy label in `attribution_notes` is a lead, not evidence.
6. **Timeline linkage (optional).** If the event is timeline-worthy (see `event-conventions.md` rubric), propose the event entry with `layoff_ids: ["<row-id>"]`. Dataset row first, event second — never the reverse.
7. **Validate:** `python scripts/validate-layoffs.py` (and `python scripts/validate-yaml.py` if an event was touched). Rebuild the chart data with `node scripts/build-layoffs.js` when counts changed.

## Output
The CSV row(s), plus a short review note: attribution code chosen and why, the quote used, anything borderline (ambiguous attribution, conflicting counts, scope-edge cases like AI-adjacent restructuring). Borderline → flag it; the human decides.

## Hard rules
- IDs are permanent kebab-case (`company-slug-YYYY-MM`); corrections update the row, not the ID.
- A number without a link doesn't enter the dataset.
- Who made the attribution and their exact words — company ≠ press ≠ analyst. Never flatten to a boolean.
