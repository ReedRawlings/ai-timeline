# June 2026 sweep — review summary (events + layoffs)

**Window:** 2026-06-01 … 2026-06-30. **Dedup floor:** `data/events.yaml` had **zero** June 2026 events and `layoffs.csv` had **zero** June rows before this sweep — everything here is net-new, no orphan gap at the range edges (latest prior event = end of May 2026, plus one 2026-07-06 interpretability entry).

**Files produced (NOT merged — you review first):**
- `proposals/2026-06-events.yaml` — **21 events** (4 `major`, 4 `minor`, 13 `notable`) — tiers confirmed with human 2026-07-06
- `proposals/2026-06-layoffs.csv` — **no new rows.** One UPDATE to the existing `oracle-2026-03` row; GitLab rejected

### Decisions locked in (2026-07-06)
- **`major` (4):** EO 14409, US suspension of Fable 5/Mythos 5, Anthropic Fable 5 launch, SpaceX–Cursor $60B. Oracle-10-K and GPT-5.6-restriction stay `notable`.
- **Oracle:** the June 10-K's ~21,000 is the **cumulative FY2026 total that includes the March round** — NOT separate cuts. So the March row `oracle-2026-03` is **updated** with the explicit 10-K AI quote (attribution upgraded press_inferred→explicit_company, contextual→mixed; count stays undisclosed). No `oracle-2026-06` row. The June 23 timeline event references `oracle-2026-03`.
- **GitLab:** **rejected** — company was firm the restructuring "is not an AI optimization or cost cutting exercise."

Self-check vs `scripts/validate-yaml.py` rules: passed (required fields present, ISO dates, no empty arrays, tags/impact_areas on-list, no duplicate titles, `layoff_ids` present). CSV columns match schema (23 fields).

**Merge order when approved:** append the layoff row(s) to `data/layoffs/layoffs.csv` → `python scripts/validate-layoffs.py` → `node scripts/build-layoffs.js` → append events to `data/events.yaml` (the Oracle event's `layoff_ids: [oracle-2026-06]` needs that row to exist first) → `python scripts/validate-yaml.py` → `node scripts/build-events.js`.

**Curated sources hit for June (event-conventions §6):** White House presidential-actions ✓ (EO primary, read in full), Anthropic newsroom ✓ (primary — Fable/Mythos launch + redeploy), OpenAI news ✓ (primary — GPT-5.6 page read in full, S-1, Broadcom, Ona), Mistral news ✓ (primary — OCR 4 read in full), gov.ca.gov ✓ (primary), Office of the Privacy Commissioner of Canada ✓ (primary, read in full), One Useful Thing ✓ (Mollick's Fable/Mythos posts — context), Hyperdimensional ✓ (Dean Ball on the licensing crisis), Challenger June report ✓ (primary). **Not cleanly reached for June:** getsuperintel.com/topics and tbpn.substack.com (search didn't surface dated June archives — lab feeds + first-tier press covered the gaps). Reddit not separately mined — social/cultural coverage this month came via the Canada/Grok regulatory finding rather than a viral moment.

---

## The month in one line
June 2026 was dominated by a **government-triggered frontier-model access crisis**: EO 14409 (June 2) → Anthropic ships Fable 5 / Mythos 5 (June 9) → the US government forces both offline under an export-control directive (~June 12) → OpenAI's GPT-5.6 preview is pre-emptively restricted to "trusted partners" (June 26) → controls lifted and Fable 5 redeployed (June 30). Five of the 21 events are this one mutually-corroborating spine (all verified against Anthropic's/OpenAI's/the White House's own pages). Secondary threads: an IPO wave (Anthropic, OpenAI, SpaceX–Cursor $60B), Microsoft's in-house MAI models, and AI-labor signals (Oracle's SEC filing, Challenger).

## Suggested `major`s — YOUR CALL (never finalized silently, §2)
1. **Trump EO 14409 on frontier-AI security (June 2)** — first US order creating a pre-release government-review path for frontier models; the legal backdrop for everything after. Verified on whitehouse.gov (read in full). *I lean major.*
2. **US forces Anthropic to suspend Fable 5 / Mythos 5 (~June 12)** — first time Washington pulled a commercially deployed frontier model offline. *I lean major.*

**Major-candidates I left `notable` (flag if you disagree):**
- **OpenAI GPT-5.6 restricted at gov request (June 26)** — first *pre-emptive* restriction of a US model launch. Arguably major.
- **SpaceX to acquire Cursor $60B (June 16)** — largest acquisition of a VC-backed startup on record. Arguably major (economic).
- **Oracle cites AI for workforce cuts in its 10-K (June 23)** — explicit AI-causation in an SEC filing. Left `notable`; defensible as major.
Per the rubric (routine model releases are never major; ~10–12% major overall) I kept these `notable` to avoid over-weighting one month.

## Dating corrections the verification pass caught (these would have been wrong)
- **Google I/O 2026 was in MAY, not June** — the Gemini 3.5 Flash / Omni / Gemma 4 announcements are May events. The "June 2026 Google AI updates" page is a monthly roundup of incremental rollouts. **No Google I/O item proposed for June.**
- **OpenAI–Anthropic joint safety evaluation is dated AUGUST 2025** (conducted June–July 2025). It resurfaces in June-2026 recirculation. **Dropped.**
- **GitLab's "Act 2" restructuring was announced 2026-05-11**, not June (June 2–3 = earnings/scope) — and the company *explicitly disclaims* AI as the cause (see layoffs below).
- **OpenAI+Broadcom "Jalapeño" = June 24** (not 25); **OpenAI S-1 = ~June 8**; **Anthropic S-1 = June 1**.

## Dropped in verification (anti-hallucination, §9) — one line each
- **OpenAI–Anthropic joint safety eval** — 2025 event recirculating; out of window.
- **ChatGPT crosses 1B MAU** — only stats-roundup/LinkedIn sourcing, no OpenAI primary with a June date. Held.
- **DeepMind "From AGI to ASI" paper (June 10)** — Medium/roundup only; not confirmed on arXiv/deepmind.google. Held.
- **NVIDIA–TSMC "AI in the fab" (~June 1)** — first-tier aggregator only; not confirmed on nvidianews. Held.
- **Mistral "AI Now Summit" (Vibe agent, Search Toolkit, Les Ulis DC)** — referenced by the OCR 4 primary but no firm summit date nailed; OCR 4 kept, summit held.
- **Bezos "Prometheus $12B" vs "Flourish $500M seed"** — conflicting reports of a large June AI raise; neither verified to primary. Held (didn't propose either).
- **Humanoid-robot production milestone (Figure/Optimus)** — SEO/aggregator only, no primary June date. Held.
- Other funding rounds the discovery pass surfaced (Supabase $500M, Generalist AI $400M, AlphaSense $350M) — Crunchbase-tracker level; omitted to keep signal high (Suno kept for its litigation angle). Pull any in if you want fuller VC coverage.

---

## Layoffs — 2 proposed rows, BOTH flagged (June was light on clean AI-attributed cuts)

Honest headline: **no clean net-new June-*announced* AI-attributed layoff cleared the bar unambiguously.** The two rows below both need a decision from you. Most "June AI layoffs" in circulation (Meta, PayPal, Intuit, Cisco, Coinbase, Cloudflare) were announced **May or earlier** and are already in the dataset or out of scope.

**`oracle-2026-06`** — Oracle, announced **2026-06-23** (10-K filing). `explicit_company` / `mixed`. Verbatim SEC quote confirmed: *"The adoption and deployment of AI technologies across our operations have resulted, and may continue to result, in reductions to our workforce."*
- **Count left UNDISCLOSED on purpose.** The widely-cited **21,000 (~13%, 162k→141k)** is a trailing-full-FY figure across multiple rounds; bucketing it into June would misrepresent monthly volume and conflicts with the **schema.md line-65 precedent (2026-07-04)** that keeps this FY total out of a single event row. It's fully documented in the row's notes/quote. *Alternative if you disagree: set `count=21000/approximate/global`.*
- **Dedup:** this FY figure **encompasses** the March round already logged as `oracle-2026-03` — do not sum. **Consider instead UPDATING `oracle-2026-03`** with this verbatim quote rather than keeping a second row (dedup convention: materially-new detail on the same restructuring = an update). Proposed as a new row because the 10-K disclosure is itself a distinct June event — but the update-vs-new-row choice is yours.
- **Source/verification:** `single_source` — SEC.gov 403s the fetcher, so `source_url` is the CNBC carrier and the 10-K is in `cross_references`; quote corroborated verbatim across CNBC/Reuters/Bloomberg but not yet read from the filing itself. India >12,000 / rescinded IIT-NIT offers are **press-reported, not in the 10-K quote** — flagged as such.

**`gitlab-2026-06`** — GitLab, ~350 (~14%), announced 2026-06-03. `explicit_company` / `contextual`. **BORDERLINE — I lean reject-or-contextual.**
- The restructuring was **announced 2026-05-11** ("Act 2" letter); June is the scope/earnings disclosure — arguably a **May** event.
- GitLab **explicitly disclaims AI as the cause:** *"this restructure process … is not an AI optimization or cost cutting exercise."* AI is named as strategic backdrop + one of four levers ("role right-sizing … powered by AI"), so coded `contextual` (AI-as-destination, cf. Cognizant Project Leap), `verification_status: disputed`. Dataset-only; no matching timeline event proposed.
- **Your call:** reject as "AI-as-narrative-backdrop with a company disclaimer," or keep contextual with the disclaimer front-and-center. Do NOT code as AI directly replacing these roles.

## Layoffs — rejected/out-of-window leads (NOT coded)
- **Challenger's 14,029 June AI figure** — used only as the macro *timeline event*; it names no single company, so it never becomes a per-employer `count`.
- **Oracle Romania (~500, June 25)** — press-inferred subset of the FY restructuring; folded into the Oracle notes, not a separate row.
- **Meta, PayPal, Intuit, Coinbase, Cloudflare, Cisco, Snap, GM** — announced May or earlier; recirculate in June tracker lists. Not June.
- **Microsoft (~4,800)** — announced 2026-07-06 (just after window); Microsoft said roles are "not being replaced by AI." Out of scope.
- **Indian IT majors (TCS/Infosys/Wipro/HCL/Tech Mahindra)** — Indian press frames these as PIP exits / bench releases, not company-announced AI layoffs; attribution is press/analyst-inferred, counts are estimates. Known Global-South coverage gap — worth a dedicated APAC pass if you want it, but nothing citable emerged.

---

## Remaining open items (minor)
1. **Anthropic Economic Index** — confirm the exact report URL/date at merge (couldn't fully pin the permalink).
2. **Oracle source_url** — swap the CNBC carrier for the SEC EDGAR permalink once the raw 10-K wording is read by eye (`verification_status` currently `single_source`).
3. Optional: chase any *held* items (see "Dropped in verification") if you want fuller coverage.
