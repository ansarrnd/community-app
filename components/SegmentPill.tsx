import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

export interface SegmentPillProps extends Omit<PressableProps, 'style'> {
  label: string;
  selected?: boolean;
  style?: ViewStyle;
  flex?: boolean;
}

export const SegmentPill: React.FC<SegmentPillProps> = ({
  label,
  selected = false,
  style,
  flex = false,
  ...pressableProps
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.pill,
        flex && styles.pillFlex,
        {
          backgroundColor: selected ? colors.segmentBgActive : colors.segmentBg,
          borderColor: selected ? colors.segmentBorderActive : colors.segmentBorder,
        },
        style,
      ]}
      {...pressableProps}
    >
      <ThemedText
        variant="caption"
        bold={selected}
        style={{ color: selected ? colors.segmentTextActive : colors.segmentText }}
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
  pillFlex: {
    flex: 1,
    marginRight: 6,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
});
