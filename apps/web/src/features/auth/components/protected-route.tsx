import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { ApiError } from '@/lib/api-client';

export function ProtectedRoute() {
  const location = useLocation();
  const currentUser = useCurrentUser();

  if (currentUser.isPending) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p role="status">Checking your session...</p>
      </main>
    );
  }

  if (currentUser.error instanceof ApiError && currentUser.error.status === 401) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate replace state={{ returnTo }} to="/login" />;
  }

  if (currentUser.isError) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <section className="text-center">
          <h1 className="text-xl font-semibold">Unable to verify your session</h1>
          <p className="mt-2 text-slate-600">Please try again.</p>
          <Button className="mt-4" onClick={() => void currentUser.refetch()}>
            Try again
          </Button>
        </section>
      </main>
    );
  }

  return <Outlet />;
}
