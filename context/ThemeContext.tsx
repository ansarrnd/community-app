import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, ThemeMode, getAppTheme } from '../constants/theme';
import { storage } from '../infrastructure/storage/mmkvStorage';

interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const THEME_STORAGE_KEY = 'COMMUNITY_APP_THEME_MODE';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    const savedMode = storage.getString(THEME_STORAGE_KEY) as ThemeMode | undefined;
    if (savedMode && (savedMode === 'dark' || savedMode === 'light' || savedMode === 'system')) {
      setThemeModeState(savedMode);
    }
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    storage.set(THEME_STORAGE_KEY, mode);
  };

  const theme = getAppTheme(systemColorScheme, themeMode);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return fallback dark theme if used outside provider
    const fallbackTheme = getAppTheme('dark', 'dark');
    return {
      theme: fallbackTheme,
      themeMode: 'dark',
      setThemeMode: () => {},
    };
  }
  return context;
};
