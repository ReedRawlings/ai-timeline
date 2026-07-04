/**
 * chart-tabs.js — Stocks / Layoffs tab switching for the AI Market Tracker.
 * Extracted from the retired main.js; the tracker itself is unchanged.
 */
export function initChartTabs() {
    const tabs = document.querySelectorAll('.chart-tab');
    const stocksPanel = document.getElementById('stocks-tab-panel');
    const layoffsPanel = document.getElementById('layoffs-tab-panel');
    if (!tabs.length || !stocksPanel || !layoffsPanel) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.toggle('active', t === tab));
            stocksPanel.style.display = target === 'stocks' ? '' : 'none';
            layoffsPanel.style.display = target === 'layoffs' ? '' : 'none';
        });
    });
}
