import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import BrandMark from '../components/BrandMark';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';

const firebaseMessage = (code) => {
  if (code === 'auth/invalid-credential') return 'Correo o contraseña incorrectos.';
  if (code === 'auth/invalid-email') return 'Ingresa un correo electrónico válido.';
  if (code === 'auth/too-many-requests') return 'Demasiados intentos. Intenta más tarde.';
  if (code === 'auth/network-request-failed') return 'No se pudo conectar. Revisa tu internet.';
  return 'No fue posible iniciar sesión. Intenta nuevamente.';
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Completa el correo y la contraseña.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (requestError) {
      setError(firebaseMessage(requestError.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.glow} />
          <View style={styles.brand}><BrandMark /></View>
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Bienvenido a Nexora. Ingresa tus datos para continuar.</Text>

          <View style={styles.form}>
            <FormInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Correo electrónico"
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              value={email}
            />
            <FormInput
              autoCapitalize="none"
              autoComplete="password"
              label="Contraseña"
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              placeholder="Ingresa tu contraseña"
              returnKeyType="done"
              secureTextEntry
              value={password}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton title="Ingresar" loading={loading} onPress={handleLogin} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Regístrate</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#DEE9E5' },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 54, paddingBottom: 28 },
  glow: {
    position: 'absolute', top: -130, left: -90, width: 320, height: 320,
    borderRadius: 160, backgroundColor: '#A8C6BC', opacity: 0.55,
  },
  brand: { alignItems: 'center', marginBottom: 28 },
  title: { textAlign: 'center', color: '#364F4A', fontSize: 31, fontWeight: '900' },
  subtitle: {
    color: '#6C7D78', fontSize: 15, lineHeight: 22, textAlign: 'center',
    marginTop: 10, marginHorizontal: 24,
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.76)', borderRadius: 24,
    padding: 20, marginTop: 34, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  error: { color: '#B84C4C', fontSize: 13, marginTop: -3, marginBottom: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 34 },
  footerText: { color: '#6C7D78', fontSize: 14 },
  link: { color: '#527A70', fontSize: 14, fontWeight: '800' },
});
