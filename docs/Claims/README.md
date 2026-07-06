# AI Claims Repository — schema and conventions

Two tables, related by a foreign key. Designed to be read and edited by an LLM or a
human. Current size: 41 referents, 44 claims. Expected to stay in the low hundreds.

## The two tables

### `referents.csv` — one row per underlying fact, finding, event, or source-of-truth
A *referent* is the thing claims are *about*: an IMF finding, a court ruling, a
measured figure, a person's stated position. It carries the authoritative version and
the evidentiary character of that underlying thing. Multiple claims can point at one
referent (e.g., an accurate statement and a distorted paraphrase of the same finding).

Columns:
- `referent_id` — primary key (e.g., `REF-IMF-EXPOSURE`).
- `category`, `subcategory` — controlled vocabulary (see below).
- `referent_summary` — the underlying thing in neutral terms.
- `source_of_truth` — the authoritative source (person/org + publication).
- `authoritative_statement` — the accurate version, as best established.
- `source_date` — date of the source.
- `source_url` — direct URL. **See the source_url note below.**
- `evidence_type` — what kind of thing backs the underlying finding (from the
  claim-analysis skill: direct measurement, controlled experiment, observational
  study, model/simulation, forecast, opinion survey, expert judgment, anecdote, bare
  assertion — or a named hybrid).
- `epistemic_basis` — the warrant of the authoritative finding, in one line.
- `notes`.

### `claims.csv` — one row per stated variant, linked to a referent
A *claim* is a specific phrasing by a specific source. The same referent can have
several claims: the claimant's own wording plus one or more circulating versions.

Columns:
- `claim_id` — primary key (e.g., `C003`, `C003b`).
- `referent_id` — **foreign key** into `referents.csv`.
- `variant_type` — `as-made` (the claimant's own wording) or `circulating` (a
  paraphrase/distortion in wider circulation).
- `claim_as_stated` — the wording of this variant, hedges intact.
- `claimant`, `claimant_role`, `claim_source`, `claim_date`.
- `accuracy_rating` — graded against the referent (see values below).
- `accuracy_rationale` — states *which version* was graded *against what reference*,
  plus the one-line reason. This is the deliverable; the rating is the index.
- `counterclaim_summary`, `counterclaimant`.
- `parent_claim_id` — **foreign key** into `claims.csv` (self-reference) for the
  narrow subclaim case; empty for ordinary claims.
- `verification_status`, `notes`.

## How the two tables work together
- Group claims by `referent_id` to see every version of one underlying thing side by
  side, each with its own accuracy grade. The gap between an `as-made` grade and a
  `circulating` grade is where distortion lives.
- The referent's `authoritative_statement` is the reference an accuracy grade is
  measured against.
- Two worked distortion pairs are already in the data:
  - `REF-IMF-EXPOSURE`: C003 (as-made, *accurate*) vs C003b ("40% at risk", *mostly
    false*).
  - `REF-USDC-ELECTRICITY`: C026 (LBNL, *accurate*) vs C026b (Canary Media post,
    *false*).

## Controlled vocabulary

### `accuracy_rating`
`accurate` · `mostly accurate` · `mixed / true-but-misleading` · `mostly false` ·
`false` · `premature / unverifiable`.
Rule: open predictions (unarrived deadlines) are `premature`, never true/false about
the world. See the claim-analysis skill.

### `category` (and typical `subcategory`)
- **Labor / Jobs** — White-collar displacement, Exposure estimates, Churn forecasts,
  Software engineering, Automation potential, Skeptical estimates, Optimistic
  scenarios, Early evidence, Policy response, Creative industries.
- **Systemic Bias** — Language/dialect bias, Image-generation bias, Power
  concentration, Facial/representational bias, Capability critique.
- **Data / Privacy / Copyright** — Copyright litigation, Copyright ruling, Creator
  consent, Privacy regulation.
- **Environment / Data Centers** — Electricity use, Water use, Emissions, Per-query
  footprint.
- **Impact Framework** — the umbrella for downstream effects on users and the
  information ecosystem. Subcategories: Cognitive effects, Chatbot dependency / mental
  health, Epistemic pollution (synthetic content, model collapse, dead-internet),
  Child safety / education. *(Only Cognitive effects is currently populated.)*
- **Existential / Safety Risk** — Catastrophic risk, Risk skepticism, Capability
  critique, Moral status / consciousness.
- **AI Hype / Bubble** — Enterprise ROI, Investment bubble.
- **Military / Autonomous Weapons** — *defined for tracking; no claims collected yet.*
- **Robotics / Physical Labor** — physical-labor displacement (factory, warehouse,
  delivery). *Defined for tracking; no claims collected yet.*

`Military / Autonomous Weapons` and `Robotics / Physical Labor` are intentionally
present with zero rows: they are collection targets, not gaps to be filled by
invention.

### `variant_type`
`as-made` · `circulating`.

## Rules for adding claims

1. **Never invent a claim or a source.** If a fact, date, or URL isn't known, leave it
   blank or mark it `pending`/`unknown` — do not guess. (Repository-wide convention,
   matching the maintainer's standing instruction.)
2. **One referent per underlying thing.** Before adding a referent, check whether one
   already exists for that fact; if so, attach the new claim to it as a variant.
3. **Grade accuracy against the referent**, and always record which version vs which
   reference in `accuracy_rationale`.
4. **Subclaims are a narrow exception** (see the claim-analysis skill). Create them
   only when the parent claim is unverifiable by normal means AND the claimant
   themselves stated concrete subclaims. Link via `parent_claim_id`. Never decompose a
   claim into testable subclaims the claimant did not make; if an analyst-derived
   subclaim is unavoidable, label it as such so it is never scored for or against the
   claimant. No subclaims exist in the current data (C010/Autor is the candidate, but
   its subclaims were not created because the source essay was not pulled).

## source_url note
`source_url` is populated only where a verified URL was available when this file was
built. Two are filled (`REF-USDC-ELECTRICITY`, `REF-PERQUERY-ENERGY`); the rest are
marked `pending - not verified in this pass`. A prior verification pass located URLs
for most claims but did not return them in a transcribable form, so they were not
copied in rather than risk transcription error. Populate `pending` rows from that pass
or by re-verifying.

## References (dated sources on a referent)

Multiple sources can document the same underlying referent. Rather than create a claim row per source, each referent carries a **`references`** column: a JSON array of dated citations. A claim is always **one row**; its supporting history lives on the referent it points to.

This is used mainly for **standing positions** a person or institution has restated over time (Musk on jobs, Gebru on power concentration, LeCun on LLM limits, Marcus on reliability, the AI-bubble discourse, Bender on "stochastic parrots"). For most referents the array is empty (`[]`); `source_url` still names the single designated/current source.

Each array element:

```json
{
  "date": "2024-05-23",
  "url": "https://...",
  "text": "verbatim quote or paraphrase of what was said",
  "kind": "verbatim" | "paraphrase",
  "provenance": "primary" | "secondary",
  "stance": "counter",          // omitted when it supports the referent's position
  "note": "provenance / verify-if-used note"
}
```

Rules:
- `text` is a short **verbatim quote** (attributed, under ~15 words) or a **`paraphrase`**; `kind` says which.
- `provenance` = `primary` (the source itself) or `secondary` (a report/summary of it). Secondary elements carry a `note` saying to verify against the primary if used.
- `stance` is omitted for supporting sources; set to `"counter"` for a dissenting source recorded on the same referent (e.g. Fidelity's "not a bubble" view under REF-BUBBLE).
- To read a position's history: parse the referent's `references`, sort by `date`. The `SOURCE/2026-VERIFY` note on these referents records whether the position still holds.

Note: `parent_claim_id` reverts to its original meaning only (subclaims). Distinct *variants* that say different things or earn different accuracy grades (e.g. `C026b`) remain separate claim rows, as before.
