# Claims Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the AI Claims Repository a public display surface — a fourth site page (`claims.html`) with permalink-able REF-*/C* anchors — plus its missing validation script, moving the dataset to `data/claims/`.

**Architecture:** The established page pattern: CSV → JSON at build time (`scripts/build-claims.js`), vanilla JS client render (`src/js/claims-page.js`), `.clm-*` styles appended to `main.css` using the `--rec-*` tokens. Spec: `docs/superpowers/specs/2026-07-06-claims-page-design.md`.

**Tech Stack:** Vite multi-page, vanilla JS, Python 3 validator (stdlib only), no new dependencies.

## Global Constraints

- No fabrication anywhere: blank/pending fields render as honest empty states, never invented values or fake links.
- `docs/decisions.md` is append-only — new entries only, never rewrite.
- All page copy derives from data at render time (counts, category lists), not baked-in numbers.
- Follow the `.lay-*` visual idiom exactly (fonts `--rec-serif/-mono/-sans`, ember `#C2410C`, ink `#1A1813`, panel `#FBFAF6`).
- Data reality (verified 2026-07-06): 44 referents, 51 claims; ratings include bare `premature` (2 rows) alongside `premature / unverifiable`; `verification_status` is free text; all `source_url` populated; diffuse claimants = C038, C043; `parent_claim_id` unused; 8 referents have non-empty `references`.
- No test framework exists in this repo; validators + build runs + preview verification are the test cycle (matches existing convention).

---

### Task 1: Move the dataset to `data/claims/` and update references

**Files:**
- Move: `docs/Claims/referents.csv`, `docs/Claims/claims.csv`, `docs/Claims/README.md` → `data/claims/`
- Modify: `CLAUDE.md`, `docs/master-status.md`, `.claude/shared/dataset-conventions.md`, `.claude/skills/propose-claim-entry/SKILL.md`, `docs/prds/claims-proponent-display-prd.md`

**Interfaces:**
- Produces: `data/claims/referents.csv`, `data/claims/claims.csv` — the paths every later task reads.

- [ ] **Step 1:** `git mv docs/Claims data/claims` (renames all three files; `docs/Claims/` ceases to exist).
- [ ] **Step 2:** Update every `docs/Claims` path reference to `data/claims` in the five Modify files (find with `grep -rn "docs/Claims" --include="*.md"`). In CLAUDE.md also update the "Commits touching only docs/… or data/layoffs/ skip Vercel deploys" sentence to note claims commits now deploy. Do NOT touch `docs/decisions.md` (append-only; historical mentions stay).
- [ ] **Step 3:** Verify: `grep -rln "docs/Claims" --include="*.md" --include="*.js" --include="*.py" .` returns only `docs/decisions.md` (and this plan/spec, which are historical records). `ls data/claims/` shows the three files.
- [ ] **Step 4:** Commit: `git commit -m "Move AI Claims Repository to data/claims/ (dataset siblings together; claims commits now deploy)"`.

### Task 2: `scripts/build-claims.js` — CSV → `src/data/claims.json`

**Files:**
- Create: `scripts/build-claims.js`
- Modify: `package.json` (add to `dev` and `build` script chains, before `vite`)

**Interfaces:**
- Produces: `src/data/claims.json` = `{ referents: [...], claims: [...] }`.
  - Referent: all CSV columns as-is except `references` (parsed array) and `source_url` (null unless it starts with `http`).
  - Claim: all CSV columns as-is plus `accuracy_rating` normalized (`premature` → `premature / unverifiable`) and derived `has_single_claimant` (false when claimant starts with `"Various"`).

- [ ] **Step 1:** Write the script — reuse `parseCSV` from `build-layoffs.js` verbatim:

```js
/**
 * build-claims.js — Converts data/claims/{referents,claims}.csv to
 * src/data/claims.json at build time (same pattern as build-layoffs.js).
 * The referent `references` column is JSON text in the CSV; it is parsed
 * here and the build fails loudly if any row's JSON is malformed.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '..', 'data', 'claims');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'claims.json');

function parseCSV(text) { /* copy the RFC-4180 parser from build-layoffs.js verbatim */ }

function readTable(file) {
    const [header, ...records] = parseCSV(fs.readFileSync(path.join(DIR, file), 'utf8'));
    return records.map(rec => Object.fromEntries(header.map((h, i) => [h, (rec[i] ?? '').trim()])));
}

const referents = readTable('referents.csv').map(r => {
    let references;
    try {
        references = JSON.parse(r.references || '[]');
        if (!Array.isArray(references)) throw new Error('not an array');
    } catch (e) {
        throw new Error(`referent ${r.referent_id}: bad references JSON — ${e.message}`);
    }
    return { ...r, references, source_url: r.source_url.startsWith('http') ? r.source_url : null };
});

const claims = readTable('claims.csv').map(c => ({
    ...c,
    accuracy_rating: c.accuracy_rating === 'premature' ? 'premature / unverifiable' : c.accuracy_rating,
    has_single_claimant: !c.claimant.startsWith('Various'),
}));

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify({ referents, claims }, null, 2));
console.log(`Built ${referents.length} referents + ${claims.length} claims → ${path.relative(process.cwd(), OUT_PATH)}`);
```

- [ ] **Step 2:** Add `node scripts/build-claims.js` to both npm scripts (after `build-layoffs.js`).
- [ ] **Step 3:** Run `node scripts/build-claims.js`. Expected: `Built 44 referents + 51 claims → src/data/claims.json`. Spot-check with `node -e`: C043 and C038 have `has_single_claimant: false`; C001 rating is `premature / unverifiable`; REF-BUBBLE (or any of the 8) has a non-empty parsed `references` array.
- [ ] **Step 4:** Confirm `src/data/claims.json` is covered by the existing `src/data/*.json` gitignore pattern (`git status` must not list it; if it does, add it to `.gitignore`).
- [ ] **Step 5:** Commit.

### Task 3: `scripts/validate-claims.py` + CI wiring

**Files:**
- Create: `scripts/validate-claims.py`
- Modify: `.github/workflows/validate.yml` (add step; also add the missing `validate-layoffs.py` step if absent), `data/claims/README.md` (validation section), `CLAUDE.md` dev-commands block

**Interfaces:**
- Consumes: `data/claims/*.csv` (Task 1 paths).
- Produces: exit 0/1 CLI, same report format as `validate-layoffs.py`.

- [ ] **Step 1:** Write the validator (stdlib only, mirrors validate-layoffs.py structure and output format):

```python
#!/usr/bin/env python3
"""Validate data/claims/{referents,claims}.csv (the AI Claims Repository).

Checks:
- headers match the schema in data/claims/README.md
- primary keys unique (referent_id REF-*, claim_id C*)
- claims.referent_id is a valid FK into referents.csv
- claims.parent_claim_id, when set, is a valid FK into claims.csv
- enums: variant_type, accuracy_rating (bare 'premature' accepted as alias),
  category (against the README vocabulary)
- required fields non-empty; source_url must start with http
- referents.references parses as a JSON array; elements need date/text/kind/
  provenance with documented values ('url' optional; 'stance'/'note' optional)
"""
import csv, json, re, sys
from pathlib import Path

DIR = Path(__file__).resolve().parent.parent / "data" / "claims"

REF_HEADER = ["referent_id","category","subcategory","referent_summary","source_of_truth",
              "authoritative_statement","source_date","source_url","evidence_type",
              "epistemic_basis","notes","references"]
CLAIM_HEADER = ["claim_id","referent_id","variant_type","claim_as_stated","claimant",
                "claimant_role","claim_source","claim_date","accuracy_rating",
                "accuracy_rationale","counterclaim_summary","counterclaimant",
                "parent_claim_id","verification_status","notes"]
CATEGORIES = {"Labor / Jobs","Systemic Bias","Data / Privacy / Copyright",
              "Environment / Data Centers","Impact Framework","Existential / Safety Risk",
              "AI Hype / Bubble","Military / Autonomous Weapons","Robotics / Physical Labor"}
RATINGS = {"accurate","mostly accurate","mixed / true-but-misleading","mostly false",
           "false","premature / unverifiable","premature"}
VARIANTS = {"as-made","circulating"}
KINDS = {"verbatim","paraphrase"}
PROVENANCE = {"primary","secondary"}
REF_ID_RE = re.compile(r"^REF-[A-Z0-9-]+$")
CLAIM_ID_RE = re.compile(r"^C\d+[a-z]?$")

REQUIRED_REF = ("category","referent_summary","source_of_truth","authoritative_statement","source_url")
REQUIRED_CLAIM = ("referent_id","variant_type","claim_as_stated","claimant",
                  "accuracy_rating","accuracy_rationale","verification_status")

def read(name, header, errors):
    path = DIR / name
    if not path.exists():
        errors.append(f"{name}: file not found at {path}"); return []
    with path.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        if r.fieldnames != header:
            errors.append(f"{name}: header mismatch:\n  expected: {header}\n  found:    {r.fieldnames}")
            return []
        return list(r)

def main():
    errors = []
    refs = read("referents.csv", REF_HEADER, errors)
    claims = read("claims.csv", CLAIM_HEADER, errors)

    ref_ids, claim_ids = set(), set()
    for i, row in enumerate(refs, start=2):
        rid = row["referent_id"].strip()
        ctx = f"referents line {i} ({rid or '?'})"
        if not REF_ID_RE.match(rid): errors.append(f"{ctx}: referent_id not REF-UPPERCASE form")
        if rid in ref_ids: errors.append(f"{ctx}: duplicate referent_id")
        ref_ids.add(rid)
        for req in REQUIRED_REF:
            if not row[req].strip(): errors.append(f"{ctx}: missing {req}")
        if row["category"].strip() not in CATEGORIES:
            errors.append(f"{ctx}: category '{row['category']}' not in vocabulary")
        url = row["source_url"].strip()
        if url and not url.startswith("http"): errors.append(f"{ctx}: source_url must be a URL (or empty)")
        try:
            arr = json.loads(row["references"] or "[]")
            if not isinstance(arr, list): raise ValueError("not an array")
            for j, el in enumerate(arr):
                ec = f"{ctx} references[{j}]"
                for k in ("date","text","kind","provenance"):
                    if not el.get(k): errors.append(f"{ec}: missing {k}")
                if el.get("kind") and el["kind"] not in KINDS: errors.append(f"{ec}: kind '{el['kind']}'")
                if el.get("provenance") and el["provenance"] not in PROVENANCE: errors.append(f"{ec}: provenance '{el['provenance']}'")
                if "stance" in el and el["stance"] != "counter": errors.append(f"{ec}: stance must be 'counter' or omitted")
        except (json.JSONDecodeError, ValueError) as e:
            errors.append(f"{ctx}: references is not valid JSON ({e})")

    for i, row in enumerate(claims, start=2):
        cid = row["claim_id"].strip()
        ctx = f"claims line {i} ({cid or '?'})"
        if not CLAIM_ID_RE.match(cid): errors.append(f"{ctx}: claim_id not C-number form")
        if cid in claim_ids: errors.append(f"{ctx}: duplicate claim_id")
        claim_ids.add(cid)
        for req in REQUIRED_CLAIM:
            if not row[req].strip(): errors.append(f"{ctx}: missing {req}")
        if row["referent_id"].strip() not in ref_ids:
            errors.append(f"{ctx}: referent_id '{row['referent_id']}' has no referents.csv row")
        if row["variant_type"].strip() not in VARIANTS:
            errors.append(f"{ctx}: variant_type '{row['variant_type']}'")
        if row["accuracy_rating"].strip() not in RATINGS:
            errors.append(f"{ctx}: accuracy_rating '{row['accuracy_rating']}' not in vocabulary")
        parent = row["parent_claim_id"].strip()
        if parent and parent not in {c["claim_id"].strip() for c in claims}:
            errors.append(f"{ctx}: parent_claim_id '{parent}' has no claims.csv row")

    if errors:
        print(f"FAIL: {len(errors)} problem(s) in data/claims/")
        for e in errors: print(f"  - {e}")
        return 1
    print(f"OK: referents.csv — {len(refs)} row(s); claims.csv — {len(claims)} row(s) valid")
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2:** Run `python3 scripts/validate-claims.py`. Expected: `OK: referents.csv — 44 row(s); claims.csv — 51 row(s) valid`.
- [ ] **Step 3:** Prove it fails: copy `data/claims` to the scratchpad, corrupt one row (bad FK + bad rating), point `DIR` at it via a temporary edit or `python3 -c` monkeypatch, confirm both errors are reported. Restore. (No committed code changes from this step.)
- [ ] **Step 4:** Add validator steps to `.github/workflows/validate.yml` (claims + layoffs if missing); update README validation note + CLAUDE.md dev-commands block.
- [ ] **Step 5:** Commit.

### Task 4: `claims.html` entry + nav on all four pages

**Files:**
- Create: `claims.html`
- Modify: `vite.config.js` (add `claims` input), `index.html`, `layoffs.html`, `stocks.html` (nav link)

**Interfaces:**
- Produces: `<div id="claims-page">` mount; nav order `Timeline · Layoffs · Stocks · Claims`.

- [ ] **Step 1:** Create `claims.html` — copy `layoffs.html` structure exactly, with: title `AI Claims Repository — The AI Record`, description `Widely circulated claims about AI, traced to their sources and graded against what the source actually says.`, mount `<div id="claims-page">`, script `/src/js/claims-page.js`, and nav (Claims active):

```html
<nav class="record-nav">
    <a href="/" class="record-nav-link">Timeline</a>
    <a href="/layoffs.html" class="record-nav-link">Layoffs</a>
    <a href="/stocks.html" class="record-nav-link">Stocks</a>
    <a href="/claims.html" class="record-nav-link active">Claims</a>
</nav>
```

- [ ] **Step 2:** Add `claims: resolve(__dirname, 'claims.html')` to `vite.config.js` inputs; append the Claims link (non-active) to the other three pages' navs.
- [ ] **Step 3:** Verify: `npm run dev`, then preview tools — snapshot `/claims.html` shows masthead + empty mount, no console errors; nav link present on `/`.
- [ ] **Step 4:** Commit.

### Task 5: `src/js/claims-page.js` — header + category index

**Files:**
- Create: `src/js/claims-page.js`
- Modify: `src/css/main.css` (append `/* CLAIMS PAGE */` section)

**Interfaces:**
- Consumes: `src/data/claims.json` (Task 2 shape).
- Produces: module-level constants later steps reuse: `CATEGORY_ORDER` (9 README categories), `EMPTY_CATEGORIES` map (Military…/Robotics… → collection-target notes), `RATING_META` map (rating → `{label, color, border, rank}`; rank: false=5, mostly false=4, mixed=3, premature=2, mostly accurate=1, accurate=0), `h()` DOM helper (copied verbatim from layoffs-page.js), `slugRating(r)` → kebab CSS suffix.

- [ ] **Step 1:** Scaffold the module: imports (`../css/main.css`, `../data/claims.json`), the `h()` helper, constants:

```js
const CATEGORY_ORDER = ['Labor / Jobs', 'Systemic Bias', 'Data / Privacy / Copyright',
    'Environment / Data Centers', 'Impact Framework', 'Existential / Safety Risk',
    'AI Hype / Bubble', 'Military / Autonomous Weapons', 'Robotics / Physical Labor'];
const EMPTY_CATEGORIES = {
    'Military / Autonomous Weapons': 'Defined for tracking; no claims collected yet.',
    'Robotics / Physical Labor': 'Defined for tracking; no claims collected yet.',
};
const RATING_META = {
    'accurate':                    { label: 'ACCURATE',        color: '#1F7A4D', border: '#A8CDB8', rank: 0 },
    'mostly accurate':             { label: 'MOSTLY ACCURATE', color: '#55803B', border: '#BFD3AC', rank: 1 },
    'mixed / true-but-misleading': { label: 'MIXED',           color: '#8A5A2B', border: '#DCC9AE', rank: 3 },
    'mostly false':                { label: 'MOSTLY FALSE',    color: '#B45309', border: '#E7B79E', rank: 4 },
    'false':                       { label: 'FALSE',           color: '#B91C1C', border: '#E5A3A3', rank: 5 },
    'premature / unverifiable':    { label: 'PREMATURE',       color: '#8C8676', border: '#D9D3C5', rank: 2 },
};
```

- [ ] **Step 2:** `initClaimsPage({referents, claims})`: group claims by `referent_id`; group referents by category. Build header (`.clm-header`): eyebrow `Claims Repository`, title `Who said what — and was it true?`, stat block `N CLAIMS / GRADED`, lede (hand-written, explains referent / as-made / circulating / the grading rule), chips: `N REFERENTS`, `N CLAIMS`, `N GRADED FALSE OR MOSTLY FALSE`, divider, category names with counts.
- [ ] **Step 3:** Build the index (`.clm-index`): per CATEGORY_ORDER section with data (or an EMPTY_CATEGORIES note row): section head = category + referent count; one `.clm-index-row` per referent — `<a href="#REF-...">` summary, claim count `× N`, worst-grade dot colored by `max(rank)` across its claims. Sort referents within a category by worst-rank desc, then id.
- [ ] **Step 4:** Append the header/index CSS (`.clm-header` family mirrors `.lay-header` values exactly; `.clm-index-row` = grid `1fr 60px 20px`, `border-bottom: 1px solid #EDE9DF`, serif summary 15px, mono count, 8px dot).
- [ ] **Step 5:** Preview-verify (snapshot: 7 populated + 2 collection-target sections, counts match 44/51) and commit.

### Task 6: Detail blocks — referents, claim rows, popovers, proponent treatment, permalinks

**Files:**
- Modify: `src/js/claims-page.js`, `src/css/main.css`

**Interfaces:**
- Consumes: Task 5 constants and grouping.
- Produces: one `.clm-ref` block per referent with `id="REF-..."`; `.clm-claim` rows with `id="C..."`.

- [ ] **Step 1:** Detail sections, grouped under the same category order. Each `.clm-ref` block:
  - head row: mono referent id (self-link `§` copies `location.origin + pathname + '#' + id` to clipboard, transient "copied" state) + `evidence_type` tag + `source_date`.
  - `.clm-ref-statement`: serif-quoted `authoritative_statement`.
  - `.clm-ref-source`: `source_of_truth`; `source_url` renders `SOURCE ↗` link when non-null, else mono text `SOURCE PENDING VERIFICATION`.
- [ ] **Step 2:** Claim rows under each referent (as-made first, then circulating; then by id). Each `.clm-claim` (grid `86px 1fr 200px 130px`):
  - variant tag: `AS MADE` (ink) / `CIRCULATING` (ember).
  - claim text (sans 14px) with claimant line beneath: named → `claimant — claimant_role`; `has_single_claimant === false` → `.clm-diffuse` badge `DIFFUSE` + the claimant prose in tertiary color (distinct treatment, not missing-data styling).
  - rating pill (`.lay-pill` values, RATING_META colors) wrapped in a `.clm-grade` hover cell: popover (`.lay-verif-pop` idiom, 360px) shows rating label + `claim_source` + `claim_date` head, `accuracy_rationale` body, `counterclaim_summary` + `counterclaimant` footer when present.
  - `§` permalink for the claim id.
- [ ] **Step 3:** Related statements: when `referent.references.length > 0`, a `.clm-related` list under the claim rows — head `RELATED STATEMENTS`; per element: mono date, speaker/note-derived attribution is NOT invented — render `text` (quote-styled when `kind === 'verbatim'`, plain when `paraphrase`), `provenance` tag when `secondary`, `COUNTER` tag when `stance === 'counter'`, `url` as `↗` link when present.
- [ ] **Step 4:** Deep-link handling at the end of init:

```js
if (location.hash) {
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) { el.scrollIntoView({ block: 'start' }); el.classList.add('clm-flash'); setTimeout(() => el.classList.remove('clm-flash'), 2400); }
}
```

  `.clm-flash` = 2s background fade from `rgba(194,65,12,.12)`. Also `scroll-margin-top: 16px` on `[id^="REF-"], [id^="C"]` within the page scope (use `.clm-ref, .clm-claim`).
- [ ] **Step 5:** Footnote (`.lay-footnote` idiom): grading scale legend (six ratings with their colors) + "Grades measure a specific wording against its referent's authoritative statement — not the claimant. `PREMATURE` = deadline not yet arrived; never graded true/false."
- [ ] **Step 6:** Mobile CSS (mirror the existing `@media (max-width: 720px)` conventions): claim grid collapses to stacked rows; popovers become full-width; index row keeps one line.
- [ ] **Step 7:** Preview-verify the lot (see Task 7 list), fix, commit.

### Task 7: Full verification pass

- [ ] **Step 1:** `python3 scripts/validate-claims.py`, `python3 scripts/validate-layoffs.py`, `python3 scripts/validate-yaml.py` — all OK.
- [ ] **Step 2:** Preview checks: `/claims.html` snapshot (structure + zero console errors); nav round-trip from `/`; `#REF-IMF-EXPOSURE` and `#C003b` deep links scroll + flash; grade-pill hover popover shows the C003b rationale; C043 + C038 show DIFFUSE badge; a `references` referent (e.g. REF-BUBBLE) shows Related statements with a COUNTER-tagged element; mobile 375px snapshot.
- [ ] **Step 3:** `npm run build` completes; `vite preview` spot-check `/claims.html`.
- [ ] **Step 4:** Screenshot for the user. Commit anything outstanding.

### Task 8: Bookkeeping

**Files:**
- Modify: `docs/master-status.md`, `docs/decisions.md` (append), `docs/prds/claims-proponent-display-prd.md`, `data/claims/README.md`

- [ ] **Step 1:** Master-status: Claims Repository entry — location now `data/claims/`, display surface = site Claims page, Maintenance line gains "page re-renders from CSVs at each deploy"; resolve the open items (validator ✓, moved to data/ ✓, display surface ✓); W7 site entry mentions the fourth page. Cross-cutting item 3's claims-display sub-question resolved.
- [ ] **Step 2:** decisions.md: one appended entry — the four locked decisions (layout, proponent treatment, move, derived `has_single_claimant`), the `premature` normalization, and the stale-README pending-URL discovery.
- [ ] **Step 3:** PRD: add a resolution header pointing at the spec + implementation (§3 questions answered: distinct DIFFUSE treatment yes; references surfaced visibly yes; split threshold documented as "when a voice makes a firm general assertion, give it its own claim row"; dedicated field = derived at build, no schema change).
- [ ] **Step 4:** README: fix the stale source_url "pending" note (URLs now populated); add validator + page pointers.
- [ ] **Step 5:** Final commit; `git log --oneline` sanity.

## Self-Review

- Spec coverage: data move (T1), build script (T2), validator + CI (T3), page entry + nav (T4), header/index (T5), detail/proponent/permalink/related (T6), verification (T7), bookkeeping (T8). ✓
- Placeholders: the one intentional reference is `parseCSV` "copy verbatim from build-layoffs.js" — the source is a named, existing file, not an undefined sketch. ✓
- Type consistency: `claims.json` shape defined in T2 and consumed as-is in T5/T6; RATING_META keys match the normalized rating vocabulary (bare `premature` never reaches the page because T2 normalizes it). ✓
