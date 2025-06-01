import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState('');
  const [tempC, setTempC] = useState('');
  const [desc, setDesc] = useState('');
  const [humidity, setHumidity] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [bgColor, setBgColor] = useState('bg-slate-100');
  const [emoji, setEmoji] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('C');
  const [recentCities, setRecentCities] = useState([]);

  const handleCity = (evt) => {
    setCity(evt.target.value);
  };

  const getTemp = () => {
    if (tempC === '') return '';
    return unit === 'C'
      ? `${tempC}°C`
      : `${((parseFloat(tempC) * 9) / 5 + 32).toFixed(2)}°F`;
  };

  const saveRecentCity = (cityName) => {
    setRecentCities((prev) => {
      const cityUpper = cityName.toUpperCase();
      if (prev.includes(cityUpper)) return prev;
      return [cityUpper, ...prev].slice(0, 5);
    });
  };

  const fetchWeatherByCity = (cityName) => {
    if (!cityName.trim()) {
      setError('Please enter a city name.');
      resetWeather(false);
      return;
    }
    setLoading(true);
    setError('');
    axios(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=bf6a374240d8d5de42662d122629687a`)
      .then((response) => {
        const data = response.data;
        const weatherMain = data.weather[0].main.toLowerCase();

        setWeather(data.weather[0].main);
        setDesc(data.weather[0].description);
        setTempC((data.main.temp - 273.15).toFixed(2));
        setHumidity(data.main.humidity);
        setWindSpeed(data.wind.speed);
        setBgColor(getBgColor(weatherMain));
        setEmoji(getWeatherEmoji(weatherMain));
        setCity(cityName);
        saveRecentCity(cityName);
      })
      .catch(() => {
        setError('City not found. Please check the name and try again.');
        resetWeather(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getWeather = () => {
    fetchWeatherByCity(city);
  };

  const resetWeather = (clearCity = true) => {
    if (clearCity) setCity('');
    setWeather('');
    setTempC('');
    setDesc('');
    setHumidity('');
    setWindSpeed('');
    setEmoji('');
    setBgColor('bg-slate-100');
    setError('');
    setLoading(false);
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  const fetchWeatherByCoords = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        axios(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=bf6a374240d8d5de42662d122629687a`)
          .then((response) => {
            const data = response.data;
            const weatherMain = data.weather[0].main.toLowerCase();

            setWeather(data.weather[0].main);
            setDesc(data.weather[0].description);
            setTempC((data.main.temp - 273.15).toFixed(2));
            setHumidity(data.main.humidity);
            setWindSpeed(data.wind.speed);
            setBgColor(getBgColor(weatherMain));
            setEmoji(getWeatherEmoji(weatherMain));
            setCity(data.name);
            saveRecentCity(data.name);
          })
          .catch(() => {
            setError('Failed to fetch weather for your location.');
            resetWeather(false);
          })
          .finally(() => {
            setLoading(false);
          });
      },
      () => {
        setError('Permission denied for location.');
        setLoading(false);
      }
    );
  };

  const getWeatherEmoji = (condition) => {
    switch (condition) {
      case 'clear': return '☀️';
      case 'clouds': return '☁️';
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      case 'thunderstorm': return '⚡';
      case 'mist':
      case 'fog': return '🌫️';
      default: return '🌤️';
    }
  };

  const getBgColor = (condition) => {
    switch (condition) {
      case 'clear': return 'bg-yellow-100';
      case 'clouds': return 'bg-gray-200';
      case 'rain': return 'bg-blue-200';
      case 'snow': return 'bg-blue-100';
      case 'thunderstorm': return 'bg-purple-200';
      case 'mist':
      case 'fog': return 'bg-gray-100';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${bgColor}`}>
      <div className='w-full max-w-xl bg-white rounded-xl shadow-lg p-6'>
        <h1 className='text-4xl font-bold text-center mb-6'>⛅ Weather App</h1>

        {/* Input box */}
        <input
          onChange={handleCity}
          value={city}
          className='border border-blue-500 h-10 px-3 py-2 text-xl rounded-lg focus:outline-blue-500 w-full mb-4'
          placeholder='Enter your city...'
        />

        {/* Buttons under input box */}
        <div className='flex flex-col md:flex-row gap-3 justify-center mb-6'>
          <button
            onClick={getWeather}
            disabled={!city.trim()}
            className={`px-4 py-2 rounded-md w-full md:w-auto ${
              city.trim() ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-300 text-white cursor-not-allowed'
            }`}
          >
            Get Details
          </button>
          <button
            onClick={() => resetWeather()}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md w-full md:w-auto'
          >
            Home
          </button>
          <button
            onClick={toggleUnit}
            className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md w-full md:w-auto'
            title='Toggle °C/°F'
          >
            Toggle °C/°F
          </button>
          <button
            onClick={fetchWeatherByCoords}
            className='bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md w-full md:w-auto'
            title='Get weather for your current location'
          >
            Use My Location
          </button>
        </div>

        {/* Recent cities */}
        {recentCities.length > 0 && (
          <div className='mb-6'>
            <h3 className='font-semibold mb-2'>Recent Cities:</h3>
            <div className='flex flex-wrap gap-2'>
              {recentCities.map((c) => (
                <button
                  key={c}
                  onClick={() => fetchWeatherByCity(c)}
                  className='bg-gray-300 hover:bg-gray-400 rounded px-3 py-1 text-sm'
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading/Error Messages */}
        {loading && <p className='text-center text-blue-600 font-semibold mb-4'>Loading weather data...</p>}
        {error && <p className='text-center text-red-500 font-semibold mb-4'>{error}</p>}

        {/* Weather Info */}
        {!loading && !error && weather && (
          <div className='bg-white bg-opacity-90 backdrop-blur-md p-6 rounded-lg shadow-md'>
            <h2 className='text-2xl font-bold mb-2 text-center'>
              📍 {city.toUpperCase()}
            </h2>
            <div className='text-center text-4xl mb-4 animate-bounce'>{emoji} {weather}</div>
            <div className='text-center text-xl mb-2 capitalize'>{desc}</div>
            <div className='text-center text-2xl mb-2'>🌡️ {getTemp()}</div>
            <div className='text-center text-lg mb-1'>💧 Humidity: {humidity}%</div>
            <div className='text-center text-lg'>🌬️ Wind Speed: {windSpeed} m/s</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
