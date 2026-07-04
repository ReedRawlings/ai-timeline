#!/usr/bin/env python3
"""Validate data/provenance/register.csv.

Checks:
- CSV parses and has the expected header
- required fields present (id, claim_as_circulated, verification_status)
- ids unique and kebab-case
- verification_status in the allowed enum
- rows with a settled (non-pending) status have a primary_source link
"""
import csv
import re
import sys
from pathlib import Path

REGISTER = Path(__file__).resolve().parent.parent / "data" / "provenance" / "register.csv"

EXPECTED_HEADER = [
    "id",
    "claim_as_circulated",
    "primary_source",
    "original_figure_with_conditions",
    "conditions_stripped_in_circulation",
    "date",
    "model_system_referenced",
    "verification_status",
    "notes",
]
STATUS_ENUM = {"verified", "partially_verified", "unverifiable", "pending"}
ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
DATE_RE = re.compile(r"^\d{4}(-\d{2}(-\d{2})?)?$")


def main() -> int:
    errors = []

    if not REGISTER.exists():
        print(f"ERROR: {REGISTER} not found")
        return 1

    with REGISTER.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames != EXPECTED_HEADER:
            errors.append(
                f"header mismatch:\n  expected: {EXPECTED_HEADER}\n  found:    {reader.fieldnames}"
            )
            rows = []
        else:
            rows = list(reader)

    seen_ids = set()
    for i, row in enumerate(rows, start=2):  # line 1 is the header
        rid = (row.get("id") or "").strip()
        if not rid:
            errors.append(f"line {i}: missing id")
        elif not ID_RE.match(rid):
            errors.append(f"line {i}: id '{rid}' is not kebab-case")
        elif rid in seen_ids:
            errors.append(f"line {i}: duplicate id '{rid}' (ids are permanent and unique)")
        seen_ids.add(rid)

        if not (row.get("claim_as_circulated") or "").strip():
            errors.append(f"line {i} ({rid}): missing claim_as_circulated")

        status = (row.get("verification_status") or "").strip()
        if status not in STATUS_ENUM:
            errors.append(
                f"line {i} ({rid}): verification_status '{status}' not in {sorted(STATUS_ENUM)}"
            )

        source = (row.get("primary_source") or "").strip()
        if status and status != "pending" and not source.startswith("http"):
            errors.append(
                f"line {i} ({rid}): status '{status}' requires a primary_source link "
                "(a number without a link doesn't get a settled status)"
            )

        date = (row.get("date") or "").strip()
        if date and not DATE_RE.match(date):
            errors.append(f"line {i} ({rid}): date '{date}' not YYYY[-MM[-DD]]")

    if errors:
        print(f"FAIL: {len(errors)} problem(s) in {REGISTER.name}")
        for e in errors:
            print(f"  - {e}")
        return 1

    print(f"OK: {REGISTER.name} — {len(rows)} row(s) valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
