# Parked Assets

The detail file for everything in state `Parked` (the registry of ALL artifacts, with states, is `docs/master-status.md`). Organized by the five themes (decided 2026-07-03).

**Stanza format (decided 2026-07-05)** — each parked asset carries: *what it is* (2–4 sentences), *why it's parked* (usually the WIP cap, sometimes a blocking decision), *re-entry condition* (what "ready to start" looks like), and a *PRD pointer if one exists*. A PRD is not required to park something — it's the ticket out: nothing moves to Development without one (or an equivalent schema/spec). Unparking = a decision-log entry + state change in master-status.

---

## Theme 1 — Labor

**Exposure indices** — Occupation → exposure estimate → study → year → model. Because each study is date/model-stamped, this becomes the retrospective "where did we really end up" layer against actuals. Standing warning: exposure ≠ automatability ≠ job loss; never blended into layoff counts. *Re-entry:* after the layoffs dataset is stable; ready when a schema draft exists for study-level rows and the layoffs dataset has enough coverage to compare against.

**Employment actuals (BLS layer)** — Occupational employment over time; press-independent, completing the theme's three-leg comparison: predictions (exposure) vs. announcements (layoffs) vs. realized headcount change. Candidate programs: OEWS (occupation-level counts), CES (sector payrolls), JOLTS (separations) — verify current program names/coverage before building. *Re-entry:* after the layoffs dataset is stable; ready when the candidate BLS programs have been verified and a join key to the layoffs data is designed.

## Theme 2 — Data centers

**Legislation/resistance tracker** — PRD exists: `docs/prds/data-center-tracker-prd.md` (v0.3 — scope settled: neutral for-and-against ledger, US-only, 2022-forward, MW common metric, no capacity floor, weekly LLM scan + human verification). Differentiated angle: exposing the definitional collapse in "moratorium" counts. *Re-entry:* blocked by the WIP cap, plus one confirmation flagged in PRD §8 (adopt LegiScan/state-legislature sites as the state-bill source). Ready when a build slot opens and the collection-workflow doc (PRD §11) is written.

**Buildout tracker (incl. project-level outcomes sub-table)** — What's actually being built, expanded, or repurposed; outcomes sub-table joins projected project → what happened, making announced-vs-built visible and enabling the overlay against legislation. No PRD yet. *Re-entry:* PRD first; ready when its PRD is red-lined and a build slot opens.

**Anecdotes** — Notable individual cases (e.g. a moratorium blocking one size class while larger projects proceed nearby). Explicitly deferred. *Re-entry:* naturally seeded by rows in the other two data-center assets; no independent start condition.

## Theme 3 — Sentiment & discourse

**Backlash tracker** — Four sub-themes (creative/identity, distrust of AI companies, labor displacement, data center opposition); sources chosen: Reddit (Arctic Shift), HN (Algolia), Bluesky firehose, state environmental dockets, municipal meeting transcripts, self-administered surveys. *Re-entry:* blocked by the WIP cap and by open items in the media-coverage PRD §7 (classifier validation set, escalation-flag definition, NewsAPI.ai cost estimate). Ready when a build slot opens and the classifier validation set is designed.

**Media Narrative Index** — PRD exists: `docs/prds/media-coverage-layer-prd.md`. NewsAPI.ai event-level pipeline measuring editorial/PR attention; **never blended into any backlash composite** (decided 2026-07-01); used for discovery and escalation flags. GDELT deferred. *Re-entry:* built alongside or after the backlash tracker, never before it — it's a covariate layer with nothing to be a covariate *of* until the grassroots signals exist. The NewsAPI.ai cost estimate (PRD §7.4) is the first concrete step.

*(Adoption/usage panel moved to Development 2026-07-07 — see master-status W3; stanza retired per the parked-assets-only convention.)*

## Theme 4 — Claims & verification

**Environmental disclosure ledger** — Conditions-preserving table of published per-prompt energy/water figures. Reparented (2026-07-03) as a specialized shelf of claims-and-verification — now the AI Claims Repository (which absorbed the provenance register 2026-07-05; per-prompt energy/water referents already seeded: REF-GOOGLE-GEMINI-FOOTPRINT, REF-OPENAI-PERQUERY). *Re-entry:* grows naturally as the repository accumulates energy/water rows; ready when they're numerous enough to warrant their own table view. (Since 2026-07-06 the repository has a site display surface — `claims.html` + per-claim dossier pages, incl. the C028b water dossier — so the eventual "own table view" is now a page variant, not a new surface; see master-status W6.)

**Prediction accountability tracker** (added 2026-07-04) — The forward-looking twin of the claims-verification work (AI Claims Repository): confident public predictions about AI from influencers and posters, tracked to resolution. Likely shape: a single page accepting submissions, each claim tied to the link or video where it was stated, with an Internet Archive / Wayback Machine snapshot captured at entry time so the claim survives deletion (same link-rot defense as the register's primary-source rule). Per-claim: verbatim quote, who, where, date, what would falsify/confirm it, resolution status (pending / borne out / not borne out / too vague to resolve), and the resolution evidence. Scope (decided 2026-07-04): **all AI-related predictions, deliberately unskewed** — optimist and pessimist calls alike — including predictions about LLMs/model capabilities, data centers and infrastructure, and economic changes and impacts. Remaining design landmines for the PRD: vague predictions that can't be scored ("too vague to resolve" must be a first-class outcome, not a silent drop), and submission moderation (public submissions need a human gate, same flag-don't-decide pattern as everything else). *Re-entry:* blocked by the WIP cap; needs a short PRD settling the submission/moderation flow and resolution criteria. The archive-at-entry mechanic is worth adopting register-wide whenever this starts. **Overlap note (2026-07-07):** the claim-dossier system now covers part of this asset's intended shape for high-profile predictions — the C001 dossier (Amodei entry-level) is a prediction tracked with verbatim wording, named counterpoints, and explicit what-would-resolve-it criteria under the `premature` grade. The PRD should decide what remains distinct here (public submissions, breadth beyond high-circulation claims, resolution workflow at scale, archive-at-entry) vs. what the Claims Repository + dossiers already handle.

## Theme 5 — Cultural record

**Update-grief event log** — Dated deprecation/feature-removal events (verifiable facts) plus archived-thread links for the reaction layer — not grief measurement. **Explicitly low priority** (2026-07-03). *Re-entry:* only if the measurement approach for the reaction layer gets resolved; events-only core is the fallback shape if ever started.
