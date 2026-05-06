import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { AuthHeader } from '../components/AuthHeader';
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
    <Screen>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to continue your campus conversations and profile."
      />

      <View>
        <AppTextInput
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="jane@university.edu"
          value={email}
        />
        <AppTextInput
          label="Password"
          onChangeText={setPassword}
          placeholder="SecurePass1"
          secureTextEntry
          value={password}
        />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <AppButton title="Sign in" loading={isSubmitting} onPress={handleLogin} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('Register')}
        style={styles.switcher}
      >
        <Text style={styles.switcherText}>New here? Create an account</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  switcherText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700'
  }
});
