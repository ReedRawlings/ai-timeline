# Adoption/Usage Panel — PRD

**Status:** Provisionally approved 2026-07-07 under Reed's delegation ("act without me, keep a record of the decisions") — v1 seed built same day (`data/adoption/`); §8 resolutions below were decided by Claude and are open to reversal on Reed's review
**Owner:** Reed
**Last updated:** 2026-07-07
**Source recon:** all survey facts below verified by live fetch on 2026-07-07 (Pew W187 topline PDF, Gallup AI Indicator page, and Census AI-wording-change PDF spot-checked directly; remaining facts from fetched pages recorded per source)

---

## 1. Background & premise

The project needs an empirical brake on inferring prevalence from discourse volume: media and social chatter about AI adoption moves with news cycles, while measured adoption moves slowly and unevenly. The panel is a maintained, conditions-preserving register of what recurring, methodologically documented surveys actually report about generative-AI usage — with **survey disagreement kept visible rather than averaged**.

The disagreement is not noise to be smoothed; it is the finding. As of early/mid-2026, fully verified estimates for "AI adoption" span roughly **13% to 62%** depending entirely on conditions:

- Census BTOS: ~19.8% of US employer businesses used AI in the last two weeks (May 2026)
- Gallup: 28% of US employees use AI at work a few times a week or more; 50% a few times a year or more (Feb 2026)
- Pew: 49% of US adults ever use an AI chatbot; 44% use ChatGPT specifically (Feb 2026)
- RPS/GenAI Adoption Tracker: 61.8% of US adults 18–64 use generative AI (May 2026)

All four are defensible. They differ because population, construct ("AI" vs "generative AI" vs "chatbots"), recall window, and frequency threshold differ. A panel that preserves those conditions turns "what fraction of people use AI?" from a quotable number into an inspectable table — and feeds the Claims Repository when a stripped-of-conditions version starts circulating.

## 2. What this asset is — and is not

**Is:**
- A register of published survey estimates of genAI/AI usage, one row per survey × wave × question, each carrying its verbatim wording, base population, and field dates
- A documentation layer for **wording breaks** — every core source has at least one, and two are exemplary: Census cut a new time series in Dec 2025 because a wording change alone produced a level shift; Pew's 2026 redesign moved the headline from "34% have ever used ChatGPT" to "49% ever use an AI chatbot"
- A quarterly-maintained public dataset, same transparency standard as `data/layoffs/`

**Is not:**
- A poll aggregator or "polls average" — no composite, no blending, no trend-fitting across sources (whether narrow within-class aggregation is ever admissible: open question §8.8)
- A nowcast or model of "true" adoption
- An attitudes tracker (AI optimism/worry items are out of scope for v1; usage/adoption only — but see §8.9: an attitudes extension is wanted eventually)
- A repository of vendor marketing statistics

## 3. Core sources (v1)

Four core sources, spanning three populations (decided 2026-07-07, human confirmed: RPS elevated to core; scope US-only for v1).

| # | Source | Instrument | Population | Cadence | Series start | Wording | Data access |
|---|---|---|---|---|---|---|---|
| 1 | Pew Research Center | American Trends Panel (waves incl. W131/W142/W164/W187); separate workers series (W157/W178) | US adults (n≈5,000/wave, probability panel); employed adults for workers series | ~Annual (Feb–Mar fielding since 2024) | Mar 2023 (ChatGPT items); Jul 2023 (first direct use question) | **Published** — verbatim in topline PDFs per wave | Topline/questionnaire PDFs free; microdata released with >1yr lag |
| 2 | Gallup | Gallup Panel Workforce Study ("WF Qx"); surfaced on the standing "Indicator: Artificial Intelligence" page | US employed adults 18+ (n≈19k–24k/wave, probability panel) | Annual Q2 2023–2024; **quarterly since Q2 2025** | May 2023 | **Unpublished stems** — Gallup publishes response-bucket definitions and methods paragraphs, not questionnaires (see §6) | Free articles/indicator page; microdata paywalled |
| 3 | US Census Bureau | Business Trends and Outlook Survey (BTOS), core AI items (OMB 0607-1022) | US employer businesses excl. farms (~1.2M sample, 6 rotating panels) | Biweekly | Sep 2023 | **Published** — verbatim, both wording regimes, in Census's own change memo | Free downloads (portal is JS-gated; no confirmed API) |
| 4 | Bick–Blandin–Deming | Real-Time Population Survey genAI module / "GenAI Adoption Tracker" (Management Science 2026; NBER w32966) | US adults 18–64 (online panel weighted to CPS/ACS benchmarks) | Quarterly since Aug 2024 (pilot Jun 2024) | Jun/Aug 2024 | **Published** — in paper + appendix | Tracker site (genaiadoptiontracker.com) aggregates; no public microdata found |

### 3.1 Documented wording breaks (must be first-class in the schema)

- **BTOS, Nov 17 2025:** "in producing goods or services" → "in any of its business functions." Census: "Due to a level shift observed in conjunction with the new question wording, the decision was made to create a new time series for the AI questions." Old series preserved as "AI Core Questions (Original)." The ~4% (Nov 2023) → ~19.8% (May 2026) trajectory is **not** a single comparable series.
- **Pew adults, three regimes:** (a) Mar 2023 — purpose battery only ("Have you ever used ChatGPT for any of the following?"), source of the 14% figure; (b) Jul 2023–Feb/Mar 2025 — GPTUSE "Have you ever used ChatGPT?" asked of ChatGPT-aware adults: 18% → 23% → 34%; (c) Feb 2026 — CHATUSEMOD "Do you ever use an artificial intelligence (AI) chatbot like ChatGPT, Gemini or Copilot?" asked of all adults: 49%, plus per-brand CHATSPEC (ChatGPT 44%). The Aug 2024 bridge item (CHATUSE, "Have you **ever** used…": 33%) differs from 2026's "Do you **ever** use…" — ever-use vs current-use.
- **Gallup, Q3 2025:** the organizational-AI-implementation item added a "don't know" option; Gallup states results from Q3 2025 onward are not directly comparable with earlier waves. (The individual-usage frequency item has no announced break.)
- **Pew base changes:** pre-2026 usage items were asked only of aware respondents; Pew re-based prior waves to all adults in the 2026 topline. Rows must record which base a published number uses.

### 3.2 Construct differences (also first-class)

Gallup asks about "AI" broadly; BTOS asks about "Artificial Intelligence (AI)" with a fixed example list; Pew 2026 asks about "AI chatbots"; RPS asks about "Generative AI." These are different constructs and the schema records them (`construct` field) rather than treating all as "AI adoption."

## 4. Candidate sources (not v1 — flagged for human call at each quarterly sweep)

Ranked by fit (recurring + documented + measures genAI usage). Verified 2026-07-07 unless marked pending.

1. **Eurostat ICT household survey** — official EU statistics; annual genAI items since 2025 (32.7% of EU individuals); public tables + model questionnaire. First-choice international anchor if scope expands.
2. **Fed SHED** — probability panel, public microdata, full questionnaire; AI module has run in exactly **one** wave (Oct 2025, published May 2026). Include when a second wave confirms recurrence.
3. **Reuters Institute Digital News Report** — annual, ~48 markets, wording published; AI-chatbot items trended 2025→2026.
4. **Ipsos AI Monitor** — annual, 32 countries; wording in report PDFs; online quota samples (not probability).
5. **AP-NORC** — AmeriSpeak probability panel with public use files; ad-hoc cadence, no committed AI tracker.
6. **Atlanta Fed Survey of Business Uncertainty** — monthly firm survey with recurring AI items, employment-weighted (a deliberate contrast with BTOS's share-of-businesses). Surfaced by the Fed Board's Apr 2026 FEDS note "Monitoring AI Adoption in the U.S. Economy," which cross-walks BTOS/RPS/SBU wording — useful methods reference regardless of inclusion.
7. **NTIA/Census CPS Computer and Internet Use Supplement (Nov 2025)** — AI items recommended by stakeholders; **pending — final instrument unconfirmed**. If AI items exist, best-in-class frame (CPS, public microdata).
8. **YouGov trackers** — high-frequency, transparent per-poll toplines; opt-in panel, ad-hoc wording drift.
9. **Youth/student series** (Pew Teens via Ipsos KnowledgePanel; Walton–Gallup Voices of Gen Z; Lumina–Gallup students) — recurring, but population expansion beyond v1 scope.
10. **Aggregators** (Stanford HAI AI Index, OECD ICT database) — cite-the-underlying-survey only; never a row source.
11. **Vendor tier** (Microsoft/LinkedIn Work Trend Index, Slack Workforce Index, McKinsey State of AI) — excluded: methodology opacity, and Microsoft's 2026 wave sampled AI-users-only, making adoption rates uncomputable. Reconsider only with an explicit transparency caveat mechanism.

## 5. Schema

Two CSVs plus a README, following the Claims Repository's two-table pattern. Source-level profiles (frame, panel methodology, access URLs) live in the README, not repeated per row.

### 5.1 `data/adoption/questions.csv` — one row per question version

A "question version" is a unique combination of survey, wording, and base. A wording change creates a **new row** linked to its predecessor — this is how breaks stay visible.

| Field | Notes |
|---|---|
| `question_id` | Stable PK, e.g. `pew-gptuse`, `pew-chatusemod`, `btos-current-v1`, `btos-current-v2`, `gallup-wf-freq`, `rps-work-use` |
| `survey_id` | e.g. `pew-atp`, `pew-atp-workers`, `gallup-wf`, `btos`, `rps` |
| `wording_verbatim` | Exact published text incl. parentheticals/example lists. Empty **only** when `wording_status` ≠ `published` |
| `wording_status` | `published` / `paraphrased` / `unpublished` — Gallup rows carry `unpublished` plus Gallup's own published definitions in `publisher_definition` (decided 2026-07-07: include Gallup, never fake a stem) |
| `publisher_definition` | Verbatim publisher-provided definition when stems are unpublished (e.g. Gallup: "'Total AI users' as employees who say they used AI at work a few times a year or more") |
| `construct` | `ai_broad` / `generative_ai` / `ai_chatbot` / `brand_specific` |
| `concept` | `ever_use` / `current_use` / `frequency` / `work_use` / `intended_use` / `org_adoption` |
| `base_population` | Verbatim description of who was asked (e.g. "US adults who heard at least a little about ChatGPT") |
| `response_options` | Published option list |
| `first_fielded` / `last_fielded` | Dates; `last_fielded` empty while active |
| `supersedes` / `superseded_by` | question_id links across wording breaks |
| `break_note` | What changed and the publisher's own statement about comparability |
| `source_url` | Where the wording (or definition) was verified |

### 5.2 `data/adoption/estimates.csv` — one row per survey × wave × question

(Decided 2026-07-07: grain is survey × wave × question, not survey × wave.)

| Field | Notes |
|---|---|
| `estimate_id` | PK, e.g. `pew-chatusemod-2026w187` |
| `question_id` | FK |
| `wave_label` | Publisher's own label (e.g. "Wave 187", "WF Q1 2026", "Dec 14 2025–May 3 2026 collection period") |
| `field_start` / `field_end` | Exact field dates |
| `value` | The published headline share for this question (percent). **Never derived, never averaged, never read off a chart** — publisher-stated numbers only; a chart-only number is `pending` |
| `value_base` | Base the published number uses (`all_adults` / `aware_only` / `users_only` / `employed` / `businesses` …) — Pew publishes both bases for some items; each is its own row |
| `distribution` | Optional JSON of the full response distribution when published (open question §8.3) |
| `n` / `moe` | As published; `undisclosed` is valid |
| `comparability_flag` | `none` / `new_series` / `rebased` / `base_change` / `publisher_break_note` |
| `publication_url` | Direct link to the topline/PDF/page carrying the number |
| `retrieved_date` | When we verified it |
| `notes` | Conditions that don't fit elsewhere, in the publisher's words where possible |

### 5.3 Validation

`scripts/validate-adoption.py` mirroring the other datasets: PK/FK integrity, enum checks, date sanity, `wording_verbatim` required when `wording_status=published`, `supersedes` chains resolve, no orphan estimates. Wire into the existing CI validate workflow.

## 6. Inclusion criteria

A source qualifies for rows when **all** hold:

1. **Recurring:** ≥2 fielded waves of the same instrument, or an official committed cadence (this is why SHED waits and one-off polls never enter).
2. **Methodologically documented:** published sampling frame, field dates, sample size, and mode. Probability samples preferred; documented non-probability panels (RPS) admissible with the frame recorded honestly.
3. **Publisher-primary:** estimates entered only from the publisher's own topline/report/data file — never from press coverage of the survey. (Same headline-vs-memo discipline as the layoffs dataset.)
4. **Usage/adoption measure:** the item measures use, frequency of use, or adoption — not attitudes, awareness alone, or expectations (BTOS's next-6-months item is admitted as `intended_use` because it's half of the instrument's design; general "will AI matter" items are not).
5. **Wording honesty:** verbatim wording captured when published; when not published, the row says so (`wording_status=unpublished`) and carries only the publisher's own definitions. A paraphrase is never entered as a stem.
6. **Vendor/self-interested surveys excluded** absent a specific human call with a transparency caveat.

Standing rules inherited from the project: no fabrication; "undisclosed"/"pending" beat a guess; ambiguous or consequential calls flagged to the human, not decided silently.

## 7. Keeping disagreement visible

1. **No composite, ever.** No average, index, or model across sources. (Same posture as the MNI/backlash separation: constructs measured differently are reported separately.)
2. **Breaks are separate series.** A superseding question version is a new `question_id`; any chart or table renders it as a new line, following Census's own practice of cutting a new time series at the Nov 2025 wording change. No splicing.
3. **Conditions travel with the number.** Any display surface must show population + construct + concept + recall window alongside the value — the minimum condition set that explains why 19.8%, 28%, 49%, and 61.8% coexist.
4. **The spread is the headline.** If this panel ever gets a site page, its lede stat is the range across sources for the most recent quarter, not any single number.
5. **Claims Repository linkage.** When a circulating claim strips conditions from one of these estimates (e.g. quoting the post-break BTOS level against the pre-break series), that's a claims.csv entry with the panel row as referent — the panel supplies referents, the repository grades the distortions.

## 8. Open questions for Reed

1. **BTOS ingestion grain.** BTOS publishes biweekly. Ingest every biweekly national estimate (~26 rows/question/year), or one row per quarterly sweep recording the latest biweekly value (with the collection period in `wave_label`)? Recommendation: all biweekly national points, batch-entered quarterly — cheap, and the within-quarter wiggle is real data. Your call.
2. **Sub-national / demographic cuts.** v1 proposal is national headline estimates only (state/sector/firm-size/demographic cuts stay in the publisher's files, linked via `publication_url`). Confirm, or name cuts worth carrying (e.g. BTOS by sector, Pew by age).
3. **Full distributions vs headline shares.** Store the whole response distribution (JSON `distribution` field) when published, or only the headline share per question? Recommendation: store it when the publisher prints it — frequency distributions are where "adoption" claims get inflated (a "few times a year" user counted as an "AI user").
4. **Pew usage-adjacent items.** CHATFREQ/CHATWHY (purpose batteries: work use 63% of users, medical advice 42%, companionship 8%) are usage-conditional. Include as `concept=frequency`/purpose rows, or usage-incidence only in v1?
5. **Archive-at-entry.** Adopt the Wayback-snapshot-at-entry mechanic (already earmarked for the prediction tracker) for every `publication_url`? Pew/Census PDFs are stable; Gallup's indicator page is a living page that gets overwritten quarterly — snapshotting it is the only way to preserve what it said at entry time. Recommendation: yes, at least for living pages.
6. **Display surface.** Dataset-only at v1, or plan a site page (fifth nav entry) now? Recommendation: dataset-only; revisit after a few quarters of rows exist (mirrors how layoffs/claims earned their pages).
7. **Candidate promotions.** Standing quarterly question: SHED (on wave 2), NTIA (if AI items confirmed in the Nov 2025 instrument), Atlanta Fed SBU (employment-weighted contrast to BTOS), Eurostat (if international scope opens). Each needs your call at promotion time.
8. **Comparability classes / narrow aggregation** (raised by Reed 2026-07-07). Whether near-identical questions can ever support cross-source aggregation. Today the four core sources form no defensible class (different constructs, populations, concepts, recall windows), so there is nothing to average; as sources accumulate, genuinely comparable items may emerge (e.g. adult genAI ever-use across SHED/NTIA/RPS). Recommendation: add a derived `comparability_class` field; within-class display as a **range (min–max), never a mean** — a range keeps disagreement visible, a mean manufactures an unpublished number. Anything beyond a range would partially reverse the no-composite posture and needs an explicit decisions.md reversal row.
9. **Attitudes extension** (Reed wants this eventually, 2026-07-07). The same core waves already carry attitude items (Pew W187: AIPACE 63% "too quickly," AIIMP, REGCONFG/REGCONFI; Bentley–Gallup; Ipsos AI Monitor), so the cheap path is `concept=attitude` rows in this schema rather than a new asset. Overlap with the backlash tracker's Reddit/HN sources is complementary, not duplicative — surveys measure population attitudes, the grassroots streams measure self-selected discourse (same construct-separation logic as the MNI decision, 2026-07-01). Decide at sign-off whether attitudes enter v1, v1.1, or live elsewhere.

### §8 resolutions (2026-07-07 — decided by Claude under Reed's delegation "act without me, keep a record"; each reversible on review)

1. **BTOS grain:** all published biweekly national points, batch-entered at the quarterly sweep. v1 seed carries only the publisher-stated anchor points (3.7 / 3.9 / 5.4 / 6.5 / 19.8 / supplement 18–32); the point-by-point backfill waits on a browser session for the JS-gated download portal.
2. **Cuts:** national headline estimates only; publisher files carry the cuts via `publication_url`.
3. **Distributions:** stored as JSON when the publisher prints them (implemented: USEAI ×5, CHATFREQ ×2). `value` may be empty only when a distribution is present — a frequency item with no publisher-stated headline share gets no invented one.
4. **Pew usage-adjacent items:** incidence + frequency + work-use items are in (GPT2 work item, CHATWHY2-WRK, AIWRKDONE); the non-work purpose batteries (medical advice, companionship, etc.) stay out of v1.
5. **Archive-at-entry:** adopted for living pages (Gallup Indicator, genaiadoptiontracker.com). Wayback is blocked from this harness, so snapshots are a human/browser step queued for the first sweep; stable PDFs rely on `retrieved_date`.
6. **Display surface:** dataset-only. `data/adoption` added to the Vercel deploy-skip list alongside `data/layoffs` (no page renders it).
7. **Promotions:** none at seed. NTIA is dead (no AI items in the fetched Nov 2025 instrument); SHED waits on the ≥2-waves check (2024 questionnaire unverified); SBU and Eurostat remain candidates.
8. **Comparability classes:** field deferred — no defensible class exists among current sources; revisit when one does (range-not-mean stands).
9. **Attitudes:** deferred to v1.1 — keeps v1's usage-only inclusion criterion clean; the schema extension (`concept=attitude`) is designed and cheap when wanted.

## 9. Update cadence & maintenance

- **Quarterly sweep** (matches Gallup's and RPS's cadence; Pew is annual; BTOS batch-entered per §8.1). Sweep checks: new waves from the four core sources; wording/base changes (diff current questionnaires against `questions.csv`); candidate-promotion triggers (§8.7).
- Encode as a `find-adoption-waves-quarterly` skill once in Development, mirroring `find-ai-layoffs-monthly` (publisher-primary discipline, adversarial verification of numbers against the actual topline).
- Master-status maintenance line on deploy: **Quarterly**.

## 10. Known gaps at PRD time (recorded, not blocking)

- Gallup verbatim stems unpublished (handled by §5.1 `wording_status`; decided 2026-07-07).
- BTOS supplement questionnaire text + download-file manifest sit behind a JS-gated page — needs one browser session during build to capture the supplement items and file structure. Supplement items are otherwise out of core v1.
- No confirmed BTOS API; ingestion is manual/file-based.
- RPS microdata not public; tracker aggregates + paper tables are the source of record.
- NTIA Nov 2025 AI items unconfirmed (§8.7).

## 11. Success criteria

- Every estimate row traces to a publisher-primary URL with verbatim (or explicitly-marked-unpublished) wording attached via its question row.
- All four documented wording breaks (§3.1) are representable in the schema without splicing, and a reader can reconstruct why any two headline numbers differ from the row conditions alone.
- No composite/average appears anywhere in the dataset or any future display.
- Quarterly sweeps sustainable in under ~2 hours of work (the "cheap and self-contained" premise that justified un-parking this asset).
