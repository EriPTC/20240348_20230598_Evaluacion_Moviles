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
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import BrandMark from '../components/BrandMark';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';

const firebaseMessage = (code) => {
  if (code === 'auth/email-already-in-use') return 'Este correo ya está registrado.';
  if (code === 'auth/invalid-email') return 'Ingresa un correo electrónico válido.';
  if (code === 'auth/weak-password') return 'La contraseña debe tener al menos 6 caracteres.';
  if (code === 'auth/operation-not-allowed') return 'Habilita Email/Password en Firebase Authentication.';
  if (code === 'auth/network-request-failed') return 'No se pudo conectar. Revisa tu internet.';
  if (code === 'permission-denied') return 'Firestore rechazó el registro. Revisa sus reglas de acceso.';
  return code ? `No fue posible crear la cuenta (${code}).` : 'No fue posible crear la cuenta. Intenta nuevamente.';
};

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: '', birthDate: '', carnet: '', imageUrl: '', email: '', password: '', confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    if (Object.values(form).some((value) => !value.trim())) return 'Todos los campos son obligatorios.';
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.birthDate)) return 'Usa el formato DD/MM/AAAA para la fecha.';
    if (!/^https?:\/\//i.test(form.imageUrl.trim())) return 'La imagen debe ser una URL que comience con http:// o https://.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Ingresa un correo electrónico válido, por ejemplo nombre@correo.com.';
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (form.password !== form.confirm) return 'Las contraseñas no coinciden.';
    return '';
  };

  const handleRegister = async () => {
    const validation = validate();
    setError(validation);
    if (validation) return;

    let credential;
    try {
      setLoading(true);
      credential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await setDoc(doc(database, 'users', credential.user.uid), {
        fullName: form.fullName.trim(),
        birthDate: form.birthDate.trim(),
        carnet: form.carnet.trim(),
        imageUrl: form.imageUrl.trim(),
        email: form.email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (requestError) {
      if (credential?.user) await deleteUser(credential.user).catch(() => {});
      setError(firebaseMessage(requestError.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Pressable accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.back}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <BrandMark />
            <View style={styles.backSpacer} />
          </View>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a Nexora y crea tu perfil.</Text>

          <View style={styles.form}>
            <FormInput label="Nombre completo" onChangeText={update('fullName')} placeholder="Nombres y apellidos" value={form.fullName} />
            <View style={styles.row}>
              <FormInput label="Fecha de nacimiento" onChangeText={update('birthDate')} placeholder="DD/MM/AAAA" style={styles.half} value={form.birthDate} />
              <FormInput label="Carnet" onChangeText={update('carnet')} placeholder="20240000" style={styles.half} value={form.carnet} />
            </View>
            <FormInput autoCapitalize="none" keyboardType="url" label="URL de imagen" onChangeText={update('imageUrl')} placeholder="https://ejemplo.com/foto.jpg" value={form.imageUrl} />
            <FormInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="Correo electrónico" onChangeText={update('email')} placeholder="correo@ejemplo.com" value={form.email} />
            <FormInput autoCapitalize="none" label="Contraseña" onChangeText={update('password')} placeholder="Mínimo 6 caracteres" secureTextEntry value={form.password} />
            <FormInput autoCapitalize="none" label="Confirmar contraseña" onChangeText={update('confirm')} placeholder="Repite tu contraseña" secureTextEntry value={form.confirm} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton title="Crear cuenta" loading={loading} onPress={handleRegister} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
            <Pressable onPress={() => navigation.goBack()}><Text style={styles.link}>Inicia sesión</Text></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#DEE9E5' },
  flex: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#364F4A', fontSize: 37, lineHeight: 39, marginTop: -4 },
  backSpacer: { width: 44 },
  title: { textAlign: 'center', color: '#364F4A', fontSize: 30, fontWeight: '900', marginTop: 20 },
  subtitle: { color: '#6C7D78', fontSize: 15, textAlign: 'center', marginTop: 8 },
  form: { backgroundColor: 'rgba(255,255,255,0.78)', borderRadius: 24, padding: 18, marginTop: 26 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  error: { color: '#B84C4C', fontSize: 13, marginTop: -3, marginBottom: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingTop: 25 },
  footerText: { color: '#6C7D78', fontSize: 14 },
  link: { color: '#527A70', fontSize: 14, fontWeight: '800' },
});
