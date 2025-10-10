# Zentik Notifier

A comprehensive notification management system with push notifications, webhooks, and real-time updates.

## Repository Structure

This is a monorepo containing multiple components:

```
zentik-notifier/
├── backend/          # NestJS backend API
├── frontend/         # React Native (Expo) frontend
├── docs/            # Documentation website (Docusaurus)
└── org/             # Organization files
```

## Quick Start

### Clone the Repository

To pull all repositories:
```bash
git clone --recurse-submodules https://github.com/Zentik-notifier/zentik-notifier.git
cd zentik-notifier
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run migration:run
npm run start:dev
```

Backend will be available at `http://localhost:3000`
- GraphQL Playground: `http://localhost:3000/graphql`
- REST API: `http://localhost:3000/api`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env  # Configure API URL
npm run start
```

Choose your platform:
- Web: Press `w`
- iOS: Press `i` (requires macOS)
- Android: Press `a` (requires Android Studio)

### Documentation

```bash
cd docs
npm install
npm run start
```

Documentation will be available at `http://localhost:3000`

## Project Components

### Backend (`backend/`)

**Tech Stack:**
- NestJS framework
- TypeORM + PostgreSQL
- GraphQL (Code First)
- JWT Authentication
- WebSockets for real-time updates

**Key Features:**
- User authentication and authorization
- Bucket-based notification organization
- Push notifications (APN, Firebase, Web Push)
- Webhook integrations
- Payload mapping and transformations
- Database backups and server settings
- Audit logging and events review

**Developer Guide:** See [backend/.github/copilot-instructions.md](backend/.github/copilot-instructions.md)

### Frontend (`frontend/`)

**Tech Stack:**
- React Native with Expo
- TypeScript
- React Native Paper (Material Design 3)
- Apollo Client + TanStack Query
- Internationalization (en-EN, it-IT)

**Key Features:**
- Cross-platform (iOS, Android, Web)
- Real-time notification updates
- Bucket management and sharing
- Media gallery with caching
- Admin panel for system management
- Offline support with local database
- Customizable themes and layouts

**Developer Guide:** See [frontend/.github/copilot-instructions.md](frontend/.github/copilot-instructions.md)

### Documentation (`docs/`)

**Tech Stack:**
- Docusaurus
- Markdown
- React components

**Contents:**
- Getting started guides
- API documentation
- Architecture diagrams
- Deployment guides
- Best practices

## Development Workflow

### GitHub Copilot Instructions

This project includes custom GitHub Copilot instructions to help with development:

- **Frontend**: `frontend/.github/copilot-instructions.md`
  - i18n type generation workflow
  - GraphQL codegen process
  - Component patterns
  - Navigation structure

- **Backend**: `backend/.github/copilot-instructions.md`
  - Module architecture
  - GraphQL Code First patterns
  - Database migrations
  - Authentication and authorization

### Important: i18n Type Generation

**When adding translations to the frontend**, you must update TypeScript types:

1. Add translations to `frontend/locales/en-EN.json` and `it-IT.json`
2. Update `frontend/types/i18n.ts` with corresponding TypeScript interfaces
3. This ensures type safety for translation keys

Example:
```typescript
// types/i18n.ts
export interface TranslationKey {
  newSection: {
    title: string;
    description: string;
  };
}
```

### GraphQL Code Generation

After modifying GraphQL operations:

**Backend:**
```bash
cd backend
npm run build  # Generates schema
```

**Frontend:**
```bash
cd frontend
npm run codegen  # Generates TypeScript types
```

## Docker Deployment

Build and run with Docker Compose:

```bash
docker-compose up -d
```

Services:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:8081`
- PostgreSQL: `localhost:5432`
- Documentation: `http://localhost:3001`

## Environment Configuration

### Backend (.env)

Required variables:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=zentik_notifier

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Optional: Push notifications
APN_KEY_ID=your_apn_key_id
FIREBASE_PROJECT_ID=your_firebase_project

# Optional: Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

### Frontend (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000
```

## Testing

### Backend Tests

```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm run test
npm run typecheck     # TypeScript validation
```

## Key Features

### Notification Management
- Create, read, update, delete notifications
- Organize in buckets with custom icons and colors
- Share buckets with other users
- Filter by date, priority, read status
- Search across all notifications

### Push Notifications
- iOS (Apple Push Notification service)
- Android (Firebase Cloud Messaging)
- Web (Web Push API)
- Passthrough mode for external servers

### Admin Panel
- User management with roles
- OAuth provider configuration
- System access tokens
- Server settings management
- Database backup management
- Events review and audit logs

### Webhooks
- Custom webhook configurations
- Multiple HTTP methods support
- Payload mapping and transformations
- Execution history and debugging

### Media Management
- Image, video, audio, GIF support
- Automatic caching and optimization
- Gallery with filtering by type
- Retention policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Follow coding standards (see Copilot instructions)
5. Write tests
6. Submit a pull request

## License

See LICENSE file in each component directory.

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/Zentik-notifier/zentik-notifier/issues)
- Discussions: [GitHub Discussions](https://github.com/Zentik-notifier/zentik-notifier/discussions)