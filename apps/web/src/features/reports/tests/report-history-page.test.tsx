import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { authKeys } from '@/features/auth/hooks/use-current-user';
import { ReportHistoryPage } from '@/features/reports/pages/report-history-page';

afterEach(() => {
  vi.restoreAllMocks();
});

function renderHistory(responseBody: unknown) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(authKeys.currentUser, {
    id: 'user-1',
    email: 'dev@example.com',
    name: 'Dev',
    timezone: 'Asia/Jakarta',
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ReportHistoryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('report history page', () => {
  it('shows an actionable empty state', async () => {
    renderHistory({ success: true, data: [], meta: { page: 1, limit: 10, total: 0 } });
    expect(await screen.findByText('No reports generated yet')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Generate your first report' })).toHaveAttribute(
      'href',
      '/reports',
    );
  });

  it('renders reports and paginates through URL state', async () => {
    const user = userEvent.setup();
    renderHistory({
      success: true,
      data: [
        {
          id: 'report-1',
          reportDate: '2026-08-17',
          summary: 'Dashboard work',
          totalCommits: 3,
          totalMergeRequests: 1,
          totalReviews: 0,
          generatedAt: '2026-08-18T00:00:00.000Z',
        },
      ],
      meta: { page: 1, limit: 10, total: 11 },
    });

    expect(await screen.findByRole('link', { name: /17 August 2026/i })).toHaveAttribute(
      'href',
      '/reports/2026-08-17',
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Page 2 of 2')).toBeVisible();
  });
});
