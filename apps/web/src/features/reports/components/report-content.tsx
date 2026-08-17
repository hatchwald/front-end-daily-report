import { ExternalLink } from 'lucide-react';

import type { Report } from '@/features/reports/report.types';
import { formatReportDate } from '@/features/reports/lib/report-formatters';

export function ReportContent({ report, timeZone }: { report: Report; timeZone: string }) {
  const groupedItems = report.items.reduce<Record<string, typeof report.items>>((groups, item) => {
    groups[item.repositoryName] = [...(groups[item.repositoryName] ?? []), item];
    return groups;
  }, {});

  return (
    <article className="mt-8 space-y-6" aria-label={`Report for ${report.reportDate}`}>
      <header>
        <p className="text-sm font-medium text-blue-700">Generated report</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">
          {formatReportDate(report.reportDate, timeZone)}
        </h2>
      </header>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-950">Summary</h3>
        <p className="mt-2 whitespace-pre-line text-slate-700">{report.summary}</p>
      </section>
      {Object.entries(groupedItems).map(([repositoryName, items]) => (
        <section
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          key={repositoryName}
        >
          <h3 className="text-lg font-semibold text-slate-950">{repositoryName}</h3>
          <div className="mt-4 space-y-5">
            {items.map((item, index) => (
              <div key={`${item.category}-${index}`}>
                <h4 className="font-medium text-slate-900">{item.title}</h4>
                <p className="mt-1 text-slate-600">{item.description}</p>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {item.activityCount} {item.category.replace('_', ' ')}
                </p>
                {item.sourceData.length > 0 ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-blue-700">
                      View source activity
                    </summary>
                    <ul className="mt-2 space-y-2">
                      {item.sourceData.map((source) => (
                        <li
                          className="text-sm text-slate-600"
                          key={`${source.category}-${source.externalId}`}
                        >
                          {getSafeExternalUrl(source.url) ? (
                            <a
                              className="inline-flex items-center gap-1 hover:underline"
                              href={getSafeExternalUrl(source.url) ?? undefined}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {source.title}
                              <ExternalLink aria-hidden="true" size={14} />
                            </a>
                          ) : (
                            source.title
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
      <section className="grid gap-3 sm:grid-cols-3">
        <Statistic label="Commits" value={report.totalCommits} />
        <Statistic label="Merge requests" value={report.totalMergeRequests} />
        <Statistic label="Reviews" value={report.totalReviews} />
      </section>
    </article>
  );
}

function Statistic({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}

function getSafeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
