import { StyleSheet, Text, View } from 'react-native';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>💊</Text>
      </View>
      <Text style={styles.title}>No Medications Yet</Text>
      <Text style={styles.text}>Add your first pill to get started with your medication tracking</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A3A34',
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    color: '#5A8D7E',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});
