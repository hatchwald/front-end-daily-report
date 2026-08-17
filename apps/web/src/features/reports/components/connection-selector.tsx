import type { GitConnection } from '@/features/connections/connection.types';

interface ConnectionSelectorProps {
  connections: GitConnection[];
  selectedIds: string[];
  onChange: (connectionId: string, selected: boolean) => void;
}

export function ConnectionSelector({
  connections,
  selectedIds,
  onChange,
}: ConnectionSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-800">Connected accounts</legend>
      <div className="mt-3 space-y-2">
        {connections.map((connection) => (
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3"
            key={connection.id}
          >
            <input
              checked={selectedIds.includes(connection.id)}
              className="h-5 w-5 accent-blue-700"
              onChange={(event) => onChange(connection.id, event.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="font-medium text-slate-900">
                {connection.provider === 'github' ? 'GitHub' : 'GitLab'} ·{' '}
                {connection.providerUsername}
              </span>
              <span className="block text-xs text-slate-500">{connection.baseUrl}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
