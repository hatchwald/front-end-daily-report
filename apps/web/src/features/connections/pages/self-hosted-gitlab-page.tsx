import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { redirectToAuthorizationUrl } from '@/features/connections/api/connections.api';
import { useGitLabAuthorization } from '@/features/connections/hooks/use-connections';
import { gitLabServerSchema } from '@/features/connections/schemas/gitlab.schema';
import { ApiError } from '@/lib/api-client';

export function SelfHostedGitLabPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [validationError, setValidationError] = useState<string>();
  const authorization = useGitLabAuthorization();
  useEffect(() => {
    document.title = 'Connect self-hosted GitLab | DevLog';
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = gitLabServerSchema.safeParse({ baseUrl });
    if (!result.success) {
      setValidationError(result.error.flatten().fieldErrors.baseUrl?.[0]);
      return;
    }
    setValidationError(undefined);
    try {
      redirectToAuthorizationUrl(await authorization.mutateAsync(result.data.baseUrl));
    } catch {
      /* Mutation state renders the error. */
    }
  }

  const apiError =
    authorization.error instanceof ApiError && authorization.error.status === 422
      ? 'This GitLab server could not start OAuth. Confirm that OAuth is configured on the server.'
      : authorization.error
        ? 'Unable to connect to this GitLab server. Please try again.'
        : null;

  return (
    <section className="mx-auto max-w-xl">
      <Link className="text-sm font-medium text-blue-700 hover:underline" to="/connections">
        ← Back to connections
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
        Connect self-hosted GitLab
      </h1>
      <p className="mt-2 text-slate-600">
        Enter the base URL for your organization’s GitLab server.
      </p>
      <form
        className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        noValidate
        onSubmit={(event) => void handleSubmit(event)}
      >
        {apiError ? (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            {apiError}
          </p>
        ) : null}
        <label className="block text-sm font-medium text-slate-700" htmlFor="gitlab-server-url">
          GitLab server URL
        </label>
        <input
          aria-describedby={validationError ? 'gitlab-server-error' : undefined}
          aria-invalid={Boolean(validationError)}
          className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          id="gitlab-server-url"
          onChange={(event) => setBaseUrl(event.target.value)}
          placeholder="https://git.company.example"
          type="url"
          value={baseUrl}
        />
        {validationError ? (
          <p className="mt-1 text-sm text-red-700" id="gitlab-server-error">
            {validationError}
          </p>
        ) : null}
        <Button className="mt-5" disabled={authorization.isPending} type="submit">
          {authorization.isPending ? 'Starting authorization...' : 'Continue'}
        </Button>
      </form>
    </section>
  );
}
