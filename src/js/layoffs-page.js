/**
 * layoffs-page.js — Standalone "Layoff Tracker" page (layoffs.html).
 *
 * Editorial layout: digest lede + a monthly-volume/cumulative chart + a ranked
 * "every tracked cut" table. Each verification label carries a hover-to-explain
 * popover surfacing the provenance we track per row (source type, reason, link).
 *
 * Everything on the page is derived from src/data/layoffs.json (built from
 * data/layoffs/layoffs.csv) — the headline total, company/undisclosed counts,
 * sector list and date range are all computed from the source data, not baked in.
 */
import '../css/main.css';
import layoffs from '../data/layoffs.json';

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SOURCE_LABELS = {
    company_statement: 'Company statement',
    regulatory_filing: 'Regulatory filing',
    press_report: 'Press report',
    government_data: 'Government data',
};

const CAUSAL_MAP = {
    sole:       { label: 'SOLE',       color: '#C2410C', border: '#E7B79E', weight: 600 },
    mixed:      { label: 'MIXED',      color: '#8A5A2B', border: '#DCC9AE', weight: 500 },
    contextual: { label: 'CONTEXTUAL', color: '#8C8676', border: '#D9D3C5', weight: 400 },
};

const VERIF_MAP = {
    verified:      { label: 'VERIFIED', color: '#1F7A4D' },
    single_source: { label: '1 SOURCE', color: '#A8A294' },
    disputed:      { label: 'DISPUTED', color: '#B45309' },
};

const SECTOR_DISPLAY = { tech: 'Big Tech', edtech: 'Edtech', fintech: 'Fintech', media: 'Media' };
const SECTOR_ORDER = ['tech', 'edtech', 'fintech', 'media'];

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

function fmt(n) { return n.toLocaleString('en-US'); }
function dayLabel(d) { const p = d.split('-').map(Number); return `${MON[p[1] - 1]} ${p[2]} ${p[0]}`; }
function monthLabelShort(k) { const p = k.split('-'); return `${MON[+p[1] - 1]} '${p[0].slice(2)}`; }
function stripNotesPrefix(s) { return (s || '').replace(/^(Recode|PROPOSED)[^.]*\.\s*/, ''); }

export function initLayoffsPage(rows) {
    const mount = document.getElementById('layoffs-page');
    if (!mount) return;

    const data = rows.slice().sort((a, b) => a.announcement_date.localeCompare(b.announcement_date));

    // ── Monthly buckets on a continuous axis ──────────────────────
    const bucket = {};
    data.forEach(r => {
        if (!(Number.isFinite(r.count) && r.count > 0)) return;
        const k = r.announcement_date.slice(0, 7);
        (bucket[k] = bucket[k] || { total: 0, companies: [] });
        const ex = bucket[k].companies.find(c => c.company === r.company);
        if (ex) ex.count += r.count; else bucket[k].companies.push({ company: r.company, count: r.count });
        bucket[k].total += r.count;
    });
    const keys = Object.keys(bucket).sort();
    const first = keys.length ? keys[0] : '2023-01';
    const last = keys.length ? keys[keys.length - 1] : '2026-03';
    const allKeys = [];
    let cur = first;
    while (cur <= last) {
        allKeys.push(cur);
        let [y, m] = cur.split('-').map(Number);
        m++; if (m > 12) { m = 1; y++; }
        cur = `${y}-${String(m).padStart(2, '0')}`;
    }

    const maxMonthly = Math.max(1, ...Object.values(bucket).map(b => b.total));
    let run = 0; const cumByKey = {};
    allKeys.forEach(k => { run += bucket[k] ? bucket[k].total : 0; cumByKey[k] = run; });
    const maxCum = run || 1;

    let peakLabel = '—', peakVal = 0;
    allKeys.forEach(k => { const t = bucket[k] ? bucket[k].total : 0; if (t > peakVal) { peakVal = t; peakLabel = monthLabelShort(k); } });

    // ── Headline stats (from full data, disclosed + undisclosed) ──
    const totalDisclosed = Object.values(bucket).reduce((s, b) => s + b.total, 0);
    const companyCount = new Set(data.map(r => r.company)).size;
    const undisclosedCount = data.filter(r => !(Number.isFinite(r.count) && r.count > 0)).length;
    const sectorsLabel = [...new Set(data.map(r => r.sector))]
        .filter(Boolean)
        .sort((a, b) => SECTOR_ORDER.indexOf(a) - SECTOR_ORDER.indexOf(b))
        .map(s => SECTOR_DISPLAY[s] || s)
        .join('  ·  ');

    // Date range from the source data (announcement dates)
    const firstDate = data[0].announcement_date, lastDate = data[data.length - 1].announcement_date;
    const fp = firstDate.split('-'), lp = lastDate.split('-');
    const rangeLabel = `DISCLOSED · ${MON[+fp[1] - 1]} ${fp[0]}—${MON[+lp[1] - 1]} ${lp[0]}`;

    // ── Assemble page ─────────────────────────────────────────────
    mount.appendChild(buildHeader({ totalDisclosed, companyCount, undisclosedCount, sectorsLabel, rangeLabel }));
    mount.appendChild(buildChart({ allKeys, bucket, maxMonthly, cumByKey, maxCum, peakLabel, totalDisclosed }));
    mount.appendChild(buildRankedList(data));
    mount.appendChild(buildFooter());
}

// ── Header ──────────────────────────────────────────────────────
function buildHeader({ totalDisclosed, companyCount, undisclosedCount, sectorsLabel, rangeLabel }) {
    const totalLabel = fmt(totalDisclosed);
    const wrap = h('div', { class: 'lay-header' });

    wrap.appendChild(h('div', { class: 'lay-eyebrow', text: 'Layoff Tracker' }));

    const titleRow = h('div', { class: 'lay-title-row' }, [
        h('h1', { class: 'lay-title', text: 'The cuts, counted' }),
        h('div', { class: 'lay-stat-block' }, [
            h('div', { class: 'lay-stat-total', html: `${totalLabel}<span class="lay-stat-total-unit"> JOBS</span>` }),
            h('div', { class: 'lay-stat-range', text: rangeLabel }),
        ]),
    ]);
    wrap.appendChild(titleRow);

    const lede = h('p', { class: 'lay-lede' });
    lede.innerHTML = 'Three years of cuts, and the framing has inverted. The 2023 wave — Google, Microsoft and Meta each shedding ten thousand-plus — was blamed on pandemic over-hiring, with AI only a background hum. By 2026 the attribution has moved to the foreground: <strong>Salesforce, Klarna, Chegg and Block</strong> now name automation as the direct cause — even as the single largest cut on record, <strong>Amazon’s 16,000 in January</strong>, is still officially about “efficiency.”';
    wrap.appendChild(lede);

    const chips = h('div', { class: 'lay-chips' }, [
        h('span', { class: 'lay-chip lay-chip--solid', text: `${totalLabel} DISCLOSED` }),
        h('span', { class: 'lay-chip lay-chip--ink', text: `${companyCount} COMPANIES` }),
        h('span', { class: 'lay-chip lay-chip--light', text: `${undisclosedCount} UNDISCLOSED` }),
        h('span', { class: 'lay-chip-divider' }),
        h('span', { class: 'lay-chip-sectors', text: sectorsLabel }),
    ]);
    wrap.appendChild(chips);
    return wrap;
}

// ── Chart: monthly bars + cumulative overlay ────────────────────
function buildChart({ allKeys, bucket, maxMonthly, cumByKey, maxCum, peakLabel, totalDisclosed }) {
    const totalLabel = fmt(totalDisclosed);
    const section = document.createDocumentFragment();

    // Section label + legend
    section.appendChild(h('div', { class: 'lay-section-head' }, [
        h('span', { class: 'lay-section-title', text: 'MONTHLY VOLUME & CUMULATIVE' }),
        h('div', { class: 'lay-chart-legend' }, [
            h('span', { class: 'lay-legend-item', html: '<span class="lay-legend-swatch"></span>MONTHLY CUTS' }),
            h('span', { class: 'lay-legend-item', html: '<span class="lay-legend-line"></span>CUMULATIVE' }),
        ]),
    ]));

    const card = h('div', { class: 'lay-chart-card' });

    card.appendChild(h('div', { class: 'lay-chart-scale' }, [
        h('span', { text: `PEAK MONTH · ${peakLabel}` }),
        h('span', { text: `${totalLabel} TOTAL →` }),
    ]));

    // Plot
    const plot = h('div', { class: 'lay-plot' });

    // Gridlines
    const grid = h('div', { class: 'lay-grid' });
    [0, 33.3, 66.6].forEach(top => grid.appendChild(h('div', { class: 'lay-gridline', style: `top:${top}%` })));
    grid.appendChild(h('div', { class: 'lay-gridline lay-gridline--base' }));
    plot.appendChild(grid);

    // Bars
    const barsRow = h('div', { class: 'lay-bars' });
    const n = allKeys.length;
    allKeys.forEach(k => {
        const b = bucket[k];
        const total = b ? b.total : 0;
        const barH = total > 0 ? Math.max(2, (total / maxMonthly) * 100) : 0;
        const col = h('div', { class: 'lay-barcol' });
        col.appendChild(h('div', { class: 'lay-bar', style: total > 0 ? `height:${barH}%;min-height:2px` : 'height:0' }));

        if (b) {
            const p = k.split('-');
            const tip = h('div', { class: 'lay-tip', style: `bottom:calc(${barH}% + 8px)` });
            tip.appendChild(h('div', { class: 'lay-tip-month', text: `${FULL[+p[1] - 1]} ${p[0]}` }));
            const list = h('div', { class: 'lay-tip-rows' });
            b.companies.slice().sort((x, y) => y.count - x.count).forEach(c => {
                list.appendChild(h('div', { class: 'lay-tip-row' }, [
                    h('span', { class: 'lay-tip-co', text: c.company }),
                    h('span', { class: 'lay-tip-ct', text: fmt(c.count) }),
                ]));
            });
            tip.appendChild(list);
            tip.appendChild(h('div', { class: 'lay-tip-total' }, [
                h('span', { text: 'MONTH' }), h('span', { class: 'lay-tip-total-val', text: fmt(total) }),
            ]));
            tip.appendChild(h('div', { class: 'lay-tip-run', text: `RUNNING · ${fmt(cumByKey[k])}` }));
            col.appendChild(tip);
        }
        barsRow.appendChild(col);
    });
    plot.appendChild(barsRow);

    // Cumulative overlay (0..100 space, non-scaling)
    const pts = allKeys.map((k, i) => {
        const x = n > 1 ? ((i + 0.5) / n) * 100 : 50;
        const y = 100 - (cumByKey[k] / maxCum) * 100;
        return [x, y];
    });
    const linePoints = pts.map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
    const areaPoints = (pts.length ? `${pts[0][0].toFixed(2)},100 ` : '') + linePoints + (pts.length ? ` ${pts[pts.length - 1][0].toFixed(2)},100` : '');
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('class', 'lay-cum-svg');
    const poly = document.createElementNS(svgNS, 'polygon');
    poly.setAttribute('points', areaPoints);
    poly.setAttribute('fill', 'rgba(26,24,19,.05)');
    poly.setAttribute('stroke', 'none');
    const line = document.createElementNS(svgNS, 'polyline');
    line.setAttribute('points', linePoints);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#1A1813');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    line.setAttribute('stroke-linejoin', 'round');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(poly);
    svg.appendChild(line);
    plot.appendChild(svg);

    card.appendChild(plot);

    // X-axis year ticks
    const xaxis = h('div', { class: 'lay-xaxis' });
    allKeys.forEach(k => {
        const p = k.split('-');
        xaxis.appendChild(h('div', { class: 'lay-xtick', text: p[1] === '01' ? p[0] : '' }));
    });
    card.appendChild(xaxis);

    section.appendChild(card);
    const frag = h('div');
    frag.appendChild(section);
    return frag;
}

// ── Ranked list ─────────────────────────────────────────────────
function buildRankedList(data) {
    const wrap = h('div', { class: 'lay-list' });

    wrap.appendChild(h('div', { class: 'lay-list-head' }, [
        h('span', { text: 'EVERY TRACKED CUT' }),
        h('span', { class: 'lay-list-head-note', text: 'MOST RECENT FIRST' }),
    ]));

    wrap.appendChild(h('div', { class: 'lay-row lay-row--cols' }, [
        h('div', { text: 'Date' }),
        h('div', { text: 'Company' }),
        h('div', { class: 'lay-col-right', text: 'Headcount' }),
        h('div', { text: 'AI Attribution' }),
        h('div', { class: 'lay-col-right', text: 'Verified' }),
    ]));

    const sorted = data.slice().sort((a, b) => b.announcement_date.localeCompare(a.announcement_date));
    sorted.forEach(r => wrap.appendChild(buildRow(r)));
    return wrap;
}

function buildRow(r) {
    const c = CAUSAL_MAP[r.causal_link] || CAUSAL_MAP.contextual;
    const v = VERIF_MAP[r.verification_status] || VERIF_MAP.single_source;
    const disclosed = Number.isFinite(r.count) && r.count > 0;
    const sectorLabel = (SECTOR_DISPLAY[r.sector] || r.sector || '').toUpperCase();

    // Date
    const dateCell = h('div', { class: 'lay-cell-date', text: dayLabel(r.announcement_date) });

    // Company
    const companyCell = h('div', { class: 'lay-cell-company' }, [
        h('div', { class: 'lay-company-name', text: r.company }),
        h('div', { class: 'lay-company-sub', text: sectorLabel + (r.ticker ? `  ·  ${r.ticker}` : '') }),
    ]);

    // Headcount
    const countCell = h('div', {
        class: 'lay-cell-count',
        style: `color:${disclosed ? '#1A1813' : '#BDB6A6'}`,
        text: disclosed ? fmt(r.count) : 'undisc.',
    });

    // AI attribution pill
    const pill = h('span', {
        class: 'lay-pill',
        style: `font-weight:${c.weight};color:${c.color};border-color:${c.border}`,
        text: c.label,
    });
    const causalCell = h('div', {}, [pill]);

    // Verified label + hover popover (popover is a child of the cell → no
    // dismissal when the cursor moves onto it to click the source link)
    const verifCell = h('div', { class: 'lay-cell-verif lay-verif' });
    verifCell.appendChild(h('span', {
        class: 'lay-verif-label',
        style: `color:${v.color}`,
        text: v.label,
    }));

    const pop = h('div', { class: 'lay-verif-pop' });
    pop.appendChild(h('div', { class: 'lay-verif-pop-head' }, [
        h('span', { class: 'lay-verif-pop-status', style: `color:${v.color}`, text: v.label }),
        h('span', { class: 'lay-verif-pop-src', text: SOURCE_LABELS[r.source_type] || r.source_type || '' }),
    ]));
    pop.appendChild(h('div', {
        class: 'lay-verif-pop-body',
        text: stripNotesPrefix(r.notes) || 'No verification note recorded for this row.',
    }));
    if (r.source_url) {
        pop.appendChild(h('a', {
            class: 'lay-verif-pop-link',
            href: r.source_url, target: '_blank', rel: 'noopener',
            text: 'VIEW PRIMARY SOURCE ↗',
        }));
    }
    verifCell.appendChild(pop);

    return h('div', { class: 'lay-row lay-row--data' }, [dateCell, companyCell, countCell, causalCell, verifCell]);
}

// ── Footer ──────────────────────────────────────────────────────
function buildFooter() {
    const foot = h('div', { class: 'lay-footnote' });
    foot.innerHTML = 'SCOPE Only layoffs with a credible AI-automation link are tracked — not the full tech-layoff universe. “AI attribution” reflects how the cut was framed:<br><span class="lay-foot-sole">SOLE</span> = company names AI as the direct cause · MIXED = AI cited among factors · CONTEXTUAL = AI in the backdrop of a broader restructuring.';
    return foot;
}

initLayoffsPage(layoffs);
