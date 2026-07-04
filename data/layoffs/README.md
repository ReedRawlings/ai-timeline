# AI-Attributed Layoffs Dataset

**Status: live.** Schema approved and attribution recode pass completed 2026-07-03 ([schema.md](schema.md)). `layoffs.csv` holds 21 rows, each coded from fetched sources with a verbatim quote (or a documented reason none exists). Of the 32 originally migrated rows, 11 were removed because no one — company, press, or analyst — actually attributed the cuts to AI (see decision log).

## What this is

A maintained dataset of AI-attributed layoff events where the attribution is a **coded, sourced field** — recording who attributed the cuts to AI and in what words — rather than a filter or a boolean.

**Scope:** AI-attributed layoffs only (decided 2026-07-03). For "what share of overall job loss is attributed to AI" comparisons, external monthly/quarterly job-loss reports (e.g. Challenger) serve as the denominator; non-AI-attributed layoffs do not get rows here.

**Geography: global, deliberately.** US-only coverage is a limitation of existing trackers (jobloss.ai, Challenger), not one we inherit. Global companies' announcements are tracked wherever they occur, with `count_scope` marking whether a count covers global jobs lost or a single country's, and one row per country where the split is verified.

**Evidence tagging:** every row carries `ai_attribution` (who made the AI link) and `causal_link` (`sole` / `mixed` / `contextual` — how causally the source stated it), modeled on jobloss.ai's Explicit/Reported/Mixed evidence levels but kept as two separate axes. See [schema.md](schema.md).

## Validation

```bash
python scripts/validate-layoffs.py
```

Enforces: unique kebab-case ids, integer-or-empty counts (empty = undisclosed; guessed numbers are invalid), enum fields, ISO dates, `source_url` presence, and that `verified` rows carry an `ai_attribution` code plus a verbatim `attribution_quote`.

## Why existing trackers aren't enough

Challenger Gray & Christmas, layoffs.fyi, Intellizence, and news-API feeds are all built from the same underlying pool of press coverage and self-reports. Cross-checking one against another validates *extraction*, not *coverage* — events that never got press coverage are invisible to all of them, and that gap is structural. India and the Global South are the worst-covered; US/tech announced cuts the best. The only press-independent sources identified: WARN Act filings (US), UK ONS redundancy statistics, India Labour Bureau annual retrenchment/layoff reports.

## Source list

- Challenger, Gray & Christmas monthly reports (US, announced cuts, stated reasons)
- layoffs.fyi (tech, press-derived)
- Intellizence (global aggregation; free tier + paid API)
- WARN Act filings (US, state-level, legally mandated — press-independent)
- UK ONS redundancy statistics (press-independent)
- India Labour Bureau "Statistics on Industrial Disputes, Closures, Retrenchments and Layoffs" (annual, press-independent)
- NewsAPI.ai "Layoffs" event type — **untested; must be tested against known cases before any automated ingestion** (findings to be written up here)
- ILO / World Bank exposure indices — context only; exposure ≠ realized events; never counted

## Known coverage gaps (stated up front, per project principles)

Coverage will be partial and press-biased at first: announced ≠ realized; private companies, BPOs, and non-US events are structurally under-covered by every press-derived source. The dataset says so rather than pretending otherwise.

## Update cadence

TBD at schema approval.
