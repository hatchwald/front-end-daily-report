import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createGitHubAuthorization,
  createGitLabAuthorization,
  disconnectConnection,
  getConnections,
} from '@/features/connections/api/connections.api';

export const connectionKeys = {
  all: ['connections'] as const,
  list: () => [...connectionKeys.all, 'list'] as const,
};

export function useConnections() {
  return useQuery({
    queryKey: connectionKeys.list(),
    queryFn: ({ signal }) => getConnections(signal),
  });
}

export function useGitHubAuthorization() {
  return useMutation({ mutationFn: createGitHubAuthorization });
}

export function useGitLabAuthorization() {
  return useMutation({ mutationFn: (baseUrl: string) => createGitLabAuthorization(baseUrl) });
}

export function useDisconnectConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectConnection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: connectionKeys.all }),
  });
}
