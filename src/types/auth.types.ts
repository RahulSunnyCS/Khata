export type AuthProvider = 'email' | 'google' | 'apple' | 'phone';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
}

export interface LoginWithEmailPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface OtpRequestPayload {
  phone: string;
  countryCode: string;
}

export interface OtpVerifyPayload {
  phone: string;
  countryCode: string;
  otp: string;
}

export interface GoogleSignInPayload {
  idToken: string;
}

export interface AppleSignInPayload {
  identityToken: string;
  authorizationCode: string;
  email?: string;
  fullName?: string;
}

export interface AuthSession {
  tokens: AuthTokens;
  userId: string;
}
