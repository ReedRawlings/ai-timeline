// Timeline interaction functionality
document.addEventListener('DOMContentLoaded', function() {
    const eventCards = document.querySelectorAll('.event-card');
    
    // Make event cards focusable for keyboard navigation
    eventCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${card.querySelector('.event-title').textContent}`);
    });
    
    // Stack events that occur on the same day or within a short time window
    function stackCloseEvents() {
        const timelineGroups = document.querySelectorAll('.timeline-group');
        
        timelineGroups.forEach(group => {
            const events = group.querySelectorAll('.event-card');
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
        const eventCards = document.querySelectorAll('.event-card');
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
                    const prevEvents = prevGroup.querySelectorAll('.event-card');
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
                    const nextEvents = nextGroup.querySelectorAll('.event-card');
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
    
    // Add smooth scrolling for timeline navigation
    function scrollToEvent(eventId) {
        const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
        if (eventCard) {
            eventCard.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
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
}); 