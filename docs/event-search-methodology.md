# Event-Search Methodology — Change Log

*How our approach to **finding** AI-timeline events has evolved, captured for posterity. This is the dated narrative of the "why"; the operative rules live in `.claude/shared/event-conventions.md` and the `find-ai-events-*` skills, and formal decisions live in `docs/decisions.md`. Append-only, newest at the bottom — when an approach is reversed, add a new entry rather than editing an old one.*

---

### 2026-07-03 — Baseline: criteria-first, curated sources over broad web
The event sweep is built around a **significance rubric** (structural novelty, social/cultural moment, regulatory/legal landmark, economic signal, early analyst call — `event-conventions.md` §1) and a **curated source list** of specialist outlets (Hyperdimensional, TBPN, One Useful Thing, Superintelligence, plus topical subreddits — §6), searched ahead of any broad "AI news" query. Rationale: a broad pile is noisy and biased toward whatever is most heavily promoted; leading with editors who already filter for significance produces better signal.

### 2026-07-04 — Adversarial verification step (§9) added
A first backfill pass let through a hallucinated model release, a law reported as enacted when it had actually been vetoed, and a mis-dated event. In response, every kept candidate must now be confirmed against a **primary or first-tier source**, with three explicit checks: the **date** (distinguish when something *happened* from when it was *reported*), the **outcome** ("passed" ≠ "enacted"; "filed" ≠ "ruled"; "announced" ≠ "shipped"), and **unfamiliar model/product names treated as suspect** until corroborated by the vendor. The single-day skills gained the step; `find-ai-events-range` was created for month/range backfills with the same discipline built in.

### 2026-07-04 — Tier discipline: model releases are never `major` alone
A routine or point release — even a frontier flagship — is `notable`/`minor` by default. Only the surrounding significance (a safety-held model, an open-source reversal, a genuinely field-reordering shift) can make a model event `major`. "A big lab shipped a model" is not, by itself, significance.

### 2026-07-05 — Curated sources hardened into a *reported gate*
Two attempts at the May 2026 pass leaned on generic web queries and **skipped the curated sources**, and both missed the **Pope Leo XIV AI encyclical "Magnifica Humanitas"** — a major cultural/moral moment. Fix: the sweep must run the curated sources *first* and **list in the review which ones it actually hit**; a skipped or unreachable source is a stated gap, never a silent one. (`event-conventions.md` §6.)

### 2026-07-05 — Rejected a "category-coverage floor"; chose curated-source priority instead
Considered mandating an explicit checklist of under-served categories to sweep every month (culture, courts, local government, environment, labor, international, research, hardware). Rejected it as mechanical and redundant: the curated editors already weight for significance across the whole field, so **leading with them** is the correction — not bolting on a taxonomy of extra searches.

### 2026-07-05 — Broad web reframed as chase-and-backfill, not the engine
Removed the "one targeted query per rubric category" mechanic from `find-ai-events-range`. Broad web search is now scoped to two jobs only: (a) **chase specific leads** the curated sources surface, and (b) **backfill a category that looks empty** on a read of the period (e.g. robotics, hardware, a court ruling). It is never the primary discovery method, because generic "AI news <month>" queries are SEO-optimized and over-return the commercial triad — **model releases, funding rounds, and layoffs** — while missing everything else.

### 2026-07-05 — Robotics/physical-AI: a worked example of the SEO-junk problem
Robotics coverage had collapsed to a single event (Waymo). A focused catch-up confirmed the topic is dominated by SEO/aggregator/AI-generated pages, so it demands strict first-tier/primary sourcing. Illustratively, the loudest May 2026 robotics leads were **all mis-dated**: Figure's BotQ production milestone was April 29, Figure-at-BMW was June 25, the Unitree G1 Amazon listing was February, and Tesla's Optimus V3 was a summer plan. Only three events survived verification against primary/first-tier sources — the Hangzhou robot traffic-police squad (May 1), the JAL Haneda humanoid trial (May), and NVIDIA Cosmos 3 (May 31). Lesson: in hype-heavy subtopics, verify the **date** first, and treat a milestone as real only when the maker or a first-tier outlet carries it.
