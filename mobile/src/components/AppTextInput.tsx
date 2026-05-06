import { Text, TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

type AppTextInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AppTextInput({ label, error, style, ...inputProps }: AppTextInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        placeholderTextColor={colors.muted}
        style={[styles.input, Boolean(error) && styles.inputError, style]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14
  },
  inputError: {
    borderColor: colors.danger
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8
  },
  wrapper: {
    marginBottom: 16
  }
});
