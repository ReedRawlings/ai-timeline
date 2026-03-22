/**
 * layoff-chart.js
 * Layoff Tracker — SVG stacked bar chart grouped by month + cumulative line overlay.
 */

// Ticker → display name
const COMPANY_NAMES = {
    GOOGL: 'Google',
    META: 'Meta',
    MSFT: 'Microsoft',
    AMZN: 'Amazon',
    TSLA: 'Tesla',
    EA: 'EA',
    CHGG: 'Chegg',
    U: 'Unity',
    DUOL: 'Duolingo',
    PATH: 'UiPath',
    TEAM: 'Atlassian',
    SQ: 'Block',
    CRM: 'Salesforce',
    IBM: 'IBM',
    UPS: 'UPS',
    INTC: 'Intel',
};

// Color palette: Ink & Signal editorial tones — warm + cool accent pairs
const PALETTE = [
    '#C84B31',  // terracotta (matches layoff badge)
    '#2B5BA7',  // slate blue
    '#2E7D5B',  // forest green
    '#7B3EA3',  // plum
    '#C87B31',  // amber
    '#5B7BA7',  // steel blue
    '#B8860B',  // goldenrod
    '#505050',  // charcoal
    '#A83D28',  // brick red
    '#1E6B5B',  // teal
    '#6B4F3A',  // walnut brown
    '#3A6B8A',  // ocean blue
];

// Design tokens (matching CSS variables)
const COLORS = {
    line: '#1A1A1A',       // --ink
    dot: '#1A1A1A',
    bg: '#F5F3ED',         // --bg
    rule: '#E8E5DE',       // --rule-light
    ink2: '#6B6B63',       // --ink-secondary
    ink3: '#9B9B91',       // --ink-tertiary
    font: "'DM Sans', system-ui, sans-serif",
};

function formatK(n) {
    return n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k' : String(n);
}

function makeSvgEl(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
}

function makeSvgText(content, attrs = {}) {
    const el = makeSvgEl('text', {
        'font-family': COLORS.font,
        'font-size': '10',
        fill: COLORS.ink2,
        ...attrs,
    });
    el.textContent = content;
    return el;
}

export function initLayoffChart(events) {
    const container = document.getElementById('layoff-chart-container');
    if (!container) return;

    // ── Group layoff events by month ──────────────────────────────────────
    const monthMap = new Map();
    events
        .filter(e => e.layoffs?.headcount)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(e => {
            const d = new Date(e.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!monthMap.has(key)) {
                const mon = d.toLocaleDateString('en-US', { month: 'short' });
                const yr = String(d.getFullYear()).slice(2);
                monthMap.set(key, {
                    key,
                    date: new Date(d.getFullYear(), d.getMonth(), 1),
                    label: `${mon} '${yr}`,
                    fullLabel: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    companies: [],
                    total: 0,
                });
            }
            const bucket = monthMap.get(key);
            const existing = bucket.companies.find(c => c.ticker === e.layoffs.company);
            if (existing) {
                existing.headcount += e.layoffs.headcount;
            } else {
                bucket.companies.push({
                    ticker: e.layoffs.company,
                    company: COMPANY_NAMES[e.layoffs.company] || e.layoffs.company,
                    headcount: e.layoffs.headcount,
                });
            }
            bucket.total += e.layoffs.headcount;
        });

    if (monthMap.size === 0) return;

    // Sort months chronologically and compute running cumulative
    const months = [...monthMap.values()].sort((a, b) => a.date - b.date);
    let running = 0;
    for (const m of months) {
        running += m.total;
        m.cumulative = running;
    }

    // ── Assign colors to companies in order of first appearance ──────────
    const companyColors = new Map();
    let colorIdx = 0;
    for (const m of months) {
        for (const seg of m.companies) {
            if (!companyColors.has(seg.ticker)) {
                companyColors.set(seg.ticker, PALETTE[colorIdx % PALETTE.length]);
                colorIdx++;
            }
            seg.color = companyColors.get(seg.ticker);
        }
    }

    // ── Tooltip ───────────────────────────────────────────────────────────
    const tooltip = document.createElement('div');
    tooltip.className = 'layoff-chart-tooltip';
    tooltip.style.cssText = `
        position:absolute; display:none; pointer-events:none; z-index:10;
        background:#1C1917; color:#F0EDE7; border-radius:4px;
        padding:8px 12px; font-family:${COLORS.font}; font-size:12px;
        line-height:1.6; max-width:260px; white-space:normal;
        box-shadow:0 4px 16px rgba(0,0,0,0.2);
    `;
    container.style.position = 'relative';
    container.appendChild(tooltip);

    // ── Legend (HTML, below SVG) ──────────────────────────────────────────
    const legend = document.createElement('div');
    legend.className = 'layoff-chart-legend';
    legend.style.cssText = `
        display:flex; flex-wrap:wrap; gap:4px 14px; padding:8px 0 2px;
        font-family:${COLORS.font}; font-size:11px; color:${COLORS.ink2};
    `;
    for (const [ticker, color] of companyColors) {
        const name = COMPANY_NAMES[ticker] || ticker;
        const item = document.createElement('div');
        item.style.cssText = 'display:flex; align-items:center; gap:5px;';
        item.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color};flex-shrink:0"></span><span>${name}</span>`;
        legend.appendChild(item);
    }
    container.appendChild(legend);

    let svgRoot = null;

    function render() {
        const totalWidth = container.clientWidth;
        if (totalWidth < 80) return;

        const margin = { top: 28, right: 72, bottom: 60, left: 64 };
        const height = 280;
        const innerW = totalWidth - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;
        const n = months.length;

        const step = innerW / n;
        const barW = Math.min(step * 0.72, 40);
        function xPos(i) { return step * i + step / 2; }

        // Y scales — both share same visual range
        const maxBar = Math.max(...months.map(m => m.total));
        const maxCum = months.at(-1).cumulative;
        const scale = innerH * 0.85;
        function yBar(v) { return innerH - (v / maxBar) * scale; }
        function yCum(v) { return innerH - (v / maxCum) * scale; }

        // Nice y-axis ticks
        function niceTicks(max, count = 4) {
            const raw = max / count;
            const mag = Math.pow(10, Math.floor(Math.log10(raw)));
            const nice = [1, 2, 2.5, 5, 10].map(f => f * mag).find(f => f >= raw) || mag * 10;
            const ticks = [];
            for (let v = nice; v <= max * 1.05; v += nice) ticks.push(Math.round(v));
            return ticks;
        }
        const barTicks = niceTicks(maxBar);
        const cumTicks = niceTicks(maxCum);

        // Build SVG
        if (svgRoot) svgRoot.remove();
        const svg = makeSvgEl('svg', { width: totalWidth, height, style: 'display:block;overflow:visible' });
        svgRoot = svg;
        const g = makeSvgEl('g', { transform: `translate(${margin.left},${margin.top})` });
        svg.appendChild(g);

        // ── Horizontal grid lines (bar scale) ─────────────────────────────
        barTicks.forEach(v => {
            const y = yBar(v);
            if (y < 0) return;
            g.appendChild(makeSvgEl('line', { x1: 0, x2: innerW, y1: y, y2: y, stroke: COLORS.rule, 'stroke-width': '1' }));
        });
        // Baseline
        g.appendChild(makeSvgEl('line', { x1: 0, x2: innerW, y1: innerH, y2: innerH, stroke: COLORS.rule, 'stroke-width': '1' }));

        // ── Year divider lines (January of each year) ─────────────────────
        months.forEach((m, i) => {
            if (m.date.getMonth() === 0) {
                const x = xPos(i) - step / 2;
                g.appendChild(makeSvgEl('line', {
                    x1: x, x2: x, y1: 0, y2: innerH,
                    stroke: COLORS.rule, 'stroke-width': '1',
                }));
                g.appendChild(makeSvgText(String(m.date.getFullYear()), {
                    x: x + 4, y: 8, 'text-anchor': 'start',
                    fill: COLORS.ink2, 'font-size': '9', 'font-weight': '600',
                }));
            }
        });

        // ── Left y-axis labels (headcount) ────────────────────────────────
        barTicks.forEach(v => {
            const y = yBar(v);
            if (y < 0) return;
            g.appendChild(makeSvgText(formatK(v), { x: -8, y: y + 3.5, 'text-anchor': 'end', fill: COLORS.ink2 }));
        });
        g.appendChild(makeSvgText('Jobs cut', {
            x: -innerH / 2, y: -50, 'text-anchor': 'middle',
            fill: COLORS.ink2, 'font-size': '10', transform: 'rotate(-90)',
        }));

        // ── Right y-axis labels (cumulative) ──────────────────────────────
        cumTicks.forEach(v => {
            const y = yCum(v);
            if (y < 0) return;
            g.appendChild(makeSvgText(formatK(v), { x: innerW + 8, y: y + 3.5, 'text-anchor': 'start', fill: COLORS.ink2 }));
        });
        g.appendChild(makeSvgText('Cumulative', {
            x: innerH / 2, y: -(innerW + 60), 'text-anchor': 'middle',
            fill: COLORS.ink2, 'font-size': '10', transform: 'rotate(90)',
        }));

        // ── Stacked bars per month ─────────────────────────────────────────
        months.forEach((m, i) => {
            const x = xPos(i);
            let stackBase = 0;
            const segRects = [];

            const barGroup = makeSvgEl('g');
            g.appendChild(barGroup);

            m.companies.forEach((seg, si) => {
                const isTop = si === m.companies.length - 1;
                const yTop = yBar(stackBase + seg.headcount);
                const yBottom = yBar(stackBase);
                const segH = Math.max(yBottom - yTop, 1);

                const rect = makeSvgEl('rect', {
                    x: x - barW / 2,
                    y: yTop,
                    width: barW,
                    height: isTop ? segH : segH + 1,  // 1px overlap prevents hairline gaps
                    fill: seg.color,
                    rx: isTop ? '2' : '0',
                });
                segRects.push(rect);
                barGroup.appendChild(rect);

                // Inline label if there's enough room
                if (segH > 15 && barW > 24) {
                    const lbl = makeSvgText(seg.company, {
                        x,
                        y: yTop + segH / 2 + 3.5,
                        'text-anchor': 'middle',
                        'font-size': '8',
                        fill: 'rgba(255,255,255,0.92)',
                        'font-weight': '500',
                        style: 'pointer-events:none',
                    });
                    barGroup.appendChild(lbl);
                }

                stackBase += seg.headcount;
            });

            // Transparent hit rect for hover tooltip
            const barH = innerH - yBar(m.total);
            const hitRect = makeSvgEl('rect', {
                x: x - barW / 2,
                y: yBar(m.total),
                width: barW,
                height: Math.max(barH, 2),
                fill: 'transparent',
                style: 'cursor:pointer',
            });

            hitRect.addEventListener('mouseenter', (ev) => {
                segRects.forEach(r => r.setAttribute('opacity', '0.82'));
                const rows = m.companies.map(seg => `
                    <div style="display:flex;justify-content:space-between;gap:14px;align-items:center">
                        <span style="display:flex;align-items:center;gap:5px">
                            <span style="display:inline-block;width:8px;height:8px;border-radius:1px;background:${seg.color};flex-shrink:0"></span>
                            ${seg.company}
                        </span>
                        <span style="color:#FF9999;font-weight:500">${seg.headcount.toLocaleString()}</span>
                    </div>`).join('');
                tooltip.innerHTML = `
                    <div style="font-weight:600;margin-bottom:5px">${m.fullLabel}</div>
                    ${rows}
                    <div style="border-top:1px solid rgba(255,255,255,0.12);margin-top:5px;padding-top:4px;display:flex;justify-content:space-between;gap:14px">
                        <span>Month total</span>
                        <span style="font-weight:600">${m.total.toLocaleString()}</span>
                    </div>
                    <div style="font-size:10px;opacity:0.55;margin-top:1px">Running total: ${m.cumulative.toLocaleString()}</div>
                `;
                tooltip.style.display = 'block';
                positionTooltip(ev.clientX, ev.clientY);
            });
            hitRect.addEventListener('mousemove', (ev) => positionTooltip(ev.clientX, ev.clientY));
            hitRect.addEventListener('mouseleave', () => {
                segRects.forEach(r => r.setAttribute('opacity', '1'));
                tooltip.style.display = 'none';
            });

            barGroup.appendChild(hitRect);

            // Month label (rotated, x-axis)
            const labelX = x;
            const labelY = innerH + 12;
            g.appendChild(makeSvgText(m.label, {
                x: labelX,
                y: labelY,
                'text-anchor': 'end',
                'font-size': '9',
                fill: COLORS.ink2,
                transform: `rotate(-40,${labelX},${labelY})`,
            }));
        });

        // ── Cumulative line ────────────────────────────────────────────────
        // Area fill under the line
        const areaPoints = [
            `${xPos(0)},${innerH}`,
            ...months.map((m, i) => `${xPos(i)},${yCum(m.cumulative)}`),
            `${xPos(n - 1)},${innerH}`,
        ].join(' ');
        g.appendChild(makeSvgEl('polygon', {
            points: areaPoints,
            fill: 'rgba(26,26,26,0.06)',
            stroke: 'none',
        }));

        // Line segments
        for (let i = 1; i < months.length; i++) {
            g.appendChild(makeSvgEl('line', {
                x1: xPos(i - 1), y1: yCum(months[i - 1].cumulative),
                x2: xPos(i),     y2: yCum(months[i].cumulative),
                stroke: COLORS.line, 'stroke-width': '2', 'stroke-linecap': 'round',
            }));
        }

        // Dots
        months.forEach((m, i) => {
            const circle = makeSvgEl('circle', {
                cx: xPos(i), cy: yCum(m.cumulative), r: '3',
                fill: COLORS.dot, stroke: COLORS.bg, 'stroke-width': '1.5',
                style: 'cursor:pointer',
            });
            circle.addEventListener('mouseenter', (ev) => {
                circle.setAttribute('r', '4');
                tooltip.innerHTML = `
                    <div style="font-weight:600;margin-bottom:2px">Cumulative Total</div>
                    <div style="font-size:11px;opacity:0.7">${m.fullLabel}</div>
                    <div style="margin-top:4px">${m.cumulative.toLocaleString()} total jobs</div>
                `;
                tooltip.style.display = 'block';
                positionTooltip(ev.clientX, ev.clientY);
            });
            circle.addEventListener('mousemove', (ev) => positionTooltip(ev.clientX, ev.clientY));
            circle.addEventListener('mouseleave', () => {
                circle.setAttribute('r', '3');
                tooltip.style.display = 'none';
            });
            g.appendChild(circle);
        });

        // Total annotation at last data point
        g.appendChild(makeSvgText(`${maxCum.toLocaleString()} total`, {
            x: xPos(n - 1), y: yCum(maxCum) - 8,
            'text-anchor': 'middle', 'font-size': '10',
            fill: COLORS.line, 'font-weight': '600',
        }));

        // ── Top-left legend (cumulative line) ─────────────────────────────
        const lx = 0;
        const ly = -20;
        g.appendChild(makeSvgEl('line', { x1: lx, y1: ly - 2, x2: lx + 12, y2: ly - 2, stroke: COLORS.line, 'stroke-width': '2' }));
        g.appendChild(makeSvgEl('circle', { cx: lx + 6, cy: ly - 2, r: '2.5', fill: COLORS.dot }));
        g.appendChild(makeSvgText('Cumulative total', { x: lx + 16, y: ly + 1.5, fill: COLORS.ink2 }));

        container.insertBefore(svg, tooltip);
    }

    function positionTooltip(clientX, clientY) {
        const rect = container.getBoundingClientRect();
        const ttW = tooltip.offsetWidth || 220;
        const ttH = tooltip.offsetHeight || 80;
        let left = clientX - rect.left + 12;
        let top = clientY - rect.top - ttH / 2;
        if (left + ttW > container.clientWidth - 4) left = clientX - rect.left - ttW - 12;
        if (top < 4) top = 4;
        if (top + ttH > container.clientHeight - 4) top = container.clientHeight - ttH - 4;
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    render();
    new ResizeObserver(() => render()).observe(container);
}
