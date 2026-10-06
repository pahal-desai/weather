async function getthecoords(city) {
    if (!city || !city.trim()) return null;
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=10&language=en&format=json`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`error ${response.status}`);
        }
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error('bruh. wtf. where is that place');
        }
        const { latitude, longitude, name, country } = data.results[0];
        console.log(`Found: ${name}, ${country} -> (${latitude}, ${longitude})`);
        return { latitude, longitude, name, country };
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
}

async function gettheweather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`error ${response.status}`);
        }
        const data = await response.json();
        return data.current;
    } catch (error) {
        console.error('Weather error:', error.message);
        return null;
    }
}

function getWeatherDescription(code) {
    const codes = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Rime Fog',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Light Showers',
        81: 'Showers',
        82: 'Heavy Showers',
        85: 'Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Hail',
        99: 'Thunderstorm with Hail'
    };
    return codes[code] || 'Clear Sky';
}

const searchbutton = document.querySelector('#button');
const cityInput = document.querySelector('#city');
const tempSpan = document.querySelector('.temp span');
const conditionDiv = document.querySelector('.condition');

async function handleSearch() {
    const city = cityInput ? cityInput.value : '';
    if (!city || !city.trim()) return;

    if (conditionDiv) conditionDiv.textContent = 'Loading...';

    const coords = await getthecoords(city);
    if (!coords) {
        if (conditionDiv) conditionDiv.textContent = 'City not found';
        return;
    }

    const weather = await gettheweather(coords.latitude, coords.longitude);
    if (!weather) {
        if (conditionDiv) conditionDiv.textContent = 'Failed to fetch weather';
        return;
    }

    if (tempSpan) {
        tempSpan.textContent = `${Math.round(weather.temperature_2m)}°C`;
    }
    if (conditionDiv) {
        conditionDiv.textContent = getWeatherDescription(weather.weather_code);
    }
}

if (searchbutton) {
    searchbutton.addEventListener('click', handleSearch);
}

if (cityInput) {
    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}