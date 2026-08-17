import type { ApiResponse, GitConnection } from '@/features/connections/connection.types';
import { apiClient } from '@/lib/api-client';

interface AuthorizationData {
  authorizationUrl: string;
}

export async function getConnections(signal?: AbortSignal): Promise<GitConnection[]> {
  const response = await apiClient.get<ApiResponse<GitConnection[]>>(
    '/api/v1/connections/',
    signal,
  );
  return response.data;
}

export async function createGitHubAuthorization(): Promise<string> {
  const response = await apiClient.post<ApiResponse<AuthorizationData>>(
    '/api/v1/connections/github',
  );
  return response.data.authorizationUrl;
}

export async function createGitLabAuthorization(baseUrl: string): Promise<string> {
  const response = await apiClient.post<ApiResponse<AuthorizationData>>(
    '/api/v1/connections/gitlab',
    { baseUrl },
  );
  return response.data.authorizationUrl;
}

export async function disconnectConnection(connectionId: string): Promise<void> {
  await apiClient.delete<void>(`/api/v1/connections/${encodeURIComponent(connectionId)}`);
}

export function redirectToAuthorizationUrl(authorizationUrl: string): void {
  const parsedUrl = new URL(authorizationUrl);
  if (!['https:', 'http:'].includes(parsedUrl.protocol))
    throw new Error('Unsupported authorization URL.');
  window.location.assign(parsedUrl.href);
}
