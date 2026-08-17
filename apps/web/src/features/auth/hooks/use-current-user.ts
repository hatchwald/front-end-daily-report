import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '@/features/auth/api/auth.api';
import { ApiError } from '@/lib/api-client';

export const authKeys = { currentUser: ['auth', 'current-user'] as const };

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: ({ signal }) => getCurrentUser(signal),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 401) && failureCount < 1,
  });
}
