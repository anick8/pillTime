import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TimePickerRow from '../../../components/TimePickerRow';
import PrimaryButton from '../../../components/PrimaryButton';
import { generateId } from '../../../lib/ids';
import { deletePill, getPillById, updatePill } from '../../../lib/storage';
import { cancelPillReminders, schedulePillReminders } from '../../../lib/notifications';

export default function EditPillScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [dosageNote, setDosageNote] = useState('');
  const [times, setTimes] = useState([]);
  const [createdAt, setCreatedAt] = useState(null);

  useEffect(() => {
    let active = true;
    getPillById(id).then((pill) => {
      if (!active) return;
      if (pill) {
        setName(pill.name);
        setDosageNote(pill.dosageNote ?? '');
        setTimes(pill.times);
        setCreatedAt(pill.createdAt);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  function addTime() {
    setTimes((prev) => [...prev, { id: generateId(), hour: 9, minute: 0 }]);
  }

  function updateTime(timeId, next) {
    setTimes((prev) => prev.map((t) => (t.id === timeId ? next : t)));
  }

  function removeTime(timeId) {
    setTimes((prev) => prev.filter((t) => t.id !== timeId));
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a pill name.');
      return;
    }
    if (times.length === 0) {
      Alert.alert('Time required', 'Please add at least one reminder time.');
      return;
    }

    const pill = {
      id,
      name: name.trim(),
      dosageNote: dosageNote.trim(),
      times,
      createdAt: createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    await cancelPillReminders(id);
    await updatePill(pill);
    await schedulePillReminders(pill);
    router.back();
  }

  function handleDelete() {
    Alert.alert('Delete pill', 'Are you sure you want to delete this pill and its reminders?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cancelPillReminders(id);
          await deletePill(id);
          router.replace('/');
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Pill name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Vitamin D" />

        <Text style={styles.label}>Dosage note (optional)</Text>
        <TextInput
          style={styles.input}
          value={dosageNote}
          onChangeText={setDosageNote}
          placeholder="e.g. 1 tablet with food"
        />

        <Text style={styles.label}>Reminder times</Text>
        {times.map((t) => (
          <TimePickerRow
            key={t.id}
            value={t}
            onChange={(next) => updateTime(t.id, next)}
            onRemove={() => removeTime(t.id)}
          />
        ))}

        <View style={styles.addTimeRow}>
          <PrimaryButton title="+ Add time" onPress={addTime} variant="neutral" />
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Save" onPress={handleSave} variant="primary" />
          <PrimaryButton title="Delete" onPress={handleDelete} variant="danger" />
          <PrimaryButton title="Cancel" onPress={() => router.back()} variant="neutral" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FFFE' },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FFFE',
  },
  container: {
    padding: 20,
    gap: 6,
    backgroundColor: '#F8FFFE',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A3A34',
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D4F4E8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A3A34',
    backgroundColor: '#FFFFFF',
  },
  addTimeRow: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  actions: {
    marginTop: 32,
    gap: 12,
    marginBottom: 20,
  },
});
