import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEventDetail, useRsvpMutation, useUserRsvps } from '../../application/hooks/useEventsQuery';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { LiquidGlassCard } from '../../components/LiquidGlassCard';
import { EventImage } from '../../components/EventImage';
import { ThemedText } from '../../components/ThemedText';
import { ActionChip, getActionChipColors } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useLayoutInsets } from '../../application/hooks/useLayoutInsets';
import { platformShadow } from '../../constants/theme';
import { whatsappService } from '../../infrastructure/services/whatsappService';
import { MapPin, Calendar, Clock, Share2, CheckCircle2, XCircle, ExternalLink, Globe, Users } from 'lucide-react-native';
import { TAMIL_RELATIONSHIPS } from '../../modules/kinship';


export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const { theme } = useTheme();
  const { stackBottomPadding } = useLayoutInsets();

  const { data: event, isLoading } = useEventDetail(id || '');
  const { data: userRsvps = {} } = useUserRsvps(user.uid);
  const rsvpMutation = useRsvpMutation();

  if (isLoading || !event) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText variant="body" muted>
          Loading event details...
        </ThemedText>
      </View>
    );
  }

  const userRsvpStatus = userRsvps[event.id];

  const handleOpenMaps = async () => {
    const url = event.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(event.venue)}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn('[Linking] Failed to open maps URL:', e);
    }
  };

  const handleRsvp = (status: 'ATTENDING' | 'DECLINED') => {
    rsvpMutation.mutate({ eventId: event.id, userId: user.uid, status });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: stackBottomPadding }]}
    >
      {/* Hero Image View */}
      <EventImage uri={event.inviteCardUrl} height={220} borderRadius={20} />

      {/* Category & Status Row */}
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)' },
          ]}
        >
          <ThemedText variant="caption" bold style={styles.categoryText}>
            {event.category === 'MARRIAGE' ? '💍 MARRIAGE' : event.category === 'CULTURAL' ? '🎉 CULTURAL' : '📋 MEETING'}
          </ThemedText>
        </View>
        <View style={{ flex: 1 }} />
        {event.status === 'APPROVED' ? (
          <View style={styles.approvedBadge}>
            <CheckCircle2 size={13} color={theme.colors.roleUser} style={{ marginRight: 4 }} />
            <ThemedText variant="caption" bold style={{ color: theme.colors.roleUser }}>
              Verified Community Event
            </ThemedText>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <ThemedText variant="caption" bold style={{ color: theme.colors.accentGold }}>
              {event.status}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Event Main Title */}
      <ThemedText variant="h1" style={styles.eventTitle}>
        {event.title}
      </ThemedText>

      {/* Date, Time & Venue Card */}
      <LiquidGlassCard style={styles.metaCard}>
        <View style={styles.metaItem}>
          <Calendar size={18} color={theme.colors.accentTeal} style={styles.metaIcon} />
          <View>
            <ThemedText variant="caption" muted style={{ textTransform: 'uppercase' }}>
              Date
            </ThemedText>
            <ThemedText variant="bodyBold" style={{ marginTop: 2 }}>
              {event.date}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.metaDivider, { backgroundColor: theme.colors.borderCard }]} />

        <View style={styles.metaItem}>
          <Clock size={18} color={theme.colors.accentTeal} style={styles.metaIcon} />
          <View>
            <ThemedText variant="caption" muted style={{ textTransform: 'uppercase' }}>
              Time
            </ThemedText>
            <ThemedText variant="bodyBold" style={{ marginTop: 2 }}>
              {event.time}
            </ThemedText>
          </View>
        </View>
      </LiquidGlassCard>

      {/* Venue Location & Maps Launcher */}
      <LiquidGlassCard style={styles.metaCard} onPress={handleOpenMaps}>
        <View style={styles.metaItem}>
          <MapPin size={18} color={theme.colors.accentPink} style={styles.metaIcon} />
          <View style={{ flex: 1 }}>
            <ThemedText variant="caption" muted style={{ textTransform: 'uppercase' }}>
              Venue Location
            </ThemedText>
            <ThemedText variant="bodyBold" style={{ marginTop: 2 }}>
              {event.venue}
            </ThemedText>
          </View>
          <ExternalLink size={16} color={theme.colors.accentPink} />
        </View>
      </LiquidGlassCard>

      {/* Specific Template Details */}
      {event.category === 'MARRIAGE' && (event.groomName || event.brideName) && (
        <LiquidGlassCard style={styles.templateCard} glowColor="rgba(255, 184, 0, 0.4)">
          <ThemedText variant="subtitle" bold style={{ marginBottom: 6 }}>
            💍 Wedding Couple Details
          </ThemedText>
          <ThemedText variant="body" secondary>
            Groom: {event.groomName || 'N/A'}
          </ThemedText>
          <ThemedText variant="body" secondary>
            Bride: {event.brideName || 'N/A'}
          </ThemedText>
        </LiquidGlassCard>
      )}

      {event.category === 'MEETING' && event.agenda && (
        <LiquidGlassCard style={styles.templateCard} glowColor="rgba(127, 0, 255, 0.4)">
          <ThemedText variant="subtitle" bold style={{ marginBottom: 6 }}>
            📋 Meeting Agenda
          </ThemedText>
          <ThemedText variant="body" secondary>
            {event.agenda}
          </ThemedText>
        </LiquidGlassCard>
      )}

      {/* Attached Family & Kinship Members */}
      {event.attachedMembers && event.attachedMembers.length > 0 && (
        <LiquidGlassCard style={styles.templateCard} glowColor={theme.colors.glowAccent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Users size={18} color={theme.colors.accentTeal} style={{ marginRight: 6 }} />
            <ThemedText variant="subtitle" bold style={{ color: theme.colors.accentTeal }}>
              Attached Family & Kinship Members
            </ThemedText>
          </View>
          {event.attachedMembers.map((member, idx) => {
            const relInfo = member.relationshipTypeToOrganizer
              ? TAMIL_RELATIONSHIPS[member.relationshipTypeToOrganizer]
              : undefined;
            return (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 6,
                  borderBottomWidth: idx < (event.attachedMembers?.length || 0) - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.borderCard,
                }}
              >
                <View>
                  <ThemedText variant="bodyBold">
                    {member.fullName} {member.roleInEvent ? `(${member.roleInEvent})` : ''}
                  </ThemedText>
                  {relInfo && (
                    <ThemedText variant="caption" secondary>
                      {relInfo.label}
                    </ThemedText>
                  )}
                </View>
                {member.contextTag && (
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      backgroundColor:
                        member.contextTag === 'In-Village'
                          ? 'rgba(52, 199, 89, 0.2)'
                          : 'rgba(96, 165, 250, 0.2)',
                    }}
                  >
                    <ThemedText
                      variant="caption"
                      bold
                      style={{
                        fontSize: 11,
                        color: member.contextTag === 'In-Village' ? '#34C759' : '#60A5FA',
                      }}
                    >
                      {member.contextTag}
                    </ThemedText>
                  </View>
                )}
              </View>
            );
          })}
        </LiquidGlassCard>
      )}


      {/* Description Section */}
      <ThemedText variant="subtitle" bold style={styles.sectionHeader}>
        Event Details
      </ThemedText>
      <LiquidGlassCard style={styles.detailsCard}>
        <ThemedText variant="body" secondary style={{ lineHeight: 22 }}>
          {event.details}
        </ThemedText>
      </LiquidGlassCard>

      {/* RSVP Action Bar */}
      <ThemedText variant="subtitle" bold style={styles.sectionHeader}>
        Your Response
      </ThemedText>
      <View style={styles.rsvpRow}>
        <ActionChip
          variant="success"
          selected={userRsvpStatus === 'ATTENDING'}
          style={styles.rsvpActionSpacing}
          icon={
            <CheckCircle2
              size={18}
              color={getActionChipColors(theme.colors, 'success', userRsvpStatus === 'ATTENDING').iconColor}
            />
          }
          label={`Attending (${event.attendingCount})`}
          onPress={() => handleRsvp('ATTENDING')}
        />

        <ActionChip
          variant="danger"
          selected={userRsvpStatus === 'DECLINED'}
          icon={
            <XCircle
              size={18}
              color={getActionChipColors(theme.colors, 'danger', userRsvpStatus === 'DECLINED').iconColor}
            />
          }
          label="Declined"
          onPress={() => handleRsvp('DECLINED')}
        />
      </View>

      {/* Primary WhatsApp Deep Link Share Button */}
      <Pressable
        onPress={() => whatsappService.shareEventToWhatsApp(event)}
        style={({ pressed }) => [styles.whatsappBtn, platformShadow('whatsapp'), pressed && { opacity: 0.88 }]}
      >
        <Share2 size={20} color="#FFF" style={{ marginRight: 8 }} />
        <ThemedText variant="button" style={{ color: '#FFF' }}>
          Forward via WhatsApp Client
        </ThemedText>
      </Pressable>

      {/* Open Graph Social Card Inspector */}
      <LiquidGlassCard style={styles.ogCard}>
        <View style={styles.ogHeader}>
          <Globe size={16} color={theme.colors.accentTeal} style={{ marginRight: 6 }} />
          <ThemedText variant="caption" bold style={{ color: theme.colors.accentTeal }}>
            Open Graph Web Preview Inspector
          </ThemedText>
        </View>
        <ThemedText variant="caption" muted style={styles.ogCode}>
          {`<meta property="og:title" content="${event.title}" />\n<meta property="og:description" content="${event.details.slice(0, 80)}..." />\n<meta property="og:image" content="${event.inviteCardUrl || ''}" />\n<meta property="og:url" content="https://community.yourdomain.com/e/${event.id}" />`}
        </ThemedText>
      </LiquidGlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  categoryText: {
    letterSpacing: 0.5,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  eventTitle: {
    marginBottom: 14,
  },
  metaCard: {
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 12,
  },
  metaDivider: {
    height: 1,
    marginVertical: 10,
  },
  templateCard: {
    marginBottom: 12,
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 8,
  },
  detailsCard: {
    marginBottom: 14,
  },
  rsvpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  rsvpActionSpacing: {
    flex: 1,
    justifyContent: 'center',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 16,
  },
  ogCard: {
    marginTop: 10,
  },
  ogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ogCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
});
