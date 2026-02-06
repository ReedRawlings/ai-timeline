#!/usr/bin/env node
/**
 * Build script: fetches historical stock data from Yahoo Finance
 * and writes it to src/data/stock-history.json.
 *
 * Only re-fetches if the file is stale (>7 days old) or missing.
 * No API key required.
 */
import { writeFileSync, statSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'src/data');
const outPath = resolve(outDir, 'stock-history.json');

const SYMBOLS = [
    // Mag 7
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA',
    // Gaming
    'RBLX', 'EA', 'TTWO', 'NTDOY', 'U', 'UBSFY',
    // SaaS Disrupted
    'CHGG', 'CRM', 'PATH', 'ADBE', 'DUOL', 'HUBS',
    // Memory / Semis
    'MU', 'AVGO', 'TSM', 'AMD', 'AMAT', 'LRCX',
    // AI Infrastructure
    'VRT', 'ANET', 'ETN', 'EQIX', 'CLS', 'PWR',
];

function isFileFresh() {
    try {
        const stat = statSync(outPath);
        const ageMs = Date.now() - stat.mtimeMs;
        return ageMs < 7 * 24 * 60 * 60 * 1000;
    } catch {
        return false;
    }
}

async function fetchCandles(symbol) {
    const from = Math.floor(new Date('2022-01-01').getTime() / 1000);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const to = Math.floor(thirtyDaysAgo.getTime() / 1000);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${from}&period2=${to}&interval=1d`;
    const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const json = await resp.json();
    const chart = json?.chart?.result?.[0];

    if (chart && chart.timestamp) {
        const closes = chart.indicators?.quote?.[0]?.close || [];
        return chart.timestamp
            .map((ts, i) => {
                const val = closes[i];
                if (val == null) return null;
                return {
                    time: new Date(ts * 1000).toISOString().slice(0, 10),
                    value: Math.round(val * 100) / 100,
                };
            })
            .filter(Boolean);
    }
    return [];
}

async function main() {
    if (isFileFresh()) {
        console.log('✅ stock-history.json is fresh (< 7 days old), skipping fetch.');
        return;
    }

    console.log('📈 Fetching historical stock data from Yahoo Finance...');
    const result = {};

    for (const symbol of SYMBOLS) {
        console.log(`  Fetching ${symbol}...`);
        try {
            result[symbol] = await fetchCandles(symbol);
            console.log(`  ✅ ${symbol}: ${result[symbol].length} data points`);
        } catch (err) {
            console.log(`  ❌ ${symbol}: ${err.message}`);
            result[symbol] = [];
        }
        // Small delay between requests
        await new Promise(r => setTimeout(r, 500));
    }

    mkdirSync(outDir, { recursive: true });
    writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`✅ Wrote stock history → ${outPath}`);
}

main().catch(err => {
    console.error('❌ build-stock-data failed:', err);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outPath, JSON.stringify({}));
});
