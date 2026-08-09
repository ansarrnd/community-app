import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  glowColor?: string;
  intensity?: number;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  style,
  onPress,
  glowColor,
  intensity,
}) => {
  const { theme } = useTheme();
  const isWeb = Platform.OS === 'web';
  const blurIntensity = intensity ?? theme.blur.card;

  const containerContent = (
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
        style,
      ]}
    >
      {Platform.OS !== 'web' ? (
        <BlurView
          intensity={blurIntensity}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      <View style={styles.contentContainer}>{children}</View>
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
  container: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  contentContainer: {
    padding: 16,
    zIndex: 2,
  },
});
