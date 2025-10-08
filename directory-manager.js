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
        document.querySelectorAll('.directory-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const directory = tab.dataset.directory;
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
