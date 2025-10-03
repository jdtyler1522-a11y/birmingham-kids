class AuthManager {
    constructor() {
        this.user = null;
        this.favorites = new Map();
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkAuthStatus();
    }

    setupEventListeners() {
        const loginButton = document.getElementById('loginButton');
        const logoutButton = document.getElementById('logoutButton');
        const userAvatar = document.getElementById('userAvatar');
        const userMenu = document.getElementById('userMenu');

        if (loginButton) {
            loginButton.addEventListener('click', () => this.login());
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.logout());
        }

        if (userAvatar) {
            userAvatar.addEventListener('click', () => {
                userMenu.classList.toggle('active');
            });
        }

        document.addEventListener('click', (e) => {
            if (userMenu && !userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/user', {
                credentials: 'include'
            });

            if (response.ok) {
                this.user = await response.json();
                this.updateUI(true);
                await this.loadFavorites();
            } else {
                this.user = null;
                this.updateUI(false);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.user = null;
            this.updateUI(false);
        }
    }

    updateUI(isAuthenticated) {
        const loginButton = document.getElementById('loginButton');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');

        if (isAuthenticated && this.user) {
            loginButton.style.display = 'none';
            userMenu.style.display = 'block';
            
            if (userName) {
                const fullName = [this.user.firstName, this.user.lastName].filter(Boolean).join(' ');
                userName.textContent = fullName || 'User';
            }
            
            if (userEmail && this.user.email) {
                userEmail.textContent = this.user.email;
            }
        } else {
            loginButton.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }

    login() {
        window.location.href = '/api/login';
    }

    logout() {
        window.location.href = '/api/logout';
    }

    async loadFavorites() {
        if (!this.user) return;

        try {
            const response = await fetch('/api/favorites', {
                credentials: 'include'
            });

            if (response.ok) {
                const favorites = await response.json();
                this.favorites.clear();
                
                for (const fav of favorites) {
                    const key = `${fav.directory}:${fav.listingId}`;
                    this.favorites.set(key, fav);
                }

                this.notifyFavoritesLoaded();
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

    async addFavorite(directory, listingId) {
        if (!this.user) {
            if (confirm('Please sign in to save favorites. Would you like to sign in now?')) {
                this.login();
            }
            return false;
        }

        try {
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ directory, listingId })
            });

            if (response.ok) {
                const favorite = await response.json();
                if (favorite) {
                    const key = `${directory}:${listingId}`;
                    this.favorites.set(key, favorite);
                    return true;
                } else {
                    console.log('Favorite already exists');
                    await this.loadFavorites();
                    return true;
                }
            } else if (response.status === 409) {
                console.log('Favorite already exists');
                await this.loadFavorites();
                return true;
            } else {
                console.error('Failed to add favorite');
                return false;
            }
        } catch (error) {
            console.error('Error adding favorite:', error);
            return false;
        }
    }

    async removeFavorite(directory, listingId) {
        if (!this.user) return false;

        try {
            const response = await fetch('/api/favorites', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ directory, listingId })
            });

            if (response.ok) {
                const key = `${directory}:${listingId}`;
                this.favorites.delete(key);
                return true;
            } else {
                console.error('Failed to remove favorite');
                return false;
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            return false;
        }
    }

    isFavorite(directory, listingId) {
        const key = `${directory}:${listingId}`;
        return this.favorites.has(key);
    }

    notifyFavoritesLoaded() {
        window.dispatchEvent(new CustomEvent('favoritesLoaded', {
            detail: { favorites: Array.from(this.favorites.values()) }
        }));
    }

    isAuthenticated() {
        return this.user !== null;
    }
}

window.authManager = new AuthManager();
