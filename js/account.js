/**
 * MOSS Account Manager
 */

const AccountManager = {
    NOTES_STORAGE_KEY: 'moss_notes',
    selectedRating: 0,

    init() {
        console.log('🎬 Initializing Account Manager...');

        this.setupTabs();
        this.setupStarRating();
        this.loadAllData();
        this.updateStats();
    },

    // Setup tab switching
    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
    },

    // Switch between tabs
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Load data for the tab
        if (tabName === 'favorites') {
            this.loadFavorites();
        } else if (tabName === 'bookings') {
            this.loadBookings();
        } else if (tabName === 'notes') {
            this.loadNotes();
        }
    },

    // Setup star rating interaction
    setupStarRating() {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                this.selectedRating = parseInt(e.target.dataset.rating);
                this.updateStarDisplay();
            });

            star.addEventListener('mouseenter', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                stars.forEach((s, idx) => {
                    s.textContent = idx < rating ? '★' : '☆';
                });
            });
        });

        document.querySelector('.star-rating').addEventListener('mouseleave', () => {
            this.updateStarDisplay();
        });
    },

    updateStarDisplay() {
        document.querySelectorAll('.star').forEach((star, idx) => {
            star.textContent = idx < this.selectedRating ? '★' : '☆';
        });
    },

    // Load all data
    loadAllData() {
        this.loadFavorites();
        this.loadBookings();
        this.loadNotes();
    },

    // Update stats in header
    updateStats() {
        const favCount = window.FavoritesManager.getCount();
        const bookingCount = window.BookingsManager.getCount();

        document.getElementById('favorites-count').textContent = favCount;
        document.getElementById('bookings-count').textContent = bookingCount;
    },

    // Load favorites
    loadFavorites() {
        const favorites = window.FavoritesManager.getAll();
        const grid = document.getElementById('favorites-grid');
        const emptyState = document.getElementById('favorites-empty');

        if (favorites.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        grid.innerHTML = '';

        favorites.forEach(movie => {
            const card = this.createFavoriteCard(movie);
            grid.appendChild(card);
        });
    },

    // Create favorite movie card
    createFavoriteCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie card card-cinema';

        const posterUrl = movie.poster_path && movie.poster_path.startsWith('/')
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : movie.poster_path || 'media/default-poster.jpg';

        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';

        card.innerHTML = `
            <div class="movie-poster-container">
                <img src="${posterUrl}" alt="${movie.title}" onerror="this.src='media/default-poster.jpg'">
                <div class="movie-rating-overlay">
                    <span class="imdb-like-rating">★ ${rating}</span>
                </div>
                <button class="remove-favorite-btn" onclick="AccountManager.removeFavorite(${movie.id})" title="Remove from favorites">×</button>
            </div>
            <div class="movie-info">
                <h3 class="movie-title" title="${movie.title}">${this.truncateText(movie.title, 25)}</h3>
                ${releaseYear ? `<p class="movie-year">${releaseYear}</p>` : ''}
            </div>
        `;

        card.onclick = (e) => {
            if (!e.target.classList.contains('remove-favorite-btn')) {
                window.location.href = `movie-details.html?id=${movie.id}`;
            }
        };

        return card;
    },

    // Remove favorite
    removeFavorite(movieId) {
        if (confirm('Remove this movie from favorites?')) {
            window.FavoritesManager.remove(movieId);
            this.loadFavorites();
            this.updateStats();
        }
    },

    // Clear all favorites
    clearAllFavorites() {
        if (confirm('Are you sure you want to clear all favorites?')) {
            window.FavoritesManager.clearAll();
            this.loadFavorites();
            this.updateStats();
        }
    },

    // Load bookings
    loadBookings() {
        const bookings = window.BookingsManager.getAll();
        const container = document.getElementById('bookings-list');
        const emptyState = document.getElementById('bookings-empty');

        if (bookings.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        emptyState.style.display = 'none';
        container.innerHTML = '';

        // Sort by date (newest first)
        bookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

        bookings.forEach(booking => {
            const card = this.createBookingCard(booking);
            container.appendChild(card);
        });
    },

    // Create booking card
    createBookingCard(booking) {
        const card = document.createElement('div');
        card.className = 'booking-card';

        const bookedDate = new Date(booking.bookedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        card.innerHTML = `
            <div class="booking-poster">
                <img src="${booking.moviePoster}" alt="${booking.movieTitle}" onerror="this.src='media/default-poster.jpg'">
            </div>
            <div class="booking-details">
                <h3>${booking.movieTitle}</h3>
                <div class="booking-info">
                    <p><strong>Cinema:</strong> ${booking.cinema || 'Not specified'}</p>
                    <p><strong>Date:</strong> ${booking.date}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                    <p><strong>Seats:</strong> ${booking.seats}</p>
                    <p><strong>Total:</strong> $${booking.totalPrice}</p>
                    <p class="booking-date">Booked on: ${bookedDate}</p>
                </div>
                <div class="booking-actions">
                    <button class="btn btn-outline btn-sm" onclick="AccountManager.removeBooking('${booking.id}')">Cancel Booking</button>
                </div>
            </div>
            <div class="booking-id">ID: ${booking.id}</div>
        `;

        return card;
    },

    // Remove booking
    removeBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            window.BookingsManager.remove(bookingId);
            this.loadBookings();
            this.updateStats();
        }
    },

    // Clear all bookings
    clearAllBookings() {
        if (confirm('Are you sure you want to clear all bookings?')) {
            window.BookingsManager.clearAll();
            this.loadBookings();
            this.updateStats();
        }
    },

    // Notes functionality
    getNotes() {
        const notes = localStorage.getItem(this.NOTES_STORAGE_KEY);
        return notes ? JSON.parse(notes) : [];
    },

    addNote() {
        const movieTitle = document.getElementById('note-movie-title').value.trim();
        const content = document.getElementById('note-content').value.trim();

        if (!movieTitle || !content) {
            alert('Please fill in both movie title and note content');
            return;
        }

        const notes = this.getNotes();
        const newNote = {
            id: Date.now().toString(),
            movieTitle: movieTitle,
            content: content,
            rating: this.selectedRating,
            createdAt: new Date().toISOString()
        };

        notes.push(newNote);
        localStorage.setItem(this.NOTES_STORAGE_KEY, JSON.stringify(notes));

        // Clear form
        document.getElementById('note-movie-title').value = '';
        document.getElementById('note-content').value = '';
        this.selectedRating = 0;
        this.updateStarDisplay();

        this.loadNotes();
    },

    loadNotes() {
        const notes = this.getNotes();
        const container = document.getElementById('notes-list');
        const emptyState = document.getElementById('notes-empty');

        if (notes.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        emptyState.style.display = 'none';
        container.innerHTML = '';

        // Sort by date (newest first)
        notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        notes.forEach(note => {
            const card = this.createNoteCard(note);
            container.appendChild(card);
        });
    },

    createNoteCard(note) {
        const card = document.createElement('div');
        card.className = 'note-card';

        const stars = '★'.repeat(note.rating) + '☆'.repeat(5 - note.rating);
        const date = new Date(note.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        card.innerHTML = `
            <div class="note-header">
                <h4>${note.movieTitle}</h4>
                <button class="btn btn-outline btn-sm" onclick="AccountManager.removeNote('${note.id}')">Delete</button>
            </div>
            <div class="note-rating">${stars}</div>
            <p class="note-content">${note.content}</p>
            <p class="note-date">${date}</p>
        `;

        return card;
    },

    removeNote(noteId) {
        if (confirm('Delete this note?')) {
            const notes = this.getNotes();
            const filtered = notes.filter(n => n.id !== noteId);
            localStorage.setItem(this.NOTES_STORAGE_KEY, JSON.stringify(filtered));
            this.loadNotes();
        }
    },

    // Utility
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AccountManager.init();
});
