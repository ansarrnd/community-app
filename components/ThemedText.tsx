import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { themeTypography } from '../constants/theme';

export interface ThemedTextProps extends TextProps {
  variant?: keyof typeof themeTypography;
  color?: string;
  secondary?: boolean;
  muted?: boolean;
  center?: boolean;
  bold?: boolean;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  style,
  variant = 'body',
  color,
  secondary,
  muted,
  center,
  bold,
  ...rest
}) => {
  const { theme } = useTheme();

  let textColor = theme.colors.textPrimary;
  if (color) {
    textColor = color;
  } else if (secondary) {
    textColor = theme.colors.textSecondary;
  } else if (muted) {
    textColor = theme.colors.textMuted;
  }

  const typographyStyle = theme.typography[variant] || theme.typography.body;

  return (
    <Text
      style={[
        styles.base,
        typographyStyle,
        { color: textColor },
        center && styles.center,
        bold && styles.bold,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: undefined, // Uses native system font (San Francisco on iOS)
  },
  center: {
    textAlign: 'center',
  },
  bold: {
    fontWeight: '700',
  },
});
