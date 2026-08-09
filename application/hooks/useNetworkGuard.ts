import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export const useNetworkGuard = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOnline = () => setIsConnected(true);
      const handleOffline = () => setIsConnected(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsConnected(navigator.onLine);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  const checkConnection = (actionName: string): boolean => {
    if (!isConnected) {
      alert(`[Offline Mode] Cannot perform "${actionName}" while offline. Please reconnect to the internet.`);
      return false;
    }
    return true;
  };

  return { isConnected, checkConnection };
};
