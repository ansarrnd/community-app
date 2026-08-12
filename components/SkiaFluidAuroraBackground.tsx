import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Canvas, Circle, BlurMask } from '@shopify/react-native-skia';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

/**
 * Skia-powered aurora mesh — used on iOS when New Architecture is enabled.
 */
export const SkiaFluidAuroraBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
      <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Circle
          cx={width * 0.15}
          cy={height * 0.12}
          r={width * 0.45}
          color={theme.colors.auroraPrimary}
        >
          <BlurMask blur={80} style="normal" />
        </Circle>
        <Circle
          cx={width * 0.85}
          cy={height * 0.35}
          r={width * 0.48}
          color={theme.isDark ? 'rgba(127, 0, 255, 0.3)' : 'rgba(124, 58, 237, 0.15)'}
        >
          <BlurMask blur={90} style="normal" />
        </Circle>
        {Platform.OS !== 'android' && (
          <Circle
            cx={width * 0.2}
            cy={height * 0.88}
            r={width * 0.42}
            color={theme.isDark ? 'rgba(255, 42, 109, 0.22)' : 'rgba(236, 72, 153, 0.14)'}
          >
            <BlurMask blur={75} style="normal" />
          </Circle>
        )}
      </Canvas>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
