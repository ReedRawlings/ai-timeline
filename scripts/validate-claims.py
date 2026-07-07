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

Usage: validate-claims.py [dir]   (dir defaults to data/claims)
"""
import csv
import json
import re
import sys
from pathlib import Path

DIR = Path(sys.argv[1]) if len(sys.argv) > 1 else (
    Path(__file__).resolve().parent.parent / "data" / "claims"
)

REF_HEADER = ["referent_id", "category", "subcategory", "referent_summary", "source_of_truth",
              "authoritative_statement", "source_date", "source_url", "evidence_type",
              "epistemic_basis", "notes", "references"]
CLAIM_HEADER = ["claim_id", "referent_id", "variant_type", "claim_as_stated", "claimant",
                "claimant_role", "claim_source", "claim_date", "accuracy_rating",
                "accuracy_rationale", "counterclaim_summary", "counterclaimant",
                "parent_claim_id", "verification_status", "notes"]
CATEGORIES = {"Labor / Jobs", "Systemic Bias", "Data / Privacy / Copyright",
              "Environment / Data Centers", "Impact Framework", "Existential / Safety Risk",
              "AI Hype / Bubble", "Military / Autonomous Weapons", "Robotics / Physical Labor"}
RATINGS = {"accurate", "mostly accurate", "mixed / true-but-misleading", "mostly false",
           "false", "premature / unverifiable", "premature"}
VARIANTS = {"as-made", "circulating"}
KINDS = {"verbatim", "paraphrase"}
PROVENANCE = {"primary", "secondary"}
REF_ID_RE = re.compile(r"^REF-[A-Z0-9-]+$")
CLAIM_ID_RE = re.compile(r"^C\d+[a-z]?$")

REQUIRED_REF = ("category", "referent_summary", "source_of_truth",
                "authoritative_statement", "source_url")
REQUIRED_CLAIM = ("referent_id", "variant_type", "claim_as_stated", "claimant",
                  "accuracy_rating", "accuracy_rationale", "verification_status")


def read(name, header, errors):
    path = DIR / name
    if not path.exists():
        errors.append(f"{name}: file not found at {path}")
        return []
    with path.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        if r.fieldnames != header:
            errors.append(f"{name}: header mismatch:\n  expected: {header}\n  found:    {r.fieldnames}")
            return []
        return list(r)


def main() -> int:
    errors = []
    refs = read("referents.csv", REF_HEADER, errors)
    claims = read("claims.csv", CLAIM_HEADER, errors)

    ref_ids = set()
    for i, row in enumerate(refs, start=2):
        rid = row["referent_id"].strip()
        ctx = f"referents line {i} ({rid or '?'})"
        if not REF_ID_RE.match(rid):
            errors.append(f"{ctx}: referent_id not REF-UPPERCASE form")
        if rid in ref_ids:
            errors.append(f"{ctx}: duplicate referent_id")
        ref_ids.add(rid)
        for req in REQUIRED_REF:
            if not row[req].strip():
                errors.append(f"{ctx}: missing {req}")
        if row["category"].strip() not in CATEGORIES:
            errors.append(f"{ctx}: category '{row['category']}' not in vocabulary")
        url = row["source_url"].strip()
        if url and not url.startswith("http"):
            errors.append(f"{ctx}: source_url must be a URL (or empty)")
        try:
            arr = json.loads(row["references"] or "[]")
            if not isinstance(arr, list):
                raise ValueError("not an array")
            for j, el in enumerate(arr):
                ec = f"{ctx} references[{j}]"
                for k in ("date", "text", "kind", "provenance"):
                    if not el.get(k):
                        errors.append(f"{ec}: missing {k}")
                if el.get("kind") and el["kind"] not in KINDS:
                    errors.append(f"{ec}: kind '{el['kind']}'")
                if el.get("provenance") and el["provenance"] not in PROVENANCE:
                    errors.append(f"{ec}: provenance '{el['provenance']}'")
                if "stance" in el and el["stance"] != "counter":
                    errors.append(f"{ec}: stance must be 'counter' or omitted")
        except (json.JSONDecodeError, ValueError) as e:
            errors.append(f"{ctx}: references is not valid JSON ({e})")

    claim_id_set = {c["claim_id"].strip() for c in claims}
    seen_claims = set()
    for i, row in enumerate(claims, start=2):
        cid = row["claim_id"].strip()
        ctx = f"claims line {i} ({cid or '?'})"
        if not CLAIM_ID_RE.match(cid):
            errors.append(f"{ctx}: claim_id not C-number form")
        if cid in seen_claims:
            errors.append(f"{ctx}: duplicate claim_id")
        seen_claims.add(cid)
        for req in REQUIRED_CLAIM:
            if not row[req].strip():
                errors.append(f"{ctx}: missing {req}")
        if row["referent_id"].strip() not in ref_ids:
            errors.append(f"{ctx}: referent_id '{row['referent_id']}' has no referents.csv row")
        if row["variant_type"].strip() not in VARIANTS:
            errors.append(f"{ctx}: variant_type '{row['variant_type']}'")
        if row["accuracy_rating"].strip() not in RATINGS:
            errors.append(f"{ctx}: accuracy_rating '{row['accuracy_rating']}' not in vocabulary")
        parent = row["parent_claim_id"].strip()
        if parent and parent not in claim_id_set:
            errors.append(f"{ctx}: parent_claim_id '{parent}' has no claims.csv row")

    if errors:
        print(f"FAIL: {len(errors)} problem(s) in {DIR}")
        for e in errors:
            print(f"  - {e}")
        return 1
    print(f"OK: referents.csv — {len(refs)} row(s); claims.csv — {len(claims)} row(s) valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
