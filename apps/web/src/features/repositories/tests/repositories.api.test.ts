import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getRepositories,
  saveRepositorySelections,
} from '@/features/repositories/api/repositories.api';

afterEach(() => {
  vi.restoreAllMocks();
});

function repository(id: string) {
  return {
    id,
    connectionId: 'connection-1',
    provider: 'github',
    externalId: id,
    name: id,
    fullName: `acme/${id}`,
    url: null,
    enabled: true,
    updatedAt: '2026-08-18T00:00:00.000Z',
  };
}

describe('repository API', () => {
  it('loads every repository page', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [repository('one')],
          meta: { page: 1, limit: 100, total: 101 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [repository('two')],
          meta: { page: 2, limit: 100, total: 101 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(getRepositories()).resolves.toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('persists each changed selection', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }));
    await saveRepositorySelections([
      { id: 'one', enabled: true },
      { id: 'two', enabled: false },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
