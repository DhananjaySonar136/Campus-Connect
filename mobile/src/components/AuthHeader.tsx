import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>CC</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginBottom: 22,
    width: 48
  },
  markText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  subtitle: {
    color: colors.subtle,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40
  }
});
