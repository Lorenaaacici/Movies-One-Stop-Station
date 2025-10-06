// MOSS Movie Data and API Configuration
const MOSS = {
    // API Configuration (using TMDB API)
    API: {
        BASE_URL: 'https://api.themoviedb.org/3',
        API_KEY: 'a07e22bc18f5cb106bfe4cc1f83ad8ed', // Demo TMDB API key
        IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',

        // Fallback movie data for demo purposes
        FALLBACK_MOVIES: [
            {
                id: 1,
                title: "Dune: Part Two",
                poster_path: "media/dune-2 poster.jpeg",
                vote_average: 8.2,
                overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family."
            },
            {
                id: 2,
                title: "Fallout",
                poster_path: "media/fallout poster.jpg",
                vote_average: 8.4,
                overview: "In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants and bandits."
            },
            {
                id: 3,
                title: "Shogun",
                poster_path: "media/Shogun Poster.jpeg",
                vote_average: 7.8,
                overview: "An English sailor becomes part of the Japanese samurai culture in the 1600s."
            },
            {
                id: 4,
                title: "Ripley",
                poster_path: "media/Ripley poster.jpeg",
                vote_average: 9.0,
                overview: "A grifter named Ripley living in New York during the 1960s is hired by a wealthy man to bring his vagabond son home from Italy."
            }
        ]
    },

    // Movie management functions
    Movies: {
        async fetchPopularMovies(page = 1) {
            try {
                console.log(`🎬 Fetching popular movies from TMDB API (page ${page})...`);
                const response = await fetch(`${MOSS.API.BASE_URL}/movie/popular?api_key=${MOSS.API.API_KEY}&language=en-US&page=${page}`);

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ API Response received:', data.results.length, 'movies');

                    // Process and return real movie data
                    return {
                        movies: data.results.map(movie => ({
                            id: movie.id,
                            title: movie.title,
                            poster_path: movie.poster_path,
                            vote_average: movie.vote_average,
                            vote_count: movie.vote_count,
                            overview: movie.overview,
                            release_date: movie.release_date,
                            genre_ids: movie.genre_ids
                        })),
                        totalPages: data.total_pages,
                        currentPage: page
                    };
                } else {
                    throw new Error(`API Error: ${response.status}`);
                }
            } catch (error) {
                console.warn('⚠️ API fetch failed:', error.message);
                console.log('📦 Using fallback movie data...');
                return {
                    movies: MOSS.API.FALLBACK_MOVIES,
                    totalPages: 1,
                    currentPage: 1
                };
            }
        },

        async fetchNowPlaying() {
            try {
                console.log('🎭 Fetching now playing movies...');
                const response = await fetch(`${MOSS.API.BASE_URL}/movie/now_playing?api_key=${MOSS.API.API_KEY}&language=en-US&page=1&region=US`);

                if (response.ok) {
                    const data = await response.json();
                    return data.results.slice(0, 12).map(movie => ({
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path,
                        vote_average: movie.vote_average,
                        overview: movie.overview,
                        release_date: movie.release_date,
                        genre_ids: movie.genre_ids
                    }));
                }
            } catch (error) {
                console.warn('Now playing fetch failed:', error.message);
            }
            return [];
        },

        async fetchTopRated() {
            try {
                console.log('⭐ Fetching top rated movies...');
                const response = await fetch(`${MOSS.API.BASE_URL}/movie/top_rated?api_key=${MOSS.API.API_KEY}&language=en-US&page=1`);

                if (response.ok) {
                    const data = await response.json();
                    return data.results.slice(0, 12).map(movie => ({
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path,
                        vote_average: movie.vote_average,
                        overview: movie.overview,
                        release_date: movie.release_date,
                        genre_ids: movie.genre_ids
                    }));
                }
            } catch (error) {
                console.warn('Top rated fetch failed:', error.message);
            }
            return [];
        },

        async fetchUpcoming() {
            try {
                console.log('🔮 Fetching upcoming movies...');
                const response = await fetch(`${MOSS.API.BASE_URL}/movie/upcoming?api_key=${MOSS.API.API_KEY}&language=en-US&page=1`);

                if (response.ok) {
                    const data = await response.json();
                    return data.results.slice(0, 12).map(movie => ({
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path,
                        vote_average: movie.vote_average,
                        overview: movie.overview,
                        release_date: movie.release_date,
                        genre_ids: movie.genre_ids
                    }));
                }
            } catch (error) {
                console.warn('Upcoming fetch failed:', error.message);
            }
            return [];
        },

        async fetchMoviesByCategory(category, page = 1) {
            switch(category) {
                case 'popular':
                    return this.fetchPopularMovies(page);
                case 'top_rated':
                    return this.fetchTopRated();
                case 'now_playing':
                    return this.fetchNowPlaying();
                case 'upcoming':
                    return this.fetchUpcoming();
                default:
                    return this.fetchPopularMovies(page);
            }
        },

        createMovieCard(movie, category = this.currentCategory) {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie card card-cinema';
            movieCard.setAttribute('data-movie-id', movie.id);
            movieCard.setAttribute('data-category', category);

            // Determine poster URL - handle both API and local images
            const posterUrl = movie.poster_path && movie.poster_path.startsWith('/')
                ? `${MOSS.API.IMAGE_BASE_URL}${movie.poster_path}`
                : movie.poster_path || 'media/default-poster.jpg';

            // Create rating with more realistic display
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

            // Genre mapping (simplified for demo)
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
                         onerror="this.src='media/default-poster.jpg'">
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
                        <button class="btn btn-outline btn-sm movie-action-btn" onclick="MOSS.Movies.navigateToDetails('${movie.id}')">
                            <span class="btn-icon">ℹ️</span> Details
                        </button>
                        ${this.createQuickBookingButton(movie)}
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
                                <span class="meta-value">★ ${ratingText} (${voteCount})</span>
                            </div>
                            ${releaseDate ? `<div class="meta-item">
                                <span class="meta-label">Release:</span>
                                <span class="meta-value">${formattedDate}</span>
                            </div>` : ''}
                            ${genres.length > 0 ? `<div class="meta-item">
                                <span class="meta-label">Genre:</span>
                                <span class="meta-value">${genres.join(', ')}</span>
                            </div>` : ''}
                        </div>
                        <div class="movie-actions">
                            <button class="btn btn-outline btn-sm favorite-btn ${window.FavoritesManager && FavoritesManager.isFavorite(movie.id) ? 'is-favorite' : ''}" onclick="MOSS.Movies.toggleFavorite(event, ${movie.id}, '${movie.title.replace(/'/g, "\\'")}', '${posterUrl}', ${movie.vote_average || 0}, '${movie.release_date || ''}', '${(movie.overview || '').replace(/'/g, "\\'")}'); return false;">
                                <svg class="icon heart-icon" width="16" height="16" viewBox="0 0 24 24" fill="${window.FavoritesManager && FavoritesManager.isFavorite(movie.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span class="fav-text">${window.FavoritesManager && FavoritesManager.isFavorite(movie.id) ? 'Saved' : 'Save'}</span>
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="MOSS.Movies.viewDetails('${movie.title.replace(/'/g, "\\'")}', '${movie.id}')">
                                <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                View Details
                            </button>
                            ${this.createOverlayQuickBooking(movie)}
                        </div>
                    </div>
                </div>
            `;

            // Add click event to navigate to details page
            movieCard.style.cursor = 'pointer';
            movieCard.addEventListener('click', (e) => {
                // Don't navigate if clicking on buttons
                if (!e.target.closest('button')) {
                    this.navigateToDetails(movie.id);
                }
            });

            // Add improved hover effects
            movieCard.addEventListener('mouseenter', this.showMovieOverlay);
            movieCard.addEventListener('mouseleave', this.hideMovieOverlay);

            return movieCard;
        },

        // Navigate to movie details page
        navigateToDetails(movieId) {
            window.location.href = `movie-details.html?id=${movieId}`;
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
        },

        // Get movie booking status based on release date
        getMovieBookingStatus(movie) {
            if (!movie.release_date) return { canBook: false, label: 'View Details', type: 'released' };

            const releaseDate = new Date(movie.release_date);
            const today = new Date();
            // Reset time to midnight for accurate day comparison
            releaseDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const daysDiff = Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24));

            console.log(`📅 ${movie.title}: Release ${movie.release_date}, Days diff: ${daysDiff}`);

            // Future movie (more than 30 days away)
            if (daysDiff > 30) {
                return { canBook: false, label: 'Coming Soon', type: 'upcoming' };
            }
            // Upcoming movie (0-30 days in future) - can pre-order
            else if (daysDiff > 0) {
                return { canBook: true, label: 'Pre-order', type: 'upcoming' };
            }
            // Now playing (released within last 90 days)
            else if (daysDiff >= -90) {
                return { canBook: true, label: 'Book Now', type: 'now_playing' };
            }
            // Old movie (released more than 90 days ago)
            else {
                return { canBook: false, label: 'View Details', type: 'released' };
            }
        },

        // Create quick booking button (only shows if movie is bookable)
        createQuickBookingButton(movie) {
            const status = this.getMovieBookingStatus(movie);

            if (!status.canBook) {
                return ''; // No button for old/far-future movies
            }

            if (status.type === 'upcoming') {
                return `<button class="btn btn-secondary btn-sm movie-action-btn" onclick="MOSS.Movies.preorderMovie('${movie.title}', '${movie.id}')">
                    <span class="btn-icon">⏰</span> Pre-order
                </button>`;
            } else {
                return `<button class="btn btn-primary btn-sm movie-action-btn" onclick="MOSS.Movies.bookMovie('${movie.title}', '${movie.id}')">
                    <span class="btn-icon">🎫</span> Book Now
                </button>`;
            }
        },

        // Create overlay quick booking button (only shows if movie is bookable)
        createOverlayQuickBooking(movie) {
            const status = this.getMovieBookingStatus(movie);

            if (!status.canBook) {
                return ''; // No booking button for old/far-future movies
            }

            if (status.type === 'upcoming') {
                return `<button class="btn btn-secondary btn-sm" onclick="MOSS.Movies.preorderMovie('${movie.title.replace(/'/g, "\\'")}', '${movie.id}')">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                    Pre-order Tickets
                </button>`;
            } else {
                return `<button class="btn btn-primary btn-sm" onclick="MOSS.Movies.bookMovie('${movie.title.replace(/'/g, "\\'")}', '${movie.id}')">
                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="8" width="20" height="12" rx="2" ry="2"></rect>
                        <line x1="6" y1="1" x2="6" y2="4"></line>
                        <line x1="18" y1="1" x2="18" y2="4"></line>
                    </svg>
                    Book Tickets
                </button>`;
            }
        },

        formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        },

        truncateText(text, maxLength) {
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        },

        createRealisticRating(voteAverage) {
            const rating = voteAverage / 2; // Convert to 5-star scale
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let starsHtml = '';

            for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                    starsHtml += '<span class="star filled">★</span>';
                } else if (i === fullStars && hasHalfStar) {
                    starsHtml += '<span class="star half">☆</span>';
                } else {
                    starsHtml += '<span class="star empty">☆</span>';
                }
            }

            return starsHtml;
        },

        addToWishlist(movieId) {
            // Add to wishlist functionality
            console.log('Added movie', movieId, 'to wishlist');
            // You can implement local storage or API call here
            alert('Added to wishlist! (Feature coming soon)');
        },

        createStarsHtml(rating) {
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= rating) {
                    starsHtml += '<span class="star">⭐</span>';
                } else {
                    starsHtml += '<span class="star empty">☆</span>';
                }
            }
            return starsHtml;
        },

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

        viewDetails(movieTitle, movieId) {
            // Redirect to movie details page
            window.location.href = `movie-details.html?id=${movieId}`;
        },

        bookMovie(movieTitle, movieId) {
            // Redirect to booking page for now playing movies
            window.location.href = `book.html?movie=${encodeURIComponent(movieTitle)}&id=${movieId}&type=booking`;
        },

        preorderMovie(movieTitle, movieId) {
            // Redirect to booking page for upcoming movies (pre-order)
            window.location.href = `book.html?movie=${encodeURIComponent(movieTitle)}&id=${movieId}&type=preorder`;
        },

        playTrailer(movieTitle, movieId) {
            // Create and show trailer modal
            this.showTrailerModal(movieTitle, movieId);
        },

        showTrailerModal(movieTitle, movieId) {
            // Create modal overlay
            const modal = document.createElement('div');
            modal.className = 'trailer-modal';
            modal.innerHTML = `
                <div class="trailer-modal-content">
                    <div class="trailer-modal-header">
                        <h3>${movieTitle} - Trailer</h3>
                        <button class="close-modal" onclick="MOSS.Movies.closeTrailerModal()">&times;</button>
                    </div>
                    <div class="trailer-container">
                        <p>🎬 Trailer coming soon...</p>
                        <p>In a real implementation, this would fetch and play the trailer from TMDB API.</p>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 10);
        },

        closeTrailerModal() {
            const modal = document.querySelector('.trailer-modal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        },

        currentPage: 1,
        currentCategory: 'now_playing',
        totalPages: 1,

        async loadMovies(category = 'now_playing', page = 1, append = false) {
            const movieGrid = document.getElementById('movie-grid');
            const loadingState = document.getElementById('loading-movies');
            const titleElement = document.getElementById('movies-section-title');
            const loadMoreBtn = document.getElementById('load-more-btn');

            if (!movieGrid) return;

            try {
                // Show loading state
                if (loadingState) {
                    loadingState.style.display = 'flex';
                }

                // Update title based on category (only on initial load)
                if (titleElement && !append) {
                    const titles = {
                        'now_playing': 'Now Playing',
                        'upcoming': 'Coming Soon',
                        'popular': 'Popular Movies',
                        'top_rated': 'Top Rated Movies'
                    };
                    titleElement.textContent = titles[category] || 'Now Playing';
                }

                // Fetch movies by category
                const result = await this.fetchMoviesByCategory(category, page);
                const movies = result.movies || result; // Handle both new and old response formats

                // Update pagination state
                this.currentPage = page;
                this.currentCategory = category;
                this.totalPages = result.totalPages || 1;

                // Hide loading state
                if (loadingState) {
                    loadingState.style.display = 'none';
                }

                // Add data source indicator (only on initial load)
                if (!append) {
                    this.showDataSourceIndicator(movies.length > 0 && movies[0]?.poster_path?.startsWith('/'));
                }

                // Clear existing content or append
                if (!append) {
                    movieGrid.innerHTML = '';
                }

                // Create movie cards
                movies.forEach(movie => {
                    const movieCard = this.createMovieCard(movie, category);
                    movieGrid.appendChild(movieCard);
                });

                // Update load more button
                if (loadMoreBtn) {
                    if (this.currentPage < this.totalPages) {
                        loadMoreBtn.textContent = `Load More Movies (Page ${this.currentPage + 1})`;
                        loadMoreBtn.style.display = 'inline-block';
                    } else {
                        loadMoreBtn.textContent = 'All Movies Loaded';
                        loadMoreBtn.disabled = true;
                        loadMoreBtn.style.opacity = '0.6';
                    }
                }

                // Add loading animation
                this.animateMovieCards();

                console.log(`🎬 Loaded ${movies.length} ${category} movies successfully!`);

            } catch (error) {
                console.error('Error loading movies:', error);
                if (loadingState) {
                    loadingState.innerHTML = '<p>❌ Error loading movies. Please try again later.</p>';
                }
            }
        },

        setupCategoryButtons() {
            const categoryButtons = document.querySelectorAll('.category-btn');

            categoryButtons.forEach(button => {
                button.addEventListener('click', async (e) => {
                    const category = e.target.dataset.category;

                    // Update active button
                    categoryButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.classList.remove('loading');
                    });

                    // Add loading state to clicked button
                    e.target.classList.add('active');
                    e.target.classList.add('loading');

                    // Reset load more button state
                    const loadMoreBtn = document.getElementById('load-more-btn');
                    if (loadMoreBtn) {
                        loadMoreBtn.disabled = false;
                        loadMoreBtn.style.opacity = '1';
                        loadMoreBtn.textContent = 'View All Movies';
                    }

                    // Load movies for selected category (reset to page 1)
                    await this.loadMovies(category, 1, false);

                    // Remove loading state
                    e.target.classList.remove('loading');
                });
            });
        },

        showDataSourceIndicator(isUsingAPI) {
            // Remove existing indicator
            const existingIndicator = document.querySelector('.data-source-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }

            // Create new indicator
            const indicator = document.createElement('div');
            indicator.className = 'data-source-indicator';
            indicator.innerHTML = isUsingAPI
                ? '🌐 Live data from TMDB API'
                : '📦 Using demo data';

            // Add to title bar
            const titleBar = document.querySelector('.title-bar');
            if (titleBar) {
                titleBar.appendChild(indicator);
            }
        },

        animateMovieCards() {
            const movieCards = document.querySelectorAll('.movie');
            movieCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    },

    // Search functionality
    Search: {
        handleSearch(searchTerm) {
            if (!searchTerm.trim()) {
                alert('Please enter a search term');
                return;
            }

            // Redirect to watchwhat page with search term
            window.location.href = `watchwhat.html?search=${encodeURIComponent(searchTerm)}`;
        }
    },

    // Navigation functionality
    Navigation: {
        init() {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    // Reset all links to default state
                    navLinks.forEach(lnk => {
                        lnk.classList.remove('active');
                        lnk.style.color = '';
                    });

                    // Highlight the active link
                    this.classList.add('active');
                    this.style.color = '';
                });
            });
        }
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 MOSS: Initializing Movies One-stop Station...');

    // Initialize navigation
    MOSS.Navigation.init();

    // Load movies on homepage
    if (document.getElementById('movie-grid')) {
        MOSS.Movies.loadMovies();
        MOSS.Movies.setupCategoryButtons();

        // Setup load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                if (!this.disabled) {
                    MOSS.Movies.loadMovies(MOSS.Movies.currentCategory, MOSS.Movies.currentPage + 1, true);
                }
            });
        }
    }

    // Handle search functionality
    const searchForm = document.querySelector('.search-bar button');
    const searchInput = document.querySelector('.search-bar input');

    if (searchForm && searchInput) {
        searchForm.addEventListener('click', function(event) {
            event.preventDefault();
            const searchTerm = searchInput.value;
            MOSS.Search.handleSearch(searchTerm);
        });

        // Also handle Enter key in search input
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const searchTerm = this.value;
                MOSS.Search.handleSearch(searchTerm);
            }
        });
    }

    console.log('✅ MOSS: Initialization complete!');
});
