import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConnectionsPage } from '@/features/connections/pages/connections-page';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('connections page', () => {
  it('shows guidance when there are no connected accounts', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ConnectionsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('No Git accounts connected yet')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Connect GitHub' })).toBeEnabled();
  });
});
