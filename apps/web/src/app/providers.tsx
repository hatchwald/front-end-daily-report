import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

import { AppErrorBoundary } from '@/components/shared/app-error-boundary';
import { authKeys } from '@/features/auth/hooks/use-current-user';
import { queryClient } from '@/lib/query-client';

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    function clearExpiredSession() {
      queryClient.removeQueries({ queryKey: authKeys.currentUser });
    }

    window.addEventListener('devlog:session-expired', clearExpiredSession);
    return () => window.removeEventListener('devlog:session-expired', clearExpiredSession);
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppErrorBoundary>
  );
}
