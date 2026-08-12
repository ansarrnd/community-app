import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, ThemeContext } from '../../context/ThemeContext';
import { getAppTheme, ThemeMode } from '../../constants/theme';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ThemeProvider>{children}</ThemeProvider>
    </SafeAreaProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

/** Fixed theme for snapshot matrix without async storage reads */
export function renderWithThemeMode(
  ui: React.ReactElement,
  themeMode: ThemeMode,
  options?: RenderOptions
) {
  const isDark = themeMode === 'dark';
  const theme = getAppTheme(isDark ? 'dark' : 'light', themeMode);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ThemeContext.Provider
        value={{
          theme,
          themeMode,
          setThemeMode: () => {},
        }}
      >
        {children}
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}
