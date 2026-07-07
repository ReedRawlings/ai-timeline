/**
 * claim-page.js — Dossier template page (claim.html?id=C028b).
 *
 * Renders one claim's editorial dossier: grade banner, verdict, analysis
 * sections, the referent's authoritative statement, and a dated reference
 * list. The grade, claim text, claimant, and rationale are joined from
 * claims.csv data at render time — a dossier YAML never stores them
 * (data/claims/README.md; spec 2026-07-07-claim-dossiers-design.md).
 * Unknown ids or claims without a dossier get an honest empty state.
 */
import '../css/main.css';
import data from '../data/claims.json';

const RATING_META = {
    'accurate':                    { label: 'ACCURATE',        color: '#1F7A4D', border: '#A8CDB8' },
    'mostly accurate':             { label: 'MOSTLY ACCURATE', color: '#55803B', border: '#BFD3AC' },
    'premature / unverifiable':    { label: 'PREMATURE',       color: '#8C8676', border: '#D9D3C5' },
    'mixed / true-but-misleading': { label: 'MIXED / TRUE-BUT-MISLEADING', color: '#8A5A2B', border: '#DCC9AE' },
    'mostly false':                { label: 'MOSTLY FALSE',    color: '#B45309', border: '#E7B79E' },
    'false':                       { label: 'FALSE',           color: '#B91C1C', border: '#E5A3A3' },
};

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

function real(v) { return v && !/^[-–—]+$/.test(String(v).trim()) ? v : null; }

export function initClaimPage({ referents, claims, dossiers }) {
    const mount = document.getElementById('claim-page');
    if (!mount) return;

    const id = new URLSearchParams(location.search).get('id');
    const dossier = id ? dossiers[id] : null;
    const claim = id ? claims.find(c => c.claim_id === id) : null;

    if (!dossier || !claim) {
        mount.appendChild(buildEmptyState(id, claim));
        return;
    }
    const referent = referents.find(r => r.referent_id === claim.referent_id);
    document.title = `${dossier.headline} — The AI Record`;

    mount.appendChild(buildDossier(dossier, claim, referent));
}

function buildEmptyState(id, claim) {
    const wrap = h('div', { class: 'clmd-empty' });
    wrap.appendChild(h('div', { class: 'clmd-eyebrow', text: 'Claim Dossier' }));
    wrap.appendChild(h('h1', {
        class: 'clmd-empty-title',
        text: id
            ? (claim ? `No dossier has been written for ${id} yet.` : `No claim with id “${id}” exists.`)
            : 'No claim selected.',
    }));
    if (claim) {
        wrap.appendChild(h('p', { class: 'clmd-empty-note', text: `The claim exists in the repository — see its graded entry on the Claims page.` }));
        wrap.appendChild(h('a', { class: 'clmd-back', href: `/claims.html#${claim.claim_id}`, text: `← VIEW ${claim.claim_id} ON THE CLAIMS PAGE` }));
    } else {
        wrap.appendChild(h('a', { class: 'clmd-back', href: '/claims.html', text: '← ALL CLAIMS' }));
    }
    return wrap;
}

function buildDossier(d, claim, referent) {
    const meta = RATING_META[claim.accuracy_rating] || RATING_META['premature / unverifiable'];
    const wrap = h('article', { class: 'clmd' });

    // Kicker + headline
    wrap.appendChild(h('div', { class: 'clmd-topline' }, [
        h('a', { class: 'clmd-back', href: '/claims.html', text: '← ALL CLAIMS' }),
        h('span', { class: 'clmd-eyebrow', text: 'Claim Dossier' }),
    ]));
    wrap.appendChild(h('h1', { class: 'clmd-headline', text: d.headline }));
    wrap.appendChild(h('p', { class: 'clmd-dek', text: d.dek }));

    // Grade banner: the claim as stated + the grade, joined from claims.csv
    const banner = h('div', { class: 'clmd-banner', style: `border-color:${meta.border}` });
    banner.appendChild(h('div', { class: 'clmd-banner-claim' }, [
        h('div', { class: 'clmd-banner-tag', text: claim.variant_type === 'circulating' ? 'AS IT CIRCULATES' : 'AS MADE' }),
        h('div', { class: 'clmd-banner-text', text: `“${claim.claim_as_stated}”` }),
        h('div', { class: 'clmd-banner-claimant', text: [real(claim.claimant), real(claim.claim_date)].filter(Boolean).join('  ·  ') }),
    ]));
    banner.appendChild(h('div', { class: 'clmd-banner-grade' }, [
        h('div', { class: 'clmd-banner-grade-label', text: 'GRADE' }),
        h('div', { class: 'clmd-banner-rating', style: `color:${meta.color}`, text: meta.label }),
    ]));
    wrap.appendChild(banner);

    // Verdict
    wrap.appendChild(h('div', { class: 'clmd-section-head', text: 'THE VERDICT' }));
    wrap.appendChild(h('p', { class: 'clmd-verdict', text: d.verdict_summary }));

    // Analysis sections
    (d.sections || []).forEach(s => {
        wrap.appendChild(h('div', { class: 'clmd-section-head', text: s.heading.toUpperCase() }));
        wrap.appendChild(h('p', { class: 'clmd-body', text: s.body }));
    });

    // The authoritative statement (same visual idiom as the claims page)
    if (referent) {
        wrap.appendChild(h('div', { class: 'clmd-section-head', text: 'THE AUTHORITATIVE STATEMENT' }));
        const refBlock = h('div', { class: 'clmd-refblock' });
        refBlock.appendChild(h('blockquote', { class: 'clm-ref-statement', text: referent.authoritative_statement }));
        refBlock.appendChild(h('div', { class: 'clm-ref-source' }, [
            h('span', { class: 'clm-ref-source-name', text: referent.source_of_truth }),
            referent.source_url
                ? h('a', { class: 'clm-ref-source-link', href: referent.source_url, target: '_blank', rel: 'noopener', text: 'SOURCE ↗' })
                : h('span', { class: 'clm-ref-source-pending', text: 'SOURCE PENDING VERIFICATION' }),
        ]));
        wrap.appendChild(refBlock);
    }

    // References
    wrap.appendChild(h('div', { class: 'clmd-section-head', text: 'REFERENCES' }));
    const refs = h('div', { class: 'clmd-refs' });
    (d.references || []).forEach(r => {
        refs.appendChild(h('div', { class: 'clmd-ref-row' }, [
            h('span', { class: 'clmd-ref-date', text: r.date }),
            h('span', { class: 'clmd-ref-body' }, [
                r.url
                    ? h('a', { class: 'clmd-ref-label', href: r.url, target: '_blank', rel: 'noopener', text: r.label })
                    : h('span', { class: 'clmd-ref-label clmd-ref-label--plain', text: r.label }),
                r.note ? h('span', { class: 'clmd-ref-note', text: ` — ${r.note}` }) : null,
            ]),
        ]));
    });
    wrap.appendChild(refs);

    // Provenance footer
    const foot = h('div', { class: 'clmd-provenance' });
    foot.appendChild(h('span', {
        html: `Graded in the <a href="/claims.html#${claim.claim_id}">claims repository</a> as `
            + `<a href="/claims.html#${claim.claim_id}">${claim.claim_id}</a>, against referent `
            + `<a href="/claims.html#${claim.referent_id}">${claim.referent_id}</a>. `
            + `The grade above is read from the repository, never restated here.`,
    }));
    foot.appendChild(h('span', {
        class: 'clmd-provenance-dates',
        text: `WRITTEN ${d.written}${d.updated && d.updated !== d.written ? ` · UPDATED ${d.updated}` : ''}`,
    }));
    wrap.appendChild(foot);

    return wrap;
}

initClaimPage(data);
