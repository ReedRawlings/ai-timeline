---
name: find-ai-events-range
description: Use to backfill significant AI timeline events across a date RANGE (a whole month, a quarter, or a gap between the last tracked event and today) rather than a single day. Runs the criteria-first method per period with curated sources first and adversarial verification, dedups against the existing timeline, and produces proposal files plus a human review summary. Trigger for "backfill April", "catch the timeline up", "fill the gap since <date>", or any multi-day event sweep.
---

# Find AI Events — Range / Backfill

## Goal
Catch the timeline up across a date range. Produce proposal file(s) and a human-readable review summary. This is the range twin of `find-ai-events-broad`/`-criteria` (which are scoped to a single day) and the events twin of `find-ai-layoffs-monthly`.

## Read the conventions first
Read `.claude/shared/event-conventions.md`. It defines the significance rubric (§1), the tier rules (§2 — note: **routine model releases are never major**), the curated source list (§6), dedup (§7), the output format (§8), the **verification step (§9)**, and the structural self-check (§10). This skill only covers the range-specific discovery method and output.

## Establish the window and the dedup floor first
1. **Fix the range.** If the user said "backfill April," that's `2026-04-01 … 2026-04-30`. If they said "catch up," load `data/events.yaml`, find the latest event date, and set the range from there to today — and say so, so nothing between the last event and now is orphaned.
2. **Build the dedup set** from `data/events.yaml` for the range (conventions §7). Also dedup against any proposal files already written for adjacent windows. Only NET-NEW events get proposed.

## Discovery: criteria-first, per sub-period (cast wide, verify narrow)
Do NOT run one broad "AI news" query for the whole range — you'll miss the long tail. Walk the range in sub-periods (per week for a month; per month for a quarter) and, for each, run the criteria-first method:

1. **Curated sources first** (conventions §6): `site:` searches on the Substacks, the Superintelligence homepage, Reddit for social/cultural moments. Note §6's access-staleness caveat — when curated sources come up empty, widen to first-tier outlets; do not skip verification.
2. **One targeted query per rubric category** (conventions §1) for the sub-period: structural novelty, social/cultural, regulatory/legal, economic signal, paradigm model event. Add explicit probes for the categories a broad sweep under-covers: **funding rounds, hardware/data-center/infra, robotics/physical AI, research breakthroughs.** (In the 2026-07 backfill, funding and hardware were the biggest misses.)

## Pipeline
1. **Collect** candidates per sub-period across the whole range.
2. **Dedup** against `data/events.yaml` and adjacent proposals (§7).
3. **Filter** with the significance rubric (§1). Model releases: default `notable`/`minor`, not `major` (§2).
4. **Verify** every kept candidate against a primary or reputable source (**§9**) — confirm it's real, check the date and outcome against the source, and treat unfamiliar model/product names as suspect (hallucinated releases are the top failure mode). Drop or flag anything you can't confirm.
5. **Extract and format** per the conventions (§8), assigning a suggested `tier` (§2); surface every suggested `major` as a human flag.
6. **Self-check** against §10.
7. **Write and summarize** (below).

## Verification is not optional at range scale
A whole-month sweep surfaces far more low-quality/SEO/AI-generated sources than a single day, so §9 does the heavy lifting here. Confirm existence, dates, and outcomes against primaries or first-tier outlets; distinguish *happened* from *reported*; never present an analyst estimate as a company figure. Consider delegating discovery to subagents but keep verification of the flagged/major items yourself.

## Output

### YAML proposal file(s)
Create the directory if needed:
```bash
mkdir -p proposals
```
Write to `proposals/<range>-events.yaml` (e.g. `2026-04-events.yaml`, or `2026-03-20-to-31-events.yaml` for a gap window). Follow the `data/events.yaml` structure exactly (§8). Omit empty fields. Do NOT write into `data/events.yaml` directly — the human reviews first. After approval: append the rows (layoff rows before any event with `layoff_ids`), run `python scripts/validate-yaml.py`, and `node scripts/build-events.js`.

### Human-readable review summary
Group proposed events by rubric category (not chronologically):
- **Title** — date · suggested tier · one-sentence why-it-qualifies · source
Call out every suggested **`major`** explicitly for human confirmation. Include a **"dropped / rejected in verification"** section listing what §9 killed (hallucinated releases, wrong-outcome, out-of-window, unverifiable) with one line each, and note the dedup floor and any gap/orphan risk at the range edges.
