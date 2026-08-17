import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { AppErrorBoundary } from '@/components/shared/app-error-boundary';
import { queryClient } from '@/lib/query-client';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppErrorBoundary>
  );
}
