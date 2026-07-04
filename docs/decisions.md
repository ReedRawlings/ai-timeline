# Decision Log

Append-only. Format: `date | decision | reasoning`. New decisions go at the bottom. Never edit or delete existing rows — if a decision is reversed, append the reversal as a new row.

| Date | Decision | Reasoning |
|---|---|---|
| ~2026-06-07 | Studies treated as discourse objects, not ground truth | Most ran on obsolete models; conditions get stripped in circulation |
| ~2026-06-22 | Chat context doesn't transfer between tools; handoff docs are the mechanism | — |
| 2026-06-28 | The most valuable artifacts are maintained data assets, not one-time writeups | Citations rot; maintained tables don't |
| 2026-06-28 | Build sequence: stat provenance register first (cheap, disciplines everything), then layoffs + environmental ledger as flagship tables | Register is the meta-asset that makes the others trustworthy |
| 2026-07-01 | Media coverage (NewsAPI.ai) runs as a separate "Media Narrative Index," never blended into any backlash composite; GDELT deferred | Media volume measures editorial/PR decisions, not public sentiment; per-theme directional biases identified |
| 2026-07-01 | GDELT usable only as raw corpus/volume signal, not pre-coded sentiment or events | Dictionary-based tone scoring, CAMEO taxonomy mismatch, syndication duplication |
| 2026-07-03 | All assets are public | — |
| 2026-07-03 | Public ≠ polished; don't overindex on polish | — |
| 2026-07-03 | Building our own layoffs dataset rather than relying on Challenger/layoffs.fyi | Existing trackers are US/tech-centric, press-derived, and structurally undercount India/Global South |
| 2026-07-03 | WIP cap: two active builds (layoffs dataset + provenance register); everything else parked with re-entry points | Too many spec'd-not-built threads; losing track |
| 2026-07-03 | Single repo (`ai-timeline`) becomes the home for the whole project: datasets, docs, decision log, site | Consolidation away from scattered chats; repo is the shared context across machines/tools |
| 2026-07-03 | Datasets live as standalone files with their own schemas; the timeline references dataset rows, never the reverse | Keeping layoff data inside events.yaml inherits the timeline's significance rubric and rebuilds Challenger's selection bias |
| 2026-07-03 | Refactor the existing `layoffs:` blocks out of events.yaml into the standalone dataset | Nested blocks flatten attribution and cap coverage at timeline-worthiness |
| 2026-07-03 | Assets organized into five themes (labor, data centers, sentiment & discourse, claims & verification, cultural record); some assets are sub-components, not standalone | Flat list of ~12 assets was untrackable |
| 2026-07-03 | Data center project-level outcomes is a sub-table of the buildout tracker, same asset class (projected project → outcome) | Same underlying entities; joining them makes announced-vs-built visible |
| 2026-07-03 | Provenance register follows the fact-check-site model: per-claim research, stable permalink-able row IDs | Register is meant to be citable claim-by-claim |
| 2026-07-03 | Environmental disclosure ledger reparented under claims & verification as a shelf of the register | Same conditions-preserving structure |
| 2026-07-03 | BLS added as the employment-actuals source for the labor theme | Press-independent realized-headcount layer completing predictions vs. announcements vs. actuals |
| 2026-07-03 | Update-grief event log is explicitly low priority | Unclear measurement approach for the reaction layer; events-only core noted for later |
| 2026-07-03 | Provenance register stored as CSV (`data/provenance/register.csv`), not YAML | Tabular, one-row-per-claim data; matches the layoffs dataset convention (CSV); YAML stays for timeline events. Flagged for human veto — see docs/master-status.md |
| 2026-07-03 | Vercel deploys skipped for commits touching only `docs/`, `data/provenance/`, `data/layoffs/` via `ignoreCommand` in vercel.json | Docs/dataset commits don't change the built site; verified against current Vercel docs (exit 0 = skip, exit 1 = build) |
| 2026-07-03 | Layoffs dataset scope: AI-attributed layoffs only; non-AI-attributed layoffs are out | For share-of-job-loss comparisons, external monthly/quarterly job-loss reports (e.g. Challenger) serve as the denominator instead of tracking non-AI rows ourselves |
| 2026-07-03 | No layoffs work exists outside this repo; the handoff's reconciliation step is moot | Human confirmed directly |
| 2026-07-03 | Layoffs dataset format: CSV (`data/layoffs/layoffs.csv`) | Flat tabular rows; YAML adds nothing here |
| 2026-07-03 | events.yaml is the source of truth for the migration count: 32 `layoffs:` blocks, not the handoff's ~16 estimate | The handoff's number was an estimate from memory; the repo is the source data |
| 2026-07-03 | Layoffs schema approved; migration executed (32 rows, all `needs_recode`); `layoffs:` blocks retired from events.yaml in favor of `layoff_ids` references | Every migrated row needs a human-reviewed attribution recode with a verbatim quote before it counts as coded data |
