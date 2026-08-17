import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';

export function PublicOnlyRoute() {
  const currentUser = useCurrentUser();
  if (currentUser.isSuccess) return <Navigate replace to="/" />;
  return <Outlet />;
}
