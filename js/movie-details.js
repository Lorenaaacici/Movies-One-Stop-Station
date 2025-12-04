/**
 * MOSS Unified Movie Details Page
 * Smart booking based on release status + Reviews + Discovery
 */

const MovieDetails = {
    API: {
        BASE_URL: 'https://api.themoviedb.org/3',
        API_KEY: 'a07e22bc18f5cb106bfe4cc1f83ad8ed',
        IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
        BACKDROP_BASE_URL: 'https://image.tmdb.org/t/p/original'
    },

    state: {
        currentMovieId: null,
        currentMovie: null,
        currentDiscoveryFilter: 'similar'
    },

    modalResolve: null,

    // Setup custom confirm modal
    setupModal() {
        const modal = document.getElementById('confirm-modal');
        const cancelBtn = document.getElementById('confirm-cancel');
        const confirmBtn = document.getElementById('confirm-ok');

        if (!modal) return;

        cancelBtn.addEventListener('click', () => {
            this.hideModal();
            if (this.modalResolve) {
                this.modalResolve(false);
                this.modalResolve = null;
            }
        });

        confirmBtn.addEventListener('click', () => {
            this.hideModal();
            if (this.modalResolve) {
                this.modalResolve(true);
                this.modalResolve = null;
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
                if (this.modalResolve) {
                    this.modalResolve(false);
                    this.modalResolve = null;
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.hideModal();
                if (this.modalResolve) {
                    this.modalResolve(false);
                    this.modalResolve = null;
                }
            }
        });
    },

    showConfirm(title, message, isDanger = false) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const titleEl = document.getElementById('confirm-title');
            const messageEl = document.getElementById('confirm-message');
            const confirmBtn = document.getElementById('confirm-ok');
            const iconEl = document.getElementById('modal-icon');

            titleEl.textContent = title;
            messageEl.textContent = message;

            if (isDanger) {
                confirmBtn.classList.add('danger');
                iconEl.classList.add('danger');
            } else {
                confirmBtn.classList.remove('danger');
                iconEl.classList.remove('danger');
            }

            this.modalResolve = resolve;
            modal.classList.add('active');
        });
    },

    hideModal() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('active');
    },

    // Get movie ID from URL parameters
    getMovieIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    },

    // Check if movie can be booked based on release status
    canBookMovie(movie) {
        const releaseDate = new Date(movie.release_date);
        const today = new Date();
        const daysDiff = (releaseDate - today) / (1000 * 60 * 60 * 24);

        // Can book if:
        // 1. Already released (within last 90 days)
        // 2. Releasing soon (within next 30 days)
        return daysDiff >= -90 && daysDiff <= 30;
    },

    // Get movie status label
    getMovieStatusLabel(movie) {
        const releaseDate = new Date(movie.release_date);
        const today = new Date();
        releaseDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const daysDiff = Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24));

            console.log(`📅 Movie Details - ${movie.title}: Release ${movie.release_date}, Days diff: ${daysDiff}`);

        if (daysDiff > 30) {
            return { label: 'Coming Soon', canBook: false, type: 'upcoming' };
        } else if (daysDiff > 0) {
            return { label: 'Releasing Soon', canBook: true, type: 'upcoming' };
        } else if (daysDiff >= -90) {
            return { label: 'Now Playing', canBook: true, type: 'now_playing' };
        } else {
            return { label: 'Released', canBook: false, type: 'released' };
        }
    },

    // Fetch complete movie details
    async fetchMovieDetails(movieId) {
        try {
            const response = await fetch(
                `${this.API.BASE_URL}/movie/${movieId}?api_key=${this.API.API_KEY}&language=en-US`
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Movie details fetched:', data);
            return data;
        } catch (error) {
            console.error('❌ Error fetching movie details:', error);
            throw error;
        }
    },

    // Fetch movie cast
    async fetchMovieCredits(movieId) {
        try {
            const response = await fetch(
                `${this.API.BASE_URL}/movie/${movieId}/credits?api_key=${this.API.API_KEY}&language=en-US`
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Movie credits fetched:', data.cast.length, 'cast members');
                return data.cast.slice(0, 12); // Top 12 cast members
            }
        } catch (error) {
            console.warn('⚠️ Error fetching credits:', error);
        }
        return [];
    },

    // Fetch movie reviews
    async fetchMovieReviews(movieId) {
        try {
            const response = await fetch(
                `${this.API.BASE_URL}/movie/${movieId}/reviews?api_key=${this.API.API_KEY}&language=en-US&page=1`
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Movie reviews fetched:', data.results.length);
                return data.results.slice(0, 5); // Top 5 reviews
            }
        } catch (error) {
            console.warn('⚠️ Error fetching reviews:', error);
        }
        return [];
    },

    // Fetch similar movies
    async fetchSimilarMovies(movieId) {
        try {
            const response = await fetch(
                `${this.API.BASE_URL}/movie/${movieId}/similar?api_key=${this.API.API_KEY}&language=en-US&page=1`
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Similar movies fetched:', data.results.length);
                return data.results.slice(0, 12);
            }
        } catch (error) {
            console.warn('⚠️ Error fetching similar movies:', error);
        }
        return [];
    },

    // Fetch discovery movies (popular/trending)
    async fetchDiscoveryMovies(category) {
        try {
            let endpoint;
            switch(category) {
                case 'popular':
                    endpoint = `/movie/popular?api_key=${this.API.API_KEY}&language=en-US&page=1`;
                    break;
                case 'trending':
                    endpoint = `/trending/movie/week?api_key=${this.API.API_KEY}&page=1`;
                    break;
                default:
                    return [];
            }

            const response = await fetch(`${this.API.BASE_URL}${endpoint}`);
            if (response.ok) {
                const data = await response.json();
                return data.results.slice(0, 12);
            }
        } catch (error) {
            console.warn('⚠️ Error fetching discovery movies:', error);
        }
        return [];
    },

    // Fetch movie videos (trailers, clips, teasers)
    async fetchMovieVideos(movieId) {
        try {
            const response = await fetch(
                `${this.API.BASE_URL}/movie/${movieId}/videos?api_key=${this.API.API_KEY}&language=en-US`
            );

            if (response.ok) {
                const data = await response.json();
                console.log('🎬 Found videos:', data.results.map(v => `${v.type} (${v.site})`));

                // Priority order: Trailer > Teaser > Clip > Featurette
                const priorities = ['Trailer', 'Teaser', 'Clip', 'Featurette'];

                // Support multiple platforms: YouTube, Vimeo, etc.
                const supportedSites = ['YouTube', 'Vimeo'];

                for (const type of priorities) {
                    const video = data.results.find(v =>
                        v.type === type && supportedSites.includes(v.site)
                    );
                    if (video) {
                        console.log(`✅ Selected: ${video.type} from ${video.site}`);
                        return video;
                    }
                }

                // Fallback: return first available video
                return data.results.find(v => supportedSites.includes(v.site));
            }
        } catch (error) {
            console.warn('⚠️ Error fetching videos:', error);
        }
        return null;
    },

    // Play video in modal or new tab
    playVideo(video) {
        if (!video) {
            alert('🎬 No trailer or clips available for this movie.');
            return;
        }

        let videoUrl;
        if (video.site === 'YouTube') {
            videoUrl = `https://www.youtube.com/watch?v=${video.key}`;
        } else if (video.site === 'Vimeo') {
            videoUrl = `https://vimeo.com/${video.key}`;
        } else {
            alert('🎬 Video platform not supported.');
            return;
        }

        window.open(videoUrl, '_blank');
    },

    // Format currency
    formatCurrency(amount) {
        if (!amount || amount === 0) return '-';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    },

    // Format runtime
    formatRuntime(minutes) {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    },

    // Format language code
    formatLanguage(code) {
        const languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'pt': 'Portuguese',
            'ru': 'Russian'
        };
        return languages[code] || code.toUpperCase();
    },

    // Display movie details
    displayMovieDetails(movie) {
        this.state.currentMovie = movie;

        // Update backdrop
        const backdrop = document.getElementById('movie-backdrop');
        if (movie.backdrop_path) {
            backdrop.style.backgroundImage = `url(${this.API.BACKDROP_BASE_URL}${movie.backdrop_path})`;
        }

        // Update poster
        const poster = document.getElementById('movie-poster');
        if (movie.poster_path) {
            poster.src = `${this.API.IMAGE_BASE_URL}${movie.poster_path}`;
            poster.alt = `${movie.title} Poster`;
        }

        // Update title
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-title-breadcrumb').textContent = movie.title;
        document.title = `${movie.title} - MOSS`;

        // Update rating
        document.getElementById('rating-value').textContent = movie.vote_average.toFixed(1);
        document.getElementById('vote-count').textContent =
            `(${this.formatNumber(movie.vote_count)} votes)`;

        // Update status (inline in meta bar)
        document.getElementById('movie-status-inline').textContent = movie.status || 'Unknown';

        // Update release date
        const releaseDate = new Date(movie.release_date);
        document.getElementById('movie-release').textContent =
            releaseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Update runtime
        document.getElementById('movie-runtime').textContent = this.formatRuntime(movie.runtime);

        // Update language (inline in meta bar)
        document.getElementById('movie-language-inline').textContent =
            this.formatLanguage(movie.original_language);

        // Update genres
        const genreList = document.getElementById('genre-list');
        genreList.innerHTML = movie.genres
            .map(genre => `<span class="genre-tag">${genre.name}</span>`)
            .join('');

        // Update overview
        document.getElementById('movie-overview').textContent =
            movie.overview || 'No overview available.';

        // Update budget & revenue (bottom compact section)
        document.getElementById('movie-budget').textContent = this.formatCurrency(movie.budget);
        document.getElementById('movie-revenue').textContent = this.formatCurrency(movie.revenue);

        // Setup action buttons based on release status
        this.setupSmartActionButtons(movie);
    },

    // Setup smart action buttons based on movie release status
    setupSmartActionButtons(movie) {
        const statusInfo = this.getMovieStatusLabel(movie);
        const bookTicketsBtn = document.getElementById('book-tickets-btn');
        const trailerBtn = document.getElementById('watch-trailer-btn');

        if (statusInfo.canBook) {
            // Show booking button for Now Playing and Releasing Soon
            bookTicketsBtn.style.display = 'block';
            bookTicketsBtn.innerHTML = `<span class="btn-icon">🎫</span> ${statusInfo.label === 'Releasing Soon' ? 'Pre-order Tickets' : 'Book Tickets'}`;

            bookTicketsBtn.onclick = () => {
                window.location.href = `book.html?movie=${encodeURIComponent(movie.title)}&id=${movie.id}&type=${statusInfo.type}`;
            };
        } else {
            // Hide booking button for old/future movies
            bookTicketsBtn.style.display = 'none';
        }

        // Trailer button always visible
        trailerBtn.style.display = 'inline-flex';
        trailerBtn.onclick = async () => {
            const video = await this.fetchMovieVideos(movie.id);
            this.playVideo(video);
        };

        // Wishlist button with FavoritesManager integration
        const wishlistBtn = document.getElementById('add-wishlist-btn');
        const heartIcon = wishlistBtn.querySelector('.heart-icon');
        const favText = wishlistBtn.querySelector('.fav-text');

        // Check if already in favorites and update UI
        if (window.FavoritesManager && window.FavoritesManager.isFavorite(movie.id)) {
            heartIcon.setAttribute('fill', 'currentColor');
            favText.textContent = 'In Wishlist';
            wishlistBtn.classList.add('is-favorite');
        }

        wishlistBtn.onclick = () => {
            if (window.FavoritesManager) {
                if (window.FavoritesManager.isFavorite(movie.id)) {
                    // Remove from favorites
                    window.FavoritesManager.remove(movie.id);
                    heartIcon.setAttribute('fill', 'none');
                    favText.textContent = 'Add to Wishlist';
                    wishlistBtn.classList.remove('is-favorite');
                    console.log(`❤️ Removed from wishlist: ${movie.title}`);
                } else {
                    // Add to favorites
                    const favoriteMovie = {
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path ? `${this.API.IMAGE_BASE_URL}${movie.poster_path}` : null,
                        vote_average: movie.vote_average,
                        release_date: movie.release_date,
                        overview: movie.overview
                    };
                    window.FavoritesManager.add(favoriteMovie);
                    heartIcon.setAttribute('fill', 'currentColor');
                    favText.textContent = 'In Wishlist';
                    wishlistBtn.classList.add('is-favorite');
                    console.log(`❤️ Added to wishlist: ${movie.title}`);
                }
            } else {
                alert('❤️ Favorites feature not available');
            }
        };
    },

    // Display cast members
    displayCast(cast) {
        const castGrid = document.getElementById('cast-grid');

        if (cast.length === 0) {
            castGrid.innerHTML = '<p style="color: var(--text-muted);">No cast information available.</p>';
            return;
        }

        castGrid.innerHTML = cast.map(person => {
            const hasPhoto = person.profile_path;
            const photoUrl = hasPhoto ? this.API.IMAGE_BASE_URL + person.profile_path : '';

            return `
                <div class="cast-card">
                    ${hasPhoto
                        ? `<img src="${photoUrl}" alt="${person.name}" class="cast-photo" onerror="this.parentElement.querySelector('.cast-photo').style.display='none'; this.parentElement.querySelector('.cast-placeholder').style.display='flex';">`
                        : ''
                    }
                    <div class="cast-placeholder" style="display: ${hasPhoto ? 'none' : 'flex'}">
                        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="35" r="18" stroke="#F0E4BF" stroke-width="2" opacity="0.3"/>
                            <path d="M25 75 Q25 55 50 55 Q75 55 75 75 L75 85 L25 85 Z" stroke="#F0E4BF" stroke-width="2" fill="none" opacity="0.3"/>
                        </svg>
                    </div>
                    <div class="cast-info">
                        <div class="cast-name">${person.name}</div>
                        <div class="cast-character">${person.character || 'Unknown role'}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Display reviews from TMDB
    displayReviews(reviews) {
        const reviewsList = document.getElementById('reviews-list');
        const reviewsCount = document.getElementById('reviews-count');

        // Update count
        if (reviewsCount) {
            reviewsCount.textContent = reviews.length > 0 ? `${reviews.length}` : '';
        }

        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p style="color: var(--text-muted);">No reviews available for this movie yet.</p>';
            return;
        }

        reviewsList.innerHTML = reviews.map(review => {
            const date = new Date(review.created_at);
            return `
                <div class="review-item">
                    <div class="review-header">
                        <div class="review-author">${review.author}</div>
                        ${review.author_details.rating ? `<div class="review-rating">${review.author_details.rating}/10</div>` : ''}
                    </div>
                    <div class="review-content">${this.truncateText(review.content, 400)}</div>
                    <div class="review-meta">
                        <span class="review-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
                        <span class="review-source">via TMDB</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Display similar/discovery movies
    displaySimilarMovies(movies) {
        const similarGrid = document.getElementById('similar-movies-grid');

        if (movies.length === 0) {
            similarGrid.innerHTML = '<p style="color: var(--text-muted);">No similar movies found.</p>';
            return;
        }

        similarGrid.innerHTML = movies.map(movie => {
            // Use skeleton placeholder when no poster is available
            const hasPoster = movie.poster_path;

            return `
                <div class="similar-movie-card" onclick="MovieDetails.navigateToMovie(${movie.id})">
                    ${hasPoster
                        ? `<img
                            src="${this.API.IMAGE_BASE_URL + movie.poster_path}"
                            alt="${movie.title}"
                            class="similar-movie-poster"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                            loading="lazy"
                        ><div class="poster-skeleton" style="display:none;"></div>`
                        : `<div class="poster-skeleton"></div>`
                    }
                    <div class="similar-movie-info">
                        <div class="similar-movie-title">${this.truncateText(movie.title, 30)}</div>
                        <div class="similar-movie-rating">★ ${movie.vote_average.toFixed(1)}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Switch discovery filter
    async switchDiscoveryFilter(filter) {
        this.state.currentDiscoveryFilter = filter;

        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Load movies based on filter
        let movies;
        if (filter === 'similar' && this.state.currentMovieId) {
            movies = await this.fetchSimilarMovies(this.state.currentMovieId);
        } else {
            movies = await this.fetchDiscoveryMovies(filter);
        }

        this.displaySimilarMovies(movies);
    },

    // Navigate to another movie
    navigateToMovie(movieId) {
        window.location.href = `movie-details.html?id=${movieId}`;
    },

    // Helper functions
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

    // Show loading state
    showLoading() {
        document.getElementById('loading-state').style.display = 'flex';
        document.getElementById('movie-details').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
    },

    // Show content
    showContent() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('movie-details').style.display = 'block';
        document.getElementById('error-state').style.display = 'none';
    },

    // Show error
    showError() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('movie-details').style.display = 'none';
        document.getElementById('error-state').style.display = 'flex';
    },

    // Personal Notes Management
    Notes: {
        STORAGE_KEY: 'moss_movie_notes',

        // Get all notes
        getAll() {
            const notes = localStorage.getItem(this.STORAGE_KEY);
            return notes ? JSON.parse(notes) : {};
        },

        // Get notes for a specific movie
        getForMovie(movieId) {
            const allNotes = this.getAll();
            return allNotes[movieId] || [];
        },

        // Add note to a movie
        add(movieId, note) {
            const allNotes = this.getAll();
            if (!allNotes[movieId]) {
                allNotes[movieId] = [];
            }

            const newNote = {
                id: Date.now().toString(),
                rating: note.rating || null,
                content: note.content,
                createdAt: new Date().toISOString()
            };

            allNotes[movieId].push(newNote);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allNotes));
            console.log('✅ Note saved:', newNote);
            return newNote;
        },

        // Delete note
        delete(movieId, noteId) {
            const allNotes = this.getAll();
            if (allNotes[movieId]) {
                allNotes[movieId] = allNotes[movieId].filter(n => n.id !== noteId);
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allNotes));
                console.log('🗑️ Note deleted:', noteId);
                return true;
            }
            return false;
        }
    },

    // Display personal notes
    displayPersonalNotes(movieId) {
        const notesList = document.getElementById('personal-notes-list');
        const notes = this.Notes.getForMovie(movieId);

        if (notes.length === 0) {
            notesList.innerHTML = '<p style="color: var(--text-muted);">No personal notes yet. Click "Add Note" to write your thoughts.</p>';
            return;
        }

        notesList.innerHTML = notes.map(note => {
            const date = new Date(note.createdAt);
            return `
                <div class="note-item" data-note-id="${note.id}">
                    <div class="note-header">
                        ${note.rating ? `<div class="note-rating">${'★'.repeat(note.rating)}</div>` : '<div></div>'}
                        <div class="note-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
                    </div>
                    <div class="note-content">${note.content}</div>
                    <div class="note-actions">
                        <button class="delete-btn" onclick="MovieDetails.deleteNote('${movieId}', '${note.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Delete note and refresh display
    async deleteNote(movieId, noteId) {
        const confirmed = await this.showConfirm(
            'Delete Note',
            'Are you sure you want to delete this note? This action cannot be undone.',
            true
        );
        if (confirmed) {
            this.Notes.delete(movieId, noteId);
            this.displayPersonalNotes(movieId);
        }
    },

    // Setup cast scroll fade effect
    setupCastScrollFade() {
        const castGrid = document.getElementById('cast-grid');
        const container = castGrid?.closest('.cast-scroll-container');

        if (!castGrid || !container) return;

        const updateFade = () => {
            const isAtEnd = castGrid.scrollLeft + castGrid.clientWidth >= castGrid.scrollWidth - 10;
            container.classList.toggle('scrolled-end', isAtEnd);
        };

        // Initial check
        updateFade();

        // Update on scroll
        castGrid.addEventListener('scroll', updateFade, { passive: true });

        // Update on resize
        window.addEventListener('resize', updateFade, { passive: true });
    },

    // Setup event listeners
    setupEventListeners() {
        // Cast scroll fade effect
        this.setupCastScrollFade();

        // Discovery filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.switchDiscoveryFilter(filter);
            });
        });

        // Personal Notes - Toggle form
        const toggleBtn = document.getElementById('toggle-note-form');
        const formContainer = document.getElementById('note-form-container');
        const noteForm = document.getElementById('note-form');
        const cancelBtn = document.getElementById('cancel-note');

        if (toggleBtn && formContainer) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = formContainer.style.display === 'none';
                formContainer.style.display = isHidden ? 'block' : 'none';
                toggleBtn.textContent = isHidden ? 'Cancel' : 'Add Note';
            });
        }

        if (cancelBtn && formContainer) {
            cancelBtn.addEventListener('click', () => {
                formContainer.style.display = 'none';
                toggleBtn.textContent = 'Add Note';
                noteForm.reset();
            });
        }

        // Personal Notes - Submit form
        if (noteForm) {
            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const ratingInput = noteForm.querySelector('input[name="rating"]:checked');
                const contentInput = document.getElementById('note-text');

                const note = {
                    rating: ratingInput ? parseInt(ratingInput.value) : null,
                    content: contentInput.value.trim()
                };

                if (note.content) {
                    this.Notes.add(this.state.currentMovieId, note);
                    this.displayPersonalNotes(this.state.currentMovieId);

                    // Reset form and hide
                    noteForm.reset();
                    formContainer.style.display = 'none';
                    toggleBtn.textContent = 'Add Note';
                }
            });
        }
    },

    // Initialize page
    async init() {
        // Setup modal first
        this.setupModal();

        const movieId = this.getMovieIdFromURL();

        if (!movieId) {
            console.error('❌ No movie ID provided in URL');
            this.showError();
            return;
        }

        this.state.currentMovieId = movieId;
        console.log('🎬 Loading movie details for ID:', movieId);
        this.showLoading();

        try {
            // Fetch all data in parallel
            const [movie, cast, reviews, similar] = await Promise.all([
                this.fetchMovieDetails(movieId),
                this.fetchMovieCredits(movieId),
                this.fetchMovieReviews(movieId),
                this.fetchSimilarMovies(movieId)
            ]);

            // Display everything
            this.displayMovieDetails(movie);
            this.displayCast(cast);
            this.displayPersonalNotes(movieId);
            this.displayReviews(reviews);
            this.displaySimilarMovies(similar);

            // Setup event listeners
            this.setupEventListeners();

            this.showContent();

            console.log('✅ Movie details page loaded successfully!');

        } catch (error) {
            console.error('❌ Failed to load movie details:', error);
            this.showError();
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MovieDetails.init();
});

// Make globally available for onclick handlers
window.MovieDetails = MovieDetails;
