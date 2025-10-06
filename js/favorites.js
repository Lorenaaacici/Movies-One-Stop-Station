/**
 * MOSS Favorites Manager - LocalStorage based
 */

const FavoritesManager = {
    STORAGE_KEY: 'moss_favorites',

    // Get all favorites
    getAll() {
        const favorites = localStorage.getItem(this.STORAGE_KEY);
        return favorites ? JSON.parse(favorites) : [];
    },

    // Add a movie to favorites
    add(movie) {
        const favorites = this.getAll();

        // Check if already exists
        if (favorites.some(fav => fav.id === movie.id)) {
            return false; // Already in favorites
        }

        // Add movie with timestamp
        favorites.push({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            overview: movie.overview,
            addedAt: new Date().toISOString()
        });

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
        return true;
    },

    // Remove a movie from favorites
    remove(movieId) {
        const favorites = this.getAll();
        const filtered = favorites.filter(fav => fav.id !== movieId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return true;
    },

    // Check if movie is in favorites
    isFavorite(movieId) {
        const favorites = this.getAll();
        return favorites.some(fav => fav.id === movieId);
    },

    // Get favorite count
    getCount() {
        return this.getAll().length;
    },

    // Clear all favorites
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// Make globally available
window.FavoritesManager = FavoritesManager;
