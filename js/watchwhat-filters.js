/**
 * MOSS Watch What - Advanced Movie Filter System (Button-based)
 * Version: 2.0 - Updated button styles
 */

console.log('🎬 WatchWhat Filters loaded - v2.0');

const WatchWhatFilters = {
    API: {
        BASE_URL: 'https://api.themoviedb.org/3',
        API_KEY: 'a07e22bc18f5cb106bfe4cc1f83ad8ed',
        IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500'
    },

    state: {
        currentPage: 1,
        totalPages: 1,
        currentFilters: {
            genre: '',
            era: '',
            rating: '',
            sort: 'popularity.desc'
        },
        movies: []
    },

    // Initialize the page
    init() {
        console.log('🎬 Initializing Watch What Filters...');
        this.setupEventListeners();
        this.loadDefaultMovies();
    },

    // Setup all event listeners
    setupEventListeners() {
        // Genre filter buttons
        document.querySelectorAll('#genre-options .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e, 'genre', '#genre-options');
            });
        });

        // Era filter buttons
        document.querySelectorAll('#era-options .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e, 'era', '#era-options');
            });
        });

        // Rating filter buttons
        document.querySelectorAll('#rating-options .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e, 'rating', '#rating-options');
            });
        });

        // Sort filter buttons
        document.querySelectorAll('#sort-options .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e, 'sort', '#sort-options');
            });
        });

        // Load More button
        document.getElementById('load-more')?.addEventListener('click', () => {
            this.loadMore();
        });
    },

    // Handle filter button click
    handleFilterClick(event, filterType, containerSelector) {
        const btn = event.target;
        const value = btn.dataset[filterType] || btn.dataset.genre || btn.dataset.era || btn.dataset.rating || btn.dataset.sort;

        // Update active state
        document.querySelectorAll(`${containerSelector} .filter-btn`).forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');

        // Update filter state
        this.state.currentFilters[filterType] = value;

        // Reset to page 1 and fetch movies
        this.state.currentPage = 1;
        this.applyFilters();
    },

    // Load default popular movies on page load
    async loadDefaultMovies() {
        console.log('🎬 Loading default popular movies...');
        document.getElementById('results-count').textContent = 'Loading popular movies...';

        this.showLoading();
        await this.fetchMovies();
    },

    // Apply filters and search
    async applyFilters() {
        console.log('🔍 Applying filters:', this.state.currentFilters);

        this.showLoading();
        await this.fetchMovies();
    },

    // Fetch movies with filters
    async fetchMovies(append = false) {
        try {
            // Build API parameters
            const params = {
                api_key: this.API.API_KEY,
                language: 'en-US',
                page: this.state.currentPage,
                sort_by: this.state.currentFilters.sort || 'popularity.desc'
            };

            // Add genre filter
            if (this.state.currentFilters.genre) {
                params.with_genres = this.state.currentFilters.genre;
            }

            // Add year/era filter
            if (this.state.currentFilters.era) {
                const [startYear, endYear] = this.state.currentFilters.era.split('-');
                params['primary_release_date.gte'] = `${startYear}-01-01`;
                params['primary_release_date.lte'] = `${endYear}-12-31`;
            }

            // Add rating filter
            if (this.state.currentFilters.rating) {
                params['vote_average.gte'] = this.state.currentFilters.rating;
                params['vote_count.gte'] = 100; // Minimum votes for credibility
            }

            // Build URL
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.API.BASE_URL}/discover/movie?${queryString}`;

            console.log('📡 Fetching:', url);

            const response = await fetch(url);
            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            console.log('✅ Received:', data.results.length, 'movies');

            this.state.totalPages = data.total_pages;
            this.state.movies = append ? [...this.state.movies, ...data.results] : data.results;

            this.displayMovies(append);
            this.updateResultsInfo(data.total_results);
            this.hideLoading();

        } catch (error) {
            console.error('❌ Error fetching movies:', error);
            this.showError('Failed to load movies. Please try again.');
            this.hideLoading();
        }
    },

    // Display movies in grid
    displayMovies(append = false) {
        const grid = document.getElementById('movie-results');

        if (!append) {
            grid.innerHTML = '';
        }

        // Get movies to display
        const moviesToDisplay = append
            ? this.state.movies.slice(this.state.movies.length - 20)
            : this.state.movies;

        moviesToDisplay.forEach(movie => {
            const card = this.createMovieCard(movie);
            grid.appendChild(card);
        });

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('load-more');
        if (this.state.currentPage < this.state.totalPages) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    },

    // Create movie card (same as homepage - with hover overlay)
    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie card card-cinema';
        card.setAttribute('data-movie-id', movie.id);

        const posterUrl = movie.poster_path
            ? `${this.API.IMAGE_BASE_URL}${movie.poster_path}`
            : 'media/default-poster.jpg';

        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const voteCount = movie.vote_count ? this.formatNumber(movie.vote_count) : '0';

        // Format release date
        const releaseDate = movie.release_date ? new Date(movie.release_date) : null;
        const formattedDate = releaseDate ? releaseDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : '';

        // Genre mapping (same as homepage)
        const genreMap = {
            28: 'Action', 35: 'Comedy', 18: 'Drama', 27: 'Horror',
            878: 'Sci-Fi', 53: 'Thriller', 10749: 'Romance', 16: 'Animation',
            12: 'Adventure', 14: 'Fantasy', 80: 'Crime', 9648: 'Mystery'
        };

        const genres = movie.genre_ids ? movie.genre_ids.slice(0, 2).map(id => genreMap[id]).filter(Boolean) : [];

        card.innerHTML = `
            <div class="movie-poster-container">
                <img src="${posterUrl}" alt="Poster of ${movie.title}" loading="lazy"
                     onerror="this.src='media/default-poster.jpg'">
                <div class="movie-rating-overlay">
                    <span class="imdb-like-rating">★ ${rating}</span>
                </div>
                ${movie.vote_average >= 7.5 ? '<div class="movie-badge">Popular</div>' : ''}
            </div>

            <div class="movie-info">
                <h3 class="movie-title" title="${movie.title}">${this.truncateText(movie.title, 25)}</h3>
            </div>

            <div class="movie-overlay">
                <div class="overlay-header">
                    <h4>${movie.title}</h4>
                    <span class="close-overlay">×</span>
                </div>
                <div class="overlay-content">
                    <p class="movie-overview">${movie.overview ? this.truncateText(movie.overview, 150) : 'No description available.'}</p>
                    <div class="movie-meta-detailed">
                        <div class="meta-item">
                            <span class="meta-label">Rating:</span>
                            <span class="meta-value">★ ${rating} (${voteCount})</span>
                        </div>
                        ${formattedDate ? `<div class="meta-item">
                            <span class="meta-label">Release:</span>
                            <span class="meta-value">${formattedDate}</span>
                        </div>` : ''}
                        ${genres.length > 0 ? `<div class="meta-item">
                            <span class="meta-label">Genre:</span>
                            <span class="meta-value">${genres.join(', ')}</span>
                        </div>` : ''}
                    </div>
                    <div class="movie-actions">
                        <button class="btn btn-outline btn-sm favorite-btn ${window.FavoritesManager && FavoritesManager.isFavorite(movie.id) ? 'is-favorite' : ''}" onclick="WatchWhatFilters.toggleFavorite(event, ${movie.id}, '${movie.title.replace(/'/g, "\\'")}', '${posterUrl}', ${movie.vote_average || 0}, '${movie.release_date || ''}', '${(movie.overview || '').replace(/'/g, "\\'")}'); return false;">
                            <svg class="icon heart-icon" width="16" height="16" viewBox="0 0 24 24" fill="${window.FavoritesManager && FavoritesManager.isFavorite(movie.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span class="fav-text">${window.FavoritesManager && FavoritesManager.isFavorite(movie.id) ? 'Saved' : 'Save'}</span>
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="window.location.href='movie-details.html?id=${movie.id}'">
                            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            View Details
                        </button>
                        ${this.createOverlayBookingButton(movie)}
                    </div>
                </div>
            </div>
        `;

        // Add hover effects (same as homepage)
        card.addEventListener('mouseenter', this.showMovieOverlay);
        card.addEventListener('mouseleave', this.hideMovieOverlay);

        return card;
    },

    // Movie overlay hover effects
    showMovieOverlay(event) {
        const overlay = event.currentTarget.querySelector('.movie-overlay');
        if (overlay) {
            overlay.style.opacity = '1';
        }
    },

    hideMovieOverlay(event) {
        const overlay = event.currentTarget.querySelector('.movie-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
        }
    },

    // Format number (for vote count)
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // Load more movies
    async loadMore() {
        this.state.currentPage++;
        this.showLoading();
        await this.fetchMovies(true);
    },

    // Update results count
    updateResultsInfo(totalResults) {
        const resultsCount = document.getElementById('results-count');
        resultsCount.textContent = `Found ${totalResults.toLocaleString()} movies`;
    },

    // Show loading state
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'flex';
    },

    // Hide loading state
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    },

    // Show error message
    showError(message) {
        const grid = document.getElementById('movie-results');
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <p style="font-size: 18px; margin-bottom: 10px;">❌ ${message}</p>
            </div>
        `;
    },

    // Utility: Truncate text
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    // Create overlay booking button (same logic as homepage)
    createOverlayBookingButton(movie) {
        const status = this.getMovieBookingStatus(movie);

        if (!status.canBook) {
            return ''; // No booking button for old/far-future movies
        }

        if (status.type === 'upcoming') {
            return `<button class="btn btn-secondary btn-sm" onclick="WatchWhatFilters.preorderMovie('${movie.title.replace(/'/g, "\\'")}', '${movie.id}')">
                <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
                Pre-order Tickets
            </button>`;
        } else {
            return `<button class="btn btn-primary btn-sm" onclick="WatchWhatFilters.bookMovie('${movie.title.replace(/'/g, "\\'")}', '${movie.id}')">
                <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="8" width="20" height="12" rx="2" ry="2"></rect>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="18" y1="1" x2="18" y2="4"></line>
                </svg>
                Book Tickets
            </button>`;
        }
    },

    // Get movie booking status based on release date
    getMovieBookingStatus(movie) {
        if (!movie.release_date) return { canBook: false, label: 'View Details', type: 'released' };

        const releaseDate = new Date(movie.release_date);
        const today = new Date();
        releaseDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const daysDiff = Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24));

        // Future movie (more than 30 days away)
        if (daysDiff > 30) {
            return { canBook: false, label: 'Coming Soon', type: 'upcoming' };
        }
        // Releasing soon (1-30 days away)
        else if (daysDiff > 0) {
            return { canBook: true, label: 'Pre-order', type: 'upcoming' };
        }
        // Now playing (within last 90 days)
        else if (daysDiff >= -90) {
            return { canBook: true, label: 'Book Now', type: 'now_playing' };
        }
        // Old movie (more than 90 days old)
        else {
            return { canBook: false, label: 'View Details', type: 'released' };
        }
    },

    // Book movie
    bookMovie(title, movieId) {
        window.location.href = `book.html?id=${movieId}&title=${encodeURIComponent(title)}`;
    },

    // Pre-order movie
    preorderMovie(title, movieId) {
        window.location.href = `book.html?id=${movieId}&title=${encodeURIComponent(title)}`;
    },

    // Toggle favorite status
    toggleFavorite(event, movieId, title, posterPath, voteAverage, releaseDate, overview) {
        event.stopPropagation(); // Prevent card click

        const movie = {
            id: movieId,
            title: title,
            poster_path: posterPath,
            vote_average: voteAverage,
            release_date: releaseDate,
            overview: overview
        };

        const btn = event.currentTarget;
        const icon = btn.querySelector('.heart-icon');
        const text = btn.querySelector('.fav-text');

        if (window.FavoritesManager.isFavorite(movieId)) {
            // Remove from favorites
            window.FavoritesManager.remove(movieId);
            icon.setAttribute('fill', 'none');
            text.textContent = 'Save';
            btn.classList.remove('is-favorite');
            console.log(`Removed from favorites: ${title}`);
        } else {
            // Add to favorites
            window.FavoritesManager.add(movie);
            icon.setAttribute('fill', 'currentColor');
            text.textContent = 'Saved';
            btn.classList.add('is-favorite');
            console.log(`Added to favorites: ${title}`);
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    WatchWhatFilters.init();
});
