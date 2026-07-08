/**
 * adoption-page.js — Standalone "Adoption Panel" page (adoption.html).
 *
 * The premise (see data/adoption/README.md): survey disagreement stays visible.
 * Nothing here averages, blends, or splices — the lede is the RANGE across
 * sources, every number travels with its question wording and base, and series
 * breaks (BTOS's wording cut, Pew's redesign, RPS's reweighting) are drawn as
 * breaks, never as smooth trends.
 *
 * The conditions-first summary table adapts the format of Table 1 in
 * Jeffrey S. Allen, "Monitoring AI Adoption in the U.S. Economy," FEDS Notes,
 * April 3, 2026 (doi 10.17016/2380-7172.4032) — credited in the page footer.
 *
 * Everything is derived from src/data/adoption.json (built from
 * data/adoption/*.csv); no value is baked into this file.
 */
import '../css/main.css';
import data from '../data/adoption.json';

const { questions, estimates } = data;
const Q = Object.fromEntries(questions.map(q => [q.question_id, q]));

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── DOM helper (house pattern) ──────────────────────────────────
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

// ── date helpers ────────────────────────────────────────────────
function parseDate(s) {
    if (!s) return null;
    const p = s.split('-').map(Number);
    if (p.length === 1) return new Date(p[0], 6, 1);
    if (p.length === 2) return new Date(p[0], p[1] - 1, 15);
    return new Date(p[0], p[1] - 1, p[2]);
}
function estDate(e) { return parseDate(e.field_end) || parseDate(e.field_start) || parseDate(e.retrieved_date); }
function dateLabel(s) {
    const d = parseDate(s);
    return d ? `${MON[d.getMonth()]} ${d.getFullYear()}` : '';
}

const VALUE_BASE_LABELS = {
    all_adults: 'All US adults',
    adults_18_64: 'US adults 18–64',
    employed: 'Employed US adults',
    employed_all: 'All employed adults',
    employed_users: 'Employed chatbot users',
    employed_primary: 'Workers (one or primary job)',
    aware_form1: 'Adults aware of ChatGPT',
    aware_employed: 'Aware + employed adults',
    users: 'AI chatbot users',
    businesses: 'US employer businesses (firm-weighted)',
    businesses_employment_weighted: 'US employer businesses (employment-weighted)',
};
const CONSTRUCT_LABELS = {
    ai_broad: 'AI, broadly',
    generative_ai: 'Generative AI',
    ai_chatbot: 'AI chatbots',
    brand_specific: 'Specific product',
};

function latestFor(qid, filter) {
    const rows = estimates.filter(e => e.question_id === qid && e.value != null && (!filter || filter(e)));
    rows.sort((a, b) => estDate(a) - estDate(b));
    return rows[rows.length - 1] || null;
}

// ── §1 The conditions table (format after Allen 2026, FEDS Notes Table 1) ──
const LEDE_ROWS = [
    { qid: 'rps-genai-any', label: 'Uses generative AI, work or home' },
    { qid: 'pew-chatusemod', label: 'Ever uses an AI chatbot' },
    { qid: 'gallup-wf-total-users', label: 'Uses AI at work — few times a year or more' },
    { qid: 'rps-genai-work', label: 'Uses generative AI for their job' },
    { qid: 'pew-chatspec', pick: e => /ChatGPT \(asked of all\)/.test(e.notes || '') || e.estimate_id.includes('-gpt-'), label: 'Uses ChatGPT, specifically' },
    { qid: 'gallup-wf-frequent-users', label: 'Uses AI at work — few times a week or more' },
    { qid: 'pew-aiwrkdone', label: 'At least some of their work is done with AI' },
    { qid: 'btos-supp2-worker-genai', label: 'Business reports employees used genAI (6 months)' },
    { qid: 'btos-current-v2', label: 'Business used AI in the last two weeks' },
];

function buildConditionsTable() {
    const rows = LEDE_ROWS.map(cfg => {
        const q = Q[cfg.qid];
        const est = latestFor(cfg.qid, cfg.pick);
        return est && q ? { cfg, q, est } : null;
    }).filter(Boolean);

    const table = h('div', { class: 'adp-table' });
    table.appendChild(h('div', { class: 'adp-table-head' }, [
        h('span', { text: 'What was measured' }),
        h('span', { text: 'Of whom' }),
        h('span', { text: 'Source · wave' }),
        h('span', { class: 'adp-th-est', text: 'Estimate' }),
    ]));

    for (const { cfg, q, est } of rows) {
        const row = h('div', { class: 'adp-row', tabindex: '0' });
        row.appendChild(h('div', { class: 'adp-row-main' }, [
            h('div', { class: 'adp-row-measure' }, [
                h('span', { class: 'adp-row-label', text: cfg.label }),
                h('span', { class: `adp-chip adp-chip-${q.construct}`, text: CONSTRUCT_LABELS[q.construct] || q.construct }),
            ]),
            h('span', { class: 'adp-row-base', text: VALUE_BASE_LABELS[est.value_base] || est.value_base }),
            h('span', { class: 'adp-row-src', text: `${surveyName(q.survey_id)} · ${shortWave(est)}` }),
            h('span', { class: 'adp-row-est', text: `${est.value}%` }),
        ]));
        const wording = q.wording_status === 'published'
            ? h('blockquote', { class: 'adp-wording', text: `“${q.wording_verbatim}”` })
            : h('div', { class: 'adp-wording adp-wording-unpub' }, [
                h('span', { class: 'adp-unpub-tag', text: 'STEM UNPUBLISHED' }),
                ` The publisher's own definition: “${q.publisher_definition}”`,
            ]);
        row.appendChild(h('div', { class: 'adp-row-detail' }, [
            wording,
            h('div', { class: 'adp-detail-meta', text: `Asked of: ${q.base_population}` }),
            q.response_options ? h('div', { class: 'adp-detail-meta', text: `Options: ${q.response_options}` }) : null,
            h('div', { class: 'adp-detail-meta' }, [
                'Published at: ',
                h('a', { href: est.publication_url, target: '_blank', rel: 'noopener', text: hostOf(est.publication_url) }),
                est.n ? ` · n=${Number(est.n).toLocaleString('en-US')}` : '',
                est.moe ? ` · ±${est.moe} pts` : '',
            ]),
        ]));
        row.addEventListener('click', () => row.classList.toggle('open'));
        row.addEventListener('keydown', ev => { if (ev.key === 'Enter') row.classList.toggle('open'); });
        table.appendChild(row);
    }
    return { table, values: rows.map(r => r.est.value) };
}

function surveyName(sid) {
    return { 'pew-atp': 'Pew', 'pew-atp-workers': 'Pew (workers)', 'gallup-wf': 'Gallup', btos: 'Census BTOS', rps: 'RPS' }[sid] || sid;
}
function shortWave(est) {
    const d = est.field_end || est.field_start || '';
    return dateLabel(d) || est.wave_label;
}
function hostOf(url) { try { return new URL(url).hostname.replace('www.', ''); } catch { return 'source'; } }

// ── §2 The chart: breaks drawn as breaks ────────────────────────
const SERIES = [
    { qid: 'rps-genai-any', label: 'GenAI, any use (RPS)', pop: 'US adults', color: '#1F7A4D' },
    { qid: 'pew-chatusemod', label: 'Ever uses a chatbot (Pew, 2026 question)', pop: 'US adults', color: '#7B3EA3', markerOnly: true, big: true },
    { qid: 'pew-chatuse', label: 'Ever used a chatbot (Pew, 2024 question)', pop: 'US adults', color: '#A879C9', markerOnly: true },
    { qid: 'pew-gptuse', label: 'Ever used ChatGPT (Pew, retired 2025)', pop: 'US adults', color: '#7B3EA3', dash: '5 4', baseFilter: e => e.value_base === 'all_adults' },
    { qid: 'rps-genai-work', label: 'GenAI for their job (RPS)', pop: 'Workers', color: '#3E9B6E' },
    { qid: 'gallup-wf-total-users', label: 'AI at work, yearly+ (Gallup)', pop: 'Workers', color: '#2B5BA7' },
    { qid: 'gallup-wf-frequent-users', label: 'AI at work, weekly+ (Gallup)', pop: 'Workers', color: '#7C99C9', dash: '5 4' },
    { qid: 'pew-aiwrkdone', label: 'Work done with AI: some+ (Pew)', pop: 'Workers', color: '#0E7490', dash: '2 3' },
    { qid: 'btos-current-v1', label: 'Business uses AI — “producing goods or services” (BTOS, retired)', pop: 'Businesses', color: '#D9A188' },
    { qid: 'btos-current-v2', label: 'Business uses AI — “any business function” (BTOS, new series)', pop: 'Businesses', color: '#C2410C' },
];

const X0 = new Date(2022, 10, 1), X1 = new Date(2026, 7, 15);
const W = 960, H = 430, ML = 46, MR = 14, MT = 16, MB = 46, YMAX = 70;
const xOf = d => ML + ((d - X0) / (X1 - X0)) * (W - ML - MR);
const yOf = v => MT + (1 - v / YMAX) * (H - MT - MB);

function svgEl(tag, attrs = {}, children = []) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    for (const c of [].concat(children)) if (c != null) el.appendChild(c);
    return el;
}
function svgText(x, y, text, cls, anchor = 'middle') {
    const t = svgEl('text', { x, y, class: cls, 'text-anchor': anchor });
    t.textContent = text;
    return t;
}

function buildChart(activeSet) {
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'adp-chart-svg', role: 'img',
        'aria-label': 'AI adoption estimates over time, one line per question version, with series breaks left visible' });

    // gridlines + y labels
    for (let v = 0; v <= YMAX; v += 10) {
        svg.appendChild(svgEl('line', { x1: ML, x2: W - MR, y1: yOf(v), y2: yOf(v), class: 'adp-grid' }));
        svg.appendChild(svgText(ML - 8, yOf(v) + 4, `${v}%`, 'adp-axis-label', 'end'));
    }
    // x ticks: Jan + Jul each year
    for (let y = 2023; y <= 2026; y++) {
        for (const m of [0, 6]) {
            const d = new Date(y, m, 1);
            if (d < X0 || d > X1) continue;
            svg.appendChild(svgEl('line', { x1: xOf(d), x2: xOf(d), y1: H - MB, y2: H - MB + 5, class: 'adp-tick' }));
            svg.appendChild(svgText(xOf(d), H - MB + 18, m === 0 ? `${y}` : 'Jul', 'adp-axis-label'));
        }
    }

    // the shutdown + wording-break band (BTOS cycles 202521–202523 never collected)
    const bx1 = xOf(new Date(2025, 9, 6)), bx2 = xOf(new Date(2025, 10, 16));
    svg.appendChild(svgEl('rect', { x: bx1, y: MT, width: bx2 - bx1, height: H - MT - MB, class: 'adp-break-band' }));
    svg.appendChild(svgText((bx1 + bx2) / 2, MT + 12, '↓ shutdown gap + BTOS wording change', 'adp-break-label'));

    for (const s of SERIES) {
        if (!activeSet.has(s.qid)) continue;
        const q = Q[s.qid];
        const rows = estimates
            .filter(e => e.question_id === s.qid && e.value != null && (!s.baseFilter || s.baseFilter(e)))
            .map(e => ({ e, d: estDate(e) }))
            .filter(p => p.d)
            .sort((a, b) => a.d - b.d);
        if (!rows.length) continue;

        const solid = rows.filter(p => !/PRE-REVISION/.test(p.e.notes || ''));
        const hollow = rows.filter(p => /PRE-REVISION/.test(p.e.notes || ''));

        if (!s.markerOnly && solid.length > 1) {
            const dAttr = solid.map((p, i) => `${i ? 'L' : 'M'}${xOf(p.d).toFixed(1)},${yOf(p.e.value).toFixed(1)}`).join(' ');
            svg.appendChild(svgEl('path', { d: dAttr, fill: 'none', stroke: s.color,
                'stroke-width': 2, 'stroke-dasharray': s.dash || 'none', 'stroke-linejoin': 'round' }));
        }
        for (const p of solid.concat(hollow)) {
            const isHollow = hollow.includes(p);
            const c = svgEl('circle', {
                cx: xOf(p.d), cy: yOf(p.e.value), r: s.big ? 5 : (solid.length > 20 ? 2.4 : 3.6),
                fill: isHollow ? 'var(--rec-panel, #FBFAF6)' : s.color,
                stroke: s.color, 'stroke-width': isHollow ? 1.6 : 0, class: 'adp-pt',
            });
            const wording = q.wording_status === 'published' ? q.wording_verbatim : `(stem unpublished) ${q.publisher_definition}`;
            const t = svgEl('title');
            t.textContent = `${p.e.value}% — ${s.label}\n${p.e.wave_label}${isHollow ? ' — PRE-REVISION value' : ''}\n“${wording.slice(0, 160)}${wording.length > 160 ? '…' : ''}”`;
            c.appendChild(t);
            svg.appendChild(c);
        }
    }
    return svg;
}

function buildLegend(activeSet, rerender) {
    const wrap = h('div', { class: 'adp-legend' });
    const groups = {};
    for (const s of SERIES) (groups[s.pop] = groups[s.pop] || []).push(s);
    for (const [pop, list] of Object.entries(groups)) {
        const g = h('div', { class: 'adp-legend-group' }, [h('span', { class: 'adp-legend-pop', text: pop })]);
        for (const s of list) {
            const chip = h('button', { class: 'adp-legend-chip' + (activeSet.has(s.qid) ? ' on' : ''), type: 'button' }, [
                h('span', { class: 'adp-legend-swatch', style: `background:${s.color}` }),
                s.label,
            ]);
            chip.addEventListener('click', () => {
                activeSet.has(s.qid) ? activeSet.delete(s.qid) : activeSet.add(s.qid);
                rerender();
            });
            g.appendChild(chip);
        }
        wrap.appendChild(g);
    }
    return wrap;
}

// ── §3 The wording museum ───────────────────────────────────────
const SURVEY_ORDER = ['pew-atp', 'pew-atp-workers', 'gallup-wf', 'btos', 'rps'];
const SURVEY_TITLES = {
    'pew-atp': 'Pew Research Center — American Trends Panel',
    'pew-atp-workers': 'Pew Research Center — workers series',
    'gallup-wf': 'Gallup Panel Workforce Study',
    btos: 'Census Bureau — Business Trends and Outlook Survey',
    rps: 'Real-Time Population Survey — GenAI Adoption Tracker',
};

function buildMuseum() {
    const wrap = h('div', { class: 'adp-museum' });
    for (const sid of SURVEY_ORDER) {
        const qs = questions.filter(q => q.survey_id === sid);
        if (!qs.length) continue;
        wrap.appendChild(h('h3', { class: 'adp-museum-survey', text: SURVEY_TITLES[sid] || sid }));
        for (const q of qs) {
            const card = h('div', { class: 'adp-qcard', id: `q-${q.question_id}` });
            card.appendChild(h('div', { class: 'adp-qcard-head' }, [
                h('span', { class: 'adp-qid', text: q.question_id }),
                h('span', { class: `adp-chip adp-chip-${q.construct}`, text: CONSTRUCT_LABELS[q.construct] || q.construct }),
                h('span', { class: 'adp-chip adp-chip-concept', text: q.concept.replace('_', ' ') }),
                h('span', { class: 'adp-qdates', text: fieldedRange(q) }),
            ]));
            if (q.wording_status === 'published') {
                card.appendChild(h('blockquote', { class: 'adp-wording', text: `“${q.wording_verbatim}”` }));
            } else {
                card.appendChild(h('div', { class: 'adp-wording adp-wording-unpub' }, [
                    h('span', { class: 'adp-unpub-tag', text: q.wording_status.toUpperCase() }),
                    ` ${q.publisher_definition}`,
                ]));
            }
            if (q.response_options) card.appendChild(h('div', { class: 'adp-detail-meta', text: `Options: ${q.response_options}` }));
            card.appendChild(h('div', { class: 'adp-detail-meta', text: `Asked of: ${q.base_population}` }));
            const links = [];
            if (q.supersedes) links.push(h('a', { href: `#q-${q.supersedes}`, text: `replaces ${q.supersedes}` }));
            if (q.superseded_by) links.push(h('a', { href: `#q-${q.superseded_by}`, text: `replaced by ${q.superseded_by}` }));
            if (links.length) {
                const lineage = h('div', { class: 'adp-lineage' }, [h('span', { text: '↔ ' })]);
                links.forEach((a, i) => { if (i) lineage.appendChild(document.createTextNode(' · ')); lineage.appendChild(a); });
                card.appendChild(lineage);
            }
            if (q.break_note) card.appendChild(h('div', { class: 'adp-breaknote', text: q.break_note }));
            card.appendChild(h('div', { class: 'adp-detail-meta' }, [
                'Wording verified at: ',
                h('a', { href: q.source_url, target: '_blank', rel: 'noopener', text: hostOf(q.source_url) }),
            ]));
            wrap.appendChild(card);
        }
    }
    return wrap;
}
function fieldedRange(q) {
    const a = dateLabel(q.first_fielded), b = q.last_fielded ? dateLabel(q.last_fielded) : 'active';
    return a ? `${a} → ${b}` : '';
}

// ── page assembly ───────────────────────────────────────────────
function render() {
    const mount = document.getElementById('adoption-page');
    const { table, values } = buildConditionsTable();
    const lo = Math.round(Math.min(...values)), hi = Math.round(Math.max(...values));
    const updated = estimates.map(e => e.retrieved_date).sort().pop();

    const header = h('header', { class: 'adp-header' }, [
        h('div', { class: 'adp-kicker', text: 'THE ADOPTION PANEL' }),
        h('h1', { class: 'adp-title' }, [
            'How many people use AI? Somewhere between ',
            h('strong', { text: `${lo}%` }), ' and ', h('strong', { text: `${hi}%` }),
            ' — depending entirely on what you ask, and of whom.',
        ]),
        h('p', { class: 'adp-lede' }, [
            'Every number below is real, current, and defensible. They differ because the questions differ — ',
            'which technology counts as “AI,” who gets asked, over what window, at what frequency bar. ',
            'This panel keeps those conditions attached to every estimate instead of averaging them away. ',
            'No composite, no splicing across question changes, no numbers read off charts: every value is publisher-stated, ',
            'with the verbatim question one click away.',
        ]),
        h('div', { class: 'adp-updated', text: `Data verified ${dateLabel(updated)} · sources: Pew ATP, Gallup Panel Workforce Study, Census BTOS, Real-Time Population Survey` }),
    ]);

    const active = new Set(SERIES.map(s => s.qid));
    const chartCard = h('section', { class: 'adp-chart-card' });
    const chartHead = h('div', { class: 'adp-section-head' }, [
        h('h2', { text: 'The honest chart' }),
        h('p', { class: 'adp-section-sub', text: 'One line per question version. Where a line stops and another starts, the survey changed its question — Census cut a new series at its Nov 2025 rewording (during a shutdown data gap), Pew replaced its ChatGPT question in 2026, and RPS reweighted its own 2024–25 waves (hollow points are pre-revision values). Connecting these segments would manufacture trends nobody measured.' }),
    ]);
    const chartHost = h('div', { class: 'adp-chart-host' });
    const legendHost = h('div');
    const redraw = () => {
        chartHost.replaceChildren(buildChart(active));
        legendHost.replaceChildren(buildLegend(active, redraw));
    };
    redraw();
    chartCard.append(chartHead, chartHost, legendHost);

    const tableCard = h('section', { class: 'adp-table-card' }, [
        h('div', { class: 'adp-section-head' }, [
            h('h2', { text: 'The latest estimates, conditions attached' }),
            h('p', { class: 'adp-section-sub', text: 'Click any row for the verbatim question behind the number.' }),
        ]),
        table,
    ]);

    const museumCard = h('section', { class: 'adp-museum-card' }, [
        h('div', { class: 'adp-section-head' }, [
            h('h2', { text: 'Every question version' }),
            h('p', { class: 'adp-section-sub', text: 'The wording record: each version of each question, with its lineage. When a stat circulates stripped of its conditions, this is where to check what was actually asked.' }),
        ]),
        buildMuseum(),
    ]);

    const method = h('footer', { class: 'adp-method' }, [
        h('p', {}, [
            'Method: one row per survey × wave × question version; wording changes start new series; publisher revisions are flagged, never overwritten. ',
            'Dataset, schema, and source record: ',
            h('a', { href: 'https://github.com/ReedRawlings/ai-timeline/tree/main/data/adoption', target: '_blank', rel: 'noopener', text: 'data/adoption' }),
            '.',
        ]),
        h('p', {}, [
            'The conditions-first summary table adapts the format of Table 1 in ',
            h('a', { href: 'https://doi.org/10.17016/2380-7172.4032', target: '_blank', rel: 'noopener', text: 'Jeffrey S. Allen, “Monitoring AI Adoption in the U.S. Economy,” FEDS Notes (April 2026)' }),
            ' — the Federal Reserve’s own conditions-preserving comparison of these surveys, and the best published statement of why these numbers should never be averaged.',
        ]),
    ]);

    mount.replaceChildren(header, tableCard, chartCard, museumCard, method);
}

render();
