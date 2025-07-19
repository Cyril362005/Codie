#!/bin/bash

# Codie Production Deployment Script
# This script handles the complete production deployment with testing and validation

set -e  # Exit on any error

# Configuration
PROJECT_NAME="codie"
DEPLOYMENT_ENV="production"
BACKUP_DIR="/backups/codie"
LOG_FILE="/var/log/codie/deployment.log"
HEALTH_CHECK_TIMEOUT=300  # 5 minutes
ROLLBACK_TIMEOUT=60       # 1 minute

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check required commands
    local required_commands=("docker" "docker-compose" "curl" "jq" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            error "Required command '$cmd' not found"
            exit 1
        fi
    done
    
    # Check Docker daemon
    if ! docker info >/dev/null 2>&1; then
        error "Docker daemon is not running"
        exit 1
    fi
    
    # Check disk space
    local available_space=$(df / | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 10485760 ]; then  # 10GB in KB
        error "Insufficient disk space. Need at least 10GB available"
        exit 1
    fi
    
    # Check memory
    local available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ "$available_memory" -lt 2048 ]; then  # 2GB
        error "Insufficient memory. Need at least 2GB available"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Function to create backup
create_backup() {
    log "Creating backup of current deployment..."
    
    local backup_timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_path="$BACKUP_DIR/backup_$backup_timestamp"
    
    mkdir -p "$backup_path"
    
    # Backup Docker volumes
    if docker volume ls | grep -q "${PROJECT_NAME}_"; then
        docker run --rm -v "${PROJECT_NAME}_postgres_data:/data" -v "$backup_path:/backup" \
            alpine tar czf /backup/postgres_data.tar.gz -C /data .
        docker run --rm -v "${PROJECT_NAME}_redis_data:/data" -v "$backup_path:/backup" \
            alpine tar czf /backup/redis_data.tar.gz -C /data .
        docker run --rm -v "${PROJECT_NAME}_ai_models:/data" -v "$backup_path:/backup" \
            alpine tar czf /backup/ai_models.tar.gz -C /data .
    fi
    
    # Backup configuration files
    cp docker-compose.yml "$backup_path/"
    cp .env "$backup_path/" 2>/dev/null || true
    cp nginx.conf "$backup_path/" 2>/dev/null || true
    
    # Backup logs
    if [ -d "/var/log/codie" ]; then
        tar czf "$backup_path/logs.tar.gz" -C /var/log codie
    fi
    
    success "Backup created at $backup_path"
    echo "$backup_path" > .last_backup_path
}

# Function to run pre-deployment tests
run_pre_deployment_tests() {
    log "Running pre-deployment tests..."
    
    # Check if services are currently running
    if docker-compose ps | grep -q "Up"; then
        log "Current services are running, testing them..."
        
        # Test health endpoints
        local services=("api_gateway" "analysis_orchestrator" "chat_service" "auth_service" "cache_service" "monitoring_service" "ai_service")
        local ports=(8000 8001 8002 8003 8004 8005 8006)
        
        for i in "${!services[@]}"; do
            local service="${services[$i]}"
            local port="${ports[$i]}"
            
            if curl -f -s "http://localhost:$port/health" >/dev/null 2>&1; then
                success "$service health check passed"
            else
                warning "$service health check failed (may be expected if not running)"
            fi
        done
    else
        log "No services currently running"
    fi
    
    # Test Docker images
    log "Testing Docker images..."
    if docker-compose config >/dev/null 2>&1; then
        success "Docker Compose configuration is valid"
    else
        error "Docker Compose configuration is invalid"
        exit 1
    fi
    
    success "Pre-deployment tests completed"
}

# Function to deploy services
deploy_services() {
    log "Starting deployment of Codie services..."
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose pull
    
    # Build images if needed
    log "Building Docker images..."
    docker-compose build --no-cache
    
    # Stop existing services gracefully
    log "Stopping existing services..."
    docker-compose down --timeout 30
    
    # Start services
    log "Starting services..."
    docker-compose up -d
    
    # Wait for services to start
    log "Waiting for services to start..."
    sleep 30
    
    success "Services deployed successfully"
}

# Function to run health checks
run_health_checks() {
    log "Running health checks..."
    
    local services=("api_gateway" "analysis_orchestrator" "chat_service" "auth_service" "cache_service" "monitoring_service" "ai_service")
    local ports=(8000 8001 8002 8003 8004 8005 8006)
    local failed_services=()
    
    for i in "${!services[@]}"; do
        local service="${services[$i]}"
        local port="${ports[$i]}"
        local max_attempts=30
        local attempt=1
        
        log "Checking health of $service..."
        
        while [ $attempt -le $max_attempts ]; do
            if curl -f -s "http://localhost:$port/health" >/dev/null 2>&1; then
                success "$service is healthy"
                break
            else
                if [ $attempt -eq $max_attempts ]; then
                    error "$service health check failed after $max_attempts attempts"
                    failed_services+=("$service")
                else
                    log "Attempt $attempt/$max_attempts: $service not ready, retrying in 10 seconds..."
                    sleep 10
                fi
            fi
            ((attempt++))
        done
    done
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        error "Health checks failed for: ${failed_services[*]}"
        return 1
    fi
    
    success "All health checks passed"
    return 0
}

# Function to run integration tests
run_integration_tests() {
    log "Running integration tests..."
    
    # Check if pytest is available
    if ! command_exists pytest; then
        warning "pytest not found, skipping integration tests"
        return 0
    fi
    
    # Run integration tests
    if [ -f "tests/integration/test_full_workflow.py" ]; then
        cd tests/integration
        if pytest test_full_workflow.py::TestCodieIntegration::test_service_health_checks -v; then
            success "Integration tests passed"
        else
            error "Integration tests failed"
            return 1
        fi
        cd ../..
    else
        warning "Integration test file not found, skipping"
    fi
    
    return 0
}

# Function to run performance tests
run_performance_tests() {
    log "Running performance tests..."
    
    # Test API response times
    local start_time=$(date +%s)
    
    # Test concurrent requests
    for i in {1..10}; do
        curl -s "http://localhost:8000/health" >/dev/null &
    done
    wait
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ $duration -lt 10 ]; then
        success "Performance test passed: $duration seconds for 10 concurrent requests"
    else
        warning "Performance test slow: $duration seconds for 10 concurrent requests"
    fi
    
    # Test memory usage
    local total_memory=$(docker stats --no-stream --format "table {{.MemUsage}}" | tail -n +2 | awk '{sum += $1} END {print sum}')
    log "Total memory usage: $total_memory"
    
    # Test disk usage
    local disk_usage=$(docker system df --format "table {{.Size}}" | tail -n +2 | awk '{sum += $1} END {print sum}')
    log "Total disk usage: $disk_usage"
}

# Function to rollback deployment
rollback_deployment() {
    error "Deployment failed, initiating rollback..."
    
    local backup_path=$(cat .last_backup_path 2>/dev/null || echo "")
    
    if [ -z "$backup_path" ] || [ ! -d "$backup_path" ]; then
        error "No backup found, cannot rollback"
        return 1
    fi
    
    log "Rolling back to backup: $backup_path"
    
    # Stop current services
    docker-compose down --timeout 30
    
    # Restore volumes
    if [ -f "$backup_path/postgres_data.tar.gz" ]; then
        docker run --rm -v "${PROJECT_NAME}_postgres_data:/data" -v "$backup_path:/backup" \
            alpine sh -c "rm -rf /data/* && tar xzf /backup/postgres_data.tar.gz -C /data"
    fi
    
    if [ -f "$backup_path/redis_data.tar.gz" ]; then
        docker run --rm -v "${PROJECT_NAME}_redis_data:/data" -v "$backup_path:/backup" \
            alpine sh -c "rm -rf /data/* && tar xzf /backup/redis_data.tar.gz -C /data"
    fi
    
    if [ -f "$backup_path/ai_models.tar.gz" ]; then
        docker run --rm -v "${PROJECT_NAME}_ai_models:/data" -v "$backup_path:/backup" \
            alpine sh -c "rm -rf /data/* && tar xzf /backup/ai_models.tar.gz -C /data"
    fi
    
    # Restore configuration
    if [ -f "$backup_path/docker-compose.yml" ]; then
        cp "$backup_path/docker-compose.yml" .
    fi
    
    if [ -f "$backup_path/.env" ]; then
        cp "$backup_path/.env" .
    fi
    
    # Start services
    docker-compose up -d
    
    # Wait for services to start
    sleep 30
    
    # Verify rollback
    if run_health_checks; then
        success "Rollback completed successfully"
        return 0
    else
        error "Rollback failed"
        return 1
    fi
}

# Function to update monitoring
update_monitoring() {
    log "Updating monitoring configuration..."
    
    # Send deployment notification to monitoring service
    curl -X POST "http://localhost:8005/deployment" \
        -H "Content-Type: application/json" \
        -d "{\"event\": \"deployment_completed\", \"environment\": \"$DEPLOYMENT_ENV\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
        || warning "Failed to send deployment notification"
    
    # Update health check configuration
    if [ -f "nginx.conf" ]; then
        log "Reloading Nginx configuration..."
        docker-compose exec nginx nginx -s reload 2>/dev/null || true
    fi
    
    success "Monitoring updated"
}

# Function to generate deployment report
generate_deployment_report() {
    log "Generating deployment report..."
    
    local report_file="/var/log/codie/deployment_report_$(date +%Y%m%d_%H%M%S).json"
    
    # Collect deployment information
    local deployment_info=$(cat <<EOF
{
    "deployment": {
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "environment": "$DEPLOYMENT_ENV",
        "version": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
        "status": "completed"
    },
    "services": {
        "api_gateway": "$(curl -s http://localhost:8000/health 2>/dev/null | jq -r '.status' || echo 'unknown')",
        "analysis_orchestrator": "$(curl -s http://localhost:8001/health 2>/dev/null | jq -r '.status' || echo 'unknown')",
        "chat_service": "$(curl -s http://localhost:8002/health 2>/dev/null | jq -r '.status' || echo 'unknown')",
        "auth_service": "$(curl -s http://localhost:8003/health 2>/dev/null | jq -r '.status' || echo 'unknown')",
        "cache_service": "$(curl -s http://localhost:8004/health 2>/dev/null | jq -r '.status' || echo 'unknown')",
        "monitoring_service": "$(curl -s http://localhost:8005/health 2>/dev/null | jq -r '.status' || echo 'unknown')",
        "ai_service": "$(curl -s http://localhost:8006/health 2>/dev/null | jq -r '.status' || echo 'unknown')"
    },
    "system": {
        "memory_usage": "$(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')",
        "disk_usage": "$(df / | awk 'NR==2{printf "%.1f%%", $5}')",
        "docker_containers": "$(docker ps --format 'table {{.Names}}' | wc -l)"
    }
}
EOF
)
    
    echo "$deployment_info" > "$report_file"
    success "Deployment report generated: $report_file"
}

# Main deployment function
main() {
    local start_time=$(date +%s)
    
    log "Starting Codie production deployment..."
    log "Environment: $DEPLOYMENT_ENV"
    log "Timestamp: $(date)"
    
    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Check prerequisites
    check_prerequisites
    
    # Create backup
    create_backup
    
    # Run pre-deployment tests
    run_pre_deployment_tests
    
    # Deploy services
    deploy_services
    
    # Run health checks
    if ! run_health_checks; then
        rollback_deployment
        exit 1
    fi
    
    # Run integration tests
    if ! run_integration_tests; then
        rollback_deployment
        exit 1
    fi
    
    # Run performance tests
    run_performance_tests
    
    # Update monitoring
    update_monitoring
    
    # Generate deployment report
    generate_deployment_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "Deployment completed successfully in ${duration} seconds"
    log "Deployment log: $LOG_FILE"
    
    # Display service status
    log "Service Status:"
    docker-compose ps
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback_deployment
        ;;
    "health")
        run_health_checks
        ;;
    "test")
        run_pre_deployment_tests
        run_integration_tests
        run_performance_tests
        ;;
    "backup")
        create_backup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|test|backup}"
        echo "  deploy   - Full production deployment"
        echo "  rollback - Rollback to previous deployment"
        echo "  health   - Run health checks"
        echo "  test     - Run all tests"
        echo "  backup   - Create backup only"
        exit 1
        ;;
esac 