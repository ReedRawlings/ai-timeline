# Stat Provenance Register

A living, fact-check-style ledger of viral AI statistics: each circulated claim traced to its primary source, with the conditions that got stripped in circulation made visible.

**Why this exists:** public discourse about AI's effects runs on laundered statistics — figures stripped of their conditions as they circulate (canonical example: "500ml of water per ChatGPT prompt"). This register records, per claim: what circulates, what the primary source actually says, and exactly which conditions were dropped in between.

## Model

The register follows the **fact-check-site model** (decided 2026-07-03): each claim is individually citable.

- Every row has a **stable, human-readable, permalink-able ID** (e.g. `water-500ml-per-prompt`). IDs never change once assigned; corrections update the row, not the ID.
- Rows are researched claim-by-claim. A row enters as `pending` and only moves to a settled status after its primary source has been fetched and read — never from memory or secondary coverage.

## Schema (`register.csv`)

| Field | Meaning |
|---|---|
| `id` | Stable kebab-case row ID. Never changes once assigned. |
| `claim_as_circulated` | The claim in the form it actually circulates, quoted/paraphrased faithfully. |
| `primary_source` | Link to the original source of the underlying figure (paper, disclosure, report) — the actual document, not coverage of it. |
| `original_figure_with_conditions` | What the primary source actually says, with all its conditions (unit basis, model, scope, date, location assumptions). |
| `conditions_stripped_in_circulation` | The specific conditions dropped between the source and the circulated form. |
| `date` | Date of the primary source (ISO). |
| `model_system_referenced` | Which model/system the original figure applies to (figures don't transfer across models). |
| `verification_status` | `verified` / `partially_verified` / `unverifiable` / `pending` — whether the primary source supports the claim as circulated. |
| `notes` | Revisions, rebuttals, follow-ups, methodology caveats — with links. |

## Rules

- **No fabrication.** A number without a checkable link does not get a settled status. `pending` is the honest default.
- **Conditions-preserving.** Never collapse a spread of estimates or a conditioned figure into one confident number — that's the failure mode this register exists to document.
- **When sources conflict, record both** with the conflict visible; don't average.
- Studies and trackers are **discourse objects, not ground truth** — report what they say, their source type, and their limitations.

## Validation

```bash
python scripts/validate-provenance.py
```

Checks: CSV parses, required fields present, IDs are unique and kebab-case, `verification_status` is in the enum, and any row with a settled (non-pending) status has a `primary_source` link.

## Related

- The **environmental disclosure ledger** (per-prompt energy/water figures) is a planned specialized shelf of this register, not a separate asset (decided 2026-07-03). Currently parked.
- Decision log: [docs/decisions.md](../../docs/decisions.md). Orientation: [docs/master-status.md](../../docs/master-status.md).
