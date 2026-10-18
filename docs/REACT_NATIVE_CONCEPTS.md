# React Native concepts used in this project

This guide explains the React Native concepts and closely related Expo libraries used by Community Connect. Each section gives a short explanation and an example from the codebase. Examples are shortened to highlight the concept; paths point to the implementation.

The app uses Expo SDK 55, React Native 0.83, and React 19. Expo Router and React Native Web let it share most of its UI and application code across iOS, Android, and web.

## 1. Components and declarative UI

**Concept:** A component is a reusable function that describes part of the interface. React renders that interface from the component's current props and state; when those values change, React updates the UI.

React Native provides platform-aware building blocks. `View` is a layout container, `Text` displays text, `TextInput` accepts text, and `Pressable` responds to touch or pointer input.

**In this project:** `EventListItem` presents an event, while `EventList` composes those items into a feed. `ThemedText`, `LiquidGlassCard`, and the UI components under `components/ui/` are reused across screens.

```tsx
<Pressable onPress={() => onSelectEvent(item)}>
  <ThemedText variant="h3">{item.title}</ThemedText>
</Pressable>
```

Source: `components/EventListItem.tsx`

## 2. Component props and TypeScript

**Concept:** Props are the inputs a parent supplies to a component. TypeScript interfaces and types make those inputs explicit, helping callers pass the correct values and callbacks.

**In this project:** `EventListProps` defines the event data and actions that `EventList` accepts.

```tsx
interface EventListProps {
  events: CommunityEvent[];
  onSelectEvent: (event: CommunityEvent) => void;
  onRsvp?: (eventId: string, status: 'ATTENDING' | 'DECLINED') => void;
}
```

The kinship picker similarly takes a typed member list and an `onChange` callback, keeping member editing in the parent screen's state.

Source: `components/EventList.tsx`, `modules/kinship/components/KinshipMemberPicker.tsx`

## 3. Composition and children

**Concept:** Composition builds complex interfaces by nesting smaller components. A component can accept `children` to let its caller supply the content it wraps.

**In this project:** The root layout nests providers around navigation. `FluidAuroraBackground` receives `children` and renders the app content over a decorative background. `LiquidGlassCard` wraps invitation preview content.

```tsx
<FluidAuroraBackground>
  <OfflineBanner />
  <Stack />
</FluidAuroraBackground>
```

Source: `app/_layout.tsx`, `components/FluidAuroraBackground.tsx`

## 4. Hooks and component lifecycle

**Concept:** React hooks let function components use state and other React features. `useEffect` runs work in response to mounting or dependency changes and can return cleanup logic, such as unsubscribing from an event listener.

**In this project:** `useNetworkGuard` subscribes to native connectivity updates (or browser online/offline events) in an effect and removes the listener when the hook's owner unmounts. `useDebouncedValue` delays applying search input until typing pauses.

```tsx
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    setIsConnected(state.isConnected ?? true);
  });
  return () => unsubscribe();
}, []);
```

Source: `application/hooks/useNetworkGuard.ts`, `application/hooks/useDebouncedValue.ts`

## 5. Local state and controlled inputs

**Concept:** `useState` stores values that belong to a component. A controlled input gets its displayed value from state and reports edits through a callback, keeping the UI and application value synchronized.

**In this project:** The create-event screen stores fields such as title and venue in state and passes each value and setter to `TextInput`.

```tsx
const [title, setTitle] = useState('');

<TextInput value={title} onChangeText={setTitle} />
```

Category-specific fields are conditionally rendered, and the screen uses `Alert.alert` on native platforms and browser `alert` on web. Although `react-hook-form` is a project dependency, the event form currently uses React state directly.

Source: `app/(tabs)/_createScreen.tsx`

## 6. Context and shared theme

**Concept:** React Context makes a value available to components below a provider without passing it through every intermediate component. It is useful for cross-cutting UI values such as theme settings.

**In this project:** `ThemeProvider` exposes the current theme and theme-mode setter. Screens and reusable components call `useTheme()` to use consistent colors. The theme can also start from the system color scheme.

```tsx
const { theme } = useTheme();

<View style={{ backgroundColor: theme.colors.bgCanvas }} />
```

Source: `context/ThemeContext.tsx`, `app/_layout.tsx`

## 7. Layout, Flexbox, and StyleSheet

**Concept:** React Native styles are JavaScript objects rather than CSS stylesheets. Layout primarily uses Flexbox, and `StyleSheet.create` centralizes and validates style definitions.

**In this project:** Screens use `flex: 1`, `flexDirection: 'row'`, alignment, spacing, and composed styles to arrange content. Dynamic theme values are combined with reusable static styles.

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
```

Source: `app/(tabs)/index.tsx`, `components/ui/SearchField.tsx`

## 8. Platform-specific behavior and responsive measurements

**Concept:** React Native's `Platform` API allows behavior or presentation to differ by platform. `Dimensions` provides screen/window measurements for layouts that depend on available size.

**In this project:** The aurora background omits one glow on Android, and it uses either a Linear Gradient or Skia implementation depending on platform and configuration. The create-event flow selects browser alerts on web and native alerts elsewhere.

```tsx
{Platform.OS !== 'android' && <LinearGradient ... />}
```

Source: `components/FluidAuroraBackground.tsx`, `components/SkiaFluidAuroraBackground.tsx`, `app/(tabs)/_createScreen.tsx`

## 9. File-based navigation and route parameters

**Concept:** Navigation moves between screens while preserving a navigation history. Expo Router builds routes from files and folders; layouts define shared stack or tab navigation, and dynamic route segments carry values such as IDs.

**In this project:** `app/(tabs)/_layout.tsx` defines the tab navigator, `app/_layout.tsx` defines the root stack, and `app/e/[id].tsx` is the event detail route. The explore screen pushes an event ID into that route.

```tsx
router.push(`/e/${event.id}`);
```

The details screen reads that ID with `useLocalSearchParams`.

Source: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/e/[id].tsx`

## 10. Safe areas and system UI

**Concept:** Safe areas keep content clear of hardware and operating-system regions such as notches, rounded corners, and the home indicator. System UI APIs configure surfaces such as the status bar.

**In this project:** `SafeAreaProvider` wraps the app, and `useSafeAreaInsets` is used for tab-bar height, bottom content spacing, and the offline banner's position. Expo's `StatusBar` uses a style matching the active theme.

```tsx
const insets = useSafeAreaInsets();
const bottomPadding = TAB_BAR_BASE_HEIGHT + insets.bottom;
```

Source: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `application/hooks/useLayoutInsets.ts`

## 11. Scrolling, lists, pagination, and refresh

**Concept:** Scrollable containers allow content to exceed the screen. Long repeated data should use a virtualized list, which renders a manageable window of rows instead of mounting every item at once. Lists can also expose end-reached and refresh events.

**In this project:** Horizontal `ScrollView`s display category and kinship choices. The event feed uses Shopify `FlashList`, stable event IDs as keys, an end-reached callback to fetch the next page, and `RefreshControl` for pull-to-refresh.

```tsx
<FlashList
  data={events}
  renderItem={renderEventItem}
  keyExtractor={(item) => item.id}
  onEndReached={onEndReached}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
/>
```

Source: `components/EventList.tsx`, `app/(tabs)/index.tsx`

## 12. Rendering performance

**Concept:** Large lists and frequently updated screens benefit from reducing unnecessary work. Stable callbacks can help avoid recreating functions during every render; virtualized lists reduce the number of mounted rows.

**In this project:** `EventList` memoizes its item renderer, key extractor, and footer callback with `useCallback`. It also configures FlashList's draw distance and clipped subviews.

```tsx
const keyExtractor = useCallback((item: CommunityEvent) => item.id, []);
```

Source: `components/EventList.tsx`

## 13. Accessibility

**Concept:** Accessibility metadata communicates an element's purpose and role to assistive technologies. Descriptive labels and roles also improve interaction clarity.

**In this project:** Search fields are identified as search controls; buttons have button roles and meaningful labels; the event submit button has an explicit accessible name.

```tsx
<Pressable
  accessibilityLabel="Submit event"
  accessibilityRole="button"
  onPress={handleSubmit}
>
  ...
</Pressable>
```

Source: `components/ui/SearchField.tsx`, `components/ui/SelectableCard.tsx`, `app/(tabs)/_createScreen.tsx`

## 14. Native device APIs through Expo

**Concept:** A cross-platform UI can still call device capabilities through native modules. Expo modules provide JavaScript APIs that integrate with platform features while allowing platform-specific implementations.

**In this project:**

- `expo-image-picker` opens the device image library for an invitation image.
- `expo-image` displays event imagery with memory/disk caching, a placeholder, and a transition.
- `expo-linking` opens map links and WhatsApp deep links.
- `expo-secure-store` stores sensitive values using platform secure storage.

```tsx
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 0.8,
});
```

Source: `app/(tabs)/_createScreen.tsx`, `components/EventImage.tsx`, `app/e/[id].tsx`, `utils/securityStorage.ts`

## 15. Cross-platform networking and offline behavior

**Concept:** Mobile and web have different platform APIs for connectivity. A shared app can adapt behind one hook, exposing the same state to the rest of the UI.

**In this project:** `useNetworkGuard` uses NetInfo on native and browser `online`/`offline` events on web. It powers the offline banner and blocks selected actions when disconnected.

```tsx
const { isConnected, checkConnection } = useNetworkGuard();
if (!checkConnection('Host Event')) return;
```

Source: `application/hooks/useNetworkGuard.ts`, `components/OfflineBanner.tsx`

## 16. Server state, mutations, and offline cache

**Concept:** Server state is data fetched from or written to a backend. TanStack Query manages request status, caching, invalidation, pagination, and mutations; its persisted-query support can retain cached data between app launches.

**In this project:** Event hooks use `useQuery` and `useInfiniteQuery`; create, RSVP, and moderation use `useMutation`. RSVP updates the cached user RSVP immediately (an optimistic update), then rolls back on error and refreshes related queries. A persisted query client uses MMKV on native and a web storage fallback.

```tsx
const { data, fetchNextPage, hasNextPage } =
  useApprovedEventsInfinite(category, debouncedSearch);
```

Source: `application/hooks/useEventsQuery.ts`, `app/_layout.tsx`, `infrastructure/storage/mmkvStorage.ts`

## 17. Global client state

**Concept:** Client state is local app state that is not directly owned by a remote server, such as the signed-in user or selected filters. A state store allows unrelated screens and components to share it.

**In this project:** Zustand stores expose authentication and event-filter state, while React Context handles the theme.

```tsx
const { category, searchQuery, setCategory } = useFilterStore();
```

Source: `application/stores/useFilterStore.ts`, `application/stores/useAuthStore.ts`

## 18. Visual effects and custom drawing

**Concept:** Native-compatible graphics libraries provide effects and drawing beyond basic views. Gradients and blur add visual treatments; a canvas renderer can draw shapes and apply effects efficiently.

**In this project:** The default aurora background uses Expo Linear Gradient, glass cards use Expo Blur, and an optional Shopify Skia implementation renders blurred circles on a canvas. The Skia route is controlled by `EXPO_PUBLIC_USE_SKIA_AURORA` and is disabled on web.

```tsx
<Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
  <Circle cx={width * 0.15} cy={height * 0.12} r={width * 0.45} color={theme.colors.auroraPrimary}>
    <BlurMask blur={80} style="normal" />
  </Circle>
</Canvas>
```

Source: `components/FluidAuroraBackground.tsx`, `components/SkiaFluidAuroraBackground.tsx`, `components/LiquidGlassCard.tsx`

## 19. Automated UI testing

**Concept:** Component tests render UI in a test environment and simulate interactions. This makes it possible to verify behavior without manually tapping through the app on a device.

**In this project:** Jest with `@testing-library/react-native` tests components, screen interactions, and snapshots. Native modules such as FlashList and Expo Image Picker are mocked in tests where appropriate.

```tsx
fireEvent.changeText(getByTestId('input-event-title'), 'Community Blood Drive');
fireEvent.press(getByTestId('btn-submit-event'));
await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
```

The test also checks that the submitted mutation contains the entered event data.

Source: `__tests__/unit/ScreenInteractions.test.tsx`, `__tests__/unit/EventList.test.tsx`

## Quick concept-to-code map

| Concept | Example location |
|---|---|
| Screens and route files | `app/` |
| Reusable React Native components | `components/` |
| Theme context | `context/ThemeContext.tsx` |
| Global client state | `application/stores/` |
| Data fetching and mutations | `application/hooks/useEventsQuery.ts` |
| Safe areas | `application/hooks/useLayoutInsets.ts` |
| Native/web connectivity | `application/hooks/useNetworkGuard.ts` |
| Native image and link APIs | `app/(tabs)/_createScreen.tsx`, `app/e/[id].tsx` |
| Virtualized event feed | `components/EventList.tsx` |
| Platform persistence | `infrastructure/storage/mmkvStorage.ts` |
