# Data Center Legislation Tracker — Product Requirements (Draft v0.3)

*A working definition of **what** this asset is, **who** it's for, and **where its edges are.** It deliberately does not specify schema, fields, collection workflow, update tooling, or visual design — those come after the scope below is agreed. All scope-level decisions are now settled (§9); what remains is implementation-level and belongs to the deferred workflow doc (§11).*

---

## 1. Scope of this document

This PRD covers **one asset: the Data Center Legislation Tracker** — a neutral record of moratoria and legislation, **both for and against** data centers, in the United States. Restrictive and permissive measures are equal subjects; the asset is not resistance-focused. It is the first of a planned **series** of related-but-distinct assets, each of which gets its own PRD:

- **Footprint growth** — the energy / water / land footprint of compute. Broader than AI data centers specifically, and not tied solely to new construction.
- **Observed buildout & conversions** — what is actually being built, expanded, or repurposed.
- **Project-level outcomes** — per project: did construction happen, stall, or get cancelled, and the stated reason why.
- **Anecdotes** — notable individual cases worth surfacing (e.g., a moratorium that blocks one size class while larger projects proceed elsewhere).

These are separate assets, but they are designed to connect. A core aim is to **overlay buildout and conversion data alongside the legislation data**, so the practical strength and validity of a given measure can be *seen* rather than asserted — for example, comparing the scale of project a size threshold actually blocks against the scale of projects active nearby.

---

## 2. Problem statement (why this exists)

Public discourse on data-center legislation runs on two recurring failures:

- **Laundered counts.** "100+ moratoriums," "12 states banning data centers" — each collapses real distinctions (binding ban vs. symbolic resolution, restrictive vs. permissive, new construction vs. expansion, the actual size threshold, passed vs. failed vs. stalled) into one headline number that doesn't survive inspection.
- **Collapsed causation.** "Moratoriums are stopping the buildout" and "the buildout is unstoppable anyway" both assert a link between political action and physical outcome that no single dataset supports.

This asset answers the first problem directly — a conditions-preserving, primary-sourced ledger of the full legislative landscape — and sets up an honest answer to the second by enabling juxtaposition with the buildout and conversion assets, **without ever asserting the counterfactual.**

---

## 3. What this asset is (and isn't)

It tracks the full regulatory and legislative response to data centers in the US, at both state and local levels, in **both directions**:

- **Restrictive** — moratoria (binding bans and temporary time-outs), zoning restrictions and overlays, ballot bans, and restrictive bills at every status (introduced, passed, failed, carried over, vetoed).
- **Permissive / pro-development** — state preemption of local authority, tax-incentive and by-right enablement, and pro-development bills. These are first-class entries, not just context.

Every entry preserves the attributes that the headline counts drop: scope language (new only vs. new + expansion + re-establishment), the threshold and its native unit (square footage or MW), binding vs. symbolic, current status, by-right vs. special-use-permit treatment, and whether state preemption applies.

It is **not** a buildout tracker, a footprint model, or a causal claim about outcomes. Those are sibling assets or non-goals (§6).

---

## 4. Audience & use (resolved)

A **standalone public reference** — a maintained, transparent ledger others can cite. Secondarily, an **input to blog series** (this project's and potentially others) and a **research instrument**. The public-reference bar is the one that governs polish and provenance; the other two draw from it.

---

## 5. Questions the asset should be able to answer

- How many moratoria and laws exist, restrictive and permissive, and at what level (state / county / municipal)?
- For each: what does it actually *cover* — new construction only, or also expansion and re-establishment? What is the threshold, and in what unit? Is it a binding ban, a temporary time-out, or a non-binding resolution? By-right or special-use-permit? Is local authority preempted from above?
- What is the status and trajectory — passed, failed, stalled, vetoed, carried over?
- (Overlay-enabled) When a measure blocks a size class, what scale of project does that actually represent relative to active or announced projects in comparable areas?

---

## 6. Non-goals (explicitly out of scope)

- **Not** a causal claim that any measure did or did not stop a build. We track documented measures and their scope; we never assert the counterfactual.
- **Not** a census of all data centers, and **not** a buildout or footprint dataset — those are sibling assets. The overlay *references* them; it does not reproduce them here.
- **Not** real-time or fully comprehensive. Coverage will be partial and lagged, and the asset says so.
- **Not** a predictor of which measures pass or which builds proceed.

---

## 7. Principles & constraints

- **Documented-claims discipline.** Every entry is a sourced fact about a measure. Where a stated rationale is recorded, it lives in its own field, separate from anything we can independently confirm.
- **Conditions-preserving.** Never collapse the distinctions that matter: binding vs. symbolic, new vs. expansion, restrictive vs. permissive, the threshold and its unit.
- **Layers stay separate; overlays juxtapose, they don't merge.** Resistance, buildout, and conversion are distinct assets shown side by side, never fused into one number or one causal arc.
- **Primary sources, with provenance per entry.** Ordinance and bill text, ballot results, council and commission records, PUC filings — the actual documents, not a citation of a citation.
- **Existing trackers and studies are discourse objects.** They are inputs to reconcile and cite, not ground truth to copy.
- **Common metric.** Where a capacity figure appears, normalize to **MW** wherever possible — it is the universal unit across greenfield, expansion, and conversion, and it is what makes the cross-asset overlay coherent. Record the ordinance's native threshold unit too when it differs (e.g., square footage).

---

## 8. Source landscape (the raw material, not the build)

For understanding only — what's available and the role each plays. The government-records infrastructure below carries over from the sources review done for the sibling sentiment tracker; the social-media and survey sources from that discussion (Reddit/HN/Bluesky, Pew/Gallup) belong to *sentiment*, not legislation, and are at most lead-generation here, not primary.

- **Government primary sources (the spine — we build from these)** — state bill text and status (e.g., LegiScan or state legislature sites — the one source category specific to a legislation tracker that the earlier sentiment-focused review didn't cover; flagged as a suggested addition to confirm); county and city ordinances and meeting records via Legistar/Granicus; state environmental review dockets (CEQA and equivalents); federal dockets via Regulations.gov; court records and sworn declarations from opposition lawsuits; ballot results. This is where scope language and status actually live.
- **Existing trackers (verification cross-checks, not the base)** — datacenterbans.com, Good Jobs First, NCSL, the Rockefeller Institute, MultiState (paid). We build our own resource from primary records and use these to check our coverage against, not to copy.
- **For the overlay (drawn from sibling assets)** — buildout and conversion figures researched from public information across multiple sources: corporate filings and earnings transcripts, permit and satellite data, public data-center datasets, and industry reporting. No single database is treated as the source of record.
- **Local press & direct outreach** — the conflict narrative, and the stated (and sometimes unstated) reasons that never make it into a filing.

The established collection shape from prior discussion — identify targets, pull the records, run a structured LLM review pass with a human verifying before entry — is the maintenance model in §9. Its mechanics are deferred to the workflow doc (§11).

---

## 9. Resolved decisions

- **Asset identity** — a neutral legislation tracker (for *and* against, co-equal), not resistance-focused. The earlier "which construct" question dissolves, because buildout, conversion, and footprint are separate siblings.
- **Build vs. curate** — we create our own resource from primary records. Existing trackers are used to verify our coverage, not as the base we build on.
- **Audience** — public reference, plus series input and research instrument.
- **Geography** — United States.
- **Size scope** — no capacity floor. A facility counts as long as it is stated/designated as a data center when built; measures are tracked regardless of the size class they target.
- **Time window** — 2022-forward, to establish a baseline before ChatGPT's launch and the subsequent buildout.
- **Maintenance** — an LLM scans for new and updated sources on roughly a weekly cadence, with a human in the loop verifying outputs before they enter the ledger.
- **Common metric** — MW wherever capacity is expressed; native threshold units recorded alongside when different.

---

## 10. Open decisions (scope level)

None outstanding — the scope of this asset is settled (§9). The one item still awaiting your confirmation is small and lives in §8: whether to adopt **LegiScan / state legislature sites** as the state-bill source, since the earlier sentiment-focused sources review didn't cover bill tracking.

Remaining open questions are implementation-level — collection pipeline mechanics, de-duplication of measures, historical backfill from 2022, and how a single measure that spans levels (e.g., a state law that preempts local ordinances) is recorded without double-counting — and belong to the deferred workflow doc (§11).

---

## 11. Deferred to later documents

Schema and field definitions; collection workflow; storage and format; the LLM-update tooling spec; visualization and overlay presentation; and the separate PRDs for the sibling assets (footprint growth; observed buildout & conversions; project-level outcomes; anecdotes).

---

*Status: draft for reaction. Scope is settled; the next document is the collection-workflow spec (§11). Written to be red-lined.*
