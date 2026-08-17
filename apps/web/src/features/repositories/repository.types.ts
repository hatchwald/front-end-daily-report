import type { GitProvider } from '@/features/connections/connection.types';

export interface Repository {
  id: string;
  connectionId: string;
  provider: GitProvider;
  externalId: string;
  name: string;
  fullName: string;
  url: string | null;
  enabled: boolean;
  updatedAt: string;
}

export interface RepositoryPage {
  success: boolean;
  data: Repository[];
  meta: { page: number; limit: number; total: number };
}
