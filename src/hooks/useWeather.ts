import { useCallback } from 'react';
import { weatherService } from '../services/weatherService';
import { useDeviceLocation } from './useDeviceLocation';
import { useFetch } from './useFetch';

export function useWeather() {
  const location = useDeviceLocation();
  const { latitude, longitude } = location.coordinates;

  const forecast = useFetch(
    useCallback(
      (signal: AbortSignal) => weatherService.getCurrent({ latitude, longitude }, signal),
      [latitude, longitude],
    ),
  );

  return { forecast, location };
}
