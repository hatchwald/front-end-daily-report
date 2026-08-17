import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { connectionKeys } from '@/features/connections/hooks/use-connections';
import { RepositoriesPage } from '@/features/repositories/pages/repositories-page';
import { repositoryKeys } from '@/features/repositories/hooks/use-repositories';

describe('repositories page', () => {
  it('filters repositories by full name', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
    queryClient.setQueryData(connectionKeys.list(), [
      {
        id: 'connection-1',
        provider: 'github',
        baseUrl: 'https://github.com',
        providerUsername: 'jake',
        installationId: '1',
        status: 'active',
        createdAt: '2026-08-18T00:00:00.000Z',
      },
    ]);
    queryClient.setQueryData(repositoryKeys.list(), [
      {
        id: 'repository-1',
        connectionId: 'connection-1',
        provider: 'github',
        externalId: '1',
        name: 'frontend',
        fullName: 'acme/frontend',
        url: null,
        enabled: true,
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
      {
        id: 'repository-2',
        connectionId: 'connection-1',
        provider: 'github',
        externalId: '2',
        name: 'backend',
        fullName: 'acme/backend',
        url: null,
        enabled: false,
        updatedAt: '2026-08-18T00:00:00.000Z',
      },
    ]);
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RepositoriesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.type(screen.getByRole('searchbox', { name: 'Search repositories' }), 'front');
    expect(screen.getByText('acme/frontend')).toBeVisible();
    expect(screen.queryByText('acme/backend')).not.toBeInTheDocument();
  });
});
