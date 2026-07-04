# Media Coverage Layer — PRD
## AI Backlash Tracker — Media Narrative Index

**Status:** Draft for build
**Owner:** [fill in]
**Last updated:** 2026-07-01

---

## 1. Background

The core tracker measures public backlash/support around AI across four themes:

1. Cultural and identity concerns (artists, writers, creative workers)
2. Distrust of AI companies and their practices
3. Labor market displacement
4. Local opposition to data center infrastructure

Primary sources already in place or planned: state environmental review dockets, municipal planning meeting transcripts, Reddit (Arctic Shift), Hacker News (Algolia), Bluesky (AT Protocol firehose), self-administered surveys.

This PRD covers a **new, distinct layer**: media coverage, pulled from a news API and parsed for volume and framing over time.

## 2. What this layer is — and is not

**This layer measures institutional/editorial attention to AI-related conflict, not public sentiment.** It should be built, labeled, and consumed as a separate construct: the **Media Narrative Index (MNI)**.

It is explicitly **not**:
- A proxy for grassroots or public opinion
- A standalone or primary backlash signal for any theme
- Directly comparable across themes using raw volume
- A replacement for the docket/transcript pipeline on the data center theme

It **is**:
- A record of what editorial/institutional actors chose to cover, when, and how
- A discovery tool to surface leads for the docket/CEQA pipeline
- A covariate to help explain spikes or lags in the grassroots signals (Reddit, Bluesky, HN)
- A useful, honest signal in its own right for two of the four themes (cultural/legal, distrust), with caveats

## 3. Why this needed its own design pass (not just "wire up a news API")

Initial instinct was to treat GDELT/NewsAPI.ai headline volume and sentiment as a fifth input alongside the grassroots sources. That doesn't hold up, for reasons specific to each theme rather than generic media criticism:

- **Cultural/identity:** Coverage clusters around litigation calendars and viral moments (e.g., the 2022–23 ArtStation/DeviantArt opt-out fights got real coverage — WaPo, Vice — but in a short burst, not continuously). Volume tracks *newsworthy moments*, not steady-state sentiment.
- **Distrust:** A meaningful share of "coverage" originates from company press releases and announcements. Investigative distrust stories are rarer and lag the underlying event by months, creating false lead/lag correlations against real-time grassroots streams.
- **Labor displacement:** Companies (Meta, Cisco, GM, Pinterest, Snap, Oracle, Coinbase, Standard Chartered) are currently *over*-citing AI as a layoff cause — this is contested even by AI industry insiders (Cognizant's own Chief AI Officer, Sam Altman calling it "AI washing"). Headline volume on "AI-caused layoffs" likely overstates true AI-driven displacement at large public companies, while displacement at private companies (call centers, logistics, back-office) goes largely unreported because there's no disclosure obligation. The bias runs in opposite directions for different company types — not a uniform undercount.
- **Data centers:** This is a **selection/censoring problem, not a weighting problem.** Most local zoning/permitting fights never get indexed by any news API — not underrepresented, but absent, because no monitored outlet covered them. No amount of normalization recovers a story nobody published. The dockets and municipal transcripts are ground truth for this theme; media coverage is not fit to carry primary signal weight here.
- **Cross-theme comparison:** Even correcting each theme individually, raw headline volume across themes reflects different upstream trigger mechanisms (company PR calendar vs. court calendar vs. local government calendar vs. organic escalation) and different exposure to wire-syndication inflation. A naive "which theme is growing fastest" comparison would rank themes by institutional visibility, not by intensity of public reaction.

## 4. Goals

1. Stand up a Media Narrative Index that is honest about what it measures.
2. Use it as designed per theme (primary-with-caveats for two themes, discovery/covariate-only for two).
3. Fix the syndication-inflation and PR-origin problems at the pipeline level, not just note them as caveats.
4. Keep this layer architecturally separate from the composite backlash index so it can't quietly dominate or distort it.

## 5. Non-goals

- Building a general-purpose news monitoring product.
- Producing a single blended "AI backlash score" that mixes media volume with grassroots sentiment without clear, separable weighting.
- Solving data-center-theme coverage gaps via media tooling. (Solved by dockets/CEQA/transcripts — see open item 4.)

## 6. Proposed approach

### 6.1 Tool selection
- **Primary: NewsAPI.ai (Event Registry).** Chosen over GDELT for this layer because it provides article-level event clustering, entity recognition, category tagging, and source-group filtering (including exclusion of PR-wire/press-release-origin sources) out of the box — meaningfully less build time than GDELT, which was built for geopolitical/conflict monitoring and would require custom classifiers and BigQuery pipelines to do the same job.
- **Reserve: GDELT.** Keep in back pocket only if pre-2014 historical depth or non-English regional coverage beyond NewsAPI.ai's tier is later needed.
- **Supplementary, non-primary: curated RSS from AI trade press** (e.g., 404 Media, The Information, Rest of World) for the distrust theme specifically, since trade press sometimes breaks stories general news APIs are slow to index. Qualitative input only, not part of the quantitative pipeline.

### 6.2 Unit of analysis: events, not articles
All counts should be built on Event Registry's event-clustering, not raw article counts. This is the direct fix for wire-syndication inflation (e.g., one Meta layoff announcement reprinted across hundreds of outlets should count as one event, not hundreds of articles).

### 6.3 Per-theme query and handling design

| Theme | Query approach | Special handling |
|---|---|---|
| Cultural/identity | Entity filters on named platforms (ArtStation, DeviantArt), orgs (Authors Guild, SAG-AFTRA), categories tied to IP/copyright litigation | Track which named parties/cases are driving each spike — theme is dominated by discrete legal milestones |
| Distrust | Entity filters on major AI labs + concepts (data practices, whistleblower, lawsuit, safety incident) | Use `ignoreSourceGroupUri`/similar to strip PR-wire and press-release-origin sources |
| Labor displacement | Entity filters on companies + AI/layoff categories | Report as a **ratio**: AI-attributed layoff events ÷ total tracked layoff events (external denominator, e.g. Challenger Gray or Layoffs.fyi), not raw AI-layoff volume — frames it as "share of layoffs a company chose to frame as AI-driven," which matches what the evidence supports |
| Data centers | Same entity/category filters as above, run on the same pipeline | Output used only as a **discovery feed** (seed leads for docket/CEQA search) and an **escalation flag** (which local fights crossed into national coverage) — not reported as a sentiment or volume measure for this theme |

### 6.4 Normalization
Report each theme's event count as a **share of total tracked AI-news event volume** (unfiltered "AI" query, same time window), not as raw counts. This partially corrects for distrust and labor coverage moving mechanically with the general AI corporate news cycle (capex announcements, earnings season) independent of actual sentiment shifts.

### 6.5 Sentiment/framing
Do not rely on Event Registry's native sentiment score for backlash classification — it's general-purpose and will misclassify backlash-relevant coverage (e.g., "AI stock surges after layoff announcement" reads neutral/positive to a generic classifier despite being backlash-relevant). Run headline + snippet text through a custom classification pass (prompted LLM) tuned specifically to detect opposition-framing, harm-attribution, and critical-stance language.

### 6.6 Output separation
Ship the Media Narrative Index as a **parallel track**, not folded into the composite backlash index with Reddit/HN/Bluesky/survey/docket data. Its primary use in analysis is as a covariate — e.g., checking whether grassroots-signal spikes coincide with, precede, or lag specific media events.

## 7. Open questions / left to consider

1. **Denominator source for the labor ratio.** Need to pick and validate an external layoff-tracking dataset (Challenger Gray, Layoffs.fyi, or build our own) as the denominator — data quality and update cadence for that source needs its own evaluation.
2. **Escalation-flag threshold for data centers.** What counts as "a local fight crossed into national coverage" — needs an operational definition (e.g., picked up by X named national outlets, or Y distinct events within Z days of the original local hearing).
3. **Custom sentiment/framing classifier.** Needs a labeled validation set (human-coded sample of AI-related articles per theme) to check the prompted-LLM classifier against, before trusting its output in the dashboard.
4. **NewsAPI.ai cost/tier.** Token-based pricing at scale across four themes, multiple entities per theme, and weekly/daily pulls needs a usage estimate before committing to a plan.
5. **RSS supplementary feed scope.** Which trade-press outlets, how they're weighted (or explicitly excluded) from any quantitative rollup — needs a short curation pass.
6. **Historical backfill window.** How far back to pull for baseline-building (affects the "share of total AI-news volume" normalization) — needs to be long enough to model seasonal/earnings-cycle effects in labor and distrust coverage.
7. **Whether/how to eventually reintroduce GDELT.** Currently deferred; revisit if non-English regional coverage or pre-2014 history becomes a priority.

## 8. Success criteria

- Media Narrative Index runs independently of the composite backlash score and is clearly labeled as such in any dashboard or report.
- Labor theme output is presented as a ratio against an external denominator, not raw AI-attributed layoff volume.
- Data center theme has zero dependency on media coverage as a primary signal; dockets/CEQA/transcripts remain ground truth, with media used only for discovery/escalation flags.
- Cross-theme volume comparisons are normalized against total AI-news volume before any "which theme is growing" claim is made.
- Event-level (not article-level) counting is used throughout to control for wire syndication.
