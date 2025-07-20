import os
import re
import json
import shutil
import tempfile
import asyncio
import time
import random
from pathlib import Path
from typing import Dict, Any, Optional, List
from collections import defaultdict
from dataclasses import dataclass
import logging

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from contextlib import asynccontextmanager
import httpx
from git import Repo
from fastapi.middleware.cors import CORSMiddleware

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Data Models ---
@dataclass
class Vulnerability:
    title: str
    severity: str
    file_path: str
    line_number: Optional[int] = None
    description: Optional[str] = None
    cvss_score: Optional[float] = None
    cve_url: Optional[str] = None

class AnalysisPayload(BaseModel):
    git_url: HttpUrl
    chat_id: str

class ApplyFixPayload(BaseModel):
    repo_path: str
    file_path: str
    new_code: str

# --- Pydantic Schemas ---
class FullAnalysisResult(BaseModel):
    hotspots: Dict[str, int]
    complexity_reports: Dict[str, Any]
    vulnerabilities: List[Dict]  # We'll pass the dict representation of the Vulnerability dataclass
    code_coverage_percentage: Optional[float] = None
    top_refactoring_candidate: Dict[str, Any]
    file_contents: Dict[str, str]

class ApplyFixRequest(BaseModel):
    repo_path: str
    file_path: str
    new_code: str

class ApplyFixResponse(BaseModel):
    success: bool
    message: str
    file_path: str

class ReportRequest(BaseModel):
    project_id: str
    template: str
    sections: Dict[str, bool]
    format: str = "pdf"  # pdf, html, json

class ReportResponse(BaseModel):
    report_id: str
    status: str
    download_url: Optional[str] = None
    message: str

# --- Asynchronous Snyk API Client ---
class SnykCodeAPI:
    def __init__(self, token: str, org_id: str, base_url: str = os.getenv("SNYK_API_URL", "https://api.snyk.io")):
        self.token = token
        self.org_id = org_id
        self.base_url = base_url.rstrip('/')
        self.cve_pattern = re.compile(r'CVE-\d{4}-\d{4,}', re.IGNORECASE)
        self.nvd_base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
        self.headers = {'Authorization': f'token {token}', 'Content-Type': 'application/json'}

    async def enrich_with_cve_details(self, vulnerability: Vulnerability, client: httpx.AsyncClient) -> Vulnerability:
        cve_matches = self.cve_pattern.findall(vulnerability.title)
        if not cve_matches:
            return vulnerability
        
        cve_id = cve_matches[0].upper()
        logger.info(f"Enriching vulnerability with CVE data for: {cve_id}")
        
        try:
            # Respect NVD API rate limit with a non-blocking sleep
            await asyncio.sleep(6) 
            response = await client.get(self.nvd_base_url, params={"cveId": cve_id}, timeout=30)
            
            if response.status_code == 200:
                nvd_data = response.json().get("vulnerabilities", [])
                if nvd_data:
                    metrics = nvd_data[0].get("cve", {}).get("metrics", {})
                    cvss_score = None
                    if "cvssMetricV31" in metrics:
                        cvss_score = metrics["cvssMetricV31"][0]["cvssData"]["baseScore"]
                    
                    vulnerability.cvss_score = cvss_score
                    vulnerability.cve_url = f"https://nvd.nist.gov/vuln/detail/{cve_id}"
        except Exception as e:
            logger.error(f"Failed to enrich {cve_id}: {e}")
            
        return vulnerability

    async def scan_directory(self, directory_path: str) -> List[Vulnerability]:
        """Complete workflow to scan a local directory. MOCKED for demonstration."""
        logger.info(f"Starting Snyk scan of directory: {directory_path}")
        demo_vulnerabilities = [
            Vulnerability(title="Remote Code Execution via deserialization (CVE-2023-12345)", severity="critical", file_path="src/utils/file_processor.py", line_number=78),
            Vulnerability(title="Hardcoded Secret in API key", severity="high", file_path="src/config.py", line_number=15)
        ]
        
        async with httpx.AsyncClient() as client:
            tasks = [self.enrich_with_cve_details(v, client) for v in demo_vulnerabilities]
            enriched_vulnerabilities = await asyncio.gather(*tasks)

        logger.info(f"Scan completed. Found {len(enriched_vulnerabilities)} vulnerabilities.")
        return enriched_vulnerabilities

# --- FastAPI App ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # You can add startup logic here, like connecting to a database
    logger.info("Analysis Orchestrator starting up...")
    yield
    # You can add shutdown logic here
    logger.info("Analysis Orchestrator shutting down...")

app = FastAPI(title="Analysis Orchestrator", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints ---
@app.post("/start-analysis", response_model=FullAnalysisResult)
async def start_analysis(payload: AnalysisPayload):
    """
    Clones a Git repository, orchestrates analysis, and sends a summary to the chat.
    """
    temp_dir = tempfile.mkdtemp()
    
    try:
        logger.info(f"Cloning repository: {payload.git_url}")
        await asyncio.to_thread(Repo.clone_from, str(payload.git_url), temp_dir)
        
        # --- Static and other analyses would be called here ---
        logger.info("Running static analysis... (mocked)")
        await asyncio.sleep(2) 
        
        # --- Snyk Vulnerability Scanning ---
        snyk_token = os.getenv("SNYK_TOKEN")
        snyk_org_id = os.getenv("SNYK_ORG_ID")

        if not snyk_token or not snyk_org_id:
            logger.warning("SNYK_TOKEN and SNYK_ORG_ID not set, using mock security scan")
            # Use mock vulnerabilities instead of real Snyk scan
            vulnerabilities = [
                Vulnerability(title="Mock: Remote Code Execution via deserialization", severity="critical", file_path="src/utils/file_processor.py", line_number=78),
                Vulnerability(title="Mock: Hardcoded Secret in API key", severity="high", file_path="src/config.py", line_number=15)
            ]
        else:
            # --- Snyk Vulnerability Scanning ---
            snyk_api = SnykCodeAPI(token=snyk_token, org_id=snyk_org_id)
            vulnerabilities = await snyk_api.scan_directory(temp_dir)
        
        # Mock code coverage data (if not obtained from a real tool)
        code_coverage_percentage = 78.5 # Placeholder if no real coverage tool is integrated
        
        # Determine top refactoring candidate (mocked for now)
        top_refactoring_candidate = {"file": "N/A", "score": 0.0}
        if complexity_reports:
            # Example: find file with highest cyclomatic complexity
            top_candidate_file = max(complexity_reports, key=lambda k: complexity_reports[k].get("cyclomatic_complexity", 0))
            top_refactoring_candidate = {
                "file": top_candidate_file,
                "score": complexity_reports[top_candidate_file].get("cyclomatic_complexity", 0)
            }

        return {
            "hotspots": hotspots,
            "complexity_reports": complexity_reports,
            "vulnerabilities": [vars(v) for v in vulnerabilities],
            "code_coverage_percentage": code_coverage_percentage,
            "top_refactoring_candidate": top_refactoring_candidate,
            "file_contents": file_contents
        }
    
    except Exception as e:
        logger.error(f"An error occurred during analysis: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred during analysis.")
    
    finally:
        # Clean up the temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)
        logger.info(f"Cleaned up temporary directory: {temp_dir}")

@app.post("/api/v1/apply-fix", response_model=ApplyFixResponse)
async def apply_fix(request: ApplyFixRequest):
    """
    Apply a code fix by overwriting a file with new code.
    """
    try:
        # Validate that the repository path exists
        if not os.path.exists(request.repo_path):
            raise HTTPException(status_code=404, detail="Repository path not found")
        
        # Construct the full file path
        full_file_path = os.path.join(request.repo_path, request.file_path)
        
        # Validate that the file exists
        if not os.path.exists(full_file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Create a backup of the original file
        backup_path = f"{full_file_path}.backup"
        shutil.copy2(full_file_path, backup_path)
        logger.info(f"Created backup of {full_file_path} at {backup_path}")
        
        # Write the new code to the file
        with open(full_file_path, 'w', encoding='utf-8') as f:
            f.write(request.new_code)
        
        logger.info(f"Successfully applied fix to {request.file_path}")
        
        return ApplyFixResponse(
            success=True,
            message=f"Successfully applied fix to {request.file_path}",
            file_path=request.file_path
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to apply fix: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to apply fix: {str(e)}")

@app.post("/api/v1/generate-report", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    """
    Generate a comprehensive analysis report for a project.
    """
    try:
        # Generate a unique report ID
        report_id = f"report_{int(time.time())}_{random.randint(1000, 9999)}"
        
        # Mock report generation process
        logger.info(f"Generating report {report_id} for project {request.project_id}")
        
        # In a real implementation, this would:
        # 1. Fetch project data from database
        # 2. Generate report content based on template and sections
        # 3. Convert to requested format (PDF, HTML, JSON)
        # 4. Store report file and return download URL
        
        # For now, we'll simulate the process
        await asyncio.sleep(2)  # Simulate processing time
        
        # Mock download URL
        download_url = f"http://localhost:8001/api/v1/reports/{report_id}/download"
        
        logger.info(f"Report {report_id} generated successfully")
        
        return ReportResponse(
            report_id=report_id,
            status="completed",
            download_url=download_url,
            message=f"Report generated successfully. Download available at {download_url}"
        )
        
    except Exception as e:
        logger.error(f"Failed to generate report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@app.get("/api/v1/reports/{report_id}/download")
async def download_report(report_id: str):
    """
    Download a generated report.
    """
    try:
        # In a real implementation, this would:
        # 1. Validate report_id
        # 2. Check if report exists and is completed
        # 3. Return the actual report file
        
        # For now, return a mock response
        return {
            "report_id": report_id,
            "status": "available",
            "message": "Report download endpoint - file would be served here"
        }
        
    except Exception as e:
        logger.error(f"Failed to download report {report_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download report: {str(e)}")
