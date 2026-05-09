import { api } from './api';
import { Storage } from '../lib/storage';
import { useAuthStore } from '../store/auth.store';
import type {
  LoginWithEmailPayload,
  SignupPayload,
  OtpRequestPayload,
  OtpVerifyPayload,
  GoogleSignInPayload,
  AppleSignInPayload,
  AuthTokens,
  AuthProvider,
} from '../types/auth.types';
import type { User } from '../types/user.types';

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

async function persistSession(data: AuthResponse, provider: AuthProvider): Promise<void> {
  await Storage.setSecure('accessToken', data.tokens.accessToken);
  await Storage.setSecure('refreshToken', data.tokens.refreshToken);
  useAuthStore.getState().setTokens(data.tokens);
  useAuthStore.getState().setUser(data.user);
  useAuthStore.getState().setProvider(provider);
}

export const authService = {
  async signupWithEmail(payload: SignupPayload): Promise<void> {
    const data = await api.post<AuthResponse>('/auth/signup', payload);
    await persistSession(data, 'email');
  },

  async loginWithEmail(payload: LoginWithEmailPayload): Promise<void> {
    const data = await api.post<AuthResponse>('/auth/login', {
      ...payload,
      provider: 'email',
    });
    await persistSession(data, 'email');
  },

  async requestOtp(payload: OtpRequestPayload): Promise<void> {
    await api.post('/auth/otp/request', payload);
  },

  async verifyOtp(payload: OtpVerifyPayload): Promise<void> {
    const data = await api.post<AuthResponse>('/auth/otp/verify', payload);
    await persistSession(data, 'phone');
  },

  async loginWithGoogle(payload: GoogleSignInPayload): Promise<void> {
    const data = await api.post<AuthResponse>('/auth/login', {
      ...payload,
      provider: 'google',
    });
    await persistSession(data, 'google');
  },

  async loginWithApple(payload: AppleSignInPayload): Promise<void> {
    const data = await api.post<AuthResponse>('/auth/login', {
      ...payload,
      provider: 'apple',
    });
    await persistSession(data, 'apple');
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // best-effort server logout
    } finally {
      await Storage.deleteSecure('accessToken');
      await Storage.deleteSecure('refreshToken');
      useAuthStore.getState().logout();
    }
  },

  async restoreSession(): Promise<boolean> {
    const accessToken = await Storage.getSecure('accessToken');
    const refreshToken = await Storage.getSecure('refreshToken');
    if (!accessToken || !refreshToken) return false;

    try {
      const user = await api.get<User>('/users/me');
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setTokens({
        accessToken,
        refreshToken,
        expiresAt: 0, // will be refreshed on next 401
      });
      return true;
    } catch {
      return false;
    }
  },

  async updatePushToken(token: string): Promise<void> {
    await api.patch('/users/me', { pushToken: token });
  },
};
