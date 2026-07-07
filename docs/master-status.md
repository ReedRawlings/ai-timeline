# Master Status — AI Research & Data Assets Project — 2026-07-06

*The registry of every artifact this project wants to create, each with a state. Update when an artifact changes state; reviewed at the end of every working session (along with `decisions.md`).*

**How tracking works (decided 2026-07-05):**
- **States:** `Parked` (not in development yet — one line here, full stanza in `docs/parked.md`) → `Development` (actively being built) → `Deployed` (live; gets a **Maintenance** line with update cadence: Daily / Weekly / Monthly / None).
- **One home per detail:** state lives here; why-we-decided lives in `docs/decisions.md` (append-only working memory); operational detail lives in the asset's own README/schema/PRD — this file links, it doesn't restate.
- **New artifacts get an entry here when created** — plus a parked.md stanza if they can't be worked on yet. A PRD is not required to park something; it's the ticket *out* of parked (nothing goes to Development without one, or an equivalent schema/spec).

## The one-sentence version

A public research project on how AI is changing people and society, with two mutually reinforcing halves: **an argumentative essay series** ("The Mind on LLMs") and **a set of maintained, source-transparent data assets** that give the series an empirical spine and stand alone as public reference material.

**Global decision (2026-07-03):** All assets will be public. Polish is not a requirement — transparency and maintenance are.

---

## Workstream 1 — The Mind on LLMs (essay series)

**State: Development** (framework locked, not yet drafting — lives in claude.ai project knowledge, not this repo).

**Decided:** Three sites of change (mind alone / self↔tool / self↔others); cognitive surrender as series anchor; dose/scale/loop-position as the sign-flipping axes; Gwern↔Mollick as the prescriptive foil (full detail: `llm-mind-framework.md` in project knowledge). Opens with a manifesto post, then cognitive offloading. Studies are discourse objects, not ground truth.

**Open:** voice register (personal vs. analytic — the blocking decision); citation verification pass; post-count merges (01+05 recommended; 02+03 couple, don't merge); belief distortion callout vs. own post.

**Artifacts:** framework doc (project knowledge); seven standalone article drafts; unknown-unknowns research prompt.

---

## Workstream 2 — Alignment chart (distribution/meme artifact)

**State: Development** (content complete; distribution not started).

**Decided:** Nine archetypes finalized; definitional register; skill axis folded into prose notes on two cells; intentionally non-definitive.

**Open:** subreddit rules/culture check before posting; Reddit + X static grid first as validation before any TikTok investment.

---

## Workstream 3 — Sentiment & discourse

- **Backlash tracker** — **State: Parked** → parked.md. Sources chosen, media boundary spec'd (`docs/prds/media-coverage-layer-prd.md`).
- **Media Narrative Index** — **State: Parked** → parked.md. Never blended into any backlash composite (2026-07-01).
- **Adoption/usage panel** — **State: Parked** → parked.md. Cheap and self-contained; good candidate for the next open build slot.

---

## Workstream 4 — Data centers

- **Legislation tracker** — **State: Parked** → parked.md. PRD v0.3 written (`docs/prds/data-center-tracker-prd.md`); scope settled; open: sub-hyperscale threshold, for/against weighting, LegiScan confirmation (PRD §8).
- **Buildout tracker (incl. project-level outcomes sub-table)** — **State: Parked** → parked.md. No PRD yet.
- **Anecdotes** — **State: Parked** → parked.md.

---

## Workstream 5 — Labor

- **AI-attributed layoffs dataset** (`data/layoffs/`) — **State: Deployed.** 30 attribution-coded rows as of 2026-07-06 (32 migrated → recode removed 11 → backfills through May 2026 added more; June 2026 sweep added no new rows but upgraded `oracle-2026-03` with the June 23 10-K explicit-AI quote → explicit_company/mixed); every row coded from primary language with verbatim quotes; evidence tags (`ai_attribution` × `causal_link`, `count_scope`, sector). Feeds the site's Layoffs page. Detail: `data/layoffs/README.md` + `schema.md`.
  **Maintenance: Monthly** (`find-ai-layoffs-monthly` sweep; headline-vs-memo verification discipline).
  **Open:** NewsAPI.ai "Layoffs" event-type test before any automated ingestion; count-threshold scope call; whether Challenger/layoffs.fyi serve as denominator for the backlash tracker's labor theme.
- **Exposure indices** — **State: Parked** → parked.md.
- **Employment actuals (BLS layer)** — **State: Parked** → parked.md.

---

## Workstream 6 — Claims & verification

- **AI Claims Repository** (`data/claims/`, moved from `docs/Claims/` 2026-07-06) — **State: Development** (human-built, added 2026-07-05). Two related tables: `referents.csv` (44 underlying facts with authoritative statements) + `claims.csv` (51 claim variants, `as-made` vs `circulating`, accuracy-graded against their referent). **Absorbed the stat provenance register (merged 2026-07-05)** — its four deep-researched rows entered as new/enriched referents with as-made + circulating claim pairs (ID map in the decision log); `data/provenance/` and its validator/skill are retired, replaced by `propose-claim-entry`. Detail: `data/claims/README.md`.
  **Display surface (2026-07-06):** the site's Claims page (`claims.html`) — index + detail anchors, every REF-*/C* ID permalink-able, grades in hover popovers, diffuse claimants badged DIFFUSE with the referent's `references` rendered as visible "Related statements" (resolves `docs/prds/claims-proponent-display-prd.md`). Page re-renders from the CSVs at each deploy; claims commits deploy (no longer under the docs/ deploy-skip).
  **Maintenance: None** (rows added ad hoc via `propose-claim-entry`; deep-research verification per claim; `scripts/validate-claims.py` in CI guards integrity).
  **Open:** the "claim-analysis skill" its README cites lives in project knowledge, not this repo. *(Resolved 2026-07-06: validation script ✓; moved to `data/` ✓; display surface ✓; proponent display ✓.)*
- **Prediction accountability tracker** — **State: Parked** → parked.md. Scope decided 2026-07-04 (all AI predictions, unskewed; LLM/infra/economic). Overlaps the Claims Repository's `premature` rating — resolve at PRD time.
- **Environmental disclosure ledger** — **State: Parked** → parked.md. A shelf of the Claims Repository (per-prompt energy/water referents already seeded: REF-GOOGLE-GEMINI-FOOTPRINT, REF-OPENAI-PERQUERY).
- **Update-grief event log** — **State: Parked** → parked.md. Explicitly low priority.

---

## Workstream 7 — AI timeline site ("The AI Record")

**State: Deployed.** Four-page Vite app on Vercel: Timeline (Atlas + Dispatch view), Layoffs, Stocks, Claims (added 2026-07-06; renders `data/claims/`). 335 events in `data/events.yaml` as of 2026-07-06 (June 2026 pass complete; +21 events, spine = the government frontier-model access crisis). Event skills carry an adversarial verification step and a range/backfill skill after the 2026-07-04 backfill let hallucinated/mis-dated items through; curated sources are a reported gate (2026-07-05).
**Maintenance: Daily** (event sweeps via `find-ai-events-*` skills; layoffs page refreshes with the dataset's monthly sweep; stock data self-updates at build + `/api/stocks`).

**Open:**
- Prune the 7 flagged `major`s from the backfill to taste.
- Whether to rename the repo as scope outgrows "ai-timeline" (cosmetic; deferred).

**Supporting docs:** `docs/event-search-methodology.md` (append-only change log of how event-finding evolves); `docs/superpowers/specs/` (implementation specs, e.g. the shipped Atlas + Dispatch redesign).

---

## Cross-cutting open items

1. Per-chat synthesis pass so each conversation leaves a durable context doc — not yet done for any chat.
2. WIP-cap accounting: the cap is two active dataset builds; layoffs is Deployed and the Claims Repository (register absorbed) is the one asset in Development — within cap, but confirm the cap's meaning now that assets graduate to maintained.
3. Where the public assets live long-term (repo structure, publishing surface) — undecided. (The claims display-surface sub-question resolved 2026-07-06: it lives on the site as `claims.html`.)
