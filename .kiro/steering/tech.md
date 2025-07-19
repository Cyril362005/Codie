# Codie Technical Stack

## Backend
- **Language**: Python 3.x
- **Framework**: FastAPI
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy
- **Cache**: Redis 7
- **Authentication**: JWT
- **Container**: Docker + Docker Compose
- **Code Analysis**: Tree-sitter, Radon
- **Security Scanning**: Snyk API integration

## Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Code Editor**: Monaco Editor
- **Charting**: Recharts
- **Animation**: Framer Motion
- **Code Highlighting**: Prism

## Microservices
- `api_gateway`: Main entry point and request routing
- `analysis_orchestrator`: Coordinates code analysis workflows
- `chat_service`: AI-powered code review chat
- `auth_service`: User authentication and authorization
- `cache_service`: Redis-based caching layer
- `monitoring_service`: System monitoring and alerting
- `repo_analysis`: Static code analysis
- `dynamic_testing`: Runtime testing and code coverage
- `style_learner`: Code style profiling
- `ai_service`: Machine learning and AI analysis

## Common Commands

### Development
```bash
# Start all services
docker-compose up --build

# Start specific service
docker-compose up --build service_name

# Run tests
cd tests/integration
pytest test_full_workflow.py -v

# Frontend development
cd codie-chat
npm run dev
```

### Production
```bash
# Full production deployment
./deploy-production.sh deploy

# Check system health
./deploy-production.sh health

# Run all tests
./deploy-production.sh test

# Performance optimization
./scripts/optimize-performance.sh optimize
```

### Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```