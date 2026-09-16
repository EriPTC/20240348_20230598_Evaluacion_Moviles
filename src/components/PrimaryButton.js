import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

export default function PrimaryButton({ title, loading, disabled, variant = 'primary', ...props }) {
  const secondary = variant === 'secondary';

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? '#527A70' : '#FFFFFF'} />
      ) : (
        <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#527A70',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  secondary: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#6C958A' },
  text: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryText: { color: '#527A70' },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.55 },
});
