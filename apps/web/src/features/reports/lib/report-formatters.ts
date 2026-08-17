import type { Report } from '@/features/reports/report.types';

export function getLocalCalendarDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReportDate(date: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date(`${date}T12:00:00Z`));
}

export function formatReportAsText(report: Report, timeZone: string): string {
  const lines = [formatReportDate(report.reportDate, timeZone), '', 'Summary', report.summary, ''];
  for (const item of report.items) {
    lines.push(
      item.repositoryName,
      item.title,
      `- ${item.description}`,
      `${item.activityCount} ${item.category.replace('_', ' ')}`,
      '',
    );
  }
  lines.push(
    'Statistics',
    `${report.totalCommits} commits`,
    `${report.totalMergeRequests} merge requests`,
    `${report.totalReviews} reviews`,
  );
  return lines.join('\n');
}
