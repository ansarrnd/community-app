import { ColorSchemeName, Platform, ViewStyle } from 'react-native';

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
  bgCanvas: '#0B0D13', // Midnight Soil (Dark & Immersive)
  bgCard: 'rgba(22, 25, 34, 0.95)', // Charcoal Clay (#161922)
  bgCardSolid: '#161922',
  borderCard: '#21262D',
  bgHeader: 'rgba(11, 13, 19, 0.94)',
  bgInput: 'rgba(255, 255, 255, 0.06)',
  borderInput: '#21262D',

  accentGold: '#FBBF24',  // Nilavilakku Gold (Glowing CTAs)
  accentTeal: '#FBBF24',  // Primary Gold
  accentCyan: '#E07A5F',  // Burnished Terracotta
  accentPink: '#FDE047',  // Turmeric & Kumkum
  accentPurple: '#A78BFA',
  accentGreen: '#34D399', // Emerald Fields

  roleUser: '#34D399',
  roleMod: '#E07A5F',
  roleAdmin: '#FBBF24',

  textPrimary: '#F9F8F6', // Cream Silk
  textSecondary: '#E5E7EB',
  textMuted: '#9CA3AF',    // Granite Ash
  textInverse: '#0B0D13',

  tabBarBg: 'rgba(11, 13, 19, 0.96)',
  tabBarBorder: '#21262D',
  overlayBg: 'rgba(0, 0, 0, 0.78)',
  buttonPrimaryBg: '#FBBF24',
  buttonPrimaryText: '#0B0D13',
};



export const lightThemeColors: ThemeColors = {
  bgCanvas: '#F9F6F0',
  bgCard: '#FFFFFF',
  bgCardSolid: '#FFFFFF',
  borderCard: '#E6E1DA',
  bgHeader: 'rgba(249, 246, 240, 0.95)',
  bgInput: '#FFFFFF',
  borderInput: '#E6E1DA',

  accentTeal: '#C85A32', // Deep Terracotta
  accentCyan: '#E28743',  // Earthy Clay
  accentPink: '#BE185D',  // Affinal Rose
  accentPurple: '#7C3AED',
  accentGold: '#D97706',
  accentGreen: '#2D6A4F', // Forest Green

  roleUser: '#2D6A4F',
  roleMod: '#E28743',
  roleAdmin: '#C85A32',

  textPrimary: '#1E1E1E',
  textSecondary: '#374151',
  textMuted: '#706C61',
  textInverse: '#FFFFFF',

  tabBarBg: 'rgba(249, 246, 240, 0.96)',
  tabBarBorder: '#E6E1DA',
  overlayBg: 'rgba(0, 0, 0, 0.4)',
  buttonPrimaryBg: '#C85A32',
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

const shadowLevels = {
  card: {
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
    default: { elevation: 6 },
  },
  button: {
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
    default: { elevation: 6 },
  },
  whatsapp: {
    ios: {
      shadowColor: '#25D366',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
    default: { elevation: 6 },
  },
} as const;

export function platformShadow(level: keyof typeof shadowLevels): ViewStyle {
  const config = shadowLevels[level];
  if (Platform.OS === 'ios') {
    return config.ios;
  }
  if (Platform.OS === 'android') {
    return config.android;
  }
  return config.default;
}

export const platformBlurIntensity = {
  card: Platform.select({ ios: 20, android: 40, default: 20 }) ?? 20,
  modal: Platform.select({ ios: 35, android: 60, default: 35 }) ?? 35,
  tabBar: Platform.select({ ios: 25, android: 45, default: 25 }) ?? 25,
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
      card: platformBlurIntensity.card,
      modal: platformBlurIntensity.modal,
      tabBar: platformBlurIntensity.tabBar,
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
