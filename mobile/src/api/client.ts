import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants/config';
import { getStoredToken } from '../storage/authStorage';
import { ApiError } from '../types/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiError>(error)) {
    return 'Something went wrong. Please try again.';
  }

  const axiosError = error as AxiosError<ApiError>;
  const data = axiosError.response?.data;
  const firstFieldError = data?.errors?.[0]?.message;

  return firstFieldError || data?.message || axiosError.message || 'Request failed.';
}
