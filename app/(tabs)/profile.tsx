import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { useUserRsvps } from '../../application/hooks/useEventsQuery';
import { LiquidGlassCard } from '../../components/LiquidGlassCard';
import { RoleBadge } from '../../components/RoleBadge';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../../context/ThemeContext';
import { useLayoutInsets } from '../../application/hooks/useLayoutInsets';
import { ThemeMode } from '../../constants/theme';
import { UserRole } from '../../domain/models/User';
import { User, Phone, ShieldCheck, CheckCircle2, Moon, Sun, Smartphone } from 'lucide-react-native';

const ROLES: { id: UserRole; title: string; desc: string }[] = [
  { id: 'USER', title: 'Resident (USER)', desc: 'Browse feed, create pending events, RSVP, share to WhatsApp.' },
  { id: 'MOD', title: 'Moderator (MOD)', desc: 'Access moderation queue, approve/reject pending events.' },
  { id: 'ADMIN', title: 'Administrator (ADMIN)', desc: 'Superuser rights, Meta WA broadcast, user role management.' },
];

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'System', icon: Smartphone },
];

export default function ProfileScreen() {
  const { user, setRole } = useAuthStore();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { contentBottomPadding } = useLayoutInsets();
  const { data: userRsvps = {} } = useUserRsvps(user.uid);
  const rsvpEntries = Object.entries(userRsvps);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: contentBottomPadding }]}
    >
      {/* Profile Card */}
      <LiquidGlassCard style={styles.profileCard} glowColor="rgba(0, 242, 254, 0.4)">
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.avatarCircle,
              {
                backgroundColor: theme.isDark ? 'rgba(0, 242, 254, 0.2)' : 'rgba(0, 122, 255, 0.15)',
                borderColor: theme.colors.accentTeal,
              },
            ]}
          >
            <User size={32} color={theme.colors.accentTeal} />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText variant="h3" style={{ marginBottom: 2 }}>
              {user.displayName}
            </ThemedText>
            <View style={styles.phoneRow}>
              <Phone size={12} color={theme.colors.textMuted} style={{ marginRight: 4 }} />
              <ThemedText variant="caption" muted>
                {user.phoneNumber}
              </ThemedText>
            </View>
          </View>
          <RoleBadge role={user.role} />
        </View>
      </LiquidGlassCard>

      {/* Theme Selection Module */}
      <ThemedText variant="subtitle" bold style={styles.sectionTitle}>
        🎨 Theme Preference
      </ThemedText>
      <ThemedText variant="caption" muted style={styles.sectionDesc}>
        Choose your preferred application color theme. Settings persist across sessions.
      </ThemedText>

      <View style={styles.themeSelectorRow}>
        {THEME_OPTIONS.map((opt) => {
          const isSelected = themeMode === opt.id;
          const IconComponent = opt.icon;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setThemeMode(opt.id)}
              style={({ pressed }) => [
                styles.themeOptionBtn,
                isSelected
                  ? {
                      backgroundColor: theme.isDark ? 'rgba(0, 242, 254, 0.22)' : 'rgba(0, 122, 255, 0.16)',
                      borderColor: theme.colors.accentTeal,
                    }
                  : {
                      backgroundColor: theme.colors.bgInput,
                      borderColor: theme.colors.borderInput,
                    },
                pressed && { opacity: 0.85 },
              ]}
            >
              <IconComponent
                size={16}
                color={isSelected ? theme.colors.accentTeal : theme.colors.textMuted}
                style={{ marginRight: 6 }}
              />
              <ThemedText
                variant="caption"
                bold={isSelected}
                style={{ color: isSelected ? theme.colors.accentTeal : theme.colors.textSecondary }}
              >
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Interactive Role Switcher Demo Control */}
      <ThemedText variant="subtitle" bold style={styles.sectionTitle}>
        <ShieldCheck size={16} color={theme.colors.accentGold} style={{ marginRight: 6 }} /> Active Role Switcher (Demo Sandbox)
      </ThemedText>
      <ThemedText variant="caption" muted style={styles.sectionDesc}>
        Select a role below to test fine-grained RBAC authorization across the navigation tabs in real-time.
      </ThemedText>

      <View style={styles.roleList}>
        {ROLES.map((r) => {
          const isSelected = user.role === r.id;
          return (
            <Pressable
              key={r.id}
              onPress={() => setRole(r.id)}
              style={[
                styles.roleCard,
                isSelected
                  ? {
                      backgroundColor: theme.isDark ? 'rgba(0, 242, 254, 0.18)' : 'rgba(0, 122, 255, 0.12)',
                      borderColor: theme.colors.accentTeal,
                    }
                  : {
                      backgroundColor: theme.colors.bgInput,
                      borderColor: theme.colors.borderInput,
                    },
              ]}
            >
              <View style={styles.roleCardHeader}>
                <ThemedText
                  variant="subtitle"
                  bold={isSelected}
                  style={{ color: isSelected ? theme.colors.accentTeal : theme.colors.textPrimary }}
                >
                  {r.title}
                </ThemedText>
                {isSelected && <CheckCircle2 size={16} color={theme.colors.accentTeal} />}
              </View>
              <ThemedText variant="caption" muted style={{ marginTop: 2 }}>
                {r.desc}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* RSVPs & Activity Summary */}
      <ThemedText variant="subtitle" bold style={styles.sectionTitle}>
        <CheckCircle2 size={16} color={theme.colors.roleUser} /> My Event RSVPs ({rsvpEntries.length})
      </ThemedText>

      {rsvpEntries.length === 0 ? (
        <LiquidGlassCard style={styles.emptyRsvpCard}>
          <ThemedText variant="body" muted center>
            You haven't RSVP'd to any events yet.
          </ThemedText>
        </LiquidGlassCard>
      ) : (
        rsvpEntries.map(([eventId, status]) => {
          const statusText = String(status);
          return (
            <LiquidGlassCard key={eventId} style={styles.rsvpRowCard}>
              <ThemedText variant="bodyBold">Event ID: {eventId}</ThemedText>
              <ThemedText
                variant="caption"
                bold
                style={{ color: statusText === 'ATTENDING' ? theme.colors.roleUser : theme.colors.accentPink }}
              >
                Status: {statusText}
              </ThemedText>
            </LiquidGlassCard>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingTop: 16,
  },
  profileCard: {
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 4,
    marginTop: 14,
  },
  sectionDesc: {
    marginBottom: 12,
    lineHeight: 16,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  themeOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  roleList: {
    marginBottom: 24,
  },
  roleCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyRsvpCard: {
    padding: 20,
    alignItems: 'center',
  },
  rsvpRowCard: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
