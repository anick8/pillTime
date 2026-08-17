import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

function formatTime(hour, minute) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export default function TimePickerRow({ value, onChange, onRemove }) {
  const [showPicker, setShowPicker] = useState(false);

  const dateValue = new Date();
  dateValue.setHours(value.hour, value.minute, 0, 0);

  function handleChange(event, selectedDate) {
    // On Android the picker is a dialog that closes itself; on iOS it stays
    // open inline, so only hide it there when the user explicitly dismisses.
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }
    onChange({
      ...value,
      hour: selectedDate.getHours(),
      minute: selectedDate.getMinutes(),
    });
  }

  return (
    <View style={styles.row}>
      <Pressable style={styles.timeButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.timeText}>{formatTime(value.hour, value.minute)}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="time"
          is24Hour={false}
          onChange={handleChange}
        />
      )}

      {Platform.OS === 'ios' && showPicker && (
        <Pressable style={styles.doneButton} onPress={() => setShowPicker(false)}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      )}

      <Pressable style={styles.removeButton} onPress={onRemove}>
        <Text style={styles.removeText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  timeText: {
    fontSize: 16,
    color: '#111827',
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#DC2626',
    fontWeight: '700',
  },
});
