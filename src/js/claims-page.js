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
// Some CSV cells hold a lone dash as an explicit "none" placeholder.
function real(v) { return v && !/^[-–—]+$/.test(v.trim()) ? v : null; }
function worstRank(claimList) { return Math.max(...claimList.map(c => ratingMeta(c.accuracy_rating).rank)); }
function worstMeta(claimList) {
    const rank = worstRank(claimList);
    return Object.values(RATING_META).find(m => m.rank === rank);
}

export function initClaimsPage({ referents, claims, dossiers = {} }) {
    const mount = document.getElementById('claims-page');
    if (!mount) return;

    const claimsByRef = {};
    claims.forEach(c => (claimsByRef[c.referent_id] = claimsByRef[c.referent_id] || []).push(c));
    const refsByCategory = {};
    referents.forEach(r => (refsByCategory[r.category] = refsByCategory[r.category] || []).push(r));

    mount.appendChild(buildHeader(referents, claims));
    mount.appendChild(buildIndex(refsByCategory, claimsByRef));
    mount.appendChild(buildDetails(refsByCategory, claimsByRef, dossiers));
    mount.appendChild(buildFooter());

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

// ── Detail blocks ───────────────────────────────────────────────
function buildDetails(refsByCategory, claimsByRef, dossiers) {
    const wrap = h('div', { class: 'clm-details' });
    wrap.appendChild(h('div', { class: 'clm-section-head' }, [
        h('span', { class: 'clm-section-title', text: 'EVERY TRACKED CLAIM' }),
        h('span', { class: 'clm-section-note', text: 'GRADED AGAINST ITS SOURCE' }),
    ]));

    CATEGORY_ORDER.forEach(cat => {
        const refs = refsByCategory[cat] || [];
        if (!refs.length) return;
        wrap.appendChild(h('div', { class: 'clm-detail-cat', text: cat.toUpperCase() }));
        refs.slice()
            .sort((a, b) => worstRank(claimsByRef[b.referent_id] || []) - worstRank(claimsByRef[a.referent_id] || [])
                || a.referent_id.localeCompare(b.referent_id))
            .forEach(r => wrap.appendChild(buildReferentBlock(r, claimsByRef[r.referent_id] || [], dossiers)));
    });
    return wrap;
}

function permalink(id) {
    const a = h('a', { class: 'clm-anchor', href: `#${id}`, title: 'Copy permalink', text: '§' });
    a.addEventListener('click', e => {
        e.preventDefault();
        history.replaceState(null, '', `#${id}`);
        navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${id}`);
        a.classList.add('clm-anchor--copied');
        setTimeout(() => a.classList.remove('clm-anchor--copied'), 1200);
    });
    return a;
}

function buildReferentBlock(r, rClaims, dossiers) {
    const block = h('div', { class: 'clm-ref', id: r.referent_id });

    const head = h('div', { class: 'clm-ref-head' }, [
        h('span', { class: 'clm-ref-id' }, [permalink(r.referent_id), ` ${r.referent_id}`]),
        h('span', { class: 'clm-ref-meta', text: [r.evidence_type, r.source_date].filter(Boolean).join('  ·  ').toUpperCase() }),
    ]);
    block.appendChild(head);

    block.appendChild(h('blockquote', { class: 'clm-ref-statement', text: r.authoritative_statement }));

    const source = h('div', { class: 'clm-ref-source' }, [
        h('span', { class: 'clm-ref-source-name', text: r.source_of_truth }),
        r.source_url
            ? h('a', { class: 'clm-ref-source-link', href: r.source_url, target: '_blank', rel: 'noopener', text: 'SOURCE ↗' })
            : h('span', { class: 'clm-ref-source-pending', text: 'SOURCE PENDING VERIFICATION' }),
    ]);
    block.appendChild(source);

    const ordered = rClaims.slice().sort((a, b) =>
        (a.variant_type === 'as-made' ? 0 : 1) - (b.variant_type === 'as-made' ? 0 : 1)
        || a.claim_id.localeCompare(b.claim_id, 'en', { numeric: true }));
    ordered.forEach(c => block.appendChild(buildClaimRow(c, dossiers[c.claim_id])));

    if (r.references.length) block.appendChild(buildRelated(r.references));
    return block;
}

function buildClaimRow(c, dossier) {
    const meta = ratingMeta(c.accuracy_rating);
    const row = h('div', { class: 'clm-claim', id: c.claim_id });

    const variant = h('div', {
        class: `clm-variant ${c.variant_type === 'circulating' ? 'clm-variant--circulating' : ''}`,
        text: c.variant_type === 'circulating' ? 'CIRCULATING' : 'AS MADE',
    });

    const body = h('div', { class: 'clm-claim-body' });
    body.appendChild(h('div', { class: 'clm-claim-text', text: c.claim_as_stated }));
    if (c.has_single_claimant) {
        body.appendChild(h('div', { class: 'clm-claimant', text: [real(c.claimant), real(c.claimant_role)].filter(Boolean).join(' — ') }));
    } else {
        body.appendChild(h('div', { class: 'clm-claimant clm-claimant--diffuse' }, [
            h('span', { class: 'clm-diffuse-badge', text: 'DIFFUSE' }),
            h('span', { text: c.claimant }),
        ]));
    }
    if (dossier) {
        body.appendChild(h('a', { class: 'clm-dossier-link', href: `/claim.html?id=${c.claim_id}`, text: 'READ THE DOSSIER →' }));
    }

    const gradeCell = h('div', { class: 'clm-grade' });
    gradeCell.appendChild(h('span', {
        class: 'clm-pill',
        style: `color:${meta.color};border-color:${meta.border}`,
        text: meta.label,
    }));
    gradeCell.appendChild(buildGradePop(c, meta));

    const anchorCell = h('div', { class: 'clm-claim-anchor' }, [permalink(c.claim_id)]);

    row.appendChild(variant);
    row.appendChild(body);
    row.appendChild(gradeCell);
    row.appendChild(anchorCell);
    return row;
}

function buildGradePop(c, meta) {
    const pop = h('div', { class: 'clm-grade-pop' });
    pop.appendChild(h('div', { class: 'clm-grade-pop-head' }, [
        h('span', { class: 'clm-grade-pop-rating', style: `color:${meta.color === '#8C8676' ? '#B8B1A2' : '#F0A579'}`, text: meta.label }),
        h('span', { class: 'clm-grade-pop-src', text: [real(c.claim_source), real(c.claim_date)].filter(Boolean).join('  ·  ') }),
    ]));
    pop.appendChild(h('div', { class: 'clm-grade-pop-body', text: c.accuracy_rationale }));
    if (c.counterclaim_summary) {
        pop.appendChild(h('div', { class: 'clm-grade-pop-counter' }, [
            h('span', { class: 'clm-grade-pop-counter-tag', text: 'COUNTER ' }),
            `${c.counterclaim_summary}${c.counterclaimant ? ` — ${c.counterclaimant}` : ''}`,
        ]));
    }
    return pop;
}

function buildRelated(references) {
    const wrap = h('div', { class: 'clm-related' });
    wrap.appendChild(h('div', { class: 'clm-related-head', text: 'RELATED STATEMENTS' }));
    references.slice().sort((a, b) => (a.date || '').localeCompare(b.date || '')).forEach(el => {
        const row = h('div', { class: 'clm-related-row' });
        row.appendChild(h('span', { class: 'clm-related-date', text: el.date || '—' }));
        const body = h('span', { class: 'clm-related-text' }, [
            el.kind === 'verbatim' ? `“${el.text}”` : el.text,
        ]);
        row.appendChild(body);
        const tags = h('span', { class: 'clm-related-tags' }, [
            el.stance === 'counter' ? h('span', { class: 'clm-related-counter', text: 'COUNTER' }) : null,
            el.provenance === 'secondary' ? h('span', { class: 'clm-related-secondary', text: '2ND-HAND' }) : null,
            el.url ? h('a', { class: 'clm-related-link', href: el.url, target: '_blank', rel: 'noopener', text: '↗' }) : null,
        ]);
        row.appendChild(tags);
        wrap.appendChild(row);
    });
    return wrap;
}

// ── Footer ──────────────────────────────────────────────────────
function buildFooter() {
    const foot = h('div', { class: 'clm-footnote' });
    const scale = Object.entries(RATING_META)
        .sort((a, b) => a[1].rank - b[1].rank)
        .map(([, m]) => `<span style="color:${m.color}">${m.label}</span>`)
        .join(' · ');
    foot.innerHTML = `GRADING ${scale}<br>Grades measure a specific wording against its referent’s authoritative statement — not the claimant. PREMATURE = the prediction’s deadline hasn’t arrived; it is never graded true or false. DIFFUSE = a claim that circulates widely with no single firm proponent; the individually documented statements appear under “Related statements.”`;
    return foot;
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
