/**
 * migrate-layoffs.js — ONE-TIME migration (2026-07-03).
 *
 * Extracts nested `layoffs:` blocks from data/events.yaml into
 * data/layoffs/layoffs.csv, and replaces each block with a
 * `layoff_ids: ["<id>"]` reference. Text-level line surgery so the
 * rest of the YAML formatting is untouched.
 *
 * Every migrated row gets verification_status=needs_recode: the legacy
 * free-text `reason` label is NOT an attribution and is carried into
 * attribution_notes for a human-reviewed recode with a real quote.
 */
import fs from 'fs';

const EVENTS = 'data/events.yaml';
const OUT_CSV = 'data/layoffs/layoffs.csv';
const TODAY = '2026-07-03';

// Ticker → display name (from layoff-chart.js; becomes dataset columns)
const COMPANY_NAMES = {
    GOOGL: 'Google', META: 'Meta', MSFT: 'Microsoft', AMZN: 'Amazon',
    TSLA: 'Tesla', EA: 'EA', CHGG: 'Chegg', U: 'Unity', DUOL: 'Duolingo',
    PATH: 'UiPath', TEAM: 'Atlassian', SQ: 'Block', CRM: 'Salesforce',
    IBM: 'IBM', UPS: 'UPS', INTC: 'Intel',
};

const HEADER = [
    'id', 'company', 'ticker', 'announcement_date', 'effective_date',
    'count', 'count_precision', 'country', 'region_detail', 'sector',
    'ai_attribution', 'attribution_quote', 'attribution_notes',
    'source_url', 'source_type', 'press_independent', 'cross_references',
    'verification_status', 'added_date', 'updated_date', 'notes',
];

function csvEscape(v) {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function unquote(s) {
    return s.trim().replace(/^["']|["']$/g, '');
}

function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const lines = fs.readFileSync(EVENTS, 'utf8').split('\n');
const out = [];
const rows = [];
const usedIds = new Set();

let curDate = '';
let curLink = '';

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(/^  date:\s*(.+)$/);
    if (dateMatch) curDate = unquote(dateMatch[1]);
    const linkMatch = line.match(/^  link:\s*(.+)$/);
    if (linkMatch) curLink = unquote(linkMatch[1]);
    if (line.startsWith('- title:')) { curDate = ''; curLink = ''; }

    if (/^  layoffs:\s*$/.test(line)) {
        // Consume the indented block
        const block = {};
        let j = i + 1;
        while (j < lines.length) {
            const m = lines[j].match(/^    ([a-z_]+):\s*(.+)$/);
            if (!m) break;
            block[m[1]] = unquote(m[2]);
            j++;
        }
        i = j - 1;

        const ticker = block.company || '';
        const company = COMPANY_NAMES[ticker] || ticker;
        const ym = curDate.slice(0, 7); // YYYY-MM
        let id = `${slug(company)}-${ym}`;
        let n = 2;
        while (usedIds.has(id)) id = `${slug(company)}-${ym}-${n++}`;
        usedIds.add(id);

        rows.push({
            id,
            company,
            ticker,
            announcement_date: curDate.slice(0, 10),
            count: block.headcount || '',
            attribution_notes: `Legacy editorial label from events.yaml: "${block.reason || ''}". Not an attribution — needs human recode with a verbatim quote and source.`,
            source_url: curLink,
            verification_status: 'needs_recode',
            added_date: TODAY,
            notes: 'Migrated from events.yaml layoffs block, 2026-07-03.',
        });

        out.push(`  layoff_ids: ["${id}"]`);
        continue;
    }

    out.push(line);
}

const csv = [
    HEADER.join(','),
    ...rows.map(r => HEADER.map(h => csvEscape(r[h])).join(',')),
].join('\n') + '\n';

fs.writeFileSync(OUT_CSV, csv);
fs.writeFileSync(EVENTS, out.join('\n'));
console.log(`Migrated ${rows.length} layoffs blocks → ${OUT_CSV}`);
console.log(`Rewrote ${EVENTS} with layoff_ids references.`);
