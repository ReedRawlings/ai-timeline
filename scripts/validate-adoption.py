#!/usr/bin/env python3
"""Validate data/adoption/ (questions.csv + estimates.csv).

Checks: column sets, PK uniqueness, FK integrity, enums, date formats,
wording rules (verbatim required iff published), value-or-distribution rule,
distribution JSON validity, supersedes chains, URL shape.
Exit 0 on success, 1 on any error.
"""
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUESTIONS = ROOT / "data" / "adoption" / "questions.csv"
ESTIMATES = ROOT / "data" / "adoption" / "estimates.csv"

Q_COLS = [
    "question_id", "survey_id", "wording_verbatim", "wording_status",
    "publisher_definition", "construct", "concept", "base_population",
    "response_options", "first_fielded", "last_fielded", "supersedes",
    "superseded_by", "break_note", "source_url",
]
E_COLS = [
    "estimate_id", "question_id", "wave_label", "field_start", "field_end",
    "value", "value_base", "distribution", "n", "moe", "comparability_flag",
    "publication_url", "retrieved_date", "notes",
]

SURVEY_IDS = {"pew-atp", "pew-atp-workers", "gallup-wf", "btos", "rps"}
WORDING_STATUS = {"published", "paraphrased", "unpublished"}
CONSTRUCTS = {"ai_broad", "generative_ai", "ai_chatbot", "brand_specific"}
CONCEPTS = {"ever_use", "current_use", "frequency", "work_use", "intended_use", "org_adoption"}
COMP_FLAGS = {"none", "new_series", "rebased", "base_change", "publisher_break_note"}
DATE_RE = re.compile(r"^\d{4}(-\d{2})?(-\d{2})?$")

errors = []


def err(msg):
    errors.append(msg)


def check_date(val, where):
    if val and not DATE_RE.match(val):
        err(f"{where}: bad date format '{val}' (want YYYY, YYYY-MM, or YYYY-MM-DD)")


def check_url(val, where, required=True):
    if not val:
        if required:
            err(f"{where}: missing URL")
        return
    if not val.startswith("http"):
        err(f"{where}: URL doesn't start with http: '{val[:40]}'")


def load(path, cols, name):
    if not path.exists():
        err(f"{name}: file missing at {path}")
        return []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames != cols:
            err(f"{name}: columns mismatch.\n  want: {cols}\n  got:  {reader.fieldnames}")
            return []
        return list(reader)


questions = load(QUESTIONS, Q_COLS, "questions.csv")
estimates = load(ESTIMATES, E_COLS, "estimates.csv")

# --- questions.csv ---
qids = set()
for i, row in enumerate(questions, start=2):
    where = f"questions.csv:{i} ({row['question_id'] or '??'})"
    qid = row["question_id"]
    if not qid:
        err(f"{where}: empty question_id")
    elif qid in qids:
        err(f"{where}: duplicate question_id")
    qids.add(qid)

    if row["survey_id"] not in SURVEY_IDS:
        err(f"{where}: unknown survey_id '{row['survey_id']}'")
    if row["wording_status"] not in WORDING_STATUS:
        err(f"{where}: bad wording_status '{row['wording_status']}'")
    if row["wording_status"] == "published" and not row["wording_verbatim"].strip():
        err(f"{where}: wording_status=published but wording_verbatim is empty")
    if row["wording_status"] != "published" and not row["publisher_definition"].strip():
        err(f"{where}: non-published wording needs a publisher_definition")
    if row["construct"] not in CONSTRUCTS:
        err(f"{where}: bad construct '{row['construct']}'")
    if row["concept"] not in CONCEPTS:
        err(f"{where}: bad concept '{row['concept']}'")
    if not row["base_population"].strip():
        err(f"{where}: empty base_population")
    check_date(row["first_fielded"], where)
    check_date(row["last_fielded"], where)
    check_url(row["source_url"], where)

for i, row in enumerate(questions, start=2):
    where = f"questions.csv:{i} ({row['question_id']})"
    for link in ("supersedes", "superseded_by"):
        if row[link] and row[link] not in qids:
            err(f"{where}: {link} -> '{row[link]}' not a known question_id")

# --- estimates.csv ---
eids = set()
for i, row in enumerate(estimates, start=2):
    where = f"estimates.csv:{i} ({row['estimate_id'] or '??'})"
    eid = row["estimate_id"]
    if not eid:
        err(f"{where}: empty estimate_id")
    elif eid in eids:
        err(f"{where}: duplicate estimate_id")
    eids.add(eid)

    if row["question_id"] not in qids:
        err(f"{where}: question_id '{row['question_id']}' not in questions.csv")
    if not row["wave_label"].strip():
        err(f"{where}: empty wave_label")
    check_date(row["field_start"], where)
    check_date(row["field_end"], where)

    val, dist = row["value"].strip(), row["distribution"].strip()
    if val:
        try:
            v = float(val)
            if not (0 <= v <= 100):
                err(f"{where}: value {v} outside 0-100")
        except ValueError:
            err(f"{where}: non-numeric value '{val}'")
    elif not dist:
        err(f"{where}: needs a value or a distribution (both empty)")
    if dist:
        try:
            parsed = json.loads(dist)
            if not isinstance(parsed, dict) or not parsed:
                err(f"{where}: distribution must be a non-empty JSON object")
        except json.JSONDecodeError as e:
            err(f"{where}: distribution is not valid JSON ({e})")

    if not row["value_base"].strip():
        err(f"{where}: empty value_base")
    for numfield in ("n", "moe"):
        nv = row[numfield].strip()
        if nv:
            try:
                float(nv)
            except ValueError:
                err(f"{where}: non-numeric {numfield} '{nv}'")
    if row["comparability_flag"] not in COMP_FLAGS:
        err(f"{where}: bad comparability_flag '{row['comparability_flag']}'")
    check_url(row["publication_url"], where)
    if not DATE_RE.match(row["retrieved_date"] or "") or len(row["retrieved_date"]) != 10:
        err(f"{where}: retrieved_date must be YYYY-MM-DD, got '{row['retrieved_date']}'")

if errors:
    print(f"❌ {len(errors)} validation error(s):\n")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)

print(f"🎉 Adoption panel valid: {len(questions)} question versions, {len(estimates)} estimates.")
