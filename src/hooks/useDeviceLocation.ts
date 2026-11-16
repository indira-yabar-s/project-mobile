import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import type { Coordinates } from '../types/weather';
import { DEFAULT_COORDINATES } from '../utils/weather';

export type LocationPermission = 'unknown' | 'granted' | 'denied' | 'blocked';
export type LocationSource = 'device' | 'default';

const LOCATION_TIMEOUT_MS = 15000;

const toPermission = (response: Location.LocationPermissionResponse): LocationPermission => {
  if (response.granted) return 'granted';
  return response.canAskAgain ? 'denied' : 'blocked';
};

const readPosition = async (): Promise<Coordinates> => {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('timeout')), LOCATION_TIMEOUT_MS);
  });
  const position = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    timeout,
  ]);
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
};

export function useDeviceLocation() {
  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [source, setSource] = useState<LocationSource>('default');
  const [permission, setPermission] = useState<LocationPermission>('unknown');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const locate = useCallback(async () => {
    try {
      const position = await readPosition();
      setCoordinates(position);
      setSource('device');
      setLocationError(null);
    } catch {
      setLocationError('No pudimos obtener tu ubicación. Mostramos el clima de Gamarra.');
    } finally {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    Location.getForegroundPermissionsAsync()
      .then(async (response) => {
        if (isCancelled) return;
        setPermission(toPermission(response));
        if (response.granted) {
          setIsLocating(true);
          await locate();
        }
      })
      .catch(() => {
        if (!isCancelled) setPermission('denied');
      });

    return () => {
      isCancelled = true;
    };
  }, [locate]);

  const requestLocation = useCallback(async () => {
    setLocationError(null);
    setIsLocating(true);
    try {
      const response = await Location.requestForegroundPermissionsAsync();
      setPermission(toPermission(response));
      if (response.granted) {
        await locate();
      } else {
        setIsLocating(false);
      }
    } catch {
      setPermission('denied');
      setIsLocating(false);
      setLocationError('No pudimos pedir el permiso de ubicación.');
    }
  }, [locate]);

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => undefined);
  }, []);

  return { coordinates, source, permission, isLocating, locationError, requestLocation, openSettings };
}
