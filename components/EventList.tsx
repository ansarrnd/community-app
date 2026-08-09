import React from 'react';
import { RefreshControl, StyleSheet, View, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { CommunityEvent } from '../domain/models/Event';
import { LiquidGlassCard } from './LiquidGlassCard';
import { EventImage } from './EventImage';
import { ThemedText } from './ThemedText';
import { useTheme } from '../context/ThemeContext';
import { MapPin, Calendar, Clock, Share2, CheckCircle2, XCircle } from 'lucide-react-native';
import { whatsappService } from '../infrastructure/services/whatsappService';

interface EventListProps {
  events: CommunityEvent[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onSelectEvent: (event: CommunityEvent) => void;
  userRsvps?: Record<string, 'ATTENDING' | 'DECLINED'>;
  onRsvp?: (eventId: string, status: 'ATTENDING' | 'DECLINED') => void;
  showModerationControls?: boolean;
  onModerate?: (eventId: string, status: 'APPROVED' | 'REJECTED') => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  refreshing = false,
  onRefresh,
  onSelectEvent,
  userRsvps = {},
  onRsvp,
  showModerationControls = false,
  onModerate,
}) => {
  const { theme } = useTheme();

  const renderEventItem = ({ item }: { item: CommunityEvent }) => {
    const userRsvpStatus = userRsvps[item.id];
    const isApproved = item.status === 'APPROVED';

    return (
      <LiquidGlassCard
        onPress={() => onSelectEvent(item)}
        glowColor={
          item.category === 'MARRIAGE'
            ? 'rgba(255, 184, 0, 0.4)'
            : item.category === 'CULTURAL'
            ? 'rgba(0, 242, 254, 0.4)'
            : 'rgba(127, 0, 255, 0.4)'
        }
      >
        {/* Card Header & Badges */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)' },
            ]}
          >
            <ThemedText variant="caption" bold style={styles.categoryText}>
              {item.category === 'MARRIAGE' ? '💍 MARRIAGE' : item.category === 'CULTURAL' ? '🎉 CULTURAL' : '📋 MEETING'}
            </ThemedText>
          </View>
          {item.status !== 'APPROVED' && (
            <View
              style={[
                styles.statusBadge,
                item.status === 'PENDING'
                  ? { backgroundColor: 'rgba(255, 184, 0, 0.25)' }
                  : { backgroundColor: 'rgba(255, 42, 109, 0.25)' },
              ]}
            >
              <ThemedText
                variant="caption"
                bold
                style={{ color: item.status === 'PENDING' ? theme.colors.accentGold : theme.colors.accentPink }}
              >
                {item.status}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Hero Event Image */}
        <EventImage uri={item.inviteCardUrl} height={160} />

        {/* Event Title */}
        <ThemedText variant="h3" style={styles.eventTitle}>
          {item.title}
        </ThemedText>

        {/* Date & Time Row */}
        <View style={styles.metaRow}>
          <Calendar size={15} color={theme.colors.accentTeal} />
          <ThemedText variant="caption" style={styles.metaText}>
            {item.date}
          </ThemedText>
          <Clock size={15} color={theme.colors.accentTeal} style={{ marginLeft: 14 }} />
          <ThemedText variant="caption" style={styles.metaText}>
            {item.time}
          </ThemedText>
        </View>

        {/* Venue Row */}
        <View style={styles.metaRow}>
          <MapPin size={15} color={theme.colors.accentPink} />
          <ThemedText variant="caption" style={[styles.metaText, { flex: 1 }]} numberOfLines={1}>
            {item.venue}
          </ThemedText>
        </View>

        {/* Description Snippet */}
        <ThemedText variant="body" secondary style={styles.detailsSnippet} numberOfLines={2}>
          {item.details}
        </ThemedText>

        {/* Action Row */}
        <View style={[styles.actionRow, { borderTopColor: theme.colors.borderCard }]}>
          {/* WhatsApp Share Button */}
          <Pressable
            style={({ pressed }) => [
              styles.shareBtn,
              pressed && { opacity: 0.75 },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              whatsappService.shareEventToWhatsApp(item);
            }}
          >
            <Share2 size={15} color="#25D366" />
            <ThemedText variant="caption" bold style={styles.shareText}>
              Share
            </ThemedText>
          </Pressable>

          {/* RSVP Status / Buttons */}
          {isApproved && onRsvp && (
            <View style={styles.rsvpContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.rsvpChip,
                  userRsvpStatus === 'ATTENDING'
                    ? { backgroundColor: 'rgba(0, 230, 118, 0.25)', borderColor: theme.colors.roleUser }
                    : { backgroundColor: theme.colors.bgInput, borderColor: theme.colors.borderInput },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  onRsvp(item.id, 'ATTENDING');
                }}
              >
                <CheckCircle2
                  size={14}
                  color={userRsvpStatus === 'ATTENDING' ? theme.colors.roleUser : theme.colors.textMuted}
                />
                <ThemedText variant="caption" bold style={{ marginLeft: 4 }}>
                  Going ({item.attendingCount})
                </ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.rsvpChip,
                  userRsvpStatus === 'DECLINED'
                    ? { backgroundColor: 'rgba(255, 42, 109, 0.25)', borderColor: theme.colors.accentPink }
                    : { backgroundColor: theme.colors.bgInput, borderColor: theme.colors.borderInput },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  onRsvp(item.id, 'DECLINED');
                }}
              >
                <XCircle
                  size={14}
                  color={userRsvpStatus === 'DECLINED' ? theme.colors.accentPink : theme.colors.textMuted}
                />
                <ThemedText variant="caption" bold style={{ marginLeft: 4 }}>
                  No
                </ThemedText>
              </Pressable>
            </View>
          )}

          {/* Moderation Controls (MOD / ADMIN only) */}
          {showModerationControls && onModerate && item.status === 'PENDING' && (
            <View style={styles.moderationContainer}>
              <Pressable
                style={({ pressed }) => [styles.approveBtn, pressed && { opacity: 0.8 }]}
                onPress={(e) => {
                  e.stopPropagation();
                  onModerate(item.id, 'APPROVED');
                }}
              >
                <ThemedText variant="caption" bold style={{ color: theme.colors.roleUser }}>
                  Approve
                </ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.rejectBtn, pressed && { opacity: 0.8 }]}
                onPress={(e) => {
                  e.stopPropagation();
                  onModerate(item.id, 'REJECTED');
                }}
              >
                <ThemedText variant="caption" bold style={{ color: theme.colors.accentPink }}>
                  Reject
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </LiquidGlassCard>
    );
  };

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText variant="h3" center style={{ marginBottom: 6 }}>
          No Community Events Found
        </ThemedText>
        <ThemedText variant="body" secondary center>
          Try selecting a different category or search term.
        </ThemedText>
      </View>
    );
  }

  return (
    <FlashList
      data={events}
      renderItem={renderEventItem}
      estimatedItemSize={320}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accentTeal} />
        ) : undefined
      }
      contentContainerStyle={styles.listPadding}
    />
  );
};

const styles = StyleSheet.create({
  listPadding: {
    paddingBottom: 40,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryText: {
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  eventTitle: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    marginLeft: 6,
  },
  detailsSnippet: {
    marginVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 211, 102, 0.16)',
    borderColor: 'rgba(37, 211, 102, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  shareText: {
    color: '#25D366',
    marginLeft: 6,
  },
  rsvpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rsvpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 6,
  },
  moderationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: 'rgba(0, 230, 118, 0.22)',
    borderColor: '#00E676',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  rejectBtn: {
    backgroundColor: 'rgba(255, 42, 109, 0.22)',
    borderColor: '#FF2A6D',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
});
