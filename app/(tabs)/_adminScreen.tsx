import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { usePendingEvents, useModerateEventMutation } from '../../application/hooks/useEventsQuery';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { useRoleGuard } from '../../application/hooks/useRoleGuard';
import { LiquidGlassCard } from '../../components/LiquidGlassCard';
import { RoleBadge } from '../../components/RoleBadge';
import { ThemedText } from '../../components/ThemedText';
import { ActionChip, getActionChipColors } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useLayoutInsets } from '../../application/hooks/useLayoutInsets';
import { ShieldAlert, Send, CheckCircle, XCircle } from 'lucide-react-native';
import { whatsappService } from '../../infrastructure/services/whatsappService';
import { CommunityEvent, EventStatus } from '../../domain/models/Event';

export default function AdminModerationScreen() {
  const user = useAuthStore((state) => state.user);
  const { isMod, isAdmin } = useRoleGuard();
  const { theme } = useTheme();
  const { contentBottomPadding } = useLayoutInsets();
  const { data: pendingEvents = [], isLoading } = usePendingEvents();
  const moderateMutation = useModerateEventMutation();
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);

  if (!isMod && !isAdmin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <ShieldAlert size={48} color={theme.colors.roleAdmin} style={{ marginBottom: 12 }} />
        <ThemedText variant="h2" bold center style={{ marginBottom: 8 }}>
          Access Restricted
        </ThemedText>
        <ThemedText variant="body" secondary center>
          You need Moderator (MOD) or Administrator (ADMIN) permissions to view this screen.
        </ThemedText>
      </View>
    );
  }

  const handleModerate = (eventId: string, status: EventStatus) => {
    moderateMutation.mutate(
      { eventId, status, moderatorId: user.uid, moderatorRole: user.role },
      {
        onSuccess: () => {
          const msg = `Event status updated to ${status}.`;
          if (Platform.OS === 'web') alert(msg);
          else Alert.alert('Moderation Complete', msg);
        },
        onError: (err: any) => {
          if (Platform.OS === 'web') alert(`Error: ${err.message}`);
          else Alert.alert('Moderation Failed', err.message);
        },
      }
    );
  };

  const handleBroadcast = async (event: CommunityEvent) => {
    setBroadcastingId(event.id);
    const result = await whatsappService.triggerMetaCloudBroadcast(event);
    setBroadcastingId(null);
    if (result.success) {
      const msg = `Successfully triggered Meta WhatsApp Cloud API broadcast to ${result.recipientCount} community subscribers!`;
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Broadcast Sent', msg);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <LiquidGlassCard style={styles.bannerCard} glowColor="rgba(255, 184, 0, 0.4)">
        <View style={styles.bannerHeader}>
          <ShieldAlert size={22} color={theme.colors.accentGold} style={{ marginRight: 8 }} />
          <ThemedText variant="subtitle" bold>
            Community Moderation Hub
          </ThemedText>
          <View style={{ flex: 1 }} />
          <RoleBadge role={user.role} />
        </View>
        <ThemedText variant="caption" secondary style={{ lineHeight: 18 }}>
          Review pending user event submissions. Approved events become visible on the public feed.
        </ThemedText>
      </LiquidGlassCard>

      {/* Moderation Queue Section */}
      <View style={styles.queueHeader}>
        <ThemedText variant="subtitle" bold>
          Pending Verification Queue ({pendingEvents.length})
        </ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ThemedText variant="body" muted>
            Fetching pending events...
          </ThemedText>
        </View>
      ) : pendingEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CheckCircle size={40} color={theme.colors.roleUser} style={{ marginBottom: 8 }} />
          <ThemedText variant="h3" bold style={{ marginBottom: 4 }}>
            Queue Clean!
          </ThemedText>
          <ThemedText variant="body" muted center>
            There are no pending events requiring moderation right now.
          </ThemedText>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: contentBottomPadding }}>
          {pendingEvents.map((item) => (
            <LiquidGlassCard key={item.id} style={{ marginBottom: 12 }}>
              <ThemedText variant="subtitle" bold style={{ marginBottom: 4 }}>
                {item.title}
              </ThemedText>
              <ThemedText variant="caption" bold style={{ color: theme.colors.accentTeal, marginBottom: 6 }}>
                Submitted by: {item.organizerName || 'Community Member'} | Category: {item.category}
              </ThemedText>
              <ThemedText variant="body" secondary style={{ marginBottom: 12 }} numberOfLines={3}>
                {item.details}
              </ThemedText>

              <View style={styles.actionRow}>
                <ActionChip
                  variant="success"
                  label="Approve & Publish"
                  icon={
                    <CheckCircle
                      size={15}
                      color={getActionChipColors(theme.colors, 'success', true).iconColor}
                    />
                  }
                  onPress={() => handleModerate(item.id, 'APPROVED')}
                />

                <ActionChip
                  variant="danger"
                  label="Reject"
                  icon={
                    <XCircle
                      size={15}
                      color={getActionChipColors(theme.colors, 'danger', true).iconColor}
                    />
                  }
                  onPress={() => handleModerate(item.id, 'REJECTED')}
                />

                {isAdmin && (
                  <ActionChip
                    variant="accent"
                    label={broadcastingId === item.id ? 'Sending...' : 'WA Broadcast'}
                    disabled={broadcastingId === item.id}
                    icon={
                      <Send
                        size={14}
                        color={getActionChipColors(theme.colors, 'accent', true).iconColor}
                      />
                    }
                    onPress={() => handleBroadcast(item)}
                  />
                )}
              </View>
            </LiquidGlassCard>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  bannerCard: {
    marginBottom: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  queueHeader: {
    marginBottom: 10,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
