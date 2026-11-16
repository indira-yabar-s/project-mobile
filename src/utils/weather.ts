import axios from 'axios';
import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Coordinates, Weather } from '../types/weather';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const DEFAULT_COORDINATES: Coordinates = { latitude: -12.0653, longitude: -77.0126 };

export const DEFAULT_LOCATION_LABEL = 'Gamarra, Lima';

interface WeatherDescription {
  label: string;
  icon: IconName;
}

export const describeWeather = (code: number, isDay: boolean): WeatherDescription => {
  if (code === 0) return isDay ? { label: 'Despejado', icon: 'weather-sunny' } : { label: 'Despejado', icon: 'weather-night' };
  if (code === 1) return isDay ? { label: 'Mayormente despejado', icon: 'weather-sunny' } : { label: 'Mayormente despejado', icon: 'weather-night' };
  if (code === 2) return { label: 'Parcialmente nublado', icon: isDay ? 'weather-partly-cloudy' : 'weather-night-partly-cloudy' };
  if (code === 3) return { label: 'Nublado', icon: 'weather-cloudy' };
  if (code === 45 || code === 48) return { label: 'Neblina', icon: 'weather-fog' };
  if (code >= 51 && code <= 57) return { label: 'Llovizna', icon: 'weather-rainy' };
  if (code >= 61 && code <= 67) return { label: 'Lluvia', icon: 'weather-pouring' };
  if (code >= 71 && code <= 77) return { label: 'Nieve', icon: 'weather-snowy' };
  if (code >= 80 && code <= 82) return { label: 'Chubascos', icon: 'weather-pouring' };
  if (code === 85 || code === 86) return { label: 'Chubascos de nieve', icon: 'weather-snowy-heavy' };
  if (code >= 95) return { label: 'Tormenta', icon: 'weather-lightning-rainy' };
  return { label: 'Sin datos', icon: 'weather-cloudy' };
};

export const getBusinessTip = (weather: Weather): string => {
  if (weather.rainProbability !== null && weather.rainProbability >= 50) {
    return 'Hoy podría llover: poca gente en la tienda. Impulsa tus ventas por WhatsApp e Instagram.';
  }
  if (weather.temperatureMax >= 26) {
    return 'Día caluroso: buen momento para destacar polos, shorts y prendas ligeras.';
  }
  if (weather.temperatureMax <= 18) {
    return 'Día fresco: destaca casacas, polos manga larga y prendas de abrigo.';
  }
  return 'Clima templado: mantén visible tu stock de temporada y tus prendas más vendidas.';
};

export const getWeatherErrorMessage = (error: unknown): string | null => {
  if (axios.isCancel(error)) return null;
  if (axios.isAxiosError(error) && !error.response) {
    return 'No se pudo consultar el clima. Revisa tu conexión a internet.';
  }
  return 'El servicio del clima no está disponible por ahora.';
};
