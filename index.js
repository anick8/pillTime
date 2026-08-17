// Background notification event handler MUST be registered here, at module
// top level, before the expo-router entry import below. This file (not
// expo-router/entry) is the app's "main" so this handler is guaranteed to
// run before the JS engine is torn down between background invocations.
import notifee, { EventType } from 'react-native-notify-kit';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.DELIVERED) {
    console.log('[PillTime] alarm delivered in background', detail.notification?.id);
  }
});

import 'expo-router/entry';
