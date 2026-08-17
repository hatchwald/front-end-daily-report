import type { GitConnection } from '@/features/connections/connection.types';
import type { Repository } from '@/features/repositories/repository.types';

interface RepositoryGroupProps {
  connection?: GitConnection | undefined;
  overrides: Readonly<Record<string, boolean>>;
  repositories: Repository[];
  onToggle: (repository: Repository, enabled: boolean) => void;
}

export function RepositoryGroup({
  connection,
  overrides,
  repositories,
  onToggle,
}: RepositoryGroupProps) {
  const providerName = repositories[0]?.provider === 'github' ? 'GitHub' : 'GitLab';
  const accountName = connection?.providerUsername ?? 'Unknown account';

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-950">
          {providerName} · {accountName}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'}
        </p>
      </header>
      <ul className="divide-y divide-slate-100">
        {repositories.map((repository) => {
          const enabled = overrides[repository.id] ?? repository.enabled;
          return (
            <li className="flex items-center justify-between gap-4 px-5 py-4" key={repository.id}>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{repository.fullName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {enabled ? 'Included in reports' : 'Excluded from reports'}
                </p>
              </div>
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2">
                <input
                  checked={enabled}
                  className="h-5 w-5 rounded border-slate-300 accent-blue-700"
                  onChange={(event) => onToggle(repository, event.target.checked)}
                  type="checkbox"
                />
                <span className="sr-only">Include {repository.fullName} in reports</span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
