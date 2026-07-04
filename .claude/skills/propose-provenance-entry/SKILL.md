---
name: propose-provenance-entry
description: Use when a viral or circulated AI statistic needs to be added to the stat provenance register (data/provenance/register.csv), or when an existing pending row is ready to be researched and verified. Traces the claim to its primary source, records the original figure with all its conditions, and documents exactly which conditions were stripped in circulation. Trigger whenever someone shares a widely-cited AI number ("500ml per prompt", "AI caused N layoffs", per-prompt energy figures) and wants it fact-checked into the register — or asks to verify a pending row.
---

# Propose Provenance Register Entry

## Goal
Given a circulated AI statistic, produce a fully-sourced row for `data/provenance/register.csv` — or an honest `pending` stub if primary-source verification can't be completed.

## Read the conventions first
Read `.claude/shared/dataset-conventions.md` and `data/provenance/README.md`. Everything below assumes those: attribution discipline, no fabrication, conditions-preserving, stable IDs, flag-don't-decide.

## Workflow

1. **Dedup.** Check `register.csv` for an existing row covering this claim (including variants of the same underlying figure). If one exists, update that row — never mint a second ID for the same claim.
2. **Pin the claim as circulated.** Quote or faithfully paraphrase the form that actually spreads, not a cleaned-up version. If multiple circulated forms exist, pick the dominant one and note variants in `notes`.
3. **Trace to the primary source.** Web-search and fetch the actual origin — the paper, disclosure, or report itself, not coverage of it. If the trail dead-ends at secondary coverage, the row is `unverifiable` or stays `pending`; say which and why.
4. **Record the original figure with ALL conditions:** unit basis (per how many queries?), model/system and its date, measurement scope (e.g. on-site vs. including upstream water/energy), location assumptions, whether it's a mean/median/range. Quote the source where possible.
5. **Diff the two.** `conditions_stripped_in_circulation` lists specifically what was dropped between the source and the circulated form.
6. **Set status honestly:**
   - `verified` — primary source read; it supports the claim as circulated
   - `partially_verified` — primary source read; figure exists but conditions were stripped/distorted (the most common outcome)
   - `unverifiable` — no primary source locatable, or the trail is circular
   - `pending` — research not completed; never guess to avoid this status
7. **Note revisions and rebuttals** (paper versions, credible re-estimates, methodological critiques) with links in `notes`.
8. **Validate:** run `python scripts/validate-provenance.py` after editing.

## Output

The CSV row (or updated row), plus a short review note to the human covering: what the primary source turned out to be, the status you assigned and why, and anything borderline — conflicting sources, ambiguous origin, a claim that's really two claims. Borderline → flag it; the human decides.

## Hard rules
- IDs are permanent kebab-case; corrections update the row, not the ID.
- A settled (non-pending) status requires a fetched-and-read primary source link. No exceptions.
- When sources conflict, record both visibly; don't average.
