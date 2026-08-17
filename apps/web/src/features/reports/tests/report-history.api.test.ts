import { afterEach, describe, expect, it, vi } from 'vitest';

import { getReportHistory } from '@/features/reports/api/reports.api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('report history API', () => {
  it('requests the selected page and limit', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({ success: true, data: [], meta: { page: 2, limit: 10, total: 0 } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    await getReportHistory(2, 10);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('http://localhost:3000/api/v1/reports?page=2&limit=10'),
      expect.any(Object),
    );
  });
});
