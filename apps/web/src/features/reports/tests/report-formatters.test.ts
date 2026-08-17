import { describe, expect, it } from 'vitest';

import { formatReportAsText } from '@/features/reports/lib/report-formatters';
import type { Report } from '@/features/reports/report.types';

export const reportFixture: Report = {
  id: 'report-1',
  reportDate: '2026-08-17',
  summary: 'Worked on the dashboard.',
  totalCommits: 3,
  totalMergeRequests: 1,
  totalReviews: 0,
  generatedAt: '2026-08-18T00:00:00.000Z',
  items: [
    {
      provider: 'github',
      repositoryName: 'acme/web',
      category: 'commit',
      title: 'Dashboard',
      description: 'Fixed filtering.',
      activityCount: 3,
      sourceData: [
        {
          category: 'commit',
          externalId: 'abc',
          title: 'Fix filtering',
          url: 'https://github.com/acme/web/commit/abc',
        },
      ],
    },
  ],
};

describe('report text formatting', () => {
  it('creates copyable report text with statistics', () => {
    const text = formatReportAsText(reportFixture, 'Asia/Jakarta');
    expect(text).toContain('17 August 2026');
    expect(text).toContain('acme/web');
    expect(text).toContain('3 commits');
  });
});
