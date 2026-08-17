import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RepositoryGroup } from '@/features/repositories/components/repository-group';
import type { Repository } from '@/features/repositories/repository.types';

const repository: Repository = {
  id: 'repository-1',
  connectionId: 'connection-1',
  provider: 'github',
  externalId: '42',
  name: 'web',
  fullName: 'acme/web',
  url: 'https://github.com/acme/web',
  enabled: false,
  updatedAt: '2026-08-18T00:00:00.000Z',
};

describe('repository group', () => {
  it('toggles repository inclusion', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<RepositoryGroup onToggle={onToggle} overrides={{}} repositories={[repository]} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Include acme/web in reports' });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith(repository, true);
  });
});
