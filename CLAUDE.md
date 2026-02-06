# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Timeline is a Hugo static site that displays an interactive, horizontally scrollable timeline of significant AI events. All event data lives in a single YAML file. The site is vanilla HTML/CSS/JS — no frameworks, no bundler, no TypeScript.

## Development Commands

```bash
hugo server                      # Start dev server with hot reload (localhost:1313)
hugo --gc --minify               # Production build to public/
python scripts/validate-yaml.py  # Validate events.yaml (syntax, structure, consistency)
```

Hugo minimum version: 0.80.0 (extended). Python 3 + PyYAML required for validation.

## Architecture

### Data-Driven Static Site
- **Hugo** reads `data/events.yaml` at build time and generates a single-page HTML timeline
- **No backend, no database** — all content is in the YAML file
- **Theme** lives at `themes/ai-timeline-theme/` with one layout (`layouts/index.html`), one CSS file, and two JS files

### Key Files
- `data/events.yaml` — All event data (~150+ events). This is the primary file you'll edit.
- `themes/ai-timeline-theme/layouts/index.html` — Hugo template that generates the timeline HTML using Go templating. Reads from `.Site.Data.events`.
- `themes/ai-timeline-theme/static/js/main.js` — Filter system, keyboard navigation, drag-to-scroll, event card overlays, month/week grouping toggle
- `themes/ai-timeline-theme/static/js/neural-network.js` — Canvas-based animated header
- `themes/ai-timeline-theme/static/css/main.css` — All styles
- `config.toml` — Hugo config with taxonomies (tags, organizations, models, impact_areas, key_figures)
- `scripts/validate-yaml.py` — Validates YAML syntax, required fields, date formats, duplicates

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

### How Hugo Renders Events
The `index.html` template iterates over `.Site.Data.events`, sorts by date, groups by month, and renders each event as a card with `data-models`, `data-organizations`, `data-key-figures`, `data-impact-areas`, and `data-tags` attributes. The JS filter system reads these attributes at runtime.

## Deployment

Automated via GitHub Actions (`.github/workflows/hugo.yml`):
1. Push to `main` triggers build
2. YAML validation runs first — **build fails if validation fails**
3. Hugo builds with `--gc --minify`
4. Deploys to GitHub Pages

## Adding New Events

1. Add entry to `data/events.yaml` (maintain chronological order by convention)
2. Run `python scripts/validate-yaml.py` to check for errors
3. Test locally with `hugo server`
4. Omit optional array fields entirely rather than using empty arrays (`[]`)
