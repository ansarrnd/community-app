import React, { useEffect } from 'react';
import * as Updates from 'expo-updates';

/**
 * Checks for OTA updates on production builds (skipped in dev and web export).
 */
export function UpdatesBootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (!cancelled && update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.warn('[UpdatesBootstrap] OTA check failed:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return children;
}
