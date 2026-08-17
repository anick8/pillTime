import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  EventType,
  RepeatFrequency,
  TriggerType,
} from 'react-native-notify-kit';
import { ANDROID_CHANNEL_ID } from './constants';
import {
  clearNotificationMapForPill,
  getNotificationMap,
  setNotificationMapEntry,
  setNotificationMapForPill,
} from './storage';

let setupDone = false;

/**
 * Idempotent setup: request notification permission and ensure the Android
 * alarm channel exists. Safe to call multiple times (e.g. from _layout mount).
 */
export async function ensureNotificationSetup() {
  if (setupDone) return;
  await notifee.requestPermission();
  await createPillAlarmChannel();
  setupDone = true;
}

/**
 * Creates (or updates, since createChannel is idempotent by channel id) the
 * Android notification channel used for all pill alarm notifications.
 */
export async function createPillAlarmChannel() {
  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: 'Pill Alarms',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'default',
    vibration: true,
    bypassDnd: true,
  });
}

/**
 * Computes the next occurrence (as a millisecond timestamp) of the given
 * hour:minute — today if that time hasn't passed yet, otherwise tomorrow.
 * Local helper only used within this file for building the initial
 * TIMESTAMP trigger for a DAILY-repeating reminder.
 */
function nextOccurrenceTimestamp(hour, minute) {
  const now = new Date();
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0
  );
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

/**
 * Schedules a daily repeating alarm-style trigger notification for every
 * time entry on the given pill, storing the resulting notification ids in
 * the notification map (lib/storage.js) keyed by pillId -> timeEntryId.
 */
export async function schedulePillReminders(pill) {
  const map = {};

  for (const timeEntry of pill.times) {
    const notificationId = `${pill.id}:${timeEntry.id}`;

    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: pill.name,
        body: pill.dosageNote ? pill.dosageNote : 'Time to take your pill',
        data: {
          pillId: pill.id,
          timeEntryId: timeEntry.id,
        },
        android: {
          channelId: ANDROID_CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          category: AndroidCategory.ALARM,
          fullScreenAction: { id: 'default' },
          pressAction: { id: 'default' },
        },
        ios: {
          sound: 'default',
          interruptionLevel: 'timeSensitive',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: nextOccurrenceTimestamp(timeEntry.hour, timeEntry.minute),
        repeatFrequency: RepeatFrequency.DAILY,
        alarmManager: { type: AlarmType.SET_ALARM_CLOCK },
      }
    );

    map[timeEntry.id] = notificationId;
  }

  await setNotificationMapForPill(pill.id, map);
}

/**
 * Cancels every scheduled trigger notification for a pill and clears its
 * entry from the notification map.
 */
export async function cancelPillReminders(pillId) {
  const fullMap = await getNotificationMap();
  const pillMap = fullMap[pillId] ?? {};

  const ids = Object.values(pillMap);
  for (const notificationId of ids) {
    await notifee.cancelTriggerNotification(notificationId);
  }

  await clearNotificationMapForPill(pillId);
}

/**
 * Schedules a one-off snooze notification `minutes` from now for a specific
 * pill/time-entry. Stored in the notification map under a distinct
 * `${timeEntryId}:snooze` key (alongside the recurring entries) so that
 * cancelPillReminders() also cancels any pending snooze when a pill is
 * edited or deleted — otherwise a stray alarm could still fire later for a
 * pill that no longer exists or was rescheduled.
 */
export async function snoozePillReminder(pillId, timeEntryId, minutes) {
  const notificationId = `${pillId}:${timeEntryId}:snooze`;

  await notifee.createTriggerNotification(
    {
      id: notificationId,
      title: 'Snoozed pill reminder',
      body: 'Time to take your pill',
      data: {
        pillId,
        timeEntryId,
      },
      android: {
        channelId: ANDROID_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        category: AndroidCategory.ALARM,
        fullScreenAction: { id: 'default' },
        pressAction: { id: 'default' },
      },
      ios: {
        sound: 'default',
        interruptionLevel: 'timeSensitive',
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + minutes * 60000,
      alarmManager: { type: AlarmType.SET_ALARM_CLOCK },
    }
  );

  await setNotificationMapEntry(pillId, `${timeEntryId}:snooze`, notificationId);

  return notificationId;
}

/**
 * Registers the foreground event handler: when a pill alarm notification is
 * pressed or delivered while the app is foregrounded, navigate to the
 * in-app alarm screen. Returns the unsubscribe function from notifee.
 */
export function registerForegroundHandler(routerPush) {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS || type === EventType.DELIVERED) {
      const data = detail.notification?.data;
      if (data?.pillId) {
        routerPush(`/alarm/${data.pillId}?timeEntryId=${data.timeEntryId ?? ''}`);
      }
    }
  });
}

/**
 * Checks whether the app was launched from a notification (e.g. cold start
 * by tapping a full-screen alarm notification) and returns the route to
 * navigate to, or null if not applicable.
 */
export async function getInitialNotificationRoute() {
  const initial = await notifee.getInitialNotification();
  if (!initial) return null;

  const data = initial.notification?.data;
  if (!data?.pillId) return null;

  return `/alarm/${data.pillId}?timeEntryId=${data.timeEntryId ?? ''}`;
}
