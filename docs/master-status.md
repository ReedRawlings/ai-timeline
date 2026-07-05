# Master Status — AI Research & Data Assets Project — 2026-07-04

*Single source of truth for what exists, what's decided, and what's open. Update this doc when a workstream changes state; don't let it drift more than ~2 weeks stale.*

## The one-sentence version

A public research project on how AI is changing people and society, with two mutually reinforcing halves: **an argumentative essay series** ("The Mind on LLMs") and **a set of maintained, source-transparent data assets** that give the series an empirical spine and stand alone as public reference material.

**Global decision (2026-07-03):** All assets will be public. Polish is not a requirement — transparency and maintenance are.

---

## Workstream 1 — The Mind on LLMs (essay series)

**State:** Framework locked. Not yet drafting.

**Decided:**
- Three sites of change (mind alone / self↔tool / self↔others); cognitive surrender as series anchor; dose/scale/loop-position as the sign-flipping axes; Gwern↔Mollick as the prescriptive foil. (Full detail: `llm-mind-framework.md` in project knowledge.)
- Series opens with a manifesto post (prior tech panics, honest dual-sided frame), then cognitive offloading as first phenomenon post.
- Studies are discourse objects, not ground truth. No standing to define wasted time. Avoid moral panic.

**Open:**
- Voice register (personal vs. analytic) — the blocking decision before drafting.
- Citation verification pass (update-grief arXiv IDs, quotes gathered under rate-limiting).
- Post-count merges: 01+05 merge recommended; 02+03 couple, don't merge; authenticity-vertigo halves and attention-vampires pairing TBD.
- Belief distortion: callout vs. own post.

**Artifacts:** framework doc (project knowledge); seven standalone article drafts (from the adoption-curves chat); unknown-unknowns research prompt.

---

## Workstream 2 — Alignment chart (distribution/meme artifact)

**State:** Content complete. Distribution not started.

**Decided:** Nine archetypes finalized; definitional register (recognizable, not editorializing); skill axis folded into prose notes on two cells; intentionally non-definitive.

**Open:** Check subreddit rules/culture before posting; Reddit + X static grid first as validation before any TikTok investment.

---

## Workstream 3 — Backlash / sentiment tracker

**State:** Sources chosen, media layer spec'd via PRD. Not built.

**Decided:**
- Four themes: creative/identity concerns, distrust of AI companies, labor displacement, data center opposition.
- Primary sources: state environmental dockets, municipal meeting transcripts, Reddit (Arctic Shift), HN (Algolia), Bluesky (AT Protocol firehose), self-administered surveys.
- Media coverage (NewsAPI.ai) runs as a **separate Media Narrative Index**, never blended into the backlash composite. GDELT deferred. Event-level counting, normalization against total AI-news volume, external denominator for the labor theme. (Full detail: media-coverage-layer PRD.)
- Artifact types sketched: trend lines, share of voice, exemplar quotes, flashpoint case studies, bottom-up language taxonomy, cross-source register comparison. **Audience resolved: public.**

**Open (from PRD §7):** classifier validation set; escalation-flag operational definition; NewsAPI.ai cost estimate; RSS trade-press curation; historical backfill window; whether to reintroduce GDELT later.

---

## Workstream 4 — Data center resistance tracker

**State:** PRD v0.3 written (`docs/prds/data-center-tracker-prd.md`). Not built.

**Decided:** Scoped to resistance asset only; siblings (footprint growth, buildout & conversions, project-level outcomes, anecdotes) get their own PRDs later. For *and* against measures are co-equal entries. MW as common metric. US-only. Weekly LLM scan + human verification. Differentiated cut = the definitional landmine (a "moratorium" count collapses permanent bans, zoning freezes, and non-binding resolutions).

**Open (consequential):** size/threshold scope (sub-hyperscale in or out); for/against weighting (whether permissive measures are truly co-equal or context).

---

## Workstream 5 — AI-attributed layoffs dataset

**State:** Building our own dataset (decided 2026-07-03), in the `ai-timeline` repo (`data/layoffs/`). Schema approved; 32 rows migrated and attribution-recoded 2026-07-03 (11 removed for no AI attribution from anyone). **2026-07-04:** April 2026 + March 20–31 backfill added 4 rows (Snap, Meta, Cognizant, Oracle) → **25 rows**; Microsoft (Apr buyout) and Pendo (Apr) evaluated and excluded (no / insufficient company AI attribution). New boundary precedents recorded in `schema.md` (voluntary buyouts out; analyst-estimate counts stay undisclosed; "AI as investment destination" = contextual).

**Decided:** Existing trackers (Challenger, layoffs.fyi) are US/tech-centric and press-derived; India/Global South structurally undercounted. UK ONS and India Labour Bureau are the only press-independent verification sources. Cross-checking against other trackers validates extraction, not coverage — the never-covered gap is structural.

**Open:** test NewsAPI.ai's Layoffs event type against known cases (Oracle, Salesforce, Cisco) before committing; schema; whether Challenger/layoffs.fyi serve as denominator for the backlash tracker's labor theme.

---

## Workstream 6 — Meta-assets (from the artifacts review)

**State:** Recommended, not started.

- **Stat provenance register** — living table: viral number → primary source → stripped conditions → verification status. Recommended build-first (cheap, disciplines everything else). First rows: "500ml water," AI-layoff counts.
- **Environmental disclosure ledger** — conditions-preserving table of per-prompt energy/water figures (Google 0.24/0.10 Wh comprehensive vs. not; OpenAI 0.34 Wh mean).
- **Update-grief event log** — dated deprecation events + documented community reaction; empirical backbone for the series' strongest new phenomenon.
- **Adoption/usage panel** — quarterly, survey disagreement kept visible.
- **Prediction accountability tracker** (added 2026-07-04) — influencer/poster AI predictions tracked to resolution; single page with submissions, each claim tied to its source link/video, Wayback/Internet Archive snapshot at entry for posterity. Parked; needs a short PRD (inclusion criteria, moderation flow). See docs/parked.md Theme 4.

---

## Workstream 7 — AI timeline project

**State:** Live site, ongoing maintenance. As of 2026-07-03, the `ai-timeline` repo is also the home of the whole project (datasets, docs, decision log — see decision log).

**Decided:**
- Vite vanilla-JS SPA on Vercel; events in `data/events.yaml` (**288 events** as of 2026-07-04, after backfilling April 2026 + the March 20–31 gap); stock chart with event markers; event-proposal skills in `.claude/skills/` with a shared significance rubric.
- Event skills now carry an adversarial **verification step** (`event-conventions.md` §9) and a range/backfill skill (`find-ai-events-range`), added 2026-07-04 after the backfill's first pass let through a hallucinated model release, a vetoed-not-enacted law framed as enacted, and a mis-dated event. Tier rule tightened: routine model releases are never `major`.
- Docs layer established in-repo (2026-07-03): `docs/master-status.md` (this file), `docs/decisions.md`, `docs/prds/`. Commits touching only docs/datasets skip Vercel deploys.
- Provenance register scaffolded at `data/provenance/register.csv` (4 seed rows, all `pending` — verification not yet done). Layoffs dataset live at `data/layoffs/layoffs.csv` (schema approved 2026-07-03; 32 rows migrated out of events.yaml, which now uses `layoff_ids` references; all rows pending attribution recode).

**Open:**
- Layoffs attribution recode pass: **done** (2026-07-03). Ongoing: keep new rows coded from primary language via `find-ai-layoffs-monthly`.
- Remaining layoffs scope decisions: date floor, count threshold.
- Provenance register: the four seed rows are `pending` until their primary sources are fetched and verified.
- Timeline follow-ups from the 2026-07-04 backfill: prune the 7 flagged `major`s to taste; run the **May pass** (incl. the held Anthropic $65B Series H, date-conflicted Apr 21 vs May 28); merged changes to `data/` are committed-but-unpushed pending review.
- Whether to rename the repo as scope outgrows "ai-timeline" (cosmetic; deferred).

---

## Cross-cutting open items

1. Run the per-chat synthesis pass (the reusable prompt from the Cowork-migration chat) so each conversation leaves a durable context doc — not yet done for any chat.
2. Sequencing across workstreams (see recommendation in chat, 2026-07-03: provenance register → layoffs + data center trackers → sentiment pipeline).
3. Where the public assets live (repo structure, publishing surface) — undecided.
