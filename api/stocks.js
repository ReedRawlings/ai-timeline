/**
 * Vercel Serverless Function: /api/stocks
 * Proxies stock chart data from Yahoo Finance, caches at the edge for 24h.
 *
 * GET /api/stocks?symbols=NVDA,GOOGL&from=2025-01-01&to=2025-02-05
 */
export default async function handler(req, res) {
    const { symbols, from, to } = req.query;

    if (!symbols) {
        return res.status(400).json({ error: 'Missing "symbols" query parameter' });
    }

    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase()).slice(0, 10);
    const fromTs = Math.floor(new Date(from || '2024-01-01').getTime() / 1000);
    const toTs = Math.floor(new Date(to || new Date().toISOString().slice(0, 10)).getTime() / 1000);

    const result = {};

    await Promise.all(symbolList.map(async (symbol) => {
        try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${fromTs}&period2=${toTs}&interval=1d`;
            const resp = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            const json = await resp.json();
            const chart = json?.chart?.result?.[0];

            if (chart && chart.timestamp) {
                const closes = chart.indicators?.quote?.[0]?.close || [];
                result[symbol] = chart.timestamp
                    .map((ts, i) => {
                        const val = closes[i];
                        if (val == null) return null;
                        return {
                            time: new Date(ts * 1000).toISOString().slice(0, 10),
                            value: Math.round(val * 100) / 100,
                        };
                    })
                    .filter(Boolean);
            } else {
                result[symbol] = [];
            }
        } catch (err) {
            console.error(`Yahoo Finance error for ${symbol}:`, err.message);
            result[symbol] = [];
        }
    }));

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(result);
}
