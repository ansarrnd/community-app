import React, { useCallback } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { CommunityEvent } from '../domain/models/Event';
import { ThemedText } from './ThemedText';
import { EventListItem } from './EventListItem';
import { useTheme } from '../context/ThemeContext';
import { useLayoutInsets } from '../application/hooks/useLayoutInsets';

interface EventListProps {
  events: CommunityEvent[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  onSelectEvent: (event: CommunityEvent) => void;
  userRsvps?: Record<string, 'ATTENDING' | 'DECLINED'>;
  onRsvp?: (eventId: string, status: 'ATTENDING' | 'DECLINED') => void;
  showModerationControls?: boolean;
  onModerate?: (eventId: string, status: 'APPROVED' | 'REJECTED') => void;
}

const ESTIMATED_ITEM_SIZE = 320;
const FLASH_LIST_DRAW_DISTANCE = ESTIMATED_ITEM_SIZE * 2;

export const EventList: React.FC<EventListProps> = ({
  events,
  refreshing = false,
  onRefresh,
  onEndReached,
  isLoadingMore = false,
  onSelectEvent,
  userRsvps = {},
  onRsvp,
  showModerationControls = false,
  onModerate,
}) => {
  const { theme } = useTheme();
  const { contentBottomPadding } = useLayoutInsets();

  const renderEventItem = useCallback(
    ({ item }: { item: CommunityEvent }) => (
      <EventListItem
        item={item}
        theme={theme}
        userRsvpStatus={userRsvps[item.id]}
        onSelectEvent={onSelectEvent}
        onRsvp={onRsvp}
        showModerationControls={showModerationControls}
        onModerate={onModerate}
      />
    ),
    [theme, userRsvps, onSelectEvent, onRsvp, showModerationControls, onModerate]
  );

  const keyExtractor = useCallback((item: CommunityEvent) => item.id, []);

  const listFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ThemedText variant="body" muted center>
          Loading more events...
        </ThemedText>
      </View>
    );
  }, [isLoadingMore]);

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
      keyExtractor={keyExtractor}
      estimatedItemSize={ESTIMATED_ITEM_SIZE}
      drawDistance={FLASH_LIST_DRAW_DISTANCE}
      estimatedListSize={{ height: 800, width: 390 }}
      removeClippedSubviews
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListFooterComponent={listFooter}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accentTeal}
            colors={[theme.colors.accentTeal]}
            progressBackgroundColor={theme.colors.bgCard}
          />
        ) : undefined
      }
      contentContainerStyle={{ paddingBottom: contentBottomPadding }}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
