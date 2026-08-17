import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

async function readJson(key, fallback) {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ---- Pills ----

export async function getAllPills() {
  return readJson(STORAGE_KEYS.PILLS, []);
}

export async function getPillById(id) {
  const pills = await getAllPills();
  return pills.find((p) => p.id === id) ?? null;
}

export async function savePill(pill) {
  const pills = await getAllPills();
  pills.push(pill);
  await writeJson(STORAGE_KEYS.PILLS, pills);
  return pill;
}

export async function updatePill(pill) {
  const pills = await getAllPills();
  const idx = pills.findIndex((p) => p.id === pill.id);
  if (idx === -1) {
    // Fall back to inserting if it doesn't exist yet.
    pills.push(pill);
  } else {
    pills[idx] = pill;
  }
  await writeJson(STORAGE_KEYS.PILLS, pills);
  return pill;
}

export async function deletePill(id) {
  const pills = await getAllPills();
  const next = pills.filter((p) => p.id !== id);
  await writeJson(STORAGE_KEYS.PILLS, next);
}

// ---- Notification map: { [pillId]: { [timeEntryId]: notificationId } } ----

export async function getNotificationMap() {
  return readJson(STORAGE_KEYS.NOTIFICATION_MAP, {});
}

export async function setNotificationMapForPill(pillId, map) {
  const full = await getNotificationMap();
  full[pillId] = map;
  await writeJson(STORAGE_KEYS.NOTIFICATION_MAP, full);
}

export async function setNotificationMapEntry(pillId, entryKey, notificationId) {
  const full = await getNotificationMap();
  full[pillId] = { ...(full[pillId] ?? {}), [entryKey]: notificationId };
  await writeJson(STORAGE_KEYS.NOTIFICATION_MAP, full);
}

export async function clearNotificationMapForPill(pillId) {
  const full = await getNotificationMap();
  delete full[pillId];
  await writeJson(STORAGE_KEYS.NOTIFICATION_MAP, full);
}
