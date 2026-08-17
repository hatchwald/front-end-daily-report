# Frontend delivery phases

1. Foundation: Vite, React, strict TypeScript, Tailwind, routing, TanStack Query, API client, linting, formatting, test runners, and responsive application shell.
2. Authentication: register, login, logout, current-user query, protected routes, session-expiry handling, and tests.
3. Git connections: connection list, GitHub/GitLab OAuth entry points, self-hosted GitLab form, disconnect flow, and tests.
4. Repositories: provider grouping, search, selection persistence, sync, loading/error/empty states, and tests.
5. Report generation: date/account selection, mutation states, rate-limit and concurrency errors, report view, copy/regenerate, and critical E2E flow.
6. Report history: report list, date detail route, pagination when required, states, and tests.

Each phase ends with lint, format check, typecheck, unit tests, and build. Critical flows also run Playwright when its browser is installed.
