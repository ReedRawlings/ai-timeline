---
name: find-ai-events-criteria
description: Use when searching for the previous day's significant AI events with targeted, criteria-first searches — one query per rubric category rather than a broad "AI news" sweep. Produces a YAML proposal file plus a human-readable summary. Trigger for a focused daily sweep when you'd rather probe each significance category directly than filter a broad pile.
---

# Find AI Events — Criteria-First

## Goal
Find the previous day's significant AI events by searching for each rubric category directly. Write a YAML proposal file and output a human-readable summary.

## Read the conventions first
Read `.claude/shared/event-conventions.md`. It defines the significance rubric, the curated source list and access patterns, field/format rules, the approved tags/impact areas, the dedup check, and the self-check list. This skill only covers the discovery method and output; everything else lives there.

## Discovery method
Search for each rubric category directly — do not search "AI news" broadly. Run one targeted query per category (conventions §1), curated sources first (conventions §6), then broad web.

| Category | Example query |
|---|---|
| Structural novelty | `"AI" "refused to release" OR "safety hold" OR "open source reversal" [date]` |
| Social/cultural | `"AI" backlash OR controversy OR viral site:reddit.com [date]` |
| Regulatory/legal | `"AI" legislation OR "court ruling" OR law [date]` |
| Economic signal | `"AI" layoffs OR "funding round" OR market [date]` |
| Early analyst call | search curated sources for commentary that preceded mainstream coverage |

## Pipeline
1. **Probe** each category with its targeted query.
2. **Dedup** every candidate against `data/events.yaml` (conventions §7). Drop anything already on the timeline.
3. **Confirm significance** — the query surfaced it, but still check it against the rubric (conventions §1) rather than assuming.
4. **Extract and format** each kept event per the conventions, assigning a suggested `tier` (conventions §2 — default `notable`/omit; flag any suggested `major` for the human).
5. **Self-check** the proposal against conventions §9.
6. **Write and summarize** (below).

## Output

### YAML proposal file
Create the directory if needed, then write to `proposals/YYYY-MM-DD-events-criteria.yaml`:
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
