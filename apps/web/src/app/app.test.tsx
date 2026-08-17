import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppLayout } from '@/app/app-layout';
import { authKeys } from '@/features/auth/hooks/use-current-user';

describe('application layout', () => {
  it('renders accessible primary navigation', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(authKeys.currentUser, {
      id: 'user-1',
      email: 'dev@example.com',
      name: 'Dev',
      timezone: 'Asia/Jakarta',
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppLayout />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reports/i })).toHaveAttribute('href', '/reports');
  });
});
