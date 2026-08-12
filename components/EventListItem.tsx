import React, { memo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { CommunityEvent } from '../domain/models/Event';
import { AppTheme } from '../constants/theme';
import { LiquidGlassCard } from './LiquidGlassCard';
import { EventImage } from './EventImage';
import { ThemedText } from './ThemedText';
import { ActionChip, getActionChipColors } from './ui/ActionChip';
import { MapPin, Calendar, Clock, Share2, CheckCircle2, XCircle } from 'lucide-react-native';
import { whatsappService } from '../infrastructure/services/whatsappService';

export interface EventListItemProps {
  item: CommunityEvent;
  theme: AppTheme;
  userRsvpStatus?: 'ATTENDING' | 'DECLINED';
  onSelectEvent: (event: CommunityEvent) => void;
  onRsvp?: (eventId: string, status: 'ATTENDING' | 'DECLINED') => void;
  showModerationControls?: boolean;
  onModerate?: (eventId: string, status: 'APPROVED' | 'REJECTED') => void;
}

export const EventListItem = memo(function EventListItem({
  item,
  theme,
  userRsvpStatus,
  onSelectEvent,
  onRsvp,
  showModerationControls = false,
  onModerate,
}: EventListItemProps) {
  const isApproved = item.status === 'APPROVED';
  const glowColor =
    item.category === 'MARRIAGE'
      ? theme.colors.glowCategoryMarriage
      : item.category === 'CULTURAL'
      ? theme.colors.glowCategoryCultural
      : theme.colors.glowCategoryMeeting;

  return (
    <LiquidGlassCard
      blurEnabled={false}
      onPress={() => onSelectEvent(item)}
      glowColor={glowColor}
    >
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

      <EventImage uri={item.inviteCardUrl} height={160} />

      <ThemedText variant="h3" style={styles.eventTitle}>
        {item.title}
      </ThemedText>

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

      <View style={styles.metaRow}>
        <MapPin size={15} color={theme.colors.accentPink} />
        <ThemedText variant="caption" style={[styles.metaText, { flex: 1 }]} numberOfLines={1}>
          {item.venue}
        </ThemedText>
      </View>

      <ThemedText variant="body" secondary style={styles.detailsSnippet} numberOfLines={2}>
        {item.details}
      </ThemedText>

      <View style={[styles.actionRow, { borderTopColor: theme.colors.borderCard }]}>
        <Pressable
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.75 }]}
          onPress={() => whatsappService.shareEventToWhatsApp(item)}
        >
          <Share2 size={15} color="#25D366" />
          <ThemedText variant="caption" bold style={styles.shareText}>
            Share
          </ThemedText>
        </Pressable>

        {isApproved && onRsvp && (
          <View style={styles.rsvpContainer}>
            <ActionChip
              variant="success"
              selected={userRsvpStatus === 'ATTENDING'}
              compact
              style={styles.rsvpChipSpacing}
              icon={
                <CheckCircle2
                  size={14}
                  color={getActionChipColors(theme.colors, 'success', userRsvpStatus === 'ATTENDING').iconColor}
                />
              }
              label={`Going (${item.attendingCount})`}
              onPress={() => onRsvp(item.id, 'ATTENDING')}
            />
            <ActionChip
              variant="danger"
              selected={userRsvpStatus === 'DECLINED'}
              compact
              style={styles.rsvpChipSpacing}
              icon={
                <XCircle
                  size={14}
                  color={getActionChipColors(theme.colors, 'danger', userRsvpStatus === 'DECLINED').iconColor}
                />
              }
              label="No"
              onPress={() => onRsvp(item.id, 'DECLINED')}
            />
          </View>
        )}

        {showModerationControls && onModerate && item.status === 'PENDING' && (
          <View style={styles.moderationContainer}>
            <ActionChip variant="success" label="Approve" style={styles.moderationChipSpacing} onPress={() => onModerate(item.id, 'APPROVED')} />
            <ActionChip variant="danger" label="Reject" onPress={() => onModerate(item.id, 'REJECTED')} />
          </View>
        )}
      </View>
    </LiquidGlassCard>
  );
});

const styles = StyleSheet.create({
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
  rsvpChipSpacing: {
    marginLeft: 6,
  },
  moderationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moderationChipSpacing: {
    marginRight: 6,
  },
});
