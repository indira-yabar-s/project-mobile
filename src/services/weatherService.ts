import axios from 'axios';
import type { Coordinates, Weather } from '../types/weather';

const weatherApi = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  timeout: 10000,
});

interface ForecastResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
  };
}

const roundCoordinate = (value: number) => Math.round(value * 100) / 100;

export const weatherService = {
  async getCurrent({ latitude, longitude }: Coordinates, signal?: AbortSignal): Promise<Weather> {
    const { data } = await weatherApi.get<ForecastResponse>('/forecast', {
      params: {
        latitude: roundCoordinate(latitude),
        longitude: roundCoordinate(longitude),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: 1,
      },
      signal,
    });

    return {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      isDay: data.current.is_day === 1,
      weatherCode: data.current.weather_code,
      temperatureMax: data.daily.temperature_2m_max[0],
      temperatureMin: data.daily.temperature_2m_min[0],
      rainProbability: data.daily.precipitation_probability_max[0] ?? null,
    };
  },
};
