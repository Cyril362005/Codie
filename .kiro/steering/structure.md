# Codie Project Structure

The Codie project is organized into two main components:

## 1. Backend (`codie/`)

The backend follows a microservices architecture with each service having its own directory:

```
codie/
├── api_gateway/             # Main entry point for API requests
│   ├── app/
│   │   └── main.py          # FastAPI application
│   ├── Dockerfile
│   └── requirements.txt
├── analysis_orchestrator/   # Coordinates analysis workflows
├── auth_service/            # Handles authentication
├── cache_service/           # Redis caching layer
├── chat_service/            # Real-time chat functionality
├── dynamic_testing/         # Runtime testing
├── monitoring_service/      # System monitoring
├── repo_analysis/           # Static code analysis
├── style_learner/           # Code style profiling
├── ai_service/              # ML and AI analysis
├── shared/                  # Shared code and models
│   └── app/
│       └── database/
│           ├── database.py  # Database connection
│           └── models.py    # SQLAlchemy models
├── tests/                   # Integration tests
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Service orchestration
└── deploy-production.sh     # Production deployment script
```

Each microservice follows a similar structure:
- `Dockerfile` - Container definition
- `requirements.txt` - Python dependencies
- `app/main.py` - FastAPI application entry point

## 2. Frontend (`codie-chat/`)

The frontend is a React single-page application:

```
codie-chat/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images and resources
│   ├── components/          # React components
│   │   ├── ai/              # AI-related components
│   │   ├── analytics/       # Analytics components
│   │   ├── auth/            # Authentication components
│   │   ├── enterprise/      # Enterprise features
│   │   ├── icons/           # SVG icons
│   │   ├── monitoring/      # Monitoring components
│   │   ├── reports/         # Report generation
│   │   └── ui/              # Reusable UI components
│   ├── contexts/            # React contexts
│   ├── services/            # API services
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── package.json             # NPM dependencies
└── vite.config.ts           # Vite configuration
```

## Code Organization Conventions

1. **Backend Services**:
   - Each service is self-contained with its own dependencies
   - Services communicate via HTTP/REST
   - Shared code is in the `shared` directory
   - Database models are defined in `shared/app/database/models.py`

2. **Frontend Components**:
   - Organized by feature/domain
   - Reusable UI components in `components/ui`
   - Feature-specific components in dedicated directories
   - Context providers for state management

3. **Configuration**:
   - Environment variables in `.env` file
   - Docker configuration in `docker-compose.yml`
   - Frontend configuration in `src/config.ts`