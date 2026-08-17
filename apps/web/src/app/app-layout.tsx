import { BookOpenText, GitBranch, LayoutDashboard, Settings } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { cn } from '@/lib/utils';

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Reports', path: '/reports', icon: BookOpenText },
  { label: 'Connections', path: '/connections', icon: GitBranch },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function AppLayout() {
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
      </aside>
      <main className="p-5 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
