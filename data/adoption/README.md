# Adoption/Usage Panel

A maintained, conditions-preserving register of what recurring, methodologically documented surveys report about generative-AI / AI usage. **Survey disagreement stays visible — nothing is averaged, blended, or spliced.** The panel is the empirical brake on inferring prevalence from discourse volume.

Governing docs: `docs/prds/adoption-usage-panel-prd.md` (design + inclusion criteria) and `docs/prds/adoption-usage-panel-recon.md` (the verified source record every row traces to). Standing project rules apply: no fabrication; publisher-primary sources only; "pending"/"undisclosed" beat a guess; wording differences are the point, never paper over them.

## Why the numbers disagree (the point of this dataset)

As of early/mid-2026, defensible published estimates of "AI adoption" span ~13% to ~62% because population, construct, recall window, and frequency threshold differ: BTOS ~19.8% of employer businesses (two-week window), Gallup 28% of employees (weekly+ at work) or 50% (yearly+), Pew 49% of adults (ever use a chatbot), RPS 61.8% of adults 18–64 (uses genAI). Each row preserves the conditions that explain its number.

## Files

### `questions.csv` — one row per question **version**

A question version = a unique combination of survey, wording, and base. A wording change creates a new row linked via `supersedes`/`superseded_by` — breaks are never spliced.

| Field | Rule |
|---|---|
| `question_id` | PK, kebab-case |
| `survey_id` | One of: `pew-atp`, `pew-atp-workers`, `gallup-wf`, `btos`, `rps` (registry below) |
| `wording_verbatim` | Exact published text. Required when `wording_status=published`; empty otherwise |
| `wording_status` | `published` / `paraphrased` / `unpublished` |
| `publisher_definition` | Publisher's own verbatim definition when the stem isn't published (Gallup rows) or a measure is derived |
| `construct` | `ai_broad` / `generative_ai` / `ai_chatbot` / `brand_specific` |
| `concept` | `ever_use` / `current_use` / `frequency` / `work_use` / `intended_use` / `org_adoption` |
| `base_population` | Who was asked, in words |
| `response_options` | Published option list |
| `first_fielded` / `last_fielded` | `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`; `last_fielded` empty while active |
| `supersedes` / `superseded_by` | question_id links across wording breaks |
| `break_note` | What changed, with the publisher's own comparability statement |
| `source_url` | Where the wording/definition was verified |

### `estimates.csv` — one row per survey × wave × question

| Field | Rule |
|---|---|
| `estimate_id` | PK |
| `question_id` | FK into questions.csv |
| `wave_label` | Publisher's own wave label |
| `field_start` / `field_end` | As published; empty = pending |
| `value` | Publisher-stated headline share (percent). Never derived, never read off a chart. Empty only when the item is distribution-only (then `distribution` required) |
| `value_base` | Base of the published number (e.g. `all_adults`, `aware_form1`, `employed`, `employed_users`, `businesses`, `businesses_employment_weighted`, `adults_18_64`). Free text for now — controlled vocabulary deferred until rows stabilize (decision 2026-07-07) |
| `distribution` | JSON of the full published response distribution, when published |
| `n` / `moe` | As published; empty = not published for that row |
| `comparability_flag` | `none` / `new_series` / `rebased` / `base_change` / `publisher_break_note` |
| `publication_url` | Direct link to the topline/PDF/page carrying the number |
| `retrieved_date` | When we verified it |
| `notes` | Conditions that fit nowhere else, in the publisher's words where possible |

Validation: `python scripts/validate-adoption.py` (in CI).

## Survey registry (v1 core — see recon doc for full profiles)

| survey_id | Instrument | Population | Cadence |
|---|---|---|---|
| `pew-atp` | Pew American Trends Panel (probability panel, topline PDFs carry verbatim wording) | US adults, n≈5,000–10,700/wave | ~Annual |
| `pew-atp-workers` | Pew ATP workers series (W157/W178) | Employed US adults | ~Annual |
| `gallup-wf` | Gallup Panel Workforce Study (stems unpublished — rows carry Gallup's published definitions; MOE ±0.9–1.1 across waves) | US employees 18+, n≈19k–24k/wave | Quarterly since Q2 2025 (annual before) |
| `btos` | Census Business Trends and Outlook Survey, AI items (OMB 0607-1022) | US employer businesses excl. farms | Biweekly (panel ingests published national points; batch-entered quarterly) |
| `rps` | Real-Time Population Survey genAI module / GenAI Adoption Tracker (Bick–Blandin–Deming) | US adults 18–64 (weighted online panel; Walmart-funded, disclosed) | Quarterly since Aug 2024 |

## Update cadence

**Quarterly sweep**: new waves from the five survey_ids; questionnaire diff against `questions.csv` (wording/base changes → new question rows); candidate-promotion checks (SHED on ≥2-waves verification; BTOS biweekly backfill; Eurostat if scope opens — see PRD §8.7). Living pages (Gallup Indicator, genaiadoptiontracker.com) should be archived at entry — Wayback is blocked from the build harness, so snapshots are a human/browser step (decision 2026-07-07).

## Known gaps / backfill queue (v1 seed shipped 2026-07-07)

1. BTOS biweekly point-by-point series (both wording regimes) — download portal is JS-gated; needs a browser session. Seed carries published anchor points only.
2. Gallup verbatim stem — best lead: OCR/browser pass on the image-locked "Workplace Q4 Topline AI Trends" PDF. Also pre-2026 org-integration values.
3. RPS post-2024 wave field dates (tracker pools 8 waves; only 2024 waves dated in the paper).
4. Pew purpose batteries (CHATWHY1: medical advice, companionship, etc.) and teens/students series — deferred v1 scope decisions, not gaps.
5. SHED: verbatim items + microdata URLs captured in the recon doc; enters `questions.csv`/`estimates.csv` when the ≥2-waves check passes (2024 questionnaire unverified).
