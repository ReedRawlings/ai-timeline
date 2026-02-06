/**
 * Timeline interaction functionality
 * Adapted from the Hugo theme version to work with dynamically rendered DOM.
 * Called after render-timeline.js has populated the page.
 */
export function initTimeline() {
    const eventCards = document.querySelectorAll('.event-card');

    // Tag color mapping for overlay accent
    const TAG_COLORS = {
        'Model': '#C84B31', 'Policy': '#2B5BA7', 'Social': '#B8860B',
        'Corporate': '#505050', 'Research': '#2E7D5B', 'Product': '#7B3EA3',
        'Economic': '#C87B31', 'Safety': '#B7410E', 'Partnership': '#5B7BA7',
        'Technical': '#6B6B6B', 'Legal': '#6B4F3A'
    };

    // Make event cards focusable for keyboard navigation
    eventCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${card.querySelector('.event-title').textContent}`);
    });

    // Enhanced Filter System with Scaffolded Filters
    const filterSystem = {
        filters: {
            models: '',
            organizations: '',
            keyFigures: '',
            impactAreas: '',
            tags: ''
        },

        allOptions: {
            models: new Set(),
            organizations: new Set(),
            keyFigures: new Set(),
            impactAreas: new Set(),
            tags: new Set()
        },

        isUpdatingFilters: false,

        init() {
            this.collectAllOptions();
            this.bindEvents();
            this.updateScaffoldedFilters();
        },

        collectAllOptions() {
            eventCards.forEach(card => {
                const models = card.getAttribute('data-models');
                if (models) models.split('|').forEach(m => this.allOptions.models.add(m));
                const organizations = card.getAttribute('data-organizations');
                if (organizations) organizations.split('|').forEach(o => this.allOptions.organizations.add(o));
                const keyFigures = card.getAttribute('data-key-figures');
                if (keyFigures) keyFigures.split('|').forEach(f => this.allOptions.keyFigures.add(f));
                const impactAreas = card.getAttribute('data-impact-areas');
                if (impactAreas) impactAreas.split('|').forEach(a => this.allOptions.impactAreas.add(a));
                const tags = card.getAttribute('data-tags');
                if (tags) tags.split('|').forEach(t => this.allOptions.tags.add(t));
            });
        },

        bindEvents() {
            document.getElementById('model-filter').addEventListener('change', (e) => {
                if (this.isUpdatingFilters) return;
                this.filters.models = e.target.value;
                this.applyFiltersAndUpdateScaffolding();
            });
            document.getElementById('organization-filter').addEventListener('change', (e) => {
                if (this.isUpdatingFilters) return;
                this.filters.organizations = e.target.value;
                this.applyFiltersAndUpdateScaffolding();
            });
            document.getElementById('key-figure-filter').addEventListener('change', (e) => {
                if (this.isUpdatingFilters) return;
                this.filters.keyFigures = e.target.value;
                this.applyFiltersAndUpdateScaffolding();
            });
            document.getElementById('impact-area-filter').addEventListener('change', (e) => {
                if (this.isUpdatingFilters) return;
                this.filters.impactAreas = e.target.value;
                this.applyFiltersAndUpdateScaffolding();
            });
            document.getElementById('tag-filter').addEventListener('change', (e) => {
                if (this.isUpdatingFilters) return;
                this.filters.tags = e.target.value;
                this.applyFiltersAndUpdateScaffolding();
            });
            document.getElementById('clear-filters').addEventListener('click', () => {
                this.clearAllFilters();
            });
        },

        updateScaffoldedFilters() {
            const visibleEvents = Array.from(eventCards).filter(card => {
                const parentGroup = card.closest('.timeline-group');
                return !card.classList.contains('filtered-out') &&
                       parentGroup && parentGroup.style.display !== 'none';
            });

            const availableOptions = {
                models: new Set(),
                organizations: new Set(),
                keyFigures: new Set(),
                impactAreas: new Set(),
                tags: new Set()
            };

            visibleEvents.forEach(card => {
                const models = card.getAttribute('data-models');
                if (models) models.split('|').forEach(m => availableOptions.models.add(m));
                const organizations = card.getAttribute('data-organizations');
                if (organizations) organizations.split('|').forEach(o => availableOptions.organizations.add(o));
                const keyFigures = card.getAttribute('data-key-figures');
                if (keyFigures) keyFigures.split('|').forEach(f => availableOptions.keyFigures.add(f));
                const impactAreas = card.getAttribute('data-impact-areas');
                if (impactAreas) impactAreas.split('|').forEach(a => availableOptions.impactAreas.add(a));
                const tags = card.getAttribute('data-tags');
                if (tags) tags.split('|').forEach(t => availableOptions.tags.add(t));
            });

            this.updateFilterDropdown('model-filter', availableOptions.models, this.filters.models);
            this.updateFilterDropdown('organization-filter', availableOptions.organizations, this.filters.organizations);
            this.updateFilterDropdown('key-figure-filter', availableOptions.keyFigures, this.filters.keyFigures);
            this.updateFilterDropdown('impact-area-filter', availableOptions.impactAreas, this.filters.impactAreas);
            this.updateFilterDropdown('tag-filter', availableOptions.tags, this.filters.tags);
        },

        updateFilterDropdown(filterId, availableOptions, currentValue) {
            const select = document.getElementById(filterId);
            const allOption = select.options[0];
            select.innerHTML = '';
            select.appendChild(allOption);

            const sortedOptions = Array.from(availableOptions).sort();
            sortedOptions.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });

            if (currentValue && availableOptions.has(currentValue)) {
                this.isUpdatingFilters = true;
                select.value = currentValue;
                this.isUpdatingFilters = false;
            } else {
                this.isUpdatingFilters = true;
                select.value = '';
                this.isUpdatingFilters = false;
                const filterKey = this.getFilterKeyFromId(filterId);
                if (filterKey) this.filters[filterKey] = '';
            }

            const totalOptions = this.allOptions[this.getFilterKeyFromId(filterId)];
            if (availableOptions.size < totalOptions.size) {
                select.classList.add('scaffolded');
            } else {
                select.classList.remove('scaffolded');
            }
        },

        getFilterKeyFromId(filterId) {
            const mapping = {
                'model-filter': 'models',
                'organization-filter': 'organizations',
                'key-figure-filter': 'keyFigures',
                'impact-area-filter': 'impactAreas',
                'tag-filter': 'tags'
            };
            return mapping[filterId];
        },

        applyFilters() {
            const allCards = document.querySelectorAll('.event-card');
            allCards.forEach(card => {
                if (this.shouldShowEvent(card)) {
                    this.showEvent(card);
                } else {
                    this.hideEvent(card);
                }
            });
            this.updateTimelineGroups();
        },

        applyFiltersAndUpdateScaffolding() {
            this.applyFilters();
            this.isUpdatingFilters = true;
            this.updateScaffoldedFilters();
            this.isUpdatingFilters = false;
        },

        shouldShowEvent(card) {
            if (this.filters.models && !this.matchesFilter(card, 'data-models', this.filters.models)) return false;
            if (this.filters.organizations && !this.matchesFilter(card, 'data-organizations', this.filters.organizations)) return false;
            if (this.filters.keyFigures && !this.matchesFilter(card, 'data-key-figures', this.filters.keyFigures)) return false;
            if (this.filters.impactAreas && !this.matchesFilter(card, 'data-impact-areas', this.filters.impactAreas)) return false;
            if (this.filters.tags && !this.matchesFilter(card, 'data-tags', this.filters.tags)) return false;
            return true;
        },

        matchesFilter(card, dataAttribute, filterValue) {
            const dataValue = card.getAttribute(dataAttribute);
            if (!dataValue) return false;
            return dataValue.split('|').includes(filterValue);
        },

        showEvent(card) { card.classList.remove('filtered-out'); },
        hideEvent(card) { card.classList.add('filtered-out'); },

        updateTimelineGroups() {
            document.querySelectorAll('.timeline-group').forEach(group => {
                const visible = group.querySelectorAll('.event-card:not(.filtered-out)');
                group.classList.toggle('empty-group', visible.length === 0);
            });
        },

        clearAllFilters() {
            this.isUpdatingFilters = true;
            document.getElementById('model-filter').value = '';
            document.getElementById('organization-filter').value = '';
            document.getElementById('key-figure-filter').value = '';
            document.getElementById('impact-area-filter').value = '';
            document.getElementById('tag-filter').value = '';
            this.isUpdatingFilters = false;

            this.filters = { models: '', organizations: '', keyFigures: '', impactAreas: '', tags: '' };

            document.querySelectorAll('.event-card').forEach(card => this.showEvent(card));
            this.updateTimelineGroups();
            this.updateScaffoldedFilters();
        },
    };

    filterSystem.init();

    // Stack events that occur on the same day
    function stackCloseEvents() {
        document.querySelectorAll('.timeline-group').forEach(group => {
            const events = group.querySelectorAll('.event-card:not(.filtered-out)');
            const eventsByDate = {};

            events.forEach(event => {
                const dateStr = event.getAttribute('data-event-date');
                if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
                eventsByDate[dateStr].push(event);
            });

            Object.values(eventsByDate).forEach(dateEvents => {
                if (dateEvents.length > 1) {
                    dateEvents.forEach((el, index) => {
                        el.classList.add('stacked-event');
                        el.style.zIndex = 10 + index;
                        if (index > 0) el.style.marginTop = `${index * 4}px`;
                    });
                }
            });
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        const cards = document.querySelectorAll('.event-card:not(.filtered-out)');
        const currentIndex = Array.from(cards).findIndex(card =>
            card === document.activeElement || card.contains(document.activeElement)
        );

        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                if (currentIndex > 0) cards[currentIndex - 1].focus();
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (currentIndex < cards.length - 1) cards[currentIndex + 1].focus();
                break;
            case 'ArrowUp': {
                event.preventDefault();
                const cg = cards[currentIndex]?.closest('.timeline-group');
                if (cg && cg.previousElementSibling) {
                    const prev = cg.previousElementSibling.querySelectorAll('.event-card:not(.filtered-out)');
                    if (prev.length > 0) prev[0].focus();
                }
                break;
            }
            case 'ArrowDown': {
                event.preventDefault();
                const cg2 = cards[currentIndex]?.closest('.timeline-group');
                if (cg2 && cg2.nextElementSibling) {
                    const next = cg2.nextElementSibling.querySelectorAll('.event-card:not(.filtered-out)');
                    if (next.length > 0) next[0].focus();
                }
                break;
            }
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (currentIndex >= 0) cards[currentIndex].focus();
                break;
        }
    });

    // Loading animation + auto-scroll to newest events
    const timeline = document.querySelector('.timeline');
    const timelineContainer = document.querySelector('.timeline-container');
    if (timeline) {
        timeline.style.opacity = '0';
        timeline.style.transform = 'translateY(12px)';

        setTimeout(() => {
            timeline.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            timeline.style.opacity = '1';
            timeline.style.transform = 'translateY(0)';
            setTimeout(stackCloseEvents, 100);

            if (timelineContainer) {
                setTimeout(() => {
                    timelineContainer.scrollTo({ left: timelineContainer.scrollWidth, behavior: 'smooth' });
                }, 200);
            }
        }, 100);
    }

    // Touch device detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        eventCards.forEach(card => {
            card.addEventListener('touchstart', function() { this.classList.add('touch-expanded'); });
            card.addEventListener('touchend', function() {
                setTimeout(() => this.classList.remove('touch-expanded'), 3000);
            });
        });
    }

    stackCloseEvents();

    // Grab-and-drag horizontal scrolling
    let isDown = false;
    let startX;
    let scrollLeft;

    if (timelineContainer) {
        timelineContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            timelineContainer.classList.add('grabbing');
            startX = e.pageX - timelineContainer.offsetLeft;
            scrollLeft = timelineContainer.scrollLeft;
        });
        timelineContainer.addEventListener('mouseleave', () => {
            isDown = false;
            timelineContainer.classList.remove('grabbing');
        });
        timelineContainer.addEventListener('mouseup', () => {
            isDown = false;
            timelineContainer.classList.remove('grabbing');
        });
        timelineContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - timelineContainer.offsetLeft;
            const walk = (x - startX) * 1.2;
            timelineContainer.scrollLeft = scrollLeft - walk;
        });

        // Touch support
        let touchStartX = 0;
        let touchScrollLeft = 0;
        timelineContainer.addEventListener('touchstart', (e) => {
            isDown = true;
            timelineContainer.classList.add('grabbing');
            touchStartX = e.touches[0].pageX;
            touchScrollLeft = timelineContainer.scrollLeft;
        });
        timelineContainer.addEventListener('touchend', () => {
            isDown = false;
            timelineContainer.classList.remove('grabbing');
        });
        timelineContainer.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX;
            const walk = (x - touchStartX) * 1.2;
            timelineContainer.scrollLeft = touchScrollLeft - walk;
        });

        // Mouse wheel horizontal scroll
        timelineContainer.addEventListener('wheel', function(e) {
            if (e.deltaY === 0) return;
            if (this.scrollWidth > this.clientWidth) {
                e.preventDefault();
                this.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }

    // Portal overlay for event cards
    function createEventOverlay(card, eventData) {
        const existing = document.getElementById('event-card-portal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'event-card-portal-overlay';
        overlay.style.position = 'absolute';
        overlay.style.zIndex = '9999';
        const overlayWidth = 420;
        overlay.style.minWidth = overlayWidth + 'px';
        overlay.style.maxWidth = overlayWidth + 'px';
        overlay.style.width = overlayWidth + 'px';
        overlay.style.padding = '20px 22px';
        overlay.style.borderRadius = '10px';
        overlay.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)';
        overlay.style.background = '#FFFFFF';
        overlay.style.pointerEvents = 'auto';
        overlay.style.transition = 'opacity 0.15s';
        overlay.style.fontFamily = "'DM Sans', system-ui, sans-serif";

        const primaryTag = card.getAttribute('data-primary-tag');
        const accentColor = TAG_COLORS[primaryTag] || '#D4D0C8';
        overlay.style.border = '1px solid #E8E5DE';
        overlay.style.borderLeft = '4px solid ' + accentColor;
        overlay.innerHTML = eventData;
        document.body.appendChild(overlay);

        const rect = card.getBoundingClientRect();
        let left = rect.left + window.scrollX + rect.width / 2 - overlayWidth / 2;
        let top = rect.top + window.scrollY - 10;
        const viewportWidth = window.innerWidth;
        if (left < 8) left = 8;
        if (left + overlayWidth > viewportWidth - 8) left = viewportWidth - overlayWidth - 8;
        overlay.style.left = left + 'px';
        overlay.style.top = top + 'px';

        function removeOverlay() {
            overlay.remove();
            overlay.removeEventListener('mouseleave', removeOverlay);
            card.removeEventListener('blur', removeOverlay);
            if (timelineContainer) timelineContainer.removeEventListener('scroll', removeOverlay);
        }
        overlay.addEventListener('mouseleave', removeOverlay);
        card.addEventListener('blur', removeOverlay);
        if (timelineContainer) timelineContainer.addEventListener('scroll', removeOverlay, { once: true });
    }

    // Attach overlay events to all event cards
    function attachEventCardOverlays() {
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                createEventOverlay(card, card.querySelector('.card-detail').innerHTML);
            });
            card.addEventListener('focus', function() {
                createEventOverlay(card, card.querySelector('.card-detail').innerHTML);
            });
        });
    }

    attachEventCardOverlays();

    // === Grouping toggle (Month / Week) ===
    function isoWeekStart(d) {
        const day = (d.getDay() + 6) % 7;
        const res = new Date(d);
        res.setDate(d.getDate() - day);
        res.setHours(0, 0, 0, 0);
        return res;
    }

    function buildWeeklyGroups() {
        const monthCards = Array.from(document.querySelectorAll('.monthly-group .event-card'));
        const buckets = new Map();

        monthCards.forEach(card => {
            const start = isoWeekStart(new Date(card.dataset.eventDate));
            const key = start.toISOString().slice(0, 10);
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key).push(card.cloneNode(true));
        });

        [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).forEach(([key, clones]) => {
            const group = document.createElement('div');
            group.className = 'timeline-group weekly-group';
            group.style.display = 'none';

            const label = document.createElement('div');
            label.className = 'group-label';
            label.textContent = new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

            const eventsWrap = document.createElement('div');
            eventsWrap.className = 'group-events';
            clones.forEach(c => eventsWrap.appendChild(c));

            group.append(label, eventsWrap);
            timeline.appendChild(group);
        });

        attachEventCardOverlays();
    }

    buildWeeklyGroups();

    const monthGroups = document.querySelectorAll('.monthly-group');
    const weekGroups = document.querySelectorAll('.weekly-group');
    const groupingSelect = document.getElementById('grouping-mode');

    function refreshLayout() {
        filterSystem.updateTimelineGroups();
        stackCloseEvents();
    }

    function applyGrouping(mode) {
        const byWeek = mode === 'week';
        monthGroups.forEach(g => g.style.display = byWeek ? 'none' : 'grid');
        weekGroups.forEach(g => g.style.display = byWeek ? 'grid' : 'none');
        localStorage.setItem('aiTimelineGrouping', mode);
        refreshLayout();
        filterSystem.applyFilters();
    }

    if (groupingSelect) {
        groupingSelect.addEventListener('change', (e) => applyGrouping(e.target.value));
        applyGrouping(localStorage.getItem('aiTimelineGrouping') || 'month');
    }
}
