import { useAuthStore } from '../auth.store';
import type { User } from '../../types/user.types';
import type { AuthTokens } from '../../types/auth.types';

const MOCK_USER: User = {
  id: 'u1',
  email: 'test@khaata.app',
  phone: '9876543210',
  countryCode: '+91',
  displayName: 'Test User',
  avatarUrl: null,
  defaultCurrency: 'INR',
  vpa: 'test@upi',
  pushToken: null,
  createdAt: new Date().toISOString(),
};

const MOCK_TOKENS: AuthTokens = {
  accessToken: 'access.token.here',
  refreshToken: 'refresh.token.here',
  expiresAt: Date.now() + 15 * 60 * 1000,
};

// Reset Zustand store state before each test
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    provider: null,
  });
});

describe('useAuthStore — setUser', () => {
  it('sets user and marks isAuthenticated', () => {
    useAuthStore.getState().setUser(MOCK_USER);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(MOCK_USER);
    expect(state.isAuthenticated).toBe(true);
  });
});

describe('useAuthStore — setTokens', () => {
  it('stores tokens without changing auth state', () => {
    useAuthStore.getState().setTokens(MOCK_TOKENS);
    const state = useAuthStore.getState();
    expect(state.tokens).toEqual(MOCK_TOKENS);
    expect(state.isAuthenticated).toBe(false);
  });
});

describe('useAuthStore — setProvider', () => {
  it('records the auth provider', () => {
    useAuthStore.getState().setProvider('google');
    expect(useAuthStore.getState().provider).toBe('google');
  });
});

describe('useAuthStore — setLoading', () => {
  it('toggles loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

describe('useAuthStore — logout', () => {
  it('clears user, tokens, provider and sets isAuthenticated false', () => {
    useAuthStore.setState({ user: MOCK_USER, tokens: MOCK_TOKENS, isAuthenticated: true, provider: 'phone' });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.provider).toBeNull();
  });

  it('is idempotent — calling twice does not throw', () => {
    expect(() => {
      useAuthStore.getState().logout();
      useAuthStore.getState().logout();
    }).not.toThrow();
  });
});
