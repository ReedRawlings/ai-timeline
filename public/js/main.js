// Timeline filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    const tagFilter = document.getElementById('tag-filter');
    const organizationFilter = document.getElementById('organization-filter');
    const yearFilter = document.getElementById('year-filter');
    const timelineItems = document.querySelectorAll('.timeline-item');

    // Filter function
    function filterTimeline() {
        const selectedTag = tagFilter.value;
        const selectedOrganization = organizationFilter.value;
        const selectedYear = yearFilter.value;

        timelineItems.forEach(item => {
            const itemTags = item.dataset.tags ? item.dataset.tags.split(' ') : [];
            const itemOrganizations = item.dataset.organizations ? item.dataset.organizations.split(' ') : [];
            const itemYear = item.dataset.year;

            const tagMatch = !selectedTag || itemTags.includes(selectedTag);
            const organizationMatch = !selectedOrganization || itemOrganizations.includes(selectedOrganization);
            const yearMatch = !selectedYear || itemYear === selectedYear;

            if (tagMatch && organizationMatch && yearMatch) {
                item.style.display = 'block';
                item.style.opacity = '1';
            } else {
                item.style.display = 'none';
                item.style.opacity = '0';
            }
        });

        // Update URL with filter parameters
        updateURL();
    }

    // Update URL with current filters
    function updateURL() {
        const params = new URLSearchParams();
        if (tagFilter.value) params.set('tag', tagFilter.value);
        if (organizationFilter.value) params.set('org', organizationFilter.value);
        if (yearFilter.value) params.set('year', yearFilter.value);

        const newURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', newURL);
    }

    // Load filters from URL on page load
    function loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('tag')) tagFilter.value = params.get('tag');
        if (params.get('org')) organizationFilter.value = params.get('org');
        if (params.get('year')) yearFilter.value = params.get('year');
        
        if (params.get('tag') || params.get('org') || params.get('year')) {
            filterTimeline();
        }
    }

    // Add event listeners
    if (tagFilter) tagFilter.addEventListener('change', filterTimeline);
    if (organizationFilter) organizationFilter.addEventListener('change', filterTimeline);
    if (yearFilter) yearFilter.addEventListener('change', filterTimeline);

    // Load filters from URL
    loadFiltersFromURL();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading animation for timeline items
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    timelineItems.forEach(item => {
        observer.observe(item);
    });
});

// Mobile menu toggle (if needed)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// Search functionality (optional enhancement)
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const timelineItems = document.querySelectorAll('.timeline-item');

        timelineItems.forEach(item => {
            const title = item.querySelector('.timeline-title').textContent.toLowerCase();
            const description = item.querySelector('.timeline-description').textContent.toLowerCase();
            const tags = item.dataset.tags ? item.dataset.tags.toLowerCase() : '';

            if (title.includes(searchTerm) || description.includes(searchTerm) || tags.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// Initialize search if search input exists
document.addEventListener('DOMContentLoaded', initSearch); 