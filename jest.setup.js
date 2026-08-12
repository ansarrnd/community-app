/** Firebase JS SDK (functions) expects `self` in Node/Jest */
if (typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}

jest.mock('expo-updates', () => ({
  isEnabled: false,
  checkForUpdateAsync: jest.fn(async () => ({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Canvas: (props: Record<string, unknown>) => React.createElement(View, props),
    Circle: () => null,
    BlurMask: () => null,
  };
});
