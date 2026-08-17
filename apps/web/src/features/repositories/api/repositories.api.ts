import type { Repository, RepositoryPage } from '@/features/repositories/repository.types';
import { apiClient } from '@/lib/api-client';

const pageSize = 100;

export async function getRepositories(signal?: AbortSignal): Promise<Repository[]> {
  const firstPage = await apiClient.get<RepositoryPage>(
    `/api/v1/repositories/?page=1&limit=${pageSize}`,
    signal,
  );
  const pageCount = Math.ceil(firstPage.meta.total / pageSize);
  if (pageCount <= 1) return firstPage.data;

  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      apiClient.get<RepositoryPage>(
        `/api/v1/repositories/?page=${index + 2}&limit=${pageSize}`,
        signal,
      ),
    ),
  );
  return [firstPage, ...remainingPages].flatMap((page) => page.data);
}

export async function syncRepositories(connectionIds: string[]): Promise<number> {
  const response = await apiClient.post<{ success: boolean; data: { repositoryCount: number } }>(
    '/api/v1/repositories/sync',
    { connectionIds },
  );
  return response.data.repositoryCount;
}

export async function updateRepository(repositoryId: string, enabled: boolean): Promise<void> {
  await apiClient.patch<void>(`/api/v1/repositories/${encodeURIComponent(repositoryId)}`, {
    enabled,
  });
}

export async function saveRepositorySelections(
  changes: Array<{ id: string; enabled: boolean }>,
): Promise<void> {
  await Promise.all(changes.map((change) => updateRepository(change.id, change.enabled)));
}
