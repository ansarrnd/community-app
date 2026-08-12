import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface SearchFieldProps extends Omit<TextInputProps, 'style'> {
  containerStyle?: ViewStyle;
  inputStyle?: TextInputProps['style'];
  leadingIcon?: React.ReactNode;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  containerStyle,
  inputStyle,
  leadingIcon,
  placeholderTextColor,
  accessibilityLabel,
  placeholder,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgInput,
          borderColor: colors.borderInput,
        },
        containerStyle,
      ]}
    >
      {leadingIcon}
      <TextInput
        style={[styles.input, { color: colors.textPrimary }, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? colors.textMuted}
        accessibilityRole="search"
        accessibilityLabel={accessibilityLabel ?? placeholder ?? 'Search'}
        {...textInputProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 46,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: undefined,
  },
});
