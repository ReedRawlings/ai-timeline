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

**From bar to tier.** The rubric decides *whether* an event belongs. Each kept event also carries an editorial **`tier`** (`major` / `notable` / `minor`) that decides *how prominently* it renders in the Atlas + Dispatch view — see the `tier` field in section 2. Suggest a tier, but treat `major` as a human call: surface it as a flag, don't finalize it.

---

## 2. Field extraction rules

Match `data/events.yaml` exactly.

**Required (every entry):**
- **title** — concise but specific enough to distinguish this event from similar ones, in quotes. Prefer "Claude 3 Release" over "New Model".
- **date** — ISO 8601 with timezone offset: `YYYY-MM-DDTHH:MM:SS-08:00`. Use the most specific, accurate date the source supports. If only a calendar date is given, default the time to `T10:00:00` and use the origin timezone (US Pacific `-08:00`/`-07:00`, US Eastern `-05:00`, UK `+00:00`). Default the time — don't invent a precise hour and present it as fact. The date lives here and nowhere else.
- **description** — 1-3 factual sentences on what happened and why it matters for AI's trajectory. **Do not start with or restate the date** (it has its own field). You don't need to name the organizations or key figures just to list them — the structured fields carry those. **Paraphrase the source in your own words; never copy sentences verbatim.**

**Optional (include only when supported; see omit rule):**
- **tier** — editorial importance, one of `major`, `notable`, `minor`. **Default is `notable`; omit the field for notable events** and write only `tier: major` or `tier: minor` explicitly (place it right after `date:`). This is a hand-curated judgment — **never derive it from tags, keywords, or funding size.**
  - **major** — a landmark that reorders the field: first-of-kind regulation or court ruling, an AI-driven market shock, a safety or open-source reversal by a major lab, a defining cultural moment, or a genuinely paradigm-shifting model event. Only ~10–12% of events; these carry the site's headline cards. **Always surface a suggested `major` as a review flag for a human to confirm — never finalize it silently.**
    - **Model releases are the trap here: a routine release is never major, even from a frontier lab.** A new flagship or point-release (GPT-5.5 after 5.4, Claude Opus 4.7 after 4.6, a lab's first proprietary model, another open-weight drop) is `notable` or `minor` by default. What makes a *model event* major is the surrounding significance, not the ship: a lab **withholding or safety-holding** a completed model (e.g. Mythos), an **open-source reversal**, or a release that provably **reorders the competitive field** (a true paradigm shift, not "tops a benchmark"). "A big lab shipped a model" is not, by itself, a reason to consider major. (Decision 2026-07-04.)
  - **minor** — clears the bar but is incremental or niche: a point-release kept for completeness, a small or contained controversy, a narrow research result, a security/leak incident.
  - **notable** (default) — everything else that clears the bar. Omit the field.
- **tags** — one or more from the Approved Tags list. Nothing off-list.
- **organizations** — companies, labs, institutions, or agencies involved.
- **models** — specific model names, spelled exactly as the vendor/source writes them ("GPT-4o", "Genie 3"). If the model already appears in `data/events.yaml`, match that spelling so the site's filters stay consistent. Don't normalize or guess version numbers.
- **impact_areas** — one or more from the Approved Impact Areas list. Nothing off-list.
- **key_figures** — only prominent, named individuals central to the event (CEOs, heads of AI orgs, well-known researchers, named public figures — e.g. Sam Altman, Elon Musk, Dario Amodei). Don't pad with minor or unnamed people.
- **link** — the source URL.
- **layoff_ids** — only for AI-attributed workforce-reduction events. See section 5.

**Omit-empty rule:** if a field has no value, leave the field out entirely. Never write `tags: []` or `organizations: []`. The validator warns on empty `organizations`/`models`, and the house convention is to omit.

---

## 3. Approved Tags
Use only these:
Model, Corporate, Product, Research, Policy, Economic, Social, Technical, Partnership, Safety

(Model = new model releases/updates · Corporate = structure, governance, hiring, policy · Product = launches/major updates · Research = papers, studies, findings · Policy = government/legal developments · Economic = markets, funding, M&A, IPOs · Social = public reaction, controversy, culture · Technical = infra, hardware, platform · Partnership = collaborations · Safety = alignment/risk)

## 4. Approved Impact Areas
Use only these (this is the site's live filter taxonomy — lawsuits and court rulings map to **Regulation**, not a separate "Legal" area):
Multimodal AI, Language Models, Computer Vision, Market Competition, Robotics, Healthcare, Education, Creator Economy, Public Perception, Ethics, Regulation, Enterprise AI, Open Source, Hardware, Research

## 5. The `layoff_ids` field
Layoff data lives in the standalone dataset `data/layoffs/layoffs.csv` (see `data/layoffs/schema.md`), never nested in events. For events that are primarily AI-attributed workforce reductions, add the row(s) to the dataset first (use the `propose-layoff-entry` skill), then reference them:
```yaml
  layoff_ids: ["google-2023-01"]
```
Each id must exist in `layoffs.csv` — `scripts/validate-yaml.py` enforces this. Omit the field for non-layoff events. The retired nested `layoffs:` block is rejected by the validator.

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

> **Access note (revisit):** these patterns are showing their age. In the 2026-07 backfill, the Substack `site:` searches returned thin results, `getsuperintel.com` only exposed recent archive pages, and Reddit search returned essentially nothing for the target month. Treat this list as a starting point, not a guarantee of coverage — and when curated sources come up empty, that's a signal to widen to first-tier outlets, not to skip verification (§9).

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
Add a `tier:` line right after `date:` only for `major`/`minor` events (e.g. `tier: major`); omit it for the `notable` default. See the `tier` field in section 2.

## 9. Verify before proposing (anti-hallucination)

The self-check in §10 is structural — it mirrors the YAML validator and says nothing about whether the event is *real*. This step does. Web results in this domain include SEO/roundup sites and AI-generated summaries that invent releases, dates, and outcomes, so every kept candidate must clear this before it's written. This is the events-side equivalent of the layoffs sweep's "headlines are leads, memos are evidence."

- **Confirm the event against a primary or reputable source** — a company blog/filing/press release, a court or government document, or a first-tier outlet (Reuters, CNBC, Bloomberg, NYT, AP, or the specialist outlets in §6). A single roundup/SEO blog is not confirmation. Prefer the primary; if it 403s, find a fetchable carrier of the same facts.
- **Verify the date against that source**, not a headline or aggregator, and distinguish when a thing *happened* from when it was *reported* (a threat made in January and revealed in April is an April disclosure of a January action — say so).
- **Check the outcome actually occurred.** "Passed the legislature" ≠ "enacted" (it can be vetoed); "filed suit" ≠ "ruled"; "announced" ≠ "shipped." State the real status.
- **Treat unfamiliar model/product names and version numbers as suspect** until corroborated by the vendor or a first-tier source. Hallucinated releases — a version bump that never shipped, an "Ultra" tier that doesn't exist — are the most common failure here; cross-check the exact name against the vendor's own page.
- **Figures and counts:** confirm against the source; record conflicting numbers side by side, never averaged; never present an analyst estimate as a company-confirmed number.
- **If you can't confirm it, don't propose it — flag it as unverified** for the human, with what you found and what's missing. No fabrication.

Real failures this step is meant to catch (2026-07 backfill): a hallucinated "Gemini 3.1 Ultra" that was never released; a Maine data-center ban reported as enacted when it was actually vetoed; an Apple/Grok App Store threat dated to April that was really made in January.

## 10. Self-check before writing (mirrors `scripts/validate-yaml.py`)

The validator only runs against `data/events.yaml` on merge, not against proposal files — so proposals must be self-checked to the same rules:
- [ ] `title`, `date`, `description` present on every entry
- [ ] `date` parses as ISO 8601 (a trailing `Z` is fine)
- [ ] array fields are lists; no empty `[]` arrays anywhere
- [ ] `layoff_ids`, if present, is a list of ids that exist in `data/layoffs/layoffs.csv`
- [ ] no title duplicates another entry in the batch or in `data/events.yaml`
- [ ] tags and impact_areas are drawn only from the approved lists
- [ ] `tier`, if present, is exactly `major`, `notable`, or `minor` — and is omitted for the notable default (every suggested `major` is flagged for a human)

A quick syntax check on a proposal file: `python -c "import yaml; yaml.safe_load(open('proposals/FILE.yaml'))"`.
