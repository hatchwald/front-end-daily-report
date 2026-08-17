import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { GitConnectionCard } from '@/features/connections/components/git-connection-card';
import type { GitConnection } from '@/features/connections/connection.types';

const connection: GitConnection = {
  id: 'connection-1',
  provider: 'github',
  baseUrl: 'https://github.com',
  providerUsername: 'jake-dev',
  installationId: '123',
  status: 'active',
  createdAt: '2026-08-18T00:00:00.000Z',
};

describe('Git connection card', () => {
  it('renders account status and exposes disconnect', async () => {
    const onDisconnect = vi.fn();
    const user = userEvent.setup();
    render(
      <GitConnectionCard
        connection={connection}
        onDisconnect={onDisconnect}
        onReconnect={vi.fn()}
      />,
    );

    expect(screen.getByText('GitHub')).toBeVisible();
    expect(screen.getByText('jake-dev')).toBeVisible();
    expect(screen.getByText('Connected')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Disconnect' }));
    expect(onDisconnect).toHaveBeenCalledWith(connection);
  });
});
