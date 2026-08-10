module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase)',
  ],

  testPathIgnorePatterns: ['/node_modules/', '/.expo/'],
  collectCoverageFrom: [
    'domain/**/*.{ts,tsx}',
    'infrastructure/**/*.{ts,tsx}',
    'application/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'context/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/node_modules/**',
  ],
};
