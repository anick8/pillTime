import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import TimePickerRow from '../../components/TimePickerRow';
import PrimaryButton from '../../components/PrimaryButton';
import { generateId } from '../../lib/ids';
import { savePill } from '../../lib/storage';
import { schedulePillReminders } from '../../lib/notifications';

export default function AddPillScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [dosageNote, setDosageNote] = useState('');
  const [times, setTimes] = useState([{ id: generateId(), hour: 9, minute: 0 }]);

  function addTime() {
    setTimes((prev) => [...prev, { id: generateId(), hour: 9, minute: 0 }]);
  }

  function updateTime(id, next) {
    setTimes((prev) => prev.map((t) => (t.id === id ? next : t)));
  }

  function removeTime(id) {
    setTimes((prev) => prev.filter((t) => t.id !== id));
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

    const now = Date.now();
    const pill = {
      id: generateId(),
      name: name.trim(),
      dosageNote: dosageNote.trim(),
      times,
      createdAt: now,
      updatedAt: now,
    };

    await savePill(pill);
    await schedulePillReminders(pill);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Pill name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Vitamin D"
          autoFocus
        />

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
          <PrimaryButton title="Cancel" onPress={() => router.back()} variant="neutral" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FFFE' },
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
