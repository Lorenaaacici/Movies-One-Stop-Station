/**
 * MOSS Bookings Manager - LocalStorage based
 */

const BookingsManager = {
    STORAGE_KEY: 'moss_bookings',

    // Get all bookings
    getAll() {
        const bookings = localStorage.getItem(this.STORAGE_KEY);
        return bookings ? JSON.parse(bookings) : [];
    },

    // Add a new booking
    add(booking) {
        const bookings = this.getAll();

        // Create booking object with unique ID
        const newBooking = {
            id: Date.now().toString(),
            movieId: booking.movieId,
            movieTitle: booking.movieTitle,
            moviePoster: booking.moviePoster,
            state: booking.state,
            city: booking.city,
            date: booking.date || new Date().toISOString().split('T')[0],
            time: booking.time || '19:00',
            seats: booking.seats || 1,
            totalPrice: booking.totalPrice || (booking.seats || 1) * 15,
            bookedAt: new Date().toISOString()
        };

        bookings.push(newBooking);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));

        console.log('✅ Booking added:', newBooking);
        return newBooking;
    },

    // Remove a booking
    remove(bookingId) {
        const bookings = this.getAll();
        const filtered = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return true;
    },

    // Get booking by ID
    getById(bookingId) {
        const bookings = this.getAll();
        return bookings.find(b => b.id === bookingId);
    },

    // Get bookings for a specific movie
    getByMovieId(movieId) {
        const bookings = this.getAll();
        return bookings.filter(b => b.movieId === movieId);
    },

    // Get booking count
    getCount() {
        return this.getAll().length;
    },

    // Clear all bookings
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// Make globally available
window.BookingsManager = BookingsManager;
