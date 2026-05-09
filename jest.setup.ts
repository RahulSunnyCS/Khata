import '@testing-library/jest-native/extend-expect';

// Silence non-actionable React Native warnings in test output
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock expo-router so screen tests don't need a full navigation tree
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({}),
  Redirect: () => null,
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo-secure-store (unavailable in Jest environment)
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExpoToken[test]' }),
  setNotificationChannelAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  AndroidImportance: { MAX: 5 },
}));

// Mock expo-device
jest.mock('expo-device', () => ({ isDevice: true }));

// Mock expo-network
jest.mock('expo-network', () => ({
  addNetworkStateListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  getNetworkStateAsync: jest.fn().mockResolvedValue({ isConnected: true }),
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    connected: false,
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// Mock PostHog
jest.mock('posthog-react-native', () =>
  jest.fn().mockImplementation(() => ({
    identify: jest.fn(),
    capture: jest.fn(),
    reset: jest.fn(),
  })),
);

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  captureException: jest.fn(),
  mobileReplayIntegration: jest.fn(),
}));

// Global fetch mock — individual tests can override per-case
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});
