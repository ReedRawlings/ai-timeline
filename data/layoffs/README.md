# AI-Attributed Layoffs Dataset

**Status: live, migration-stage.** Schema approved 2026-07-03 ([schema.md](schema.md)). `layoffs.csv` holds 32 rows migrated from the timeline's retired `layoffs:` blocks — all currently `needs_recode`, meaning the AI attribution has not yet been re-coded from a verbatim quote. Treat the dataset as structurally real but not yet citation-grade until the recode pass is done.

## What this is

A maintained dataset of AI-attributed layoff events where the attribution is a **coded, sourced field** — recording who attributed the cuts to AI and in what words — rather than a filter or a boolean.

**Scope:** AI-attributed layoffs only (decided 2026-07-03). For "what share of overall job loss is attributed to AI" comparisons, external monthly/quarterly job-loss reports (e.g. Challenger) serve as the denominator; non-AI-attributed layoffs do not get rows here.

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
