---
name: write-claim-dossier
description: Use when a claim in the AI Claims Repository (data/claims/) deserves its own fact-check page on the site — an editorial dossier at /claim.html?id=<claim_id>. Authors the dossier YAML (data/claims/dossiers/<claim_id>.yaml) strictly from the repository's verified referent/claim data plus sources verified in-session, validates it, and verifies the rendered page. Trigger on "write a dossier for <claim>", "give <claim_id> a page", or when a claim entered via propose-claim-entry has enough circulation and verified material to warrant the deep-dive treatment.
---

# Write a Claim Dossier

## Goal
Turn one graded claim into a public fact-check page: the claim as it circulates, its grade, what the source actually says, how the wording drifted, and dated references. The page template already exists (`claim.html` + `src/js/claim-page.js`); this skill produces the content file that drives it.

## Read first
`data/claims/README.md` and `.claude/shared/dataset-conventions.md`. The dossier design spec is `docs/superpowers/specs/2026-07-07-claim-dossiers-design.md`. Worked examples: `data/claims/dossiers/C028b.yaml` (viral-number distortion), `C003b.yaml` (one-word swap), `C046b.yaml` (true-but-misleading framing).

## When a claim earns a dossier
Both must hold — a dossier is earned, not generated:
1. **Circulation:** the claim actually spreads (headlines, social, repeated citation), so a permalink-able correction has an audience.
2. **Verified material:** the referent carries enough fetched-primary substance (authoritative statement with conditions, rationale, counterclaims, references) to fill a page without inventing anything. A thin referent means the dossier waits — run `propose-claim-entry`-style research first, then write.

Circulating variants (`C###b`) are the natural candidates: the as-made/circulating gap gives the page its story.

## Dossier YAML schema (`data/claims/dossiers/<claim_id>.yaml`)

```yaml
claim_id: C028b            # must exist in claims.csv; filename must be <claim_id>.yaml
headline: "..."            # editorial page title
dek: "..."                 # one-sentence standfirst
verdict_summary: "..."     # plain-language why-this-grade paragraph
sections:                  # 2-6 sections, plain-text paragraphs
  - heading: "What circulates"
    body: "..."
  - heading: "What the source actually says"
    body: "..."
references:                # dated; every url verified in-session before citing
  - date: "2023-04-06"
    label: "..."
    url: "https://..."     # omit ONLY for repo-internal pointers (e.g. the referent itself)
    note: "..."            # optional
written: "2026-07-07"
updated: "2026-07-08"      # only when revising an existing dossier
```

The proven section arc (adapt, don't force): What circulates → What the source actually says → How the wording/number drifted (or Where the frame overstates) → What the counter-evidence says (when the claim row records counterclaims) → What would change the grade.

## Hard rules
- **The grade is never written into the dossier.** `accuracy_rating`, `claim_as_stated`, claimant, and rationale join from `claims.csv` at build time. If, while writing, you conclude the grade is wrong — STOP and flag it to the human; never write the dossier around a grade you disagree with, and never edit the grade to fit the dossier.
- **Every factual sentence must trace** to the referent/claim row data (authoritative statement, rationale, notes, counterclaims, references) or to a source you fetched and verified in this session. Thin-but-true beats rich-but-unsourced. No new numbers, dates, quotes, or attributions from memory.
- **Verify every reference URL in-session** before citing it (fetch it; confirm it is the claimed document). A reference you can't verify doesn't go in.
- **Counter-evidence keeps its names and its caveats** ("operator figures are lower, with their own boundary caveats") — never flattened into "experts say."
- **"What would change the grade" is falsification, not hedging** — state concretely what evidence would move the rating, and point at the as-made sibling when it exists.

## Workflow
1. Pick/confirm the claim (check `data/claims/dossiers/` for an existing file — update, don't duplicate).
2. Gather: the claim row, its referent, the as-made sibling, everything in `notes`/`references`. Fetch any URL you intend to cite.
3. Draft the YAML (schema above; look at the worked examples for voice — direct, specific, no dunking; the numbers carry the argument).
4. Validate: `python scripts/validate-claims.py` (includes the dossier pass), then `node scripts/build-claims.js` (fails on unknown claim_id / bad YAML).
5. Verify the rendered page at `/claim.html?id=<claim_id>` (dev server or preview tools): grade banner joins correctly, sections render, reference links live, provenance footer points at the right `#C...`/`#REF-...` anchors. The claims index row gains its READ THE DOSSIER link automatically.
6. Register: master-status W6 dossier count, decisions.md entry (what was dossier'd and why it cleared the bar).

## Output
The dossier YAML file, validator + build output, and a short review note: which claim, why it cleared the two-part bar, any statement whose sourcing is weaker than the rest (flag it — the human decides whether it stays).
