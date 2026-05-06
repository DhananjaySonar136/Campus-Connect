import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { getCurrentUser } from '../api/authApi';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export function HomeScreen() {
  const { logout, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(user);

  async function refreshProfile() {
    setRefreshing(true);

    try {
      const latestProfile = await getCurrentUser();
      setProfile(latestProfile);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Screen
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Campus Connect</Text>
        <Text style={styles.title}>Hi, {profile?.name || 'student'}</Text>
        <Text style={styles.subtitle}>{profile?.university || 'Your university'} community is ready.</Text>
      </View>

      <View style={styles.panel}>
        <ProfileRow label="Email" value={profile?.email} />
        <ProfileRow label="University" value={profile?.university} />
        <ProfileRow label="Role" value={profile?.role} />
        <ProfileRow label="Joined" value={formatDate(profile?.createdAt)} />
      </View>

      <View style={styles.actions}>
        <AppButton title="Refresh profile" variant="secondary" loading={refreshing} onPress={refreshProfile} />
        <AppButton title="Sign out" variant="danger" onPress={logout} />
      </View>
    </Screen>
  );
}

function ProfileRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '-'}</Text>
    </View>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    marginTop: 24
  },
  content: {
    justifyContent: 'flex-start',
    paddingTop: 32
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase'
  },
  header: {
    marginBottom: 26
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 6
  },
  row: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16
  },
  rowLabel: {
    color: colors.subtle,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5
  },
  rowValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600'
  },
  subtitle: {
    color: colors.subtle,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginTop: 12
  }
});
