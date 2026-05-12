import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
  updateCurrentUser
} from '../api/authApi';
import { getApiErrorMessage } from '../api/client';
import {
  clearStoredAuth,
  getStoredProfilePhoto,
  getStoredToken,
  saveStoredAuth,
  saveStoredProfilePhoto
} from '../storage/authStorage';
import { AuthContextValue, LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bootstrap = useCallback(async () => {
    try {
      const storedToken = await getStoredToken();

      if (!storedToken) {
        return;
      }

      setToken(storedToken);
      const profile = await getCurrentUser();
      const localPhoto = await getStoredProfilePhoto();
      setUser({ ...profile, profilePhotoUrl: localPhoto || profile.profilePhotoUrl || null });
    } catch {
      await clearStoredAuth();
      setToken(null);
      setUser(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsSubmitting(true);

    try {
      const response = await loginRequest(payload);
      const localPhoto = await getStoredProfilePhoto();
      const nextUser = { ...response.user, profilePhotoUrl: localPhoto || response.user.profilePhotoUrl || null };
      await saveStoredAuth(response.token, nextUser);
      setToken(response.token);
      setUser(nextUser);
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsSubmitting(true);

    try {
      const response = await registerRequest(payload);
      const localPhoto = await getStoredProfilePhoto();
      const nextUser = { ...response.user, profilePhotoUrl: localPhoto || response.user.profilePhotoUrl || null };
      await saveStoredAuth(response.token, nextUser);
      setToken(response.token);
      setUser(nextUser);
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      setIsSubmitting(true);

      try {
        const updatedUser = await updateCurrentUser(payload);
        if (token) {
          await saveStoredAuth(token, updatedUser);
        }
        setUser(updatedUser);
      } catch (error) {
        throw new Error(getApiErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [token]
  );

  const setLocalProfilePhoto = useCallback(async (photoUri: string | null) => {
    await saveStoredProfilePhoto(photoUri);
    setUser((current) => {
      if (!current) {
        return current;
      }

      return { ...current, profilePhotoUrl: photoUri };
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      isSubmitting,
      login,
      logout,
      register,
      setLocalProfilePhoto,
      updateProfile,
      token,
      user
    }),
    [isBootstrapping, isSubmitting, login, logout, register, setLocalProfilePhoto, token, updateProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
