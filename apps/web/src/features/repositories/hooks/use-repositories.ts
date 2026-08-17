import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getRepositories,
  saveRepositorySelections,
  syncRepositories,
} from '@/features/repositories/api/repositories.api';

export const repositoryKeys = {
  all: ['repositories'] as const,
  list: () => [...repositoryKeys.all, 'list'] as const,
};

export function useRepositories() {
  return useQuery({
    queryKey: repositoryKeys.list(),
    queryFn: ({ signal }) => getRepositories(signal),
  });
}

export function useSyncRepositories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncRepositories,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: repositoryKeys.all }),
  });
}

export function useSaveRepositorySelections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveRepositorySelections,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: repositoryKeys.all }),
  });
}
