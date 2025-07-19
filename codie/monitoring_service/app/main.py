import os
import asyncio
import logging
import time
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Service Configuration
SERVICES = {
    "analysis_orchestrator": "http://analysis_orchestrator:8000/health",
    "auth_service": "http://auth_service:8000/health",
    "chat_service": "http://chat_service:8000/health",
    "cache_service": "http://cache_service:8000/health",
    "api_gateway": "http://api_gateway:8000/health",
}

# Pydantic models
class ServiceHealth(BaseModel):
    service: str
    status: str
    response_time: float
    last_check: datetime
    error_message: Optional[str] = None

class SystemMetrics(BaseModel):
    total_services: int
    healthy_services: int
    unhealthy_services: int
    overall_status: str
    uptime: str
    last_updated: datetime

class Alert(BaseModel):
    id: str
    service: str
    severity: str
    message: str
    timestamp: datetime
    resolved: bool = False

# Global state
service_health: Dict[str, ServiceHealth] = {}
alerts: List[Alert] = []
start_time = datetime.utcnow()

# FastAPI App
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Monitoring Service starting up...")
    
    # Start background health check task
    task = asyncio.create_task(health_check_loop())
    
    yield
    
    logger.info("Monitoring Service shutting down...")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(title="Codie Monitoring Service", version="1.0.0", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def check_service_health(service_name: str, url: str) -> ServiceHealth:
    """Check health of a single service"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                status = "healthy"
                error_message = None
            else:
                status = "unhealthy"
                error_message = f"HTTP {response.status_code}"
                
    except Exception as e:
        response_time = time.time() - start_time
        status = "unhealthy"
        error_message = str(e)
    
    return ServiceHealth(
        service=service_name,
        status=status,
        response_time=response_time,
        last_check=datetime.utcnow(),
        error_message=error_message
    )

async def health_check_loop():
    """Background task to continuously check service health"""
    while True:
        try:
            # Check all services
            tasks = [
                check_service_health(service_name, url)
                for service_name, url in SERVICES.items()
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Update service health
            for i, (service_name, _) in enumerate(SERVICES.items()):
                if isinstance(results[i], Exception):
                    service_health[service_name] = ServiceHealth(
                        service=service_name,
                        status="unhealthy",
                        response_time=0.0,
                        last_check=datetime.utcnow(),
                        error_message=str(results[i])
                    )
                else:
                    service_health[service_name] = results[i]
            
            # Check for new alerts
            await check_alerts()
            
            logger.info(f"Health check completed. {len([s for s in service_health.values() if s.status == 'healthy'])}/{len(SERVICES)} services healthy")
            
        except Exception as e:
            logger.error(f"Error in health check loop: {e}")
        
        # Wait before next check
        await asyncio.sleep(30)  # Check every 30 seconds

async def check_alerts():
    """Check for new alerts based on service health"""
    for service_name, health in service_health.items():
        if health.status == "unhealthy":
            # Check if we already have an active alert for this service
            existing_alert = next(
                (alert for alert in alerts if alert.service == service_name and not alert.resolved),
                None
            )
            
            if not existing_alert:
                # Create new alert
                alert = Alert(
                    id=f"alert_{int(time.time())}_{service_name}",
                    service=service_name,
                    severity="high",
                    message=f"Service {service_name} is unhealthy: {health.error_message}",
                    timestamp=datetime.utcnow()
                )
                alerts.append(alert)
                logger.warning(f"New alert created: {alert.message}")
        
        elif health.status == "healthy":
            # Resolve existing alerts for this service
            for alert in alerts:
                if alert.service == service_name and not alert.resolved:
                    alert.resolved = True
                    logger.info(f"Alert resolved for service {service_name}")

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint for the monitoring service"""
    return {"status": "healthy", "service": "monitoring"}

@app.get("/services/health", response_model=List[ServiceHealth])
async def get_services_health():
    """Get health status of all services"""
    return list(service_health.values())

@app.get("/services/{service_name}/health", response_model=ServiceHealth)
async def get_service_health(service_name: str):
    """Get health status of a specific service"""
    if service_name not in service_health:
        raise HTTPException(status_code=404, detail="Service not found")
    return service_health[service_name]

@app.get("/metrics", response_model=SystemMetrics)
async def get_system_metrics():
    """Get overall system metrics"""
    healthy_count = len([s for s in service_health.values() if s.status == "healthy"])
    total_count = len(SERVICES)
    unhealthy_count = total_count - healthy_count
    
    overall_status = "healthy" if healthy_count == total_count else "degraded" if healthy_count > 0 else "down"
    
    uptime = str(datetime.utcnow() - start_time)
    
    return SystemMetrics(
        total_services=total_count,
        healthy_services=healthy_count,
        unhealthy_services=unhealthy_count,
        overall_status=overall_status,
        uptime=uptime,
        last_updated=datetime.utcnow()
    )

@app.get("/alerts", response_model=List[Alert])
async def get_alerts(resolved: bool = False):
    """Get system alerts"""
    if resolved:
        return [alert for alert in alerts if alert.resolved]
    else:
        return [alert for alert in alerts if not alert.resolved]

@app.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Resolve an alert"""
    alert = next((a for a in alerts if a.id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    return {"message": "Alert resolved successfully"}

@app.post("/services/{service_name}/check")
async def check_service(service_name: str):
    """Manually trigger health check for a service"""
    if service_name not in SERVICES:
        raise HTTPException(status_code=404, detail="Service not found")
    
    health = await check_service_health(service_name, SERVICES[service_name])
    service_health[service_name] = health
    
    return health

@app.get("/dashboard")
async def get_dashboard():
    """Get dashboard data for monitoring UI"""
    metrics = await get_system_metrics()
    recent_alerts = [alert for alert in alerts if not alert.resolved][:10]
    
    return {
        "metrics": metrics,
        "services": list(service_health.values()),
        "recent_alerts": recent_alerts,
        "last_updated": datetime.utcnow()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005) 