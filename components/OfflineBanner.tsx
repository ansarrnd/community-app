import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';
import { useNetworkGuard } from '../application/hooks/useNetworkGuard';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

export const OfflineBanner: React.FC = () => {
  const { isConnected } = useNetworkGuard();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  if (isConnected) return null;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: theme.isDark ? 'rgba(255, 184, 0, 0.18)' : 'rgba(217, 119, 6, 0.12)',
          borderColor: theme.colors.accentGold,
        },
      ]}
    >
      <WifiOff size={16} color={theme.colors.accentGold} style={styles.icon} />
      <ThemedText variant="caption" style={[styles.text, { color: theme.colors.accentGold }]}>
        Offline Mode: Showing cached events. Writes are queued.
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
  },
});
