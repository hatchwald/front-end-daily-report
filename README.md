# DevLog frontend

The frontend lives in `apps/web` and uses React, Vite, TypeScript, TanStack Query, React Router, Tailwind CSS, Vitest, and Playwright.

## Development

Use Node.js from `C:\laragon\bin\nodejs\node-v24.19.0-win-x64`, then run:

```powershell
cd apps/web
npm install
npm run dev
```

The API defaults to `http://localhost:3000`. Copy `.env.example` to `.env` to override it.

See `PHASES.md` for the incremental delivery plan.
