---
name: find-ai-events-criteria
description: Use when searching for significant AI events from the previous day using targeted, criteria-first searches
---

# Find AI Events — Criteria-First

## Goal
Find the previous day's significant AI events by searching for each rubric category directly. Write a YAML proposal file and output a human-readable summary.

## What Qualifies

**Skip unless something else makes it notable:**
- Routine version bumps (same model family, weeks apart)
- Minor partnership announcements
- Conference talks or "coming soon" teasers with no concrete release
- Benchmark results without a qualitative capability leap

**Include if it clears at least one of:**
1. **Structural novelty** — A major lab does something that changes how the industry operates (e.g., holding a release for safety reasons, reversing course on open source when peers have abandoned it)
2. **Social/cultural moment** — AI surfaces in public consciousness in a new way: viral backlash, a movement, a high-profile controversy, mass adoption hitting a tipping point
3. **Regulatory/legal landmark** — First-of-kind legislation, court ruling, or government action that sets precedent
4. **Economic signal** — Market event where AI is the proximate cause, funding that redefines scale expectations, major workforce reductions explicitly tied to AI
5. **Niche analyst call** — A specialist source called something before mainstream media picked it up

## Search Strategy

Search for each rubric category directly — do not search for "AI news" broadly. Run one targeted query per category against curated sources first, then broad web.

| Category | Example Query |
|---|---|
| Structural novelty | `"AI" "refused to release" OR "safety hold" OR "open source reversal" [date]` |
| Social/cultural | `"AI" backlash OR controversy OR viral site:reddit.com [date]` |
| Regulatory/legal | `"AI" legislation OR "court ruling" OR law [date]` |
| Economic signal | `"AI" layoffs OR "funding round" OR market [date]` |
| Niche analyst | Search curated sources for commentary that preceded mainstream coverage |

## Source Priority

Search curated sources within each category before going broad.

**Substacks** (JS-blocked — use `site:` search, then fetch individual article URLs):

| Publication | Search Domain |
|---|---|
| Hyperdimensional (Dean W. Ball) | `site:hyperdimensional.co` |
| TBPN (John & Brandon) | `site:tbpn.substack.com` |
| One Useful Thing (Ethan Mollick) | `site:oneusefulthing.org` |

**Direct web sources:**

| Publication | Access Pattern |
|---|---|
| Superintelligence | Fetch `getsuperintel.com` homepage → individual article URLs |

**Reddit:** Search r/artificial, r/ChatGPT, r/MachineLearning for social/cultural moments.

## Output

### YAML Proposal File
Write to `proposals/YYYY-MM-DD-events-criteria.yaml`. Follow the exact structure of `data/events.yaml`. Omit fields with no values rather than using empty arrays.

```yaml
- title: "Event Title"
  date: "2026-04-17T10:00:00-07:00"
  description: "What happened and why it matters..."
  tags: ["Social"]
  organizations: ["OpenAI"]
  impact_areas: ["Public Perception"]
  link: "https://source.com"
```

### Human-Readable Summary
List proposed events grouped by rubric category (not chronologically):
- **Title** — date
- Why it qualifies (one sentence, which criterion it cleared)
- Source
