import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import type { useWeather } from '../hooks/useWeather';
import { DEFAULT_LOCATION_LABEL, describeWeather, getBusinessTip, getWeatherErrorMessage } from '../utils/weather';
import { DashboardCard } from './DashboardCard';

type WeatherState = ReturnType<typeof useWeather>;

interface WeatherCardProps {
  forecast: WeatherState['forecast'];
  location: WeatherState['location'];
}

const formatDegrees = (value: number) => `${Math.round(value)}°`;

export function WeatherCard({ forecast, location }: WeatherCardProps) {
  const theme = useTheme();
  const { source, permission, isLocating, locationError, requestLocation, openSettings } = location;
  const weather = forecast.data;

  const description = weather ? describeWeather(weather.weatherCode, weather.isDay) : null;
  const locationLabel = source === 'device' ? 'Según tu ubicación actual' : `${DEFAULT_LOCATION_LABEL} (ubicación por defecto)`;

  return (
    <DashboardCard
      title="Clima en tu zona"
      isLoading={forecast.isLoading}
      error={forecast.error ? getWeatherErrorMessage(forecast.error) : null}
      onRetry={forecast.refetch}
      isEmpty={!weather}
      emptyText="No hay datos del clima"
    >
      {weather && description ? (
        <View>
          <View style={styles.main}>
            <MaterialCommunityIcons name={description.icon} size={56} color={theme.colors.primary} />
            <View style={styles.mainInfo}>
              <Text variant="displaySmall">{formatDegrees(weather.temperature)}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {`${description.label} · Sensación ${formatDegrees(weather.apparentTemperature)}`}
              </Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <Text variant="bodyMedium">{`Máx ${formatDegrees(weather.temperatureMax)} / Mín ${formatDegrees(weather.temperatureMin)}`}</Text>
            <Text variant="bodyMedium">{`Humedad ${Math.round(weather.humidity)}%`}</Text>
            <Text variant="bodyMedium">{`Viento ${Math.round(weather.windSpeed)} km/h`}</Text>
            {weather.rainProbability !== null ? (
              <Text variant="bodyMedium">{`Lluvia ${weather.rainProbability}%`}</Text>
            ) : null}
          </View>

          <View style={[styles.tip, { backgroundColor: theme.colors.secondaryContainer }]}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={theme.colors.onSecondaryContainer} />
            <Text variant="bodyMedium" style={[styles.tipText, { color: theme.colors.onSecondaryContainer }]}>
              {getBusinessTip(weather)}
            </Text>
          </View>

          <Text variant="bodySmall" style={[styles.source, { color: theme.colors.onSurfaceVariant }]}>
            {locationLabel}
          </Text>
          {locationError ? (
            <Text variant="bodySmall" style={{ color: theme.colors.error }}>
              {locationError}
            </Text>
          ) : null}

          {source === 'default' && permission === 'blocked' ? (
            <Button mode="outlined" icon="cog-outline" onPress={openSettings} style={styles.action}>
              Activar ubicación en Ajustes
            </Button>
          ) : null}
          {source === 'default' && permission !== 'blocked' && permission !== 'unknown' ? (
            <Button
              mode="outlined"
              icon="crosshairs-gps"
              onPress={requestLocation}
              loading={isLocating}
              disabled={isLocating}
              style={styles.action}
            >
              Usar mi ubicación
            </Button>
          ) : null}
        </View>
      ) : null}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  main: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  mainInfo: { flex: 1 },
  metrics: { columnGap: 16, flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, rowGap: 4 },
  tip: { alignItems: 'flex-start', borderRadius: 12, flexDirection: 'row', gap: 8, marginTop: 12, padding: 12 },
  tipText: { flex: 1 },
  source: { marginTop: 12 },
  action: { marginTop: 12 },
});
