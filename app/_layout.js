import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  ensureNotificationSetup,
  getInitialNotificationRoute,
  registerForegroundHandler,
} from '../lib/notifications';

const HEADER_OPTIONS = {
  headerStyle: {
    backgroundColor: '#27C570',
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
  headerShadowVisible: false,
};

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    ensureNotificationSetup();

    const unsubscribe = registerForegroundHandler(router.push);

    getInitialNotificationRoute().then((route) => {
      if (!cancelled && route) {
        router.push(route);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'PillTime',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="pill/add"
        options={{
          title: 'Add Medication',
          ...HEADER_OPTIONS,
        }}
      />
      <Stack.Screen
        name="pill/[id]/edit"
        options={{
          title: 'Edit Medication',
          ...HEADER_OPTIONS,
        }}
      />
      <Stack.Screen
        name="alarm/[pillId]"
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack>
  );
}
