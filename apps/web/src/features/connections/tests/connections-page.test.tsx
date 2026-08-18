import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('opens provider authorization in a popup window', async () => {
    const assignLocation = vi.fn();
    const popup = {
      close: vi.fn(),
      closed: false,
      document: { title: '' },
      location: { assign: assignLocation },
    } as unknown as Window;
    const openPopup = vi.spyOn(window, 'open').mockReturnValue(popup);
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = input instanceof Request ? input.url : input instanceof URL ? input.href : input;
      const body =
        init?.method === 'POST' || url.endsWith('/connections/github')
          ? {
              success: true,
              data: { authorizationUrl: 'https://github.com/apps/devlog/installations/new' },
            }
          : { success: true, data: [] };
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ConnectionsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.click(await screen.findByRole('button', { name: 'Connect GitHub' }));
    expect(openPopup).toHaveBeenCalledWith(
      '',
      'devlog-git-authorization',
      'popup=yes,width=720,height=760',
    );
    expect(assignLocation).toHaveBeenCalledWith('https://github.com/apps/devlog/installations/new');
  });
});
