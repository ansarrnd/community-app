export const VillageThemeLight = {
  colors: {
    primary: '#C85A32',
    secondary: '#E28743',
    background: '#F9F6F0',
    surface: '#FFFFFF',
    textPrimary: '#1E1E1E',
    textMuted: '#706C61',
    border: '#E6E1DA',
    tags: {
      inVillageBg: '#E1F0E5',
      inVillageText: '#2D6A4F',
      outVillageBg: '#E2EAFC',
      outVillageText: '#1D4ED8',
      affinalBg: '#FDF2F8',
      affinalText: '#BE185D',
    },
    lineageBorders: {
      PATERNAL: '#C85A32',
      MATERNAL: '#1D4ED8',
      AFFINAL: '#BE185D',
      NUCLEAR: '#E28743',
      COUSIN: '#8B5CF6',
      EXTERNAL: '#6B7280',
      SOCIAL: '#10B981',
      GENERAL: '#706C61',
    },
  },
  typography: {
    screenTitle: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
    cardHeader: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
    tagLabel: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
    bodyText: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 8, md: 12, lg: 16 },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
  },
};

export const TamilFusionDarkTheme = {
  colors: {
    background: '#0B0D13',       // Midnight Soil (Dark & Immersive)
    surface: '#161922',          // Charcoal Clay (Elevated Cards)
    primary: '#FBBF24',          // Nilavilakku Gold (Glowing CTAs)
    secondary: '#E07A5F',        // Burnished Terracotta (Accents)
    textPrimary: '#F9F8F6',      // Cream Silk (Supreme Legibility)
    textMuted: '#9CA3AF',        // Granite Ash (Metadata)
    border: '#21262D',           // Sleek Dark Border
    badges: {
      inVillageBg: '#064E3B',
      inVillageText: '#34D399',
      outVillageBg: '#1E3A8A',
      outVillageText: '#60A5FA',
      affinalBg: '#451A03',
      affinalText: '#FDE047',
    },
    tags: {
      inVillageBg: '#064E3B',
      inVillageText: '#34D399',
      outVillageBg: '#1E3A8A',
      outVillageText: '#60A5FA',
      affinalBg: '#451A03',
      affinalText: '#FDE047',
    },
    lineageBorders: {
      PATERNAL: '#FBBF24', // Nilavilakku Gold
      MATERNAL: '#60A5FA', // Deep Blue City
      AFFINAL: '#FDE047',  // Turmeric Gold
      NUCLEAR: '#E07A5F',  // Burnished Terracotta
      COUSIN: '#A78BFA',
      EXTERNAL: '#9CA3AF',
      SOCIAL: '#34D399',   // Emerald Fields
      GENERAL: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: 'System',
    title: { fontSize: 20, fontWeight: '700' as const, color: '#F9F8F6' },
    subtitle: { fontSize: 16, fontWeight: '600' as const, color: '#FBBF24' },
    body: { fontSize: 14, fontWeight: '400' as const, color: '#F9F8F6' },
    caption: { fontSize: 12, fontWeight: '400' as const, color: '#9CA3AF' },
  },
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 6,
    },
  },
};

export const DarkThemes = {
  NILAVILAKKU_KANCHEEPURAM_MIDNIGHT: {
    name: 'Nilavilakku & Kancheepuram Midnight',
    colors: TamilFusionDarkTheme.colors,
  },
  OBSIDIAN_CYBER_MINT: {
    name: 'Obsidian & Cyber Mint',
    colors: {
      background: '#0F1117',
      surface: '#161922',
      primary: '#00F5D4',
      secondary: '#6366F1',
      textPrimary: '#F3F4F6',
      textMuted: '#9CA3AF',
      border: '#21262D',
      tags: {
        inVillageBg: '#064E3B',
        inVillageText: '#34D399',
        outVillageBg: '#1E3A8A',
        outVillageText: '#60A5FA',
        affinalBg: '#4A1525',
        affinalText: '#FF85A1',
      },
      lineageBorders: {
        PATERNAL: '#00F5D4',
        MATERNAL: '#60A5FA',
        AFFINAL: '#FF85A1',
        NUCLEAR: '#6366F1',
        COUSIN: '#A78BFA',
        EXTERNAL: '#9CA3AF',
        SOCIAL: '#34D399',
        GENERAL: '#9CA3AF',
      },
    },
  },
  MIDNIGHT_TERRACOTTA: {
    name: 'Midnight Terracotta',
    colors: {
      background: '#12100E',
      surface: '#1C1815',
      primary: '#E07A5F',
      secondary: '#F4A261',
      textPrimary: '#FDFBF7',
      textMuted: '#8C827B',
      border: '#2A241F',
      tags: {
        inVillageBg: '#1B3B2B',
        inVillageText: '#52B788',
        outVillageBg: '#1D2A44',
        outVillageText: '#70A9FF',
        affinalBg: '#4A1525',
        affinalText: '#FF85A1',
      },
      lineageBorders: {
        PATERNAL: '#E07A5F',
        MATERNAL: '#70A9FF',
        AFFINAL: '#FF85A1',
        NUCLEAR: '#F4A261',
        COUSIN: '#B5838D',
        EXTERNAL: '#8C827B',
        SOCIAL: '#52B788',
        GENERAL: '#8C827B',
      },
    },
  },
  OLED_NEON_MINIMAL: {
    name: 'OLED Neon Minimal',
    colors: {
      background: '#000000',
      surface: '#121212',
      primary: '#8B5CF6',
      secondary: '#FF5722',
      textPrimary: '#FFFFFF',
      textMuted: '#A1A1AA',
      border: '#262626',
      tags: {
        inVillageBg: '#064E3B',
        inVillageText: '#10B981',
        outVillageBg: '#1E1B4B',
        outVillageText: '#818CF8',
        affinalBg: '#831843',
        affinalText: '#F472B6',
      },
      lineageBorders: {
        PATERNAL: '#8B5CF6',
        MATERNAL: '#818CF8',
        AFFINAL: '#F472B6',
        NUCLEAR: '#FF5722',
        COUSIN: '#C084FC',
        EXTERNAL: '#A1A1AA',
        SOCIAL: '#10B981',
        GENERAL: '#A1A1AA',
      },
    },
  },
};

export const VillageTheme = VillageThemeLight;

export function getVillageTheme(
  isDark: boolean = false,
  preset: keyof typeof DarkThemes = 'NILAVILAKKU_KANCHEEPURAM_MIDNIGHT'
) {
  if (!isDark) {
    return VillageThemeLight;
  }
  const darkConfig = DarkThemes[preset] || DarkThemes.NILAVILAKKU_KANCHEEPURAM_MIDNIGHT;
  return {
    ...VillageThemeLight,
    colors: darkConfig.colors,
    shadows: {
      card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
      },
    },
  };
}
