/**
 * claims-page.js — Standalone "Claims Repository" page (claims.html).
 *
 * Index + detail layout: a compact category index up top links down to one
 * detail block per referent (id="REF-...", permalink-able), each showing the
 * authoritative statement and its claim variants (id="C...") graded against
 * it. Diffuse claimants (no single firm proponent) get a DIFFUSE badge and
 * the referent's dated `references` render as a visible "Related statements"
 * list — the resolution of docs/prds/claims-proponent-display-prd.md.
 *
 * Everything on the page derives from src/data/claims.json (built from
 * data/claims/*.csv) — counts, category sections, grades; nothing baked in.
 */
import '../css/main.css';
import data from '../data/claims.json';

const CATEGORY_ORDER = ['Labor / Jobs', 'Systemic Bias', 'Data / Privacy / Copyright',
    'Environment / Data Centers', 'Impact Framework', 'Existential / Safety Risk',
    'AI Hype / Bubble', 'Military / Autonomous Weapons', 'Robotics / Physical Labor'];

// Intentionally empty collection targets (see data/claims/README.md) — listed
// honestly rather than omitted.
const EMPTY_CATEGORIES = {
    'Military / Autonomous Weapons': 'Defined for tracking; no claims collected yet.',
    'Robotics / Physical Labor': 'Defined for tracking; no claims collected yet.',
};

const RATING_META = {
    'accurate':                    { label: 'ACCURATE',        color: '#1F7A4D', border: '#A8CDB8', rank: 0 },
    'mostly accurate':             { label: 'MOSTLY ACCURATE', color: '#55803B', border: '#BFD3AC', rank: 1 },
    'premature / unverifiable':    { label: 'PREMATURE',       color: '#8C8676', border: '#D9D3C5', rank: 2 },
    'mixed / true-but-misleading': { label: 'MIXED',           color: '#8A5A2B', border: '#DCC9AE', rank: 3 },
    'mostly false':                { label: 'MOSTLY FALSE',    color: '#B45309', border: '#E7B79E', rank: 4 },
    'false':                       { label: 'FALSE',           color: '#B91C1C', border: '#E5A3A3', rank: 5 },
};

// ── DOM helper ──────────────────────────────────────────────────
function h(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
        if (v == null) continue;
        if (k === 'style') el.style.cssText = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else el.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
        if (c == null) continue;
        el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
}

function ratingMeta(r) { return RATING_META[r] || RATING_META['premature / unverifiable']; }
function worstRank(claimList) { return Math.max(...claimList.map(c => ratingMeta(c.accuracy_rating).rank)); }
function worstMeta(claimList) {
    const rank = worstRank(claimList);
    return Object.values(RATING_META).find(m => m.rank === rank);
}

export function initClaimsPage({ referents, claims }) {
    const mount = document.getElementById('claims-page');
    if (!mount) return;

    const claimsByRef = {};
    claims.forEach(c => (claimsByRef[c.referent_id] = claimsByRef[c.referent_id] || []).push(c));
    const refsByCategory = {};
    referents.forEach(r => (refsByCategory[r.category] = refsByCategory[r.category] || []).push(r));

    mount.appendChild(buildHeader(referents, claims));
    mount.appendChild(buildIndex(refsByCategory, claimsByRef));

    focusHashTarget();
}

// ── Header ──────────────────────────────────────────────────────
function buildHeader(referents, claims) {
    const gradedBad = claims.filter(c => ['false', 'mostly false'].includes(c.accuracy_rating)).length;
    const circulating = claims.filter(c => c.variant_type === 'circulating').length;
    const wrap = h('div', { class: 'clm-header' });

    wrap.appendChild(h('div', { class: 'clm-eyebrow', text: 'Claims Repository' }));

    wrap.appendChild(h('div', { class: 'clm-title-row' }, [
        h('h1', { class: 'clm-title', text: 'Who said what — and was it true?' }),
        h('div', { class: 'clm-stat-block' }, [
            h('div', { class: 'clm-stat-total', html: `${claims.length}<span class="clm-stat-total-unit"> CLAIMS</span>` }),
            h('div', { class: 'clm-stat-range', text: `GRADED AGAINST ${referents.length} SOURCES` }),
        ]),
    ]));

    const lede = h('p', { class: 'clm-lede' });
    lede.innerHTML = 'Every entry starts from a <strong>referent</strong> — the underlying study, ruling, measurement or statement — and grades each version of the claim against it: the claimant’s own words (<strong>as made</strong>, hedges intact) and the paraphrases in wider circulation (<strong>circulating</strong>). The gap between those two grades is where distortion lives. Open predictions stay <strong>premature</strong> — never true or false before their deadline arrives.';
    wrap.appendChild(lede);

    wrap.appendChild(h('div', { class: 'clm-chips' }, [
        h('span', { class: 'clm-chip clm-chip--solid', text: `${referents.length} REFERENTS` }),
        h('span', { class: 'clm-chip clm-chip--ink', text: `${claims.length} CLAIM VARIANTS` }),
        h('span', { class: 'clm-chip clm-chip--light', text: `${circulating} CIRCULATING` }),
        h('span', { class: 'clm-chip-divider' }),
        h('span', { class: 'clm-chip-note', text: `${gradedBad} GRADED FALSE OR MOSTLY FALSE` }),
    ]));
    return wrap;
}

// ── Category index ──────────────────────────────────────────────
function buildIndex(refsByCategory, claimsByRef) {
    const wrap = h('div', { class: 'clm-index' });
    wrap.appendChild(h('div', { class: 'clm-section-head' }, [
        h('span', { class: 'clm-section-title', text: 'INDEX' }),
        h('span', { class: 'clm-section-note', text: 'WORST GRADE PER SOURCE →' }),
    ]));

    CATEGORY_ORDER.forEach(cat => {
        const refs = refsByCategory[cat] || [];
        if (!refs.length && !EMPTY_CATEGORIES[cat]) return;

        const section = h('div', { class: 'clm-index-cat' });
        section.appendChild(h('div', { class: 'clm-index-cat-head' }, [
            h('span', { text: cat.toUpperCase() }),
            h('span', { class: 'clm-index-cat-count', text: refs.length ? `${refs.length}` : '—' }),
        ]));

        if (!refs.length) {
            section.appendChild(h('div', { class: 'clm-index-empty', text: EMPTY_CATEGORIES[cat] }));
        } else {
            refs.slice()
                .sort((a, b) => worstRank(claimsByRef[b.referent_id] || []) - worstRank(claimsByRef[a.referent_id] || [])
                    || a.referent_id.localeCompare(b.referent_id))
                .forEach(r => {
                    const rClaims = claimsByRef[r.referent_id] || [];
                    const wm = worstMeta(rClaims.length ? rClaims : [{ accuracy_rating: 'premature / unverifiable' }]);
                    section.appendChild(h('a', { class: 'clm-index-row', href: `#${r.referent_id}` }, [
                        h('span', { class: 'clm-index-summary', text: r.referent_summary }),
                        h('span', { class: 'clm-index-count', text: `× ${rClaims.length}` }),
                        h('span', { class: 'clm-index-dot', style: `background:${wm.color}`, title: wm.label }),
                    ]));
                });
        }
        wrap.appendChild(section);
    });
    return wrap;
}

// ── Deep links ──────────────────────────────────────────────────
function focusHashTarget() {
    if (!location.hash) return;
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!el) return;
    el.scrollIntoView({ block: 'start' });
    el.classList.add('clm-flash');
    setTimeout(() => el.classList.remove('clm-flash'), 2400);
}

initClaimsPage(data);
