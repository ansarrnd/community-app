import React from 'react';
import { Pressable, PressableProps, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemedText } from '../ThemedText';

export interface SelectableCardProps extends Omit<PressableProps, 'style'> {
  title: string;
  description?: string;
  selected?: boolean;
  trailingIcon?: React.ReactNode;
  style?: ViewStyle;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  title,
  description,
  selected = false,
  trailingIcon,
  style,
  ...pressableProps
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? colors.segmentBgActive : colors.segmentBg,
          borderColor: selected ? colors.segmentBorderActive : colors.segmentBorder,
        },
        pressed && { opacity: 0.85 },
        style,
      ]}
      {...pressableProps}
    >
      <View style={styles.header}>
        <ThemedText
          variant="subtitle"
          bold={selected}
          style={{ color: selected ? colors.segmentTextActive : colors.segmentText }}
        >
          {title}
        </ThemedText>
        {selected && trailingIcon}
      </View>
      {description != null && (
        <ThemedText variant="caption" muted style={styles.description}>
          {description}
        </ThemedText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    marginTop: 2,
  },
});
