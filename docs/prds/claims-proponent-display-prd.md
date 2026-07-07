# Claims Repo — Head vs. Supporting Proponent Display (Open Question)

*Not a new asset — a scoped open question against the existing Claims repo (`data/claims/`). Captured as its own file because it surfaced while adding claims and will matter once claims data gets a UI, not because it needs the full PRD treatment.*

---

## 1. The problem

`claims.csv` models one claim as one row: `claimant`, `claimant_role`, `claim_as_stated`, graded once. That works cleanly when a single named person or org actually said the thing (Amodei on entry-level jobs, Goldman Sachs on exposure).

It works less cleanly when a claim is real and worth tracking, but circulates across several people who each said *something adjacent* with different strength and hedging — and no one of them is quite "the" source. Two live cases:

- **"LLMs will create new, novel discoveries."** Dario Amodei ("Machines of Loving Grace") is the clearest, most-quoted forward proponent, but DeepMind (FunSearch, AlphaEvolve) and OpenAI (the Erdős unit-distance disproof) supply the actual verified evidence, as themselves — not as people asserting Amodei's claim. Current resolution: Amodei is the head claim (`C041`); the verified instances live in the referent's `authoritative_statement` and `references`, not as competing claimant rows.
- **"LLMs are conscious."** No individual clears the bar of a firm, general, unhedged assertion: Sutskever hedges ("may be ... slightly"), Anthropic/Kyle Fish gives a probability estimate (15-20%), Lemoine is unhedged but about one specific chatbot and was discredited. Current resolution: the claim (`C043`) is deliberately generalized — `claimant` reads "Various AI researchers and lab executives (no single firm proponent identified)" — with each individual's statement moved to the referent's `references` array.

Both resolutions were reached ad hoc in conversation (2026-07-06). They work for the CSV as a *data model*. The open question is what happens when this data gets a **UI** — a "Proponent:" field can't render "Various AI researchers and lab executives" the same way it renders "Dario Amodei" without looking like a missing-data placeholder, and collapsing Sutskever/Fish/Lemoine into one referent's `references` array loses the fact that they're independently interesting (different people, different years, different strength of claim).

---

## 2. What's already decided (in the data)

- One claim row per referent is the default; a genuinely distorted/looser public paraphrase can still get its own `circulating` row (see `C042`).
- When multiple different named people/orgs have made *adjacent but distinct* statements and one is clearly the most prominent, quotable, general-purpose assertion: that person becomes the claim's `claimant`, and the others move into the referent's `references` JSON array, attributed by name inside `text`/`note`.
- When *no* individual clears the bar of a firm, general assertion: the claim's `claimant` is written as a generalized description ("Various ... no single firm proponent identified"), and `accuracy_rationale` explains why each candidate falls short (too hedged / too narrow / discredited). Individuals still get documented in `references`.

---

## 3. What's open (for whoever builds the UI)

- Does a claim card need a distinct visual treatment for "single named claimant" vs. "generalized/diffuse claimant," or is the text description enough?
- Should the referent's `references` array be surfaced as visible "supporting/related statements" under a claim card, or treated as pure backing data (footnote-only)?
- Is there a threshold for splitting a generalized claim back into named rows later, if one of the "supporting" voices turns out to deserve its own graded claim (e.g., if Fish/Anthropic later makes a firm, unhedged statement)?
- Naming convention for the generalized-claimant case — is "Various AI researchers and lab executives (no single firm proponent identified)" the right phrasing to standardize, or should there be a dedicated field (e.g., a boolean `has_single_claimant`) instead of encoding it in prose?

No action needed until claims data actually gets built into a page. Revisit alongside whatever surfaces `data/claims/` in the site or in a report.
