#!/usr/bin/env python3
"""Validate data/layoffs/layoffs.csv.

Checks:
- CSV parses and has the expected header
- ids unique and kebab-case
- required fields present (id, company, announcement_date, source_url, verification_status)
- count is an integer or empty (empty = undisclosed; a guessed number is not a valid value)
- enums: count_precision, ai_attribution, source_type, verification_status
- dates are ISO (YYYY-MM-DD)
- a row can't claim `verified` without an ai_attribution code and attribution_quote
"""
import csv
import re
import sys
from pathlib import Path

DATASET = Path(__file__).resolve().parent.parent / "data" / "layoffs" / "layoffs.csv"

EXPECTED_HEADER = [
    "id", "company", "ticker", "announcement_date", "effective_date",
    "count", "count_precision", "country", "region_detail", "sector",
    "ai_attribution", "attribution_quote", "attribution_notes",
    "source_url", "source_type", "press_independent", "cross_references",
    "verification_status", "added_date", "updated_date", "notes",
]
PRECISION_ENUM = {"exact", "approximate", "range_low", "range_high", "undisclosed", ""}
ATTRIBUTION_ENUM = {"explicit_company", "press_inferred", "analyst_inferred", "none_stated", ""}
SOURCE_TYPE_ENUM = {"company_statement", "regulatory_filing", "press_report", "government_data", ""}
STATUS_ENUM = {"verified", "single_source", "disputed", "needs_recode"}
ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def main() -> int:
    errors = []

    if not DATASET.exists():
        print(f"ERROR: {DATASET} not found")
        return 1

    with DATASET.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames != EXPECTED_HEADER:
            errors.append(
                f"header mismatch:\n  expected: {EXPECTED_HEADER}\n  found:    {reader.fieldnames}"
            )
            rows = []
        else:
            rows = list(reader)

    seen_ids = set()
    for i, row in enumerate(rows, start=2):
        rid = (row.get("id") or "").strip()
        ctx = f"line {i} ({rid or '?'})"

        if not rid:
            errors.append(f"line {i}: missing id")
        elif not ID_RE.match(rid):
            errors.append(f"{ctx}: id not kebab-case")
        elif rid in seen_ids:
            errors.append(f"{ctx}: duplicate id (ids are permanent and unique)")
        seen_ids.add(rid)

        for req in ("company", "announcement_date", "source_url", "verification_status"):
            if not (row.get(req) or "").strip():
                errors.append(f"{ctx}: missing {req}" + (
                    " (a number without a link doesn't enter the dataset)" if req == "source_url" else ""
                ))

        count = (row.get("count") or "").strip()
        if count and not count.isdigit():
            errors.append(f"{ctx}: count '{count}' must be an integer or empty (undisclosed)")

        for field, enum in (
            ("count_precision", PRECISION_ENUM),
            ("ai_attribution", ATTRIBUTION_ENUM),
            ("source_type", SOURCE_TYPE_ENUM),
        ):
            val = (row.get(field) or "").strip()
            if val not in enum:
                errors.append(f"{ctx}: {field} '{val}' not in {sorted(v for v in enum if v)}")

        status = (row.get("verification_status") or "").strip()
        if status not in STATUS_ENUM:
            errors.append(f"{ctx}: verification_status '{status}' not in {sorted(STATUS_ENUM)}")
        if status == "verified":
            if not (row.get("ai_attribution") or "").strip():
                errors.append(f"{ctx}: verified rows need an ai_attribution code")
            if not (row.get("attribution_quote") or "").strip():
                errors.append(f"{ctx}: verified rows need a verbatim attribution_quote with source")

        for dfield in ("announcement_date", "effective_date", "added_date", "updated_date"):
            val = (row.get(dfield) or "").strip()
            if val and not DATE_RE.match(val):
                errors.append(f"{ctx}: {dfield} '{val}' not YYYY-MM-DD")

        pi = (row.get("press_independent") or "").strip()
        if pi not in ("true", "false", ""):
            errors.append(f"{ctx}: press_independent '{pi}' must be true/false/empty")

    if errors:
        print(f"FAIL: {len(errors)} problem(s) in {DATASET.name}")
        for e in errors:
            print(f"  - {e}")
        return 1

    print(f"OK: {DATASET.name} — {len(rows)} row(s) valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
