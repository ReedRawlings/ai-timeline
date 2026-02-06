# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Timeline is a Vite-built vanilla JS SPA that displays an interactive, horizontally scrollable timeline of significant AI events, plus a stock market chart with AI event markers. All event data lives in a single YAML file. Deployed on Vercel with a serverless API proxy for stock data.

## Development Commands

```bash
npm run dev                      # Start Vite dev server with hot reload (localhost:5173)
npm run build                    # Production build to dist/ (includes stock data fetch)
npm run preview                  # Preview production build locally
python scripts/validate-yaml.py  # Validate events.yaml (syntax, structure, consistency)
```

Node.js (via nvm) and Python 3 + PyYAML required.

## Architecture

### Vite SPA with Serverless Backend
- **Vite** bundles the app; `data/events.yaml` is converted to JSON at build time
- **No framework** — vanilla JS, CSS, HTML
- **Vercel** hosts the site and provides serverless functions for stock API proxying
- **Finnhub** free tier for stock data, cached aggressively (edge + localStorage)

### Key Files
- `data/events.yaml` — All event data (~180+ events). Primary file for content edits.
- `index.html` — Root HTML entry point (filter bar, stock chart section, timeline container)
- `src/js/app.js` — Main entry point: loads events, renders timeline, initializes chart
- `src/js/render-timeline.js` — Generates timeline DOM from event JSON (replaces Hugo Go templates)
- `src/js/main.js` — Filter system, keyboard navigation, drag-to-scroll, event card overlays, month/week grouping toggle
- `src/js/stock-chart.js` — TradingView Lightweight Charts integration with event markers
- `src/css/main.css` — All styles (Ink & Signal design system)
- `api/stocks.js` — Vercel serverless function proxying Finnhub stock data
- `scripts/build-events.js` — Converts YAML → JSON at build time
- `scripts/build-stock-data.js` — Fetches historical stock data from Finnhub at build time
- `scripts/validate-yaml.py` — Validates YAML syntax, required fields, date formats, duplicates
- `vite.config.js` — Vite build configuration
- `vercel.json` — Vercel deployment and routing configuration

### Event Data Structure
```yaml
- title: "Event Title"                    # Required
  date: "2024-01-15T10:00:00-07:00"      # Required, ISO 8601 with time
  description: "What happened..."         # Required
  tags: ["Model", "Product"]              # Optional, from approved list
  organizations: ["OpenAI"]               # Optional
  models: ["GPT-4"]                       # Optional
  impact_areas: ["Multimodal AI"]         # Optional, from approved list
  key_figures: ["Sam Altman"]             # Optional
  link: "https://example.com"             # Optional
```

### Approved Tags
Model, Corporate, Product, Research, Policy, Economic, Social, Technical, Partnership, Safety

### Approved Impact Areas
Multimodal AI, Language Models, Computer Vision, Market Competition, Robotics, Healthcare, Education, Creator Economy, Public Perception, Ethics, Regulation, Enterprise AI, Open Source, Hardware, Research

### Scaffolded Filter System
The JS filter system in `main.js` dynamically narrows dropdown options based on current selections. When you pick "OpenAI" in Organizations, Key Figures only shows people from OpenAI events. The `filterSystem` object manages state with `isUpdatingFilters` flag to prevent recursive updates. Event cards use `data-*` attributes (pipe-delimited) for filter matching.

### Stock Chart
- Uses TradingView Lightweight Charts (~45KB)
- Default basket: NVDA, GOOGL, MSFT, META, AMD
- Collapsible panel between filter bar and timeline
- Timeline events shown as markers on the chart
- Clicking a marker scrolls the timeline to that event
- Historical data pre-baked at build time; recent data fetched via `/api/stocks`
- Cached at edge (24h) and in localStorage (24h)

### How Events Are Rendered
`render-timeline.js` reads `src/data/events.json` (built from YAML), sorts by date, groups by month, and generates DOM nodes: `.timeline-group` > `.group-events` > `.event-card` with `data-models`, `data-organizations`, `data-key-figures`, `data-impact-areas`, and `data-tags` attributes. The filter system reads these at runtime.

## Deployment

Automated via Vercel Git integration:
1. Push to `main` triggers build
2. `npm run build` runs: YAML→JSON, stock data fetch, Vite build
3. YAML validation runs in GitHub Actions (`.github/workflows/validate.yml`)
4. Vercel deploys `dist/` and serverless functions from `api/`

Environment variable required on Vercel: `FINNHUB_API_KEY`

## Adding New Events

1. Add entry to `data/events.yaml` (maintain chronological order by convention)
2. Run `python scripts/validate-yaml.py` to check for errors
3. Test locally with `npm run dev`
4. Omit optional array fields entirely rather than using empty arrays (`[]`)
