import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCurrentUser } from '@/features/auth/api/auth.api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('authentication API', () => {
  it('returns the current user from the API envelope', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            user: { id: 'user-1', email: 'dev@example.com', name: 'Dev', timezone: 'Asia/Jakarta' },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(getCurrentUser()).resolves.toMatchObject({ email: 'dev@example.com' });
  });

  it('maps the nested backend error response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Session expired' },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(getCurrentUser()).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Session expired',
      }),
    );
  });
});
