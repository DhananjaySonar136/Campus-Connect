import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { isSubmitting, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  async function handleLogin() {
    setFormError('');

    if (!email || !password) {
      setFormError('Email and password are required.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.';
      Alert.alert('Could not sign in', message);
    }
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.topSection}>
        <View style={styles.brandRow}>
          <View style={styles.brandLogo}>
            <Text style={styles.brandLogoText}>C</Text>
          </View>
          <Text style={styles.brandText}>Campus Connect</Text>
        </View>
      </View>

      <View style={styles.mainSection}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to access your academic dashboard</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>University Email</Text>
          <TextInput
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="name@university.edu"
            placeholderTextColor="#8f91a5"
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>Password</Text>
            <Pressable accessibilityRole="button">
              <Text style={styles.forgotText}>Forgot?</Text>
            </Pressable>
          </View>
          <View style={styles.passwordWrap}>
            <TextInput
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor="#8f91a5"
              secureTextEntry
              style={styles.passwordInput}
              value={password}
            />
            <Text style={styles.eye}>o</Text>
          </View>
        </View>

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={handleLogin}
          style={[styles.signInButton, isSubmitting && styles.signInButtonDisabled]}
        >
          <Text style={styles.signInButtonText}>{isSubmitting ? 'Signing in...' : 'Sign In'}</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton}>
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable style={styles.socialButton}>
            <Text style={styles.socialIcon}>M</Text>
            <Text style={styles.socialText}>Microsoft</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Register')}
          style={styles.switcher}
        >
          <Text style={styles.switcherText}>
            New to Campus? <Text style={styles.switcherLink}>Create an account</Text>
          </Text>
        </Pressable>
      </View>

      <View style={styles.footerSection}>
        <View style={styles.footerDivider} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>� 2024 Campus Connect</Text>
          <Text style={styles.footerText}>Terms</Text>
          <Text style={styles.footerText}>Cookie Policy</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topSection: {
    marginTop: 4
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  brandLogo: {
    alignItems: 'center',
    backgroundColor: '#4c2ce2',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginRight: 10,
    width: 28
  },
  brandLogoText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  brandText: {
    color: '#2e2bd8',
    fontSize: 26,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  content: {
    backgroundColor: '#f1f0f6',
    justifyContent: 'space-between',
    paddingBottom: 24
  },
  mainSection: {
    marginTop: 20
  },
  title: {
    color: '#151728',
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    marginTop:0
  },
  subtitle: {
    color: '#383a4d',
    fontSize: 16,
    marginBottom: 18,
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    color: '#1f2135',
    fontSize: 16,
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#e7e5ef',
    borderRadius: 20,
    color: '#1c1d2f',
    fontSize: 16,
    marginTop: 10,
    minHeight: 54,
    paddingHorizontal: 18
  },
  passwordHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  forgotText: {
    color: '#2e2bd8',
    fontSize: 14
  },
  passwordWrap: {
    alignItems: 'center',
    backgroundColor: '#e7e5ef',
    borderRadius: 20,
    flexDirection: 'row',
    marginTop: 10,
    paddingRight: 18
  },
  passwordInput: {
    color: '#1c1d2f',
    flex: 1,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 18
  },
  eye: {
    color: '#7b7c8f',
    fontSize: 18,
    marginLeft: 12
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 12
  },
  signInButton: {
    alignItems: 'center',
    backgroundColor: '#4c2ce2',
    borderRadius: 24,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 58
  },
  signInButtonDisabled: {
    opacity: 0.7
  },
  signInButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700'
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 24
  },
  divider: {
    backgroundColor: '#cfcfdd',
    flex: 1,
    height: 1
  },
  dividerText: {
    color: '#737488',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 12
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: '#e4e2ee',
    borderRadius: 18,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56
  },
  socialIcon: {
    color: '#2d2f41',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8
  },
  socialText: {
    color: '#1c1d2f',
    fontSize: 15,
    fontWeight: '500'
  },
  switcher: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 40
  },
  switcherText: {
    color: '#2a2b3c',
    fontSize: 16
  },
  switcherLink: {
    color: '#2e2bd8',
    fontWeight: '700'
  },
  footerSection: {
    marginTop: 16
  },
  footerDivider: {
    backgroundColor: '#d7d6e2',
    height: 1,
    marginBottom: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2
  },
  footerText: {
    color: '#36374a',
    fontSize: 12
  }
});
