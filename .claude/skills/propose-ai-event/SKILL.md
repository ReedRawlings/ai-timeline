---
name: propose-ai-event
description: Use when evaluating a single AI event or URL to determine if it qualifies for the timeline and generating a YAML entry
---

# Propose AI Event

## Goal
Given a URL, article, or description of a specific event, evaluate it against the significance rubric and generate a ready-to-paste YAML entry if it qualifies.

## What Qualifies

**Skip if only:**
- Routine version bump (same model family, weeks apart)
- Minor partnership with no structural significance
- Conference talk or teaser with no concrete release
- Benchmark result without qualitative capability leap

**Include if it clears one of:**
1. **Structural novelty** — Changes how the industry operates
2. **Social/cultural moment** — AI in public consciousness in a new way
3. **Regulatory/legal landmark** — First-of-kind precedent
4. **Economic signal** — Market event, scale-redefining funding, AI-tied layoffs
5. **Niche analyst call** — Specialist called it before mainstream coverage

## Output

If it qualifies, output a YAML block following `data/events.yaml` structure. Omit empty array fields.

```yaml
- title: "Event Title"
  date: "YYYY-MM-DDTHH:MM:SS-07:00"
  description: "What happened and why it matters..."
  tags: ["Tag"]
  organizations: ["Org"]
  impact_areas: ["Area"]
  link: "https://source.com"
```

State which criterion it cleared and why. If it doesn't qualify, say so and explain.
