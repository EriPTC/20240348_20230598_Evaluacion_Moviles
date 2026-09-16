import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';

const EMPTY_PROFILE = { fullName: '', birthDate: '', carnet: '', imageUrl: '', email: '' };

export default function DashboardScreen() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [draft, setDraft] = useState(EMPTY_PROFILE);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const snapshot = await getDoc(doc(database, 'users', auth.currentUser.uid));
        const data = snapshot.exists() ? snapshot.data() : {};
        const nextProfile = { ...EMPTY_PROFILE, ...data, email: auth.currentUser.email || data.email || '' };
        setProfile(nextProfile);
        setDraft(nextProfile);
      } catch {
        Alert.alert('Error', 'No se pudo cargar la información del perfil.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const initials = useMemo(
    () => profile.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U',
    [profile.fullName],
  );

  const startEditing = () => {
    setDraft(profile);
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!draft.fullName.trim() || !draft.birthDate.trim() || !draft.carnet.trim() || !draft.imageUrl.trim()) {
      Alert.alert('Campos requeridos', 'Completa toda la información del perfil.');
      return;
    }
    if (!/^https?:\/\//i.test(draft.imageUrl.trim())) {
      Alert.alert('URL no válida', 'La imagen debe comenzar con http:// o https://.');
      return;
    }

    try {
      setSaving(true);
      const changes = {
        fullName: draft.fullName.trim(),
        birthDate: draft.birthDate.trim(),
        carnet: draft.carnet.trim(),
        imageUrl: draft.imageUrl.trim(),
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(database, 'users', auth.currentUser.uid), changes);
      setProfile((current) => ({ ...current, ...changes }));
      setEditing(false);
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const update = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));
  const rows = [
    ['Nombre completo', profile.fullName],
    ['Fecha de nacimiento', profile.birthDate],
    ['Carnet institucional', profile.carnet],
    ['Correo electrónico', profile.email],
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.eyebrow}>MI CUENTA</Text>
              <Text style={styles.title}>{editing ? 'Editar perfil' : 'Mi perfil'}</Text>
            </View>
            {editing ? (
              <Pressable accessibilityLabel="Guardar cambios" disabled={saving} onPress={saveProfile} style={styles.iconButton}>
                <Text style={styles.check}>✓</Text>
              </Pressable>
            ) : (
              <Pressable accessibilityLabel="Editar perfil" onPress={startEditing} style={styles.iconButton}>
                <Text style={styles.edit}>✎</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.profileCard}>
            {profile.imageUrl ? (
              <Image source={{ uri: profile.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.initialsAvatar]}><Text style={styles.initials}>{initials}</Text></View>
            )}
            <Text style={styles.profileName}>{profile.fullName || 'Usuario'}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Tu información</Text>
            {loading ? <Text style={styles.loading}>Cargando información...</Text> : null}

            {!loading && editing ? (
              <View style={styles.form}>
                <FormInput label="Nombre completo" onChangeText={update('fullName')} value={draft.fullName} />
                <FormInput label="Fecha de nacimiento" onChangeText={update('birthDate')} placeholder="DD/MM/AAAA" value={draft.birthDate} />
                <FormInput label="Carnet institucional" onChangeText={update('carnet')} value={draft.carnet} />
                <FormInput autoCapitalize="none" keyboardType="url" label="URL de imagen" onChangeText={update('imageUrl')} value={draft.imageUrl} />
                <View style={styles.actionRow}>
                  <View style={styles.actionHalf}><PrimaryButton title="Cancelar" variant="secondary" onPress={() => setEditing(false)} /></View>
                  <View style={styles.actionHalf}><PrimaryButton title="Guardar" loading={saving} onPress={saveProfile} /></View>
                </View>
              </View>
            ) : null}

            {!loading && !editing ? rows.map(([label, value], index) => (
              <View key={label} style={[styles.infoRow, index === rows.length - 1 && styles.lastRow]}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'Sin información'}</Text>
              </View>
            )) : null}
          </View>

          {!editing ? <PrimaryButton title="Cerrar sesión" variant="secondary" onPress={() => signOut(auth)} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#DEE9E5' },
  flex: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 35 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: '#527A70', fontSize: 12, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: '#364F4A', fontSize: 30, fontWeight: '900', marginTop: 3 },
  iconButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  check: { color: '#527A70', fontSize: 25, fontWeight: '900' },
  edit: { color: '#527A70', fontSize: 25, fontWeight: '900' },
  profileCard: { alignItems: 'center', marginVertical: 28 },
  avatar: { width: 116, height: 116, borderRadius: 58, borderWidth: 5, borderColor: '#FFFFFF' },
  initialsAvatar: { backgroundColor: '#527A70', alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' },
  profileName: { color: '#364F4A', fontSize: 22, fontWeight: '900', marginTop: 13, textAlign: 'center' },
  profileEmail: { color: '#6C7D78', fontSize: 14, marginTop: 4 },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 24, padding: 20, marginBottom: 18 },
  sectionTitle: { color: '#364F4A', fontSize: 19, fontWeight: '900', marginBottom: 8 },
  loading: { color: '#6C7D78', paddingVertical: 22, textAlign: 'center' },
  form: { paddingTop: 12 },
  infoRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#D6E2DE' },
  lastRow: { borderBottomWidth: 0 },
  infoLabel: { color: '#6C7D78', fontSize: 12, fontWeight: '700', marginBottom: 5 },
  infoValue: { color: '#263B36', fontSize: 16, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionHalf: { flex: 1 },
});
