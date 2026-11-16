import { useNetworkState } from 'expo-network';

export function useIsOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkState();
  return isConnected !== false && isInternetReachable !== false;
}
