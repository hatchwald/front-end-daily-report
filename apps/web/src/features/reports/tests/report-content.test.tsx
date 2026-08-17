import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReportContent } from '@/features/reports/components/report-content';
import { reportFixture } from '@/features/reports/tests/report-formatters.test';

describe('report content', () => {
  it('renders report activity and statistics', () => {
    render(<ReportContent report={reportFixture} timeZone="Asia/Jakarta" />);
    expect(screen.getByRole('heading', { name: 'acme/web' })).toBeVisible();
    expect(screen.getByText('Fixed filtering.')).toBeVisible();
    expect(screen.getByText('Merge requests')).toBeVisible();
  });
});
