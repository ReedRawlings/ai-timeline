---
name: find-ai-events-broad
description: Use when searching for significant AI events from the previous day using broad search then filtering against the significance rubric
---

# Find AI Events — Broad

## Goal
Find the previous day's significant AI events by collecting broadly then filtering with the significance rubric. Write a YAML proposal file and output a human-readable summary.

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

Search `AI news [date]` broadly against curated sources first, then broad web. Collect all candidates, then apply the rubric above to filter down to what qualifies.

## Source Priority

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

**Broad web:** Weight results from specialist outlets over wire services and news aggregators.

## Output

### YAML Proposal File
Write to `proposals/YYYY-MM-DD-events-broad.yaml`. Follow the exact structure of `data/events.yaml`. Omit fields with no values rather than using empty arrays.

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
