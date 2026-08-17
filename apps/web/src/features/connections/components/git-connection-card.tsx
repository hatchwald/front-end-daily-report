import { CircleAlert, CircleCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { GitConnection } from '@/features/connections/connection.types';

interface GitConnectionCardProps {
  connection: GitConnection;
  onDisconnect: (connection: GitConnection) => void;
  onReconnect: (connection: GitConnection) => void;
}

function getProviderName(connection: GitConnection) {
  if (connection.provider === 'github') return 'GitHub';
  return connection.baseUrl === 'https://gitlab.com' || connection.baseUrl === 'https://gitlab.com/'
    ? 'GitLab'
    : 'Self-hosted GitLab';
}

export function GitConnectionCard({
  connection,
  onDisconnect,
  onReconnect,
}: GitConnectionCardProps) {
  const isActive = connection.status === 'active';
  const providerName = getProviderName(connection);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-950">{providerName}</p>
          <p className="mt-1 text-sm text-slate-600">{connection.providerUsername}</p>
        </div>
        <span
          className={
            isActive
              ? 'inline-flex items-center gap-1 text-sm font-medium text-emerald-700'
              : 'inline-flex items-center gap-1 text-sm font-medium text-amber-700'
          }
        >
          {isActive ? (
            <CircleCheck aria-hidden="true" size={17} />
          ) : (
            <CircleAlert aria-hidden="true" size={17} />
          )}
          {isActive
            ? 'Connected'
            : connection.status === 'expired'
              ? 'Authorization expired'
              : 'Connection unavailable'}
        </span>
      </div>
      <p className="mt-4 truncate text-sm text-slate-500">{connection.baseUrl}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {!isActive ? (
          <Button onClick={() => onReconnect(connection)}>Reconnect {providerName}</Button>
        ) : null}
        <Button
          className="bg-transparent text-red-700 ring-1 ring-red-200 hover:bg-red-50"
          onClick={() => onDisconnect(connection)}
        >
          Disconnect
        </Button>
      </div>
    </article>
  );
}
