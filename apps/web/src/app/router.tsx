import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/app/app-layout';
import { PlaceholderPage } from '@/app/placeholder-page';

export const router = createBrowserRouter([
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
]);
