import { apiClient } from '@/lib/api-client';
import type { AuthResponse, LoginInput, RegisterInput, User } from '@/features/auth/auth.types';

export async function getCurrentUser(signal?: AbortSignal): Promise<User> {
  const response = await apiClient.get<AuthResponse>('/api/v1/auth/me', signal);
  return response.data.user;
}

export async function login(input: LoginInput): Promise<User> {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', input);
  return response.data.user;
}

export async function register(input: RegisterInput): Promise<User> {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', input);
  return response.data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post<void>('/api/v1/auth/logout');
}
