# AI Timeline — Atlas + Dispatch Redesign

**Date:** 2026-07-03
**Status:** Approved design, pre-implementation
**Source handoff:** `~/Downloads/design_handoff_atlas_digest/` (README, tier-reference.csv, prototype HTML)

## Goal

Replace the horizontally-scrolling, month-column AI timeline with a two-part editorial view:

1. **Atlas strip** — a compressed monthly bar chart of the entire tracked history, one bar per calendar month, colored to show total volume and "major" density. Click a bar to jump the reading pane to that month.
2. **Dispatch (focus) pane** — the selected month as an editorial digest: a summary paragraph, full-detail cards for `major` events (click to expand/collapse full description), and a collapsed "Everything Else" section for `notable` + `minor` events with per-row hover tooltips.

This solves three problems of the old layout at current/future event volume: no whole-timeline overview, no importance signal, no compact way to read a period at a glance.

## Scope decisions (confirmed with user)

- **Old timeline UI: fully replaced.** Remove the filter bar (models/orgs/key-figures/impact-areas/tags), horizontal drag-scroll, keyboard nav, month/week grouping toggle, and click-to-expand card overlays. The Atlas+Dispatch view is the only timeline experience.
- **AI Market Tracker (stock + layoff charts): kept as-is.** Left functionally untouched in this work; it will be reworked in a separate follow-up. It stays in its current position (collapsible panel below the header, above the atlas). Interim palette mismatch between the new paper theme and the old chart styling is acceptable.
- **Site header: replaced** with the handoff's sticky "The AI Record" header (wordmark + mono kicker + dynamic event-count stat line).
- **Atlas range: dynamic** from the earliest tracked event month (2018-06) through the latest tracked month — NOT the prototype's hardcoded 2022 start. This keeps all events reachable and the atlas/nav consistent. Pre-2022 months render as sparse slivers; that is expected.
- **Tier data: non-default tiers only.** Add `tier: major` / `tier: minor` lines to `events.yaml` where applicable; leave `notable` implicit (it is the default when the field is omitted).

## Data change: the `tier` field

Every event gains an editorial importance rating, hand-curated (not computed):

```yaml
- title: "DeepSeek R1 Shocks Markets"
  date: "2025-01-27T09:00:00-08:00"
  tier: major
  ...
```

- Valid values: `major`, `notable`, `minor`.
- **Default when omitted: `notable`.** Untagged events render as notable rows.
- `build-events.js` needs no changes — it passes YAML fields straight through to `events.json`.

### Applying tiers from the reference CSV

Source of truth: `tier-reference.csv` (date, title, tier for 247 prototyped events). A one-shot Node merge script (`scripts/apply-tiers.js`, run once then may be kept for re-runs):

1. Parse the CSV; keep only rows where tier is `major` or `minor` (~60 rows).
2. For each, match against `events.yaml` events by **exact date-prefix (YYYY-MM-DD) + exact title**.
3. On a confident unique match, insert the `tier:` line into that event's YAML block.
4. Emit a report to stdout listing: (a) CSV major/minor rows with no YAML match, (b) rows matching multiple YAML events (ambiguous — skipped), so a human can resolve them manually.

Known collision to expect: 2023-03-14 has both "Claude Release" (major) and "Anthropic Introduces Claude" (minor); title-exact matching disambiguates these.

The `notable` majority is intentionally left untouched (no tier line).

### Validation

Add to `scripts/validate-yaml.py`: if an event has a `tier` field, assert its value is one of `{major, notable, minor}`; otherwise flag an error. Absence of the field is valid.

## Rendering architecture

### New module: `src/js/atlas-dispatch.js`

Owns the entire timeline view. Class-based, DOM-generating (following `render-timeline.js` conventions — `createElement`, class-based styling via `main.css`, no inline styles). Recreates the prototype's `Component` logic.

**Precomputed once from the full event array (independent of focus month):**
- Monthly buckets: `{ [YYYY-MM]: { total, major } }`, built from all non-`chart-only` events.
- Full month key list from earliest event month → latest (contiguous, including empty months).
- `eventMonths`: subset of month keys with ≥1 event (used by prev/next nav).
- Bar heights: `pxTot = total>0 ? max(4, round(total/maxTotal*82)) : 1`; `pxMaj = min(pxTot, round(major/maxTotal*82))`. `maxTotal` = busiest month's total.

**State:**
- `focusKey` — selected month `YYYY-MM`. Initial value = the latest month that has events.
- `expandedMajor` — set of expanded major-card keys (`date|title`); multiple may be open.
- `ebOpen` — tri-state: `null` (use auto-default), `true`, `false`. Reset to `null` on focus change.
- `hoverKey` — row key with tooltip visible (or null).

**Derived per render (from full array + `focusKey`):**
- `focus` = events in the focus month.
- Tier grouping: `major`, `notable`, `minor` — each sorted by date ascending. (The prototype sorted majors by a `significance` score; our data has no such score, so all groups sort by date.)
- Stat counts: total / major / notable / minor / rest(=notable+minor).
- Themes: top 2–3 tags by frequency that month.
- Digest paragraph (see below).
- Atlas bar colors: base `#D5CEBE` (or `#1A1813` if focused); major sub-bar `#C2410C` (or `#F08A5D` if focused); focus month shows a `▼` label above its bar.
- `ebOpen` effective value: `state.ebOpen ?? (major.length === 0)` — auto-expands when the month has no major events.

**Interactions:**
- Click atlas bar → `setFocus(key)` (sets `focusKey`, resets `ebOpen` to null; expanded-major state resets implicitly on re-render of a new month's cards).
- Prev/next chevrons → step to nearest month in `eventMonths` with ≥1 event; skip empty months; clamp at ends.
- Click major card → toggle that card's key in `expandedMajor`; body text swaps between truncated (~300 chars, word-boundary ellipsis) and full description in place.
- Click "Everything Else" tab → toggle `ebOpen` (seeded from current effective value).
- Hover notable/minor row → set `hoverKey`, show tooltip anchored `bottom:100%` of the row (grows upward); clear on mouseleave.

**Re-render strategy:** a single `render()` that rebuilds the dispatch pane and updates atlas bar states into a container; called after every state change. Atlas geometry is built once; only per-bar focus styling updates. (Simple full-subtree replace of the dispatch pane is acceptable given the data size.)

### Editorial digest summaries

Hand-written month summaries live in a `MONTH_SUMMARIES` map in `atlas-dispatch.js` (keyed `YYYY-MM`), seeded with the prototype's two entries (`2026-02`, `2025-01`). Fallback when no manual summary exists:
- 0 events: "No tracked events for this period — pick another month from the map above."
- else: "N tracked events, M scored major." + (if majors) " Headlined by X and Y." else (if notables) " A quieter month of incremental releases and partnerships."

### `index.html` changes

- Replace `<header class="site-header">…` with the sticky `.record-header` (wordmark "The AI Record", mono kicker "TRACKING THE TIMELINE TO AGI", right-side stat line). Stat line text is populated dynamically by JS (`{N} EVENTS · {firstYear}—{lastYear}`).
- Remove the entire `.filter-container` block.
- Keep the `.stock-chart-section` block verbatim.
- Replace `<main class="timeline-container"><div class="timeline" id="timeline">` with the atlas + dispatch container structure (or a single mount point `#atlas-dispatch` that the module fills).
- Update the Google Fonts `<link>` to include `Newsreader` + `IBM Plex Mono` + `IBM Plex Sans` (keep the existing DM Sans / Instrument Serif import for now since charts may rely on it).

### `app.js` changes

- Drop `renderTimeline`, `initTimeline`, `initEventPopover` imports/calls.
- Import and call the new atlas-dispatch initializer with `events`.
- Keep `initChartTabs`, `initStockChart`, `initLayoffChart` calls unchanged.

### Module cleanup

- Extract `initChartTabs` into a new `src/js/chart-tabs.js`.
- **Delete** `src/js/main.js` (old timeline logic + popover) and `src/js/render-timeline.js`.

### Styling: `src/css/main.css`

- Add a new section implementing the handoff's design tokens for: `.record-header`, atlas strip (`.atlas`, bar rows, year axis), dispatch pane (month header, digest, stat chips, major cards, everything-else tab + panel, notable/minor rows, hover tooltip).
- Use exact tokens from the handoff (colors, type scale, 2–3px radii, spacing rhythm, 1120px column / 820px reading width).
- Set page background `#F4F1EA` and outer `#EDE9DF` on body.
- Leave existing chart / filter-independent styles in place. Old timeline-card / filter / group CSS may be left dead for now or removed if trivially safe; removal is not required for correctness.

## Design tokens (reference)

Colors — paper `#F4F1EA`, outer `#EDE9DF`, panel `#FBFAF6`, ink `#1A1813`, ember `#C2410C`, ember-light `#F08A5D`, tooltip-accent `#E8875B`; body text `#33302A`/`#5A554A`/`#2C2A24`/`#6F6A5E`; muted ramp `#8C8676`/`#A8A294`/`#B6AF9E`/`#BBB4A4`; borders `#E4DFD3`/`#EDE9DF`/`#E0DACC`/`#DCD6C8`/`#D9D3C5`/`#CFC8B8`/`#D5CEBE`; tooltip bg `rgba(26,24,19,.9)`.

Type — Newsreader (400/500) for display serif (month title 44px, major card titles 25px, digest 20px, tooltip title 16px); IBM Plex Mono (400/500/600) for labels/meta/stats/chips (8–22px, letter-spacing .04–.18em, uppercase labels); IBM Plex Sans (400/500) for body rows (12.5–15px).

Radius 2–3px throughout. No images/icons — typographic + solid color only; do not introduce icon fonts or emoji (the `▼ ‹ › ▸ ▾ ▴` glyphs used are plain Unicode text).

## Out of scope

- Any change to the stock chart or layoff chart behavior/styling (separate follow-up).
- Any per-event drill-down page (design is a single view).
- Backfilling hand-written digest summaries for every month (only the seeded two ship; the rest use the auto fallback).
- Curating tiers beyond applying the CSV baseline.

## Verification

- `python scripts/validate-yaml.py` passes (including new tier check).
- `npm run build` succeeds (YAML→JSON, stock fetch, Vite build).
- `npm run dev`: header renders; atlas spans 2018→latest with correct bar heights; clicking a bar changes focus; prev/next skips empty months; major cards expand/collapse; Everything Else auto-expands on major-less months and toggles; hover tooltips appear and grow upward; stat chips + themes correct; stock/layoff tracker still works.
