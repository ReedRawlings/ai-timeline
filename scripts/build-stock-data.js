#!/usr/bin/env node
/**
 * Build script: fetches historical stock candle data from Finnhub
 * and writes it to src/data/stock-history.json.
 *
 * Only re-fetches if the file is stale (>7 days old) or missing.
 * Requires FINNHUB_API_KEY environment variable.
 */
import { readFileSync, writeFileSync, statSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'src/data');
const outPath = resolve(outDir, 'stock-history.json');

const SYMBOLS = ['NVDA', 'GOOGL', 'MSFT', 'META', 'AMD'];

// Check if existing file is fresh enough (< 7 days)
function isFileFresh() {
    try {
        const stat = statSync(outPath);
        const ageMs = Date.now() - stat.mtimeMs;
        return ageMs < 7 * 24 * 60 * 60 * 1000;
    } catch {
        return false;
    }
}

async function fetchCandles(symbol, apiKey) {
    // Fetch from 2022-01-01 to 30 days ago
    const from = Math.floor(new Date('2022-01-01').getTime() / 1000);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const to = Math.floor(thirtyDaysAgo.getTime() / 1000);

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${apiKey}`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.s === 'ok' && data.t) {
        return data.t.map((timestamp, i) => ({
            time: new Date(timestamp * 1000).toISOString().slice(0, 10),
            value: data.c[i],
        }));
    }
    return [];
}

async function main() {
    if (isFileFresh()) {
        console.log('✅ stock-history.json is fresh (< 7 days old), skipping fetch.');
        return;
    }

    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
        console.log('⚠️  FINNHUB_API_KEY not set — writing empty stock history.');
        mkdirSync(outDir, { recursive: true });
        writeFileSync(outPath, JSON.stringify({}));
        return;
    }

    console.log('📈 Fetching historical stock data from Finnhub...');
    const result = {};

    for (const symbol of SYMBOLS) {
        console.log(`  Fetching ${symbol}...`);
        try {
            result[symbol] = await fetchCandles(symbol, apiKey);
            console.log(`  ✅ ${symbol}: ${result[symbol].length} data points`);
        } catch (err) {
            console.log(`  ❌ ${symbol}: ${err.message}`);
            result[symbol] = [];
        }
        // Rate limit: Finnhub free tier is 60 calls/min
        await new Promise(r => setTimeout(r, 1100));
    }

    mkdirSync(outDir, { recursive: true });
    writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`✅ Wrote stock history → ${outPath}`);
}

main().catch(err => {
    console.error('❌ build-stock-data failed:', err);
    // Don't fail the build — chart will just show no historical data
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outPath, JSON.stringify({}));
});
