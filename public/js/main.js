// Timeline interaction functionality
document.addEventListener('DOMContentLoaded', function() {
    const eventCards = document.querySelectorAll('.event-card');
    
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
            // Count only events from visible groups
            let visibleCount = 0;
            eventCards.forEach(card => {
                const parentGroup = card.closest('.timeline-group');
                if (parentGroup && parentGroup.style.display !== 'none') {
                    visibleCount++;
                }
            });
        },
        
        collectAllOptions() {
            // Collect all unique values from event cards
            eventCards.forEach(card => {
                // Models
                const models = card.getAttribute('data-models');
                if (models) {
                    models.split('|').forEach(model => this.allOptions.models.add(model));
                }
                
                // Organizations
                const organizations = card.getAttribute('data-organizations');
                if (organizations) {
                    organizations.split('|').forEach(org => this.allOptions.organizations.add(org));
                }
                
                // Key Figures
                const keyFigures = card.getAttribute('data-key-figures');
                if (keyFigures) {
                    keyFigures.split('|').forEach(figure => this.allOptions.keyFigures.add(figure));
                }
                
                // Impact Areas
                const impactAreas = card.getAttribute('data-impact-areas');
                if (impactAreas) {
                    impactAreas.split('|').forEach(area => this.allOptions.impactAreas.add(area));
                }
                
                // Tags
                const tags = card.getAttribute('data-tags');
                if (tags) {
                    tags.split('|').forEach(tag => this.allOptions.tags.add(tag));
                }
            });
        },
        
        bindEvents() {
            // Bind filter change events
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
            
            // Bind clear filters button
            document.getElementById('clear-filters').addEventListener('click', () => {
                this.clearAllFilters();
            });
        },
        
        updateScaffoldedFilters() {
            // Get currently visible events from visible groups only
            const visibleEvents = Array.from(eventCards).filter(card => {
                const parentGroup = card.closest('.timeline-group');
                return !card.classList.contains('filtered-out') && 
                       parentGroup && parentGroup.style.display !== 'none';
            });
            
            // Collect available options from visible events
            const availableOptions = {
                models: new Set(),
                organizations: new Set(),
                keyFigures: new Set(),
                impactAreas: new Set(),
                tags: new Set()
            };
            
            visibleEvents.forEach(card => {
                // Models
                const models = card.getAttribute('data-models');
                if (models) {
                    models.split('|').forEach(model => availableOptions.models.add(model));
                }
                
                // Organizations
                const organizations = card.getAttribute('data-organizations');
                if (organizations) {
                    organizations.split('|').forEach(org => availableOptions.organizations.add(org));
                }
                
                // Key Figures
                const keyFigures = card.getAttribute('data-key-figures');
                if (keyFigures) {
                    keyFigures.split('|').forEach(figure => availableOptions.keyFigures.add(figure));
                }
                
                // Impact Areas
                const impactAreas = card.getAttribute('data-impact-areas');
                if (impactAreas) {
                    impactAreas.split('|').forEach(area => availableOptions.impactAreas.add(area));
                }
                
                // Tags
                const tags = card.getAttribute('data-tags');
                if (tags) {
                    tags.split('|').forEach(tag => availableOptions.tags.add(tag));
                }
            });
            
            // Update filter dropdowns with scaffolded options
            this.updateFilterDropdown('model-filter', availableOptions.models, this.filters.models);
            this.updateFilterDropdown('organization-filter', availableOptions.organizations, this.filters.organizations);
            this.updateFilterDropdown('key-figure-filter', availableOptions.keyFigures, this.filters.keyFigures);
            this.updateFilterDropdown('impact-area-filter', availableOptions.impactAreas, this.filters.impactAreas);
            this.updateFilterDropdown('tag-filter', availableOptions.tags, this.filters.tags);
        },
        
        updateFilterDropdown(filterId, availableOptions, currentValue) {
            const select = document.getElementById(filterId);
            const currentOptions = Array.from(select.options);
            
            // Keep the "All" option
            const allOption = currentOptions[0];
            
            // Clear existing options except "All"
            select.innerHTML = '';
            select.appendChild(allOption);
            
            // Add available options, sorted alphabetically
            const sortedOptions = Array.from(availableOptions).sort();
            sortedOptions.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });
            
            // Restore current selection if it's still valid
            if (currentValue && availableOptions.has(currentValue)) {
                this.isUpdatingFilters = true;
                select.value = currentValue;
                this.isUpdatingFilters = false;
            } else {
                this.isUpdatingFilters = true;
                select.value = '';
                this.isUpdatingFilters = false;
                // Update the filter state if the current value is no longer valid
                const filterKey = this.getFilterKeyFromId(filterId);
                if (filterKey) {
                    this.filters[filterKey] = '';
                }
            }
            
            // Add visual indicator if this filter is being scaffolded (has fewer options than total)
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
                    // Only count cards from the currently visible grouping mode
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
            // Apply filters first
            this.applyFilters();
            
            // Then update scaffolding without triggering additional filter changes
            this.isUpdatingFilters = true;
            this.updateScaffoldedFilters();
            this.isUpdatingFilters = false;
        },
        
        shouldShowEvent(card) {
            // Check if event matches all active filters
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
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        },
        
        hideEvent(card) {
            card.classList.add('filtered-out');
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
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
            // Reset all filter selects
            this.isUpdatingFilters = true;
            document.getElementById('model-filter').value = '';
            document.getElementById('organization-filter').value = '';
            document.getElementById('key-figure-filter').value = '';
            document.getElementById('impact-area-filter').value = '';
            document.getElementById('tag-filter').value = '';
            this.isUpdatingFilters = false;
            
            // Reset filter state
            this.filters = {
                models: '',
                organizations: '',
                keyFigures: '',
                impactAreas: '',
                tags: ''
            };
            
            // Show all events
            const eventCards = document.querySelectorAll('.event-card');
            let visibleCount = 0;
            eventCards.forEach(card => {
                this.showEvent(card);
                // Only count cards from the currently visible grouping mode
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
    
    // Stack events that occur on the same day or within a short time window
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
            
            // Group events by date (same day)
            const eventsByDate = {};
            eventDates.forEach(eventData => {
                const dateKey = eventData.dateStr;
                if (!eventsByDate[dateKey]) {
                    eventsByDate[dateKey] = [];
                }
                eventsByDate[dateKey].push(eventData);
            });
            
            // Apply stacking classes to events on the same day
            Object.values(eventsByDate).forEach(dateEvents => {
                if (dateEvents.length > 1) {
                    dateEvents.forEach((eventData, index) => {
                        const element = eventData.element;
                        element.classList.add('stacked-event');
                        element.classList.add(`stack-${index + 1}`);
                        element.style.zIndex = 10 + index;
                        
                        // Add a subtle offset for visual separation
                        if (index > 0) {
                            element.style.marginTop = `${index * 4}px`;
                        }
                    });
                }
            });
        });
    }
    
    // Add keyboard navigation for timeline
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
                // Navigate to previous group
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
                // Navigate to next group
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
                    // Focus the card to show hover state
                    eventCards[currentIndex].focus();
                }
                break;
        }
    });
    
    // Add loading animation for timeline
    window.addEventListener('load', function() {
        const timeline = document.querySelector('.timeline');
        if (timeline) {
            timeline.style.opacity = '0';
            timeline.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                timeline.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                timeline.style.opacity = '1';
                timeline.style.transform = 'translateY(0)';
                
                // Stack close events after animation
                setTimeout(stackCloseEvents, 100);
            }, 100);
        }
    });
    
    // Add hover effect for focus state (for keyboard users)
    eventCards.forEach(card => {
        card.addEventListener('focus', function() {
            // Add a subtle focus indicator
            this.style.outline = '2px solid #667eea';
            this.style.outlineOffset = '2px';
        });
        
        card.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // Prevent hover effects on touch devices
    let isTouchDevice = false;
    
    function detectTouchDevice() {
        isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            // Add touch-specific interactions
            eventCards.forEach(card => {
                card.addEventListener('touchstart', function() {
                    // Add a class to show expanded state on touch
                    this.classList.add('touch-expanded');
                });
                
                card.addEventListener('touchend', function() {
                    // Remove the class after a delay
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

    // Grab-and-drag horizontal scrolling for timeline
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
            const walk = (x - startX) * 1.2; // scroll-fast
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
        // Mouse wheel horizontal scroll for timeline
        timelineContainer.addEventListener('wheel', function(e) {
            if (e.deltaY === 0) return;
            // Only scroll horizontally if there is overflow
            if (this.scrollWidth > this.clientWidth) {
                e.preventDefault();
                this.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }

    // Portal overlay for event cards
    function createEventOverlay(card, eventData) {
        // Remove any existing overlay
        const existing = document.getElementById('event-card-portal-overlay');
        if (existing) existing.remove();

        // Create overlay element
        const overlay = document.createElement('div');
        overlay.id = 'event-card-portal-overlay';
        overlay.style.position = 'absolute';
        overlay.style.zIndex = '9999';
        const overlayWidth = 400; // wider overlay for better readability
        overlay.style.minWidth = overlayWidth + 'px';
        overlay.style.maxWidth = overlayWidth + 'px';
        overlay.style.width    = overlayWidth + 'px';
        overlay.style.padding = '16px';
        overlay.style.borderRadius = '12px';
        overlay.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
        overlay.style.border = '2px solid #764ba2';
        overlay.style.background = 'white';
        overlay.style.pointerEvents = 'auto';
        overlay.style.transition = 'opacity 0.2s';

        // Fill overlay content
        overlay.innerHTML = eventData;

        document.body.appendChild(overlay);

        // Position overlay over the card
        const rect = card.getBoundingClientRect();
        overlay.style.left = `${rect.left + window.scrollX + rect.width / 2 - overlayWidth / 2}px`;
        overlay.style.top = `${rect.top + window.scrollY - 10}px`;

        // Remove overlay on mouseleave/blur
        function removeOverlay() {
            overlay.remove();
            overlay.removeEventListener('mouseleave', removeOverlay);
            card.removeEventListener('blur', removeOverlay);
        }
        overlay.addEventListener('mouseleave', removeOverlay);
        card.addEventListener('blur', removeOverlay);
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

    // We are already inside DOMContentLoaded, so call directly
    attachEventCardOverlays();

    // === Grouping toggle (Month / Week) ===
    function isoWeekStart(d) {
        const day = (d.getDay() + 6) % 7; // 0 becomes Monday
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
            const key = start.toISOString().slice(0, 10); // YYYY-MM-DD
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key).push(card.cloneNode(true));
        });

        [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).forEach(([key, clones]) => {
            const group = document.createElement('div');
            group.className = 'timeline-group weekly-group';
            group.style.display = 'none'; // hidden until toggled

            const label = document.createElement('div');
            label.className = 'group-label';
            label.textContent = `${new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

            const eventsWrap = document.createElement('div');
            eventsWrap.className = 'group-events';
            clones.forEach(c => eventsWrap.appendChild(c));

            group.append(label, eventsWrap);
            timeline.appendChild(group);
        });

        // Activate overlays for the cloned cards
        attachEventCardOverlays();
    }

    // Build weekly groups once after initial rendering
    buildWeeklyGroups();

    // Toggle logic
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
        
        // Update event counter after grouping change
        filterSystem.applyFilters();
    }

    if (groupingSelect) {
        groupingSelect.addEventListener('change', (e) => applyGrouping(e.target.value));
        // Initialize on load based on stored preference
        applyGrouping(localStorage.getItem('aiTimelineGrouping') || 'month');
    }
}); 