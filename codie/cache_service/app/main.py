import os
import json
import logging
from typing import Optional, Any, Dict
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis.asyncio as redis
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour default

# Redis client
redis_client: Optional[redis.Redis] = None

# Pydantic models
class CacheItem(BaseModel):
    key: str
    value: Any
    ttl: Optional[int] = None

class CacheResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class CacheStats(BaseModel):
    total_keys: int
    memory_usage: str
    hit_rate: float
    uptime: str

# FastAPI App
@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client
    logger.info("Cache Service starting up...")
    
    # Initialize Redis connection
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        await redis_client.ping()
        logger.info("Successfully connected to Redis")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        raise
    
    yield
    
    # Cleanup
    if redis_client:
        await redis_client.close()
        logger.info("Cache Service shutting down...")

app = FastAPI(title="Codie Cache Service", version="1.0.0", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get Redis client
async def get_redis() -> redis.Redis:
    if not redis_client:
        raise HTTPException(status_code=503, detail="Cache service unavailable")
    return redis_client

# Cache utility functions
async def set_cache(redis_client: redis.Redis, key: str, value: Any, ttl: Optional[int] = None) -> bool:
    """Set a value in cache with optional TTL"""
    try:
        serialized_value = json.dumps(value, default=str)
        await redis_client.set(key, serialized_value, ex=ttl or CACHE_TTL)
        logger.info(f"Cache set: {key}")
        return True
    except Exception as e:
        logger.error(f"Failed to set cache for key {key}: {e}")
        return False

async def get_cache(redis_client: redis.Redis, key: str) -> Optional[Any]:
    """Get a value from cache"""
    try:
        value = await redis_client.get(key)
        if value:
            logger.info(f"Cache hit: {key}")
            return json.loads(value)
        logger.info(f"Cache miss: {key}")
        return None
    except Exception as e:
        logger.error(f"Failed to get cache for key {key}: {e}")
        return None

async def delete_cache(redis_client: redis.Redis, key: str) -> bool:
    """Delete a value from cache"""
    try:
        result = await redis_client.delete(key)
        logger.info(f"Cache deleted: {key}")
        return result > 0
    except Exception as e:
        logger.error(f"Failed to delete cache for key {key}: {e}")
        return False

# API Endpoints
@app.post("/cache/set", response_model=CacheResponse)
async def set_cache_item(item: CacheItem, redis_client: redis.Redis = Depends(get_redis)):
    """Set a value in cache"""
    success = await set_cache(redis_client, item.key, item.value, item.ttl)
    return CacheResponse(
        success=success,
        message="Cache set successfully" if success else "Failed to set cache",
        data={"key": item.key}
    )

@app.get("/cache/get/{key}")
async def get_cache_item(key: str, redis_client: redis.Redis = Depends(get_redis)):
    """Get a value from cache"""
    value = await get_cache(redis_client, key)
    if value is None:
        raise HTTPException(status_code=404, detail="Key not found in cache")
    return CacheResponse(
        success=True,
        message="Cache hit",
        data={"key": key, "value": value}
    )

@app.delete("/cache/delete/{key}", response_model=CacheResponse)
async def delete_cache_item(key: str, redis_client: redis.Redis = Depends(get_redis)):
    """Delete a value from cache"""
    success = await delete_cache(redis_client, key)
    return CacheResponse(
        success=success,
        message="Cache deleted successfully" if success else "Key not found or deletion failed"
    )

@app.post("/cache/clear", response_model=CacheResponse)
async def clear_cache(redis_client: redis.Redis = Depends(get_redis)):
    """Clear all cache"""
    try:
        await redis_client.flushdb()
        logger.info("Cache cleared")
        return CacheResponse(
            success=True,
            message="Cache cleared successfully"
        )
    except Exception as e:
        logger.error(f"Failed to clear cache: {e}")
        return CacheResponse(
            success=False,
            message=f"Failed to clear cache: {str(e)}"
        )

@app.get("/cache/stats", response_model=CacheStats)
async def get_cache_stats(redis_client: redis.Redis = Depends(get_redis)):
    """Get cache statistics"""
    try:
        info = await redis_client.info()
        total_keys = await redis_client.dbsize()
        memory_usage = info.get('used_memory_human', 'Unknown')
        
        # Calculate hit rate (simplified)
        hit_rate = 0.85  # Mock value - in real implementation, track hits/misses
        
        return CacheStats(
            total_keys=total_keys,
            memory_usage=memory_usage,
            hit_rate=hit_rate,
            uptime=info.get('uptime_in_seconds', 0)
        )
    except Exception as e:
        logger.error(f"Failed to get cache stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get cache statistics")

@app.get("/cache/keys")
async def list_cache_keys(pattern: str = "*", redis_client: redis.Redis = Depends(get_redis)):
    """List cache keys matching pattern"""
    try:
        keys = await redis_client.keys(pattern)
        return {
            "keys": keys,
            "count": len(keys)
        }
    except Exception as e:
        logger.error(f"Failed to list cache keys: {e}")
        raise HTTPException(status_code=500, detail="Failed to list cache keys")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "cache"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004) 