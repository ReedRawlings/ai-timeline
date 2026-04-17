/**
 * stock-chart.js
 * TradingView Lightweight Charts integration with AI event markers.
 * Stocks organized into toggleable buckets (Mag 7, Gaming, SaaS Disrupted, etc.)
 */
import { createChart, ColorType, LineStyle } from 'lightweight-charts';
import stockHistory from '../data/stock-history.json';

// ── Stock Buckets ──────────────────────────────────────────────
const BUCKETS = [
    {
        id: 'mag7',
        label: 'Mag 7',
        defaultOn: true,
        stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'],
    },
    {
        id: 'gaming',
        label: 'Gaming',
        defaultOn: false,
        stocks: ['RBLX', 'EA', 'TTWO', 'NTDOY', 'U', 'UBSFY'],
    },
    {
        id: 'saas',
        label: 'SaaS Disrupted',
        defaultOn: false,
        stocks: ['CHGG', 'CRM', 'PATH', 'ADBE', 'DUOL', 'HUBS'],
    },
    {
        id: 'memory',
        label: 'Memory / Semis',
        defaultOn: false,
        stocks: ['MU', 'AVGO', 'TSM', 'AMD', 'AMAT', 'LRCX'],
    },
    {
        id: 'infra',
        label: 'AI Infrastructure',
        defaultOn: false,
        stocks: ['VRT', 'ANET', 'ETN', 'EQIX', 'CLS', 'PWR'],
    },
];

// ── Colors ─────────────────────────────────────────────────────
const STOCK_COLORS = {
    // Mag 7
    AAPL: '#A2AAAD', MSFT: '#00A4EF', GOOGL: '#4285F4', AMZN: '#FF9900',
    NVDA: '#76B900', META: '#0668E1', TSLA: '#CC0000',
    // Gaming
    RBLX: '#E1343F', EA: '#1A4480', TTWO: '#FF6600', NTDOY: '#E60012',
    U: '#222222', UBSFY: '#1F4788',
    // SaaS Disrupted
    CHGG: '#F58220', CRM: '#00A1E0', PATH: '#FA4616', ADBE: '#FF0000',
    DUOL: '#58CC02', HUBS: '#FF7A59',
    // Memory / Semis
    MU: '#005BBB', AVGO: '#CC092F', TSM: '#0033A0', AMD: '#ED1C24',
    AMAT: '#00539B', LRCX: '#005587',
    // AI Infrastructure
    VRT: '#006747', ANET: '#D71920', ETN: '#003DA5', EQIX: '#ED1C24',
    CLS: '#0058A3', PWR: '#00447C',
};

const BUCKET_COLORS = {
    mag7: '#C84B31',
    gaming: '#E60012',
    saas: '#FA4616',
    memory: '#005BBB',
    infra: '#006747',
};

const ALL_SYMBOLS = [...new Set(BUCKETS.flatMap(b => b.stocks))];

// ── Normalization ─────────────────────────────────────────────
function normalizeData(data) {
    if (!data || data.length === 0) return [];
    const baseline = data[0].value;
    if (baseline === 0) return data;
    return data.map(d => ({
        time: d.time,
        value: Math.round(((d.value - baseline) / baseline) * 10000) / 100,
    }));
}

// ── Resolution aggregation ───────────────────────────────────
function aggregateWeekly(data) {
    if (!data || data.length === 0) return [];
    const buckets = new Map();
    data.forEach(d => {
        // ISO week start (Monday)
        const dt = new Date(d.time + 'T00:00:00');
        const day = (dt.getDay() + 6) % 7; // Mon=0
        const monday = new Date(dt);
        monday.setDate(dt.getDate() - day);
        const key = monday.toISOString().slice(0, 10);
        buckets.set(key, d.value); // last value in the week wins (close)
    });
    return [...buckets.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([time, value]) => ({ time, value }));
}

function aggregateMonthly(data) {
    if (!data || data.length === 0) return [];
    const buckets = new Map();
    data.forEach(d => {
        const key = d.time.slice(0, 7) + '-01'; // YYYY-MM-01
        buckets.set(key, d.value); // last value in the month wins (close)
    });
    return [...buckets.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([time, value]) => ({ time, value }));
}

// ── Chart Init ─────────────────────────────────────────────────
export function initStockChart(events) {
    const container = document.getElementById('stock-chart-container');
    const chipsContainer = document.getElementById('stock-chips');
    const toggleBtn = document.getElementById('chart-toggle');
    const panel = document.getElementById('stock-chart-panel');

    if (!container || !chipsContainer || !toggleBtn || !panel) return;

    // Collapse / expand — default collapsed
    let isExpanded = localStorage.getItem('aiTimelineChartOpen') === 'true';
    const toggleIcon = toggleBtn.querySelector('.chart-toggle-icon');

    function setExpanded(expanded) {
        isExpanded = expanded;
        panel.style.display = expanded ? 'block' : 'none';
        toggleIcon.textContent = expanded ? '\u25BE' : '\u25B8';
        localStorage.setItem('aiTimelineChartOpen', expanded);
        if (expanded && chart) chart.timeScale().fitContent();
    }

    toggleBtn.addEventListener('click', () => setExpanded(!isExpanded));

    // State
    let isNormalized = localStorage.getItem('aiTimelineChartNormalized') !== 'false';
    let resolution = localStorage.getItem('aiTimelineChartRes') || '1D';
    const activeStocks = new Set();
    const seriesMap = {};
    const stockData = {};
    const stockChipEls = {}; // symbol → chip element

    // Chart
    const chart = createChart(container, {
        width: container.clientWidth,
        height: 300,
        layout: {
            background: { type: ColorType.Solid, color: '#F5F3ED' },
            textColor: '#6B6B63',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 11,
        },
        grid: {
            vertLines: { color: '#E8E5DE' },
            horzLines: { color: '#E8E5DE' },
        },
        crosshair: {
            vertLine: { color: '#D4D0C8', style: LineStyle.Dashed },
            horzLine: { color: '#D4D0C8', style: LineStyle.Dashed },
        },
        timeScale: { borderColor: '#D4D0C8', timeVisible: false },
        rightPriceScale: {
            borderColor: '#D4D0C8',
            scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        handleScroll: { mouseWheel: true, pressedMouseMove: true },
        handleScale: { axisPressedMouseMove: true, mouseWheel: true },
    });

    new ResizeObserver(() => {
        chart.applyOptions({ width: container.clientWidth });
    }).observe(container);

    // ── Build UI: bucket buttons + individual stock chips ──────
    BUCKETS.forEach((bucket, idx) => {
        // Bucket toggle button
        const bucketBtn = document.createElement('button');
        bucketBtn.className = 'bucket-chip' + (bucket.defaultOn ? ' active' : '');
        bucketBtn.style.setProperty('--chip-color', BUCKET_COLORS[bucket.id]);
        bucketBtn.textContent = bucket.label;
        bucketBtn.addEventListener('click', () => toggleBucket(bucket, bucketBtn));
        chipsContainer.appendChild(bucketBtn);

        // Individual stock chips for this bucket
        bucket.stocks.forEach(symbol => {
            const chip = document.createElement('button');
            const on = bucket.defaultOn;
            chip.className = 'stock-chip' + (on ? ' active' : '');
            chip.setAttribute('data-symbol', symbol);
            chip.style.setProperty('--chip-color', STOCK_COLORS[symbol] || '#888');
            chip.textContent = symbol;
            chip.addEventListener('click', () => toggleStock(symbol, chip));
            chipsContainer.appendChild(chip);
            stockChipEls[symbol] = chip;
            if (on) activeStocks.add(symbol);
        });

        // Separator between buckets (except after last)
        if (idx < BUCKETS.length - 1) {
            const sep = document.createElement('span');
            sep.className = 'stock-chip-separator';
            sep.textContent = '|';
            chipsContainer.appendChild(sep);
        }
    });

    // ── Toggle helpers ─────────────────────────────────────────
    function toggleBucket(bucket, bucketBtn) {
        const allActive = bucket.stocks.every(s => activeStocks.has(s));
        if (allActive) {
            // Turn off all stocks in this bucket
            bucket.stocks.forEach(s => {
                activeStocks.delete(s);
                if (seriesMap[s]) { chart.removeSeries(seriesMap[s]); delete seriesMap[s]; }
                if (stockChipEls[s]) stockChipEls[s].classList.remove('active');
            });
            bucketBtn.classList.remove('active');
        } else {
            // Turn on all stocks in this bucket
            bucket.stocks.forEach(s => {
                if (!activeStocks.has(s)) {
                    activeStocks.add(s);
                    addSeriesToChart(s);
                    if (stockChipEls[s]) stockChipEls[s].classList.add('active');
                }
            });
            bucketBtn.classList.add('active');
        }
        chart.timeScale().fitContent();
        updateMarkers();
    }

    function toggleStock(symbol, chip) {
        if (activeStocks.has(symbol)) {
            activeStocks.delete(symbol);
            chip.classList.remove('active');
            if (seriesMap[symbol]) { chart.removeSeries(seriesMap[symbol]); delete seriesMap[symbol]; }
        } else {
            activeStocks.add(symbol);
            chip.classList.add('active');
            addSeriesToChart(symbol);
        }
        // Sync bucket button state
        BUCKETS.forEach(bucket => {
            if (bucket.stocks.includes(symbol)) {
                const btn = chipsContainer.querySelector(`.bucket-chip:nth-child(${getBucketBtnIndex(bucket)})`);
                // Simpler: find by text
                chipsContainer.querySelectorAll('.bucket-chip').forEach(b => {
                    if (b.textContent === bucket.label) {
                        b.classList.toggle('active', bucket.stocks.every(s => activeStocks.has(s)));
                    }
                });
            }
        });
        updateMarkers();
    }

    function getBucketBtnIndex() { return 0; } // unused, kept for compat

    function getSeriesData(symbol) {
        const raw = stockData[symbol];
        if (!raw || raw.length === 0) return [];
        let data = raw;
        if (resolution === '1W') data = aggregateWeekly(data);
        else if (resolution === '1M') data = aggregateMonthly(data);
        return isNormalized ? normalizeData(data) : data;
    }

    function getSeriesPriceFormat() {
        return isNormalized
            ? { type: 'custom', formatter: (p) => p.toFixed(1) + '%' }
            : { type: 'price' };
    }

    function addSeriesToChart(symbol) {
        if (seriesMap[symbol]) return; // already on chart
        const color = STOCK_COLORS[symbol] || '#888';
        const series = chart.addLineSeries({
            color,
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: true,
            title: symbol,
            priceFormat: getSeriesPriceFormat(),
        });
        seriesMap[symbol] = series;

        const data = getSeriesData(symbol);
        if (data.length > 0) {
            series.setData(data);
            chart.timeScale().fitContent();
        }
    }

    function refreshAllSeriesData() {
        const priceFormat = getSeriesPriceFormat();
        for (const symbol of activeStocks) {
            const series = seriesMap[symbol];
            if (!series) continue;
            series.applyOptions({ priceFormat });
            const data = getSeriesData(symbol);
            if (data.length > 0) series.setData(data);
        }
        updateMarkers();
        chart.timeScale().fitContent();
    }

    // ── Event markers ──────────────────────────────────────────
    const markerDateToEvents = new Map(); // date string → [event object]

    function toDateStr(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function formatMarkerDate(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    }

    function updateMarkers() {
        // Collect dates of visible (non-filtered) event cards from the DOM
        const visibleDates = new Set();
        document.querySelectorAll('.event-card:not(.filtered-out)').forEach(card => {
            const date = card.getAttribute('data-event-date');
            if (date) visibleDates.add(date);
        });

        markerDateToEvents.clear();

        // Build per-series marker maps: symbol → [markers]
        const seriesMarkers = {};
        for (const symbol of activeStocks) {
            if (seriesMap[symbol]) seriesMarkers[symbol] = [];
        }

        const firstSymbol = [...activeStocks][0];

        events
            .filter(event => {
                const dateStr = toDateStr(new Date(event.date));
                return visibleDates.has(dateStr);
            })
            .forEach(event => {
                const dateStr = toDateStr(new Date(event.date));
                if (!markerDateToEvents.has(dateStr)) markerDateToEvents.set(dateStr, []);
                markerDateToEvents.get(dateStr).push(event);

                // Layoff marker → goes on the specific company's series
                if (event.layoffs && event.layoffs.company && seriesMarkers[event.layoffs.company]) {
                    const count = event.layoffs.headcount ? event.layoffs.headcount.toLocaleString() : '';
                    seriesMarkers[event.layoffs.company].push({
                        time: dateStr,
                        position: 'belowBar',
                        color: '#CC0000',
                        shape: 'arrowDown',
                        text: count ? `-${count}` : '',
                    });
                }

                // Regular event marker → goes on first active series
                if (firstSymbol && seriesMarkers[firstSymbol]) {
                    seriesMarkers[firstSymbol].push({
                        time: dateStr,
                        position: 'aboveBar',
                        color: '#C84B31',
                        shape: 'circle',
                        text: '',
                    });
                }
            });

        // Deduplicate by time+position+shape, sort, and apply
        for (const [symbol, markers] of Object.entries(seriesMarkers)) {
            const deduped = new Map();
            markers.forEach(m => {
                const key = `${m.time}|${m.position}|${m.shape}`;
                if (!deduped.has(key)) deduped.set(key, m);
            });
            const sorted = [...deduped.values()].sort((a, b) => a.time.localeCompare(b.time));
            try { seriesMap[symbol].setMarkers(sorted); } catch {}
        }
    }

    // Listen for filter changes from the timeline
    document.addEventListener('timeline-filters-changed', () => updateMarkers());

    // ── Hover preview + click popover ─────────────────────────
    container.style.position = 'relative';

    const tooltip = document.createElement('div');
    tooltip.className = 'chart-marker-tooltip';
    container.appendChild(tooltip);

    const popover = document.createElement('div');
    popover.className = 'chart-marker-popover';
    popover.setAttribute('role', 'dialog');
    container.appendChild(popover);

    let highlightedCard = null;
    let pinnedDate = null;

    function clearHighlight() {
        if (highlightedCard) {
            highlightedCard.classList.remove('chart-highlight');
            highlightedCard = null;
        }
    }

    function highlightCardForDate(dateStr) {
        clearHighlight();
        const card = document.querySelector(`.event-card:not(.filtered-out)[data-event-date="${dateStr}"]`);
        if (card) {
            card.classList.add('chart-highlight');
            highlightedCard = card;
        }
    }

    function positionFloat(el, x) {
        const w = el.offsetWidth;
        const containerWidth = container.clientWidth;
        let left = x - w / 2;
        if (left < 4) left = 4;
        if (left + w > containerWidth - 4) left = containerWidth - w - 4;
        el.style.left = left + 'px';
        el.style.top = '4px';
    }

    function hidePopover() {
        popover.style.display = 'none';
        pinnedDate = null;
        clearHighlight();
    }

    function scrollTimelineToDate(dateStr) {
        const card = document.querySelector(`.event-card:not(.filtered-out)[data-event-date="${dateStr}"]`);
        if (!card) return;
        card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        // Small flash to confirm arrival
        card.classList.add('chart-highlight');
        setTimeout(() => card.classList.remove('chart-highlight'), 1400);
        card.focus?.();
    }

    function showPopover(dateStr, x) {
        const evs = markerDateToEvents.get(dateStr);
        if (!evs || evs.length === 0) return;

        pinnedDate = dateStr;
        const dateLabel = formatMarkerDate(dateStr);
        const body = evs.map(ev => {
            const title = escapeHtml(ev.title || '');
            const desc = ev.description ? escapeHtml(ev.description) : '';
            return `
                <article class="chart-marker-popover-item">
                    <h4>${title}</h4>
                    ${desc ? `<p>${desc}</p>` : ''}
                </article>
            `;
        }).join('');

        popover.innerHTML = `
            <header class="chart-marker-popover-header">
                <span class="chart-marker-popover-date">${dateLabel}</span>
                <button type="button" class="chart-marker-popover-close" aria-label="Close">&times;</button>
            </header>
            <div class="chart-marker-popover-body">${body}</div>
            <footer class="chart-marker-popover-footer">
                <button type="button" class="chart-marker-popover-jump">
                    Jump to event <span aria-hidden="true">&rarr;</span>
                </button>
            </footer>
        `;

        popover.style.display = 'block';
        positionFloat(popover, x);
        tooltip.style.display = 'none';
        highlightCardForDate(dateStr);

        popover.querySelector('.chart-marker-popover-close').addEventListener('click', hidePopover);
        popover.querySelector('.chart-marker-popover-jump').addEventListener('click', () => {
            // Hide first so clearHighlight doesn't wipe the arrival flash.
            hidePopover();
            scrollTimelineToDate(dateStr);
        });
    }

    function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    chart.subscribeCrosshairMove(param => {
        // If a popover is pinned, don't let hover interfere with it
        if (pinnedDate) return;

        if (!param.time || !param.point) {
            tooltip.style.display = 'none';
            clearHighlight();
            return;
        }

        const timeStr = typeof param.time === 'string'
            ? param.time
            : `${param.time.year}-${String(param.time.month).padStart(2, '0')}-${String(param.time.day).padStart(2, '0')}`;

        const evs = markerDateToEvents.get(timeStr);
        if (!evs) {
            tooltip.style.display = 'none';
            clearHighlight();
            return;
        }

        const dateLabel = formatMarkerDate(timeStr);
        tooltip.innerHTML = `
            <div class="chart-marker-tooltip-date">${dateLabel}</div>
            ${evs.map(ev => `<div class="chart-marker-tooltip-title">${escapeHtml(ev.title)}</div>`).join('')}
            <div class="chart-marker-tooltip-hint">Click marker for details</div>
        `;
        tooltip.style.display = 'block';
        positionFloat(tooltip, param.point.x);

        // Subtle in-place highlight on the timeline card (no scrolling)
        highlightCardForDate(timeStr);
    });

    // Dismiss popover on outside click / escape / timeline scroll
    document.addEventListener('click', (e) => {
        if (!pinnedDate) return;
        if (popover.contains(e.target)) return;
        if (container.contains(e.target)) return; // chart click handled separately
        hidePopover();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pinnedDate) hidePopover();
    });

    const timelineContainerEl = document.querySelector('.timeline-container');
    if (timelineContainerEl) {
        timelineContainerEl.addEventListener('scroll', () => {
            if (pinnedDate) hidePopover();
        }, { passive: true });
    }

    // ── Data helpers ───────────────────────────────────────────
    function mergeStockData(historical, recent) {
        const map = new Map();
        (historical || []).forEach(d => map.set(d.time, d));
        (recent || []).forEach(d => map.set(d.time, d));
        return [...map.values()].sort((a, b) => a.time.localeCompare(b.time));
    }

    function getCachedStockData() {
        try {
            const raw = localStorage.getItem('stock_data_cache_v2');
            if (!raw) return null;
            const { ts, data } = JSON.parse(raw);
            if (Date.now() - ts > 86400000) return null;
            return data;
        } catch { return null; }
    }

    function setCachedStockData(data) {
        try {
            localStorage.setItem('stock_data_cache_v2', JSON.stringify({ ts: Date.now(), data }));
        } catch {}
    }

    // ── Load data ──────────────────────────────────────────────
    async function loadAllStockData() {
        for (const s of ALL_SYMBOLS) stockData[s] = stockHistory[s] || [];

        const cached = getCachedStockData();
        if (cached) {
            for (const s of ALL_SYMBOLS) {
                if (cached[s]) stockData[s] = mergeStockData(stockData[s], cached[s]);
            }
        } else {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const from = thirtyDaysAgo.toISOString().slice(0, 10);
            const to = new Date().toISOString().slice(0, 10);
            try {
                const resp = await fetch(`/api/stocks?symbols=${ALL_SYMBOLS.join(',')}&from=${from}&to=${to}`);
                if (resp.ok) {
                    const liveData = await resp.json();
                    setCachedStockData(liveData);
                    for (const s of ALL_SYMBOLS) {
                        if (liveData[s]?.length > 0) stockData[s] = mergeStockData(stockData[s], liveData[s]);
                    }
                }
            } catch (err) {
                console.error('[Stock Chart] Fetch failed:', err.message);
            }
        }

        // Add series for initially active stocks
        for (const s of activeStocks) addSeriesToChart(s);
        updateMarkers();
    }

    // ── Resolution toggle (1D / 1W / 1M) ──────────────────────
    const resToggle = document.getElementById('chart-resolution-toggle');
    if (resToggle) {
        const btns = resToggle.querySelectorAll('.view-toggle-btn');
        btns.forEach(b => b.classList.toggle('active', b.dataset.res === resolution));
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.res === resolution) return;
                resolution = btn.dataset.res;
                localStorage.setItem('aiTimelineChartRes', resolution);
                btns.forEach(b => b.classList.toggle('active', b === btn));
                refreshAllSeriesData();
            });
        });
    }

    // ── View toggle (% Change / Absolute) ─────────────────────
    const viewToggle = document.getElementById('chart-view-toggle');
    if (viewToggle) {
        const btns = viewToggle.querySelectorAll('.view-toggle-btn');
        // Set initial state from isNormalized
        btns.forEach(b => b.classList.toggle('active', (b.dataset.view === 'pct') === isNormalized));
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const wantNormalized = btn.dataset.view === 'pct';
                if (wantNormalized === isNormalized) return;
                isNormalized = wantNormalized;
                localStorage.setItem('aiTimelineChartNormalized', isNormalized);
                btns.forEach(b => b.classList.toggle('active', b === btn));
                refreshAllSeriesData();
            });
        });
    }

    // ── Chart click → open popover with details + explicit jump ──
    chart.subscribeClick(param => {
        if (!param.time || !param.point) return;

        // Snap to nearest marker date within ~4 days
        const clickTime = typeof param.time === 'string'
            ? param.time
            : `${param.time.year}-${String(param.time.month).padStart(2, '0')}-${String(param.time.day).padStart(2, '0')}`;
        const clickMs = new Date(clickTime).getTime();

        let nearest = null;
        let minDiff = Infinity;
        for (const dateStr of markerDateToEvents.keys()) {
            const diff = Math.abs(new Date(dateStr).getTime() - clickMs);
            if (diff < minDiff) { minDiff = diff; nearest = dateStr; }
        }

        if (nearest && minDiff <= 4 * 86400000) {
            showPopover(nearest, param.point.x);
        } else {
            hidePopover();
        }
    });

    setExpanded(isExpanded);
    loadAllStockData();
}
