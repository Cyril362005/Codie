from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import asyncio
from datetime import datetime, timezone

from .advanced_ai import (
    AdvancedAIService, 
    VulnerabilityPrediction, 
    CodeQualityMetrics, 
    CodePattern,
    AIPrediction
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Codie AI Service",
    description="Advanced AI-powered code analysis and machine learning service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI service
ai_service = AdvancedAIService()

# Request/Response models
class CodeAnalysisRequest(BaseModel):
    code_content: str
    file_path: str
    language: Optional[str] = "python"

class ProjectAnalysisRequest(BaseModel):
    files: List[Dict[str, Any]]
    project_name: str

class ModelTrainingRequest(BaseModel):
    training_data: List[Dict[str, Any]]

class AnalysisResponse(BaseModel):
    vulnerability_prediction: VulnerabilityPrediction
    code_quality: CodeQualityMetrics
    patterns: List[CodePattern]
    analysis_timestamp: datetime

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "models_loaded": {
            "vulnerability_classifier": ai_service.vulnerability_classifier is not None,
            "code_quality_regressor": ai_service.code_quality_regressor is not None,
            "pattern_detector": ai_service.pattern_detector is not None,
            "anomaly_detector": ai_service.anomaly_detector is not None
        }
    }

# Code analysis endpoint
@app.post("/analyze/code", response_model=AnalysisResponse)
async def analyze_code(request: CodeAnalysisRequest):
    """Analyze a single code file for vulnerabilities, quality, and patterns"""
    try:
        logger.info(f"Analyzing code file: {request.file_path}")
        
        # Run all analyses concurrently
        vulnerability_task = ai_service.predict_vulnerabilities(
            request.code_content, 
            request.file_path
        )
        quality_task = ai_service.analyze_code_quality(
            request.code_content, 
            request.file_path
        )
        patterns_task = ai_service.detect_code_patterns(
            request.code_content, 
            request.file_path
        )
        
        # Wait for all analyses to complete
        vulnerability_prediction, code_quality, patterns = await asyncio.gather(
            vulnerability_task, quality_task, patterns_task
        )
        
        return AnalysisResponse(
            vulnerability_prediction=vulnerability_prediction,
            code_quality=code_quality,
            patterns=patterns,
            analysis_timestamp=datetime.now(timezone.utc)
        )
        
    except Exception as e:
        logger.error(f"Error analyzing code: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Vulnerability prediction endpoint
@app.post("/predict/vulnerabilities", response_model=VulnerabilityPrediction)
async def predict_vulnerabilities(request: CodeAnalysisRequest):
    """Predict vulnerabilities in code"""
    try:
        logger.info(f"Predicting vulnerabilities for: {request.file_path}")
        
        prediction = await ai_service.predict_vulnerabilities(
            request.code_content, 
            request.file_path
        )
        
        return prediction
        
    except Exception as e:
        logger.error(f"Error predicting vulnerabilities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Code quality analysis endpoint
@app.post("/analyze/quality", response_model=CodeQualityMetrics)
async def analyze_quality(request: CodeAnalysisRequest):
    """Analyze code quality metrics"""
    try:
        logger.info(f"Analyzing quality for: {request.file_path}")
        
        quality_metrics = await ai_service.analyze_code_quality(
            request.code_content, 
            request.file_path
        )
        
        return quality_metrics
        
    except Exception as e:
        logger.error(f"Error analyzing code quality: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Pattern detection endpoint
@app.post("/detect/patterns", response_model=List[CodePattern])
async def detect_patterns(request: CodeAnalysisRequest):
    """Detect code patterns"""
    try:
        logger.info(f"Detecting patterns for: {request.file_path}")
        
        patterns = await ai_service.detect_code_patterns(
            request.code_content, 
            request.file_path
        )
        
        return patterns
        
    except Exception as e:
        logger.error(f"Error detecting patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Project analysis endpoint
@app.post("/analyze/project", response_model=AIPrediction)
async def analyze_project(request: ProjectAnalysisRequest):
    """Analyze an entire project and generate AI insights"""
    try:
        logger.info(f"Analyzing project: {request.project_name}")
        
        # Prepare project data
        project_data = {
            "project_name": request.project_name,
            "files": request.files,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
        # Generate AI insights
        insights = await ai_service.get_ai_insights(project_data)
        
        return insights
        
    except Exception as e:
        logger.error(f"Error analyzing project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Model training endpoint
@app.post("/train/models")
async def train_models(request: ModelTrainingRequest, background_tasks: BackgroundTasks):
    """Train or retrain ML models with new data"""
    try:
        logger.info(f"Training models with {len(request.training_data)} samples")
        
        # Train models in background
        background_tasks.add_task(ai_service.train_models, request.training_data)
        
        return {
            "status": "training_started",
            "message": "Model training has been started in the background",
            "training_samples": len(request.training_data),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error training models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# File upload endpoint
@app.post("/analyze/upload")
async def analyze_uploaded_file(file: UploadFile = File(...)):
    """Analyze an uploaded code file"""
    try:
        logger.info(f"Analyzing uploaded file: {file.filename}")
        
        # Read file content
        content = await file.read()
        code_content = content.decode('utf-8')
        
        # Analyze the code
        vulnerability_prediction = await ai_service.predict_vulnerabilities(
            code_content, 
            file.filename
        )
        
        quality_metrics = await ai_service.analyze_code_quality(
            code_content, 
            file.filename
        )
        
        patterns = await ai_service.detect_code_patterns(
            code_content, 
            file.filename
        )
        
        return {
            "filename": file.filename,
            "file_size": len(content),
            "vulnerability_prediction": vulnerability_prediction,
            "code_quality": quality_metrics,
            "patterns": patterns,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing uploaded file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch analysis endpoint
@app.post("/analyze/batch")
async def analyze_batch(files: List[CodeAnalysisRequest]):
    """Analyze multiple files in batch"""
    try:
        logger.info(f"Analyzing {len(files)} files in batch")
        
        results = []
        
        # Process files concurrently
        tasks = []
        for file_request in files:
            task = ai_service.predict_vulnerabilities(
                file_request.code_content, 
                file_request.file_path
            )
            tasks.append(task)
        
        vulnerability_predictions = await asyncio.gather(*tasks)
        
        # Process quality analysis
        quality_tasks = []
        for file_request in files:
            task = ai_service.analyze_code_quality(
                file_request.code_content, 
                file_request.file_path
            )
            quality_tasks.append(task)
        
        quality_metrics = await asyncio.gather(*quality_tasks)
        
        # Process pattern detection
        pattern_tasks = []
        for file_request in files:
            task = ai_service.detect_code_patterns(
                file_request.code_content, 
                file_request.file_path
            )
            pattern_tasks.append(task)
        
        patterns_list = await asyncio.gather(*pattern_tasks)
        
        # Combine results
        for i, file_request in enumerate(files):
            results.append({
                "file_path": file_request.file_path,
                "language": file_request.language,
                "vulnerability_prediction": vulnerability_predictions[i],
                "code_quality": quality_metrics[i],
                "patterns": patterns_list[i],
                "analysis_timestamp": datetime.utcnow().isoformat()
            })
        
        return {
            "batch_size": len(files),
            "results": results,
            "summary": {
                "total_files": len(files),
                "high_risk_files": len([r for r in results if r["vulnerability_prediction"].risk_score > 0.7]),
                "avg_quality_score": sum(r["code_quality"].overall_score for r in results) / len(results) if results else 0,
                "total_patterns": sum(len(r["patterns"]) for r in results)
            }
        }
        
    except Exception as e:
        logger.error(f"Error in batch analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Model status endpoint
@app.get("/models/status")
async def get_model_status():
    """Get status of ML models"""
    try:
        return {
            "models": {
                "vulnerability_classifier": {
                    "loaded": ai_service.vulnerability_classifier is not None,
                    "type": "RandomForestClassifier" if ai_service.vulnerability_classifier else None
                },
                "code_quality_regressor": {
                    "loaded": ai_service.code_quality_regressor is not None,
                    "type": "RandomForestClassifier" if ai_service.code_quality_regressor else None
                },
                "pattern_detector": {
                    "loaded": ai_service.pattern_detector is not None,
                    "type": "DBSCAN" if ai_service.pattern_detector else None
                },
                "anomaly_detector": {
                    "loaded": ai_service.anomaly_detector is not None,
                    "type": "IsolationForest" if ai_service.anomaly_detector else None
                }
            },
            "feature_extractors": {
                "tfidf_vectorizer": "TfidfVectorizer",
                "scaler": "StandardScaler"
            },
            "models_directory": str(ai_service.models_dir),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Feature extraction endpoint
@app.post("/extract/features")
async def extract_features(request: CodeAnalysisRequest):
    """Extract features from code for ML analysis"""
    try:
        logger.info(f"Extracting features from: {request.file_path}")
        
        features = ai_service.extract_code_features(request.code_content)
        
        return {
            "file_path": request.file_path,
            "features": features,
            "feature_count": len(features),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error extracting features: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006) 