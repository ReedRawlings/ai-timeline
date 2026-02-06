// Timeline interaction functionality
document.addEventListener('DOMContentLoaded', function() {
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

        // Store all available options for each filter type
        allOptions: {
            models: new Set(),
            organizations: new Set(),
            keyFigures: new Set(),
            impactAreas: new Set(),
            tags: new Set()
        },

        // Flag to prevent recursive filter updates
        isUpdatingFilters: false,

        init() {
            this.collectAllOptions();
            this.bindEvents();
            this.updateScaffoldedFilters();
            let visibleCount = 0;
            eventCards.forEach(card => {
                const parentGroup = card.closest('.timeline-group');
                if (parentGroup && parentGroup.style.display !== 'none') {
                    visibleCount++;
                }
            });
        },

        collectAllOptions() {
            eventCards.forEach(card => {
                const models = card.getAttribute('data-models');
                if (models) {
                    models.split('|').forEach(model => this.allOptions.models.add(model));
                }
                const organizations = card.getAttribute('data-organizations');
                if (organizations) {
                    organizations.split('|').forEach(org => this.allOptions.organizations.add(org));
                }
                const keyFigures = card.getAttribute('data-key-figures');
                if (keyFigures) {
                    keyFigures.split('|').forEach(figure => this.allOptions.keyFigures.add(figure));
                }
                const impactAreas = card.getAttribute('data-impact-areas');
                if (impactAreas) {
                    impactAreas.split('|').forEach(area => this.allOptions.impactAreas.add(area));
                }
                const tags = card.getAttribute('data-tags');
                if (tags) {
                    tags.split('|').forEach(tag => this.allOptions.tags.add(tag));
                }
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
                if (models) {
                    models.split('|').forEach(model => availableOptions.models.add(model));
                }
                const organizations = card.getAttribute('data-organizations');
                if (organizations) {
                    organizations.split('|').forEach(org => availableOptions.organizations.add(org));
                }
                const keyFigures = card.getAttribute('data-key-figures');
                if (keyFigures) {
                    keyFigures.split('|').forEach(figure => availableOptions.keyFigures.add(figure));
                }
                const impactAreas = card.getAttribute('data-impact-areas');
                if (impactAreas) {
                    impactAreas.split('|').forEach(area => availableOptions.impactAreas.add(area));
                }
                const tags = card.getAttribute('data-tags');
                if (tags) {
                    tags.split('|').forEach(tag => availableOptions.tags.add(tag));
                }
            });

            this.updateFilterDropdown('model-filter', availableOptions.models, this.filters.models);
            this.updateFilterDropdown('organization-filter', availableOptions.organizations, this.filters.organizations);
            this.updateFilterDropdown('key-figure-filter', availableOptions.keyFigures, this.filters.keyFigures);
            this.updateFilterDropdown('impact-area-filter', availableOptions.impactAreas, this.filters.impactAreas);
            this.updateFilterDropdown('tag-filter', availableOptions.tags, this.filters.tags);
        },

        updateFilterDropdown(filterId, availableOptions, currentValue) {
            const select = document.getElementById(filterId);
            const currentOptions = Array.from(select.options);

            const allOption = currentOptions[0];

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
                if (filterKey) {
                    this.filters[filterKey] = '';
                }
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
            const eventCards = document.querySelectorAll('.event-card');
            let visibleCount = 0;

            eventCards.forEach(card => {
                const shouldShow = this.shouldShowEvent(card);

                if (shouldShow) {
                    this.showEvent(card);
                    const parentGroup = card.closest('.timeline-group');
                    if (parentGroup && parentGroup.style.display !== 'none') {
                        visibleCount++;
                    }
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
            if (this.filters.models && !this.matchesFilter(card, 'data-models', this.filters.models)) {
                return false;
            }
            if (this.filters.organizations && !this.matchesFilter(card, 'data-organizations', this.filters.organizations)) {
                return false;
            }
            if (this.filters.keyFigures && !this.matchesFilter(card, 'data-key-figures', this.filters.keyFigures)) {
                return false;
            }
            if (this.filters.impactAreas && !this.matchesFilter(card, 'data-impact-areas', this.filters.impactAreas)) {
                return false;
            }
            if (this.filters.tags && !this.matchesFilter(card, 'data-tags', this.filters.tags)) {
                return false;
            }
            return true;
        },

        matchesFilter(card, dataAttribute, filterValue) {
            const dataValue = card.getAttribute(dataAttribute);
            if (!dataValue) return false;
            const values = dataValue.split('|');
            return values.includes(filterValue);
        },

        showEvent(card) {
            card.classList.remove('filtered-out');
        },

        hideEvent(card) {
            card.classList.add('filtered-out');
        },

        updateTimelineGroups() {
            const timelineGroups = document.querySelectorAll('.timeline-group');

            timelineGroups.forEach(group => {
                const visibleEvents = group.querySelectorAll('.event-card:not(.filtered-out)');

                if (visibleEvents.length === 0) {
                    group.classList.add('empty-group');
                } else {
                    group.classList.remove('empty-group');
                }
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

            this.filters = {
                models: '',
                organizations: '',
                keyFigures: '',
                impactAreas: '',
                tags: ''
            };

            const eventCards = document.querySelectorAll('.event-card');
            let visibleCount = 0;
            eventCards.forEach(card => {
                this.showEvent(card);
                const parentGroup = card.closest('.timeline-group');
                if (parentGroup && parentGroup.style.display !== 'none') {
                    visibleCount++;
                }
            });

            this.updateTimelineGroups();
            this.updateScaffoldedFilters();
        },
    };

    // Initialize filter system
    filterSystem.init();

    // Stack events that occur on the same day
    function stackCloseEvents() {
        const timelineGroups = document.querySelectorAll('.timeline-group');

        timelineGroups.forEach(group => {
            const events = group.querySelectorAll('.event-card:not(.filtered-out)');
            const eventDates = Array.from(events).map(event => {
                const dateStr = event.getAttribute('data-event-date');
                return {
                    element: event,
                    date: new Date(dateStr),
                    dateStr: dateStr
                };
            });

            const eventsByDate = {};
            eventDates.forEach(eventData => {
                const dateKey = eventData.dateStr;
                if (!eventsByDate[dateKey]) {
                    eventsByDate[dateKey] = [];
                }
                eventsByDate[dateKey].push(eventData);
            });

            Object.values(eventsByDate).forEach(dateEvents => {
                if (dateEvents.length > 1) {
                    dateEvents.forEach((eventData, index) => {
                        const element = eventData.element;
                        element.classList.add('stacked-event');
                        element.style.zIndex = 10 + index;

                        if (index > 0) {
                            element.style.marginTop = `${index * 4}px`;
                        }
                    });
                }
            });
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        const eventCards = document.querySelectorAll('.event-card:not(.filtered-out)');
        const currentIndex = Array.from(eventCards).findIndex(card =>
            card === document.activeElement || card.contains(document.activeElement)
        );

        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                if (currentIndex > 0) {
                    eventCards[currentIndex - 1].focus();
                }
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (currentIndex < eventCards.length - 1) {
                    eventCards[currentIndex + 1].focus();
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                const currentGroup = eventCards[currentIndex]?.closest('.timeline-group');
                if (currentGroup && currentGroup.previousElementSibling) {
                    const prevGroup = currentGroup.previousElementSibling;
                    const prevEvents = prevGroup.querySelectorAll('.event-card:not(.filtered-out)');
                    if (prevEvents.length > 0) {
                        prevEvents[0].focus();
                    }
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                const currentGroupDown = eventCards[currentIndex]?.closest('.timeline-group');
                if (currentGroupDown && currentGroupDown.nextElementSibling) {
                    const nextGroup = currentGroupDown.nextElementSibling;
                    const nextEvents = nextGroup.querySelectorAll('.event-card:not(.filtered-out)');
                    if (nextEvents.length > 0) {
                        nextEvents[0].focus();
                    }
                }
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (currentIndex >= 0) {
                    eventCards[currentIndex].focus();
                }
                break;
        }
    });

    // Loading animation + auto-scroll to newest events
    window.addEventListener('load', function() {
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

                // Auto-scroll to the newest events (right side)
                if (timelineContainer) {
                    setTimeout(() => {
                        timelineContainer.scrollTo({
                            left: timelineContainer.scrollWidth,
                            behavior: 'smooth'
                        });
                    }, 200);
                }
            }, 100);
        }
    });

    // Touch device detection
    let isTouchDevice = false;

    function detectTouchDevice() {
        isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (isTouchDevice) {
            eventCards.forEach(card => {
                card.addEventListener('touchstart', function() {
                    this.classList.add('touch-expanded');
                });

                card.addEventListener('touchend', function() {
                    setTimeout(() => {
                        this.classList.remove('touch-expanded');
                    }, 3000);
                });
            });
        }
    }

    detectTouchDevice();

    // Initialize stacking on page load
    stackCloseEvents();

    // Grab-and-drag horizontal scrolling
    const timelineContainer = document.querySelector('.timeline-container');
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

        // Accent border from primary tag
        const primaryTag = card.getAttribute('data-primary-tag');
        const accentColor = TAG_COLORS[primaryTag] || '#D4D0C8';
        overlay.style.border = '1px solid #E8E5DE';
        overlay.style.borderLeft = '4px solid ' + accentColor;

        overlay.innerHTML = eventData;

        document.body.appendChild(overlay);

        // Position overlay
        const rect = card.getBoundingClientRect();
        let left = rect.left + window.scrollX + rect.width / 2 - overlayWidth / 2;
        let top = rect.top + window.scrollY - 10;

        // Keep overlay within viewport horizontally
        const viewportWidth = window.innerWidth;
        if (left < 8) left = 8;
        if (left + overlayWidth > viewportWidth - 8) left = viewportWidth - overlayWidth - 8;

        overlay.style.left = left + 'px';
        overlay.style.top = top + 'px';

        function removeOverlay() {
            overlay.remove();
            overlay.removeEventListener('mouseleave', removeOverlay);
            card.removeEventListener('blur', removeOverlay);
            if (timelineContainer) {
                timelineContainer.removeEventListener('scroll', removeOverlay);
            }
        }
        overlay.addEventListener('mouseleave', removeOverlay);
        card.addEventListener('blur', removeOverlay);
        // Close overlay on scroll
        if (timelineContainer) {
            timelineContainer.addEventListener('scroll', removeOverlay, { once: true });
        }
    }

    // Attach overlay events to all event cards
    function attachEventCardOverlays() {
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                const detailHTML = card.querySelector('.card-detail').innerHTML;
                createEventOverlay(card, detailHTML);
            });
            card.addEventListener('focus', function() {
                const detailHTML = card.querySelector('.card-detail').innerHTML;
                createEventOverlay(card, detailHTML);
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
        const timeline = document.querySelector('.timeline');
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
            label.textContent = `${new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

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
});
