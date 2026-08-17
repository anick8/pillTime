import { Pressable, StyleSheet, Text } from 'react-native';

const VARIANT_COLORS = {
  primary: '#27C570',
  danger: '#E63946',
  neutral: '#9CA3AF',
  success: '#27C570',
  outline: '#27C570',
};

export default function PrimaryButton({ title, onPress, variant = 'primary', style, disabled }) {
  const backgroundColor = VARIANT_COLORS[variant] ?? VARIANT_COLORS.primary;
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isOutline ? styles.outlineButton : { backgroundColor },
        {
          opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
          borderColor: isOutline ? backgroundColor : 'transparent',
        },
        style,
      ]}
    >
      <Text style={[styles.text, isOutline && { color: backgroundColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#27C570',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
