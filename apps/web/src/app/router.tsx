import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/app/app-layout';
import { PlaceholderPage } from '@/app/placeholder-page';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { PublicOnlyRoute } from '@/features/auth/components/public-only-route';
import { LoginPage } from '@/features/auth/pages/login-page';
import { RegisterPage } from '@/features/auth/pages/register-page';
import { ConnectionsPage } from '@/features/connections/pages/connections-page';
import { SelfHostedGitLabPage } from '@/features/connections/pages/self-hosted-gitlab-page';
import { RepositoriesPage } from '@/features/repositories/pages/repositories-page';
import { ReportsPage } from '@/features/reports/pages/reports-page';
import { ReportHistoryPage } from '@/features/reports/pages/report-history-page';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: (
              <PlaceholderPage
                title="Dashboard"
                description="See your connected accounts and recent report activity."
              />
            ),
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          { path: 'reports/history', element: <ReportHistoryPage /> },
          { path: 'reports/:date', element: <ReportsPage /> },
          {
            path: 'connections',
            element: <ConnectionsPage />,
          },
          { path: 'connections/gitlab/self-hosted', element: <SelfHostedGitLabPage /> },
          { path: 'repositories', element: <RepositoriesPage /> },
          {
            path: 'settings',
            element: (
              <PlaceholderPage
                title="Settings"
                description="Manage your profile and report preferences."
              />
            ),
          },
        ],
      },
    ],
  },
]);
