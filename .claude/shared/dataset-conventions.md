# Datasets — Shared Conventions (source of truth)

Every dataset skill in this repo reads this file. Edit conventions here, not in individual skills.
Skills that reference this: `propose-provenance-entry`, `propose-layoff-entry`.

These conventions apply to all standalone datasets under `data/` (`data/provenance/`, `data/layoffs/`, and any future asset). They complement, not replace, each dataset's own `README.md`/`schema.md`.

---

## 1. Attribution discipline (applies everywhere)

- **Record who said it and their words.** Company ≠ press ≠ analyst. An attribution is a quote with a source, never a boolean or an editorial label.
- **A number without a link doesn't enter a dataset.** Primary source required — the actual document/statement, not a citation of a citation.
- **When sources conflict, record both** with the conflict visible. Don't average, don't pick the "better" one silently.
- **"Undisclosed" is a valid value; a guessed number is not.**
- **Studies and trackers are discourse objects, not ground truth.** Report figures with their conditions, source type, and limitations visible.

## 2. No fabrication

Nothing enters a dataset from memory, from a summary document, or from a prior chat. Every figure is re-verified against its primary source *at entry time*. If verification hasn't happened yet, the row's status says so (`pending` or equivalent) — an honest stub beats a confident guess.

## 3. Conditions-preserving

Never collapse the distinctions that matter: per-what-unit, which model/system, what scope, what date, announced vs. realized. Stripping conditions is the exact failure mode these datasets exist to document.

## 4. Stable IDs

Rows get stable, human-readable, kebab-case IDs at creation. IDs never change once assigned; corrections update the row, not the ID. (The provenance register is citable claim-by-claim; the same discipline applies to every dataset.)

## 5. Flag, don't silently decide

Borderline inclusion calls, ambiguous attributions, conflicting sources, schema-stretching cases → surface to the human with the options laid out. Err toward surfacing. This mirrors the timeline's significance-rubric pattern in `event-conventions.md`.

## 6. Validate before commit

Each dataset has a validation script (e.g. `scripts/validate-provenance.py`). Run it after any edit and before any commit. A row that fails validation doesn't ship.

## 7. Scope guard

Only two dataset builds are active at a time (see `docs/master-status.md`). If a proposed entry belongs to a parked asset, don't create the asset — flag it and record the lead in notes or an issue instead.
