import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/app/app-layout';
import { PlaceholderPage } from '@/app/placeholder-page';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { PublicOnlyRoute } from '@/features/auth/components/public-only-route';
import { LoginPage } from '@/features/auth/pages/login-page';
import { RegisterPage } from '@/features/auth/pages/register-page';

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
            element: (
              <PlaceholderPage
                title="Reports"
                description="Generate and review daily developer activity reports."
              />
            ),
          },
          {
            path: 'connections',
            element: (
              <PlaceholderPage
                title="Connections"
                description="Connect GitHub, GitLab, or a self-hosted GitLab account."
              />
            ),
          },
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
