# Adoption/Usage Panel — Source Recon Record

**Compiled:** 2026-07-07 (two passes: initial recon + gap-closing pass, four agents each, all facts fetched live; the three load-bearing documents — Pew W187 topline, Gallup AI Indicator, Census wording-change PDF — were additionally spot-checked directly). Supports `adoption-usage-panel-prd.md` and seeds `data/adoption/`. Items marked **pending** were not verifiable and are not asserted anywhere downstream.

---

## 1. Pew Research Center (American Trends Panel + Ipsos KnowledgePanel teens surveys)

### 1.1 Adults — ChatGPT/chatbot series (core v1)

Three question regimes, all verbatim from fetched topline PDFs:

| Regime | Item | Verbatim wording | Waves (field dates, N, MOE) | Published estimates |
|---|---|---|---|---|
| A (Mar 2023) | GPT2 | "Have you ever used ChatGPT for any of the following?" — items: For entertainment / To learn something new / For tasks at work ("Yes, I have done this / No, I have not done this") | W123: Mar 13–19 2023, N=10,701, ±1.4 | Combined-any 14% of all adults (short read); items: entertainment 19%, learn 14%, work 12% (aware base) |
| B (Jul 2023–Mar 2025) | GPTUSE | "Have you ever used ChatGPT?" — asked of ChatGPT-aware, Form 1 | W131: Jul 17–23 2023, N=5,057, ±1.7; W142: Feb 7–11 2024, N=10,133, ±1.5; W164: Feb 24–Mar 2 2025, N=5,123, ±1.5 | Aware base: 24% (Jul 2023). Re-based all adults: 18% → 23% → 34% |
| C (Feb 2026) | CHATUSEMOD | "Do you ever use an artificial intelligence (AI) chatbot like ChatGPT, Gemini or Copilot?" — all adults | W187: Feb 17–23 2026, N=5,119, ±1.6 | 49% |
| C bridge (Aug 2024) | CHATUSE | "Have you ever used an artificial intelligence (AI) chatbot like ChatGPT, Gemini or Copilot?" — aware base, re-based | W152: Aug 12–18 2024, N=5,410 | 33% (re-based all adults). NB: **ever** used vs 2026's **do you ever** use |
| C (Feb 2026) | CHATSPEC | "Which of the following artificial intelligence (AI) chatbots do you ever use?" (ChatGPT all; Claude/Copilot/Character.ai Form 1 N=2,555; Gemini/Meta AI/Grok Form 2 N=2,564) | W187 | ChatGPT 44, Gemini 24, Copilot 17, Meta AI 14, Grok 8, Claude 6, Character.ai 3 |
| C (Feb 2026) | CHATFREQ | "About how often do you use an artificial intelligence (AI) chatbot like ChatGPT, Gemini or Copilot?" (users, N=2,605) | W187 | Users: 8/25/16/20/31 (almost constantly/several×day/once a day/several×week/less often); all-adults re-base printed |
| C (Feb 2026) | CHATWHY2-WRK | "Do you ever use artificial intelligence (AI) chatbots for the following? — For tasks at work" (users working for pay N=1,894; re-based all employed N=3,038) | W187 | 63% of employed users; 38% of all employed |
| A–B work trend | GPT2c | "For tasks at work" item | W123/W142/W164 | 12% (Mar 2023, aware+employed) → 20% (Feb 2024) → 28% of employed adults (Feb 2025, short read) |
| Ambient | USEAI | "Just your impression, how often do you interact with artificial intelligence (AI)?" (all adults) | Dec 12–18 2022 (W119), Feb 2024, Aug 2024, Jun 9–15 2025 (W173), Feb 2026 | Distributions in W187 topline (e.g. Feb 2026: 7/29/15/15/34) |

Base/re-basing note (W187 footnote 3, verbatim): "Prior to 2026, this question was asked among those who had heard at least a little about ChatGPT. It is presented here among all adults, accounting for form splits in previous surveys."

Known wording discrepancy: W187's GPTUSE trend row labels the 2024 wave "Feb 7-Mar 11, 2024"; the W142 topline itself and the ATP datasets page say Feb 7–11, 2024 — almost certainly a typo in the 2026 PDF.

**Topline URLs (all fetched):**
- W123: https://www.pewresearch.org/wp-content/uploads/2023/05/sr_2023.05.24_chatgpt_topline.pdf
- W131: https://www.pewresearch.org/wp-content/uploads/2023/08/SR_23.08.28_chat-bot_topline.pdf
- W142: https://www.pewresearch.org/wp-content/uploads/2024/03/SR_24.03.26_chat-bot_topline.pdf
- W164: https://www.pewresearch.org/wp-content/uploads/sites/20/2025/06/SR_25.06.24_chat-gpt_topline.pdf
- W187: https://www.pewresearch.org/wp-content/uploads/sites/20/2026/06/PI_2026.06.17_Americans-and-AI_TOPLINE.pdf
- 2023 scoping rationale (short read, fetched): https://www.pewresearch.org/short-reads/2023/05/24/a-majority-of-americans-have-heard-of-chatgpt-but-few-have-tried-it-themselves/ — "the Center chose to ask Americans about ChatGPT specifically rather than chatbots or large language models (LLMs) more broadly"
- 2025 short read (fetched): https://www.pewresearch.org/short-reads/2025/06/25/34-of-us-adults-have-used-chatgpt-about-double-the-share-in-2023/ — NB this URL now also serves as the redirect target of the retired Mar 2024 article; original 2024 article prose recoverable only via Wayback (blocked from this harness — **pending**)
- ATP methodology: https://www.pewresearch.org/our-methods/u-s-surveys/the-american-trends-panel/; datasets: https://www.pewresearch.org/american-trends-panel-datasets/ (microdata posted only through W159 as of 2026-07-07 — >1yr lag)

### 1.2 Workers series (core v1)

- W157 ("2024 Survey of Workers"), Oct 7–13 2024 → report Feb 25 2025; W178 ("Experiences with AI in the workplace"), Sep 2–8 2025, N=8,750 adults / 5,010 workers analyzed → short read Oct 6 2025.
- AIWRKHEARD (verbatim): "Artificial intelligence (AI) can be used in the workplace to collect data, make decisions and complete tasks. AI can be used by both employers and workers in different industries. How much have you heard or read about the use of AI in the workplace?"
- AIWRKDONE1 (verbatim, asked if heard at least a little): "Now thinking of the tasks you do in your job, how much of your work is done with AI?" — All/Most/Some/Not much/None/Not sure.
- Combo (All+Most+Some, employed with one/primary job): 16% (Oct 2024) → 21% (Sep 2025). Same wording both waves.
- Topline (fetched): https://www.pewresearch.org/wp-content/uploads/sites/20/2025/10/SR_25.10.06_ai-and-work_topline.pdf

### 1.3 Teens series (candidate — population expansion)

Ipsos KnowledgePanel, not ATP. Wording break mirrors the adult series: TCHAT2 "Have you ever used ChatGPT to help with your schoolwork?" (13% 2023 → 26% 2024) replaced in 2025 by TCHATUSE "Do you ever use an artificial intelligence (AI) chatbot like ChatGPT, Copilot or Character.ai?" (64% of teens; schoolwork item 54%). Toplines fetched: https://www.pewresearch.org/wp-content/uploads/sites/20/2025/01/SR_25.01.15_teens-chatgpt_topline.pdf and https://www.pewresearch.org/wp-content/uploads/sites/20/2026/02/PI_2026.02.24_Teens-and-AI_TOPLINE.pdf

## 2. Gallup (core v1: Workforce Study)

### 2.1 Gallup Panel Workforce Study — quarterly workplace series

- Waves + estimates (from https://www.gallup.com/workplace/704225/rising-adoption-spurs-workforce-changes.aspx trend + methods tables, fetched; indicator page spot-checked):

| Wave | Field dates | n | Total users (few×/yr+) | Frequent (few×/wk+) | Daily |
|---|---|---|---|---|---|
| WF Q2 2023 | May 11–25, 2023 | 18,871 | 21 | 11 | 4 |
| WF Q2 2024 | May 11–25, 2024 | 21,543 | 27 | 12 | 4 |
| WF Q2 2025 | May 7–16, 2025 | 19,043 | 40 | 19 | 8 |
| WF Q3 2025 | Aug 5–19, 2025 | 23,068 | 45 | 23 | 10 |
| WF Q4 2025 | Oct 30–Nov 14, 2025 | 22,368 | 46 | 26 | 12 |
| WF Q1 2026 | Feb 4–19, 2026 | 23,717 | 50 | 28 | 13 |

- Frame (verbatim): "self-administered web surveys conducted with a random sample of adults working full time and part time for organizations in the United States, aged 18 and older, who are members of the Gallup Panel. Gallup uses probability-based, random sampling methods to recruit its Panel members." MOE ±0.9–1.1, design effects 2.02–2.46. Annual (Q2-only) 2023–2024, quarterly since Q2 2025.
- Published definitions (verbatim, Indicator page): "Gallup defines 'Total AI users' as employees who say they used AI at work a few times a year or more. 'Frequent AI users' are those who indicate they use AI at work a few times a week or more."
- **Verbatim stem: FOUND 2026-07-07** — the "Workplace Q4 Topline AI Trends" PDF (https://www.gallup.com/file/workplace/701867/Workplace%20Q4%20Topline%20AI%20Trends.pdf), whose data pages defeat text extraction, was rendered in the user's browser and read visually. Item **Q619A: "How often do you use artificial intelligence in your role?"** — seven options: Daily / A few times a week / A few times a month / A few times a year / Once a year / Less often than once a year / Never (the articles' five-bucket paraphrase compresses this). Per-wave distributions printed for Q2'23, Q2'24, Q2'25, Q3'25, Q4'25; derived measures reconcile (Q4'25: 12+14+12+7 ≈ 46 total use). **Findings:** (a) "Total AI users" excludes the Once-a-year and Less-often buckets — ~5 pts of rarer-than-yearly users sit outside Gallup's headline number as of Q4'25; (b) item-level unweighted n (8,633 / 9,992 / 9,053) is roughly half the survey n in Q2 waves 2023–2025 — a subsample split Gallup doesn't mention in articles — and near-full sample from Q3'25; (c) the org item's full stem is **Q653A: "To the best of your knowledge, has your organization integrated artificial intelligence (AI) technology or tools to improve organizational practices (e.g., to increase productivity, efficiency, and quality)?"** with Q3'25 37% / Q4'25 38% yes (topline column headers both say "2025 Q3" — apparent typo); (d) the topline's methods table dates Q4'25 field end Nov 13 vs the article's Nov 14. Earlier negative search record (Indicator page, four articles, Bentley PDF, methodology center, Roper) stands as the documentation of where the stem does NOT appear.
- One adjacent stem IS published verbatim (Indicator chart table): "Has your organization integrated artificial intelligence (AI) technology?" — org-adoption item; **trend break Q3 2025** ("Gallup added a 'don't know' option to this question … results from Q3 2025 and later for this question are not directly comparable with earlier measurements"). Feb 2026: 41%.
- Related Gen Z analog stems (Walton–Gallup PDFs, fetched; NOT the Workforce Study instrument): "In your daily life, how often, if at all, do you use artificial intelligence?" and "For your work, how frequently do you use artificial intelligence?" (Daily/Weekly/Monthly/Once every few months/Never) — 2025 report PDF p.3/p.15, 2026 "AI Paradox" PDF p.4.
- Microdata: paywalled (Gallup Analytics). Indicator page is a living page, overwritten quarterly — archive at entry.

### 2.2 Other Gallup series (candidates / attitudes shelf)

Bentley–Gallup Business in Society (annual since 2022, AI attitude items since 2023 — trust/harm-good/jobs stems verbatim in fetched article https://news.gallup.com/poll/694688/trust-businesses-improves-slightly.aspx and Bentley PDF); Walton–Gallup Voices of Gen Z (annual, ages ~14–29, usage stems above); Lumina–Gallup students (57% weekly coursework AI, Oct 2025 fielding — recurrence unverified); Gallup World Poll 2026 global AI module (in field, results pending: https://news.gallup.com/opinion/methodology/711806/gallup-developed-global-survey-questions.aspx); Gallup–Telescope "AI in America" (Nov–Dec 2024, no second wave found — one-off).

## 3. Census BTOS (core v1)

### 3.1 Core AI questions — verbatim, both regimes

From Census's own change memo (fetched, spot-checked): https://www.census.gov/hfp/btos/downloads/AI%20Question%20Wording%20Updates.pdf

- **v1 (Sep 2023 – Nov 16 2025):** "In the last two weeks, did this business use Artificial Intelligence (AI) in producing goods or services? (Examples of AI: machine learning, natural language processing, virtual agents, voice recognition, etc.)" + six-month twin ("During the next six months, do you think this business will be using…"). Response: Yes / No / Do not know.
- **v2 (from Nov 17 2025):** same stems with "in any of its business functions?" replacing "in producing goods or services?"
- Break (verbatim): "Due to a level shift observed in conjunction with the new question wording, the decision was made to create a new time series for the AI questions, beginning with data released on December 4, 2025." Old series preserved as "AI Core Questions (Original)".

### 3.2 Frame, methodology, estimates

- Biweekly; ~1.2M employer businesses (excl. farms), 6 rotating panels of ~200k, each business surveyed once per 12 weeks; EIN-selected; voluntary; experimental product (OMB 0607-1022). Frame change Sept 2023 (single-location → all employer businesses; pre/post not comparable). Share-of-businesses, NOT employment-weighted; weighted to national/state/sector/size (CES-WP-24-16: "the sample is weighted so that estimates are representative at the national, state, sector and firm size level"; large businesses not oversampled).
- Response rates: ~16% average biweekly for AI core+supplement content 2023–24 (CES-WP-24-16, verbatim: "The average biweekly response rate over the period of collection for AI-related core and supplement content is about 16%"); FEDS note implies ~10% for late-2025 panels ("For the four surveys leading up to year-end 2025, the BTOS received about 20,000 responses on average" per ~200k panel) — **discrepancy noted, different periods, not reconciled**. "Do not know" ≈10–11% late 2025.
- Verified estimate anchors: 3.7% (Sep 2023, CES-WP-24-16) / 3.9% (Oct 23–Nov 5 2023 collection; https://www.census.gov/library/stories/2023/11/businesses-use-ai.html) / 5.4% (Feb 2024, CES-WP-24-16) / 6.5% planned (2023 story) — all v1 wording. v2 wording: 17–20% current and 20–23% expected across Dec 14 2025–May 3 2026; 19.8% national as of May 3 2026 (https://www.census.gov/library/stories/2026/05/ai-use-businesses.html).

### 3.3 AI supplements — wording captured via working papers

- **Supplement 1 (Dec 2023–Feb 2024):** 13 items, full verbatim in CES-WP-24-16 Appendix B (https://www.census.gov/hfp/btos/downloads/CES-WP-24-16.pdf, fetched): types of AI used (18-option list), AI performing tasks previously done by employees (+extent small/moderate/large), AI replacing existing equipment/software, employment effect (increased/decreased/no change), changes made to use AI (7-option list), forward-looking mirrors, reasons for not planning to use AI (11-option list).
- **Supplement 2 (Nov 17 2025–Feb 8 2026):** full 1.2M sample; 15-business-function use matrices (current Q24 / expected Q34; function list verbatim in NBER w35141 footnote 12: production of goods; provision of services; strategy and business development; finance and accounting; sales and marketing; customer service; R&D; IT; HR; PR and communication; management and administration; sourcing/supply chains/purchasing; quality management; distribution; legal and compliance), task effects (Q25: perform / supplement-or-enhance / introduce new task / none), worker genAI-task items (Q30–32; 9 task types modeled on Bick et al.), reasons for non-use (Q35). Source: https://www.nber.org/system/files/working_papers/w35141/w35141.pdf (fetched; the www2.census.gov PDF text-extracts empty). Headlines: 18% of firms used AI in ≥1 function (32% employment-weighted); 22% expected in 6 months; task augmentation only in 66% of AI-using firms; AI-attributed employment reductions in ~2% of firms. Respondent caveat (verbatim gist): responses "are often provided by a centralized firm-level respondent, typically an owner, high-level manager, or executive" — visibility bias on decentralized worker AI use.
- **Resolved 2026-07-07 (Chrome session):** the JS-gated portal was rendered in the user's browser; full file manifest enumerated (Current + Historical tabs). Fielded instruments fetched verbatim: `BTOS_Core_Questionnaire_V4.pdf` (Cycles 3–4, rev 04/13/2026 — AI items at Q7 current / Q24 intended) and `BTOS Core and AI Content.pdf` (V4 Cycle 2, rev 07/23/2025 — full AI supplement Q23–Q35 with skip logic, incl. Q31, BTOS's first generative-AI-specific item, whose example list names ChatGPT, Gemini, Copilot, Claude, Dall E, MidJourney, GitHub Copilot). Complete national AI series extracted from `National.xlsx` (new wording, cycles 202524–202613) and `AI%20Core%20Questions.xlsx` (original wording, cycles 202319–202520) and ingested into `data/adoption/estimates.csv` (140 rows, current + intended, with per-cycle reference periods from the files' Collection and Reference Dates sheets). Cross-validations: 202322=3.9%/6.5% matches the Nov 2023 Census story; 202404=5.4% matches CES-WP-24-16; 202609=19.8% matches the May 2026 story; pre-revision peak 10.0% (202520) matches the FEDS note's "about 10%". **New finding:** cycles 202521–202523 (Oct 6–Nov 16, 2025) were never collected due to the federal shutdown — the wording break sits immediately after a three-cycle structural gap, so the 10.0%→17.3% jump spans six uncollected weeks as well as the wording change. Still open: supplement-2 response rate; Federal Register notice for OMB 0607-1022 (not attempted).

## 4. RPS / GenAI Adoption Tracker (core v1, elevated 2026-07-07)

- Bick (St. Louis Fed) / Blandin (Vanderbilt) / Deming (Harvard); Management Science 2026 (doi.org/10.1287/mnsc.2025.02523); NBER w32966 PDF fetched (not paywalled): https://www.nber.org/system/files/working_papers/w32966/w32966.pdf
- **Module definition shown to respondents (verbatim):** "Generative AI is a type of artificial intelligence that creates text, images, audio, or video in response to prompts. Some examples of Generative AI include ChatGPT, Gemini, and Midjourney." Awareness screener gates the module (74.5% heard of genAI; rest skip).
- **Items (verbatim from paper):** "Do you use Generative AI for your job?" (No/Yes, employed); "Do you use Generative AI [outside your job]?"; "Did you use genAI [for your job / outside your job] LAST WEEK?" (every day / some but not all days / not in the last week); time-savings item (authors' paraphrase, no literal stem printed).
- Waves documented: pilot Jun 2024 (N=2,551); Aug 2024 (N=5,014); Nov 2024 (N=5,329); SWAA validation Dec 2024 (N=4,698). Tracker (https://www.genaiadoptiontracker.com/, fetched): "8 surveys and 40,000 respondents" through May 2026 — **later wave field dates undocumented in fetched sources (pending; likely in the Management Science version or JS chart data)**.
- Headline estimates: paper (Aug+Nov 2024): 39.6% of 18–64 use genAI (work or home); 26.5% of workers at work; 33.7% outside work. Tracker (May 2026): 61.8% use genAI; 45.2% of employed use it for work; 6.3% of work hours with genAI; 2.2% time saved.
- Caveats: RPS online panel weighted to CPS/ACS benchmarks (not probability); Walmart funding disclosed; no public microdata (tracker aggregates + paper tables).

## 5. Candidates — status after gap-closing pass

- **Fed SHED** — Oct 17–28 2025 wave, N=12,934; verbatim items captured from the questionnaire supplement (https://www.federalreserve.gov/publications/files/2025-supplement-economic-well-being-us-households-202605.pdf, fetched): D50 "…Did you use Generative AI at your job last month? Please do not include seeing AI results from search engines." (Yes/No; workers; 25% yes, N=7,488); D51 frequency (multiple×/day 15, daily 15, several days/wk 24, weekly 17, <1 day/wk 29; users N=1,850); D52 agree/disagree grid incl. "I am worried about AI replacing my job" (20/33/47). Public microdata: SHED_public_use_data_2025 CSV/STATA zips + codebook (URLs verified). **Whether the 2024-fielded SHED carried the same items is unverified — promotion still waits on the ≥2-waves check.** The 81%-time-savings headline is an among-users recut not derivable from the published table — flagged, don't reuse without microdata.
- **NTIA/CPS Nov 2025 supplement — KILLED (2026-07-07):** full 13-page draft instrument fetched (https://www.ntia.gov/sites/default/files/2025-06/2025-ntia-internet-use-survey-public-comment.pdf) — **no AI item** (closest is the pre-existing VOICEA digital-assistant item). Narrow caveat: final OMB-cleared version not independently re-verified (reginfo.gov JS-blocked); agencies rarely add questions between 60-day and 30-day notices. Recheck when Nov 2025 tech docs post (~mid-late 2026). Stakeholder AI recommendations were advocacy about existing items, not evidence of new ones.
- **Atlanta Fed SBU** — stem verbatim (two independent confirmations): "Which of the following artificial intelligence technologies, if any, does your business currently use? And which do you expect to use in twelve months?" — 7 categories (autonomous vehicles; data processing using machine learning; image processing using machine learning; robotics; text generation using large language models; visual content creation; other). Monthly, ~1,032 responses Nov 2025, employment-weighted by design, oversamples larger firms (deliberate contrast with BTOS). Sources: FEDS note https://www.federalreserve.gov/econres/notes/feds-notes/monitoring-ai-adoption-in-the-u-s-economy-20260403.html (fetched; cross-walks BTOS/RPS/SBU) + NBER w34836 (fetched; Appendix B instrument screenshots image-locked).
- **Eurostat ICT household survey** — annual genAI items since 2025 (32.7% EU); tables `isoc_ai_iaiu`, `isoc_ai_iaiuxr`; article fetched. International anchor when scope opens.
- **Reuters Institute DNR** (2026 chapter fetched; 7%→10% weekly AI-for-news 2025→2026; companion genAI survey 18%→34% weekly across six markets), **Ipsos AI Monitor** (5th ed. 2026: Mar 20–Apr 3 2026, 23,532 adults, 32 countries, online quota), **AP-NORC** (Jul 2025 wave, AmeriSpeak, public use files, ad-hoc cadence), **YouGov** (high-frequency, opt-in), **OECD ICT database** (Jan 2026: 36.8% of individuals across OECD used genAI in 2025 — announcement search-verified only, **fetch before citing**), **Stanford HAI AI Index 2026** (aggregator only).
- **Vendor tier — excluded:** Microsoft/LinkedIn WTI (2026 wave sampled AI-using knowledge workers only — adoption rate uncomputable), Slack Workforce Index, McKinsey State of AI. Reconsider only with an explicit transparency mechanism.

## 6. Standing verification notes

- web.archive.org is blocklisted from this harness — archive-at-entry snapshots need the human's browser or a scheduled job elsewhere.
- Gallup Q4 topline PDF and CES-WP-26-25 Appendix A are image-locked to text extraction — OCR or a browser session are the next leads for the two remaining verbatim gaps (Gallup stem; literal BTOS supplement-2 instrument).
- CES-WP-24-16's appendix renders the core-question example list as "(e.g., machine learning, …)" where the field instrument (per Census's own wording memo) prints "(Examples of AI: machine learning, …)" — the wording memo is treated as canonical for the fielded text.
