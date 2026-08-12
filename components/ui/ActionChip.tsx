import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';
import { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { ThemedText } from '../ThemedText';

export type ActionChipVariant = 'success' | 'danger' | 'accent';

export interface ActionChipColors {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}

export interface ActionChipProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant: ActionChipVariant;
  selected?: boolean;
  icon?: React.ReactNode;
  compact?: boolean;
  style?: ViewStyle;
}

export function getActionChipColors(
  colors: ThemeColors,
  variant: ActionChipVariant,
  selected: boolean
): ActionChipColors {
  if (!selected) {
    return {
      backgroundColor: colors.segmentBg,
      borderColor: colors.segmentBorder,
      textColor: colors.segmentText,
      iconColor: colors.textMuted,
    };
  }

  switch (variant) {
    case 'success':
      return {
        backgroundColor: colors.chipSuccessBg,
        borderColor: colors.chipSuccessBorder,
        textColor: colors.chipSuccessText,
        iconColor: colors.chipSuccessText,
      };
    case 'danger':
      return {
        backgroundColor: colors.chipDangerBg,
        borderColor: colors.chipDangerBorder,
        textColor: colors.chipDangerText,
        iconColor: colors.chipDangerText,
      };
    case 'accent':
      return {
        backgroundColor: colors.segmentBgActive,
        borderColor: colors.segmentBorderActive,
        textColor: colors.segmentTextActive,
        iconColor: colors.segmentTextActive,
      };
  }
}

export const ActionChip: React.FC<ActionChipProps> = ({
  label,
  variant,
  selected = true,
  icon,
  compact = false,
  style,
  ...pressableProps
}) => {
  const { theme } = useTheme();
  const chipColors = getActionChipColors(theme.colors, variant, selected);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        compact && styles.chipCompact,
        icon != null && styles.chipWithIcon,
        {
          backgroundColor: chipColors.backgroundColor,
          borderColor: chipColors.borderColor,
        },
        pressed && { opacity: 0.8 },
        style,
      ]}
      {...pressableProps}
    >
      {icon}
      <ThemedText
        variant="caption"
        bold
        style={[
          icon != null && styles.labelWithIcon,
          { color: chipColors.textColor },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelWithIcon: {
    marginLeft: 4,
  },
});
