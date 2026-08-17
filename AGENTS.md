# AGENTS.md

## Frontend Scope

This file defines the rules for the frontend application of the developer activity reporting project.

The frontend is responsible for:

- user authentication screens
- Git provider connection screens
- repository selection
- manual report generation
- report viewing
- report history
- loading and error states
- responsive user experience

The frontend must remain readable, testable, accessible, and easy for another human developer to maintain.

---

# 1. Frontend Tech Stack

Use:

- React
- Vite
- TypeScript
- TanStack Query
- React Router
- Tailwind CSS
- shadcn/ui
- Zod where client-side schema validation is useful
- Vitest
- React Testing Library
- Playwright for important user flows
- ESLint
- Prettier

Do not introduce additional state-management libraries unless there is a real need.

Avoid Redux, Zustand, MobX, or similar libraries for the MVP unless explicitly requested.

---

# 2. Main Frontend Flow

The expected user flow is:

```text
Login / Register
      ↓
Dashboard
      ↓
Connect Git Provider
      ↓
Select Repositories
      ↓
Choose Report Date
      ↓
Generate Report
      ↓
View Generated Report
      ↓
Copy / Regenerate / View History
```

The report is generated manually.

Do not add automatic scheduling UI unless explicitly requested.

---

# 3. Frontend Architecture

Use a feature-based structure.

Recommended structure:

```text
apps/
└── web/
    └── src/
        ├── app/
        │   ├── App.tsx
        │   ├── router.tsx
        │   └── providers.tsx
        │
        ├── components/
        │   ├── ui/
        │   └── shared/
        │
        ├── features/
        │   ├── auth/
        │   │   ├── api/
        │   │   ├── components/
        │   │   ├── hooks/
        │   │   ├── pages/
        │   │   ├── schemas/
        │   │   └── tests/
        │   │
        │   ├── connections/
        │   │   ├── api/
        │   │   ├── components/
        │   │   ├── hooks/
        │   │   ├── pages/
        │   │   └── tests/
        │   │
        │   ├── repositories/
        │   │   ├── api/
        │   │   ├── components/
        │   │   ├── hooks/
        │   │   ├── pages/
        │   │   └── tests/
        │   │
        │   └── reports/
        │       ├── api/
        │       ├── components/
        │       ├── hooks/
        │       ├── pages/
        │       ├── schemas/
        │       └── tests/
        │
        ├── hooks/
        ├── lib/
        │   ├── api-client.ts
        │   ├── env.ts
        │   ├── query-client.ts
        │   └── utils.ts
        │
        ├── types/
        ├── styles/
        └── main.tsx
```

Do not create large flat folders containing unrelated files.

---

# 4. Human-Readable Code Rule

Code must be written for humans first.

Prioritize:

```text
Readability
    ↓
Correctness
    ↓
Maintainability
    ↓
Testability
    ↓
Reusability
    ↓
Performance optimization
```

Avoid code that is technically short but difficult to understand.

Bad:

```tsx
const x = d?.map((i) => i?.a?.filter((q) => q?.e)?.map((z) => z?.n)).flat();
```

Prefer:

```tsx
const enabledRepositoryNames = connections
  .flatMap((connection) => connection.repositories)
  .filter((repository) => repository.enabled)
  .map((repository) => repository.name);
```

Use descriptive names.

Avoid single-letter variables except for tiny callback contexts where meaning is obvious.

---

# 5. Component Rules

Each component should have one clear responsibility.

Prefer:

```text
ReportPage
├── ReportHeader
├── ReportDatePicker
├── ConnectionSelector
├── GenerateReportButton
├── ReportSummary
├── ReportRepositorySection
└── ReportActions
```

Avoid one component that handles:

- fetching
- form validation
- report transformation
- modal state
- routing
- rendering hundreds of lines of JSX

If a component becomes difficult to read, split it by responsibility.

Do not split components only to reduce line count.

---

# 6. Component Size

There is no strict maximum line count.

However, review a component when it becomes larger than roughly 200-250 lines.

Large components should be justified by strong cohesion.

Prefer extracting:

- reusable UI
- business-specific hooks
- data transformation helpers
- schemas
- API calls

Do not move logic into random helper files only to make a component visually shorter.

---

# 7. JSX Readability

Keep JSX shallow and readable.

Avoid deeply nested ternaries.

Bad:

```tsx
{loading ? <Spinner /> : error ? <Error /> : data?.length ? <List /> : <Empty />}
```

Prefer:

```tsx
if (isLoading) {
  return <ReportLoadingState />;
}

if (error) {
  return <ReportErrorState error={error} />;
}

if (!report) {
  return <EmptyReportState />;
}

return <ReportContent report={report} />;
```

Early returns are encouraged when they improve readability.

---

# 8. No Premature Abstraction

Do not create generic components such as:

```text
UniversalCard
UniversalList
DynamicRenderer
GenericFormBuilder
EverythingTable
```

unless multiple real features require the abstraction.

Prefer a clear domain-specific component over an overly configurable component.

Example:

```text
GitConnectionCard
```

is better than:

```text
GenericProviderEntityCard
```

for the MVP.

---

# 9. TypeScript Rules

TypeScript must run in strict mode.

Recommended:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

Avoid:

```ts
any
```

Avoid:

```ts
as any
```

Avoid unnecessary assertions such as:

```ts
value as SomeType
```

Prefer validated and inferred types.

Do not use `@ts-ignore` unless absolutely necessary and explained.

---

# 10. API Types

API types should represent the real backend contract.

Do not invent frontend-only shapes that slightly differ from the backend response unless a mapper is intentionally used.

Example backend response:

```ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
```

If OpenAPI-generated types are added later, prefer generating and reusing them rather than manually duplicating the same API types.

---

# 11. API Client Rule

All backend requests must go through a shared API client.

Do not scatter raw `fetch()` calls throughout components.

Recommended:

```text
src/lib/api-client.ts
```

The shared client should handle:

- base URL
- credentials
- JSON serialization
- JSON parsing
- standardized API errors
- abort signals
- request IDs when provided
- common headers

Feature-specific API functions belong inside the relevant feature.

Example:

```ts
export async function generateReport(
  input: GenerateReportInput,
): Promise<Report> {
  return apiClient.post('/api/v1/reports/generate', input);
}
```

---

# 12. TanStack Query

Use TanStack Query for server state.

Examples:

- current user
- Git connections
- repositories
- report history
- generated report

Do not duplicate server state inside global React state.

Do not use `useEffect` as a replacement for TanStack Query fetching.

Prefer:

```ts
useQuery(...)
useMutation(...)
```

for API operations.

---

# 13. Query Keys

Use centralized, descriptive query keys.

Example:

```ts
export const reportKeys = {
  all: ['reports'] as const,
  list: () => [...reportKeys.all, 'list'] as const,
  detail: (date: string) => [...reportKeys.all, 'detail', date] as const,
};
```

Do not create inconsistent ad-hoc query keys across the application.

---

# 14. Mutation Handling

Mutations must handle:

- loading state
- success state
- validation errors
- API errors
- rate-limit errors
- concurrent-generation errors

The Generate Report button must prevent accidental double-submission in the UI.

Frontend button disabling is only a UX feature.

The backend remains responsible for real concurrency protection.

---

# 15. Manual Report Generation UI

The report page should support:

```text
Report Date
[ 17 August 2026 ]

Connected Accounts
[x] GitHub - jake
[x] Company GitLab - jake
[ ] GitLab.com - jake-dev

[ Generate Report ]
```

The user must be able to clearly understand:

- which date is being generated
- which Git accounts are included
- which repositories are enabled
- whether generation is currently running

---

# 16. Generate Button Rules

During report generation:

- disable the Generate button
- show clear loading text
- prevent duplicate frontend submissions
- preserve the selected date and account state
- do not clear the page unnecessarily

Example:

```text
Generating report...
```

Do not use fake progress percentages unless the backend provides real progress data.

---

# 17. Loading States

Every async screen must have an intentional loading state.

Avoid a blank page while waiting for data.

Use appropriate states such as:

```text
Loading connections...
Loading repositories...
Generating report...
Loading report history...
```

Skeletons may be used when they improve the experience.

Do not overuse skeletons for tiny operations.

---

# 18. Error States

Every API-backed feature must handle errors.

Do not show raw server stack traces.

Provide useful user-facing messages.

Examples:

```text
Unable to load repositories.
Please try again.
```

```text
GitHub authorization expired.
Reconnect your GitHub account to continue.
```

```text
A report is already being generated.
```

```text
Git provider rate limit reached.
Try again later.
```

When the backend returns an error code, map it to an appropriate UI message.

---

# 19. Empty States

Empty states must explain what the user should do next.

No Git connection:

```text
No Git accounts connected yet.

Connect GitHub or GitLab to start generating reports.

[ Connect Git Account ]
```

No reports:

```text
No reports generated yet.

Choose a date and generate your first report.
```

Do not leave empty tables with no explanation.

---

# 20. Authentication UI

Authentication pages should include:

- register
- login
- logout

Do not store authentication tokens in `localStorage` when secure HTTP-only cookie sessions are used by the backend.

Frontend code must assume the backend owns authentication security.

Do not expose session secrets to browser JavaScript.

---

# 21. Protected Routes

Authenticated pages must be protected.

Examples:

```text
/dashboard
/connections
/repositories
/reports
/settings
```

Unauthenticated users should be redirected to login.

Do not duplicate authentication checks independently on every page.

Use one reusable route guard or application-level auth boundary.

---

# 22. OAuth Connection Flow

For GitHub:

```text
Connect GitHub
      ↓
Backend authorization route
      ↓
GitHub
      ↓
Backend callback
      ↓
Frontend connection result
```

For GitLab:

```text
Connect GitLab
      ↓
Backend authorization route
      ↓
GitLab
      ↓
Backend callback
      ↓
Frontend connection result
```

The frontend must never receive raw OAuth access tokens.

The frontend should receive only connection metadata.

---

# 23. Self-Hosted GitLab UI

Self-hosted GitLab connection should include:

```text
GitLab Server URL

https://git.company.example

[ Continue ]
```

Validate basic URL shape in the frontend for usability.

The backend remains responsible for final validation and security checks.

Do not assume every self-hosted GitLab supports OAuth without setup.

Display backend errors clearly.

---

# 24. Connection Cards

A connected account card should clearly show:

```text
GitHub
jake-dev
Connected
12 repositories

[ Manage Repositories ]
[ Disconnect ]
```

Avoid displaying:

- access tokens
- refresh tokens
- private credentials
- installation secrets

---

# 25. Repository Selection

Repository selection must support:

- loading state
- search
- enable/disable selection
- provider/account context
- empty state

If there are many repositories, use virtualization only if performance actually requires it.

Do not prematurely add a complex virtualized list for small datasets.

---

# 26. Report View

A generated report should make activity easy to scan.

Suggested structure:

```text
17 August 2026

Summary
────────────────────
Worked on 3 repositories...

Mieruka Dashboard
────────────────────
Daily Preventive Filtering
- Fixed line selection
- Corrected API filtering
3 commits

SAPP Backend
────────────────────
Andon API
- Fixed image proxy handling
2 commits

Statistics
────────────────────
9 commits
3 repositories
2 merge requests
```

Raw commit references may be collapsible.

---

# 27. Report Actions

Useful report actions:

```text
[ Copy Report ]
[ Regenerate ]
```

Optional later:

```text
[ Export ]
```

Do not add export formats until backend support or frontend requirements are defined.

---

# 28. Regenerate Behavior

When regenerating:

- keep the current report visible if possible
- show generation loading state
- replace the report only after successful response
- show an error without destroying the previous valid report

Do not blank the report immediately when regeneration starts.

---

# 29. Forms

Use controlled or form-library-based forms consistently.

If React Hook Form is introduced, use it consistently for non-trivial forms.

Do not mix several form patterns across the same feature.

Forms must:

- label inputs
- show validation errors
- disable submit while submitting
- prevent duplicate submissions
- preserve user-entered values on recoverable errors

---

# 30. Validation

Client-side validation improves usability.

Backend validation remains authoritative.

Use Zod for complex client schemas when appropriate.

Examples:

- self-hosted GitLab URL
- report date
- login form
- registration form

Do not duplicate large validation rule sets manually if they can be shared or generated from API contracts later.

---

# 31. Accessibility

Accessibility is mandatory.

Interactive elements must be keyboard accessible.

Use semantic HTML.

Prefer:

```html
<button>
<nav>
<main>
<section>
<label>
```

over clickable `<div>` elements.

Every input must have a label.

Every icon-only button must have an accessible name.

Dialogs must:

- trap focus
- restore focus when closed
- support Escape where appropriate

Prefer accessible shadcn/ui primitives rather than building dialogs/dropdowns from scratch.

---

# 32. Color Accessibility

Do not rely only on color to communicate status.

Bad:

```text
green = connected
red = disconnected
```

Better:

```text
✓ Connected
! Authorization expired
```

Color may support the status, but text/icon meaning must remain.

---

# 33. Responsive Design

All main screens must work on:

- desktop
- tablet
- mobile

Do not design only for a 1920px desktop.

Recommended layout behavior:

Desktop:

```text
Sidebar + Content
```

Mobile:

```text
Top bar
Drawer navigation
Single-column content
```

Tables should not silently overflow the viewport.

Use cards or horizontal scrolling where appropriate.

---

# 34. Styling Rules

Use Tailwind consistently.

Avoid large amounts of inline styles.

Avoid random hardcoded values unless necessary.

Prefer design tokens and existing utility scales.

Do not create a custom CSS class for every small style if Tailwind already expresses it clearly.

Do not create 20-class unreadable strings directly inside complex components when extraction improves readability.

Example:

```ts
const cardClassName = cn(
  'rounded-lg border bg-card p-4',
  isSelected && 'ring-2 ring-primary',
);
```

---

# 35. shadcn/ui Rules

Use shadcn/ui components as building blocks.

Examples:

- Button
- Card
- Dialog
- DropdownMenu
- Input
- Select
- Checkbox
- Alert
- Badge
- Skeleton

Do not heavily modify base UI primitives unless needed.

Keep domain logic outside `components/ui`.

---

# 36. Icons

Use one icon library consistently.

Prefer Lucide if already included through shadcn/ui.

Do not mix several icon libraries without a reason.

Icons must not be the only indicator for important actions.

---

# 37. Dates and Timezones

Display dates using the user's selected timezone.

Do not assume browser timezone always equals report timezone.

Store report date as a calendar date.

For display:

```text
17 August 2026
```

For API:

```text
2026-08-17
```

Date formatting logic should be centralized.

---

# 38. Environment Variables

Frontend configuration should come from Vite environment variables.

Example:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Validate required frontend environment variables at startup/build time where practical.

Do not put secrets in frontend environment variables.

Anything shipped to the browser is public.

Never place:

- GitHub client secret
- GitLab client secret
- database URL
- private keys
- session secret

inside frontend environment files.

---

# 39. ESLint

ESLint is mandatory.

Required command:

```bash
npm run lint
```

Lint rules should catch:

- unused variables
- unused imports
- unsafe TypeScript
- React Hooks misuse
- missing dependency issues where appropriate
- unreachable code
- suspicious promises
- accidental `any`

A frontend feature is not complete while linting fails.

Do not disable lint rules globally merely to make generated code pass.

If a local disable is necessary, explain why.

---

# 40. Prettier

Prettier is mandatory.

Required commands:

```bash
npm run format
npm run format:check
```

Do not manually align code with spaces.

Let Prettier handle formatting.

---

# 41. Typecheck

TypeScript typecheck is mandatory.

Required command:

```bash
npm run typecheck
```

The application must not be considered complete when type errors remain.

Do not silence errors using `any` or broad assertions.

---

# 42. Unit Tests

Unit and component tests are mandatory for important frontend behavior.

Use:

```text
Vitest
React Testing Library
```

Tests should verify user-observable behavior.

Do not test implementation details unnecessarily.

Prefer:

```ts
expect(
  screen.getByRole('button', { name: /generate report/i }),
).toBeDisabled();
```

instead of checking internal component state.

---

# 43. Component Test Examples

Test scenarios should include:

```text
Generate Report Button
- enabled when required fields are selected
- disabled while generation is running
- shows loading state
- shows backend error
```

```text
Git Connection Card
- renders provider
- renders username
- shows connected state
- disconnect action is available
```

```text
Repository Selector
- loads repositories
- toggles repository
- handles empty state
- handles API error
```

---

# 44. API Hook Tests

Hooks that contain significant behavior should be tested.

Examples:

- query invalidation after connection
- query invalidation after repository update
- report mutation success
- report mutation error
- concurrent generation error mapping

Do not test TanStack Query itself.

Test your application's behavior around it.

---

# 45. End-to-End Tests

Use Playwright for critical flows.

At minimum, cover:

```text
Login
    ↓
Dashboard
    ↓
Connected account visible
    ↓
Select report date
    ↓
Generate report
    ↓
Report appears
```

OAuth provider flows should usually be mocked or tested through controlled test environments.

Do not make CI depend on real GitHub/GitLab OAuth accounts.

---

# 46. Test Naming

Use descriptive names.

Prefer:

```ts
it('shows an error when report generation is already in progress')
```

instead of:

```ts
it('works')
```

---

# 47. Test Coverage

Suggested initial coverage targets:

```text
Statements: 80%
Branches:   75%
Functions:  80%
Lines:      80%
```

Coverage numbers are secondary to meaningful tests.

Critical UI and authentication logic should have strong branch coverage.

Do not create meaningless tests just to increase percentages.

---

# 48. Mocking Rules

Mock:

- backend API responses
- current user
- Git connections
- repository data
- report data

Do not mock internal helper functions unless necessary.

Prefer mocking at the network/API boundary.

MSW may be introduced if useful for realistic API mocking.

---

# 49. No Direct Production API in Tests

Unit and component tests must not call the real backend.

End-to-end tests should use:

- local test backend
- test fixture server
- controlled environment

Do not depend on production services.

---

# 50. Error Boundary

Use a React error boundary for unexpected rendering errors.

It should show a safe fallback UI.

Do not expose raw stack traces to users.

Application logging may capture details in development.

---

# 51. Logging

Do not leave production `console.log` statements.

Allowed temporarily during development, but remove before completion.

Never log:

- tokens
- cookies
- secrets
- sensitive OAuth callback data

---

# 52. Performance Rules

Do not optimize prematurely.

Avoid unnecessary:

- `useMemo`
- `useCallback`
- memoization
- virtualization

Use them when there is an actual performance reason.

Readable code is preferred over speculative optimization.

---

# 53. useEffect Rules

Use `useEffect` only for real side effects.

Do not use it for derived state.

Bad:

```tsx
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Prefer:

```tsx
const fullName = `${firstName} ${lastName}`;
```

Do not fetch server data manually in `useEffect` when TanStack Query should be used.

---

# 54. State Rules

Use local state for local UI concerns:

- modal open
- current tab
- search input
- temporary selection

Use TanStack Query for server state.

Use URL state where sharing/bookmarking is valuable:

- selected report date
- filters
- pagination

Do not introduce global state for everything.

---

# 55. URL State

Important view state may be represented in the URL.

Example:

```text
/reports?date=2026-08-17
```

This allows refresh and bookmarking.

Do not store secrets or tokens in query parameters.

---

# 56. Routing

Recommended routes:

```text
/login
/register

/dashboard

/connections
/connections/gitlab/self-hosted

/repositories

/reports
/reports/:date

/settings
```

Avoid excessive deeply nested routes for the MVP.

---

# 57. Navigation

Desktop:

```text
Dashboard
Reports
Connections
Repositories
Settings
```

Mobile navigation should remain accessible without permanently occupying screen width.

Use a drawer or sheet pattern.

---

# 58. Page Titles

Set meaningful page titles.

Examples:

```text
Dashboard | DevLog
Reports | DevLog
Connections | DevLog
```

This improves usability and accessibility.

---

# 59. Toasts

Use toasts for short-lived success messages.

Examples:

```text
Repository settings saved.
GitHub disconnected.
Report copied.
```

Do not use toasts for errors that require user action if inline messaging is more appropriate.

---

# 60. Confirmation Dialogs

Use confirmation dialogs for destructive actions.

Example:

```text
Disconnect GitHub?

This will remove the account connection from DevLog.
Generated reports will remain available.

[ Cancel ] [ Disconnect ]
```

Do not require confirmation for harmless actions.

---

# 61. Copy Report

Copy should use the Clipboard API.

Provide feedback:

```text
Copied
```

If copying fails, show a useful error.

Do not silently fail.

---

# 62. Data Mapping

Keep API mapping separate from rendering when transformation is non-trivial.

Example:

```text
API Report
    ↓
mapReportResponse()
    ↓
Report View Model
    ↓
UI
```

Do not perform large data transformations inline inside JSX.

---

# 63. Display Logic

Display helpers should be pure where possible.

Examples:

```ts
formatReportDate()
formatCommitCount()
formatProviderName()
```

Keep them in appropriate feature or shared utility modules.

---

# 64. Provider Branding

Provider identity may use:

```text
GitHub
GitLab
Self-hosted GitLab
```

Do not make core functionality depend on provider logos.

Text labels must remain clear without icons.

---

# 65. API Rate Limit UI

When backend returns `429 Too Many Requests`:

- show a clear message
- honor `Retry-After` if exposed
- do not immediately auto-retry in a tight loop

Example:

```text
Too many requests.
Please wait a moment before trying again.
```

---

# 66. Concurrent Report Generation UI

When backend returns:

```text
409 REPORT_GENERATION_IN_PROGRESS
```

display:

```text
A report is already being generated.
Please wait for the current request to finish.
```

Do not automatically send another request.

---

# 67. Authentication Expiry

When the backend returns an authentication/session expiry response:

- clear stale user state
- redirect to login
- preserve safe return URL where appropriate

Do not create redirect loops.

---

# 68. Provider Authorization Expiry

If GitHub/GitLab authorization expires:

show:

```text
GitHub connection expired.

Reconnect your account to continue.

[ Reconnect GitHub ]
```

Do not treat this as a generic unknown error.

---

# 69. Security Rules

Frontend must never:

- expose backend secrets
- store provider access tokens
- trust URL input as safe HTML
- use `dangerouslySetInnerHTML` without a documented sanitized reason
- render unsanitized external content as HTML
- construct arbitrary OAuth URLs from untrusted values without backend validation

Treat provider text content as plain text by default.

---

# 70. XSS Protection

Commit messages and repository names come from external systems.

Render them as normal React text.

Do not inject them into raw HTML.

Avoid:

```tsx
dangerouslySetInnerHTML
```

for commit messages, report titles, descriptions, repository names, and user-generated values.

---

# 71. Link Safety

External links should be handled carefully.

If opening in a new tab:

```tsx
target="_blank"
rel="noopener noreferrer"
```

Validate or constrain provider URLs before rendering when appropriate.

---

# 72. Feature Flags

Do not add a feature-flag framework for the MVP.

Simple local flags may be used if a feature is actively being developed.

Remove temporary flags when no longer needed.

---

# 73. Code Comments

Comments should explain intent or unusual behavior.

Bad:

```ts
// Set loading to true
setLoading(true);
```

Good:

```ts
// Keep the previous report visible during regeneration so a failed
// request does not leave the user with an empty report screen.
```

Avoid excessive comments that merely repeat the code.

---

# 74. Naming Rules

Use clear naming.

Prefer:

```text
GenerateReportButton
GitConnectionCard
RepositorySelector
ReportSummary
ReportHistoryPage
```

Avoid:

```text
Comp1
Box2
DataThing
HandleStuff
MainCard
```

Hooks must start with:

```text
use
```

Examples:

```text
useCurrentUser
useGitConnections
useGenerateReport
```

---

# 75. File Naming

Use consistent file naming.

Recommended:

```text
git-connection-card.tsx
report-summary.tsx
use-git-connections.ts
report.api.ts
report.types.ts
```

Do not mix many naming styles across the same project.

---

# 76. Imports

Prefer configured aliases.

Example:

```ts
import { Button } from '@/components/ui/button';
import { useGenerateReport } from '@/features/reports/hooks/use-generate-report';
```

Avoid very deep relative imports:

```ts
../../../../../components/ui/button
```

Group imports consistently.

---

# 77. Dead Code

Remove:

- unused components
- unused imports
- old commented implementation
- abandoned feature flags
- stale debug logs

Do not leave multiple unused versions of the same component.

Git history already preserves old code.

---

# 78. Dependency Rule

Before adding a dependency, ask:

```text
Can this be implemented clearly with what already exists?
```

Do not add a package for trivial functionality.

Every dependency increases maintenance and security surface.

---

# 79. Package Version Rule

Use maintained versions compatible with the project.

Do not blindly upgrade dependencies during unrelated feature work.

Dependency updates should be focused and reviewed.

---

# 80. Build

The frontend must build successfully.

Required:

```bash
npm run build
```

A feature is not complete if Vite build fails.

---

# 81. Suggested NPM Scripts

Recommended:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

Exact scripts may change depending on monorepo structure.

---

# 82. Required Quality Gate

Before a frontend feature is considered complete:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build
```

For changes affecting critical user flows:

```bash
npm run test:e2e
```

must also pass where the E2E environment is available.

---

# 83. Definition of Done

A frontend feature is complete only when:

- UI is implemented
- loading state exists
- error state exists
- empty state exists where applicable
- responsive behavior is checked
- keyboard accessibility is considered
- API errors are handled
- TypeScript passes
- ESLint passes
- Prettier check passes
- unit/component tests pass
- build passes
- E2E tests are updated for critical flows
- no secrets are exposed
- no debug logs remain
- no unrelated code was rewritten

---

# 84. CI Quality Gate

Frontend CI should run:

```text
Install dependencies
      ↓
Lint
      ↓
Format check
      ↓
Typecheck
      ↓
Unit/component tests
      ↓
Build
      ↓
E2E tests
```

E2E may be a separate job if it requires a running backend.

A pull request should not be considered mergeable when required frontend checks fail.

---

# 85. Recommended Frontend Implementation Order

## Phase 1 — Foundation

1. Initialize React + Vite + TypeScript.
2. Configure path aliases.
3. Configure Tailwind CSS.
4. Configure shadcn/ui.
5. Configure React Router.
6. Configure TanStack Query.
7. Configure API client.
8. Configure ESLint.
9. Configure Prettier.
10. Configure Vitest.
11. Configure React Testing Library.
12. Configure Playwright.
13. Configure environment validation.
14. Create base application layout.

## Phase 2 — Authentication

1. Login page.
2. Register page.
3. Current user query.
4. Protected routes.
5. Logout.
6. Loading state.
7. Authentication error state.
8. Tests.

## Phase 3 — Git Connections

1. Connection list page.
2. GitHub connection card.
3. GitLab connection card.
4. Self-hosted GitLab form.
5. OAuth redirect handling.
6. Disconnect confirmation.
7. Connection error handling.
8. Tests.

## Phase 4 — Repository Selection

1. Repository list.
2. Provider/account grouping.
3. Search.
4. Enable/disable control.
5. Save behavior.
6. Loading state.
7. Empty state.
8. Error state.
9. Tests.

## Phase 5 — Report Generation

1. Report date selector.
2. Connection selector.
3. Generate button.
4. Generation mutation.
5. Loading state.
6. Concurrent-generation handling.
7. Rate-limit handling.
8. Report rendering.
9. Copy action.
10. Regenerate action.
11. Tests.
12. Critical E2E flow.

## Phase 6 — Report History

1. Report history list.
2. Pagination if required.
3. Report detail route.
4. Empty state.
5. Loading/error states.
6. Tests.

---

# 86. Out of Scope for Frontend MVP

Do not implement unless explicitly requested:

- scheduled report UI
- cron settings
- Redis monitoring UI
- worker status page
- AI prompt configuration
- Slack integration
- Teams integration
- email delivery settings
- mobile application
- native desktop application
- drag-and-drop dashboard builder
- advanced analytics charts
- admin dashboard
- organization/team management
- billing
- subscription plans
- dark mode unless requested
- localization unless requested

Keep the frontend focused.

---

# 87. Agent Working Rules

When an AI coding agent works on the frontend:

1. Read this file before modifying code.
2. Inspect existing patterns before introducing new ones.
3. Do not rewrite unrelated working code.
4. Prefer small focused changes.
5. Keep components readable.
6. Avoid clever compressed logic.
7. Reuse shared components when appropriate.
8. Do not over-generalize components.
9. Keep API calls out of presentation components.
10. Keep server state in TanStack Query.
11. Keep local UI state local.
12. Add tests for every meaningful behavior change.
13. Update E2E tests when critical flows change.
14. Run lint after changes.
15. Run format check after changes.
16. Run typecheck after changes.
17. Run relevant tests after changes.
18. Run full tests before completing a major feature.
19. Run build before declaring completion.
20. Never claim checks passed without actually running them.
21. Never disable tests or lint rules merely to make code pass.
22. Never expose secrets to browser code.
23. Never store OAuth provider tokens in frontend storage.
24. Keep accessibility in mind when creating interactive UI.
25. Keep mobile layout usable.
26. Preserve existing valid report content during regeneration failures.
27. Handle backend error codes intentionally.
28. Do not add infrastructure-related UI that is outside MVP scope.
29. Do not use `dangerouslySetInnerHTML` for provider content.
30. Keep generated code understandable to a human developer.

---

# 88. Required Verification Before Completing Work

Before reporting that frontend work is complete, execute:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build
```

For critical user flows:

```bash
npm run test:e2e
```

If any required command fails:

- fix it, or
- clearly explain the failure

Do not describe the work as complete while mandatory verification is failing.

---

# 89. Final Principle

The frontend should feel simple even when the backend work is complex.

A user should be able to understand the primary flow without technical Git knowledge:

```text
Connect Account
      ↓
Choose Repositories
      ↓
Choose Date
      ↓
Generate Report
      ↓
Read / Copy Report
```

The implementation should be equally understandable to another developer.

Readable code is a project requirement, not an optional style preference.
