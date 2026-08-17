import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useReportHistory } from '@/features/reports/hooks/use-reports';
import { formatReportDate } from '@/features/reports/lib/report-formatters';

const pageSize = 10;

export function ReportHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get('page') ?? '1');
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const history = useReportHistory(page, pageSize);
  const currentUser = useCurrentUser();
  const totalPages = Math.max(1, Math.ceil((history.data?.meta.total ?? 0) / pageSize));
  const timeZone = currentUser.data?.timezone ?? 'UTC';

  useEffect(() => {
    document.title = 'Report history | DevLog';
  }, []);

  function goToPage(nextPage: number) {
    setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) });
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Report history</h1>
          <p className="mt-2 text-slate-600">Review reports generated for previous work days.</p>
        </div>
        <Link className="font-medium text-blue-700 hover:underline" to="/reports">
          Generate report
        </Link>
      </div>

      <div className="mt-6">
        {history.isPending ? <p role="status">Loading report history...</p> : null}
        {history.isError ? (
          <section className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-red-800">Unable to load report history.</p>
            <Button className="mt-4" onClick={() => void history.refetch()}>
              Try again
            </Button>
          </section>
        ) : null}
        {history.isSuccess && history.data.data.length === 0 ? (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-950">No reports generated yet</h2>
            <p className="mt-2 text-slate-600">Choose a date and generate your first report.</p>
            <Link
              className="mt-4 inline-block font-medium text-blue-700 hover:underline"
              to="/reports"
            >
              Generate your first report
            </Link>
          </section>
        ) : null}
        {history.data && history.data.data.length > 0 ? (
          <>
            <ul className="space-y-3">
              {history.data.data.map((report) => (
                <li key={report.id}>
                  <Link
                    className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow"
                    to={`/reports/${report.reportDate}`}
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <h2 className="font-semibold text-slate-950">
                          {formatReportDate(report.reportDate, timeZone)}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{report.summary}</p>
                      </div>
                      <dl className="flex shrink-0 gap-4 text-sm text-slate-600">
                        <div>
                          <dt className="sr-only">Commits</dt>
                          <dd>{report.totalCommits} commits</dd>
                        </div>
                        <div>
                          <dt className="sr-only">Merge requests</dt>
                          <dd>{report.totalMergeRequests} MRs</dd>
                        </div>
                        <div>
                          <dt className="sr-only">Reviews</dt>
                          <dd>{report.totalReviews} reviews</dd>
                        </div>
                      </dl>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <nav
              aria-label="Report history pagination"
              className="mt-6 flex items-center justify-between"
            >
              <Button
                className="bg-transparent text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                disabled={page <= 1 || history.isFetching}
                onClick={() => goToPage(page - 1)}
              >
                Previous
              </Button>
              <p className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </p>
              <Button
                className="bg-transparent text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                disabled={page >= totalPages || history.isFetching}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </Button>
            </nav>
          </>
        ) : null}
      </div>
    </section>
  );
}
