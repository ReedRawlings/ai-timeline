# Claim Dossiers — Design Spec (2026-07-07)

Approved by the maintainer 2026-07-07. Extends the Claims page (spec:
`2026-07-06-claims-page-design.md`) with editorial deep-dive pages for selected
claims, plus a skill so future Claude sessions can author more.

## Concept

A **dossier** is one claim's fact-check page: the claim as it circulates, its grade
rendered large, what the authoritative source actually says, a written analysis of
how the wording drifted, and a dated reference list. Only claims with enough
circulation and verified source material get one — a dossier is earned, not
generated for all 51 rows.

**First three** (the claims with deep-researched referent material already in the
repo): C028b ("500 ml of water per prompt", mostly false), C003b ("40% of jobs at
risk", mostly false), C046b ("AI caused ~55,000 layoffs in 2025", mixed).

## Decisions

1. **Dossier content lives in `data/claims/dossiers/<claim_id>.yaml`** — one file
   per dossier, editorial prose + curated reference list. Analysis is written ONLY
   from material already recorded in the repository (referent statements, rationales,
   notes, counterclaims) or from sources verified during authoring — never invented.
2. **The grade is never stored in a dossier.** `accuracy_rating`, claim text,
   claimant, and rationale are joined from `claims.csv` at build time; a dossier
   that disagrees with its claim row is a bug, caught by keeping one source of truth.
3. **One template page** (`claim.html` + `src/js/claim-page.js`) renders
   `/claim.html?id=C028b`-style URLs. No per-dossier HTML entries. Unknown or
   dossier-less ids render an honest empty state linking back to `/claims.html`.
4. **Discovery:** on the Claims index page, claims with a dossier get a
   "READ THE DOSSIER →" link on their claim row (and the index row shows a marker).
5. **Skill:** `.claude/skills/write-claim-dossier/SKILL.md` encodes the authoring
   workflow for future sessions.

## Dossier YAML schema

```yaml
claim_id: C028b            # required; must exist in claims.csv (validator-enforced)
headline: "..."            # required; the page title, editorial voice
dek: "..."                 # required; one-sentence standfirst
verdict_summary: "..."     # required; plain-language why-this-grade paragraph
sections:                  # required; 2-6 sections, plain-text paragraphs
  - heading: "What circulates"
    body: "..."
  - heading: "What the source actually says"
    body: "..."
references:                # required; every url verified at authoring time
  - date: "2023-04-06"
    label: "..."
    url: "https://..."     # optional only when the item is a repo-internal pointer
    note: "..."            # optional
written: "2026-07-07"      # required
updated: "2026-07-07"      # optional
```

## Components

- **Build:** `build-claims.js` reads `data/claims/dossiers/*.yaml` (js-yaml, already
  a devDependency) and emits them in `claims.json` as `dossiers: { <claim_id>: {...} }`.
  Fails loudly on YAML errors or a dossier whose `claim_id` has no claims.csv row.
- **Page:** `claim.html` (fifth Vite input; nav shows Claims as active section) +
  `src/js/claim-page.js`: reads `?id=`, joins dossier + claim + referent, renders:
  grade banner (rating pill large + variant type + claim as stated verbatim),
  verdict summary, sections, "what the source says" referent quote block reused from
  the claims page idiom, reference list (dated rows), provenance footer (claim_id,
  referent_id links back to `/claims.html#...` anchors, written/updated dates).
  `.clmd-*` CSS namespace in main.css.
- **Claims page:** dossier'd claim rows get a `READ THE DOSSIER →` link.
- **Validator:** `validate-claims.py` gains a dossiers pass (PyYAML, already a CI
  dep): every file parses, claim_id exists in claims.csv, required fields present,
  sections non-empty, reference dates ISO-ish, urls http(s).
- **Skill:** `write-claim-dossier` — trigger conditions; selection bar (circulation +
  verified material); hard rules (grade from claims.csv only; every factual sentence
  traceable to referent/claims data or a source verified in-session; verify URLs
  before citing; thin-but-true beats rich-but-unsourced; flag any grade
  disagreement to the human instead of editing the dossier around it); the YAML
  schema; the full workflow (pick → gather → draft → validate → build → preview →
  register in master-status/decisions).

## Error handling

Build fails on malformed dossier YAML/unknown claim_id. Page: missing id → empty
state; dossier fields render only when present.

## Verification

Validator (including a deliberately-broken dossier check during development), page
verified in the browser preview for all three dossiers (content, grade join,
back-links, mobile), production build clean.

## Bookkeeping

Master-status W6/W7 updated (dossier surface + skill registered), decisions.md
appended, skill listed alongside the other dataset skills.
