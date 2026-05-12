import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { AuthHeader } from '../components/AuthHeader';
import { Screen } from '../components/Screen';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { RegisterPayload } from '../types/auth';
import { RootStackParamList } from '../types/navigation';

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { isSubmitting, register } = useAuth();
  const [form, setForm] = useState<RegisterPayload>({
    confirmPassword: '',
    email: '',
    name: '',
    password: '',
    university: ''
  });
  const [formError, setFormError] = useState('');
  const [isCollegeAdminRequest, setIsCollegeAdminRequest] = useState(false);

  const passwordHint = useMemo(() => {
    if (!form.password) {
      return '';
    }

    const hasUppercase = /[A-Z]/.test(form.password);
    const hasNumber = /[0-9]/.test(form.password);
    const hasMinLength = form.password.length >= 8;

    return hasUppercase && hasNumber && hasMinLength
      ? ''
      : 'Use 8+ characters with one uppercase letter and one number.';
  }, [form.password]);

  function updateForm(field: keyof RegisterPayload, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleRegister() {
    setFormError('');

    if (Object.values(form).some((value) => !value.trim())) {
      setFormError('Please complete all fields.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      await register({
        ...form,
        email: form.email.trim(),
        name: form.name.trim(),
        university: form.university.trim(),
        requestedRole: isCollegeAdminRequest ? 'COLLEGE_ADMIN' : 'STUDENT'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed.';
      Alert.alert('Could not create account', message);
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <AuthHeader
        title="Join Campus Connect"
        subtitle="Create your student account with your university details."
      />

      <View>
        <AppTextInput
          autoCapitalize="words"
          label="Full name"
          onChangeText={(value) => updateForm('name', value)}
          placeholder="Jane Smith"
          value={form.name}
        />
        <AppTextInput
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => updateForm('email', value)}
          placeholder="jane@university.edu"
          value={form.email}
        />
        <AppTextInput
          autoCapitalize="words"
          label="University"
          onChangeText={(value) => updateForm('university', value)}
          placeholder="MIT"
          value={form.university}
        />
        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchTitle}>Register as college admin</Text>
            <Text style={styles.switchSubtitle}>Requires platform approval before posting events.</Text>
          </View>
          <Switch value={isCollegeAdminRequest} onValueChange={setIsCollegeAdminRequest} />
        </View>
        <AppTextInput
          error={passwordHint}
          label="Password"
          onChangeText={(value) => updateForm('password', value)}
          placeholder="SecurePass1"
          secureTextEntry
          value={form.password}
        />
        <AppTextInput
          label="Confirm password"
          onChangeText={(value) => updateForm('confirmPassword', value)}
          placeholder="SecurePass1"
          secureTextEntry
          value={form.confirmPassword}
        />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <AppButton title="Create account" loading={isSubmitting} onPress={handleRegister} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('Login')}
        style={styles.switcher}
      >
        <Text style={styles.switcherText}>Already have an account? Sign in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'flex-start',
    paddingTop: 32
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 14
  },
  switcher: {
    alignItems: 'center',
    marginTop: 24,
    minHeight: 44,
    justifyContent: 'center'
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  switchSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  switchTextWrap: {
    flex: 1,
    paddingRight: 12
  },
  switchTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
  switcherText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700'
  }
});
