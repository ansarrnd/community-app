import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const AdminModerationScreen = lazy(() => import('./(tabs)/_adminScreen'));

export default function AdminRoute() {
  return (
    <Suspense
      fallback={
        <View style={styles.fallback}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <AdminModerationScreen />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
