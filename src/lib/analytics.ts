import PostHog from 'posthog-react-native';
import { Config } from '../constants/config';

let client: PostHog | null = null;

export function initAnalytics(): PostHog {
  if (client) return client;

  client = new PostHog(Config.posthogApiKey, {
    host: Config.posthogHost,
    // Flush immediately in dev, batch in prod
    flushAt: __DEV__ ? 1 : 20,
    flushInterval: __DEV__ ? 0 : 30000,
  });

  return client;
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  client?.identify(userId, traits);
}

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  client?.capture(event, properties);
}

export function resetAnalytics(): void {
  client?.reset();
}

// Typed event names for compile-time safety
export const AnalyticsEvents = {
  // Auth
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN: 'login',
  LOGOUT: 'logout',
  OTP_REQUESTED: 'otp_requested',
  OTP_VERIFIED: 'otp_verified',

  // Expenses
  EXPENSE_ADD_STARTED: 'expense_add_started',
  EXPENSE_CREATED: 'expense_created',
  EXPENSE_EDITED: 'expense_edited',
  EXPENSE_DELETED: 'expense_deleted',

  // Groups
  GROUP_CREATED: 'group_created',
  GROUP_JOINED: 'group_joined',
  INVITE_SHARED: 'invite_shared',

  // Payments
  SETTLE_STARTED: 'settle_started',
  PAYMENT_RECORDED: 'payment_recorded',
  UPI_DEEPLINK_TAPPED: 'upi_deeplink_tapped',
  POKE_SENT: 'poke_sent',

  // Import/Export
  SPLITWISE_IMPORT_STARTED: 'splitwise_import_started',
  SPLITWISE_IMPORT_COMPLETED: 'splitwise_import_completed',
  CSV_EXPORTED: 'csv_exported',

  // Offline
  EXPENSE_QUEUED_OFFLINE: 'expense_queued_offline',
  OFFLINE_SYNC_COMPLETED: 'offline_sync_completed',
} as const;
