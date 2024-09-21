window.onload = async function () {
    autoDetectLocation();
}

async function autoDetectLocation() {
    try {
        const locationResponse = await fetch('https://ipinfo.io/json?token=591fb053ec5583'); 
        const locationData = await locationResponse.json();
        const city = locationData.city;
        document.getElementById('locationInput').value = city;  
        getWeather(city); 
    } catch (error) {
        console.error('Could not auto-detect location:', error);
    }
}

// Fetch weather for entered location
document.getElementById('getWeatherBtn').addEventListener('click', () => {
    const location = document.getElementById('locationInput').value;
    getWeather(location);
});

async function getWeather(location) {
    const unit = document.getElementById('unitSelect').value;
    const apiKey = 'fe99a0ce687926ac26f4f7e07c4c026e'; 
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=${apiKey}`;
    const forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unit}&appid=${apiKey}`;

    try {
        const [currentWeatherResponse, forecastWeatherResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastWeatherUrl)
        ]);

        if (!currentWeatherResponse.ok || !forecastWeatherResponse.ok) {
            throw new Error("Location not found.");
        }

        const currentWeatherData = await currentWeatherResponse.json();
        const forecastWeatherData = await forecastWeatherResponse.json();

        displayCurrentWeather(currentWeatherData, unit);
        displayForecastWeather(forecastWeatherData, unit);

    } catch (error) {
        document.getElementById('weatherDisplay').innerHTML = `<p class="text-red-500">${error.message}</p>`;
    }
}

function displayCurrentWeather(data, unit) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const temperatureUnit = unit === "metric" ? "°C" : "°F";
    const windSpeedUnit = unit === "metric" ? "m/s" : "mph";

    weatherDisplay.innerHTML = `
        <div class="mb-4">
            <img src="${iconUrl}" alt="Weather Icon" class="mx-auto">
            <h2 class="text-xl font-bold">${data.name}, ${data.sys.country}</h2>
            <p class="text-lg">${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}</p>
            <p class="text-2xl font-bold">${data.main.temp} ${temperatureUnit}</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Feels Like: ${data.main.feels_like} </p>
            <p>Wind Speed: ${data.wind.speed} ${windSpeedUnit}</p>
        </div>
    `;
}

function displayForecastWeather(data, unit) {
    const forecastDisplay = document.getElementById('forecastDisplay');
    forecastDisplay.innerHTML = ''; // Clear previous forecast data
    const temperatureUnit = unit === "metric" ? "°C" : "°F";

    const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach(forecast => {
        const iconUrl = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
        const date = new Date(forecast.dt_txt).toLocaleDateString();

        forecastDisplay.innerHTML += `
            <div class="forecast-item text-center mb-4">
                <p class="font-bold">${date}</p>
                <img src="${iconUrl}" alt="Weather Icon" class="mx-auto">
                <p>${forecast.weather[0].description.charAt(0).toUpperCase() + forecast.weather[0].description.slice(1)}</p>
                <p class="font-bold">${forecast.main.temp} ${temperatureUnit}</p>
            </div>
        `;
    });
}
