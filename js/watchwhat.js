document.addEventListener('DOMContentLoaded', () => {
    const baseURL = "https://damp-castle-86239-1b70ee448fbd.herokuapp.com/decoapi/movies/";
    const commentsURL = "https://damp-castle-86239-1b70ee448fbd.herokuapp.com/decoapi/comments/";
    const myWebsiteCode = "Moss";
    const getMoviesMethod = "GET";
    const postCommentMethod = "POST";

    const movieList = document.getElementById('movie-list');
    const reviewForm = document.getElementById('reviewForm');
    const responseContainer = document.getElementById('response');

    // Fetch and display movies
    const queryParams = {
        website_code: myWebsiteCode,
    };
    const queryString = new URLSearchParams(queryParams).toString();
    const urlWithParams = `${baseURL}?${queryString}`;

    const getRequestOptions = {
        method: getMoviesMethod,
        redirect: 'follow'
    };

    fetch(urlWithParams, getRequestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(movies => {
            movieList.innerHTML = ''; // clear potential error
            movies.forEach(movie => {
                const cinemaDetails = Array.isArray(movie.cinema_details) ? movie.cinema_details : [];
                const movieElement = document.createElement('div');
                movieElement.className = 'movie';
                movieElement.innerHTML = `
                    <h3>${movie.title}</h3>
                    <img src="${movie.image_url}" alt="${movie.title}">
                    <p>${movie.description}</p>
                    <p>Category: ${movie.category}</p>
                    <p>Showtimes:</p>
                    <ul>
                        ${cinemaDetails.map(detail => `
                            <li>${detail.cinema_name} at ${detail.session_time} - $${detail.ticket_price}</li>
                        `).join('')}
                    </ul>
                `;
                movieList.appendChild(movieElement);
            });
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            movieList.innerHTML = `<p>Failed to load movies. ${error.message}</p>`;
        });

    // Handle review form submission
    reviewForm.addEventListener('submit', event => {
        event.preventDefault();

        const rating = document.querySelector('input[name="rating"]:checked').value;
        const review = document.getElementById('review').value;

        // Validate form inputs
        if (!rating || !review) {
            responseContainer.innerHTML = '<p>Please fill out both fields.</p>';
            return;
        }

        // Prepare review data
        const reviewData = {
            username: "Anonymous", // or you can get it from a user input
            comment: review,
            website_code: myWebsiteCode,
            rating: parseInt(rating)
        };

        // Define POST request details
        const postRequestOptions = {
            method: postCommentMethod,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
        };

        // Submit review using POST request
        fetch(commentsURL, postRequestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            responseContainer.innerHTML = '<p>Review submitted successfully!</p>';
            reviewForm.reset();
        })
        .catch(error => {
            console.error('Error submitting review:', error);
            responseContainer.innerHTML = '<p>Failed to submit review.</p>';
        });
    });
});
