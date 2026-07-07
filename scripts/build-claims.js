/**
 * build-claims.js — Converts data/claims/{referents,claims}.csv to
 * src/data/claims.json at build time (same pattern as build-layoffs.js).
 * The referent `references` column is JSON text in the CSV; it is parsed
 * here and the build fails loudly if any row's JSON is malformed.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, '..', 'data', 'claims');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'claims.json');

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

function readTable(file) {
    const [header, ...records] = parseCSV(fs.readFileSync(path.join(DIR, file), 'utf8'));
    return records.map(rec => Object.fromEntries(header.map((h, i) => [h, (rec[i] ?? '').trim()])));
}

const referents = readTable('referents.csv').map(r => {
    let references;
    try {
        references = JSON.parse(r.references || '[]');
        if (!Array.isArray(references)) throw new Error('not an array');
    } catch (e) {
        throw new Error(`referent ${r.referent_id}: bad references JSON — ${e.message}`);
    }
    return { ...r, references, source_url: r.source_url.startsWith('http') ? r.source_url : null };
});

const claims = readTable('claims.csv').map(c => ({
    ...c,
    accuracy_rating: c.accuracy_rating === 'premature' ? 'premature / unverifiable' : c.accuracy_rating,
    // Diffuse-proponent convention: "Various ..." claimants have no single
    // firm proponent (see docs/prds/claims-proponent-display-prd.md).
    has_single_claimant: !c.claimant.startsWith('Various'),
}));

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify({ referents, claims }, null, 2));
console.log(`Built ${referents.length} referents + ${claims.length} claims → ${path.relative(process.cwd(), OUT_PATH)}`);
