// Simple Directory Manager - Just handles UI switching
(function() {
    let currentDirectory = 'childcare';
    
    // Check URL hash on load
    function checkHash() {
        const hash = window.location.hash;
        if (hash.startsWith('#pediatricians')) {
            currentDirectory = 'pediatricians';
        } else {
            currentDirectory = 'childcare';
        }
        return currentDirectory;
    }
    
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
    
    // Initialize
    function init() {
        currentDirectory = checkHash();
        window.ACTIVE_DIRECTORY = currentDirectory;
        updateUI(currentDirectory);
        setupNav();
    }
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
