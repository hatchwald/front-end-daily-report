import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useConnections } from '@/features/connections/hooks/use-connections';
import { RepositoryGroup } from '@/features/repositories/components/repository-group';
import {
  useRepositories,
  useSaveRepositorySelections,
  useSyncRepositories,
} from '@/features/repositories/hooks/use-repositories';
import type { Repository } from '@/features/repositories/repository.types';
import { ApiError } from '@/lib/api-client';

export function RepositoriesPage() {
  const repositories = useRepositories();
  const connections = useConnections();
  const sync = useSyncRepositories();
  const save = useSaveRepositorySelections();
  const [search, setSearch] = useState('');
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = 'Repositories | DevLog';
  }, []);

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredRepositories = (repositories.data ?? []).filter((repository) =>
    repository.fullName.toLocaleLowerCase().includes(normalizedSearch),
  );
  const groupedRepositories = filteredRepositories.reduce<Record<string, Repository[]>>(
    (groups, repository) => {
      groups[repository.connectionId] = [...(groups[repository.connectionId] ?? []), repository];
      return groups;
    },
    {},
  );
  const activeConnectionIds = (connections.data ?? [])
    .filter((connection) => connection.status === 'active')
    .map((connection) => connection.id);
  const changes = Object.entries(overrides).map(([id, enabled]) => ({ id, enabled }));

  function toggleRepository(repository: Repository, enabled: boolean) {
    setOverrides((current) => {
      const next = { ...current };
      if (enabled === repository.enabled) delete next[repository.id];
      else next[repository.id] = enabled;
      return next;
    });
  }

  async function saveChanges() {
    try {
      await save.mutateAsync(changes);
      setOverrides({});
    } catch {
      /* Mutation state renders the error. */
    }
  }

  async function synchronize() {
    try {
      await sync.mutateAsync(activeConnectionIds);
    } catch {
      /* Mutation state renders the error. */
    }
  }

  const syncError =
    sync.error instanceof ApiError && sync.error.status === 403
      ? 'A Git provider authorization has expired. Reconnect the account and try again.'
      : sync.error instanceof ApiError && sync.error.status === 502
        ? 'The Git provider could not be reached. Please try again later.'
        : sync.error
          ? 'Unable to synchronize repositories.'
          : null;

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Repositories</h1>
          <p className="mt-2 text-slate-600">
            Choose which repositories are included in generated reports.
          </p>
        </div>
        <Button
          disabled={sync.isPending || activeConnectionIds.length === 0}
          onClick={() => void synchronize()}
        >
          {sync.isPending ? 'Synchronizing...' : 'Sync repositories'}
        </Button>
      </div>

      {sync.isSuccess ? (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
          Synchronized {sync.data} repositories.
        </p>
      ) : null}
      {syncError ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          {syncError}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="sr-only" htmlFor="repository-search">
            Search repositories
          </label>
          <input
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            id="repository-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search repositories"
            type="search"
            value={search}
          />
        </div>
        <Button
          disabled={changes.length === 0 || save.isPending}
          onClick={() => void saveChanges()}
        >
          {save.isPending
            ? 'Saving...'
            : `Save changes${changes.length > 0 ? ` (${changes.length})` : ''}`}
        </Button>
      </div>
      {save.isSuccess && changes.length === 0 ? (
        <p className="mt-3 text-sm text-emerald-700" role="status">
          Repository settings saved.
        </p>
      ) : null}
      {save.isError ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          Unable to save repository settings. Your selections have been preserved.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {repositories.isPending || connections.isPending ? (
          <p role="status">Loading repositories...</p>
        ) : null}
        {repositories.isError || connections.isError ? (
          <section className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-red-800">Unable to load repositories.</p>
            <Button
              className="mt-4"
              onClick={() => {
                void repositories.refetch();
                void connections.refetch();
              }}
            >
              Try again
            </Button>
          </section>
        ) : null}
        {repositories.isSuccess && repositories.data.length === 0 ? (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-950">No repositories available</h2>
            <p className="mt-2 text-slate-600">
              {activeConnectionIds.length > 0
                ? 'Synchronize your connected accounts to load repositories.'
                : 'Connect a Git account before synchronizing repositories.'}
            </p>
            {activeConnectionIds.length === 0 ? (
              <Link
                className="mt-4 inline-block font-medium text-blue-700 hover:underline"
                to="/connections"
              >
                Connect Git account
              </Link>
            ) : null}
          </section>
        ) : null}
        {repositories.isSuccess &&
        repositories.data.length > 0 &&
        filteredRepositories.length === 0 ? (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-950">No matching repositories</h2>
            <p className="mt-2 text-slate-600">Try a different repository name.</p>
          </section>
        ) : null}
        {Object.entries(groupedRepositories).map(([connectionId, group]) =>
          group ? (
            <RepositoryGroup
              connection={connections.data?.find((connection) => connection.id === connectionId)}
              key={connectionId}
              onToggle={toggleRepository}
              overrides={overrides}
              repositories={group}
            />
          ) : null,
        )}
      </div>
    </section>
  );
}
