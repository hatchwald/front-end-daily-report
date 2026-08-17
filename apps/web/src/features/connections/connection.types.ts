export type GitProvider = 'github' | 'gitlab';
export type ConnectionStatus = 'active' | 'expired' | 'revoked' | 'error';

export interface GitConnection {
  id: string;
  provider: GitProvider;
  baseUrl: string;
  providerUsername: string;
  installationId: string | null;
  status: ConnectionStatus;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
