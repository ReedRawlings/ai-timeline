/**
 * build-layoffs.js — Converts data/layoffs/layoffs.csv to src/data/layoffs.json
 * at build time (same pattern as build-events.js). The chart consumes only the
 * fields it needs; rows without a disclosed count are passed through with
 * count: null so the chart can decide how to represent them.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '..', 'data', 'layoffs', 'layoffs.csv');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'layoffs.json');

// Minimal RFC-4180 CSV parser (handles quoted fields with commas/newlines)
function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (text[i + 1] === '"') { field += '"'; i++; }
                else inQuotes = false;
            } else field += c;
        } else if (c === '"') {
            inQuotes = true;
        } else if (c === ',') {
            row.push(field); field = '';
        } else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(field); field = '';
            if (row.length > 1 || row[0] !== '') rows.push(row);
            row = [];
        } else field += c;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
}

const csv = fs.readFileSync(CSV_PATH, 'utf8');
const [header, ...records] = parseCSV(csv);

const layoffs = records.map(rec => {
    const r = Object.fromEntries(header.map((h, i) => [h, rec[i] ?? '']));
    return {
        id: r.id,
        company: r.company,
        ticker: r.ticker || null,
        announcement_date: r.announcement_date,
        count: r.count ? parseInt(r.count, 10) : null,
        count_precision: r.count_precision || null,
        country: r.country || null,
        ai_attribution: r.ai_attribution || null,
        verification_status: r.verification_status,
    };
});

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(layoffs, null, 2));
console.log(`Built ${layoffs.length} layoff rows → ${path.relative(process.cwd(), OUT_PATH)}`);
