import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { platformShadow } from '../constants/theme';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  glowColor?: string;
  intensity?: number;
  /** Disable BlurView in lists — solid card bg is much cheaper on Android/iOS */
  blurEnabled?: boolean;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  style,
  onPress,
  glowColor,
  intensity,
  blurEnabled = true,
}) => {
  const { theme } = useTheme();
  const isWeb = Platform.OS === 'web';
  const blurIntensity = intensity ?? theme.blur.card;

  const containerContent = (
    <View style={[styles.shadowWrapper, platformShadow('card'), style]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.bgCard,
            borderColor: glowColor || theme.colors.borderCard,
          },
          glowColor ? { borderWidth: 1.5 } : null,
          isWeb &&
            ({
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            } as any),
        ]}
      >
        {blurEnabled && Platform.OS !== 'web' ? (
          <BlurView
            intensity={blurIntensity}
            tint={theme.isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}
        <View style={styles.contentContainer}>{children}</View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && { transform: [{ scale: 0.985 }], opacity: 0.92 },
        ]}
      >
        {containerContent}
      </Pressable>
    );
  }

  return containerContent;
};

const styles = StyleSheet.create({
  pressable: {
    marginVertical: 8,
  },
  shadowWrapper: {
    borderRadius: 20,
  },
  container: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  contentContainer: {
    padding: 16,
    zIndex: 2,
  },
});
