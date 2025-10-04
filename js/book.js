function showCities(state) {
    var citySelect = document.getElementById('city-select');
    citySelect.innerHTML = ''; // Clear existing options
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
