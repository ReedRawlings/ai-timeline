/**
 * layoff-chart.js
 * Layoff Tracker — SVG bar + cumulative line chart.
 * Reads layoff-tagged events from events data; one bar per event.
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

// Design tokens (matching CSS variables)
const COLORS = {
    bar: '#CC0000',        // matches existing layoff badge color
    barFill: 'rgba(204,0,0,0.72)',
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

function svgEl(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
}

function svgText(content, attrs = {}) {
    const el = svgEl('text', {
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

    // Extract and sort layoff events
    const points = events
        .filter(e => e.layoffs?.headcount)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .reduce((acc, e) => {
            const running = (acc.at(-1)?.cumulative ?? 0) + e.layoffs.headcount;
            acc.push({
                date: new Date(e.date),
                headcount: e.layoffs.headcount,
                ticker: e.layoffs.company,
                company: COMPANY_NAMES[e.layoffs.company] || e.layoffs.company,
                reason: e.layoffs.reason || '',
                title: e.title,
                cumulative: running,
            });
            return acc;
        }, []);

    if (points.length === 0) return;

    // Tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'layoff-chart-tooltip';
    tooltip.style.cssText = `
        position:absolute; display:none; pointer-events:none; z-index:10;
        background:#1C1917; color:#F0EDE7; border-radius:4px;
        padding:6px 10px; font-family:${COLORS.font}; font-size:12px;
        line-height:1.5; max-width:220px; white-space:normal;
        box-shadow:0 4px 16px rgba(0,0,0,0.2);
    `;
    container.style.position = 'relative';
    container.appendChild(tooltip);

    let svgEl_root = null;

    function render() {
        const totalWidth = container.clientWidth;
        if (totalWidth < 80) return;

        const margin = { top: 28, right: 72, bottom: 64, left: 64 };
        const height = 280;
        const innerW = totalWidth - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;
        const n = points.length;

        // Evenly spaced x positions (index-based to avoid bar overlap)
        const step = innerW / n;
        const barW = Math.min(step * 0.55, 28);
        function xPos(i) { return step * i + step / 2; }

        // Y scales — both map to same visual range [0, innerH * 0.85]
        const maxBar = Math.max(...points.map(p => p.headcount));
        const maxCum = points.at(-1).cumulative;
        const scale = innerH * 0.85;
        function yBar(v) { return innerH - (v / maxBar) * scale; }
        function yCum(v) { return innerH - (v / maxCum) * scale; }

        // Nice y-axis ticks for bar scale
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

        // X-axis markers: first event in each year/quarter
        const quarterMarkers = [];
        const seenQKeys = new Set();
        points.forEach((pt, i) => {
            const year = pt.date.getFullYear();
            const quarter = Math.floor(pt.date.getMonth() / 3);
            const key = `${year}-Q${quarter + 1}`;
            if (!seenQKeys.has(key)) {
                seenQKeys.add(key);
                quarterMarkers.push({
                    x: xPos(i),
                    label: quarter === 0 ? String(year) : `Q${quarter + 1} '${String(year).slice(2)}`,
                    isYear: quarter === 0,
                });
            }
        });

        // Build SVG
        if (svgEl_root) svgEl_root.remove();
        const svg = svgEl('svg', { width: totalWidth, height, style: 'display:block;overflow:visible' });
        svgEl_root = svg;
        const g = svgEl('g', { transform: `translate(${margin.left},${margin.top})` });
        svg.appendChild(g);

        // ── Horizontal grid lines (bar scale) ─────────────────────────
        barTicks.forEach(v => {
            const y = yBar(v);
            if (y < 0) return;
            g.appendChild(svgEl('line', { x1: 0, x2: innerW, y1: y, y2: y, stroke: COLORS.rule, 'stroke-width': '1' }));
        });
        // baseline
        g.appendChild(svgEl('line', { x1: 0, x2: innerW, y1: innerH, y2: innerH, stroke: COLORS.rule, 'stroke-width': '1' }));

        // ── Vertical grid lines at quarter markers ─────────────────────
        quarterMarkers.forEach(({ x, label, isYear }) => {
            g.appendChild(svgEl('line', {
                x1: x, x2: x, y1: 0, y2: innerH,
                stroke: COLORS.rule, 'stroke-width': isYear ? '1' : '1',
                'stroke-dasharray': isYear ? 'none' : '3,3',
            }));
            g.appendChild(svgText(label, {
                x, y: innerH + 14, 'text-anchor': 'middle',
                fill: isYear ? COLORS.ink2 : COLORS.ink3,
                'font-size': isYear ? '10' : '9',
                'font-weight': isYear ? '600' : '400',
            }));
        });

        // ── Left y-axis labels (headcount) ─────────────────────────────
        barTicks.forEach(v => {
            const y = yBar(v);
            if (y < 0) return;
            g.appendChild(svgText(formatK(v), { x: -8, y: y + 3.5, 'text-anchor': 'end', fill: COLORS.ink2 }));
        });
        // Axis label
        const leftLabel = svgText('Jobs cut', {
            x: -innerH / 2, y: -50, 'text-anchor': 'middle',
            fill: COLORS.ink2, 'font-size': '10', transform: 'rotate(-90)',
        });
        g.appendChild(leftLabel);

        // ── Right y-axis labels (cumulative) ───────────────────────────
        cumTicks.forEach(v => {
            const y = yCum(v);
            if (y < 0) return;
            g.appendChild(svgText(formatK(v), { x: innerW + 8, y: y + 3.5, 'text-anchor': 'start', fill: COLORS.ink2 }));
        });
        const rightLabel = svgText('Cumulative', {
            x: innerH / 2, y: -(innerW + 60), 'text-anchor': 'middle',
            fill: COLORS.ink2, 'font-size': '10', transform: 'rotate(90)',
        });
        g.appendChild(rightLabel);

        // ── Bars ───────────────────────────────────────────────────────
        points.forEach((pt, i) => {
            const x = xPos(i);
            const barH = innerH - yBar(pt.headcount);
            const barY = yBar(pt.headcount);

            const rect = svgEl('rect', {
                x: x - barW / 2, y: barY, width: barW, height: barH,
                fill: COLORS.barFill, rx: '2',
                'data-idx': i,
                style: 'cursor:pointer',
            });
            g.appendChild(rect);

            // Hover events for custom tooltip
            rect.addEventListener('mouseenter', (ev) => {
                rect.setAttribute('fill', COLORS.bar);
                const dateStr = pt.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                tooltip.innerHTML = `
                    <div style="font-weight:600;margin-bottom:2px">${pt.company}</div>
                    <div style="font-size:11px;opacity:0.8">${dateStr}</div>
                    <div style="margin-top:4px"><span style="color:#FF9999">${pt.headcount.toLocaleString()} jobs</span></div>
                    ${pt.reason ? `<div style="font-size:10px;opacity:0.7;margin-top:2px">${pt.reason}</div>` : ''}
                    <div style="font-size:10px;opacity:0.6;margin-top:3px;border-top:1px solid rgba(255,255,255,0.1);padding-top:3px">Running total: ${pt.cumulative.toLocaleString()}</div>
                `;
                tooltip.style.display = 'block';
                positionTooltip(ev.clientX, ev.clientY);
            });
            rect.addEventListener('mousemove', (ev) => positionTooltip(ev.clientX, ev.clientY));
            rect.addEventListener('mouseleave', () => {
                rect.setAttribute('fill', COLORS.barFill);
                tooltip.style.display = 'none';
            });

            // Company label (rotated, below x-axis)
            const labelY = innerH + 20;
            const labelX = x;
            const companyLabel = svgText(pt.company, {
                x: labelX, y: labelY,
                'text-anchor': 'end', 'font-size': '9', fill: COLORS.ink2,
                transform: `rotate(-40,${labelX},${labelY})`,
                style: 'cursor:pointer',
            });
            g.appendChild(companyLabel);
        });

        // ── Cumulative line ────────────────────────────────────────────
        // Area fill under the line
        const areaPoints = [
            `${xPos(0)},${innerH}`,
            ...points.map((pt, i) => `${xPos(i)},${yCum(pt.cumulative)}`),
            `${xPos(n - 1)},${innerH}`,
        ].join(' ');
        g.appendChild(svgEl('polygon', {
            points: areaPoints,
            fill: 'rgba(26,26,26,0.06)',
            stroke: 'none',
        }));

        // Line segments
        for (let i = 1; i < points.length; i++) {
            g.appendChild(svgEl('line', {
                x1: xPos(i - 1), y1: yCum(points[i - 1].cumulative),
                x2: xPos(i), y2: yCum(points[i].cumulative),
                stroke: COLORS.line, 'stroke-width': '2', 'stroke-linecap': 'round',
            }));
        }

        // Dots
        points.forEach((pt, i) => {
            const circle = svgEl('circle', {
                cx: xPos(i), cy: yCum(pt.cumulative), r: '3',
                fill: COLORS.dot, stroke: COLORS.bg, 'stroke-width': '1.5',
                'data-idx': i, style: 'cursor:pointer',
            });
            circle.addEventListener('mouseenter', (ev) => {
                circle.setAttribute('r', '4');
                const dateStr = pt.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                tooltip.innerHTML = `
                    <div style="font-weight:600;margin-bottom:2px">Cumulative Total</div>
                    <div style="font-size:11px;opacity:0.8">${dateStr}</div>
                    <div style="margin-top:4px">${pt.cumulative.toLocaleString()} total jobs</div>
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

        // ── Total annotation ───────────────────────────────────────────
        const totalLabel = svgText(`${maxCum.toLocaleString()} total`, {
            x: xPos(n - 1), y: yCum(maxCum) - 8,
            'text-anchor': 'middle', 'font-size': '10',
            fill: COLORS.line, 'font-weight': '600',
        });
        g.appendChild(totalLabel);

        // ── Legend ─────────────────────────────────────────────────────
        const lx = 0;
        const ly = -20;

        g.appendChild(svgEl('rect', { x: lx, y: ly - 7, width: 10, height: 10, fill: COLORS.barFill, rx: '1' }));
        g.appendChild(svgText('Individual layoff event', { x: lx + 14, y: ly + 1.5, fill: COLORS.ink2 }));

        g.appendChild(svgEl('line', { x1: lx + 160, y1: ly - 2, x2: lx + 172, y2: ly - 2, stroke: COLORS.line, 'stroke-width': '2' }));
        g.appendChild(svgEl('circle', { cx: lx + 166, cy: ly - 2, r: '2.5', fill: COLORS.dot }));
        g.appendChild(svgText('Cumulative total', { x: lx + 176, y: ly + 1.5, fill: COLORS.ink2 }));

        container.insertBefore(svg, tooltip);
    }

    function positionTooltip(clientX, clientY) {
        const rect = container.getBoundingClientRect();
        const ttW = tooltip.offsetWidth || 200;
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
