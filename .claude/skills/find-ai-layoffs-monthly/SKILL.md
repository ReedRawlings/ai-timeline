---
name: find-ai-layoffs-monthly
description: Use for the recurring (roughly monthly) sweep for new AI-attributed layoff events to propose for data/layoffs/layoffs.csv. Searches the reporting period's layoff announcements, verifies each candidate against the primary statement (memo, filing, earnings call) rather than headlines, codes the attribution, and produces proposed CSV rows plus a review summary for the human. Trigger on "monthly layoff sweep", "check for new AI layoffs", or any request to catch up the layoffs dataset for a period.
---

# Monthly AI-Layoffs Sweep

## Goal
Find layoff events from the period where someone — company, press, or analyst — attributed the cuts to AI; verify each against primary language; propose fully-coded rows. **Headlines never overwrite memos.** The single most common error in this dataset's history was press framing ("X turns to AI", "amid AI pivot") entering as if the company said it — 12 of the 32 originally migrated rows had exactly that defect and were removed on 2026-07-03.

## Read first
`.claude/shared/dataset-conventions.md`, `data/layoffs/schema.md`, and `data/layoffs/layoffs.csv` (for dedup and for the id/notes conventions in existing rows). The per-row coding rules live in the `propose-layoff-entry` skill — this skill is the discovery-and-batch wrapper around it.

## Sweep (cast wide, verify narrow)
Search each channel for the period; collect candidates with URLs:
1. **Challenger, Gray & Christmas monthly report** — the "Artificial Intelligence" reason category names companies; treat as leads, not attributions (Challenger codes company statements; re-verify each).
2. **News search** — company layoff announcements with AI framing: `"layoffs" AI [month year]`, `"cites AI" layoffs`, plus non-US phrasing (`retrenchment`, `job cuts`) — India/Global South coverage is the known structural gap; check Indian business press (ET, Mint, Nikkei Asia for APAC) explicitly.
3. **WARN filings** (press-independent, US) — for count verification of already-found events, and for large filings press missed.
4. **Earnings-call and memo coverage** — CEO statements attributing headcount changes to AI, including attrition/hiring-freeze framings (see boundary cases in schema.md).

## Verification discipline (the heart of this skill)
For every candidate, before it becomes a proposed row:

1. **Fetch the primary statement** — the company memo, blog post, SEC filing, or earnings-call transcript. If the canonical URL 403s (CNBC and sec.gov often do), find a fetchable carrier of the *verbatim* text and mark `verification_status: single_source`; never settle for a paraphrase.
2. **Compare headline vs. primary language.** The attribution code comes from the primary text only:
   - Company memo names AI as cause → `explicit_company`, quote it verbatim.
   - Company memo is silent on AI, press supplies the framing → `press_inferred`, and the quote is the *press outlet's own words with the outlet named* — plus the company's actual stated reason recorded in `attribution_notes`.
   - Editorial vibes with no citable person or outlet asserting the link in their own voice → does not clear the bar; flag as borderline rather than coding it in.
3. **Known drift patterns to reject** (all occurred in this dataset):
   - AI named as *investment destination* of a refocus while the stated cause is over-hiring/economy — record the distinction; don't upgrade to causal.
   - Reorg *of* an AI unit reported as AI-*caused* layoffs.
   - Marketing claims ("our AI does the work of N agents") entering as headcount cuts.
   - Attrition/hiring freezes reported as layoffs — in scope if company-attributed to AI, but count = undisclosed and mechanism in notes (Klarna precedent, 2026-07-03).
   - Projections ("30% could be replaced in five years") entering as counts (IBM precedent — count stays empty).
   - A quote from one event attached to a different event (check the quote's actual date and occasion).
4. **Watch both directions of AI-washing.** Companies over-crediting AI (record credible on-the-record skepticism in `attribution_notes`) and walk-backs (Amazon Oct 2025: SVP memo invoked AI, CEO denied it two days later on the earnings call — both quotes recorded, `verification_status: disputed`). The dataset codes who said what; it never adjudicates truth.
5. **Counts:** conflicting figures recorded side by side, never averaged; "undisclosed" over any guess; country split → one row per country only when the split is verified.

## Output
- Proposed new rows (CSV lines matching the schema), each carrying its verbatim quote (or an explicit statement of why none exists) and fetched URLs.
- A review summary for the human: per candidate — attribution code and why; anything borderline, disputed, or rejected-at-the-bar (list the rejects with one line each, so the human can overrule); dedup notes against existing rows.
- Do NOT write to `layoffs.csv` directly unless asked — the human reviews first. After approval: append rows, run `python scripts/validate-layoffs.py`, rebuild with `node scripts/build-layoffs.js`, and add `layoff_ids` to any timeline-worthy events (dataset row first, event second).

## Hard rules
- No fabrication. A quote you didn't fetch doesn't go in quote marks. A number without a link doesn't enter.
- Headlines are leads; memos are evidence.
- Borderline → flag it. Err toward surfacing so the human decides.
