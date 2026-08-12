import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useApprovedEventsInfinite, useRsvpMutation, useUserRsvps } from '../../application/hooks/useEventsQuery';
import { useFilterStore } from '../../application/stores/useFilterStore';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { EventList } from '../../components/EventList';
import { ThemedText } from '../../components/ThemedText';
import { SegmentPill, SearchField } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { useDebouncedValue } from '../../application/hooks/useDebouncedValue';
import { Search, Sparkles } from 'lucide-react-native';
import { CommunityEvent } from '../../domain/models/Event';

const CATEGORIES = [
  { id: 'ALL', label: '🌟 All Events' },
  { id: 'MARRIAGE', label: '💍 Weddings' },
  { id: 'CULTURAL', label: '🎉 Cultural' },
  { id: 'MEETING', label: '📋 Meetings' },
];

export default function ExploreEventsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { category, searchQuery, setCategory, setSearchQuery } = useFilterStore();
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const { theme } = useTheme();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useApprovedEventsInfinite(category, debouncedSearch);
  const events = data?.pages.flatMap((page) => page.items) ?? [];
  const { data: userRsvps = {} } = useUserRsvps(user.uid);
  const rsvpMutation = useRsvpMutation();

  const handleSelectEvent = (event: CommunityEvent) => {
    router.push(`/e/${event.id}`);
  };

  const handleRsvp = (eventId: string, status: 'ATTENDING' | 'DECLINED') => {
    rsvpMutation.mutate({ eventId, userId: user.uid, status });
  };

  return (
    <View style={styles.container}>
      <SearchField
        containerStyle={styles.searchBarContainer}
        leadingIcon={<Search size={18} color={theme.colors.textMuted} style={styles.searchIcon} />}
        placeholder="Search events, venues, topics..."
        accessibilityLabel="Search events, venues, and topics"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {CATEGORIES.map((cat) => (
            <SegmentPill
              key={cat.id}
              label={cat.label}
              selected={category === cat.id}
              onPress={() => setCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.feedHeader}>
        <Sparkles size={16} color={theme.colors.accentTeal} style={{ marginRight: 6 }} />
        <ThemedText variant="subtitle" bold>
          {category === 'ALL' ? 'Upcoming Community Events' : `${category} Events`} ({events.length})
        </ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ThemedText variant="body" muted>
            Loading community events...
          </ThemedText>
        </View>
      ) : (
        <EventList
          events={events}
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          isLoadingMore={isFetchingNextPage}
          onSelectEvent={handleSelectEvent}
          userRsvps={userRsvps}
          onRsvp={handleRsvp}
        />
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
  searchBarContainer: {
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  categoriesWrapper: {
    marginBottom: 14,
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
});
