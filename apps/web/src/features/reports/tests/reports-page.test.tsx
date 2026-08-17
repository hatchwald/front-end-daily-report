import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { authKeys } from '@/features/auth/hooks/use-current-user';
import { connectionKeys } from '@/features/connections/hooks/use-connections';
import { ReportsPage } from '@/features/reports/pages/reports-page';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('reports page', () => {
  it('shows the concurrent generation error from the backend', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: 'REPORT_GENERATION_IN_PROGRESS', message: 'Already running' },
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity }, mutations: { retry: false } },
    });
    queryClient.setQueryData(authKeys.currentUser, {
      id: 'user-1',
      email: 'dev@example.com',
      name: 'Dev',
      timezone: 'Asia/Jakarta',
    });
    queryClient.setQueryData(connectionKeys.list(), [
      {
        id: 'connection-1',
        provider: 'github',
        baseUrl: 'https://github.com',
        providerUsername: 'dev',
        installationId: '1',
        status: 'active',
        createdAt: '2026-08-18T00:00:00.000Z',
      },
    ]);
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Generate report' }));
    expect(await screen.findByText(/already being generated/i)).toBeVisible();
  });
});
