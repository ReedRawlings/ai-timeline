# April 2026 Review — Events + Layoffs (for human review)

**Status:** proposals only. Nothing written to `data/events.yaml` or `data/layoffs/layoffs.csv`.
No April 2026 events existed on the timeline before this pass (latest was 2026-03-20).
Every item was verified against a real source (URLs in the proposal files).

Files:
- `proposals/2026-04-events.yaml` — 14 candidate events
- `proposals/2026-04-layoffs.csv` — 4 candidate layoff rows

---

## Events — grouped by rubric

### Structural novelty (§1)
- **Anthropic Withholds Claude Mythos, Launches Project Glasswing** — 2026-04-07 · **suggested major** (FLAG). First time a frontier lab shelved a completed flagship over offensive-cyber capability and stood up a defensive consortium instead.
- **Microsoft and OpenAI Rewrite Their Partnership** — 2026-04-27 · **suggested major** (FLAG — you questioned this; case below). AGI clause removed, Azure exclusivity ended.

### Social / cultural (§2)
- **Molotov Cocktail Attack on Sam Altman's Home** — 2026-04-10 · **suggested major** (FLAG). First violent attack on a frontier-lab CEO tied to anti-AI motivation.
- **OpenAI Shuts Down the Sora App** — 2026-04-26 · notable. Hype-to-shutdown arc for a flagship 2025 consumer video product.

### Regulatory / legal (§3)
- **Appeals Court Denies Anthropic's Bid to Block Pentagon Blacklisting** — 2026-04-08 · notable. Continuation of the Mar 9 / Mar 20 thread.
- **Bipartisan CHATBOT Act Introduced** — 2026-04-28 · notable · **borderline** (bill introduction, not passage).

### Economic (§4)
- **Bezos's Project Prometheus Raises $10B for Physical AI** — 2026-04-23 · notable. ~$38B valuation, JPMorgan/BlackRock. **Added after your review — missed in the first sweep.**
- **Snap Cuts 16% of Staff, Citing AI Efficiency** — 2026-04-15 · notable · `layoff_ids: [snap-2026-04]`.
- **Meta and Microsoft Announce Sweeping Cuts Amid AI Spending Pressure** — 2026-04-23 · notable (could elevate) · `layoff_ids: [meta-2026-04, microsoft-2026-04]`. Combined ~20k drove an "AI labor crisis" narrative; note neither company named AI at announcement.
- **SpaceX Confidentially Files for Record IPO** — 2026-04-01 · notable · **borderline** (corporate/financial; is Grok-via-xAI enough for an AI timeline?).

### Model releases (§5)
- **DeepSeek Open-Sources DeepSeek V4** — 2026-04-24 · **suggested major** (FLAG). Paradigm open-source release (MIT), ~80.6% SWE-bench at a fraction of frontier cost.
- **Meta Launches Muse Spark** — 2026-04-08 · notable (**downgraded from major per your note**). Meta's first proprietary flagship (ex-"Avocado", ties to the Mar 12 delay). The open-source-reversal angle is real but soft — Meta said it "hopes" to open-source future versions — so this reads as a model launch, not a field-reordering event.
- **OpenAI Releases GPT-5.5** — 2026-04-23 · notable (could elevate). Frontier flagship, but a point release 6 weeks after GPT-5.4.
- **Anthropic Ships Claude Opus 4.7** — 2026-04-16 · notable (could elevate). 87.6% SWE-bench Verified; point release from 4.6.
- **Alibaba Releases Qwen3.6-Plus** — 2026-04-02 · notable · **borderline** (incremental within Alibaba's cadence; Max preview Apr 20 folded in).

### Tier note (revised)
4 of 15 flagged **major** (~27%) after downgrading Muse Spark — still above the ~10–12% target, but April was genuinely dense. Remaining suggested majors: Anthropic Mythos/Glasswing, the Altman attack, DeepSeek V4, and the Microsoft–OpenAI rewrite. GPT-5.5 and Claude Opus 4.7 kept at *notable* (incremental point releases). Every major is a flag for you to confirm.

### On the Microsoft–OpenAI rewrite as major (you asked)
The case for major: it's not a capability event, it's a **structural** one — removing the AGI clause deletes the governance trigger that could have severed the industry's biggest partnership the moment OpenAI's board declared AGI, and ending Azure exclusivity frees OpenAI to distribute via AWS/Google/Oracle, shifting cloud competitive dynamics. That fits the rubric's "landmark that reorders the field." The case against: it's a contract amendment with no new product, and both parties keep working together — a defensible *notable*. It's a judgment call; I left it flagged rather than decide for you.

### Correction on process (you asked if I used the skills)
I read the `find-ai-events-*` and `find-ai-layoffs-monthly` SKILL.md files and applied their method via research subagents, but did **not** run them as literal skill invocations, and I **skipped the curated-source-first step** (Hyperdimensional, TBPN, One Useful Thing, Superintelligence, Reddit) — the agents went mostly to broad web. A quick post-hoc check of thin categories (funding, hardware, robotics) immediately surfaced **Project Prometheus** (now added) and the **Anthropic round date conflict** below, which means a proper deep pass would likely find more. Recommend I re-run the criteria-first method against the curated sources before you finalize.

### Needs your call — Anthropic $65B Series H (date conflict)
Sources disagree on the month. Crunchbase's April roundup and Tracxn date the round **April 21, 2026**; Anthropic's own announcement, CNBC, and TechCrunch cluster it at **May 28, 2026** ($65B, ~$965B valuation, nearing $1T). Most likely struck/led in April, announced in May. **Not added to the April file** pending your read — if you treat the close date as April 21, it's a clear major-scale funding event and I'll add it. (The "$15B" that first surfaced was a hyperscaler subset of this same round, incl. $5B Amazon — not a separate deal.)

### Dropped / out of window (not proposed)
Llama 4 (that was Apr 2025), SpaceX–Cursor acquisition (June), **Oracle ~30,000 layoffs (Mar 31 — belongs in a March pass)**, Mistral Medium 3.5 (iterative, no clean date), NVIDIA Rubin / OpenAI–NVIDIA 10GW (GTC March / 2025, not April), robotics items (Honor marathon win Apr 19, NVIDIA Isaac GR00T models — niche/incremental), Google Cloud Next '26 (routine vendor conf), Grok 5/4.3 (slipped later), Trump pre-release-review EO (June), Five Eyes agentic-AI guidance (early May), China chip bills (committee-stage), FDA AI-pharma warning letter (narrow enforcement). Smaller April billion-dollar AI rounds seen but not proposed: Vast Data, Ineffable Intelligence (ex-DeepMind, London) — surface if you want fuller funding coverage.

---

## Layoffs — 4 candidate rows (verify-narrow findings)

**Headlines are leads, memos are evidence** — applied throughout. The two biggest headline numbers this month (Meta, Microsoft) are **press-inferred**, not company-stated.

| Row | Date | Count | Attribution | Status | Note |
|---|---|---|---|---|---|
| `snap-2026-04` | 04-15 | ~1,000 (16%) | **explicit_company** / mixed | verified | Cleanest AI-attributed cut of the month. Spiegel's memo names AI as the enabler. **Recommend include.** |
| `meta-2026-04` | 04-23 | ~8,000 (10%) | **press_inferred** / contextual | disputed | April memo (Gale) names efficiency/offsetting-investments, **not AI**. Zuckerberg's more explicit AI line came at the May 20 execution — not back-dated. |
| `microsoft-2026-04` | 04-23 | undisclosed | **press_inferred** / contextual | disputed | Voluntary retirement buyout ("Rule of 70"), ~8,750 *eligible* — an eligibility pool, not a layoff count. Company never names AI. **Borderline — you may reject entirely.** |
| `pendo-2026-04` | 04-07/08 | 90 (10%) | explicit_company / contextual | single_source | AI framing is *customers building AI*, not AI replacing Pendo's staff. Borderline vs a stricter bar. Not proposed as a timeline event. |

**Rejected at the bar (headline outran primary source):** Nike (~1,400 — "advanced automation," not AI), IBM/Red Hat (~300–500 — China→India offshoring; one outlet's headline literally says "It's Not About AI"), Cognizant Project Leap (the 12–15k figure is press extrapolation; transcript shows headcount rising), banking sector (Citigroup had a real April WARN cut but AI link is weak/press-only).

**Out of window:** Oracle ~30,000 (Mar 31 — flag for a March sweep; note a separate June Oracle 8-K *does* carry explicit company AI-causation language for ~21,000 cumulative, different figure/filing/month). Cisco, Intuit, Standard Chartered, Innovaccer — all May.

**Context (not a row):** Challenger, Gray & Christmas April 2026 report — 83,387 US cuts, 21,490 (26%) cited "Artificial Intelligence" (2nd straight month AI led all cited reasons). Aggregate/anonymized; no company-level breakout.

---

---

# DEEP PASS (criteria-first, curated sources) — added second

Re-ran the sweep the right way: curated sources first (Hyperdimensional, TBPN, One Useful Thing, Superintelligence, Reddit), then one query per rubric category, across **both April** and the **March 20–31 gap**. Every candidate below was verified by me individually. Files: net-new April events are under the `=== NET-NEW (deep pass) ===` marker in `2026-04-events.yaml`; the March gap is in `2026-03-20-to-31-events.yaml`; Oracle is in `2026-03-layoffs.csv`.

## March 20–31 events (7 net-new)
- **Anthropic Wins Preliminary Injunction Against Pentagon Blacklisting** — 03-26 · **major** (FLAG). Judge Rita Lin, 43-page ruling, "pretextual… unlawful retaliation." The Apr 8 event already in the batch is a *separate* appeals-court motion — both are real.
- **California Signs First-of-Kind AI Procurement Order (EO N-5-26)** — 03-30 · **major** (FLAG). First state vendor-certification/procurement regime; explicit counter to federal preemption.
- **OpenAI Closes Record $122B Round at $852B Valuation** — 03-31 · **major** (FLAG). Largest private financing in history; Amazon $50B (partly AGI/IPO-contingent), Nvidia + SoftBank ~$30B each.
- **Anthropic's Unreleased 'Mythos' Model Exposed in Data Leak** — 03-26 · notable. The precursor to the Apr 7 Glasswing withholding.
- **AGIBOT Builds Its 10,000th Humanoid Robot** — 03-30 · notable.
- **Claude Code Source Code Leaked via npm** — 03-31 · notable · borderline (security incident).
- **Oracle Cuts Thousands to Fund AI Data-Center Buildout** — 03-31 · notable · `layoff_ids: [oracle-2026-03]`.

## April net-new events (9)
- **Families Sue OpenAI Over Tumbler Ridge Mass Shooting** — 04-29 · **major** (FLAG). First mass-casualty wrongful-death suit against a frontier AI company; ~$1B sought.
- **Anthropic Passes OpenAI in Revenue Run-Rate** — 04-07 · notable (could elevate). $30B ARR; OpenAI disputes the figure.
- **Intel Joins Musk's Terafab AI-Chip Megaproject** — 04-07 · notable · borderline.
- **Apple Threatened to Pull Grok Over Deepfakes, Letter Reveals** — 04-14 · notable · **borderline** (threat was actually made in January, surfaced in April).
- **Honor's Humanoid Robot Wins Beijing Half-Marathon** — 04-19 · notable.
- **Google Makes Ironwood TPU GA, Previews Split Training/Inference Chips** — 04-22 · notable.
- **VAST Data Raises $1B at a $30B Valuation** — 04-22 · notable.
- **Maine's First-in-Nation Data-Center Moratorium Vetoed** — 04-24 · notable. **Reframed after verification:** it was *vetoed* by Gov. Mills and the override failed — it did NOT become law.
- **Ineffable Intelligence Raises Record $1.1B Seed** — 04-27 · notable. David Silver (ex-DeepMind).

## Layoffs — Oracle (March) added
- `oracle-2026-03` — 03-31 · count **undisclosed** · **press_inferred** / contextual · disputed. The "30,000" is a TD Cowen analyst estimate Oracle never confirmed; the termination email named only "a broader organizational change." A *separate* June 22 10-K carries explicit AI-causation language for a different ~21,000 cumulative figure — kept apart, not merged. Your call: enter the analyst estimate or keep undisclosed; and whether press-inferred clears the bar.

## Rejected in verification (important — caught real errors)
- **"Gemini 3.1 Ultra" — does not exist.** A hallucinated release from low-quality roundup sites; real model is Gemini 3.1 Pro (Feb 19). Dropped.
- **Maine "enacted a ban"** — false; it was vetoed. Reframed above.
- **Apple/Grok** as a clean April event — the threat was January; reframed as a disclosure, marked borderline.
- **Grok 4.20 GA** — date unverifiable within the window (Mar 18–22), possibly out of window. Left out.
- **Musk French-prosecutor summons (Apr 20)** — only a secondary aggregator found; left out pending a primary source.
- **Second attack near Altman's home (Apr 12)** — real (SF Standard), but I'd fold it into the Apr 10 Molotov card as a follow-on rather than a separate entry — your call.
- **"Tokenmaxxing" pullback (Meta/Uber/Amazon capping employee AI use)** — real trend but not a single dated event; candidate for an "Everything Else" note, not a card.
- Out of window / not AI-native: HSBC (~20k, Mar 19, and only "mulling"), Epic Games (Mar 24, company *denied* AI), Cognizant Project Leap (Apr 29, count not company-disclosed), Apple CEO transition (Apr 20, not AI-specific).

## Latest revisions (your feedback)
- **Model releases are not major.** DeepSeek V4 downgraded from major to the default `notable` (kept, not excluded); GPT-5.5, Claude Opus 4.7, Muse Spark, Qwen3.6-Plus already `notable`. Policy going forward: a model release is `notable`/`minor` unless it carries special significance (e.g. the withheld Mythos).
- **Second Attack Near Sam Altman's Home (Apr 12)** — added as its own event (escalation), per your note.
- **'Tokenmaxxing' (Apr 6)** — added, framed as a temporary cross-firm episode; first surfaced by The Information Apr 6, leaderboards pulled by late May.
- **Cognizant 'Project Leap' (Apr 29)** — clarified and added (event + layoff row). AI-led restructuring, $230–320M charge, **no company headcount figure**; the 7,000–15,000 count is analyst math off the severance budget, and reported Q1 headcount actually rose (+6,000 QoQ). Coded explicit_company / contextual ('AI as investment destination'), count undisclosed.

## Tally (current)
Events: **7 (March gap) + 27 (April) = 34 proposed**, of which **7 flagged major**. Layoffs: **6 rows** (Snap, Meta, Microsoft, Pendo, Oracle, Cognizant). The 7 majors: Anthropic injunction (3/26), Newsom EO (3/30), OpenAI $122B (3/31), Anthropic Mythos/Glasswing (4/7), Altman Molotov attack (4/10), Microsoft–OpenAI rewrite (4/27), Tumbler Ridge suit (4/29).

---

## If you approve — merge order (layoff rows before events, per convention)
1. Append approved rows to `data/layoffs/layoffs.csv` → `python scripts/validate-layoffs.py` → `node scripts/build-layoffs.js`.
2. Append approved events to `data/events.yaml`. The `layoff_ids` in the Snap and Meta/Microsoft events **require** their layoff rows to exist first, or `scripts/validate-yaml.py` will fail.
3. `python scripts/validate-yaml.py`, then `npm run dev` to eyeball April in the dispatch pane.

**Decisions I need from you:** (a) confirm/adjust the 5 suggested majors; (b) keep or drop the borderline events (SpaceX, CHATBOT Act, Qwen); (c) keep or drop `microsoft-2026-04` and `pendo-2026-04`; (d) whether Oracle (Mar 31) gets a separate March pass.
