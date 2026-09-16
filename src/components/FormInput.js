import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function FormInput({ label, secureTextEntry, error, style, ...props }) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputBox, error && styles.inputError]}>
        <TextInput
          {...props}
          placeholderTextColor="#6C7D78"
          secureTextEntry={secureTextEntry && hidden}
          style={styles.input}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={10}
            onPress={() => setHidden((value) => !value)}
          >
            <Text style={styles.eye}>{hidden ? '○' : '●'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 15 },
  label: { color: '#364F4A', fontSize: 14, fontWeight: '700', marginBottom: 7 },
  inputBox: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#D6E2DE',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputError: { borderColor: '#B84C4C' },
  input: { flex: 1, color: '#263B36', fontSize: 16, paddingVertical: 14 },
  eye: { color: '#406159', fontSize: 17, paddingLeft: 10 },
  error: { color: '#B84C4C', fontSize: 12, marginTop: 5 },
});
