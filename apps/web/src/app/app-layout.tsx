import { BookOpenText, GitBranch, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useLogout } from '@/features/auth/hooks/use-auth-mutations';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { cn } from '@/lib/utils';

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Reports', path: '/reports', icon: BookOpenText },
  { label: 'Connections', path: '/connections', icon: GitBranch },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function AppLayout() {
  const currentUser = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = navigation.find((item) => item.path === location.pathname)?.label ?? 'DevLog';

  useEffect(() => {
    document.title = `${pageName} | DevLog`;
  }, [pageName]);

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      await navigate('/login', { replace: true });
    } catch {
      // Keep the session visible so the user can retry a failed logout.
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[16rem_1fr]">
      <aside className="border-b border-slate-200 bg-white md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex h-16 items-center px-5 text-lg font-bold text-blue-800">DevLog</div>
        <nav
          aria-label="Main navigation"
          className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1"
        >
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  isActive && 'bg-blue-50 text-blue-800',
                )
              }
              end={path === '/'}
              key={path}
              to={path}
            >
              <Icon aria-hidden="true" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3 md:absolute md:bottom-0 md:w-64">
          <p className="truncate px-3 text-sm font-medium text-slate-700">
            {currentUser.data?.name ?? currentUser.data?.email}
          </p>
          {logout.isError ? (
            <p className="mt-2 px-3 text-sm text-red-700" role="alert">
              Unable to sign out. Please try again.
            </p>
          ) : null}
          <Button
            className="mt-2 w-full justify-start bg-transparent text-slate-700 hover:bg-slate-100"
            disabled={logout.isPending}
            onClick={() => void handleLogout()}
          >
            <LogOut aria-hidden="true" size={18} />
            {logout.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </aside>
      <main className="p-5 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
