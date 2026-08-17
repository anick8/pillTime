import { Pressable, StyleSheet, Text, View } from 'react-native';

function formatTime(hour, minute) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export default function PillListItem({ pill, onPress }) {
  const timesLabel = pill.times.map((t) => formatTime(t.hour, t.minute)).join(', ');
  const pillCount = pill.times.length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Text style={styles.badgeIcon}>💊</Text>
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.name}>{pill.name}</Text>
          {!!pill.dosageNote && <Text style={styles.dosage}>{pill.dosageNote}</Text>}
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{pillCount}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>📅 Times:</Text>
        <Text style={styles.times}>{timesLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 4,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#27C570',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#27C570',
  },
  cardPressed: {
    backgroundColor: '#F0F9F6',
    elevation: 4,
    shadowOpacity: 0.15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 22,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3A34',
  },
  dosage: {
    fontSize: 13,
    color: '#5A8D7E',
    fontWeight: '500',
  },
  countBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27C570',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D4F4E8',
    marginVertical: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A8D7E',
  },
  times: {
    fontSize: 13,
    color: '#27C570',
    fontWeight: '600',
    flex: 1,
  },
});
