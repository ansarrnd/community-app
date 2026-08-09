import { ColorSchemeName } from 'react-native';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeColors {
  bgCanvas: string;
  bgCard: string;
  bgCardSolid: string;
  borderCard: string;
  bgHeader: string;
  bgInput: string;
  borderInput: string;
  
  // Accents
  accentTeal: string;
  accentCyan: string;
  accentPink: string;
  accentPurple: string;
  accentGold: string;
  accentGreen: string;

  // Role Badges
  roleUser: string;
  roleMod: string;
  roleAdmin: string;

  // Text Legibility
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // UI States & Overlays
  tabBarBg: string;
  tabBarBorder: string;
  overlayBg: string;
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
}

export const darkThemeColors: ThemeColors = {
  bgCanvas: '#0B081F',
  bgCard: 'rgba(255, 255, 255, 0.08)',
  bgCardSolid: '#161233',
  borderCard: 'rgba(255, 255, 255, 0.18)',
  bgHeader: 'rgba(15, 11, 30, 0.88)',
  bgInput: 'rgba(255, 255, 255, 0.08)',
  borderInput: 'rgba(255, 255, 255, 0.22)',

  accentTeal: '#00F2FE',
  accentCyan: '#4FACFE',
  accentPink: '#FF2A6D',
  accentPurple: '#9B51E0',
  accentGold: '#FFB800',
  accentGreen: '#00E676',

  roleUser: '#00E676',
  roleMod: '#FFB800',
  roleAdmin: '#FF2A6D',

  textPrimary: '#FFFFFF',
  textSecondary: '#D6DCF5',
  textMuted: '#9BA6D0',
  textInverse: '#0B081F',

  tabBarBg: 'rgba(11, 8, 31, 0.92)',
  tabBarBorder: 'rgba(255, 255, 255, 0.14)',
  overlayBg: 'rgba(0, 0, 0, 0.7)',
  buttonPrimaryBg: '#00F2FE',
  buttonPrimaryText: '#0B081F',
};

export const lightThemeColors: ThemeColors = {
  bgCanvas: '#F3F5FA',
  bgCard: 'rgba(255, 255, 255, 0.88)',
  bgCardSolid: '#FFFFFF',
  borderCard: 'rgba(0, 0, 0, 0.12)',
  bgHeader: 'rgba(255, 255, 255, 0.92)',
  bgInput: 'rgba(0, 0, 0, 0.05)',
  borderInput: 'rgba(0, 0, 0, 0.16)',

  accentTeal: '#007AFF',
  accentCyan: '#0091FF',
  accentPink: '#E53935',
  accentPurple: '#7C3AED',
  accentGold: '#D97706',
  accentGreen: '#059669',

  roleUser: '#059669',
  roleMod: '#D97706',
  roleAdmin: '#DC2626',

  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',

  tabBarBg: 'rgba(255, 255, 255, 0.94)',
  tabBarBorder: 'rgba(0, 0, 0, 0.1)',
  overlayBg: 'rgba(0, 0, 0, 0.4)',
  buttonPrimaryBg: '#007AFF',
  buttonPrimaryText: '#FFFFFF',
};

export const themeTypography = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodyBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
};

export const themeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const themeRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export interface AppTheme {
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof themeTypography;
  spacing: typeof themeSpacing;
  borderRadius: typeof themeRadius;
  blur: {
    card: number;
    modal: number;
    tabBar: number;
  };
  auroraMesh: Array<{ color: string; x: number; y: number; radius: number }>;
}

export function getAppTheme(colorScheme: ColorSchemeName, mode: ThemeMode): AppTheme {
  const isDark = mode === 'dark' || (mode === 'system' && colorScheme === 'dark');
  const colors = isDark ? darkThemeColors : lightThemeColors;

  return {
    isDark,
    colors,
    typography: themeTypography,
    spacing: themeSpacing,
    borderRadius: themeRadius,
    blur: {
      card: 20,
      modal: 35,
      tabBar: 25,
    },
    auroraMesh: isDark
      ? [
          { color: 'rgba(127, 0, 255, 0.35)', x: 0.1, y: 0.1, radius: 250 },
          { color: 'rgba(0, 242, 254, 0.25)', x: 0.8, y: 0.3, radius: 300 },
          { color: 'rgba(255, 8, 68, 0.25)', x: 0.5, y: 0.8, radius: 280 },
        ]
      : [
          { color: 'rgba(59, 130, 246, 0.18)', x: 0.1, y: 0.1, radius: 250 },
          { color: 'rgba(147, 51, 234, 0.15)', x: 0.8, y: 0.3, radius: 300 },
          { color: 'rgba(236, 72, 153, 0.15)', x: 0.5, y: 0.8, radius: 280 },
        ],
  };
}

// Re-export legacy glassTheme reference mapping to theme for backward compatibility
export const glassTheme = {
  colors: darkThemeColors,
  blur: { card: 20, modal: 35, tabBar: 25 },
  borderRadius: themeRadius,
  auroraMesh: [
    { color: 'rgba(127, 0, 255, 0.35)', x: 0.1, y: 0.1, radius: 250 },
    { color: 'rgba(0, 242, 254, 0.25)', x: 0.8, y: 0.3, radius: 300 },
    { color: 'rgba(255, 8, 68, 0.25)', x: 0.5, y: 0.8, radius: 280 },
  ],
};
