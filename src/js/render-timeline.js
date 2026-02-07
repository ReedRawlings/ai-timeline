/**
 * render-timeline.js
 * Replaces Hugo's Go template logic — reads event JSON and generates
 * the same DOM structure that the existing main.js expects.
 */

/**
 * Format a Date to "Jan 2, 2006" style.
 */
function formatDate(d) {
    return d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

/**
 * Format a Date to "YYYY-MM-DD".
 */
function isoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Escape HTML entities for safe attribute embedding.
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Render all events into the #timeline element, grouped by month.
 * Populates filter dropdowns from event metadata.
 * @param {Array} events – sorted array of event objects from events.json
 */
export function renderTimeline(events) {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;

    // Collect unique values for filter dropdowns
    const sets = {
        models: new Set(),
        organizations: new Set(),
        keyFigures: new Set(),
        impactAreas: new Set(),
        tags: new Set()
    };

    // Group events by "Month YYYY"
    const groups = new Map();

    events.forEach(event => {
        const d = new Date(event.date);
        const yearMonth = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        if (!groups.has(sortKey)) {
            groups.set(sortKey, { label: yearMonth, sortKey, events: [] });
        }
        groups.get(sortKey).events.push(event);

        // Collect metadata for filters
        if (event.models) event.models.forEach(m => sets.models.add(m));
        if (event.organizations) event.organizations.forEach(o => sets.organizations.add(o));
        if (event.key_figures) event.key_figures.forEach(k => sets.keyFigures.add(k));
        if (event.impact_areas) event.impact_areas.forEach(a => sets.impactAreas.add(a));
        if (event.tags) event.tags.forEach(t => sets.tags.add(t));
    });

    // Render groups sorted by date
    const sortedKeys = [...groups.keys()].sort();

    sortedKeys.forEach(key => {
        const group = groups.get(key);
        const groupEl = document.createElement('div');
        groupEl.className = 'timeline-group monthly-group';
        groupEl.setAttribute('data-year-month', key);

        const label = document.createElement('div');
        label.className = 'group-label';
        label.textContent = group.label;

        const eventsWrap = document.createElement('div');
        eventsWrap.className = 'group-events';

        group.events.forEach(event => {
            const card = createEventCard(event);
            eventsWrap.appendChild(card);
        });

        groupEl.appendChild(label);
        groupEl.appendChild(eventsWrap);
        timeline.appendChild(groupEl);
    });

    // Populate filter dropdowns
    populateFilter('model-filter', sets.models);
    populateFilter('organization-filter', sets.organizations);
    populateFilter('key-figure-filter', sets.keyFigures);
    populateFilter('impact-area-filter', sets.impactAreas);
    populateFilter('tag-filter', sets.tags);
}

/**
 * Create a single event card DOM element with all data-* attributes.
 */
function createEventCard(event) {
    const d = new Date(event.date);
    const card = document.createElement('div');
    card.className = 'event-card';

    // Data attributes (pipe-delimited, matching Hugo output)
    card.setAttribute('data-event-date', isoDate(d));
    card.setAttribute('data-models', (event.models || []).join('|'));
    card.setAttribute('data-organizations', (event.organizations || []).join('|'));
    card.setAttribute('data-key-figures', (event.key_figures || []).join('|'));
    card.setAttribute('data-impact-areas', (event.impact_areas || []).join('|'));
    card.setAttribute('data-tags', (event.tags || []).join('|'));
    card.setAttribute('data-primary-tag', (event.tags && event.tags[0]) || '');
    card.setAttribute('data-description', escapeHtml(event.description || ''));
    card.setAttribute('data-link', event.link || '');

    // Layoff data attributes
    if (event.layoffs) {
        card.classList.add('layoff-event');
        card.setAttribute('data-layoff-ticker', event.layoffs.company || '');
        card.setAttribute('data-layoff-headcount', event.layoffs.headcount || '');
    }

    // Visible compact content
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    let compactHTML = `
        <div class="event-date">${escapeHtml(formatDate(d))}</div>
        <div class="event-title">${escapeHtml(event.title)}</div>
    `;
    if (event.layoffs && event.layoffs.headcount) {
        const count = event.layoffs.headcount.toLocaleString();
        compactHTML += `<span class="layoff-badge">-${count} jobs</span>`;
    }
    cardContent.innerHTML = compactHTML;

    // Hidden detail for overlay
    const detail = document.createElement('div');
    detail.className = 'card-detail';
    detail.style.display = 'none';

    let detailHTML = `
        <div class="event-date">${escapeHtml(formatDate(d))}</div>
        <div class="event-title">${escapeHtml(event.title)}</div>
        <div class="event-description">${escapeHtml(event.description || '')}</div>
        <div class="event-metadata">
    `;

    if (event.organizations && event.organizations.length) {
        detailHTML += `<div class="metadata-item"><span class="metadata-label">Organizations</span> <span class="metadata-value">${escapeHtml(event.organizations.join(', '))}</span></div>`;
    }
    if (event.models && event.models.length) {
        detailHTML += `<div class="metadata-item"><span class="metadata-label">Models</span> <span class="metadata-value">${escapeHtml(event.models.join(', '))}</span></div>`;
    }
    if (event.impact_areas && event.impact_areas.length) {
        detailHTML += `<div class="metadata-item"><span class="metadata-label">Impact Areas</span> <span class="metadata-value">${escapeHtml(event.impact_areas.join(', '))}</span></div>`;
    }
    if (event.key_figures && event.key_figures.length) {
        detailHTML += `<div class="metadata-item"><span class="metadata-label">Key Figures</span> <span class="metadata-value">${escapeHtml(event.key_figures.join(', '))}</span></div>`;
    }

    detailHTML += `</div>`; // close metadata

    if (event.link) {
        detailHTML += `<a href="${escapeHtml(event.link)}" class="external-link" target="_blank" rel="noopener">Read more</a>`;
    }

    detailHTML += `<div class="event-tags">`;
    if (event.tags) {
        event.tags.forEach(tag => {
            detailHTML += `<span class="tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`;
        });
    }
    detailHTML += `</div>`;

    detail.innerHTML = detailHTML;

    card.appendChild(cardContent);
    card.appendChild(detail);

    return card;
}

/**
 * Populate a <select> dropdown with sorted unique values.
 */
function populateFilter(selectId, valueSet) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const sorted = [...valueSet].sort();
    sorted.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        select.appendChild(opt);
    });
}
