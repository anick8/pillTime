# PillTime

PillTime is a React Native (Expo) pill-reminder app with true-alarm-style
notifications: loud, looping, full-screen alarms — not just a quiet banner —
so reminders are hard to miss even if the phone is locked or the app is
killed.

Pills are stored locally on-device (AsyncStorage). Each pill has a name, an
optional dosage note, and one or more daily reminder times. Reminders are
scheduled as native Android alarm-clock-style trigger notifications
(`AlarmType.SET_ALARM_CLOCK`) that repeat daily and launch a full-screen
in-app alarm screen with a looping sound, plus Dismiss / Snooze +5 / Snooze
+10 actions.

## Platform limitation: iOS

iOS has no equivalent to Android's full-screen intent + `SET_ALARM_CLOCK`
combination for third-party apps:

- Apple does not grant third-party apps the **Critical Alerts** entitlement
  by default, so PillTime cannot bypass Silent Mode or Do Not Disturb on
  iOS the way a real alarm clock app can.
- iOS cannot launch a full-screen UI from a killed/terminated app state the
  way Android's full-screen intent notifications can. The in-app alarm
  screen only opens when the notification is pressed, or when it's
  delivered while the app is foregrounded/recently backgrounded.

PillTime still requests a time-sensitive interruption level and plays a
loud sound on iOS, but this is a platform ceiling, not a bug in this app —
Android is the fully-featured "true alarm" experience here.

## Alarm sound placeholder

`assets/sounds/alarm.wav` is a **synthesized placeholder tone** (an
alternating two-tone siren beep, generated locally with a small Python
script using only the standard-library `wave`/`struct` modules, since
neither network access nor `ffmpeg`/`sox` were available in the build
environment to fetch or encode a real royalty-free alarm sound). It is a
valid, loopable, audible WAV file and the app will not crash on `require()`
— but **replace it with a proper alarm/siren sound before shipping**. It is
`.wav` rather than `.mp3` for the same reason (no mp3 encoder available);
`expo-audio` plays `.wav` fine, but if you swap in an `.mp3` file, update
the `require('../../assets/sounds/alarm.wav')` call in
`app/alarm/[pillId].js` accordingly.

## Requirements

This app depends on native modules (`react-native-notify-kit`,
`@react-native-community/datetimepicker`, `expo-audio`) that are **not**
available in Expo Go. You must build a custom **development client**
(`expo-dev-client`) via EAS Build or a local prebuild.

## Build & run

### Option A — EAS development build (recommended)

```bash
npx expo install expo-router expo-dev-client expo-audio expo-linking expo-constants react-native-notify-kit @react-native-async-storage/async-storage @react-native-community/datetimepicker react-native-safe-area-context react-native-screens
npx eas login
npx eas init
npx eas build --profile development --platform android
npx expo start --dev-client
```

Install the resulting `.apk` on a device/emulator, then point it at the dev
server started by `expo start --dev-client`.

### Option B — Local prebuild (bare workflow, no EAS account needed)

```bash
npx expo prebuild --platform android
npx expo run:android
```

## Architecture notes

- `lib/notifications.js` wraps all `react-native-notify-kit` (Notifee-API-
  compatible) scheduling logic: channel creation, daily repeating triggers,
  cancellation, and one-off snooze triggers.
- `lib/storage.js` wraps AsyncStorage for pills and the pill/time-entry ->
  notification-id map, so reminders can be cancelled/rescheduled on edit.
- The background notification event handler is registered at the top of
  `index.js`, before the `expo-router/entry` import, so it's guaranteed to
  be registered before any background delivery event can fire.
- `app/_layout.js` wires up permission/channel setup, the foreground event
  handler (navigates to `/alarm/[pillId]` on press/delivery), and checks
  for a cold-start "initial notification" route on mount.
