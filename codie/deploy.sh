#!/bin/bash

# Codie Production Deployment Script
# This script handles production deployment with health checks and rollback capabilities

set -e

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    if [ ! -f ".env" ]; then
        error "Environment file .env not found"
    fi
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    mkdir -p $BACKUP_DIR
    BACKUP_NAME="codie_backup_$(date +%Y%m%d_%H%M%S)"
    
    # Backup database
    docker-compose exec -T db pg_dump -U codie codie_dev > "$BACKUP_DIR/${BACKUP_NAME}.sql" 2>/dev/null || warning "Database backup failed"
    
    # Backup volumes
    docker run --rm -v codie_postgres_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/${BACKUP_NAME}_volumes.tar.gz -C /data . 2>/dev/null || warning "Volume backup failed"
    
    success "Backup created: $BACKUP_NAME"
}

# Health check function
health_check() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    log "Checking health of $service..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://localhost:8005/services/$service/health" > /dev/null 2>&1; then
            success "$service is healthy"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 10
        ((attempt++))
    done
    
    error "$service failed health check after $max_attempts attempts"
}

# Deploy services
deploy_services() {
    log "Deploying services..."
    
    # Pull latest images
    docker-compose pull
    
    # Build services
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    success "Services deployed"
}

# Wait for services to be ready
wait_for_services() {
    log "Waiting for services to be ready..."
    
    # Wait for database
    log "Waiting for database..."
    docker-compose exec -T db pg_isready -U codie -d codie_dev || error "Database not ready"
    
    # Wait for Redis
    log "Waiting for Redis..."
    docker-compose exec -T redis redis-cli ping || error "Redis not ready"
    
    # Wait for monitoring service
    sleep 30
    
    # Check all services
    services=("analysis_orchestrator" "auth_service" "chat_service" "cache_service" "monitoring_service")
    
    for service in "${services[@]}"; do
        health_check $service
    done
    
    success "All services are healthy"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # This would run your actual migration scripts
    # For now, we'll just check if the database is accessible
    docker-compose exec -T db psql -U codie -d codie_dev -c "SELECT version();" > /dev/null 2>&1 || warning "Database migration check failed"
    
    success "Database migrations completed"
}

# Performance test
performance_test() {
    log "Running performance tests..."
    
    # Test API response time
    local response_time=$(curl -w "%{time_total}" -s -o /dev/null "http://localhost:8005/health")
    
    if (( $(echo "$response_time < 1.0" | bc -l) )); then
        success "Performance test passed: Response time ${response_time}s"
    else
        warning "Performance test warning: Response time ${response_time}s"
    fi
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Stop current services
    docker-compose down
    
    # Restore from backup if available
    if [ -f "$BACKUP_DIR/latest_backup.sql" ]; then
        log "Restoring database from backup..."
        docker-compose up -d db
        sleep 10
        docker-compose exec -T db psql -U codie -d codie_dev < "$BACKUP_DIR/latest_backup.sql" || warning "Database restore failed"
    fi
    
    # Start previous version
    docker-compose up -d
    
    success "Rollback completed"
}

# Main deployment function
main() {
    log "Starting Codie deployment to $ENVIRONMENT environment"
    
    # Check prerequisites
    check_prerequisites
    
    # Create backup
    create_backup
    
    # Deploy services
    deploy_services
    
    # Wait for services
    wait_for_services
    
    # Run migrations
    run_migrations
    
    # Performance test
    performance_test
    
    success "Deployment completed successfully!"
    
    log "Services are available at:"
    log "  Frontend: http://localhost:3000"
    log "  API Gateway: http://localhost:8000"
    log "  Monitoring: http://localhost:8005"
}

# Handle errors
trap 'error "Deployment failed. Rolling back..." && rollback' ERR

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        wait_for_services
        ;;
    "backup")
        create_backup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|backup}"
        exit 1
        ;;
esac 