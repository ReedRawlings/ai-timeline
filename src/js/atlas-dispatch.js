/**
 * atlas-dispatch.js — "The AI Record" timeline view.
 *
 * Two stacked sections built from the full event array:
 *   1. Atlas strip — one bar per calendar month across the whole tracked
 *      history; bar height = total events, ember sub-bar = major-tier count.
 *      Click a bar to focus that month.
 *   2. Dispatch pane — the focused month as an editorial digest: summary
 *      paragraph, stat chips, expandable major-event cards, and a collapsible
 *      "Everything Else" list (notable + minor) with hover tooltips.
 *
 * Recreates the design-handoff prototype using the codebase's class-based
 * DOM + external-CSS conventions. Tooltips use CSS :hover rather than a
 * hover state, so only expand/collapse and month changes trigger a re-render.
 */

const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const MAX_BAR_PX = 82;
const MIN_BAR_PX = 4;
const TRUNCATE_AT = 300;

/**
 * Hand-written month summaries (keyed YYYY-MM). Everything else falls back to
 * an auto-composed sentence. Add entries here as months get an editorial pass.
 */
const MONTH_SUMMARIES = {
    '2026-02': "Capital concentrates and the gloves come off. Anthropic quietly reverses a core AI safety testing pledge as Trump moves to blacklist the company — answered the same day by a Pentagon deal — turning frontier AI into open political conflict. The Grok deepfake crisis escalates from a presidential post to a formal EU probe, and a $1.25T SpaceX–xAI merger reorders the balance of capital.",
    '2025-01': "The year opens with a shock. DeepSeek's R1 — trained for a fraction of Western budgets — erases nearly $600B of NVIDIA's value in a day, while Trump revokes Biden's AI order and unveils the $500B Stargate project. The terms of the race are rewritten in three weeks."
};

// ---- small helpers ---------------------------------------------------------

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
}

/** "2026-01-29T..." -> "JAN 29" */
function dayLabel(iso) {
    const [, m, d] = iso.slice(0, 10).split('-');
    return `${MONTHS_ABBR[+m - 1]} ${+d}`;
}

/** Truncate to ~n chars on a word boundary, adding an ellipsis. */
function truncate(text, n = TRUNCATE_AT) {
    if (!text || text.length <= n) return text || '';
    let s = text.slice(0, n);
    const sp = s.lastIndexOf(' ');
    if (sp > 0) s = s.slice(0, sp);
    return s.replace(/[\s.,;:—-]+$/, '') + '…';
}

const tier = e => e.tier || 'notable';
const orgsOrTags = e => {
    const orgs = (e.organizations || []).slice(0, 3);
    if (orgs.length) return orgs.join('  ·  ');
    return (e.tags || []).join('  ·  ');
};

// ---- view ------------------------------------------------------------------

class AtlasDispatch {
    constructor(mount, events) {
        this.mount = mount;
        // Timeline events only — chart-only rows are layoff markers, not events.
        this.all = events.filter(e => e.display !== 'chart-only');

        this.expandedMajor = new Set(); // keys "date|title"
        this.ebOpen = null;             // tri-state: null=auto, true, false

        this.computeBuckets();
        this.focusKey = this.eventMonths[this.eventMonths.length - 1] || this.monthKeys[0];

        this.buildStatLine();
        this.buildAtlas();
        this.buildDispatch();
        this.render();
    }

    /** Monthly totals/major counts, contiguous month keys, and bar geometry. */
    computeBuckets() {
        const buckets = {};
        this.all.forEach(e => {
            const k = e.date.slice(0, 7);
            (buckets[k] = buckets[k] || { total: 0, major: 0 }).total++;
            if (tier(e) === 'major') buckets[k].major++;
        });
        this.buckets = buckets;

        const present = Object.keys(buckets).sort();
        const first = present[0];
        const last = present[present.length - 1];

        // contiguous month keys first..last inclusive
        const keys = [];
        let cur = first;
        while (cur <= last) {
            keys.push(cur);
            let [y, m] = cur.split('-').map(Number);
            m++; if (m > 12) { m = 1; y++; }
            cur = `${y}-${String(m).padStart(2, '0')}`;
        }
        this.monthKeys = keys;
        this.eventMonths = keys.filter(k => buckets[k]);

        const maxTotal = Math.max(1, ...Object.values(buckets).map(b => b.total));
        this.bars = keys.map(k => {
            const b = buckets[k] || { total: 0, major: 0 };
            const pxTot = b.total > 0 ? Math.max(MIN_BAR_PX, Math.round(b.total / maxTotal * MAX_BAR_PX)) : 1;
            let pxMaj = Math.round(b.major / maxTotal * MAX_BAR_PX);
            if (pxMaj > pxTot) pxMaj = pxTot;
            const yearLabel = k.endsWith('-01') ? k.slice(0, 4) : '';
            return { key: k, pxTot, pxMaj, yearLabel };
        });
    }

    buildStatLine() {
        const line = document.getElementById('record-stat');
        if (!line) return;
        const firstYear = this.monthKeys[0].slice(0, 4);
        const lastYear = this.monthKeys[this.monthKeys.length - 1].slice(0, 4);
        const span = firstYear === lastYear ? firstYear : `${firstYear}—${lastYear}`;
        line.textContent = `${this.all.length} EVENTS · ${span}`;
    }

    /** Atlas geometry is static — build columns once; render() re-styles focus. */
    buildAtlas() {
        const section = el('section', 'atlas-section');

        const head = el('div', 'atlas-head');
        head.appendChild(el('div', 'atlas-label', 'THE WHOLE TIMELINE'));
        const hint = el('div', 'atlas-hint');
        hint.append('click a month to read it  ·  ');
        hint.appendChild(el('span', 'atlas-hint-ember', 'ember = major'));
        head.appendChild(hint);
        section.appendChild(head);

        const panel = el('div', 'atlas-panel');
        const bars = el('div', 'atlas-bars');
        const years = el('div', 'atlas-years');

        this.cols = new Map();
        this.bars.forEach(b => {
            const col = el('div', 'atlas-col');
            col.dataset.key = b.key;
            const total = (this.buckets[b.key] || { total: 0 }).total;
            col.title = total ? `${this.monthTitle(b.key)} — ${total} event${total > 1 ? 's' : ''}` : '';

            const flag = el('div', 'atlas-flag');
            const bar = el('div', 'atlas-bar');
            bar.style.height = `${b.pxTot}px`;
            const maj = el('div', 'atlas-bar-major');
            maj.style.height = `${b.pxMaj}px`;
            bar.appendChild(maj);
            col.append(flag, bar);

            if (this.buckets[b.key]) {
                col.classList.add('has-events');
                col.addEventListener('click', () => this.setFocus(b.key));
            }
            bars.appendChild(col);
            this.cols.set(b.key, { col, flag });

            const yr = el('div', 'atlas-year', b.yearLabel);
            years.appendChild(yr);
        });

        panel.append(bars, years);
        section.appendChild(panel);
        this.mount.appendChild(section);
    }

    /** Static dispatch scaffold; render() fills #dispatch-body each time. */
    buildDispatch() {
        this.dispatch = el('section', 'dispatch');
        this.body = el('div', 'dispatch-body');
        this.dispatch.appendChild(this.body);
        this.mount.appendChild(this.dispatch);
    }

    monthTitle(key) {
        const [y, m] = key.split('-');
        return `${MONTHS_FULL[+m - 1]} ${y}`;
    }

    // ---- state transitions ----

    setFocus(key) {
        this.focusKey = key;
        this.ebOpen = null;
        this.expandedMajor.clear();
        this.render();
    }

    navMonth(dir) {
        const idx = this.eventMonths.indexOf(this.focusKey);
        let ni = idx < 0 ? this.eventMonths.length - 1 : idx + dir;
        ni = Math.max(0, Math.min(this.eventMonths.length - 1, ni));
        this.setFocus(this.eventMonths[ni]);
    }

    // ---- render ----

    render() {
        // atlas focus styling
        this.cols.forEach(({ col, flag }, key) => {
            const on = key === this.focusKey;
            col.classList.toggle('is-focus', on);
            flag.textContent = on ? '▼' : '';
        });

        const fk = this.focusKey;
        const focus = this.all.filter(e => e.date.slice(0, 7) === fk);
        const byTier = t => focus.filter(e => tier(e) === t)
            .sort((a, b) => a.date.localeCompare(b.date));
        const major = byTier('major');
        const notable = byTier('notable');
        const minor = byTier('minor');

        this.body.replaceChildren();
        this.body.appendChild(this.renderHead(focus.length));
        this.body.appendChild(this.renderDigest(fk, focus, major, notable));
        this.body.appendChild(this.renderChips(focus, major, notable, minor));
        this.body.appendChild(this.renderMajor(major));
        this.body.appendChild(this.renderEverythingElse(major, notable, minor));
    }

    renderHead(total) {
        const head = el('div', 'dispatch-head');

        const nav = el('div', 'dispatch-nav');
        const prev = el('button', 'month-nav', '‹');
        const next = el('button', 'month-nav', '›');
        prev.type = next.type = 'button';
        prev.setAttribute('aria-label', 'Previous month with events');
        next.setAttribute('aria-label', 'Next month with events');
        prev.addEventListener('click', () => this.navMonth(-1));
        next.addEventListener('click', () => this.navMonth(1));
        const idx = this.eventMonths.indexOf(this.focusKey);
        prev.disabled = idx <= 0;
        next.disabled = idx >= this.eventMonths.length - 1;
        nav.append(prev, next);

        const title = el('h1', 'dispatch-title', this.monthTitle(this.focusKey));

        const count = el('div', 'dispatch-count');
        count.appendChild(el('span', 'dispatch-count-num', String(total)));
        count.appendChild(el('span', 'dispatch-count-lbl', 'EVENTS'));

        head.append(nav, title, count);
        return head;
    }

    renderDigest(fk, focus, major, notable) {
        let text;
        if (MONTH_SUMMARIES[fk]) {
            text = MONTH_SUMMARIES[fk];
        } else if (focus.length === 0) {
            text = 'No tracked events for this period — pick another month from the map above.';
        } else {
            text = `${focus.length} tracked event${focus.length > 1 ? 's' : ''}, ${major.length} scored major.`;
            const lead = major.slice(0, 2).map(e => e.title);
            if (lead.length) text += ' Headlined by ' + lead.join(' and ') + '.';
            else if (notable.length) text += ' A quieter month of incremental releases and partnerships.';
        }
        return el('p', 'dispatch-digest', text);
    }

    renderChips(focus, major, notable, minor) {
        const row = el('div', 'dispatch-chips');
        row.appendChild(el('span', 'chip chip-major', `${major.length} MAJOR`));
        row.appendChild(el('span', 'chip chip-notable', `${notable.length} NOTABLE`));
        row.appendChild(el('span', 'chip chip-minor', `${minor.length} MINOR`));

        // themes: top tags by frequency this month
        const counts = {};
        focus.forEach(e => (e.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
        const themes = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
        if (themes.length) {
            row.appendChild(el('span', 'chip-divider'));
            row.appendChild(el('span', 'chip-themes', themes.join('  ·  ')));
        }
        return row;
    }

    renderMajor(major) {
        const wrap = el('div', 'major-wrap');
        wrap.appendChild(el('div', 'major-label', 'MAJOR DEVELOPMENTS'));

        if (!major.length) {
            wrap.appendChild(el('div', 'major-empty', 'No major events scored this month.'));
            return wrap;
        }

        major.forEach(e => {
            const key = `${e.date}|${e.title}`;
            const open = this.expandedMajor.has(key);

            const card = el('div', 'major-card');
            card.appendChild(el('div', 'major-accent'));

            const bodyCol = el('div', 'major-col');
            const row = el('div', 'major-row');
            row.appendChild(el('div', 'major-day', dayLabel(e.date)));
            row.appendChild(el('span', 'major-toggle', open ? 'COLLAPSE ▴' : 'READ MORE ▾'));
            bodyCol.appendChild(row);

            bodyCol.appendChild(el('h3', 'major-title', e.title));
            bodyCol.appendChild(el('p', 'major-desc',
                open ? (e.description || '') : truncate(e.description)));

            const meta = orgsOrTags(e);
            if (meta) bodyCol.appendChild(el('div', 'major-meta', meta));

            card.appendChild(bodyCol);
            card.addEventListener('click', () => {
                if (this.expandedMajor.has(key)) this.expandedMajor.delete(key);
                else this.expandedMajor.add(key);
                this.render();
            });
            wrap.appendChild(card);
        });
        return wrap;
    }

    renderEverythingElse(major, notable, minor) {
        const wrap = el('div', 'eb-wrap');
        const rest = notable.length + minor.length;
        const open = this.ebOpen === null ? major.length === 0 : this.ebOpen;

        const tab = el('div', 'eb-tab');
        const left = el('div', 'eb-left');
        left.appendChild(el('span', 'eb-caret', open ? '▾' : '▸'));
        left.appendChild(el('span', 'eb-title', 'EVERYTHING ELSE'));
        left.appendChild(el('span', 'eb-count', `${rest} notable & minor updates`));
        tab.appendChild(left);
        tab.appendChild(el('span', 'eb-action', open ? 'HIDE' : 'SHOW ALL'));
        tab.addEventListener('click', () => {
            this.ebOpen = !open;
            this.render();
        });
        wrap.appendChild(tab);

        if (open) {
            const panel = el('div', 'eb-panel');
            notable.forEach(e => panel.appendChild(this.notableRow(e)));
            if (minor.length) {
                panel.appendChild(el('div', 'minor-label', 'MINOR'));
                minor.forEach(e => panel.appendChild(this.minorRow(e)));
            }
            wrap.appendChild(panel);
        }
        return wrap;
    }

    notableRow(e) {
        const row = el('div', 'eb-row notable-row');
        row.appendChild(el('div', 'eb-day', dayLabel(e.date)));
        row.appendChild(el('div', 'notable-title', e.title));
        const tag = (e.tags || [])[0] || '';
        if (tag) row.appendChild(el('div', 'notable-tag', tag));
        row.appendChild(this.tooltip(e));
        return row;
    }

    minorRow(e) {
        const row = el('div', 'eb-row minor-row');
        row.appendChild(el('div', 'eb-day', dayLabel(e.date)));
        row.appendChild(el('div', 'minor-title', e.title));
        row.appendChild(this.tooltip(e));
        return row;
    }

    tooltip(e) {
        const tip = el('div', 'eb-tip');
        const meta = orgsOrTags(e) || tier(e).toUpperCase();
        tip.appendChild(el('div', 'eb-tip-meta', meta));
        tip.appendChild(el('div', 'eb-tip-title', e.title));
        tip.appendChild(el('div', 'eb-tip-desc',
            e.description || 'No description recorded for this event.'));
        return tip;
    }
}

/**
 * Mount the Atlas + Dispatch view into #atlas-dispatch.
 * @param {Array} events – event objects from events.json
 */
export function initAtlasDispatch(events) {
    const mount = document.getElementById('atlas-dispatch');
    if (!mount || !events || !events.length) return;
    new AtlasDispatch(mount, events);
}
