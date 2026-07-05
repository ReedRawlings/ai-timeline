# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repo is the home of a broader **AI Research & Data Assets project**: maintained, source-transparent public datasets about AI's measurable effects (labor, infrastructure, circulated statistics), plus the AI Timeline site. Three layers:

1. **The site** — a Vite **multi-page** vanilla JS app displaying "The AI Record", with a shared dark masthead + nav (`Timeline · Layoffs · Stocks`) across three pages:
   - **Timeline** (`index.html`) — the **Atlas + Dispatch** view (a whole-history month bar chart above an editorial digest of the focused month).
   - **Layoffs** (`layoffs.html`) — an editorial layoff tracker: digest lede + monthly-volume/cumulative chart + ranked "every tracked cut" table with hover-to-explain verification pills.
   - **Stocks** (`stocks.html`) — a rebased-% multi-ticker price tape (lightweight-charts) with an event-density "feathering" ribbon, Day/Week/Month grouping, and clickable major-event markers.

   Event data lives in `data/events.yaml`. Deployed on Vercel with a serverless API proxy for stock data. (The old collapsible "AI Market Tracker" panel and its Stocks/Layoffs tab switcher were retired in favor of these standalone pages.)
2. **Datasets** — standalone data assets under `data/` (e.g., `data/provenance/`, `data/layoffs/`), each with its own schema, README, and inclusion criteria. Dataset rows never live inside `events.yaml`; the timeline may reference dataset rows, never the reverse.
3. **Docs** — `docs/` holds the project's shared context. **`docs/master-status.md` is the orientation file — read it first for any work beyond routine site/timeline maintenance.** `docs/decisions.md` is the append-only decision log; `docs/prds/` holds PRDs for parked assets.

Standing expectations for all dataset work: no fabrication — every number needs a real, checkable source; record who made an attribution and in what words, never flattened to a boolean; "undisclosed" is a valid value, a guessed number is not; when something is ambiguous or consequential, flag it to the human rather than silently deciding. Only two dataset builds are active at a time (see master-status); don't build parked assets.

Commits touching only `docs/`, `data/provenance/`, or `data/layoffs/` skip Vercel deploys (`ignoreCommand` in vercel.json).

## Development Commands

```bash
npm run dev                      # Start Vite dev server with hot reload (localhost:5173)
npm run build                    # Production build to dist/ (includes stock data fetch)
npm run preview                  # Preview production build locally
python scripts/validate-yaml.py  # Validate events.yaml (syntax, structure, tier values, layoff_ids refs)
python scripts/validate-layoffs.py     # Validate data/layoffs/layoffs.csv
python scripts/validate-provenance.py  # Validate data/provenance/register.csv
```

Node.js (via nvm) and Python 3 + PyYAML required.

## Architecture

### Vite SPA with Serverless Backend
- **Vite** bundles the app; `data/events.yaml` is converted to JSON at build time
- **No framework** — vanilla JS, CSS, HTML
- **Vercel** hosts the site and provides serverless functions for stock API proxying
- **Finnhub** free tier for stock data, cached aggressively (edge + localStorage)

### Key Files
- `data/events.yaml` — All event data (~250 events). Primary file for content edits.
- `index.html` / `layoffs.html` / `stocks.html` — The three page entry points (each with the shared masthead + nav and its own mount div). Registered in `vite.config.js` under `build.rollupOptions.input`.
- `src/js/app.js` — Timeline page entry: loads events, mounts the Atlas+Dispatch view.
- `src/js/atlas-dispatch.js` — Builds the whole timeline view: atlas month bar chart + focus-month dispatch pane (major cards, "Everything Else" list, hover tooltips). Holds all view state.
- `src/js/layoffs-page.js` — Layoffs page: header stats + monthly-volume/cumulative chart (inline SVG cumulative overlay) + ranked table + CSS-`:hover` verification popovers. Reads `src/data/layoffs.json`; all totals/date-range/sector list are derived from the data.
- `src/js/stocks-page.js` — Stocks page: lightweight-charts rebased-% tape + feathering ribbon (canvas overlay aligned to the time scale) + Window/Group-by controls + basket/ticker chips + live legend + adaptive time axis + cursor date pill + major-event markers/popover. Reads `src/data/stock-history.json` + `src/data/events.json`.
- `src/css/main.css` — All styles. Active blocks: the "The AI Record" timeline styles, the `.record-nav` shared nav, and the `.lay-*` / `.stk-*` page styles. (The older "Ink & Signal" tokens remain for legacy reference.)
- `api/stocks.js` — Vercel serverless function proxying Finnhub stock data (stocks page merges the recent ~30 days over the pre-baked history, cached 24h in localStorage).
- `data/layoffs/layoffs.csv` — AI-attributed layoffs dataset (schema in `data/layoffs/schema.md`)
- `data/provenance/register.csv` — Stat provenance register (fact-check model, stable row IDs)
- `scripts/build-events.js` — Converts YAML → JSON at build time (passes fields through as-is, including `tier`)
- `scripts/build-layoffs.js` — Converts layoffs CSV → JSON at build time, including the provenance fields (`notes`, `source_type`, `source_url`, `press_independent`, `attribution_notes`) the Layoffs page's verification hover surfaces
- `scripts/build-stock-data.js` — Fetches historical stock data from Finnhub at build time
- `scripts/validate-yaml.py` — Validates YAML syntax, required fields, date formats, duplicates, `tier` values
- `scripts/apply-tiers.js` — One-shot/repeatable merge of editorial tiers from a `date,title,tier` CSV into events.yaml (reports unmatched/ambiguous rows)
- `vite.config.js` — Vite build configuration
- `vercel.json` — Vercel deployment and routing configuration

### Event Data Structure
```yaml
- title: "Event Title"                    # Required
  date: "2024-01-15T10:00:00-07:00"      # Required, ISO 8601 with time
  description: "What happened..."         # Required
  tier: major                             # Optional editorial rating: major | notable | minor (default: notable)
  tags: ["Model", "Product"]              # Optional, from approved list
  organizations: ["OpenAI"]               # Optional
  models: ["GPT-4"]                       # Optional
  impact_areas: ["Multimodal AI"]         # Optional, from approved list
  key_figures: ["Sam Altman"]             # Optional
  link: "https://example.com"             # Optional
  layoff_ids: ["google-2023-01"]          # Optional, refs rows in data/layoffs/layoffs.csv
```

Layoff data lives only in `data/layoffs/layoffs.csv` (see `data/layoffs/schema.md`); events reference rows via `layoff_ids`. The old nested `layoffs:` block is retired and rejected by the validator.

**The `tier` field** is a hand-curated editorial importance rating — `major`, `notable`, or `minor` — not a computed score. It drives the Atlas + Dispatch view: `major` events render as full cards, `notable`/`minor` as collapsed "Everything Else" rows, and the atlas bar's ember sub-bar counts majors per month. Omit it to default to `notable`; only `major`/`minor` are written explicitly in the YAML. Curate it by editorial judgment (regulatory/safety/market-shock events over routine fundraises), not by tags or keywords.

### Approved Tags
Model, Corporate, Product, Research, Policy, Economic, Social, Technical, Partnership, Safety

### Approved Impact Areas
Multimodal AI, Language Models, Computer Vision, Market Competition, Robotics, Healthcare, Education, Creator Economy, Public Perception, Ethics, Regulation, Enterprise AI, Open Source, Hardware, Research

### Stocks Page (`stocks.html` / `src/js/stocks-page.js`)
- Its own page (not a panel). Uses TradingView Lightweight Charts (~45KB).
- **Rebased-% only** — every visible line is rebased to 0% at the left edge of the window (the old %/Absolute toggle is gone; mixed-price tickers only compare meaningfully rebased).
- **Window** (ALL/3Y/1Y/6M) sets the visible range; **Group by** (Day/Week/Month) aggregates prices to daily/weekly/monthly closes **and** re-buckets the event-density feathering ribbon.
- Five baskets (Mag 7 default-on, Memory/Semis, AI Infrastructure, SaaS Disrupted, Gaming); basket headers flip the whole group, individual tickers stack across baskets.
- **Feathering ribbon** — a canvas overlay across the top of the tape, one cell per grouping bucket, ember opacity ∝ event count (all tiers), aligned to the time scale via `timeToCoordinate`.
- **Major-event markers** — clickable ember circles (one per grouping bucket) with a hover preview + click popover linking back to the Timeline.
- Adaptive time axis + on-cursor date pill; live legend of current rebased % per ticker.
- Historical data pre-baked at build time; recent ~30 days fetched via `/api/stocks`, cached at edge (24h) and in localStorage (24h).

### How the Timeline Is Rendered (Atlas + Dispatch)
`atlas-dispatch.js` reads `src/data/events.json` (built from YAML), drops `display: chart-only` rows, and builds two sections into `#atlas-dispatch`:
- **Atlas strip** — one bar per calendar month from the earliest tracked event month through the latest (dynamic range, so nothing is orphaned). Bar height ∝ total events that month; the ember sub-bar ∝ `major` count. Clicking a bar sets the focus month.
- **Dispatch pane** — the focused month as a digest: an optional hand-written summary (in the `MONTH_SUMMARIES` map, with an auto-composed fallback), stat chips + top themes, expandable `major` cards, and a collapsible "Everything Else" list of `notable`/`minor` rows with CSS-`:hover` tooltips.

All view state (`focusKey`, expanded major cards, Everything-Else open/closed, computed bar geometry) lives in the `AtlasDispatch` class; state changes trigger a re-render of the dispatch pane. Prev/next chevrons step to the nearest month with events, skipping empty months. There is no filter bar, drag-scroll, or per-event drill-down page — this is a single view.

## Deployment

Automated via Vercel Git integration:
1. Push to `main` triggers build
2. `npm run build` runs: YAML→JSON, stock data fetch, Vite build
3. YAML validation runs in GitHub Actions (`.github/workflows/validate.yml`)
4. Vercel deploys `dist/` and serverless functions from `api/`

Environment variable required on Vercel: `FINNHUB_API_KEY`

## Adding New Events

1. Add entry to `data/events.yaml` (maintain chronological order by convention)
2. Set `tier: major` or `tier: minor` if the event warrants it; omit for a default `notable` (see the tier note above)
3. Run `python scripts/validate-yaml.py` to check for errors
4. Test locally with `npm run dev`
5. Omit optional array fields entirely rather than using empty arrays (`[]`)
