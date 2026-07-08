/**
 * build-adoption.js — Converts data/adoption/questions.csv + estimates.csv to
 * src/data/adoption.json at build time (same pattern as build-layoffs.js).
 * Passes fields through as-is; the page derives everything (latest values,
 * range lede, chart series) from this JSON — nothing is baked into the page.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const Q_PATH = path.join(__dirname, '..', 'data', 'adoption', 'questions.csv');
const E_PATH = path.join(__dirname, '..', 'data', 'adoption', 'estimates.csv');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'adoption.json');

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

function toObjects(csvText) {
    const [header, ...records] = parseCSV(csvText);
    return records.map(rec => Object.fromEntries(header.map((h, i) => [h, rec[i] ?? ''])));
}

const questions = toObjects(fs.readFileSync(Q_PATH, 'utf8'));
const estimates = toObjects(fs.readFileSync(E_PATH, 'utf8')).map(r => ({
    ...r,
    value: r.value === '' ? null : parseFloat(r.value),
    distribution: r.distribution ? JSON.parse(r.distribution) : null,
}));

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify({ questions, estimates }, null, 2));
console.log(`Built ${questions.length} question versions, ${estimates.length} estimates → ${path.relative(process.cwd(), OUT_PATH)}`);
