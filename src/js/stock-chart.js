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

// ── Chart Init ─────────────────────────────────────────────────
export function initStockChart(events) {
    const container = document.getElementById('stock-chart-container');
    const chipsContainer = document.getElementById('stock-chips');
    const toggleBtn = document.getElementById('chart-toggle');
    const panel = document.getElementById('stock-chart-panel');

    if (!container || !chipsContainer || !toggleBtn || !panel) return;

    // Collapse / expand
    let isExpanded = localStorage.getItem('aiTimelineChartOpen') !== 'false';
    const toggleIcon = toggleBtn.querySelector('.chart-toggle-icon');

    function setExpanded(expanded) {
        isExpanded = expanded;
        panel.style.display = expanded ? 'block' : 'none';
        toggleIcon.textContent = expanded ? '\u25B2' : '\u25BC';
        localStorage.setItem('aiTimelineChartOpen', expanded);
        if (expanded && chart) chart.timeScale().fitContent();
    }

    toggleBtn.addEventListener('click', () => setExpanded(!isExpanded));

    // State
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

    function addSeriesToChart(symbol) {
        if (seriesMap[symbol]) return; // already on chart
        const color = STOCK_COLORS[symbol] || '#888';
        const series = chart.addLineSeries({
            color,
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: true,
            title: symbol,
        });
        seriesMap[symbol] = series;

        if (stockData[symbol] && stockData[symbol].length > 0) {
            series.setData(stockData[symbol]);
            chart.timeScale().fitContent();
        }
    }

    // ── Event markers ──────────────────────────────────────────
    function updateMarkers() {
        const firstSymbol = [...activeStocks][0];
        const series = seriesMap[firstSymbol];
        if (!series) return;

        const markers = events
            .map(event => {
                const d = new Date(event.date);
                return {
                    time: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
                    position: 'aboveBar',
                    color: '#C84B31',
                    shape: 'circle',
                    text: event.title.length > 30 ? event.title.slice(0, 27) + '...' : event.title,
                };
            })
            .sort((a, b) => a.time.localeCompare(b.time));

        try { series.setMarkers(markers); } catch {}
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

    // ── Chart click → scroll timeline ──────────────────────────
    chart.subscribeClick(param => {
        if (!param.time) return;
        let nearest = null;
        let minDiff = Infinity;
        events.forEach(event => {
            const d = new Date(event.date);
            const t = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const diff = Math.abs(new Date(t) - new Date(param.time));
            if (diff < minDiff) { minDiff = diff; nearest = t; }
        });
        if (nearest && minDiff < 7 * 86400000) {
            const card = document.querySelector(`.event-card[data-event-date="${nearest}"]`);
            if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); card.focus(); }
        }
    });

    setExpanded(isExpanded);
    loadAllStockData();
}
