/**
 * Vercel Serverless Function: /api/stocks
 * Proxies stock candle data from Finnhub, caches at the edge for 24h.
 *
 * GET /api/stocks?symbols=NVDA,GOOGL&from=2025-01-01&to=2025-02-05
 */
export default async function handler(req, res) {
    const { symbols, from, to } = req.query;

    if (!symbols) {
        return res.status(400).json({ error: 'Missing "symbols" query parameter' });
    }

    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'FINNHUB_API_KEY not configured' });
    }

    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase()).slice(0, 10);
    const fromTs = Math.floor(new Date(from || '2024-01-01').getTime() / 1000);
    const toTs = Math.floor(new Date(to || new Date().toISOString().slice(0, 10)).getTime() / 1000);

    const result = {};

    // Fetch all symbols in parallel
    await Promise.all(symbolList.map(async (symbol) => {
        try {
            const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${fromTs}&to=${toTs}&token=${apiKey}`;
            const resp = await fetch(url);
            const data = await resp.json();

            if (data.s === 'ok' && data.t) {
                result[symbol] = data.t.map((timestamp, i) => ({
                    time: new Date(timestamp * 1000).toISOString().slice(0, 10),
                    value: data.c[i],
                }));
            } else {
                result[symbol] = [];
            }
        } catch (err) {
            console.error(`Finnhub error for ${symbol}:`, err.message);
            result[symbol] = [];
        }
    }));

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(result);
}
