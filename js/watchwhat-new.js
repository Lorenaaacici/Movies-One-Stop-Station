// MOSS WatchWhat Page - Movie Details & Discovery System

const WatchWhat = {
    // API Configuration
    API: {
        BASE_URL: 'https://api.themoviedb.org/3',
        API_KEY: 'a07e22bc18f5cb106bfe4cc1f83ad8ed',
        IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
        BACKDROP_BASE_URL: 'https://image.tmdb.org/t/p/w1280'
    },

    // Page State
    state: {
        currentMovieId: null,
        currentCategory: 'trending',
        currentPage: 1,
        isDetailMode: false
    },

    // Initialize the page
    init() {
        console.log('🎬 Initializing WatchWhat page...');

        // Get movie ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const movieTitle = urlParams.get('movie');

        if (movieId) {
            this.state.currentMovieId = movieId;
            this.loadMovieDetails(movieId);
            this.state.isDetailMode = true;
        } else {
            this.loadDiscoveryMode();
        }

        this.setupEventListeners();
    },

    // Setup all event listeners
    setupEventListeners() {
        // Discovery filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.switchDiscoveryFilter(filter);
            });
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Load more button
        document.getElementById('load-more-discovery')?.addEventListener('click', () => {
            this.loadMoreMovies();
        });

        // Trailer button
        document.getElementById('watch-trailer-btn')?.addEventListener('click', () => {
            if (this.state.currentMovieId) {
                this.playTrailer(this.state.currentMovieId);
            }
        });

        // Review form
        document.getElementById('reviewForm')?.addEventListener('submit', (e) => {
            this.handleReviewSubmit(e);
        });
    },

    // Load movie details for specific movie
    async loadMovieDetails(movieId) {
        try {
            console.log(`Loading details for movie ID: ${movieId}`);

            // Fetch basic movie details
            const movie = await this.fetchMovieDetails(movieId);
            const credits = await this.fetchMovieCredits(movieId);
            const reviews = await this.fetchMovieReviews(movieId);

            // Update UI with movie details
            this.displayMovieHero(movie);
            this.displayMovieDetails(movie);
            this.displayCast(credits.cast);
            this.displayReviews(reviews.results);

            // Show details section, load similar movies
            document.getElementById('movie-details').style.display = 'block';
            document.getElementById('discovery-title').textContent = 'You Might Also Like';
            document.getElementById('similar-btn').style.display = 'inline-block';

            this.loadSimilarMovies(movieId);

        } catch (error) {
            console.error('Error loading movie details:', error);
            this.showError('Failed to load movie details');
        }
    },

    // Load discovery mode (no specific movie) - show discovery content
    loadDiscoveryMode() {
        console.log('Loading discovery mode...');

        // Hide movie details section
        document.getElementById('movie-details').style.display = 'none';

        // Update hero section for discovery mode
        document.getElementById('movie-title').textContent = 'Discover Movies';
        document.getElementById('movie-overview').textContent = 'Explore trending movies, popular films, and discover your next favorite movie.';

        // Set default poster for discovery mode
        document.getElementById('movie-poster').src = 'media/dune1.jpg';
        document.getElementById('movie-poster').alt = 'Movie Discovery';

        // Hide action buttons in hero
        document.getElementById('watch-trailer-btn').style.display = 'none';
        document.getElementById('main-action-btn').style.display = 'none';

        // Update discovery section
        document.getElementById('discovery-title').textContent = 'Trending Movies';
        document.getElementById('similar-btn').style.display = 'none';

        // Load trending movies by default
        this.loadDiscoveryMovies('trending');
    },

    // Fetch movie details from API
    async fetchMovieDetails(movieId) {
        const response = await fetch(
            `${this.API.BASE_URL}/movie/${movieId}?api_key=${this.API.API_KEY}&language=en-US`
        );
        if (!response.ok) throw new Error('Failed to fetch movie details');
        return response.json();
    },

    // Fetch movie credits
    async fetchMovieCredits(movieId) {
        const response = await fetch(
            `${this.API.BASE_URL}/movie/${movieId}/credits?api_key=${this.API.API_KEY}`
        );
        if (!response.ok) throw new Error('Failed to fetch credits');
        return response.json();
    },

    // Fetch movie reviews
    async fetchMovieReviews(movieId) {
        const response = await fetch(
            `${this.API.BASE_URL}/movie/${movieId}/reviews?api_key=${this.API.API_KEY}`
        );
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return response.json();
    },

    // Fetch similar movies
    async fetchSimilarMovies(movieId) {
        const response = await fetch(
            `${this.API.BASE_URL}/movie/${movieId}/similar?api_key=${this.API.API_KEY}`
        );
        if (!response.ok) throw new Error('Failed to fetch similar movies');
        return response.json();
    },

    // Fetch discovery movies
    async fetchDiscoveryMovies(category, page = 1) {
        let endpoint;
        switch(category) {
            case 'trending':
                endpoint = `/trending/movie/week?api_key=${this.API.API_KEY}&page=${page}`;
                break;
            case 'popular':
                endpoint = `/movie/popular?api_key=${this.API.API_KEY}&page=${page}`;
                break;
            case 'top_rated':
                endpoint = `/movie/top_rated?api_key=${this.API.API_KEY}&page=${page}`;
                break;
            default:
                endpoint = `/trending/movie/week?api_key=${this.API.API_KEY}&page=${page}`;
        }

        const response = await fetch(`${this.API.BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error('Failed to fetch movies');
        return response.json();
    },

    // Display movie in hero section
    displayMovieHero(movie) {
        // Update backdrop
        if (movie.backdrop_path) {
            const backdropUrl = `${this.API.BACKDROP_BASE_URL}${movie.backdrop_path}`;
            document.getElementById('hero-backdrop').style.backgroundImage = `url(${backdropUrl})`;
        }

        // Update poster
        const posterUrl = movie.poster_path
            ? `${this.API.IMAGE_BASE_URL}${movie.poster_path}`
            : 'media/dune1.jpg';
        document.getElementById('movie-poster').src = posterUrl;

        // Update movie info
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-overview').textContent = movie.overview;

        // Update metadata
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
        const runtime = movie.runtime ? `${movie.runtime} min` : '';
        const rating = movie.vote_average ? `★ ${movie.vote_average.toFixed(1)}` : '';

        document.getElementById('movie-year').textContent = year;
        document.getElementById('movie-runtime').textContent = runtime;
        document.getElementById('movie-rating').textContent = rating;

        // Update genres
        const genresContainer = document.getElementById('movie-genres');
        genresContainer.innerHTML = '';
        if (movie.genres) {
            movie.genres.forEach(genre => {
                const genreTag = document.createElement('span');
                genreTag.className = 'genre-tag';
                genreTag.textContent = genre.name;
                genresContainer.appendChild(genreTag);
            });
        }

        // Show action buttons
        document.getElementById('watch-trailer-btn').style.display = 'inline-flex';
        document.getElementById('main-action-btn').style.display = 'inline-flex';
    },

    // Display detailed movie information
    displayMovieDetails(movie) {
        document.getElementById('detailed-plot').textContent = movie.overview;
    },

    // Display cast members
    displayCast(cast) {
        const castGrid = document.getElementById('cast-grid');
        castGrid.innerHTML = '';

        cast.slice(0, 12).forEach(member => {
            const castElement = document.createElement('div');
            castElement.className = 'cast-member';

            const photoUrl = member.profile_path
                ? `${this.API.IMAGE_BASE_URL}${member.profile_path}`
                : 'https://via.placeholder.com/80x80/404040/F0E4BF?text=?';

            castElement.innerHTML = `
                <img src="${photoUrl}" alt="${member.name}" loading="lazy">
                <h4>${member.name}</h4>
                <p>${member.character}</p>
            `;

            castGrid.appendChild(castElement);
        });
    },

    // Display reviews
    displayReviews(reviews) {
        const reviewsList = document.getElementById('user-reviews');
        reviewsList.innerHTML = '';

        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p style="color: #F0E4BF; opacity: 0.7;">No reviews available yet.</p>';
            return;
        }

        reviews.slice(0, 5).forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review-item';
            reviewElement.innerHTML = `
                <div class="review-author">${review.author}</div>
                <div class="review-content">${this.truncateText(review.content, 300)}</div>
            `;
            reviewsList.appendChild(reviewElement);
        });
    },

    // Load similar movies
    async loadSimilarMovies(movieId) {
        try {
            const similarData = await this.fetchSimilarMovies(movieId);
            this.displayDiscoveryMovies(similarData.results);
        } catch (error) {
            console.error('Error loading similar movies:', error);
            this.loadDiscoveryMovies('popular'); // Fallback
        }
    },

    // Load discovery movies
    async loadDiscoveryMovies(category) {
        try {
            this.state.currentCategory = category;
            this.state.currentPage = 1;

            this.showLoading();
            const data = await this.fetchDiscoveryMovies(category, 1);
            this.displayDiscoveryMovies(data.results);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading discovery movies:', error);
            this.showError('Failed to load movies');
        }
    },

    // Display discovery movies in grid
    displayDiscoveryMovies(movies, append = false) {
        const grid = document.getElementById('discovery-grid');

        if (!append) {
            grid.innerHTML = '';
        }

        movies.forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            grid.appendChild(movieCard);
        });
    },

    // Create movie card element
    createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie card card-cinema';
        movieCard.setAttribute('data-movie-id', movie.id);

        // Determine poster URL
        const posterUrl = movie.poster_path && movie.poster_path.startsWith('/')
            ? `${this.API.IMAGE_BASE_URL}${movie.poster_path}`
            : movie.poster_path || 'media/dune1.jpg';

        // Create rating with vote count display
        const ratingText = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const voteCount = movie.vote_count ? this.formatNumber(movie.vote_count) : '0';

        // Format release date properly
        const releaseDate = movie.release_date ? new Date(movie.release_date) : null;
        const releaseYear = releaseDate ? releaseDate.getFullYear() : '';
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

        const genres = movie.genre_ids ? movie.genre_ids.slice(0, 2).map(id => genreMap[id]).filter(Boolean) : ['Movie'];
        const genreDisplay = genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('');

        movieCard.innerHTML = `
            <div class="movie-poster-container">
                <img src="${posterUrl}" alt="Poster of ${movie.title}" loading="lazy"
                     onerror="this.src='media/dune1.jpg'">
                <div class="movie-rating-overlay">
                    <span class="imdb-like-rating">★ ${ratingText}</span>
                </div>
                ${movie.vote_average >= 7.5 ? '<div class="movie-badge">Popular</div>' : ''}
            </div>

            <div class="movie-info">
                <h3 class="movie-title" title="${movie.title}">${this.truncateText(movie.title, 25)}</h3>
                <div class="movie-details">
                    ${releaseYear ? `<span class="release-year">${releaseYear}</span>` : ''}
                    <span class="genre-tags">${genreDisplay}</span>
                </div>
                <div class="movie-actions">
                    <button class="btn btn-outline movie-action-btn" onclick="WatchWhat.goToMovieDetails('${movie.id}', '${movie.title.replace(/'/g, "\\'")}')">
                        <span class="btn-icon">ℹ️</span> View Details
                    </button>
                </div>
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
                            <span class="meta-value">★ ${ratingText} (${voteCount} votes)</span>
                        </div>
                        ${formattedDate ? `<div class="meta-item">
                            <span class="meta-label">Released:</span>
                            <span class="meta-value">${formattedDate}</span>
                        </div>` : ''}
                        <div class="meta-item">
                            <span class="meta-label">Genres:</span>
                            <span class="meta-value">${genres.join(', ') || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="overlay-actions">
                        <button class="btn btn-outline btn-sm" onclick="WatchWhat.goToMovieDetails('${movie.id}', '${movie.title.replace(/'/g, "\\'")}')">
                            <span class="btn-icon">ℹ️</span> View Details
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add hover effects (same as homepage)
        movieCard.addEventListener('mouseenter', this.showMovieOverlay);
        movieCard.addEventListener('mouseleave', this.hideMovieOverlay);

        return movieCard;
    },

    // Movie overlay hover effects (same as homepage)
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

    // Navigate to movie details
    goToMovieDetails(movieId, movieTitle) {
        window.location.href = `watchwhat.html?id=${movieId}&movie=${encodeURIComponent(movieTitle)}`;
    },

    // Switch discovery filter
    switchDiscoveryFilter(filter) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Load movies for selected filter
        if (filter === 'similar' && this.state.currentMovieId) {
            this.loadSimilarMovies(this.state.currentMovieId);
        } else {
            this.loadDiscoveryMovies(filter);
        }
    },

    // Switch tab in details section
    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active panel
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-panel`).classList.add('active');
    },

    // Load more movies
    async loadMoreMovies() {
        try {
            this.state.currentPage++;
            const data = await this.fetchDiscoveryMovies(this.state.currentCategory, this.state.currentPage);
            this.displayDiscoveryMovies(data.results, true);
        } catch (error) {
            console.error('Error loading more movies:', error);
        }
    },

    // Play trailer
    async playTrailer(movieId) {
        try {
            const videosResponse = await fetch(
                `${this.API.BASE_URL}/movie/${movieId}/videos?api_key=${this.API.API_KEY}`
            );
            const videosData = await videosResponse.json();

            // Find trailer video
            const trailer = videosData.results.find(video =>
                video.type === 'Trailer' && video.site === 'YouTube'
            ) || videosData.results[0]; // Fallback to first video

            if (trailer) {
                this.showTrailerModal(trailer.key, trailer.name);
            } else {
                alert('Trailer not available for this movie.');
            }
        } catch (error) {
            console.error('Error loading trailer:', error);
            alert('Failed to load trailer.');
        }
    },

    // Show trailer modal
    showTrailerModal(videoKey, videoTitle) {
        const modal = document.createElement('div');
        modal.className = 'trailer-modal';
        modal.innerHTML = `
            <div class="trailer-modal-content">
                <div class="trailer-header">
                    <h3>${videoTitle}</h3>
                    <button class="trailer-close" onclick="this.closest('.trailer-modal').remove()">&times;</button>
                </div>
                <div class="trailer-video">
                    <iframe
                        src="https://www.youtube.com/embed/${videoKey}?autoplay=1"
                        frameborder="0"
                        allowfullscreen
                        allow="autoplay; encrypted-media">
                    </iframe>
                </div>
            </div>
        `;

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    },

    // Handle review form submission
    handleReviewSubmit(e) {
        e.preventDefault();

        const rating = document.querySelector('input[name="rating"]:checked')?.value;
        const reviewText = document.getElementById('review-text').value;

        if (!rating || !reviewText.trim()) {
            alert('Please provide both rating and review text.');
            return;
        }

        // TODO: Implement review submission
        alert('Review submitted! (Demo mode)');
        document.getElementById('reviewForm').reset();
    },

    // Utility functions
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    },

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    showLoading() {
        document.getElementById('discovery-loading').style.display = 'flex';
    },

    hideLoading() {
        document.getElementById('discovery-loading').style.display = 'none';
    },

    showError(message) {
        const grid = document.getElementById('discovery-grid');
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #F0E4BF; padding: 40px;">${message}</div>`;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    WatchWhat.init();
});

// Make WatchWhat globally available
window.WatchWhat = WatchWhat;