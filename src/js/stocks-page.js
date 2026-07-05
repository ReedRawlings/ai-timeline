/**
 * stocks-page.js — Standalone "Market Tracker" page (stocks.html).
 *
 * Rebased-% price tape (lightweight-charts) for AI winners and the disrupted,
 * with three things layered on the tape:
 *   • an event-density "feathering" ribbon across the top (all timeline events,
 *     bucketed by the current Group-by grouping — conveys accelerating cadence),
 *   • clickable major-event markers with a hover preview + click popover, and
 *   • an adaptive, legible time axis plus an on-cursor date pill.
 *
 * Window (ALL/3Y/1Y/6M) and Group by (DAY/WEEK/MONTH) both recompute the price
 * tape AND re-bucket the feathering. Lines are rebased to 0% at the left edge of
 * the window (rebased-% only — the old %/Absolute toggle is gone).
 */
import '../css/main.css';
import { createChart, ColorType, LineStyle } from 'lightweight-charts';
import stockHistory from '../data/stock-history.json';
import events from '../data/events.json';

// ── Baskets (order + members per handoff) ───────────────────────
const BUCKETS = [
    { id: 'mag7',   label: 'Mag 7',             defaultOn: true,  stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'] },
    { id: 'memory', label: 'Memory / Semis',    defaultOn: false, stocks: ['MU', 'AVGO', 'TSM', 'AMD', 'AMAT', 'LRCX'] },
    { id: 'infra',  label: 'AI Infrastructure', defaultOn: false, stocks: ['VRT', 'ANET', 'ETN', 'EQIX', 'CLS', 'PWR'] },
    { id: 'saas',   label: 'SaaS Disrupted',    defaultOn: false, stocks: ['CHGG', 'CRM', 'PATH', 'ADBE', 'DUOL', 'HUBS'] },
    { id: 'gaming', label: 'Gaming',            defaultOn: false, stocks: ['RBLX', 'EA', 'TTWO', 'NTDOY', 'U', 'UBSFY'] },
];

// Per-ticker brand-ish line colors (kept from the existing stock chart)
const STOCK_COLORS = {
    AAPL: '#A2AAAD', MSFT: '#00A4EF', GOOGL: '#4285F4', AMZN: '#FF9900',
    NVDA: '#76B900', META: '#0668E1', TSLA: '#CC0000',
    MU: '#005BBB', AVGO: '#CC092F', TSM: '#0033A0', AMD: '#ED1C24',
    AMAT: '#00539B', LRCX: '#005587',
    VRT: '#006747', ANET: '#D71920', ETN: '#003DA5', EQIX: '#ED1C24',
    CLS: '#0058A3', PWR: '#00447C',
    CHGG: '#F58220', CRM: '#00A1E0', PATH: '#FA4616', ADBE: '#FF0000',
    DUOL: '#58CC02', HUBS: '#FF7A59',
    RBLX: '#E1343F', EA: '#1A4480', TTWO: '#FF6600', NTDOY: '#E60012',
    U: '#5A5750', UBSFY: '#1F4788',
};
const BUCKET_COLORS = { mag7: '#C2410C', memory: '#005BBB', infra: '#1F7A4D', saas: '#E07A1F', gaming: '#C43039' };
const ALL_SYMBOLS = [...new Set(BUCKETS.flatMap(b => b.stocks))];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const colorOf = s => STOCK_COLORS[s] || '#888';
const CARD_PAD = 6; // chart card padding — offsets chart-relative x into card space

// ── DOM helper ──────────────────────────────────────────────────
function h(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
        if (v == null) continue;
        if (k === 'style') el.style.cssText = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else el.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
        if (c == null) continue;
        el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
}

// ── Grouping / aggregation helpers ──────────────────────────────
function weekKey(dateStr) {
    const dt = new Date(dateStr + 'T00:00:00');
    const day = (dt.getDay() + 6) % 7; // Mon = 0
    dt.setDate(dt.getDate() - day);
    return dt.toISOString().slice(0, 10);
}
function groupKey(grouping, dateStr) {
    if (grouping === '1M') return dateStr.slice(0, 7) + '-01';
    if (grouping === '1W') return weekKey(dateStr);
    return dateStr;
}
function aggregate(raw, grouping) {
    if (grouping === '1D') return raw;
    const m = new Map();
    raw.forEach(d => m.set(groupKey(grouping, d.time), d.value)); // last close in bucket wins
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([time, value]) => ({ time, value }));
}

function fmtDate(ds) {
    const [y, m, d] = ds.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// lightweight-charts may hand a time as a 'YYYY-MM-DD' string, a BusinessDay
// object, or a UTC timestamp (seconds) — normalize any of them.
function timeToDate(time) {
    if (time == null) return null;
    if (typeof time === 'number') return new Date(time * 1000);
    if (typeof time === 'string') { const [y, m, d] = time.split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); }
    if (typeof time === 'object' && time.year) return new Date(time.year, (time.month || 1) - 1, time.day || 1);
    return null;
}
function timeToStr(time) {
    const d = timeToDate(time);
    if (!d) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Page ────────────────────────────────────────────────────────
export function initStocksPage() {
    const mount = document.getElementById('stocks-page');
    if (!mount) return;

    // Timeline events → { d, t, desc, tier }
    const EVENTS = events.map(e => ({
        d: String(e.date).slice(0, 10),
        t: e.title,
        desc: e.description || '',
        tier: e.tier || 'notable',
    })).sort((a, b) => a.d.localeCompare(b.d));

    // Global last date across all symbols
    let lastDate = '2022-01-01';
    ALL_SYMBOLS.forEach(s => {
        const arr = stockHistory[s];
        if (arr && arr.length) { const t = arr[arr.length - 1].time; if (t > lastDate) lastDate = t; }
    });

    const state = {
        range: 'ALL',
        grouping: '1W',
        active: new Set(BUCKETS.filter(b => b.defaultOn).flatMap(b => b.stocks)),
    };

    // ─────────────────────────────────────────────────────────────
    // Header
    // ─────────────────────────────────────────────────────────────
    mount.appendChild(h('div', { class: 'stk-eyebrow', text: 'Market Tracker' }));
    mount.appendChild(h('div', { class: 'stk-title-row' }, [
        h('h1', { class: 'stk-title', text: 'Priced by the market' }),
        h('div', { class: 'stk-stat-block' }, [
            h('div', { class: 'stk-stat-total', html: `${ALL_SYMBOLS.length}<span class="stk-stat-total-unit"> TICKERS</span>` }),
            h('div', { class: 'stk-stat-range', text: 'REBASED % · 2022—2026' }),
        ]),
    ]));
    const lede = h('p', { class: 'stk-lede' });
    lede.innerHTML = 'Every AI milestone lands on a balance sheet somewhere. Track the winners against the disrupted — the <strong>Magnificent Seven</strong>, the memory and semiconductor supply chain, the infrastructure build-out, and the software incumbents the market has bet against. Each line is rebased to 0% at the start of the window; circles on the tape mark major events, and the feathering along the top tracks the quickening pulse of AI news itself.';
    mount.appendChild(lede);

    // ─────────────────────────────────────────────────────────────
    // Controls: Window + Group by + date readout
    // ─────────────────────────────────────────────────────────────
    const dateReadout = h('span', { class: 'stk-readout' });
    const windowSeg = h('div', { class: 'stk-seg' });
    const groupSeg = h('div', { class: 'stk-seg' });

    ['ALL', '3Y', '1Y', '6M'].forEach(r => {
        windowSeg.appendChild(h('button', {
            class: 'stk-seg-btn' + (state.range === r ? ' active' : ''),
            'data-range': r, text: r,
            onClick: () => { state.range = r; syncSeg(windowSeg, 'data-range', r); render(); },
        }));
    });
    [['1D', 'DAY'], ['1W', 'WEEK'], ['1M', 'MONTH']].forEach(([id, label]) => {
        groupSeg.appendChild(h('button', {
            class: 'stk-seg-btn' + (state.grouping === id ? ' active' : ''),
            'data-group': id, text: label,
            onClick: () => { state.grouping = id; syncSeg(groupSeg, 'data-group', id); render(); },
        }));
    });

    mount.appendChild(h('div', { class: 'stk-controls' }, [
        h('span', { class: 'stk-controls-label', text: 'Window' }),
        windowSeg,
        h('span', { class: 'stk-controls-divider' }),
        h('span', { class: 'stk-controls-label', text: 'Group by' }),
        groupSeg,
        h('span', { style: 'flex:1' }),
        dateReadout,
    ]));

    function syncSeg(seg, attr, val) {
        seg.querySelectorAll('.stk-seg-btn').forEach(b => b.classList.toggle('active', b.getAttribute(attr) === val));
    }

    // ─────────────────────────────────────────────────────────────
    // Basket + ticker chips
    // ─────────────────────────────────────────────────────────────
    const chipsWrap = h('div', { class: 'stk-chips' });
    const tickerChipEls = {};
    const bucketChipEls = {};
    BUCKETS.forEach((b, i) => {
        const group = h('div', { class: 'stk-chip-group' });
        if (i > 0) group.appendChild(h('span', { class: 'stk-chip-sep' }));
        const bcol = BUCKET_COLORS[b.id];
        const bChip = h('button', {
            class: 'stk-bucket-chip', style: `--bc:${bcol}`,
            text: b.label,
            onClick: () => toggleBucket(b),
        });
        bucketChipEls[b.id] = bChip;
        group.appendChild(bChip);
        b.stocks.forEach(s => {
            const chip = h('button', {
                class: 'stk-ticker-chip', style: `--tc:${colorOf(s)}`,
                onClick: () => toggleTicker(s),
            }, [h('span', { class: 'stk-ticker-dot' }), document.createTextNode(s)]);
            tickerChipEls[s] = chip;
            group.appendChild(chip);
        });
        chipsWrap.appendChild(group);
    });
    mount.appendChild(chipsWrap);

    function refreshChips() {
        BUCKETS.forEach(b => {
            const allOn = b.stocks.every(s => state.active.has(s));
            bucketChipEls[b.id].classList.toggle('active', allOn);
            b.stocks.forEach(s => tickerChipEls[s].classList.toggle('active', state.active.has(s)));
        });
    }
    function toggleBucket(b) {
        const allOn = b.stocks.every(s => state.active.has(s));
        b.stocks.forEach(s => allOn ? state.active.delete(s) : state.active.add(s));
        render();
    }
    function toggleTicker(s) {
        state.active.has(s) ? state.active.delete(s) : state.active.add(s);
        render();
    }

    // ─────────────────────────────────────────────────────────────
    // Live legend
    // ─────────────────────────────────────────────────────────────
    const legendWrap = h('div', { class: 'stk-legend' });
    mount.appendChild(legendWrap);

    // ─────────────────────────────────────────────────────────────
    // Chart card
    // ─────────────────────────────────────────────────────────────
    const chartHost = h('div', { class: 'stk-chart-host' });
    const ribbon = h('canvas', { class: 'stk-ribbon' });
    const datePill = h('div', { class: 'stk-date-pill' });
    const evtTip = h('div', { class: 'stk-evt-tip' });
    const popover = h('div', { class: 'stk-evt-pop' });
    const card = h('div', { class: 'stk-chart-card' }, [chartHost, ribbon, datePill, evtTip, popover]);
    mount.appendChild(card);

    // Chart legend + footer
    const clg = h('div', { class: 'stk-chart-legend' });
    clg.innerHTML =
        '<span class="stk-clg-item"><span class="stk-clg-dot"></span>MAJOR AI EVENT — CLICK TO READ</span>' +
        '<span class="stk-clg-item"><span class="stk-clg-grad"></span>EVENT DENSITY — FEATHERING ALONG THE TOP</span>' +
        '<span class="stk-clg-hint">Hover the tape for the exact date &amp; values</span>';
    mount.appendChild(clg);
    const foot = h('div', { class: 'stk-footnote' });
    foot.innerHTML = 'READING&nbsp;&nbsp;Lines are rebased to 0% at the left edge of the window — a steeper line means a faster move, not a higher price. <span class="stk-foot-em">GROUP BY</span> regroups the price tape <em>and</em> re-buckets the feathering along the top — to daily, weekly or monthly. The window selector governs both.';
    mount.appendChild(foot);

    // ── Chart init ───────────────────────────────────────────────
    const chart = createChart(chartHost, {
        width: chartHost.clientWidth,
        height: 384,
        layout: {
            background: { type: ColorType.Solid, color: '#FBFAF6' },
            textColor: '#6F6A5E',
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            fontSize: 11,
        },
        grid: { vertLines: { color: '#EEE9DD' }, horzLines: { color: '#EEE9DD' } },
        crosshair: {
            vertLine: { color: '#CFC8B8', style: LineStyle.Dashed, labelVisible: false },
            horzLine: { color: '#CFC8B8', style: LineStyle.Dashed, labelVisible: true },
        },
        rightPriceScale: { borderColor: '#D9D3C5', scaleMargins: { top: 0.14, bottom: 0.08 } },
        timeScale: {
            borderColor: '#D9D3C5',
            timeVisible: false,
            fixLeftEdge: true,
            fixRightEdge: true,
            tickMarkFormatter: (time, tickMarkType) => {
                const dt = timeToDate(time);
                if (!dt) return '';
                if (tickMarkType === 0) return String(dt.getFullYear());       // Year
                if (tickMarkType === 1) return MONTHS_SHORT[dt.getMonth()];    // Month
                return String(dt.getDate());                                   // Day
            },
        },
        localization: { priceFormatter: v => (v > 0 ? '+' : '') + Math.round(v) + '%' },
        handleScroll: false,
        handleScale: false,
    });

    const seriesMap = {};
    const percentFormat = { type: 'custom', minMove: 0.01, formatter: v => (v > 0 ? '+' : '') + v.toFixed(1) + '%' };

    // windowed + grouped + rebased series data for a symbol
    let windowStart = '2022-01-01';
    let pctBySym = {};       // symbol → [{time,value}]
    let bucketKeys = [];     // grouping keys across the window
    let densityByKey = {};   // key → { total, major }
    let maxDensity = 1;
    let markerBuckets = {};  // grouping key → [major events] (one marker per bucket)

    function computeWindowStart() {
        const days = { ALL: Infinity, '3Y': 1095, '1Y': 365, '6M': 182 }[state.range];
        if (!isFinite(days)) return '2000-01-01';
        const cut = new Date(lastDate + 'T00:00:00');
        cut.setDate(cut.getDate() - days);
        return cut.toISOString().slice(0, 10);
    }

    function recompute() {
        windowStart = computeWindowStart();
        // Series
        pctBySym = {};
        state.active.forEach(s => {
            const raw = (stockHistory[s] || []).filter(d => d.time >= windowStart);
            const agg = aggregate(raw, state.grouping);
            let base = null;
            for (const d of agg) { if (d.value != null) { base = d.value; break; } }
            pctBySym[s] = (base == null || base === 0) ? [] :
                agg.map(d => ({ time: d.time, value: (d.value / base - 1) * 100 }));
        });

        // Density buckets across the window (all events, current grouping)
        const winEvents = EVENTS.filter(e => e.d >= windowStart && e.d <= lastDate);
        bucketKeys = [];
        densityByKey = {};
        const seen = new Set();
        // build contiguous bucket keys from windowStart..lastDate
        let cur = groupKey(state.grouping, windowStart < '2022-01-01' ? '2022-01-01' : windowStart);
        const endKey = groupKey(state.grouping, lastDate);
        let guard = 0;
        while (cur <= endKey && guard < 5000) {
            if (!seen.has(cur)) { seen.add(cur); bucketKeys.push(cur); densityByKey[cur] = { total: 0, major: 0 }; }
            cur = nextBucket(cur);
            guard++;
        }
        winEvents.forEach(e => {
            const k = groupKey(state.grouping, e.d);
            if (!densityByKey[k]) { densityByKey[k] = { total: 0, major: 0 }; }
            densityByKey[k].total++;
            if (e.tier === 'major') densityByKey[k].major++;
        });
        maxDensity = Math.max(1, ...bucketKeys.map(k => densityByKey[k].total));

        // Major markers in window — one marker per grouping bucket (so they
        // align to a data point and don't stack into columns in coarse views)
        markerBuckets = {};
        winEvents.filter(e => e.tier === 'major').forEach(e => {
            const k = groupKey(state.grouping, e.d);
            (markerBuckets[k] = markerBuckets[k] || []).push(e);
        });
        Object.values(markerBuckets).forEach(list => list.sort((a, b) => a.d.localeCompare(b.d)));
    }

    function nextBucket(key) {
        const dt = new Date(key + 'T00:00:00');
        if (state.grouping === '1D') dt.setDate(dt.getDate() + 1);
        else if (state.grouping === '1W') dt.setDate(dt.getDate() + 7);
        else dt.setMonth(dt.getMonth() + 1);
        return dt.toISOString().slice(0, 10);
    }

    // ── Render ───────────────────────────────────────────────────
    function render() {
        recompute();

        // Sync series set
        for (const s of Object.keys(seriesMap)) {
            if (!state.active.has(s)) { chart.removeSeries(seriesMap[s]); delete seriesMap[s]; }
        }
        state.active.forEach(s => {
            if (!seriesMap[s]) {
                seriesMap[s] = chart.addLineSeries({
                    color: colorOf(s), lineWidth: 2, priceFormat: percentFormat,
                    priceLineVisible: false, lastValueVisible: true, title: s,
                    crosshairMarkerVisible: true, crosshairMarkerRadius: 3.5,
                });
            }
            seriesMap[s].setData(pctBySym[s] || []);
        });

        chart.timeScale().fitContent();
        updateMarkers();
        refreshChips();
        renderLegend(null);
        renderReadout(null);
        requestAnimationFrame(drawRibbon);
    }

    // ── Markers on the first active series ───────────────────────
    let markerSeriesSym = null;
    function updateMarkers() {
        // clear any previous marker series
        if (markerSeriesSym && seriesMap[markerSeriesSym]) {
            try { seriesMap[markerSeriesSym].setMarkers([]); } catch {}
        }
        const first = [...state.active].find(s => seriesMap[s]);
        markerSeriesSym = first || null;
        if (!first) return;
        const markers = Object.keys(markerBuckets).sort().map(k => ({
            time: k, position: 'aboveBar', color: '#C2410C', shape: 'circle', size: 1,
        }));
        try { seriesMap[first].setMarkers(markers); } catch {}
    }

    // ── Feathering ribbon (canvas overlay aligned to time scale) ─
    function drawRibbon() {
        const dpr = window.devicePixelRatio || 1;
        const w = chartHost.clientWidth, hh = 384;
        ribbon.width = w * dpr; ribbon.height = hh * dpr;
        ribbon.style.width = w + 'px'; ribbon.style.height = hh + 'px';
        const ctx = ribbon.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, hh);
        if (!bucketKeys.length) return;
        const ts = chart.timeScale();
        const bandTop = 8, bandH = 10;
        for (let i = 0; i < bucketKeys.length; i++) {
            const k = bucketKeys[i];
            const c = densityByKey[k];
            if (!c || c.total === 0) continue;
            let x0 = ts.timeToCoordinate(k);
            if (x0 == null) continue;
            let x1 = i + 1 < bucketKeys.length ? ts.timeToCoordinate(bucketKeys[i + 1]) : null;
            if (x1 == null) x1 = x0 + Math.max(1.2, w / bucketKeys.length);
            const op = 0.12 + 0.88 * Math.min(1, c.total / maxDensity);
            ctx.fillStyle = `rgba(194,65,12,${op.toFixed(3)})`;
            ctx.fillRect(x0, bandTop, Math.max(0.8, x1 - x0), bandH);
        }
    }

    // ── Live legend ──────────────────────────────────────────────
    function renderLegend(hoverTime) {
        legendWrap.innerHTML = '';
        const syms = [...state.active];
        if (!syms.length) {
            legendWrap.appendChild(h('span', { class: 'stk-legend-empty', text: 'Select a basket or ticker to plot' }));
            return;
        }
        const items = syms.map(s => {
            const arr = pctBySym[s] || [];
            let v = null;
            if (hoverTime) { const pt = arr.find(d => d.time === hoverTime); if (pt) v = pt.value; }
            if (v == null && arr.length) v = arr[arr.length - 1].value;
            return { s, v };
        }).sort((a, b) => (b.v ?? -1e9) - (a.v ?? -1e9));
        items.forEach(({ s, v }) => {
            const val = v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1) + '%';
            legendWrap.appendChild(h('span', { class: 'stk-legend-item' }, [
                h('span', { class: 'stk-legend-swatch', style: `background:${colorOf(s)}` }),
                h('span', { class: 'stk-legend-sym', text: s }),
                h('span', { class: 'stk-legend-val', style: `color:${v == null ? '#B6AF9E' : (v >= 0 ? '#1F7A4D' : '#B4453B')}`, text: val }),
            ]));
        });
    }

    function renderReadout(hoverTime) {
        if (hoverTime) {
            dateReadout.classList.add('active');
            dateReadout.textContent = pillLabel(hoverTime).toUpperCase();
        } else {
            dateReadout.classList.remove('active');
            const arr = pctBySym[[...state.active][0]] || [];
            const a = arr[0]?.time, b = arr[arr.length - 1]?.time;
            dateReadout.textContent = a && b ? `${fmtDate(a).toUpperCase()} — ${fmtDate(b).toUpperCase()}` : '';
        }
    }

    function pillLabel(ds) {
        if (state.grouping === '1M') { const [y, m] = ds.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }
        if (state.grouping === '1W') return 'Wk of ' + fmtDate(ds);
        return fmtDate(ds);
    }

    // ── Crosshair: legend values + date pill + event tooltip ─────
    chart.subscribeCrosshairMove(param => {
        if (!param.time || !param.point) {
            renderLegend(null); renderReadout(null);
            datePill.style.display = 'none';
            if (!pinnedDate) evtTip.style.display = 'none';
            return;
        }
        const t = timeToStr(param.time);
        renderLegend(t);
        renderReadout(t);

        // date pill pinned at cursor x on the axis
        datePill.textContent = pillLabel(t);
        datePill.style.display = 'block';
        const px = Math.max(30, Math.min(chartHost.clientWidth - 30, param.point.x));
        datePill.style.left = (px + CARD_PAD) + 'px';

        // event tooltip if this bucket has major events
        if (!pinnedDate) {
            const evs = markerBuckets[t];
            if (evs) {
                evtTip.innerHTML =
                    `<div class="stk-evt-tip-date">${escapeHtml(markerLabel(t))}</div>` +
                    `<div class="stk-evt-tip-title">${evs.map(e => escapeHtml(e.t)).join(' · ')}</div>` +
                    `<div class="stk-evt-tip-hint">CLICK FOR DETAIL</div>`;
                evtTip.style.display = 'block';
                positionFloat(evtTip, param.point.x);
            } else {
                evtTip.style.display = 'none';
            }
        }
    });

    // ── Marker click → popover (snap to nearest major within ~5d) ─
    let pinnedDate = null;
    chart.subscribeClick(param => {
        if (!param.time || !param.point) return;
        const t = timeToStr(param.time);
        if (!t) return;
        const ms = new Date(t).getTime();
        const tol = (state.grouping === '1M' ? 20 : 6) * 86400000;
        let nearest = null, min = Infinity;
        Object.keys(markerBuckets).forEach(d => { const diff = Math.abs(new Date(d).getTime() - ms); if (diff < min) { min = diff; nearest = d; } });
        if (nearest && min <= tol) showPopover(nearest, param.point.x);
        else hidePopover();
    });

    // A marker's label depends on grouping: exact date for DAY, the bucket
    // label ("Wk of …" / "March 2025") for WEEK/MONTH.
    function markerLabel(k) { return state.grouping === '1D' ? fmtDate(k) : pillLabel(k); }

    function showPopover(k, x) {
        pinnedDate = k;
        evtTip.style.display = 'none';
        const evs = markerBuckets[k] || [];
        popover.innerHTML =
            `<div class="stk-evt-pop-head"><span class="stk-evt-pop-date">${escapeHtml(markerLabel(k))} · Major</span>` +
            `<span class="stk-evt-pop-close">×</span></div>` +
            evs.map(e => `<div class="stk-evt-pop-item"><div class="stk-evt-pop-title">${escapeHtml(e.t)}</div>` +
                `<div class="stk-evt-pop-desc">${escapeHtml(e.desc)}</div></div>`).join('') +
            `<a class="stk-evt-pop-link" href="/">VIEW ON TIMELINE →</a>`;
        popover.style.display = 'block';
        positionFloat(popover, x);
        popover.querySelector('.stk-evt-pop-close').addEventListener('click', hidePopover);
    }
    function hidePopover() { popover.style.display = 'none'; pinnedDate = null; }

    document.addEventListener('click', e => {
        if (!pinnedDate) return;
        if (popover.contains(e.target) || chartHost.contains(e.target)) return;
        hidePopover();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePopover(); });

    function positionFloat(el, x) {
        const w = el.offsetWidth || 230;
        const cw = chartHost.clientWidth;
        let left = x - w / 2;
        left = Math.max(4, Math.min(cw - w - 4, left));
        el.style.left = (left + CARD_PAD) + 'px';
    }
    function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

    // ── Resize ───────────────────────────────────────────────────
    new ResizeObserver(() => {
        chart.applyOptions({ width: chartHost.clientWidth });
        drawRibbon();
    }).observe(chartHost);
    chart.timeScale().subscribeVisibleTimeRangeChange(() => drawRibbon());

    render();
    loadRecent();

    // ── Live recent-data merge (keeps the tape current in production) ──
    // Historical closes are pre-baked at build time; the last ~30 days come
    // from /api/stocks, cached at the edge (24h) and in localStorage (24h).
    async function loadRecent() {
        const cached = readCache();
        let live = cached;
        if (!live) {
            try {
                const ago = new Date(); ago.setDate(ago.getDate() - 35);
                const from = ago.toISOString().slice(0, 10);
                const to = new Date().toISOString().slice(0, 10);
                const resp = await fetch(`/api/stocks?symbols=${ALL_SYMBOLS.join(',')}&from=${from}&to=${to}`);
                if (!resp.ok) return;
                live = await resp.json();
                writeCache(live);
            } catch { return; }
        }
        let changed = false;
        ALL_SYMBOLS.forEach(s => {
            const arr = live[s];
            if (!arr || !arr.length) return;
            const map = new Map((stockHistory[s] || []).map(d => [d.time, d.value]));
            arr.forEach(d => map.set(d.time, d.value));
            stockHistory[s] = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([time, value]) => ({ time, value }));
            const t = arr[arr.length - 1].time;
            if (t > lastDate) lastDate = t;
            changed = true;
        });
        if (changed) render();
    }
    function readCache() {
        try {
            const raw = localStorage.getItem('stock_data_cache_v2');
            if (!raw) return null;
            const { ts, data } = JSON.parse(raw);
            return Date.now() - ts > 86400000 ? null : data;
        } catch { return null; }
    }
    function writeCache(data) {
        try { localStorage.setItem('stock_data_cache_v2', JSON.stringify({ ts: Date.now(), data })); } catch {}
    }
}

initStocksPage();
