/**
 * stock-chart.js
 * TradingView Lightweight Charts integration with AI event markers.
 * Shows a basket of AI-related stocks with timeline events overlaid.
 */
import { createChart, ColorType, LineStyle } from 'lightweight-charts';
import stockHistory from '../data/stock-history.json';

const STOCK_COLORS = {
    NVDA: '#76B900',
    GOOGL: '#4285F4',
    MSFT: '#00A4EF',
    META: '#0668E1',
    AMD: '#ED1C24',
};

const DEFAULT_STOCKS = ['NVDA', 'GOOGL', 'MSFT', 'META', 'AMD'];

export function initStockChart(events) {
    const container = document.getElementById('stock-chart-container');
    const chipsContainer = document.getElementById('stock-chips');
    const toggleBtn = document.getElementById('chart-toggle');
    const panel = document.getElementById('stock-chart-panel');

    if (!container || !chipsContainer || !toggleBtn || !panel) return;

    // Collapse/expand state
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

    // Track active stocks
    const activeStocks = new Set(DEFAULT_STOCKS);
    const seriesMap = {};

    // Create chart
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
        timeScale: {
            borderColor: '#D4D0C8',
            timeVisible: false,
        },
        rightPriceScale: {
            borderColor: '#D4D0C8',
            scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        handleScroll: { mouseWheel: true, pressedMouseMove: true },
        handleScale: { axisPressedMouseMove: true, mouseWheel: true },
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
        chart.applyOptions({ width: container.clientWidth });
    });
    resizeObserver.observe(container);

    // Build stock chips
    DEFAULT_STOCKS.forEach(symbol => {
        const chip = document.createElement('button');
        chip.className = 'stock-chip active';
        chip.setAttribute('data-symbol', symbol);
        chip.style.setProperty('--chip-color', STOCK_COLORS[symbol]);
        chip.textContent = symbol;
        chip.addEventListener('click', () => toggleStock(symbol, chip));
        chipsContainer.appendChild(chip);
    });

    function toggleStock(symbol, chip) {
        if (activeStocks.has(symbol)) {
            activeStocks.delete(symbol);
            chip.classList.remove('active');
            if (seriesMap[symbol]) {
                chart.removeSeries(seriesMap[symbol]);
                delete seriesMap[symbol];
            }
        } else {
            activeStocks.add(symbol);
            chip.classList.add('active');
            loadStockData(symbol);
        }
    }

    // Event markers (vertical lines on the chart)
    let markerSeries = null;

    function addEventMarkers() {
        if (!events || events.length === 0) return;

        // Create markers using lightweight-charts marker API
        // We'll add markers to the first active series
        updateMarkers();
    }

    function updateMarkers() {
        // Find the first active series to attach markers to
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

        try {
            series.setMarkers(markers);
        } catch {
            // markers may fail if dates don't align — that's OK
        }
    }

    // Load stock data (historical JSON + live API)
    async function loadStockData(symbol) {
        const color = STOCK_COLORS[symbol] || '#888';
        const series = chart.addLineSeries({
            color,
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: true,
            title: symbol,
        });
        seriesMap[symbol] = series;

        // Load pre-baked historical data
        let data = [];
        if (stockHistory[symbol]) {
            data = stockHistory[symbol];
        }

        // Fetch recent data from serverless function
        try {
            const cached = getCachedStockData(symbol);
            if (cached) {
                data = mergeStockData(data, cached);
            } else {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const from = thirtyDaysAgo.toISOString().slice(0, 10);
                const to = new Date().toISOString().slice(0, 10);

                const resp = await fetch(`/api/stocks?symbols=${symbol}&from=${from}&to=${to}`);
                if (resp.ok) {
                    const liveData = await resp.json();
                    if (liveData[symbol]) {
                        setCachedStockData(symbol, liveData[symbol]);
                        data = mergeStockData(data, liveData[symbol]);
                    }
                }
            }
        } catch {
            // API not available — use historical data only
        }

        if (data.length > 0) {
            series.setData(data);
            chart.timeScale().fitContent();
            updateMarkers();
        }
    }

    // localStorage caching (24h TTL)
    function getCachedStockData(symbol) {
        try {
            const raw = localStorage.getItem(`stock_${symbol}`);
            if (!raw) return null;
            const { ts, data } = JSON.parse(raw);
            if (Date.now() - ts > 86400000) return null; // 24h expired
            return data;
        } catch {
            return null;
        }
    }

    function setCachedStockData(symbol, data) {
        try {
            localStorage.setItem(`stock_${symbol}`, JSON.stringify({ ts: Date.now(), data }));
        } catch {
            // localStorage full — ignore
        }
    }

    function mergeStockData(historical, recent) {
        const map = new Map();
        historical.forEach(d => map.set(d.time, d));
        recent.forEach(d => map.set(d.time, d));
        return [...map.values()].sort((a, b) => a.time.localeCompare(b.time));
    }

    // Subscribe to crosshair for tooltip on event markers
    chart.subscribeCrosshairMove(param => {
        // Tooltip logic can be extended here
    });

    // Click on chart to scroll timeline to nearest event
    chart.subscribeClick(param => {
        if (!param.time) return;
        const clickDate = param.time;
        // Find the nearest event
        let nearest = null;
        let minDiff = Infinity;
        events.forEach(event => {
            const d = new Date(event.date);
            const eventTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const diff = Math.abs(new Date(eventTime) - new Date(clickDate));
            if (diff < minDiff) {
                minDiff = diff;
                nearest = eventTime;
            }
        });

        if (nearest && minDiff < 7 * 86400000) { // within 7 days
            const card = document.querySelector(`.event-card[data-event-date="${nearest}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                card.focus();
            }
        }
    });

    // Load initial stocks
    DEFAULT_STOCKS.forEach(symbol => loadStockData(symbol));
    addEventMarkers();

    // Set initial collapsed/expanded state
    setExpanded(isExpanded);
}
