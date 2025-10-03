// Birmingham Childcare Directory App

// Detect directory mode IMMEDIATELY
if (!window.ACTIVE_DIRECTORY) {
    const hash = window.location.hash;
    if (hash.startsWith('#pediatricians')) {
        window.ACTIVE_DIRECTORY = 'pediatricians';
    } else if (hash.startsWith('#dentists')) {
        window.ACTIVE_DIRECTORY = 'dentists';
    } else {
        window.ACTIVE_DIRECTORY = 'childcare';
    }
}

class ChildcareDirectory {
    constructor() {
        this.centers = [];
        this.filteredCenters = [];
        this.currentFilters = {
            search: '',
            location: [],
            ageRange: [],
            programType: [],
            accreditation: [],
            openTime: '',
            closeTime: '',
            openingsNow: null,
            acceptsSubsidy: null,
            firstClassPreK: null
        };
        this.currentSort = 'name';
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.initializeFiltersPanel();
            this.parseUrlHash();
            this.applyFilters();
            this.render();
        } catch(e) {
            console.error('Init failed:', e);
        }
    }

    async loadData() {
        try {
            // Check which directory is active
            const directory = window.ACTIVE_DIRECTORY;
            let dataFile, label;
            
            if (directory === 'pediatricians') {
                dataFile = 'data/pediatricians.json?v=2025-10-03-expanded';
                label = 'pediatrician providers';
            } else if (directory === 'dentists') {
                dataFile = 'data/dentists.json?v=2025-10-03-expanded';
                label = 'pediatric dentists';
            } else {
                dataFile = 'data/centers.json?v=2025-10-02-new';
                label = 'childcare centers';
            }
            
            const response = await fetch(dataFile);
            this.centers = await response.json();
            this.isPediatricianMode = (directory === 'pediatricians');
            this.isDentistMode = (directory === 'dentists');
            console.log(`Loaded ${this.centers.length} ${label}`);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Search input
        const heroSearch = document.getElementById('heroSearch');
        if (heroSearch) {
            heroSearch.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.debounce(() => {
                    this.applyFilters();
                    this.updateUrlHash();
                }, 300)();
            });
        }

        // Quick filters
        document.querySelectorAll('.quick-filter').forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                const value = button.dataset.value === 'true';
                
                // Toggle filter
                if (this.currentFilters[filter] === value) {
                    this.currentFilters[filter] = null;
                    button.classList.remove('active');
                } else {
                    this.currentFilters[filter] = value;
                    button.classList.add('active');
                }
                
                this.applyFilters();
                this.updateUrlHash();
            });
        });

        // Dropdown toggles
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const dropdown = toggle.nextElementSibling;
                const isOpen = toggle.getAttribute('aria-expanded') === 'true';
                
                // Close all other dropdowns
                document.querySelectorAll('.dropdown-toggle').forEach(t => {
                    if (t !== toggle) {
                        t.setAttribute('aria-expanded', 'false');
                        t.nextElementSibling.classList.remove('show');
                    }
                });
                
                // Toggle current dropdown
                toggle.setAttribute('aria-expanded', !isOpen);
                dropdown.classList.toggle('show', !isOpen);
            });
        });

        // Filter checkboxes
        document.querySelectorAll('[data-filter]').forEach(input => {
            if (input.type === 'checkbox') {
                input.addEventListener('change', () => {
                    const filterType = input.dataset.filter;
                    const value = input.value;
                    
                    if (input.checked) {
                        if (!this.currentFilters[filterType].includes(value)) {
                            this.currentFilters[filterType].push(value);
                        }
                    } else {
                        this.currentFilters[filterType] = this.currentFilters[filterType].filter(v => v !== value);
                    }
                    
                    this.updateDropdownLabel(filterType);
                    this.applyFilters();
                    this.updateUrlHash();
                });
            }
        });

        // Time filters
        document.getElementById('openTime')?.addEventListener('change', (e) => {
            this.currentFilters.openTime = e.target.value;
            this.applyFilters();
            this.updateUrlHash();
        });

        document.getElementById('closeTime')?.addEventListener('change', (e) => {
            this.currentFilters.closeTime = e.target.value;
            this.applyFilters();
            this.updateUrlHash();
        });

        // Sort selector
        document.getElementById('sortBy')?.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.applySort();
            this.render();
            this.updateUrlHash();
        });

        // Clear filters
        document.getElementById('clearFilters')?.addEventListener('click', () => {
            this.clearAllFilters();
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown')) {
                document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.nextElementSibling.classList.remove('show');
                });
            }
        });

        // Modal events
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Submit form
        document.getElementById('submitForm')?.addEventListener('submit', (e) => {
            this.handleSubmitForm(e);
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.parseUrlHash();
            this.applyFilters();
        });

        // Filters toggle
        const toggleFilters = document.getElementById('toggleFilters');
        if (toggleFilters) {
            toggleFilters.addEventListener('click', () => {
                this.toggleFiltersPanel();
            });
        }
    }

    initializeFiltersPanel() {
        // Hide childcare-only quick filters for pediatricians and dentists
        if (this.isPediatricianMode || this.isDentistMode) {
            const quickFilters = document.querySelector('.quick-filters');
            if (quickFilters) {
                quickFilters.style.display = 'none';
            }
        }
        
        // Set initial state based on screen size and session storage
        const isMobile = window.innerWidth <= 768;
        const savedState = sessionStorage.getItem('filtersCollapsed');
        let isCollapsed = false;

        if (savedState !== null) {
            isCollapsed = savedState === 'true';
        } else {
            isCollapsed = isMobile; // Default collapsed on mobile
        }

        const filtersSection = document.getElementById('filters');
        const toggleButton = document.getElementById('toggleFilters');
        
        console.log('Toggle button found:', !!toggleButton);
        console.log('Filters section found:', !!filtersSection);

        if (filtersSection && toggleButton) {
            if (isCollapsed) {
                filtersSection.classList.add('collapsed');
                toggleButton.setAttribute('aria-expanded', 'false');
                const textElement = toggleButton.querySelector('.toggle-text');
                if (textElement) textElement.textContent = 'Show Filters';
                console.log('Set to collapsed state');
            } else {
                filtersSection.classList.remove('collapsed');
                toggleButton.setAttribute('aria-expanded', 'true');
                const textElement = toggleButton.querySelector('.toggle-text');
                if (textElement) textElement.textContent = 'Hide Filters';
                console.log('Set to expanded state');
            }
        }
    }

    toggleFiltersPanel() {
        const filtersSection = document.getElementById('filters');
        const toggleButton = document.getElementById('toggleFilters');
        
        if (!filtersSection || !toggleButton) return;
        
        const isCurrentlyCollapsed = filtersSection.classList.contains('collapsed');

        if (isCurrentlyCollapsed) {
            // Expand
            filtersSection.classList.remove('collapsed');
            toggleButton.setAttribute('aria-expanded', 'true');
            const textElement = toggleButton.querySelector('.toggle-text');
            if (textElement) textElement.textContent = 'Hide Filters';
            sessionStorage.setItem('filtersCollapsed', 'false');
        } else {
            // Collapse
            filtersSection.classList.add('collapsed');
            toggleButton.setAttribute('aria-expanded', 'false');
            const textElement = toggleButton.querySelector('.toggle-text');
            if (textElement) textElement.textContent = 'Show Filters';
            sessionStorage.setItem('filtersCollapsed', 'true');
            
            // Close any open dropdowns when collapsing
            this.closeAllDropdowns();
        }

        this.updateActiveFiltersCount();
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.nextElementSibling.classList.remove('show');
        });
    }

    updateActiveFiltersCount() {
        let activeCount = 0;

        // Count active filters
        if (this.currentFilters.search) activeCount++;
        if (this.currentFilters.location.length > 0) activeCount++;
        if (this.currentFilters.ageRange.length > 0) activeCount++;
        if (this.currentFilters.programType.length > 0) activeCount++;
        if (this.currentFilters.accreditation.length > 0) activeCount++;
        if (this.currentFilters.openTime) activeCount++;
        if (this.currentFilters.closeTime) activeCount++;
        if (this.currentFilters.openingsNow !== null) activeCount++;
        if (this.currentFilters.acceptsSubsidy !== null) activeCount++;
        if (this.currentFilters.firstClassPreK !== null) activeCount++;

        const activeCountElement = document.querySelector('.active-count');
        if (activeCountElement) {
            activeCountElement.textContent = `(${activeCount})`;
            
            // Update button style based on active filters
            const toggleButton = document.getElementById('toggleFilters');
            if (toggleButton) {
                if (activeCount > 0) {
                    toggleButton.style.backgroundColor = 'var(--accent-3)';
                } else {
                    toggleButton.style.backgroundColor = 'var(--accent-2)';
                }
            }
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    applyFilters() {
        this.filteredCenters = this.centers.filter(center => {
            // Search filter - works for both directories
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                let searchableText;
                
                if (this.isPediatricianMode || this.isDentistMode) {
                    // Search pediatrician/dentist fields
                    searchableText = `${center.displayName || center.practiceName} ${center.providerName || ''} ${center.city} ${center.specialty || ''} ${center.description || ''} ${center.services || ''}`.toLowerCase();
                } else {
                    // Search childcare fields
                    searchableText = `${center.name} ${center.city} ${center.neighborhood} ${center.programs.join(' ')} ${center.blurb}`.toLowerCase();
                }
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Location filter - works for both directories
            if (this.currentFilters.location.length > 0) {
                if (!this.currentFilters.location.includes(center.city)) {
                    return false;
                }
            }

            // CHILDCARE-ONLY FILTERS
            if (!this.isPediatricianMode && !this.isDentistMode) {
                // Age range filter
                if (this.currentFilters.ageRange.length > 0) {
                    const hasMatchingAge = this.currentFilters.ageRange.some(age => 
                        center.agesServed && center.agesServed.includes(age)
                    );
                    if (!hasMatchingAge) {
                        return false;
                    }
                }

                // Program type filter
                if (this.currentFilters.programType.length > 0) {
                    const hasMatchingType = this.currentFilters.programType.some(type => 
                        center.type && center.type.includes(type)
                    );
                    if (!hasMatchingType) {
                        return false;
                    }
                }

                // Accreditation filter
                if (this.currentFilters.accreditation.length > 0) {
                    const hasMatchingAccreditation = this.currentFilters.accreditation.some(acc => {
                        if (acc === 'NAEYC') return center.accreditations && center.accreditations.includes('NAEYC');
                        if (acc === 'First Class Pre-K') return center.firstClassPreK;
                        if (acc === 'QRIS') return center.qris !== null;
                        return false;
                    });
                    if (!hasMatchingAccreditation) {
                        return false;
                    }
                }

                // Hours filters
                if (this.currentFilters.openTime) {
                    if (center.hours && center.hours.open && center.hours.open > this.currentFilters.openTime) {
                        return false;
                    }
                }

                if (this.currentFilters.closeTime) {
                    if (center.hours && center.hours.close && center.hours.close < this.currentFilters.closeTime) {
                        return false;
                    }
                }

                // Boolean filters
                if (this.currentFilters.openingsNow !== null) {
                    if (center.openingsNow !== this.currentFilters.openingsNow) {
                        return false;
                    }
                }

                if (this.currentFilters.acceptsSubsidy !== null) {
                    if (center.acceptsSubsidy !== this.currentFilters.acceptsSubsidy) {
                        return false;
                    }
                }

                if (this.currentFilters.firstClassPreK !== null) {
                    if (center.firstClassPreK !== this.currentFilters.firstClassPreK) {
                        return false;
                    }
                }
            }

            return true;
        });

        this.applySort();
        this.updateResultsCount();
        this.render();
        this.updateActiveFiltersCount();
    }

    applySort() {
        this.filteredCenters.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    // Handle both childcare (name) and pediatrician (displayName) fields
                    const nameA = (a.name || a.displayName || '').toLowerCase();
                    const nameB = (b.name || b.displayName || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                case 'tuition-low':
                    return (a.tuitionRangeMonthlyUSD?.[0] || 0) - (b.tuitionRangeMonthlyUSD?.[0] || 0);
                case 'hours-early':
                    // Only sort by hours if they have the childcare hours format
                    if (a.hours?.open && b.hours?.open) {
                        return a.hours.open.localeCompare(b.hours.open);
                    }
                    return 0;
                case 'hours-late':
                    // Only sort by hours if they have the childcare hours format
                    if (a.hours?.close && b.hours?.close) {
                        return b.hours.close.localeCompare(a.hours.close);
                    }
                    return 0;
                default:
                    return 0;
            }
        });
    }

    updateDropdownLabel(filterType) {
        const dropdown = document.querySelector(`[data-filter="${filterType}"]`).closest('.filter-dropdown');
        if (!dropdown) return;

        const toggle = dropdown.querySelector('.dropdown-toggle span');
        const selectedValues = this.currentFilters[filterType];
        
        if (selectedValues.length === 0) {
            switch (filterType) {
                case 'location':
                    toggle.textContent = 'Any Location';
                    break;
                case 'ageRange':
                    toggle.textContent = 'Any Age';
                    break;
                case 'programType':
                    toggle.textContent = 'Any Program';
                    break;
                case 'accreditation':
                    toggle.textContent = 'Any Accreditation';
                    break;
            }
        } else if (selectedValues.length === 1) {
            toggle.textContent = selectedValues[0];
        } else {
            toggle.textContent = `${selectedValues.length} selected`;
        }
    }

    updateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.textContent = this.filteredCenters.length;
        }
    }

    render() {
        const resultsGrid = document.getElementById('resultsGrid');
        const noResults = document.getElementById('noResults');

        if (this.filteredCenters.length === 0) {
            resultsGrid.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        resultsGrid.style.display = 'grid';
        noResults.style.display = 'none';

        resultsGrid.innerHTML = this.filteredCenters.map(center => this.createCenterCard(center)).join('');

        // Add event listeners to new cards
        this.setupCardEventListeners();
    }

    createCenterCard(center) {
        // If in pediatrician mode, use pediatrician card template
        if (this.isPediatricianMode) {
            return this.createPediatricianCard(center);
        }
        // If in dentist mode, use dentist card template
        if (this.isDentistMode) {
            return this.createDentistCard(center);
        }
        
        const badges = this.generateBadges(center);
        const tuitionRange = center.tuitionRangeMonthlyUSD.length === 2 
            ? `$${center.tuitionRangeMonthlyUSD[0]}-$${center.tuitionRangeMonthlyUSD[1]}/mo`
            : 'Contact for pricing';

        return `
            <article class="center-card fade-in" data-center-id="${center.id}">
                <div class="card-header">
                    <h3 class="center-name">${center.name}</h3>
                    <div class="center-location">${center.neighborhood}, ${center.city}</div>
                </div>
                
                <p class="center-blurb">${center.blurb}</p>
                
                <div class="badges">
                    ${badges}
                </div>
                
                <div class="quick-facts">
                    <div class="fact">
                        <svg class="fact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span class="fact-value">${this.formatHours(center.hours)}</span>
                    </div>
                    <div class="fact">
                        <svg class="fact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        <span class="fact-value">${tuitionRange}</span>
                    </div>
                    <div class="fact">
                        <svg class="fact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9,22 9,12 15,12 15,22"></polyline>
                        </svg>
                        <span class="fact-value">${center.agesServed.slice(0, 2).join(', ')}</span>
                    </div>
                    <div class="fact">
                        <svg class="fact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span class="fact-value">${center.phone}</span>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="card-btn card-btn-primary" onclick="app.openModal('${center.id}')">View Details</button>
                    <a href="tel:${center.phone}" class="card-btn card-btn-secondary">Call</a>
                    ${center.website ? `<a href="${center.website}" target="_blank" rel="noopener" class="card-btn card-btn-secondary">Website</a>` : ''}
                    <a href="https://maps.google.com/?q=${encodeURIComponent(center.address + ', ' + center.city + ', AL')}" target="_blank" rel="noopener" class="card-btn card-btn-secondary">Directions</a>
                </div>
            </article>
        `;
    }

    generateBadges(center) {
        const badges = [];

        if (center.openingsNow) {
            badges.push('<span class="badge badge-openings">Openings Now</span>');
        }

        if (center.waitlist) {
            badges.push('<span class="badge badge-waitlist">Waitlist</span>');
        }

        if (center.acceptsSubsidy) {
            badges.push('<span class="badge badge-subsidy">Accepts Subsidy</span>');
        }

        if (center.accreditations.includes('NAEYC')) {
            badges.push('<span class="badge badge-naeyc">NAEYC</span>');
        }

        if (center.firstClassPreK) {
            badges.push('<span class="badge badge-firstclass">First Class Pre-K</span>');
        }

        if (center.qris) {
            badges.push(`<span class="badge badge-qris">QRIS ${center.qris}</span>`);
        }

        if (center.faithBased) {
            badges.push('<span class="badge badge-faith">Faith-based</span>');
        }

        return badges.join('');
    }

    formatHours(hours) {
        if (!hours) return 'Call for hours';
        if (typeof hours === 'string') return hours;
        
        const formatTime = (time) => {
            const [hour, minute] = time.split(':').map(Number);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        };

        if (hours.open && hours.close) {
            return `${formatTime(hours.open)} - ${formatTime(hours.close)}`;
        }
        return 'Call for hours';
    }

    createPediatricianCard(provider) {
        const insurances = provider.insuranceAccepted?.slice(0, 3).join(', ') || 'Call for insurance info';
        const displayName = provider.displayName || provider.practiceName;
        const fullName = provider.providerName ? `${provider.providerName} - ${provider.practiceName}` : provider.practiceName;
        
        return `
            <article class="center-card fade-in" data-center-id="${provider.id}">
                <div class="card-header">
                    <h3 class="center-name">${displayName}</h3>
                    ${provider.providerName ? `<div class="provider-practice">${provider.practiceName}</div>` : ''}
                    <div class="center-location">${provider.city}, AL ${provider.zip}</div>
                </div>
                
                <p class="center-blurb">${provider.description || 'Pediatric care for Birmingham families.'}</p>
                
                <div class="badges">
                    ${provider.acceptingNewPatients ? '<span class="badge badge-openings">Accepting New Patients</span>' : ''}
                    ${provider.certifications?.includes('FAAP') ? '<span class="badge badge-naeyc">Board Certified</span>' : ''}
                </div>
                
                <div class="quick-facts">
                    <div class="fact">
                        <svg class="fact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span class="fact-value">${this.formatHours(provider.hours)}</span>
                    </div>
                    <div class="fact">
                        <svg class="fact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        <span class="fact-value">${insurances}</span>
                    </div>
                    <div class="fact">
                        <svg class="fact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span class="fact-value">${provider.ageRange || 'Newborn to 21'}</span>
                    </div>
                    ${provider.phone ? `
                    <div class="fact">
                        <svg class="fact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span class="fact-value">${provider.phone}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="card-actions">
                    <button class="card-btn card-btn-primary" onclick="app.openModal('${provider.id}')">View Details</button>
                    ${provider.phone ? `<a href="tel:${provider.phone}" class="card-btn card-btn-secondary">Call</a>` : ''}
                    ${provider.website ? `<a href="${provider.website}" target="_blank" rel="noopener" class="card-btn card-btn-secondary">Website</a>` : ''}
                    <a href="https://maps.google.com/?q=${encodeURIComponent(provider.address + ', ' + provider.city + ', AL')}" target="_blank" rel="noopener" class="card-btn card-btn-secondary">Directions</a>
                </div>
            </article>
        `;
    }

    createDentistCard(dentist) {
        const displayRating = dentist.rating ? `⭐ ${dentist.rating}` : '';
        const reviewsText = dentist.reviewsCount ? `(${dentist.reviewsCount} reviews)` : '';
        
        return `
            <article class="center-card fade-in" data-center-id="${dentist.id}">
                <div class="card-header">
                    <h3 class="center-name">${dentist.displayName}</h3>
                    <div class="center-location">${dentist.city}, AL ${dentist.zip || ''}</div>
                    ${displayRating ? `<div class="provider-practice">${displayRating} ${reviewsText}</div>` : ''}
                </div>
                
                <p class="center-blurb">${dentist.description || 'Pediatric dental care for Birmingham families.'}</p>
                
                <div class="badges">
                    ${dentist.specialty ? `<span class="badge badge-naeyc">${dentist.specialty}</span>` : ''}
                </div>
                
                <div class="quick-facts">
                    <div class="fact">
                        <svg class="fact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span class="fact-value">${this.formatHours(dentist.hours)}</span>
                    </div>
                    ${dentist.phone ? `
                    <div class="fact">
                        <svg class="fact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span class="fact-value">${dentist.phone}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="card-actions">
                    <button class="card-btn card-btn-primary" onclick="app.openModal('${dentist.id}')">View Details</button>
                    ${dentist.phone ? `<a href="tel:${dentist.phone}" class="card-btn card-btn-secondary">Call</a>` : ''}
                    ${dentist.website ? `<a href="${dentist.website}" target="_blank" rel="noopener" class="card-btn card-btn-secondary">Website</a>` : ''}
                    <a href="https://maps.google.com/?q=${encodeURIComponent(dentist.address)}" target="_blank" rel="noopener" class="card-btn card-btn-secondary">Directions</a>
                </div>
            </article>
        `;
    }

    setupCardEventListeners() {
        // Event delegation is already handled by onclick attributes in the template
        // This method is here for any additional card-specific event handling
    }

    openModal(centerId) {
        const center = this.centers.find(c => c.id === centerId);
        if (!center) return;

        const modal = document.getElementById('detailModal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = this.createModalContent(center);
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus management for accessibility
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.focus();
        }

        // Add schema.org structured data for the center
        this.addStructuredData(center);
    }

    createModalContent(center) {
        const badges = this.generateBadges(center);
        const tuitionRange = center.tuitionRangeMonthlyUSD.length === 2 
            ? `$${center.tuitionRangeMonthlyUSD[0]}-$${center.tuitionRangeMonthlyUSD[1]} per month`
            : 'Contact for pricing information';

        return `
            <div class="modal-header">
                <h2 class="modal-title" id="modalTitle">${center.name}</h2>
                <div class="modal-location">${center.address}, ${center.city}, AL ${center.zip}</div>
                <div class="modal-badges">${badges}</div>
            </div>
            
            <div class="modal-description">
                <p>${center.blurb}</p>
            </div>
            
            <div class="modal-details">
                <div class="detail-group">
                    <h4>Ages Served</h4>
                    <ul class="detail-list">
                        ${center.agesServed.map(age => `<li>${age}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="detail-group">
                    <h4>Programs</h4>
                    <ul class="detail-list">
                        ${center.programs.map(program => `<li>${program}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="detail-group">
                    <h4>Accreditations</h4>
                    <ul class="detail-list">
                        ${center.accreditations.map(acc => `<li>${acc}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="detail-group">
                    <h4>Hours & Tuition</h4>
                    <ul class="detail-list">
                        <li><strong>Hours:</strong> ${this.formatHours(center.hours)}</li>
                        <li><strong>Tuition:</strong> ${tuitionRange}</li>
                        <li><strong>Subsidy:</strong> ${center.acceptsSubsidy ? 'Accepted' : 'Not accepted'}</li>
                    </ul>
                </div>
            </div>
            
            <div class="contact-actions">
                <a href="tel:${center.phone}" class="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Call ${center.phone}
                </a>
                
                ${center.email ? `
                    <a href="mailto:${center.email}" class="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        Send Email
                    </a>
                ` : ''}
                
                ${center.website ? `
                    <a href="${center.website}" target="_blank" rel="noopener" class="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        Visit Website
                    </a>
                ` : ''}
                
                <a href="https://maps.google.com/?q=${encodeURIComponent(center.address + ', ' + center.city + ', AL')}" target="_blank" rel="noopener" class="btn btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Get Directions
                </a>
            </div>
        `;
    }

    closeModal() {
        const modal = document.getElementById('detailModal');
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Remove any structured data that was added
        const existingScript = document.querySelector('script[data-schema="childcare"]');
        if (existingScript) {
            existingScript.remove();
        }
    }

    addStructuredData(center) {
        // Remove existing structured data
        const existingScript = document.querySelector('script[data-schema="childcare"]');
        if (existingScript) {
            existingScript.remove();
        }

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "ChildCare",
            "name": center.name,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": center.address,
                "addressLocality": center.city,
                "addressRegion": "AL",
                "postalCode": center.zip,
                "addressCountry": "US"
            },
            "telephone": center.phone,
            "openingHours": `Mo-Fr ${center.hours.open}-${center.hours.close}`,
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": center.latitude,
                "longitude": center.longitude
            }
        };

        if (center.website) {
            structuredData.sameAs = center.website;
        }

        if (center.email) {
            structuredData.email = center.email;
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-schema', 'childcare');
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    clearAllFilters() {
        // Reset all filters
        this.currentFilters = {
            search: '',
            location: [],
            ageRange: [],
            programType: [],
            accreditation: [],
            openTime: '',
            closeTime: '',
            openingsNow: null,
            acceptsSubsidy: null,
            firstClassPreK: null
        };

        // Reset UI elements
        document.getElementById('heroSearch').value = '';
        
        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset dropdowns
        document.querySelectorAll('.dropdown-toggle span').forEach((span, index) => {
            const labels = ['Any Location', 'Any Age', 'Any Program', 'Any Accreditation'];
            if (labels[index]) {
                span.textContent = labels[index];
            }
        });

        // Reset time selects
        document.getElementById('openTime').value = '';
        document.getElementById('closeTime').value = '';

        // Reset quick filters
        document.querySelectorAll('.quick-filter').forEach(button => {
            button.classList.remove('active');
        });

        // Reset sort
        this.currentSort = 'name';
        document.getElementById('sortBy').value = 'name';

        // Close all dropdowns
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.nextElementSibling.classList.remove('show');
        });

        // Update URL and apply filters
        this.updateUrlHash();
        this.applyFilters();
        this.updateActiveFiltersCount();
    }

    handleSubmitForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Create mailto link with form data
        const subject = encodeURIComponent('New Childcare Center Submission');
        const body = encodeURIComponent(`
New Childcare Center Submission:

Name: ${data.centerName}
Phone: ${data.centerPhone}
Address: ${data.centerAddress}
City: ${data.centerCity}
Email: ${data.centerEmail || 'Not provided'}
Website: ${data.centerWebsite || 'Not provided'}
Additional Information: ${data.centerNotes || 'None provided'}

Please review and add to the directory if appropriate.
        `.trim());

        const mailtoLink = `mailto:hello@example.com?subject=${subject}&body=${body}`;
        window.open(mailtoLink);

        // Show success message
        alert('Thank you! Your submission has been prepared for email. Please send the email to complete your submission.');
        
        // Reset form
        e.target.reset();
    }

    updateUrlHash() {
        const params = new URLSearchParams();
        
        Object.keys(this.currentFilters).forEach(key => {
            const value = this.currentFilters[key];
            if (value && value !== '' && value !== null) {
                if (Array.isArray(value) && value.length > 0) {
                    params.set(key, value.join(','));
                } else if (!Array.isArray(value)) {
                    params.set(key, value.toString());
                }
            }
        });

        if (this.currentSort !== 'name') {
            params.set('sort', this.currentSort);
        }

        const hashString = params.toString();
        const newHash = hashString ? `#${hashString}` : '';
        
        if (window.location.hash !== newHash) {
            history.replaceState(null, null, newHash);
        }
    }

    parseUrlHash() {
        const hash = window.location.hash.slice(1);
        if (!hash) return;

        const params = new URLSearchParams(hash);
        
        // Reset filters
        this.currentFilters = {
            search: '',
            location: [],
            ageRange: [],
            programType: [],
            accreditation: [],
            openTime: '',
            closeTime: '',
            openingsNow: null,
            acceptsSubsidy: null,
            firstClassPreK: null
        };

        // Parse parameters
        params.forEach((value, key) => {
            if (key === 'sort') {
                this.currentSort = value;
                const sortSelect = document.getElementById('sortBy');
                if (sortSelect) sortSelect.value = value;
                return;
            }

            if (Array.isArray(this.currentFilters[key])) {
                this.currentFilters[key] = value.split(',');
            } else if (['openingsNow', 'acceptsSubsidy', 'firstClassPreK'].includes(key)) {
                this.currentFilters[key] = value === 'true';
            } else {
                this.currentFilters[key] = value;
            }
        });

        // Update UI to reflect parsed filters
        this.updateUIFromFilters();
    }

    updateUIFromFilters() {
        // Update search input
        const heroSearch = document.getElementById('heroSearch');
        if (heroSearch) {
            heroSearch.value = this.currentFilters.search || '';
        }

        // Update quick filters
        document.querySelectorAll('.quick-filter').forEach(button => {
            const filter = button.dataset.filter;
            const value = button.dataset.value === 'true';
            
            if (this.currentFilters[filter] === value) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Update checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            const filterType = checkbox.dataset.filter;
            const value = checkbox.value;
            
            if (this.currentFilters[filterType] && this.currentFilters[filterType].includes(value)) {
                checkbox.checked = true;
            }
        });

        // Update dropdown labels
        ['location', 'ageRange', 'programType', 'accreditation'].forEach(filterType => {
            this.updateDropdownLabel(filterType);
        });

        // Update time selects
        const openTimeSelect = document.getElementById('openTime');
        const closeTimeSelect = document.getElementById('closeTime');
        
        if (openTimeSelect) openTimeSelect.value = this.currentFilters.openTime || '';
        if (closeTimeSelect) closeTimeSelect.value = this.currentFilters.closeTime || '';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #FEE2E2;
            color: #991B1B;
            padding: 16px 20px;
            border-radius: 8px;
            border: 1px solid #FECACA;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            max-width: 400px;
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Global functions for onclick handlers
window.clearAllFilters = function() {
    if (window.app) {
        window.app.clearAllFilters();
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChildcareDirectory();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChildcareDirectory;
}