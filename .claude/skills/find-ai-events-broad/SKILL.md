---
name: find-ai-events-broad
description: Use when searching for the previous day's significant AI events by collecting candidates broadly and then filtering against the significance rubric. Produces a YAML proposal file plus a human-readable summary. Trigger for a daily or ad-hoc sweep of "what happened in AI" when you want wide coverage first and filtering second.
---

# Find AI Events — Broad

## Goal
Find the previous day's significant AI events by collecting broadly, then filtering with the significance rubric. Write a YAML proposal file and output a human-readable summary.

## Read the conventions first
Read `.claude/shared/event-conventions.md`. It defines the significance rubric, the curated source list and access patterns, field/format rules, the approved tags/impact areas, the dedup check, and the self-check list. This skill only covers the discovery method and output; everything else lives there.

## Discovery method
Search `AI news [date]` broadly — curated sources first (conventions §6), then broad web. Collect all candidates before filtering. Cast a wide net here; the rubric does the narrowing.

## Pipeline
1. **Collect** candidates broadly for the target date.
2. **Dedup** every candidate against `data/events.yaml` (conventions §7). Drop anything already on the timeline.
3. **Filter** the remainder with the significance rubric (conventions §1). Keep what clears the bar.
4. **Extract and format** each kept event per the conventions, assigning a suggested `tier` (conventions §2 — default `notable`/omit; flag any suggested `major` for the human).
5. **Self-check** the proposal against conventions §9.
6. **Write and summarize** (below).

## Output

### YAML proposal file
Create the directory if needed, then write to `proposals/YYYY-MM-DD-events-broad.yaml`:
```bash
mkdir -p proposals
```
Follow the `data/events.yaml` structure exactly (conventions §8). Omit empty fields.

### Human-readable summary
List proposed events grouped by rubric category (not chronologically):
- **Title** — date · suggested tier
- Why it qualifies (one sentence, which criterion it cleared)
- Source

Call out every suggested **`major`** explicitly so the human can confirm it (major is a human editorial call, not a computed one). If any candidates were borderline or dropped as duplicates, list them briefly under separate headings so the human can second-guess the calls.
