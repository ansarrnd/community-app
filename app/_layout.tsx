import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { clientPersister } from '../infrastructure/storage/mmkvStorage';
import { FluidAuroraBackground } from '../components/FluidAuroraBackground';
import { OfflineBanner } from '../components/OfflineBanner';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthBootstrap } from '../application/providers/AuthBootstrap';
import { UpdatesBootstrap } from '../application/providers/UpdatesBootstrap';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours offline cache
    },
  },
});

function AppNav() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar
        style={theme.isDark ? 'light' : 'dark'}
        backgroundColor={theme.colors.bgHeader}
      />
      <FluidAuroraBackground>
        <OfflineBanner />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.bgHeader,
            },
            headerTintColor: theme.colors.textPrimary,
            headerTitleStyle: {
              fontWeight: '800',
              fontSize: 18,
            },
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="e/[id]"
            options={{
              title: 'Event Details & Invitation',
              headerBackTitle: 'Back',
            }}
          />
        </Stack>
      </FluidAuroraBackground>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: clientPersister }}>
        <ThemeProvider>
          <AuthBootstrap>
            <UpdatesBootstrap>
              <AppNav />
            </UpdatesBootstrap>
          </AuthBootstrap>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
