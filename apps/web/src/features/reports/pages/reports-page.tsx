import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useConnections } from '@/features/connections/hooks/use-connections';
import { ConnectionSelector } from '@/features/reports/components/connection-selector';
import { ReportContent } from '@/features/reports/components/report-content';
import { useGenerateReport, useReport } from '@/features/reports/hooks/use-reports';
import { formatReportAsText, getLocalCalendarDate } from '@/features/reports/lib/report-formatters';
import { ApiError } from '@/lib/api-client';

export function ReportsPage() {
  const [searchParams] = useSearchParams();
  const params = useParams<{ date: string }>();
  const navigate = useNavigate();
  const reportDateFromUrl = params.date ?? searchParams.get('date') ?? '';
  const [selectedDate, setSelectedDate] = useState(reportDateFromUrl || getLocalCalendarDate());
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[] | null>(null);
  const [formError, setFormError] = useState<string>();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const currentUser = useCurrentUser();
  const connections = useConnections();
  const reportQuery = useReport(reportDateFromUrl, Boolean(reportDateFromUrl));
  const generate = useGenerateReport();
  const activeConnections = (connections.data ?? []).filter(
    (connection) => connection.status === 'active',
  );
  const effectiveConnectionIds =
    selectedConnectionIds ?? activeConnections.map((connection) => connection.id);
  const report = reportQuery.data;

  useEffect(() => {
    document.title = 'Reports | DevLog';
  }, []);

  function toggleConnection(connectionId: string, selected: boolean) {
    setSelectedConnectionIds((current) => {
      const ids = current ?? activeConnections.map((connection) => connection.id);
      return selected ? [...ids, connectionId] : ids.filter((id) => id !== connectionId);
    });
  }

  async function submitGeneration(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!selectedDate) {
      setFormError('Choose a report date.');
      return;
    }
    if (effectiveConnectionIds.length === 0) {
      setFormError('Select at least one connected account.');
      return;
    }
    setFormError(undefined);
    try {
      const generatedReport = await generate.mutateAsync({
        date: selectedDate,
        connectionIds: effectiveConnectionIds,
      });
      await navigate(`/reports/${generatedReport.reportDate}`, { replace: true });
    } catch {
      /* Mutation state renders the error while preserving the existing report. */
    }
  }

  async function copyReport() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(
        formatReportAsText(report, currentUser.data?.timezone ?? 'UTC'),
      );
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }

  const generationError =
    generate.error instanceof ApiError && generate.error.status === 409
      ? 'A report is already being generated. Please wait for the current request to finish.'
      : generate.error instanceof ApiError && generate.error.status === 429
        ? 'Git provider rate limit reached. Please wait a moment before trying again.'
        : generate.error instanceof ApiError && generate.error.status === 403
          ? 'A Git connection has expired. Reconnect the account to continue.'
          : generate.error instanceof ApiError && generate.error.status === 502
            ? 'A Git provider could not be reached. Please try again later.'
            : generate.error
              ? 'Unable to generate the report. Your previous report is still available.'
              : null;

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Reports</h1>
          <p className="mt-2 text-slate-600">
            Generate a daily summary from your enabled repositories.
          </p>
        </div>
        <Link className="font-medium text-blue-700 hover:underline" to="/reports/history">
          View report history
        </Link>
      </div>
      <form
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={(event) => void submitGeneration(event)}
      >
        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="report-date">
            Report date
          </label>
          <input
            className="mt-2 min-h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            id="report-date"
            max={getLocalCalendarDate()}
            onChange={(event) => setSelectedDate(event.target.value)}
            type="date"
            value={selectedDate}
          />
        </div>
        <div className="mt-6">
          {connections.isPending ? <p role="status">Loading connections...</p> : null}
          {connections.isError ? (
            <p className="text-red-700" role="alert">
              Unable to load connected accounts.
            </p>
          ) : null}
          {connections.isSuccess && activeConnections.length > 0 ? (
            <ConnectionSelector
              connections={activeConnections}
              onChange={toggleConnection}
              selectedIds={effectiveConnectionIds}
            />
          ) : null}
          {connections.isSuccess && activeConnections.length === 0 ? (
            <p className="text-slate-600">
              No active Git accounts.{' '}
              <Link className="font-medium text-blue-700 hover:underline" to="/connections">
                Connect an account
              </Link>{' '}
              to generate a report.
            </p>
          ) : null}
        </div>
        {formError ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {formError}
          </p>
        ) : null}
        {generationError ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            {generationError}
          </p>
        ) : null}
        <Button
          className="mt-6"
          disabled={generate.isPending || connections.isPending || activeConnections.length === 0}
          type="submit"
        >
          {generate.isPending
            ? 'Generating report...'
            : report
              ? 'Regenerate report'
              : 'Generate report'}
        </Button>
      </form>

      {reportQuery.isPending && reportDateFromUrl ? (
        <p className="mt-8" role="status">
          Loading report...
        </p>
      ) : null}
      {reportQuery.error instanceof ApiError && reportQuery.error.status === 404 ? (
        <p className="mt-8 rounded-lg bg-slate-100 p-4 text-slate-700">
          No report exists for this date yet.
        </p>
      ) : null}
      {reportQuery.isError &&
      !(reportQuery.error instanceof ApiError && reportQuery.error.status === 404) ? (
        <p className="mt-8 rounded-lg bg-red-50 p-4 text-red-800" role="alert">
          Unable to load this report.
        </p>
      ) : null}
      {report ? (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button onClick={() => void copyReport()}>Copy report</Button>
            {copyStatus === 'copied' ? (
              <span className="text-sm text-emerald-700" role="status">
                Copied
              </span>
            ) : null}
            {copyStatus === 'error' ? (
              <span className="text-sm text-red-700" role="alert">
                Unable to copy the report.
              </span>
            ) : null}
            {generate.isPending ? (
              <span className="text-sm text-slate-600" role="status">
                Generating a replacement report...
              </span>
            ) : null}
          </div>
          <ReportContent report={report} timeZone={currentUser.data?.timezone ?? 'UTC'} />
        </>
      ) : null}
    </section>
  );
}
