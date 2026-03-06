# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo orchestrator containing Git submodules:

- **backend/** — NestJS REST+GraphQL API (TypeScript)
- **frontend/** — Expo React Native app targeting iOS, Android, and Web (TypeScript)
- **docs/** — Docusaurus documentation site
- **org/** — GitHub org meta (.github)

The root repo holds Docker/CI configuration, version management (`docker-full.js`, `version` file), and submodule references.

## Development Commands

### Backend (run from `backend/`)
```bash
npm run start:dev       # Start dev server (watches, kills port 3000 first)
npm run build           # Production build
npm run test            # Jest unit tests
npm run test:e2e        # E2E tests
npm run lint            # ESLint with fix
npm run typecheck       # TypeScript type checking
```

### Frontend (run from `frontend/`)
```bash
npm run start:ios:dev   # Start Expo dev client for iOS (recommended)
npm run start:dev       # Start Expo dev client
npm run start:web       # Start web dev server
npm run codegen         # Generate GraphQL types (requires backend running)
npm run ts-check        # TypeScript type checking
npm run lint            # ESLint
npm run generate:i18n-types  # Regenerate i18n type definitions
npm run sync-ios-extensions  # Sync after modifying Swift in plugins/
```

### Docker (from root)
```bash
docker compose up       # Local stack: PostgreSQL + backend on port 3000
```

## Architecture

### Data Flow
```
External systems (Ntfy/Gotify) → SSE → Backend ExternalNotifySystem
                                              ↓
REST POST /api/v1/messages  →  MessagesModule  →  Creates Message + Notification in PostgreSQL
GraphQL mutations          →                    →  Emits GraphQL subscription events
                                              ↓
                              PushOrchestratorService
                              ├── APNs direct (node-apn)     → iOS
                              ├── Firebase FCM               → Android/iOS
                              ├── Web Push (VAPID)           → Web PWA
                              └── Passthrough (Zentik Cloud) → APNs via cloud
```

### Backend API
- **REST**: All routes under `/api/v1/`, Swagger UI at `/api/docs`
- **GraphQL**: Query/mutation/subscription at `/api/v1/graphql` (code-first, WebSocket subscriptions via graphql-ws)
- **Auth**: JWT (Passport.js) with access + refresh tokens; OAuth2 providers (Google, GitHub, Discord, Apple, Facebook, Microsoft)

### Frontend Architecture
- **Routing**: Expo Router v6 (file-based), separate layout groups for `(phone)` and `(desktop)`
- **Data**: Apollo Client (HTTP for queries/mutations, WS for subscriptions) + generated REST client from OpenAPI spec
- **State**: Apollo InMemoryCache + RxJS BehaviorSubjects in `services/settings-service.ts`
- **Auth**: JWT stored via react-native-keychain, proactive refresh in `services/auth-service.ts`
- **i18n**: English (`locales/en-EN.json`) and Italian (`locales/it-IT.json`), accessed via `useI18n` hook

### Key Concepts
- **Buckets**: Named notification channels. Messages are sent to a bucket; notifications are created per subscribed user/device
- **Entity Permissions**: Bucket sharing via access control or invite codes
- **System Access Tokens**: Programmatic API access scoped to specific buckets/operations
- **User Roles**: USER, MODERATOR, ADMIN
- **Server Settings**: Runtime configuration stored in `server_settings` table (`ServerSettingType` enum), initialized from env vars at bootstrap

## Coding Rules

- All code, comments, and logs must be in **English**
- No unnecessary comments; never add comments just to describe a change request
- Logs only at strategic start/end-of-flow points; debug logs for complex flows only
- DB schema changes require **TypeORM migrations** (`backend/database/migrations/`) — never use `synchronize` in production
- Use TypeScript enums and register them in GraphQL via `registerEnumType`
- New frontend components must use the `useI18n` translation hook and update both locale files + i18n type file
- Prefer extracting common components (`components/ui/`) over duplicating logic
- Never edit `ios/` or `android/` directly — use Expo prebuild and config plugins
- After modifying Swift files in `plugins/`, run `npm run sync-ios-extensions` from `frontend/`
- Never create README files or example/testing components unless explicitly requested

## Node Requirements

- Node >= 22 (see `.nvmrc`)
- npm >= 10

## GraphQL Codegen Pipeline

1. Backend defines schema code-first (NestJS decorators) → auto-generates `backend/src/schema.gql`
2. Backend exports OpenAPI spec to `backend/openapi.json`
3. Frontend codegen fetches schema from running backend at `http://localhost:3000/api/v1/graphql`
4. Operations defined in `frontend/config/operations.graphql`
5. Output: `frontend/generated/gql-operations-generated.ts` (typed Apollo hooks)
6. REST client generated via swagger-typescript-api from OpenAPI spec

## Docker Build

Multi-stage Dockerfile: installs backend deps → builds backend + copies frontend web build into `public/` → Alpine runtime with postgresql-client. Image published to `ghcr.io/zentik-notifier/zentik-notifier`. Version tracked in root `version` file.
