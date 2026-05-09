# Khaata

India-first expense splitting app with UPI-native settlement and offline-first architecture.

---

## Local Development

### 1. Prerequisites

- Node.js 20+
- For iOS: Xcode 15+, CocoaPods (`sudo gem install cocoapods`)
- For Android: Android Studio + Java 17

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment

Copy the example config and fill in values. At minimum the app runs without any third-party keys — analytics, notifications, and Sentry are silently disabled when their keys are absent.

```bash
cp app.config.example.ts app.config.ts
```

If you don't have an `app.config.example.ts`, create `app.config.ts` at the project root:

```ts
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Khaata',
  slug: 'khaata',
  extra: {
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000/v1',
    socketUrl: process.env.SOCKET_URL ?? 'http://localhost:3000',
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID ?? '',
    googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID ?? '',
    googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID ?? '',
    posthogApiKey: process.env.POSTHOG_API_KEY ?? '',   // optional
    posthogHost: process.env.POSTHOG_HOST ?? 'https://app.posthog.com',
    sentryDsn: process.env.SENTRY_DSN ?? '',            // optional
    s3BucketUrl: process.env.S3_BUCKET_URL ?? '',
  },
};

export default config;
```

### 4. Run on a simulator / device

```bash
# iOS simulator
npm run ios

# Android emulator
npm run android

# Browser (limited native features)
npm run web
```

> **Note:** Push notifications require a physical device and a development build. They are automatically skipped in Expo Go and simulators.

### 5. (Optional) Native prebuild

Only needed when adding a new native module or changing `app.json` plugins:

```bash
npx expo prebuild --clean
npx expo run:ios    # or run:android
```

### 6. Run tests

```bash
npm test            # watch mode
npm run test:ci     # single run with coverage
npm run typecheck   # TypeScript check
```

---

## Tech Stack

### Core

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native + Expo | RN 0.74 / Expo SDK 51 |
| Language | TypeScript | ~5.3 |
| Navigation | Expo Router (file-based) | ~3.5 |
| State | Zustand | ^4.5 |
| Animations | React Native Reanimated | ~3.10 |

### Auth

| Provider | Purpose | Package |
|---|---|---|
| Phone OTP (MSG91) | Primary India-first auth | Backend only — REST call via `src/services/auth.service.ts` |
| Google Sign-In | OAuth 2.0 | `@react-native-google-signin/google-signin` |
| Apple Sign-In | iOS App Store requirement | `expo-apple-authentication` |
| Token storage | iOS Keychain / Android Keystore | `expo-secure-store` |

### Third-party Services

| Service | Provider | Purpose | Package |
|---|---|---|---|
| Push Notifications | FCM (Android) / APNs (iOS) via Expo | Activity alerts, pokes, payment reminders | `expo-notifications` |
| Real-time sync | Socket.IO | Live balance/expense updates | `socket.io-client` |
| Product Analytics | PostHog (self-hosted) | Funnels, session recordings, DPDP-compliant | `posthog-react-native` |
| Error Tracking | Sentry | Crash reporting, 10% session replay | `@sentry/react-native` |
| Offline storage | AsyncStorage | Expense queue, last-synced state | `@react-native-async-storage/async-storage` |
| Camera / receipts | Expo Camera + Image Picker | Receipt photo capture | `expo-camera`, `expo-image-picker` |
| Contacts | Expo Contacts | Add friends from address book | `expo-contacts` |
| CSV Import | Expo Document Picker | Splitwise import | `expo-document-picker` |
| Network state | Expo Network | Offline detection | `expo-network` |

### Testing

| Tool | Role |
|---|---|
| Jest + jest-expo | Test runner |
| @testing-library/react-native | Component rendering |
| @testing-library/jest-native | Custom matchers |

---

## Project Structure

```
khaata/
├── app/                        # Expo Router screens (file-based routing)
│   ├── _layout.tsx             # Root layout — init Sentry, PostHog, SplashScreen
│   ├── index.tsx               # Entry — restore session → redirect to auth or tabs
│   ├── (auth)/                 # Unauthenticated flow
│   │   ├── welcome.tsx         # Phone / Google / Apple / Guest options
│   │   ├── phone.tsx           # Phone number entry
│   │   ├── otp.tsx             # 6-digit OTP verification
│   │   └── profile-setup.tsx   # Display name, avatar, UPI ID (skippable)
│   └── (app)/                  # Authenticated flow
│       ├── _layout.tsx         # Init Socket.IO, register push token, network listener
│       ├── (tabs)/
│       │   ├── index.tsx       # Home — balance summary, groups, activity feed
│       │   ├── groups.tsx      # Groups list
│       │   ├── friends.tsx     # Per-friend consolidated balances
│       │   └── activity.tsx    # Global activity feed
│       ├── group/[id].tsx      # Group detail
│       ├── expense/
│       │   ├── add.tsx         # Add expense (6 split types, offline-first)
│       │   └── [id].tsx        # Expense detail + comments
│       └── settings/index.tsx  # Account, notifications, import/export
│
├── src/
│   ├── types/                  # TypeScript interfaces
│   │   ├── auth.types.ts       # AuthTokens, providers, OTP payloads
│   │   ├── user.types.ts       # User, GroupMember, GhostMember
│   │   ├── group.types.ts      # Group, GroupDetail, SimplifiedDebt
│   │   └── expense.types.ts    # Expense, SplitType, Payment, Activity, Category
│   │
│   ├── store/                  # Zustand stores
│   │   ├── auth.store.ts       # user, tokens, isAuthenticated, provider
│   │   ├── groups.store.ts     # groups list, details, balances, debts
│   │   ├── expenses.store.ts   # expenses by group, payments, activity, offline queue
│   │   └── ui.store.ts         # isOnline, hasPendingSync, activeGroupId
│   │
│   ├── services/               # API + third-party service calls
│   │   ├── api.ts              # Fetch wrapper — JWT auth, auto-refresh on 401
│   │   ├── auth.service.ts     # signup, login, OTP, Google, Apple, logout, restoreSession
│   │   ├── groups.service.ts   # CRUD, members, balances, invite links
│   │   ├── expenses.service.ts # CRUD, comments, receipt upload, payments, activity
│   │   └── import.service.ts   # Splitwise CSV preview + confirm, CSV export
│   │
│   ├── lib/                    # Infrastructure wrappers
│   │   ├── storage.ts          # SecureStore (tokens) + AsyncStorage (app data)
│   │   ├── socket.ts           # Socket.IO client — init, rooms, typed events
│   │   ├── notifications.ts    # Push registration (FCM/APNs), listeners
│   │   ├── analytics.ts        # PostHog — init, identify, typed event catalogue
│   │   └── sentry.ts           # Sentry — init, setUser, captureError
│   │
│   ├── utils/                  # Pure business logic
│   │   ├── splits.ts           # All 6 split calculation algorithms
│   │   └── balances.ts         # Net balance aggregation + simplify-debts algorithm
│   │
│   └── constants/
│       ├── theme.ts            # Colors, Typography, Spacing, BorderRadius
│       └── config.ts           # Env config, locale defaults (INR, DD/MM/YYYY)
│
├── assets/                     # Images, fonts, icons
├── jest.setup.ts               # Global mocks for all native modules
└── __tests__/                  # Co-located with src/ under __tests__/ subdirs
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode 15+, CocoaPods
- For Android: Android Studio, Java 17+

### Install

```bash
npm install
```

### Environment

Create an `app.config.ts` (or add `extra` to `app.json`) for runtime config:

```ts
// app.config.ts
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Khaata',
  slug: 'khaata',
  extra: {
    apiBaseUrl: process.env.API_BASE_URL ?? 'https://api.khaata.app/v1',
    socketUrl: process.env.SOCKET_URL ?? 'https://ws.khaata.app',
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID ?? '',
    googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID ?? '',
    googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID ?? '',
    posthogApiKey: process.env.POSTHOG_API_KEY ?? '',
    posthogHost: process.env.POSTHOG_HOST ?? 'https://app.posthog.com',
    sentryDsn: process.env.SENTRY_DSN ?? '',
    s3BucketUrl: process.env.S3_BUCKET_URL ?? '',
  },
};

export default config;
```

All values are read at runtime via `src/constants/config.ts`. No secrets go in source control.

### Run

```bash
npm run android     # Android emulator / device
npm run ios         # iOS simulator / device
npm run web         # Browser (limited native features)
```

---

## Integration Guide

### 1. Phone OTP (MSG91)

OTP delivery is handled entirely by the backend. The mobile app only calls:

- `POST /auth/otp/request` — triggers SMS via MSG91
- `POST /auth/otp/verify` — verifies the 6-digit code, returns JWT tokens

On Android, OTP auto-fill works via SMS User Consent API (no SMS_READ permission needed). Wire it up in `app/(auth)/otp.tsx` using [`react-native-otp-verify`](https://github.com/faizalshap/react-native-otp-verify) when ready.

### 2. Google Sign-In

```ts
// In app/(auth)/welcome.tsx
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Call once at app start (e.g. in app/_layout.tsx)
GoogleSignin.configure({
  webClientId: Config.googleWebClientId,
  iosClientId: Config.googleIosClientId,
});

// On button press
const { idToken } = await GoogleSignin.signIn();
await authService.loginWithGoogle({ idToken });
```

**Required setup:**
- Add `google-services.json` to `android/app/` (from Firebase Console)
- Add `GoogleService-Info.plist` to the iOS project (from Firebase Console)
- Register the OAuth client in Google Cloud Console; fill `GOOGLE_*_CLIENT_ID` env vars

### 3. Apple Sign-In

```ts
// In app/(auth)/welcome.tsx — iOS only
import * as AppleAuthentication from 'expo-apple-authentication';

const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
});
await authService.loginWithApple({
  identityToken: credential.identityToken!,
  authorizationCode: credential.authorizationCode!,
  email: credential.email ?? undefined,
  fullName: credential.fullName?.givenName ?? undefined,
});
```

**Note:** Apple only sends `email` and `fullName` on the *first* sign-in. Store them immediately. On subsequent logins only `identityToken` is provided.

**Required setup:**
- Enable "Sign in with Apple" capability in Xcode
- Add the entitlement to `app.json` under `ios.entitlements`
- Register the App ID in Apple Developer Console

### 4. Push Notifications (FCM / APNs)

Registration is called automatically in `app/(app)/_layout.tsx` on mount:

```ts
import { registerForPushNotifications } from '@/src/lib/notifications';

const token = await registerForPushNotifications();
if (token) await authService.updatePushToken(token); // PATCH /users/me
```

The backend stores the push token against the user record and uses it to send notifications via FCM (Android) and APNs (iOS).

**Required setup (Android):**
- Add `google-services.json` to the project (same file used for Google Sign-In)
- `expo-notifications` plugin is already declared in `app.json`

**Required setup (iOS):**
- Upload APNs Auth Key (`.p8`) to Firebase Console
- Expo handles APNs certificate exchange automatically in managed workflow

To handle notification taps (deep link to a group or expense):

```ts
import { addNotificationResponseListener } from '@/src/lib/notifications';
import { router } from 'expo-router';

addNotificationResponseListener((response) => {
  const { groupId, expenseId } = response.notification.request.content.data as Record<string, string>;
  if (expenseId) router.push(`/(app)/expense/${expenseId}`);
  else if (groupId) router.push(`/(app)/group/${groupId}`);
});
```

### 5. Real-time Sync (Socket.IO)

The socket is initialised after login in `app/(app)/_layout.tsx`:

```ts
import { initSocket, onSocketEvent, joinRoom } from '@/src/lib/socket';

initSocket(tokens.accessToken);
joinRoom(`group:${groupId}`); // call when entering a group screen
```

Listen for events anywhere in the app:

```ts
import { onSocketEvent } from '@/src/lib/socket';
import { useEffect } from 'react';

useEffect(() => {
  const off = onSocketEvent('expense:created', ({ groupId, expenseId }) => {
    // refetch or patch local store
  });
  return off; // cleans up listener on unmount
}, []);
```

Available events are typed in `src/lib/socket.ts` — `expense:created/updated/deleted`, `payment:recorded`, `balance:updated`, `member:joined/left`, `comment:added`.

### 6. Offline-First Expense Queue

Expenses created offline are stored in Zustand (`expenses.store.ts → pendingExpenses`) and in AsyncStorage for persistence across cold starts.

```ts
import { useUiStore } from '@/src/store/ui.store';
import { useExpensesStore } from '@/src/store/expenses.store';

const isOnline = useUiStore((s) => s.isOnline);

if (!isOnline) {
  enqueuePending({ payload, queuedAt: Date.now() });
} else {
  const expense = await expensesService.create(payload);
  upsertExpense(expense);
}
```

Implement a sync worker (hook or background task) that drains `pendingExpenses` when `isOnline` flips to `true`. Use `idempotencyKey` on each expense to prevent duplicates if the request fires twice.

### 7. PostHog Analytics

Initialised in `app/_layout.tsx`. Use the typed event catalogue to avoid string typos:

```ts
import { trackEvent, identifyUser, AnalyticsEvents } from '@/src/lib/analytics';

// After login
identifyUser(user.id, { email: user.email, defaultCurrency: user.defaultCurrency });

// On action
trackEvent(AnalyticsEvents.EXPENSE_CREATED, { splitType, currency, groupId });
```

**Self-hosted setup:** Deploy PostHog on your own infra (required for DPDP compliance — all data must stay in `ap-south-1`). Set `POSTHOG_HOST` to your instance URL.

### 8. Sentry

Initialised automatically in `app/_layout.tsx`. Set the user context after login:

```ts
import { setSentryUser, clearSentryUser } from '@/src/lib/sentry';

// After login
setSentryUser(user.id, user.email ?? undefined);

// After logout
clearSentryUser();
```

Wrap non-fatal errors explicitly:

```ts
import { captureError } from '@/src/lib/sentry';
try {
  await expensesService.create(payload);
} catch (e) {
  captureError(e as Error, { groupId, splitType });
  throw e;
}
```

**Required setup:** Create a project on sentry.io, copy the DSN to `SENTRY_DSN`.

### 9. UPI Deep-link (Settlement)

UPI payments are handled natively — no server involved, no Razorpay at Phase 1.

```ts
import { Linking } from 'react-native';

function buildUpiUrl(vpa: string, amount: number, note: string): string {
  return `upi://pay?pa=${vpa}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
}

await Linking.openURL(buildUpiUrl(toUser.vpa, settleAmount, 'Khaata Settlement'));
// Show confirmation prompt: "Did you complete the payment?"
// User taps Yes → call POST /payments to record manually
```

**Never auto-mark a payment as settled.** Always wait for explicit user confirmation.

---

## Testing

```bash
npm test          # interactive watch mode
npm run test:ci   # single run with coverage (CI)
npm run typecheck # TypeScript check without emitting
```

### What's tested

| File | Scope |
|---|---|
| `src/utils/__tests__/splits.test.ts` | All 6 split algorithms, rounding, validation |
| `src/utils/__tests__/balances.test.ts` | Net balances, simplify-debts, soft-delete |
| `src/store/__tests__/auth.store.test.ts` | Store actions and state transitions |
| `src/services/__tests__/api.test.ts` | HTTP methods, error states, 401 refresh retry |

### Writing new tests

- Unit tests live in `__tests__/` next to the file they test
- Mock native modules in `jest.setup.ts` (already done for all current deps)
- Use `useAuthStore.setState({...})` to prime store state; reset in `beforeEach`
- Mock `global.fetch` per-test using `mockResolvedValueOnce`

---

## Brand & Design Tokens

Defined in `src/constants/theme.ts`:

| Token | Value |
|---|---|
| Primary (saffron) | `#C75B1A` |
| Secondary (forest green) | `#2D6A4F` |
| Dark mode background | `#000000` (true OLED black) |
| Minimum touch target | 48 × 48 dp |
| Currency symbol | ₹ (INR default) |
| Date format | DD/MM/YYYY |
| Number format | `en-IN` (1,23,456) |

---

## Roadmap

| Phase | Key additions |
|---|---|
| 1 — MVP (current) | Core splitting, UPI deep-link, offline-first, Splitwise import |
| 2 — Pro | Receipt OCR, AI insights (Claude API), live FX, recurring expenses |
| 3 — Family | Family groups, couple mode, Hindi localisation |
| 4 — Business | UPI Collect (Razorpay), WhatsApp bot, GST exports |
