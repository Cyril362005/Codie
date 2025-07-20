import httpx
import os
from fastapi import FastAPI, Request, HTTPException
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

ANALYSIS_ORCHESTRATOR_URL = os.getenv("ANALYSIS_ORCHESTRATOR_URL", "http://analysis_orchestrator:8000")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"API Gateway starting up... Connecting to Orchestrator at: {ANALYSIS_ORCHESTRATOR_URL}")
    app.state.http_client = httpx.AsyncClient()
    yield
    print("API Gateway shutting down...")
    await app.state.http_client.aclose()

app = FastAPI(
    title="Codie API Gateway",
    description="Main entry point for the Codie AI Code Review Assistant.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health Check"])
async def read_root():
    return {"message": "Codie API Gateway is running!"}

@app.post("/api/v1/analyze", tags=["Analysis"])
async def proxy_start_analysis(request: Request):
    client = request.app.state.http_client
    try:
        request_body = await request.json()
        response = await client.post(
            f"{ANALYSIS_ORCHESTRATOR_URL}/start-analysis",
            json=request_body,
            timeout=30.0
        )
        response.raise_for_status()
        return response.json()
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Error communicating with the Analysis Orchestrator: {exc}")
    except httpx.HTTPStatusError as exc:
        try:
            detail = exc.response.json()
        except ValueError:
            detail = exc.response.text
        raise HTTPException(status_code=exc.response.status_code, detail=detail)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {exc}")