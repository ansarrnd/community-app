import React from 'react';
import { Pressable, PressableProps, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

export interface SegmentPillProps extends Omit<PressableProps, 'style'> {
  label: string;
  selected?: boolean;
  style?: ViewStyle;
  flex?: boolean;
  compact?: boolean;
  icon?: React.ReactNode;
}

export const SegmentPill: React.FC<SegmentPillProps> = ({
  label,
  selected = false,
  style,
  flex = false,
  compact = false,
  icon,
  ...pressableProps
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const textColor = selected ? colors.segmentTextActive : colors.segmentText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.pill,
        compact && styles.pillCompact,
        flex && styles.pillFlex,
        {
          backgroundColor: selected ? colors.segmentBgActive : colors.segmentBg,
          borderColor: selected ? colors.segmentBorderActive : colors.segmentBorder,
        },
        icon != null && styles.pillWithIcon,
        pressed && { opacity: 0.85 },
        style,
      ]}
      {...pressableProps}
    >
      {icon}
      <ThemedText
        variant="caption"
        bold={selected}
        style={[
          compact && styles.compactText,
          { color: textColor },
          icon != null && styles.labelWithIcon,
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  pillCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
  },
  pillFlex: {
    flex: 1,
    marginRight: 6,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  pillWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWithIcon: {
    marginLeft: 6,
  },
  compactText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
