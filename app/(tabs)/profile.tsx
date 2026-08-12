import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const ProfileScreen = lazy(() => import('./_profileScreen'));

export default function ProfileTab() {
  return (
    <Suspense
      fallback={
        <View style={styles.fallback}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <ProfileScreen />
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
