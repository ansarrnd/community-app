import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { SkiaFluidAuroraBackground } from './SkiaFluidAuroraBackground';

const { width, height } = Dimensions.get('window');

const USE_SKIA_AURORA =
  process.env.EXPO_PUBLIC_USE_SKIA_AURORA === 'true' && Platform.OS !== 'web';

export const FluidAuroraBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (USE_SKIA_AURORA) {
    return <SkiaFluidAuroraBackground>{children}</SkiaFluidAuroraBackground>;
  }

  return <LinearGradientAuroraBackground>{children}</LinearGradientAuroraBackground>;
};

const LinearGradientAuroraBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
      {/* Base Canvas Background */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.bgCanvas }]} />

      {/* Aurora Mesh Node 1 - Top Left Glow */}
      <LinearGradient
        colors={[theme.colors.auroraPrimary, 'transparent']}
        style={[
          styles.auroraOrb,
          {
            top: -100,
            left: -80,
            width: width * 0.9,
            height: width * 0.9,
            borderRadius: width * 0.45,
          },
        ]}
      />

      {/* Aurora Mesh Node 2 - Center Right Glow */}
      <LinearGradient
        colors={[
          theme.isDark ? 'rgba(127, 0, 255, 0.3)' : 'rgba(124, 58, 237, 0.15)',
          'transparent',
        ]}
        style={[
          styles.auroraOrb,
          {
            top: height * 0.25,
            right: -100,
            width: width * 0.95,
            height: width * 0.95,
            borderRadius: width * 0.47,
          },
        ]}
      />

      {/* Aurora Mesh Node 3 - Bottom Left Glow (skipped on Android for perf) */}
      {Platform.OS !== 'android' && (
        <LinearGradient
          colors={[
            theme.isDark ? 'rgba(255, 42, 109, 0.22)' : 'rgba(236, 72, 153, 0.14)',
            'transparent',
          ]}
          style={[
            styles.auroraOrb,
            {
              bottom: -100,
              left: -50,
              width: width * 0.85,
              height: width * 0.85,
              borderRadius: width * 0.42,
            },
          ]}
        />
      )}

      {/* Content Container */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  auroraOrb: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
