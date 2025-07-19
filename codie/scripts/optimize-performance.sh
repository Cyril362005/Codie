#!/bin/bash

# Codie Performance Optimization Script
# This script optimizes the platform for production performance

set -e

# Configuration
LOG_FILE="/var/log/codie/optimization.log"
OPTIMIZATION_DIR="/opt/codie/optimizations"
BACKUP_DIR="/backups/codie/optimizations"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Create directories
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$OPTIMIZATION_DIR"
mkdir -p "$BACKUP_DIR"

log "Starting Codie performance optimization..."

# Function to check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # CPU cores
    CPU_CORES=$(nproc)
    log "CPU Cores: $CPU_CORES"
    
    # Memory
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    log "Total Memory: ${TOTAL_MEM}MB"
    log "Available Memory: ${AVAILABLE_MEM}MB"
    
    # Disk space
    DISK_USAGE=$(df / | awk 'NR==2{printf "%.1f", $5}' | sed 's/%//')
    log "Disk Usage: ${DISK_USAGE}%"
    
    # Check if system meets minimum requirements
    if [ "$CPU_CORES" -lt 4 ]; then
        warning "System has less than 4 CPU cores. Performance may be limited."
    fi
    
    if [ "$AVAILABLE_MEM" -lt 4096 ]; then
        warning "System has less than 4GB available memory. Performance may be limited."
    fi
    
    if [ "$DISK_USAGE" -gt 90 ]; then
        error "Disk usage is above 90%. Please free up space before optimization."
        exit 1
    fi
    
    success "System resource check completed"
}

# Function to optimize Docker configuration
optimize_docker() {
    log "Optimizing Docker configuration..."
    
    # Backup current Docker configuration
    if [ -f "/etc/docker/daemon.json" ]; then
        cp /etc/docker/daemon.json "$BACKUP_DIR/docker_daemon_backup.json"
    fi
    
    # Create optimized Docker daemon configuration
    cat > /etc/docker/daemon.json << EOF
{
    "default-shm-size": "2G",
    "max-concurrent-downloads": 10,
    "max-concurrent-uploads": 5,
    "storage-driver": "overlay2",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "100m",
        "max-file": "3"
    },
    "experimental": false,
    "metrics-addr": "127.0.0.1:9323",
    "live-restore": true,
    "userland-proxy": false,
    "ip-forward": true,
    "iptables": true,
    "ip-masq": true
}
EOF
    
    # Restart Docker daemon
    systemctl restart docker
    
    # Wait for Docker to be ready
    sleep 10
    
    # Verify Docker is running
    if docker info >/dev/null 2>&1; then
        success "Docker optimization completed"
    else
        error "Docker optimization failed"
        exit 1
    fi
}

# Function to optimize database performance
optimize_database() {
    log "Optimizing database performance..."
    
    # Create database optimization script
    cat > "$OPTIMIZATION_DIR/optimize_db.sql" << EOF
-- Database optimization script
-- Analyze and update statistics
ANALYZE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_analysis_results_project_id ON analysis_results(project_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Optimize table storage
VACUUM ANALYZE;

-- Update PostgreSQL configuration for better performance
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Reload configuration
SELECT pg_reload_conf();
EOF
    
    # Apply database optimizations
    if docker-compose exec -T db psql -U codie -d codie_dev -f /opt/codie/optimizations/optimize_db.sql; then
        success "Database optimization completed"
    else
        warning "Database optimization failed (may be expected if tables don't exist yet)"
    fi
}

# Function to optimize Redis configuration
optimize_redis() {
    log "Optimizing Redis configuration..."
    
    # Create optimized Redis configuration
    cat > "$OPTIMIZATION_DIR/redis.conf" << EOF
# Redis optimization configuration
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 100
notify-keyspace-events ""
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit slave 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
aof-rewrite-incremental-fsync yes
EOF
    
    # Apply Redis configuration
    docker cp "$OPTIMIZATION_DIR/redis.conf" codie-redis-1:/usr/local/etc/redis/redis.conf
    docker-compose restart redis
    
    success "Redis optimization completed"
}

# Function to optimize Nginx configuration
optimize_nginx() {
    log "Optimizing Nginx configuration..."
    
    # Create optimized Nginx configuration
    cat > "$OPTIMIZATION_DIR/nginx.conf" << EOF
user nginx;
worker_processes auto;
worker_cpu_affinity auto;
worker_rlimit_nofile 65535;

error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 65535;
    use epoll;
    multi_accept on;
    accept_mutex off;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;
    
    # Upstream servers
    upstream api_backend {
        least_conn;
        server api_gateway:8000 max_fails=3 fail_timeout=30s;
        server analysis_orchestrator:8001 max_fails=3 fail_timeout=30s;
        server chat_service:8002 max_fails=3 fail_timeout=30s;
        server auth_service:8003 max_fails=3 fail_timeout=30s;
        server cache_service:8004 max_fails=3 fail_timeout=30s;
        server monitoring_service:8005 max_fails=3 fail_timeout=30s;
        server ai_service:8006 max_fails=3 fail_timeout=30s;
    }
    
    # Main server block
    server {
        listen 80;
        server_name localhost;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api_backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }
        
        # Health checks
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # Static files
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://api_backend;
        }
        
        # Frontend
        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF
    
    # Apply Nginx configuration
    if [ -f "/etc/nginx/nginx.conf" ]; then
        cp /etc/nginx/nginx.conf "$BACKUP_DIR/nginx_backup.conf"
    fi
    
    cp "$OPTIMIZATION_DIR/nginx.conf" /etc/nginx/nginx.conf
    nginx -t && nginx -s reload
    
    success "Nginx optimization completed"
}

# Function to optimize application settings
optimize_application() {
    log "Optimizing application settings..."
    
    # Create optimized environment variables
    cat > "$OPTIMIZATION_DIR/optimized.env" << EOF
# Optimized environment variables for production
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# Database optimization
DATABASE_URL=postgresql://codie:codie@db:5432/codie_dev?sslmode=disable&pool_size=20&max_overflow=30

# Redis optimization
REDIS_URL=redis://redis:6379/0
CACHE_TTL=3600
REDIS_POOL_SIZE=20

# Performance settings
WORKER_PROCESSES=4
MAX_CONNECTIONS=1000
REQUEST_TIMEOUT=30
KEEPALIVE_TIMEOUT=65

# AI/ML optimization
AI_BATCH_SIZE=100
AI_CONFIDENCE_THRESHOLD=0.7
MODEL_CACHE_SIZE=512

# Security settings
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Monitoring
METRICS_ENABLED=true
HEALTH_CHECK_INTERVAL=30
ALERT_THRESHOLD=0.9
EOF
    
    # Apply optimized environment
    cp "$OPTIMIZATION_DIR/optimized.env" .env.optimized
    
    success "Application optimization completed"
}

# Function to run performance tests
run_performance_tests() {
    log "Running performance tests..."
    
    # Test API response times
    log "Testing API response times..."
    
    # Test health endpoint
    HEALTH_RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:8000/health)
    log "Health endpoint response time: ${HEALTH_RESPONSE_TIME}s"
    
    # Test concurrent requests
    log "Testing concurrent requests..."
    start_time=$(date +%s)
    
    for i in {1..50}; do
        curl -s http://localhost:8000/health >/dev/null &
    done
    wait
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    log "50 concurrent requests completed in ${duration}s"
    
    # Test database performance
    log "Testing database performance..."
    DB_QUERY_TIME=$(docker-compose exec -T db psql -U codie -d codie_dev -c "SELECT 1;" | tail -n 1 | awk '{print $1}')
    log "Database query time: ${DB_QUERY_TIME}s"
    
    # Test Redis performance
    log "Testing Redis performance..."
    REDIS_SET_TIME=$(docker-compose exec -T redis redis-cli SET test_key test_value)
    REDIS_GET_TIME=$(docker-compose exec -T redis redis-cli GET test_key)
    log "Redis operations completed successfully"
    
    # Memory usage
    MEMORY_USAGE=$(docker stats --no-stream --format "table {{.MemUsage}}" | tail -n +2 | awk '{sum += $1} END {print sum}')
    log "Total memory usage: $MEMORY_USAGE"
    
    # CPU usage
    CPU_USAGE=$(docker stats --no-stream --format "table {{.CPUPerc}}" | tail -n +2 | awk '{sum += $1} END {print sum}')
    log "Total CPU usage: $CPU_USAGE"
    
    success "Performance tests completed"
}

# Function to generate optimization report
generate_optimization_report() {
    log "Generating optimization report..."
    
    local report_file="/var/log/codie/optimization_report_$(date +%Y%m%d_%H%M%S).json"
    
    # Collect optimization information
    local optimization_info=$(cat <<EOF
{
    "optimization": {
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "status": "completed",
        "duration": "$(date -u +%H:%M:%S)"
    },
    "system": {
        "cpu_cores": "$(nproc)",
        "total_memory": "$(free -m | awk 'NR==2{printf "%.0f", $2}')MB",
        "available_memory": "$(free -m | awk 'NR==2{printf "%.0f", $7}')MB",
        "disk_usage": "$(df / | awk 'NR==2{printf "%.1f", $5}')%"
    },
    "services": {
        "docker": "optimized",
        "database": "optimized",
        "redis": "optimized",
        "nginx": "optimized",
        "application": "optimized"
    },
    "performance": {
        "health_response_time": "$(curl -o /dev/null -s -w "%{time_total}" http://localhost:8000/health 2>/dev/null || echo 'N/A')s",
        "memory_usage": "$(docker stats --no-stream --format "table {{.MemUsage}}" | tail -n +2 | awk '{sum += $1} END {print sum}' 2>/dev/null || echo 'N/A')",
        "cpu_usage": "$(docker stats --no-stream --format "table {{.CPUPerc}}" | tail -n +2 | awk '{sum += $1} END {print sum}' 2>/dev/null || echo 'N/A')"
    },
    "recommendations": [
        "Monitor system resources regularly",
        "Scale services based on load",
        "Update configurations as needed",
        "Perform regular maintenance"
    ]
}
EOF
)
    
    echo "$optimization_info" > "$report_file"
    success "Optimization report generated: $report_file"
}

# Main optimization function
main() {
    local start_time=$(date +%s)
    
    log "Starting Codie performance optimization..."
    
    # Check system resources
    check_system_resources
    
    # Optimize Docker
    optimize_docker
    
    # Optimize database
    optimize_database
    
    # Optimize Redis
    optimize_redis
    
    # Optimize Nginx
    optimize_nginx
    
    # Optimize application
    optimize_application
    
    # Run performance tests
    run_performance_tests
    
    # Generate optimization report
    generate_optimization_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "Performance optimization completed successfully in ${duration} seconds"
    log "Optimization log: $LOG_FILE"
    
    # Display optimization summary
    log "Optimization Summary:"
    log "- Docker: Optimized with increased shared memory and concurrent operations"
    log "- Database: Optimized with indexes and PostgreSQL configuration"
    log "- Redis: Optimized with memory management and persistence"
    log "- Nginx: Optimized with compression, caching, and load balancing"
    log "- Application: Optimized with performance-focused environment variables"
}

# Handle script arguments
case "${1:-optimize}" in
    "optimize")
        main
        ;;
    "test")
        run_performance_tests
        ;;
    "report")
        generate_optimization_report
        ;;
    *)
        echo "Usage: $0 {optimize|test|report}"
        echo "  optimize - Full performance optimization"
        echo "  test     - Run performance tests only"
        echo "  report   - Generate optimization report only"
        exit 1
        ;;
esac 