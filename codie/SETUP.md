# Codie Setup Guide

## Environment Configuration

Before running Codie, you need to set up the environment variables. Copy the example file and configure it:

```bash
cp env.example .env
```

### Required Environment Variables

1. **Database Configuration**
   - `DATABASE_URL`: PostgreSQL connection string (defaults to SQLite if not set)
   - Example: `postgresql://codie:codie@db:5432/codie_dev`

2. **Security Scanning (Optional)**
   - `SNYK_TOKEN`: Your Snyk API token for security vulnerability scanning
   - `SNYK_ORG_ID`: Your Snyk organization ID
   - If not provided, the system will use mock security scan results

3. **AI Integration (Optional)**
   - `HUGGINGFACE_API_TOKEN`: Your Hugging Face API token for AI responses
   - If not provided, the chat service will return mock responses

### Getting API Keys

1. **Snyk API Token**:
   - Sign up at https://snyk.io
   - Go to Account Settings > API Tokens
   - Create a new token with appropriate permissions

2. **Hugging Face API Token**:
   - Sign up at https://huggingface.co
   - Go to Settings > Access Tokens
   - Create a new token

## Running the Application

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Check service status**:
   ```bash
   docker-compose ps
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f [service_name]
   ```

## Service Endpoints

- **API Gateway**: http://localhost:8000
- **Analysis Orchestrator**: http://localhost:8001
- **Chat Service**: http://localhost:8002
- **Frontend**: http://localhost:5173 (when running in dev mode)

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Ensure PostgreSQL is running: `docker-compose ps db`
   - Check DATABASE_URL format in .env file
   - The system will fall back to SQLite if PostgreSQL is unavailable

2. **Missing API Tokens**:
   - Services will use mock data if tokens are not provided
   - Check logs for warnings about missing tokens

3. **Docker Permission Issues**:
   - The dynamic testing service requires Docker socket access
   - Ensure your user has permission to access /var/run/docker.sock

### Logs and Debugging

- View all logs: `docker-compose logs`
- View specific service: `docker-compose logs [service_name]`
- Follow logs in real-time: `docker-compose logs -f [service_name]`

## Development

For development, you can run services individually:

```bash
# Run just the database
docker-compose up db

# Run a specific service in development mode
cd codie/[service_name]
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
``` 