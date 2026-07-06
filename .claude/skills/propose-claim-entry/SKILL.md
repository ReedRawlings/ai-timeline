---
name: propose-claim-entry
description: Use when a claim about AI — a viral statistic, an influencer/executive assertion, a circulated paraphrase of a study — needs to be added to the AI Claims Repository (docs/Claims/), or when an existing row needs research/verification. Traces the claim to its referent (the underlying fact/source), records as-made vs circulating variants, and grades each against the authoritative statement. Trigger whenever someone shares a widely-cited AI claim or number ("500ml per prompt", "AI caused N layoffs", "AI will eliminate half of entry-level jobs") and wants it fact-checked into the repository — replaces the retired propose-provenance-entry skill (register merged 2026-07-05).
---

# Propose Claims Repository Entry

## Goal
Given a claim about AI, produce conforming rows for `docs/Claims/referents.csv` and `docs/Claims/claims.csv` — the referent carrying the authoritative version of the underlying thing, each claim variant graded against it.

## Read first
`docs/Claims/README.md` (the schema, controlled vocabularies, and rules — it is the source of truth for this asset) and `.claude/shared/dataset-conventions.md`. Everything below assumes both.

## Workflow

1. **Dedup at the referent level.** One referent per underlying thing. Search `referents.csv` before creating one — a new phrasing of an already-tracked finding is a new *claim variant* attached to the existing referent, not a new referent. (Precedent: the viral "500ml water" claim is C028b under the existing REF-REN-WATER, not its own referent.)
2. **Trace to the primary source and fetch it** — the paper, disclosure, filing, or post itself. The referent's `authoritative_statement` is written from the fetched primary, quoted where possible, with conditions intact (unit basis, model, scope/boundary, date, hedges). No fetch → fields stay blank/`pending`; never enter from memory or secondary coverage.
3. **Code the variants:**
   - `as-made` — the claimant's own wording, hedges intact, with claimant/role/source/date.
   - `circulating` — the paraphrase that actually spreads (id = parent claim id + `b` when it pairs with an as-made row). The gap between the two grades is where distortion lives — make it visible.
4. **Grade against the referent**, and say in `accuracy_rationale` which version was graded against what reference. Open predictions (unarrived deadlines) are `premature / unverifiable`, never true/false. Bare assertions with no disclosed methodology are also `premature / unverifiable` — even when the quote itself is verbatim-verified (grade the substance, verify the quote; note the distinction).
5. **Record counterclaims** in their fields, named — never averaged into the grade.
6. **Standing positions restated over time** go in the referent's `references` JSON array (dated, verbatim vs paraphrase, primary vs secondary), not as one claim row per restatement.
7. **Subclaims** (`parent_claim_id`) only per the README's narrow exception: the claimant themselves stated them. Never decompose a claim into tests the claimant didn't make.

## Output
The new/updated CSV rows, plus a short review note: referent dedup result, grades assigned and why, anything borderline (no clear head proponent — see `docs/prds/claims-proponent-display-prd.md`; conflicting sources; a claim that's really several). Borderline → flag it; the human decides.

## Hard rules
- IDs are permanent (`REF-*` uppercase slug; `C###`/`C###b`). Corrections update the row, not the ID.
- Never invent a claim, source, date, or URL. Blank/`pending` beats a guess.
- When sources conflict, record both visibly; don't average.
- There is no validation script for this asset yet — self-check FK integrity (every `referent_id` in claims.csv exists in referents.csv) before finishing.
