import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import PrimaryButton from '../../components/PrimaryButton';
import { getPillById } from '../../lib/storage';
import { snoozePillReminder } from '../../lib/notifications';
import { SNOOZE_MINUTES } from '../../lib/constants';

// NOTE: shipped as a synthesized .wav placeholder tone (no mp3 encoder was
// available in the build environment) — see README for details. Swap this
// require (and the file) for a real alarm.mp3/alarm.wav before shipping.
const alarmSource = require('../../assets/sounds/alarm.wav');

let audioModeConfigured = false;

export default function AlarmScreen() {
  const router = useRouter();
  const { pillId, timeEntryId } = useLocalSearchParams();
  const [pill, setPill] = useState(null);
  const player = useAudioPlayer(alarmSource);

  useEffect(() => {
    let active = true;
    getPillById(pillId).then((loaded) => {
      if (active) setPill(loaded);
    });
    return () => {
      active = false;
    };
  }, [pillId]);

  useEffect(() => {
    async function start() {
      if (!audioModeConfigured) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
        });
        audioModeConfigured = true;
      }
      player.loop = true;
      player.play();
    }
    start();

    return () => {
      player.pause();
      player.remove();
    };
  }, [player]);

  function stopSound() {
    player.pause();
  }

  function handleDismiss() {
    stopSound();
    router.replace('/');
  }

  async function handleSnooze(minutes) {
    stopSound();
    await snoozePillReminder(pillId, timeEntryId, minutes);
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Time to take</Text>
      <Text style={styles.name}>{pill?.name ?? 'Your pill'}</Text>
      {!!pill?.dosageNote && <Text style={styles.dosage}>{pill.dosageNote}</Text>}

      <View style={styles.actions}>
        <PrimaryButton title="Dismiss" onPress={handleDismiss} variant="success" />
        <PrimaryButton
          title={`Snooze +${SNOOZE_MINUTES.SHORT} min`}
          onPress={() => handleSnooze(SNOOZE_MINUTES.SHORT)}
          variant="neutral"
        />
        <PrimaryButton
          title={`Snooze +${SNOOZE_MINUTES.LONG} min`}
          onPress={() => handleSnooze(SNOOZE_MINUTES.LONG)}
          variant="neutral"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  eyebrow: {
    color: '#FEE2E2',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
  },
  dosage: {
    color: '#FEE2E2',
    fontSize: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  actions: {
    marginTop: 48,
    width: '100%',
    gap: 14,
  },
});
