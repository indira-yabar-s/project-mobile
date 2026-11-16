export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Weather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  isDay: boolean;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  rainProbability: number | null;
}
