// Simple Directory Manager - Just handles UI switching
(function() {
    // Set directory IMMEDIATELY (before DOM ready) so app.js can use it
    const hash = window.location.hash;
    let currentDirectory = 'childcare';
    if (hash.startsWith('#pediatricians')) {
        currentDirectory = 'pediatricians';
    } else if (hash.startsWith('#dentists')) {
        currentDirectory = 'dentists';
    } else if (hash.startsWith('#therapists')) {
        currentDirectory = 'therapists';
    } else if (hash.startsWith('#mdo')) {
        currentDirectory = 'mdo';
    } else if (hash.startsWith('#photographers')) {
        currentDirectory = 'photographers';
    } else if (hash.startsWith('#activities')) {
        currentDirectory = 'activities';
    } else if (hash.startsWith('#birthday-parties')) {
        currentDirectory = 'birthday-parties';
    }
    window.ACTIVE_DIRECTORY = currentDirectory;
    
    // Update UI elements based on directory
    function updateUI(directory) {
        const config = {
            childcare: {
                title: 'Birmingham Childcare Directory',
                subtitle: 'Find quality childcare across the Birmingham metro—compare programs, locations, costs, and openings.',
                searchPlaceholder: 'Search by name, neighborhood, or keyword...',
                filtersTitle: 'Find Your Perfect Childcare',
                resultsLabel: 'centers'
            },
            pediatricians: {
                title: 'Birmingham Pediatrician Directory',
                subtitle: 'Find trusted pediatric care across the Birmingham metro—compare practices, specialties, and insurance accepted.',
                searchPlaceholder: 'Search by doctor name, practice, or specialty...',
                filtersTitle: 'Find Your Pediatrician',
                resultsLabel: 'providers'
            },
            dentists: {
                title: 'Birmingham Pediatric Dentist Directory',
                subtitle: 'Find trusted pediatric dental care across the Birmingham metro—compare practices, specialties, and patient reviews.',
                searchPlaceholder: 'Search by dentist name, practice, or location...',
                filtersTitle: 'Find Your Pediatric Dentist',
                resultsLabel: 'dentists'
            },
            therapists: {
                title: 'Birmingham Speech & OT Therapist Directory',
                subtitle: 'Find speech and occupational therapy providers across the Birmingham metro—compare specialties, services, and insurance accepted.',
                searchPlaceholder: 'Search by therapist name, specialty, or location...',
                filtersTitle: 'Find Your Therapist',
                resultsLabel: 'therapists'
            },
            mdo: {
                title: "Birmingham Mother's Day Out Directory",
                subtitle: "Find Mother's Day Out and weekday programs across the Birmingham metro—compare schedules, locations, and fees.",
                searchPlaceholder: 'Search by program name, church, or location...',
                filtersTitle: 'Find Your MDO Program',
                resultsLabel: 'programs'
            },
            photographers: {
                title: 'Birmingham Family Photographers Directory',
                subtitle: 'Find trusted family and portrait photographers across the Birmingham metro—compare specialties, styles, and portfolios.',
                searchPlaceholder: 'Search by photographer name, specialty, or location...',
                filtersTitle: 'Find Your Photographer',
                resultsLabel: 'photographers'
            },
            activities: {
                title: 'Birmingham Activities & Recreation Directory',
                subtitle: 'Find parks, playgrounds, swimming, sports, and family attractions across the Birmingham metro—discover fun activities for all ages.',
                searchPlaceholder: 'Search by activity name, category, or location...',
                filtersTitle: 'Find Activities & Recreation',
                resultsLabel: 'activities'
            },
            'birthday-parties': {
                title: 'Birmingham Birthday Party Directory',
                subtitle: 'Find birthday party venues, entertainment, decor, and services across the Birmingham metro—plan the perfect celebration.',
                searchPlaceholder: 'Search by venue, category, or service...',
                filtersTitle: 'Find Party Services',
                resultsLabel: 'party options'
            }
        }[directory];
        
        // Update hero
        const titleEl = document.getElementById('heroTitle');
        const subtitleEl = document.getElementById('heroSubtitle');
        const searchInput = document.getElementById('heroSearch');
        
        if (titleEl) titleEl.textContent = config.title;
        if (subtitleEl) subtitleEl.textContent = config.subtitle;
        if (searchInput) searchInput.placeholder = config.searchPlaceholder;

        // Update tabs
        document.querySelectorAll('.directory-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.directory === directory);
        });
    }
    
    // Setup navigation
    function setupNav() {
        // Handle dropdown menu buttons
        document.querySelectorAll('.directory-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const directory = tab.dataset.directory;
                window.location.hash = `#${directory}`;
                window.location.reload();
            });
        });
        
        // Handle landing page directory cards
        document.querySelectorAll('[data-navigate]').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const directory = card.dataset.navigate;
                window.location.hash = `#${directory}`;
                window.location.reload();
            });
        });
    }
    
    // Initialize UI after DOM is ready
    function initUI() {
        updateUI(currentDirectory);
        setupNav();
    }
    
    // Run UI setup on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
})();
