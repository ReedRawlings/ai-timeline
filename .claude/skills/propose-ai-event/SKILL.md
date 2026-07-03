---
name: propose-ai-event
description: Use when evaluating a specific AI development — a URL, article, or described event — to produce a ready-to-paste entry for the AI Timeline's data/events.yaml. Handles a single event or a batch. Extracts every field to the repo's conventions, then flags any entry that looks below the significance bar so a human can review it before it ships. Trigger whenever someone shares an AI news link, announcement, paper, lawsuit, funding round, layoff, or model release and wants it turned into a timeline entry — even if they just paste a URL without saying "make YAML."
---

# Propose AI Event

## Goal
Given one or more AI developments (a URL, pasted text, or a described event), produce a ready-to-paste YAML entry for each, then flag any entry that looks too minor for the timeline so a human can review it.

You always emit YAML for every event you're given — you never silently drop one. Significance is surfaced as a review flag, not a gate. The human decides what to keep.

## Read the conventions first
Read `.claude/shared/event-conventions.md`. It defines the field rules, approved tags/impact areas, the `layoffs` field, the significance rubric, the omit-empty rule, and the dedup check. Everything below assumes those.

## Workflow
For each event:
1. **Read the source.** If given a URL, fetch it. If given text, use it directly. Don't infer facts the source doesn't support.
2. **Dedup** against `data/events.yaml` (section 7 of the conventions). If it's already on the timeline, say so instead of producing a duplicate.
3. **Extract and format** the fields per the conventions.
4. **Judge significance** against the rubric and note whether it clears the bar.
5. **Self-check** against section 9, then output.

## Output

First, the entries — one YAML block per event, ready to paste into `data/events.yaml`:
```yaml
- title: "Event Title"
  date: "2026-01-29T10:00:00-08:00"
  tags: ["Model", "Product"]
  organizations: ["OpenAI"]
  models: ["GPT-4o"]
  impact_areas: ["Language Models"]
  key_figures: ["Sam Altman"]
  link: "https://source.com"
  description: "What happened and why it matters for AI."
```

Then a review list:
```
## Review flags
- "Event Title" — one-line reason it looks below the bar (which pattern it matched)
```
If nothing is flagged: `## Review flags` then `None — all entries clear the significance bar.`
If an event is already on the timeline, list it under a `## Already on timeline` heading instead of proposing it.

## Worked examples

### Clears the bar (no flag)
Source: Anthropic announces the Claude 3 model family.
```yaml
- title: "Claude 3 Release"
  date: "2024-03-04T09:00:00-08:00"
  tags: ["Model", "Product"]
  organizations: ["Anthropic"]
  models: ["Claude 3 Opus", "Claude 3 Sonnet", "Claude 3 Haiku"]
  impact_areas: ["Language Models", "Enterprise AI"]
  link: "https://www.anthropic.com/news/claude-3-family"
  description: "Anthropic released a three-model family spanning cost and capability tiers, with improved reasoning, math, and coding performance and a step up in multimodal understanding over prior Claude models."
```
No `key_figures` line because the source named no central individual — omitted, not empty. Clears the bar on capability leap.

### Extracted but flagged
Source: a lab ships a `.1` point update to a model released weeks earlier, with minor latency gains.
```yaml
- title: "Example Model 4.1 Point Update"
  date: "2026-02-11T10:00:00-08:00"
  tags: ["Model"]
  organizations: ["Example Lab"]
  models: ["Example Model 4.1"]
  impact_areas: ["Language Models"]
  link: "https://example.com/model-4-1"
  description: "Example Lab shipped an incremental update to its Model 4 line with modest latency and throughput gains and no new capabilities."
```
```
## Review flags
- "Example Model 4.1 Point Update" — routine version bump, same family weeks apart, no qualitative leap. Review before adding.
```
