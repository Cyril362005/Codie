# Codie Production Deployment Guide

This guide covers production deployment, monitoring, and maintenance of the Codie platform.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- 4GB+ RAM
- 20GB+ disk space
- Linux/Unix environment

### 1. Environment Setup
```bash
# Clone the repository
git clone https://github.com/your-org/codie.git
cd codie

# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

### 2. Production Deployment
```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh deploy
```

### 3. Verify Deployment
```bash
# Check service health
./deploy.sh health

# Access the application
open http://localhost:3000
```

## 📋 Environment Configuration

### Required Environment Variables

```env
# Database Configuration
DATABASE_URL=postgresql://codie:codie@db:5432/codie_dev

# Redis Configuration
REDIS_URL=redis://redis:6379
CACHE_TTL=3600

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production

# Security Scanning
SNYK_TOKEN=your_snyk_token_here
SNYK_ORG_ID=your_snyk_org_id_here

# AI Integration
HUGGINGFACE_API_TOKEN=your_huggingface_token_here

# Performance & Monitoring
LOG_LEVEL=INFO
ENVIRONMENT=production
```

### Security Best Practices

1. **JWT Secret**: Use a strong, randomly generated secret
2. **Database Password**: Use a strong password for production
3. **API Keys**: Store securely and rotate regularly
4. **HTTPS**: Enable SSL/TLS in production

## 🏗️ Architecture Overview

### Microservices
- **Frontend**: React SPA (Port 3000)
- **API Gateway**: Request routing (Port 8000)
- **Analysis Orchestrator**: Main analysis service (Port 8001)
- **Auth Service**: Authentication & authorization (Port 8003)
- **Chat Service**: AI chat functionality (Port 8002)
- **Cache Service**: Redis caching (Port 8004)
- **Monitoring Service**: Health monitoring (Port 8005)
- **Database**: PostgreSQL (Port 5432)
- **Redis**: Caching layer (Port 6379)

### Data Flow
```
User Request → Nginx → API Gateway → Microservice → Database/Cache
```

## 🔧 Production Configuration

### Nginx Configuration
The platform includes a production-ready Nginx configuration with:
- Load balancing
- Rate limiting
- Gzip compression
- Security headers
- SSL/TLS support

### Docker Compose
Production services are orchestrated using Docker Compose with:
- Health checks
- Resource limits
- Volume persistence
- Network isolation

## 📊 Monitoring & Observability

### System Monitoring
Access the monitoring dashboard at `http://localhost:8005` to view:
- Service health status
- Response times
- System metrics
- Active alerts

### Health Checks
```bash
# Check all services
curl http://localhost:8005/services/health

# Check specific service
curl http://localhost:8005/services/analysis_orchestrator/health

# System metrics
curl http://localhost:8005/metrics
```

### Logging
Logs are available for each service:
```bash
# View service logs
docker-compose logs -f analysis_orchestrator
docker-compose logs -f auth_service
docker-compose logs -f chat_service

# View all logs
docker-compose logs -f
```

## 🔄 Deployment Operations

### Deploy New Version
```bash
# Pull latest changes
git pull origin main

# Deploy with health checks
./deploy.sh deploy
```

### Rollback Deployment
```bash
# Rollback to previous version
./deploy.sh rollback
```

### Create Backup
```bash
# Create manual backup
./deploy.sh backup
```

### Health Check
```bash
# Verify all services are healthy
./deploy.sh health
```

## 🛠️ Maintenance

### Database Maintenance
```bash
# Connect to database
docker-compose exec db psql -U codie -d codie_dev

# Run maintenance queries
VACUUM ANALYZE;
REINDEX DATABASE codie_dev;
```

### Cache Management
```bash
# Clear cache
curl -X POST http://localhost:8004/cache/clear

# View cache stats
curl http://localhost:8004/cache/stats
```

### Service Restart
```bash
# Restart specific service
docker-compose restart analysis_orchestrator

# Restart all services
docker-compose restart
```

## 🔍 Troubleshooting

### Common Issues

#### Service Not Starting
```bash
# Check service logs
docker-compose logs service_name

# Check resource usage
docker stats

# Verify environment variables
docker-compose config
```

#### Database Connection Issues
```bash
# Check database status
docker-compose exec db pg_isready -U codie

# Check database logs
docker-compose logs db
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor cache hit rate
curl http://localhost:8004/cache/stats

# Check service response times
curl http://localhost:8005/services/health
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Restart services with memory limits
docker-compose down
docker-compose up -d
```

### Performance Optimization

#### Database Optimization
```sql
-- Analyze table statistics
ANALYZE;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### Cache Optimization
```bash
# Monitor cache performance
curl http://localhost:8004/cache/stats

# Adjust cache TTL if needed
# Edit .env file: CACHE_TTL=7200
```

#### Service Scaling
```bash
# Scale specific service
docker-compose up -d --scale analysis_orchestrator=2

# Monitor scaling impact
docker stats
```

## 🔒 Security Hardening

### Network Security
- Use firewalls to restrict access
- Implement rate limiting
- Enable HTTPS/TLS
- Use VPN for admin access

### Application Security
- Regular security updates
- Input validation
- SQL injection prevention
- XSS protection

### Data Security
- Encrypt sensitive data
- Regular backups
- Access control
- Audit logging

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale analysis service
docker-compose up -d --scale analysis_orchestrator=3

# Scale chat service
docker-compose up -d --scale chat_service=2
```

### Vertical Scaling
- Increase container memory limits
- Add more CPU resources
- Optimize database queries
- Use connection pooling

### Load Balancing
- Configure Nginx load balancing
- Use sticky sessions if needed
- Monitor load distribution

## 🚨 Emergency Procedures

### Service Outage
1. Check monitoring dashboard
2. Review service logs
3. Restart affected services
4. Verify health checks
5. Notify stakeholders

### Data Loss
1. Stop all services
2. Restore from backup
3. Verify data integrity
4. Restart services
5. Document incident

### Security Breach
1. Isolate affected services
2. Review access logs
3. Rotate credentials
4. Patch vulnerabilities
5. Incident response

## 📞 Support

### Getting Help
- Check logs: `docker-compose logs`
- Monitor dashboard: `http://localhost:8005`
- Review documentation
- Contact support team

### Useful Commands
```bash
# System status
docker-compose ps

# Service logs
docker-compose logs -f service_name

# Resource usage
docker stats

# Network connectivity
docker network ls
docker network inspect codie_default

# Volume management
docker volume ls
docker volume inspect codie_postgres_data
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Note**: This is a production deployment guide. Always test changes in a staging environment before applying to production. 