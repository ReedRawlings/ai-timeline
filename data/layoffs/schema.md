# AI-Attributed Layoffs Dataset — Schema

**Status: APPROVED 2026-07-03** (format: CSV). Migration from events.yaml executed same day — 32 rows, all `needs_recode`.

**Scope (decided 2026-07-03):** AI-attributed layoffs only. Non-AI-attributed layoffs are out of scope; any "share of job loss attributable to AI" comparison uses external monthly/quarterly job-loss reports as the denominator, not rows in this dataset.

## Why a standalone dataset

Layoff data currently lives as nested `layoffs:` blocks inside `data/events.yaml` (32 blocks as of 2026-07-03). That structure:

- **Flattens attribution** — a single free-text `reason` field makes attributions the source didn't make (e.g. an entry whose own description says the company framed cuts as pandemic over-hiring, while `reason` says "AI restructuring").
- **Caps coverage at timeline-worthiness** — only notable, press-covered, explicitly-attributed cuts get in, reproducing the selection bias of Challenger/layoffs.fyi.
- **Is ticker-shaped** — private companies, BPOs, and country-split events (e.g. Oracle India) don't fit.

## Proposed row schema (`layoffs.csv`)

| Field | Definition |
|---|---|
| `id` | Stable row id |
| `company` | Canonical company name |
| `ticker` | If public, else null |
| `announcement_date` | ISO date of announcement |
| `effective_date` | If known |
| `count` | Integer; **null if undisclosed** (a guessed number is not a valid value) |
| `count_precision` | `exact` \| `approximate` \| `range_low/range_high` \| `undisclosed` |
| `country` | Primary country of affected workers (one row per country where the split is known) |
| `region_detail` | e.g. "Bengaluru" where reported |
| `sector` | Controlled list, grown as needed: `tech`, `BPO/call center`, `healthcare`, … |
| `ai_attribution` | `explicit_company` \| `press_inferred` \| `analyst_inferred` \| `none_stated` |
| `attribution_quote` | The actual words used, **verbatim, with source** |
| `attribution_notes` | e.g. "restructuring framed as AI-native transformation" |
| `source_url` | Primary source link (required — a number without a link doesn't enter) |
| `source_type` | `company_statement` \| `regulatory_filing` \| `press_report` \| `government_data` |
| `press_independent` | Boolean (WARN / ONS / India Labour Bureau = true) |
| `cross_references` | Other trackers listing this event |
| `verification_status` | `verified` \| `single_source` \| `disputed` \| `needs_recode` (migration-only: row carried over from events.yaml; attribution not yet re-coded from a real quote) |
| `added_date`, `updated_date` | Row lifecycle |
| `notes` | Free text |

## Attribution discipline

"AI-attributed" can mean: company explicitly cited AI; press inferred it; restructuring framed as "AI-native transformation"; or cost-cutting with AI as narrative cover. The dataset records **who made the attribution and in what words** — never a boolean. When sources conflict, both are recorded with the conflict visible; never averaged.

## Remaining open scope decisions (human)

1. **Date floor** — 2022-11 (ChatGPT launch)? Earlier?
2. **Count threshold** — any minimum, or none?

Resolved 2026-07-03: non-AI-attributed layoffs are **out** (external job-loss reports serve as the comparison denominator); no layoffs work exists outside this repo; CSV is the format.

## Migration (executed 2026-07-03)

`scripts/migrate-layoffs.js` (one-time, kept for the record) extracted the 32 `layoffs:` blocks from `events.yaml` into `layoffs.csv`. Each event's `link` became `source_url`; timeline events keep their narrative entries and reference rows via `layoff_ids: [...]` (enforced by `scripts/validate-yaml.py`). Every migrated row is `needs_recode`: the legacy free-text `reason` label was carried into `attribution_notes`, and none of those labels map to the `ai_attribution` enum — each row needs a human-reviewed recode with a verbatim quote and source.

The chart (`src/js/layoff-chart.js`) reads the dataset via `scripts/build-layoffs.js` (CSV → `src/data/layoffs.json` at build time). Rows without a disclosed count (`count` empty = undisclosed) stay in the dataset but are excluded from the chart.

## Next step before any automated ingestion

NewsAPI.ai "Layoffs" event-type test (known cases: Oracle, Salesforce, Cisco) runs and gets written up in `README.md` **before** any automated ingestion is built.
