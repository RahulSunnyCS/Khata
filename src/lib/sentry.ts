import * as Sentry from '@sentry/react-native';
import { Config } from '../constants/config';

export function initSentry(): void {
  if (!Config.sentryDsn) return;

  Sentry.init({
    dsn: Config.sentryDsn,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    // Session replay at 10% per spec
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: __DEV__ ? 'development' : 'production',
    integrations: [Sentry.mobileReplayIntegration()],
  });
}

export function setSentryUser(id: string, email?: string): void {
  Sentry.setUser({ id, email });
}

export function clearSentryUser(): void {
  Sentry.setUser(null);
}

export function captureError(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, { extra: context });
}

export { Sentry };
