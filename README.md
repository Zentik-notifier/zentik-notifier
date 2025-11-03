# Zentik Notifier

A comprehensive notification management system with push notifications, webhooks, and real-time updates.

## Docker Setup
The docker image contains an all-in-one solution for both backend and UI

### Environment Variables for Docker

Create a `.env` file in the repository root:

```env
# Database Configuration
DB_NAME=zentik
DB_USERNAME=zentik_user
DB_PASSWORD=zentik_password
DB_SSL=false
DB_SYNCHRONIZE=false
DB_DROP_SCHEMA=false

# Admin Configuration
ADMIN_USERS=admin
ADMIN_DEFAULT_PASSWORD=admin

PUBLIC_BACKEND_URL=https://your-public-domain.com
```

```bash
# From the repository root
docker-compose up -d
```

This will start:
- **PostgreSQL** database on port `5432`
- **Backend API** on port `3000`

### Docker Compose Services

The `docker-compose.yml` file includes:

- **db**: PostgreSQL 16 Alpine
- **backend**: Zentik Backend API (from `ghcr.io/zentik-notifier/zentik-notifier:latest`)

### Volumes

- `db_data`: PostgreSQL data persistence
- `./attachments`: 
- `./backups`: 
- `./app`: 

### Verify Installation

Check if the backend is running:

```bash
curl http://localhost:3000/api/health
```

Or check the logs:

```bash
docker-compose logs backend
```

## Additional Resources

- Full documentation: [docs.zentik.app](https://notifier-docs.zentik.app/)
- Self-hosted installation guide: [docs/self-hosted/installation.md](https://notifier-docs.zentik.app/docs/intro)
- Backend API documentation: Available at `https://notifier-docs.zentik.app/scalar`