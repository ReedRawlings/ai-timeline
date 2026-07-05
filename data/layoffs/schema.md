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
| `count_scope` | What the count covers: `global` \| `country` (only the row's country) \| `unknown`. Tracks global vs US-only jobs lost — this dataset is NOT US-only (unlike e.g. jobloss.ai) |
| `country` | Primary country of affected workers (one row per country where the split is known) |
| `region_detail` | e.g. "Bengaluru" where reported |
| `sector` | Controlled list, grown as needed: `tech`, `edtech`, `fintech`, `media`, `BPO/call center`, `healthcare`, … |
| `ai_attribution` | WHO made the AI link: `explicit_company` \| `press_inferred` \| `analyst_inferred` \| `none_stated` |
| `causal_link` | HOW strong the stated link is: `sole` (AI cited as the driver) \| `mixed` (AI alongside other material factors) \| `contextual` (AI named as backdrop/strategic destination, not cause). Modeled on jobloss.ai's Explicit/Reported/Mixed evidence levels (2026-07-03), but as a second axis so who-said-it and how-causal stay separate |
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

## Boundary cases (precedents, decided 2026-07-03)

- **AI-attributed attrition/hiring freezes** (Klarna): in scope when the company explicitly credits AI for the workforce reduction, but `count` stays empty (undisclosed) — there is no layoff count, and the mechanism is spelled out in `notes`. Marketing claims ("our AI does the work of 700 agents") never become counts.
- **AI-attributed projections** (IBM 2023: "30% of ~26,000 could be replaced in five years"): row kept for the attribution, `count` empty — a projection is not a layoff count. The chart excludes count-less rows automatically.
- **No AI attribution from anyone** (Tesla 2024, Intel 2024/2025, UPS 2024, Amazon Jan 2023, …): out of scope, removed 2026-07-03. Real layoffs, but this tracker records attributions, and none existed.
- **Voluntary buyout / early-retirement programs without company AI attribution** (Microsoft, Apr 2026): out of scope, decided 2026-07-04. Microsoft's ~8,750-eligible buyout was framed by the company as a retirement *benefit*; no executive tied it to AI, and the circulating Nadella "platform shift… reshaping how we are structured" quote was actually from the **July 2025** layoffs (quote drift — see the `find-ai-layoffs-monthly` rejection patterns). A buyout eligibility pool is also not a layoff count. Watch for this: the AI framing here was entirely press context.
- **Analyst/press headcount estimates are not a `count`** (Oracle, Cognizant, 2026): decided 2026-07-04. Oracle's "up to 30,000" (a TD Cowen estimate) and Cognizant's "7,000–15,000" (Business Standard math off the severance budget) are guesses, not company figures — `count` stays undisclosed. Oracle's audited ~21,000 is a *full-fiscal-year* figure across multiple rounds, a different scope from the March 31 event; record it in notes, don't launder it into the event row. Reaffirms the no-guess rule.
- **AI as investment destination vs. cause** (Cognizant "Project Leap", Apr 2026): in scope as `explicit_company` (the company named AI) but `causal_link: contextual` — the savings *fund* AI investment; AI is where the money goes, not the stated reason the roles were cut. Count undisclosed (company disclosed a severance charge, no headcount; reported quarterly headcount actually rose). Distinguish this from AI *causing* the reduction (which would be `sole`/`mixed`).

## Next step before any automated ingestion

NewsAPI.ai "Layoffs" event-type test (known cases: Oracle, Salesforce, Cisco) runs and gets written up in `README.md` **before** any automated ingestion is built.
