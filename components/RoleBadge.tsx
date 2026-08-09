import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserRole } from '../domain/models/User';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { Shield, ShieldAlert, UserCheck } from 'lucide-react-native';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showIcon = true }) => {
  const { theme } = useTheme();

  let badgeBg = 'rgba(0, 230, 118, 0.16)';
  let badgeBorder = 'rgba(0, 230, 118, 0.45)';
  let textColor = theme.colors.roleUser;
  let IconComponent = UserCheck;

  if (role === 'MOD') {
    badgeBg = 'rgba(255, 184, 0, 0.18)';
    badgeBorder = 'rgba(255, 184, 0, 0.45)';
    textColor = theme.colors.roleMod;
    IconComponent = Shield;
  } else if (role === 'ADMIN') {
    badgeBg = 'rgba(255, 42, 109, 0.18)';
    badgeBorder = 'rgba(255, 42, 109, 0.45)';
    textColor = theme.colors.roleAdmin;
    IconComponent = ShieldAlert;
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
      {showIcon && <IconComponent size={12} color={textColor} style={{ marginRight: 4 }} />}
      <ThemedText style={[styles.text, { color: textColor }]}>{role}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
