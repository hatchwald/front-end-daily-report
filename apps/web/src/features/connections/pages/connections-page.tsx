import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { redirectToAuthorizationUrl } from '@/features/connections/api/connections.api';
import { ConnectionEmptyState } from '@/features/connections/components/connection-empty-state';
import { DisconnectDialog } from '@/features/connections/components/disconnect-dialog';
import { GitConnectionCard } from '@/features/connections/components/git-connection-card';
import type { GitConnection } from '@/features/connections/connection.types';
import {
  useConnections,
  useDisconnectConnection,
  useGitHubAuthorization,
  useGitLabAuthorization,
} from '@/features/connections/hooks/use-connections';

export function ConnectionsPage() {
  const connections = useConnections();
  const disconnect = useDisconnectConnection();
  const githubAuthorization = useGitHubAuthorization();
  const gitlabAuthorization = useGitLabAuthorization();
  const [selectedConnection, setSelectedConnection] = useState<GitConnection | null>(null);
  const authorizationError = githubAuthorization.error ?? gitlabAuthorization.error;

  useEffect(() => {
    document.title = 'Connections | DevLog';
  }, []);

  async function connectGitHub() {
    try {
      redirectToAuthorizationUrl(await githubAuthorization.mutateAsync());
    } catch {
      /* Mutation state renders the error. */
    }
  }

  async function connectGitLab(baseUrl = 'https://gitlab.com') {
    try {
      redirectToAuthorizationUrl(await gitlabAuthorization.mutateAsync(baseUrl));
    } catch {
      /* Mutation state renders the error. */
    }
  }

  async function confirmDisconnect() {
    if (!selectedConnection) return;
    try {
      await disconnect.mutateAsync(selectedConnection.id);
      setSelectedConnection(null);
    } catch {
      /* Keep dialog open and render the error. */
    }
  }

  function reconnect(connection: GitConnection) {
    if (connection.provider === 'github') void connectGitHub();
    else void connectGitLab(connection.baseUrl);
  }

  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">Git connections</h1>
      <p className="mt-2 text-slate-600">
        Connect the accounts that DevLog should use when generating reports.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button disabled={githubAuthorization.isPending} onClick={() => void connectGitHub()}>
          {githubAuthorization.isPending ? 'Connecting GitHub...' : 'Connect GitHub'}
        </Button>
        <Button
          className="bg-slate-800 hover:bg-slate-900"
          disabled={gitlabAuthorization.isPending}
          onClick={() => void connectGitLab()}
        >
          {gitlabAuthorization.isPending ? 'Connecting GitLab...' : 'Connect GitLab.com'}
        </Button>
        <Link
          className="inline-flex min-h-11 items-center rounded-lg px-4 font-medium text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
          to="/connections/gitlab/self-hosted"
        >
          Self-hosted GitLab
        </Link>
      </div>
      {authorizationError ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          Unable to start authorization. Please try again.
        </p>
      ) : null}

      <div className="mt-8">
        {connections.isPending ? <p role="status">Loading connections...</p> : null}
        {connections.isError ? (
          <section className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-red-800">Unable to load Git connections.</p>
            <Button className="mt-4" onClick={() => void connections.refetch()}>
              Try again
            </Button>
          </section>
        ) : null}
        {connections.isSuccess && connections.data.length === 0 ? <ConnectionEmptyState /> : null}
        {connections.isSuccess && connections.data.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {connections.data.map((connection) => (
              <GitConnectionCard
                connection={connection}
                key={connection.id}
                onDisconnect={setSelectedConnection}
                onReconnect={reconnect}
              />
            ))}
          </div>
        ) : null}
      </div>

      {disconnect.isError ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          Unable to disconnect this account. Please try again.
        </p>
      ) : null}
      <DisconnectDialog
        accountName={selectedConnection?.providerUsername ?? 'this account'}
        isDisconnecting={disconnect.isPending}
        isOpen={selectedConnection !== null}
        onCancel={() => setSelectedConnection(null)}
        onConfirm={() => void confirmDisconnect()}
      />
    </section>
  );
}
