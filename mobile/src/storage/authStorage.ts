import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

const TOKEN_KEY = '@campus_connect/token';
const USER_KEY = '@campus_connect/user';

export async function saveStoredAuth(token: string, user: User) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)]
  ]);
}

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<User | null> {
  const value = await AsyncStorage.getItem(USER_KEY);
  return value ? JSON.parse(value) as User : null;
}

export async function clearStoredAuth() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
