# FarmE

FarmE is an SIH farm-to-market coordination prototype. The existing React frontend remains the primary demo experience and now has an additive backend/API and AI-assistance layer.

## Architecture

- `src/`: React + TypeScript + Vite frontend, hash routing, deterministic engines, and localStorage persistence.
- `backend/src/app.ts`: Express REST API, request validation, CORS, and centralized error handling.
- `backend/src/db/repository.ts`: PostgreSQL repository with a memory-demo repository when `DATABASE_URL` is empty.
- `backend/src/db/schema.sql`: PostgreSQL schema for users, farmers, buyers, listings, demands, orders, logistics, emergency cases, and recommendations.
- `backend/src/ai/aiService.ts`: centralized AI provider adapter, structured output validation, timeout handling, and deterministic fallback.
- `src/services/apiClient.ts`: frontend API client with request timeout and null-on-failure behavior.

## Environment

Copy `.env.example` to `.env` when running the backend:

```text
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=
AI_PROVIDER=
AI_API_URL=
AI_API_KEY=
AI_MODEL=
```

`.env` is ignored by Git. Never expose `AI_API_KEY` in frontend environment variables.

## Run Locally

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```
```

The API listens on `http://localhost:4000`. The frontend continues working if the backend is unavailable and uses the existing deterministic engines/localStorage.

## PostgreSQL

## API

The backend exposes `POST /api/ai/farmer-copilot` and `POST /api/ai/demand-forecast`. Configure `AI_PROVIDER=text-json` or `AI_PROVIDER=openai-compatible` with backend-only `AI_API_URL`, `AI_API_KEY`, and optional `AI_MODEL` to enable a compatible structured provider. Invalid or unavailable provider responses use the existing deterministic engines.

```bash
npm run backend:check
npm run backend:test
npm run build
npm run lint
```

AI functionality is dependent on configured AI services and available application data. Prototype fallback intelligence is deterministic and does not represent live market prediction.

## Limitations

- Frontend authentication remains the existing demo OTP/localStorage flow.
- The backend has no production authentication middleware yet.
- PostgreSQL is optional for local demo use; memory mode is not durable across restarts.
- AI language output is structured in English; the existing frontend i18n system remains responsible for UI labels.
- Browser-native voice support remains outside the backend scope.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
