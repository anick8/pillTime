import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import PillListItem from '../components/PillListItem';
import EmptyState from '../components/EmptyState';
import { getAllPills } from '../lib/storage';

export default function HomeScreen() {
  const router = useRouter();
  const [pills, setPills] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAllPills().then((loaded) => {
        if (active) setPills(loaded);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/pill/add')} style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Your Medications</Text>
        <Text style={styles.headerSubtitle}>{pills.length} pill{pills.length !== 1 ? 's' : ''} tracked</Text>
      </View>

      {pills.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={pills}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PillListItem pill={item} onPress={() => router.push(`/pill/${item.id}/edit`)} />
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled={pills.length > 3}
        />
      )}

      <Pressable style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} onPress={() => router.push('/pill/add')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFE',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#27C570',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D4F4E8',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#27C570',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#27C570',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
});
