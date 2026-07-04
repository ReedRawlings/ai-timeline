#!/usr/bin/env node
/**
 * apply-tiers.js — one-shot editorial baseline merge.
 *
 * Reads a tier-reference CSV (date,title,tier) and inserts `tier: major` /
 * `tier: minor` lines into data/events.yaml, matching by date-prefix
 * (YYYY-MM-DD) + exact title. `notable` rows are intentionally skipped —
 * notable is the default when the field is omitted.
 *
 * Idempotent: an event that already has a `tier:` line is left untouched.
 * Prints a report of unmatched and ambiguous CSV rows for manual review.
 *
 * Usage: node scripts/apply-tiers.js <path-to-tier-reference.csv>
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const yamlPath = resolve(root, 'data/events.yaml');

const csvPath = process.argv[2];
if (!csvPath) {
    console.error('Usage: node scripts/apply-tiers.js <tier-reference.csv>');
    process.exit(1);
}

/** Minimal CSV parser for the 3-column date,title,tier file (quoted titles). */
function parseCsv(text) {
    const rows = [];
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    for (let i = 1; i < lines.length; i++) { // skip header
        const line = lines[i];
        // date is unquoted up to first comma; title may be quoted; tier is last token
        const firstComma = line.indexOf(',');
        const lastComma = line.lastIndexOf(',');
        const date = line.slice(0, firstComma).trim();
        let title = line.slice(firstComma + 1, lastComma).trim();
        const tier = line.slice(lastComma + 1).trim();
        if (title.startsWith('"') && title.endsWith('"')) {
            title = title.slice(1, -1).replace(/""/g, '"');
        }
        rows.push({ date, title, tier });
    }
    return rows;
}

const csvRows = parseCsv(readFileSync(csvPath, 'utf-8'));
// Only non-default tiers get written explicitly.
const wanted = new Map(); // "YYYY-MM-DD|title" -> tier
for (const r of csvRows) {
    if (r.tier === 'major' || r.tier === 'minor') {
        wanted.set(`${r.date}|${r.title}`, r.tier);
    }
}

// Split YAML into event blocks. Events begin with a line starting "- title:".
const raw = readFileSync(yamlPath, 'utf-8');
const lines = raw.split('\n');
const blocks = []; // { startLine, endLine }
for (let i = 0; i < lines.length; i++) {
    if (/^- title:/.test(lines[i])) {
        if (blocks.length) blocks[blocks.length - 1].end = i;
        blocks.push({ start: i, end: lines.length });
    }
}

function blockKey(block) {
    const seg = lines.slice(block.start, block.end);
    const titleLine = seg.find(l => /^- title:/.test(l));
    const dateLine = seg.find(l => /^\s*date:/.test(l));
    if (!titleLine || !dateLine) return null;
    const title = (titleLine.match(/^- title:\s*"?(.*?)"?\s*$/) || [])[1] || '';
    const date = ((dateLine.match(/date:\s*"?(.*?)"?\s*$/) || [])[1] || '').slice(0, 10);
    return { title, date, key: `${date}|${title}` };
}

// Count how many blocks map to each key (to detect ambiguity).
const keyCounts = new Map();
for (const b of blocks) {
    const k = blockKey(b);
    if (k) keyCounts.set(k.key, (keyCounts.get(k.key) || 0) + 1);
}

// Insert tier lines (walk blocks bottom-up so line indices stay valid).
const matched = new Set();
const ambiguous = new Set();
let inserted = 0;
for (let bi = blocks.length - 1; bi >= 0; bi--) {
    const b = blocks[bi];
    const k = blockKey(b);
    if (!k) continue;
    const tier = wanted.get(k.key);
    if (!tier) continue;
    if (keyCounts.get(k.key) > 1) { ambiguous.add(k.key); continue; }

    const seg = lines.slice(b.start, b.end);
    if (seg.some(l => /^\s*tier:/.test(l))) { matched.add(k.key); continue; } // already tiered
    const relDate = seg.findIndex(l => /^\s*date:/.test(l));
    const absDate = b.start + relDate;
    const indent = (lines[absDate].match(/^(\s*)/) || ['', ''])[1];
    lines.splice(absDate + 1, 0, `${indent}tier: ${tier}`);
    matched.add(k.key);
    inserted++;
}

writeFileSync(yamlPath, lines.join('\n'));

// Report.
const unmatched = [...wanted.keys()].filter(k => !matched.has(k) && !ambiguous.has(k));
console.log(`\n✅ Inserted ${inserted} tier line(s) into data/events.yaml`);
console.log(`   (${wanted.size} major/minor rows in CSV; ${matched.size} matched)`);
if (ambiguous.size) {
    console.log(`\n⚠️  Ambiguous (multiple YAML events share date+title — skipped, resolve by hand):`);
    for (const k of ambiguous) console.log(`   ${wanted.get(k).padEnd(6)} ${k}`);
}
if (unmatched.length) {
    console.log(`\n⚠️  Unmatched CSV rows (no exact date+title in YAML — review by hand):`);
    for (const k of unmatched) console.log(`   ${wanted.get(k).padEnd(6)} ${k}`);
}
console.log('');
