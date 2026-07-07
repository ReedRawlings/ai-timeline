# Claims Page — Design Spec (2026-07-06)

Approved by the maintainer 2026-07-06 (layout, proponent treatment, and data move each
chosen explicitly). Builds the AI Claims Repository its public display surface — the
master-status open item "rows have permalink-able REF-*/C* IDs with nowhere to
permalink to" — plus the missing validation script.

## Decisions locked in this design

1. **Layout: index + detail anchors.** A compact category index at the top of the page
   links down to one full detail block per referent. Chosen over referent-cards-only
   and a flat layoffs-style table because permalink landing is a first-class goal.
2. **Proponent display (resolves `docs/prds/claims-proponent-display-prd.md`):**
   named claimants render normally; a generalized claimant gets a distinct
   **DIFFUSE**-badged treatment; a referent's `references` array renders as a visible
   dated **Related statements** list under its block.
3. **The dataset moves to `data/claims/`** (from `docs/Claims/`), resolving the
   master-status open question "whether it moves to `data/` with its dataset
   siblings." Side effect: commits touching it now auto-deploy (vercel.json's
   `ignoreCommand` only skips `docs/` and `data/layoffs/`) — no vercel.json change.
4. **Architecture: the established page pattern.** CSV → JSON at build time, vanilla
   JS renders client-side, styles in `main.css`. Same as Timeline/Layoffs/Stocks; no
   static pre-render, no framework.

## Components

### 1. Data move
`git mv docs/Claims/{referents.csv,claims.csv,README.md} data/claims/`. Path
references updated in: `CLAUDE.md`, `docs/master-status.md`,
`.claude/shared/dataset-conventions.md`,
`.claude/skills/propose-claim-entry/SKILL.md`,
`docs/prds/claims-proponent-display-prd.md`. `docs/decisions.md` is append-only —
gets a new entry, no rewrites.

### 2. `scripts/build-claims.js`
Mirrors `build-layoffs.js` (same RFC-4180 parser). Reads both CSVs, emits
`src/data/claims.json` as `{ referents: [...], claims: [...] }`:
- Referent `references` column parsed from JSON text to a real array (build fails
  loudly on malformed JSON).
- Derived field on each claim: `has_single_claimant: false` when `claimant` starts
  with `"Various"` (the generalized-claimant convention; currently exactly C043).
  This answers the PRD's "dedicated field?" question as a derived field — no CSV
  schema change.
- `source_url` values matching the `pending` convention pass through as `null`.
Added to the `dev` and `build` npm scripts.

### 3. Page: `claims.html` + `src/js/claims-page.js` + `.clm-*` CSS
- `claims.html`: fourth Vite entry (registered in `vite.config.js`), shared
  masthead; **Claims** nav link added to all four pages' `.record-nav`.
- **Header:** eyebrow "Claims Repository", title, lede explaining referent /
  as-made / circulating grading, stat chips derived from data (N referents ·
  N claims · N graded false or mostly false).
- **Index:** category sections in the README's vocabulary order; one line per
  referent — summary, claim count, worst-grade dot — anchored to its detail block.
  Empty collection-target categories (Military / Autonomous Weapons, Robotics /
  Physical Labor) appear with an honest "no claims collected yet" note.
- **Detail blocks:** one per referent, `id="REF-..."`. Authoritative statement
  quoted, with source-of-truth, source date, evidence-type tag, and source link
  (pending URLs render as "source pending verification" text, never a fake link).
  Claims render beneath as rows: variant-type tag (AS MADE / CIRCULATING), claim
  text with hedges intact, claimant line, accuracy-rating pill color-graded across
  the six-value vocabulary; `accuracy_rationale` in a CSS-`:hover` popover (the
  layoffs verification-pill idiom). Each claim row gets `id="C..."`. Each block and
  row has a `§` permalink control that copies its URL.
- **Proponent treatment:** `has_single_claimant === false` → DIFFUSE badge instead
  of a name-styled claimant. Non-empty `references` → visible "Related statements"
  list: date, speaker, text (verbatim/paraphrase-tagged), `stance: "counter"`
  visually marked.
- **Deep links:** on load, a `location.hash` matching a REF/C id scrolls to and
  transiently highlights the target.

### 4. `scripts/validate-claims.py`
Mirrors `validate-layoffs.py`. Checks: PK uniqueness (both tables); FK integrity
(`claims.referent_id` → referents; `parent_claim_id` → claims); enums
(`accuracy_rating`, `variant_type`, `category` against the README vocabulary);
required fields non-empty; `references` parses as a JSON array whose elements match
the documented shape (`date`, `url`, `text`, `kind`, `provenance`, optional
`stance`/`note`). Wired into `.github/workflows/validate.yml`.

## Error handling
Build script: loud failure on malformed CSV or `references` JSON. Page: renders
purely from data; blank/pending fields degrade to honest empty states — no invented
values anywhere (repository-wide rule).

## Testing / verification
- `python scripts/validate-claims.py` passes on the real data (and provably fails on
  a synthetic bad row during development).
- Dev-server verification via preview tools: page snapshot, nav from all four pages,
  anchor deep-link scroll, hover popovers, DIFFUSE badge + related statements on
  REF-CONSCIOUSNESS/C043, mobile-width render.
- `npm run build` completes clean.

## Bookkeeping (end of work)
Master-status: Claims Repository entry gains the display surface; open questions
(validation script, `data/` move, display surface, proponent display) marked
resolved. `docs/decisions.md`: one appended entry covering the night's decisions.
The proponent-display PRD gets a resolution note pointing at this spec.
