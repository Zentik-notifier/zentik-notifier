# Zentik Notifier

A comprehensive notification management system with push notifications, webhooks, and real-time updates.

## Docker Setup
The docker-compose.yml contains already everything is needed to run the backend and the frontend (will be served by the backend as static content).

Adjust the env variables and the volumes according to your needs

```bash
# From the repository root
docker-compose up -d
```

This will start:
- **PostgreSQL** database on port `5432`
- **Backend API** on port `3000`

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

## Additional Resources

- Full documentation: [docs.zentik.app](https://notifier-docs.zentik.app/)
- Self-hosted installation guide: [docs/self-hosted/installation.md](https://notifier-docs.zentik.app/docs/intro)
- Backend API documentation: Available at `https://notifier-docs.zentik.app/scalar`