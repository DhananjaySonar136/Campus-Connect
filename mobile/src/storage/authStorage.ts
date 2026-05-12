import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

const TOKEN_KEY = '@campus_connect/token';
const USER_KEY = '@campus_connect/user';
const PROFILE_PHOTO_KEY = '@campus_connect/profile_photo';

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
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, PROFILE_PHOTO_KEY]);
}

export async function saveStoredProfilePhoto(photoUri: string | null) {
  if (photoUri) {
    await AsyncStorage.setItem(PROFILE_PHOTO_KEY, photoUri);
    return;
  }

  await AsyncStorage.removeItem(PROFILE_PHOTO_KEY);
}

export async function getStoredProfilePhoto() {
  return AsyncStorage.getItem(PROFILE_PHOTO_KEY);
}
