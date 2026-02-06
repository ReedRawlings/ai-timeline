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

    // Track active stocks and their data
    const activeStocks = new Set(DEFAULT_STOCKS);
    const seriesMap = {};
    const stockData = {}; // cache fetched data per symbol

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
            addSeriesToChart(symbol);
        }
    }

    function addSeriesToChart(symbol) {
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
            updateMarkers();
        }
    }

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

        try {
            series.setMarkers(markers);
        } catch (e) {
            console.warn('Markers error:', e.message);
        }
    }

    function mergeStockData(historical, recent) {
        const map = new Map();
        (historical || []).forEach(d => map.set(d.time, d));
        (recent || []).forEach(d => map.set(d.time, d));
        return [...map.values()].sort((a, b) => a.time.localeCompare(b.time));
    }

    // localStorage caching (24h TTL)
    function getCachedStockData() {
        try {
            const raw = localStorage.getItem('stock_data_cache');
            if (!raw) return null;
            const { ts, data } = JSON.parse(raw);
            if (Date.now() - ts > 86400000) return null;
            return data;
        } catch {
            return null;
        }
    }

    function setCachedStockData(data) {
        try {
            localStorage.setItem('stock_data_cache', JSON.stringify({ ts: Date.now(), data }));
        } catch {
            // localStorage full
        }
    }

    // Fetch all stock data in one batch call, then populate series
    async function loadAllStockData() {
        // Start with pre-baked historical data
        for (const symbol of DEFAULT_STOCKS) {
            stockData[symbol] = stockHistory[symbol] || [];
        }
        console.log('[Stock Chart] Historical data keys:', Object.keys(stockHistory));

        // Check localStorage cache first
        const cached = getCachedStockData();
        if (cached) {
            console.log('[Stock Chart] Using cached API data');
            for (const symbol of DEFAULT_STOCKS) {
                if (cached[symbol]) {
                    stockData[symbol] = mergeStockData(stockData[symbol], cached[symbol]);
                }
            }
        } else {
            // Fetch recent data from serverless function (one call for all symbols)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const from = thirtyDaysAgo.toISOString().slice(0, 10);
            const to = new Date().toISOString().slice(0, 10);
            const url = `/api/stocks?symbols=${DEFAULT_STOCKS.join(',')}&from=${from}&to=${to}`;

            console.log('[Stock Chart] Fetching:', url);
            try {
                const resp = await fetch(url);
                console.log('[Stock Chart] API response status:', resp.status);
                if (resp.ok) {
                    const liveData = await resp.json();
                    console.log('[Stock Chart] API data keys:', Object.keys(liveData));
                    setCachedStockData(liveData);
                    for (const symbol of DEFAULT_STOCKS) {
                        if (liveData[symbol] && liveData[symbol].length > 0) {
                            stockData[symbol] = mergeStockData(stockData[symbol], liveData[symbol]);
                        }
                    }
                } else {
                    const text = await resp.text();
                    console.error('[Stock Chart] API error:', resp.status, text);
                }
            } catch (err) {
                console.error('[Stock Chart] Fetch failed:', err.message);
            }
        }

        // Create series for each active stock
        for (const symbol of DEFAULT_STOCKS) {
            console.log(`[Stock Chart] ${symbol}: ${stockData[symbol].length} data points`);
            addSeriesToChart(symbol);
        }

        updateMarkers();
    }

    // Click on chart to scroll timeline to nearest event
    chart.subscribeClick(param => {
        if (!param.time) return;
        const clickDate = param.time;
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

        if (nearest && minDiff < 7 * 86400000) {
            const card = document.querySelector(`.event-card[data-event-date="${nearest}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                card.focus();
            }
        }
    });

    // Set initial state, then load data
    setExpanded(isExpanded);
    loadAllStockData();
}
