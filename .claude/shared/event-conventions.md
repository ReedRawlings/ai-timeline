# AI Timeline — Event Conventions (shared source of truth)

Every event skill in this repo reads this file. Edit conventions here, not in the individual skills.
Skills that reference this: `propose-ai-event`, `find-ai-events-broad`, `find-ai-events-criteria`.

---

## 1. Significance rubric

**Flag for review** (surface to a human, don't silently keep or drop) if the event matches one of these and clears none of the include criteria below:
- Routine version bump — same model family, incremental, weeks apart
- Minor partnership with no structural change
- Conference talk, teaser, or "coming soon" with no concrete release
- Benchmark result with no qualitative capability leap

**Clears the bar** if it hits any one of:
1. **Structural novelty** — a major lab changes how the industry operates (holding a release for safety, reversing course on open source when peers abandoned it)
2. **Social/cultural moment** — AI enters public consciousness in a new way: viral backlash, a movement, a high-profile controversy, adoption hitting a tipping point
3. **Regulatory/legal landmark** — first-of-kind legislation, court ruling, or government action that sets precedent
4. **Economic signal** — market event where AI is the proximate cause, scale-redefining funding, major workforce cuts explicitly tied to AI
5. **Early analyst call** — a specialist source flagged it before mainstream coverage

Borderline → flag it. Err toward surfacing so the human decides.

---

## 2. Field extraction rules

Match `data/events.yaml` exactly.

**Required (every entry):**
- **title** — concise but specific enough to distinguish this event from similar ones, in quotes. Prefer "Claude 3 Release" over "New Model".
- **date** — ISO 8601 with timezone offset: `YYYY-MM-DDTHH:MM:SS-08:00`. Use the most specific, accurate date the source supports. If only a calendar date is given, default the time to `T10:00:00` and use the origin timezone (US Pacific `-08:00`/`-07:00`, US Eastern `-05:00`, UK `+00:00`). Default the time — don't invent a precise hour and present it as fact. The date lives here and nowhere else.
- **description** — 1-3 factual sentences on what happened and why it matters for AI's trajectory. **Do not start with or restate the date** (it has its own field). You don't need to name the organizations or key figures just to list them — the structured fields carry those. **Paraphrase the source in your own words; never copy sentences verbatim.**

**Optional (include only when supported; see omit rule):**
- **tags** — one or more from the Approved Tags list. Nothing off-list.
- **organizations** — companies, labs, institutions, or agencies involved.
- **models** — specific model names, spelled exactly as the vendor/source writes them ("GPT-4o", "Genie 3"). If the model already appears in `data/events.yaml`, match that spelling so the site's filters stay consistent. Don't normalize or guess version numbers.
- **impact_areas** — one or more from the Approved Impact Areas list. Nothing off-list.
- **key_figures** — only prominent, named individuals central to the event (CEOs, heads of AI orgs, well-known researchers, named public figures — e.g. Sam Altman, Elon Musk, Dario Amodei). Don't pad with minor or unnamed people.
- **link** — the source URL.
- **layoffs** — only for AI-attributed workforce-reduction events. See section 5.

**Omit-empty rule:** if a field has no value, leave the field out entirely. Never write `tags: []` or `organizations: []`. The validator warns on empty `organizations`/`models`, and the house convention is to omit.

---

## 3. Approved Tags
Use only these:
Model, Corporate, Product, Research, Policy, Economic, Social, Technical, Partnership, Safety

(Model = new model releases/updates · Corporate = structure, governance, hiring, policy · Product = launches/major updates · Research = papers, studies, findings · Policy = government/legal developments · Economic = markets, funding, M&A, IPOs · Social = public reaction, controversy, culture · Technical = infra, hardware, platform · Partnership = collaborations · Safety = alignment/risk)

## 4. Approved Impact Areas
Use only these (this is the site's live filter taxonomy — lawsuits and court rulings map to **Regulation**, not a separate "Legal" area):
Multimodal AI, Language Models, Computer Vision, Market Competition, Robotics, Healthcare, Education, Creator Economy, Public Perception, Ethics, Regulation, Enterprise AI, Open Source, Hardware, Research

## 5. The `layoffs` field
Only for events that are primarily AI-attributed workforce reductions:
```yaml
  layoffs:
    company: "Company Name"
    headcount: 500
```
`headcount` must be an integer — no quotes, no commas. Omit the whole block for non-layoff events.

---

## 6. Curated sources (search these before broad web)

**Substacks** (JS-blocked — use `site:` search, then fetch individual article URLs):

| Publication | Search domain |
|---|---|
| Hyperdimensional (Dean W. Ball) | `site:hyperdimensional.co` |
| TBPN (John & Brandon) | `site:tbpn.substack.com` |
| One Useful Thing (Ethan Mollick) | `site:oneusefulthing.org` |

**Direct web:**

| Publication | Access pattern |
|---|---|
| Superintelligence | Fetch `getsuperintel.com` homepage → individual article URLs |

**Reddit:** r/artificial, r/ChatGPT, r/MachineLearning — for social/cultural moments.

Weight specialist outlets over wire services and news aggregators.

---

## 7. Deduplicate against the existing timeline

Before proposing an event, check it isn't already on the timeline:
- Load `data/events.yaml` and compare against existing entries.
- Match on the **underlying event**, not just the exact title string — the same development may be titled differently.
- Duplicate titles are a validator warning and produce duplicate cards on the site, so drop true duplicates. If an existing entry covers the same event but your source adds materially new detail, note it as an update for the human rather than adding a second entry.

---

## 8. YAML output format
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

## 9. Self-check before writing (mirrors `scripts/validate-yaml.py`)

The validator only runs against `data/events.yaml` on merge, not against proposal files — so proposals must be self-checked to the same rules:
- [ ] `title`, `date`, `description` present on every entry
- [ ] `date` parses as ISO 8601 (a trailing `Z` is fine)
- [ ] array fields are lists; no empty `[]` arrays anywhere
- [ ] `layoffs`, if present, is a mapping with `company` and an integer `headcount`
- [ ] no title duplicates another entry in the batch or in `data/events.yaml`
- [ ] tags and impact_areas are drawn only from the approved lists

A quick syntax check on a proposal file: `python -c "import yaml; yaml.safe_load(open('proposals/FILE.yaml'))"`.
