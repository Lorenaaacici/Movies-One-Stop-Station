// TMDB API Configuration
const TMDB_API_KEY = 'a07e22bc18f5cb106bfe4cc1f83ad8ed';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function showCities(state) {
    var citySelect = document.getElementById('city-select');
    citySelect.innerHTML = '';
    var cities = {
        victoria: ['Melbourne', 'Geelong'],
        nsw: ['Sydney', 'Newcastle'],
        queensland: ['Brisbane', 'Townsville']
    };

    if (state) {
        var options = cities[state].map(function(city) {
            return '<option value="' + city.toLowerCase() + '">' + city + '</option>';
        });
        citySelect.innerHTML = '<option value="">Select a City</option>' + options.join('');
    } else {
        citySelect.innerHTML = '<option value="">Select a City</option>';
    }
}

// Fetch movie details from TMDB API
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        const movie = await response.json();

        // Update movie poster
        if (movie.poster_path) {
            const posterImg = document.getElementById('movie-poster-img');
            posterImg.src = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
            posterImg.alt = movie.title;
        }

        // Update movie title
        document.getElementById('movie-title').textContent = movie.title;

        console.log('📽️ Movie details loaded:', movie.title);
    } catch (error) {
        console.error('Failed to fetch movie details:', error);
    }
}

// Initialize booking functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get movie info from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const movieTitle = urlParams.get('title');

    // Update movie title if provided
    if (movieTitle) {
        document.getElementById('movie-title').textContent = decodeURIComponent(movieTitle);
    }

    // Fetch movie details from TMDB if we have an ID
    if (movieId) {
        fetchMovieDetails(movieId);
    }

    // Add click handlers to all booking buttons
    document.querySelectorAll('.booking-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const scheduleDiv = e.target.closest('.cinema-schedule');
            const cinemaName = scheduleDiv.querySelector('h3').textContent;
            const location = scheduleDiv.querySelector('p').textContent.replace('Location: ', '');
            const selectedDate = document.querySelector('.date-selector .btn-secondary').textContent;

            // Get first showtime and price
            const firstShowtime = scheduleDiv.querySelector('li').textContent;
            const [time, priceStr] = firstShowtime.split(' - ');
            const price = parseInt(priceStr.replace('$', ''));

            // Get movie poster
            const posterImg = document.getElementById('movie-poster-img').src;

            // Save booking
            const booking = {
                movieId: movieId || 'unknown',
                movieTitle: movieTitle || document.getElementById('movie-title').textContent,
                moviePoster: posterImg,
                cinema: cinemaName,
                location: location,
                state: 'queensland', // Default state
                city: location.split(',')[0].trim(),
                date: selectedDate,
                time: time,
                seats: 1,
                totalPrice: price
            };

            const newBooking = window.BookingsManager.add(booking);

            // Show success message
            alert(`✅ Booking confirmed!\n\nMovie: ${booking.movieTitle}\nCinema: ${cinemaName}\nTime: ${time}\nDate: ${selectedDate}\n\nBooking ID: ${newBooking.id}`);

            // Optional: redirect to account page
            // window.location.href = 'account.html';
        });
    });
});
