import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_BASE_HEIGHT = 56;

export function useLayoutInsets() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;
  const contentBottomPadding = tabBarHeight + 16;
  const stackBottomPadding = insets.bottom + 16;

  return {
    top: insets.top,
    bottom: insets.bottom,
    tabBarHeight,
    contentBottomPadding,
    stackBottomPadding,
  };
}
