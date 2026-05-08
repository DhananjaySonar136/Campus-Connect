import { apiClient } from './client';
import { AuthResponse, LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/auth';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}

export async function updateCurrentUser(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiClient.patch<User>('/auth/me', payload);
  return response.data;
}
