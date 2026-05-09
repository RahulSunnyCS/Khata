import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const Config = {
  apiBaseUrl: (extra.apiBaseUrl as string) ?? 'https://api.khaata.app/v1',
  socketUrl: (extra.socketUrl as string) ?? 'https://ws.khaata.app',

  // Auth
  googleWebClientId: (extra.googleWebClientId as string) ?? '',
  googleAndroidClientId: (extra.googleAndroidClientId as string) ?? '',
  googleIosClientId: (extra.googleIosClientId as string) ?? '',

  // Analytics
  posthogApiKey: (extra.posthogApiKey as string) ?? '',
  posthogHost: (extra.posthogHost as string) ?? 'https://app.posthog.com',

  // Monitoring
  sentryDsn: (extra.sentryDsn as string) ?? '',

  // AWS
  s3BucketUrl: (extra.s3BucketUrl as string) ?? '',
} as const;

// Currency & locale defaults (India-first)
export const Locale = {
  defaultCurrency: 'INR',
  currencySymbol: '₹',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'en-IN',
} as const;
