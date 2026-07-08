---
name: find-adoption-waves-quarterly
description: Use for the recurring (quarterly) sweep of the adoption/usage panel (data/adoption/) — ingesting new waves from Pew, Gallup, Census BTOS, and the RPS GenAI Adoption Tracker, diffing questionnaires for wording changes, and checking candidate-source promotion triggers. Trigger on "adoption sweep", "update the adoption panel", "new survey waves", or any request to catch the adoption dataset up to the present quarter.
---

# Quarterly Adoption-Panel Sweep

## Goal
Append new survey-wave estimates to `data/adoption/estimates.csv` and catch wording/base changes before they silently splice a series. **Publisher-primary only; append-only; a wording change is a new question row, never an edit.** The panel's premise is that survey disagreement stays visible — the sweep's job is to preserve conditions, not to reconcile numbers.

## Read first
`data/adoption/README.md` (schema + backfill queue), `docs/prds/adoption-usage-panel-prd.md` §8–9 (resolved scope decisions), `docs/prds/adoption-usage-panel-recon.md` (per-source profiles, verbatim wording, URLs). Run `python scripts/validate-adoption.py` before and after.

## Standing rules
1. **Append-only.** Never modify an existing estimate row except to fix a demonstrated transcription error. If a re-pulled publisher file shows a *different value for an already-ingested cycle*, that is a publisher revision: flag it to the human with both values, log it in decisions.md — do not overwrite silently.
2. **Questionnaire diff before numbers.** For each source, compare the current instrument against the `wording_verbatim` in `questions.csv`. Any change → new question row + `supersedes`/`superseded_by` links + `break_note` quoting the publisher's own comparability statement. BTOS (Nov 2025) and Pew (2026 redesign) have each already done this once.
3. **Values are publisher-stated** — from toplines, data files, or the publisher's own prose. Never derived, averaged, or read off a chart. Distribution-only items get an empty `value` + JSON `distribution`.
4. **Archive living pages at entry** (Wayback via the human's browser — web.archive.org is blocked from the harness): Gallup Indicator page, genaiadoptiontracker.com. Pew topline PDFs and Census files at dated URLs don't need it; our rows' `retrieved_date` covers in-place-overwritten data files.

## Per-source playbook

### BTOS (biweekly; ~6–7 new cycles per quarterly sweep)
- **Try the API first** (found 2026-07-07): documented no-auth JSON endpoints at `census.gov/hfp/btos/api_docs` — `GET /hfp/btos/api/periods`, `/questions`, `/periods/{id}/data`. As of Jul 2026 it carries the core AI items (QID 6 current / 24 future) but NOT the supplement; cross-check API values against the XLSX once before trusting it as primary. Files live at stable URLs but are **overwritten in place**. New-wording series: `https://www.census.gov/hfp/btos/downloads/National.xlsx`. Old-wording series (frozen): `.../AI%20Core%20Questions.xlsx`. The manifest page (`census.gov/hfp/btos/data_downloads`) is JS-gated — needs Claude-in-Chrome; the file URLs themselves respond to direct GET.
- File structure (verified 2026-07-07): sheet1 = "Response Estimates" — rows keyed by Question ID (`7` = current use, `24` = intended use, new numbering) × Answer, columns = cycle codes (YYYYWW-fortnight, newest first), values like `"17.3%"`, `.` = not collected. sheet2 = standard errors (same layout). sheet5 = "Collection and Reference Dates" (Excel serial dates; first row of each sample-year group carries an extra leading cell — match cells by the `/^20\d{4}$/` cycle code, then take the next four values as collection start/end, reference start/end). sheet6 = data dictionary. Strings are inline (`t="inlineStr"`), no sharedStrings table in the core files (the supplement file HAS sharedStrings — different parser path).
- If the portal must be re-enumerated: fetch the xlsx in-page and parse with a minimal zip reader (EOCD → central directory → `DecompressionStream('deflate-raw')` on the sheet XML). Return extracted JSON only — a bulk base64 file transfer was blocked by the safety classifier on 2026-07-07; don't retry that route.
- Row conventions: `estimate_id` = `<question_id>-<cycle>`, `wave_label` = `BTOS cycle <code>`, field dates = collection period, notes carry the reference period, `comparability_flag=new_series` for v2 rows. Known structural gap: cycles 202521–202523 (shutdown) — never "missing data to find."
- Also diff the two questionnaire PDFs (`survey_questionnaires/BTOS_Core_Questionnaire_V4.pdf`, `BTOS%20Core%20and%20AI%20Content.pdf`) — direct web_fetch works on both.

### Gallup Workforce Study (quarterly; waves field ~Feb/May/Aug/Oct-Nov)
- Each wave gets a workplace article (stable URL) with the trend + survey-methods tables — that's the citation target; the Indicator page (gallup.com/699797) is living and gets overwritten (archive first).
- Three derived measures per wave (total/frequent/daily users) → three rows, plus a distribution row for the underlying item (Q619A, verbatim stem captured 2026-07-07 from the Q4 topline PDF — image-locked to text extraction; render in a browser, e.g. Google Docs viewer, and read the pages as screenshots). Each wave article links a topline PDF: grab it for the distribution and the item-level n (which can be a half-subsample — see the question rows). Watch for new break notes like the Q3 2025 "don't know" addition to the org item (Q653A).

### Pew ATP (annual adults wave, fields ~Feb; workers wave fields ~Sep-Oct)
- New waves announce via pewresearch.org reports; each topline is a new stable PDF. Ingest from the topline only (short reads for combined figures the topline doesn't print, e.g. re-based work-use shares).
- Check every trend table footnote — Pew documents its own base changes and re-basings there; those footnotes are `break_note`/`comparability_flag` material. Also check whether ATP microdata for W164+/W187 has posted (release lag was >1yr).

### RPS / GenAI Adoption Tracker (quarterly updates to a living page)
- **Revision precedent (Oct 2025):** the authors reweighted their own 2024/early-2025 waves after a sequencing test (Aug 2024: 39.4%→44.6%). Any future revision gets the same treatment used then: old rows kept + flagged, revised rows added with `publisher_break_note`, decisions.md entry.
- genaiadoptiontracker.com is overwritten in place — archive at entry, quote the exact headline strings. Wave field dates for post-2024 waves remain unpublished (standing gap — check the Management Science version, doi.org/10.1287/mnsc.2025.02523, for an updated wave table).

## Candidate-promotion checks (each sweep, PRD §8.7)
- **SHED**: 2024 questionnaire verified AI-free (2026-07-07) — Oct 2025 was the first AI wave. Promote if the Oct 2026 wave (report ~May 2027) repeats the D50-block (verbatim items + microdata URLs already in the recon doc).
- **NTIA**: dead unless the final Nov 2025 instrument (tech docs post ~mid-late 2026) contradicts the fetched draft.
- **Atlanta Fed SBU / Eurostat**: promote only on the human's call; note new waves if encountered.
- New recurring surveys encountered during the sweep: candidates list in the recon doc, flagged for the human — never self-promoted.

## Output
- Appended rows (validated), any new question rows for wording changes, README backfill-queue updates, a short review summary for the human: waves ingested, breaks/revisions found, promotion triggers hit, archive links captured.
- decisions.md entry per the session-end convention.
