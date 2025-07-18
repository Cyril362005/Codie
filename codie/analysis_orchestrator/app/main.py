import os
import re
import json
import shutil
import tempfile
import asyncio
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

class StatusResponse(BaseModel):
    status: str
    message: str

# --- Asynchronous Snyk API Client ---
class SnykCodeAPI:
    def __init__(self, token: str, org_id: str, base_url: str = "https://api.snyk.io"):
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

# --- Endpoints ---
@app.post("/start-analysis", response_model=StatusResponse)
async def start_analysis(payload: AnalysisPayload):
    """
    Clones a Git repository, orchestrates analysis, and sends a summary to the chat.
    """
    snyk_token = os.getenv("SNYK_TOKEN")
    snyk_org_id = os.getenv("SNYK_ORG_ID")

    if not snyk_token or not snyk_org_id:
        raise HTTPException(status_code=500, detail="SNYK_TOKEN and SNYK_ORG_ID must be set for security scans.")

    temp_dir = tempfile.mkdtemp()
    
    try:
        logger.info(f"Cloning repository: {payload.git_url}")
        await asyncio.to_thread(Repo.clone_from, str(payload.git_url), temp_dir)
        
        # --- Static and other analyses would be called here ---
        logger.info("Running static analysis... (mocked)")
        await asyncio.sleep(2) 
        
        # --- Snyk Vulnerability Scanning ---
        snyk_api = SnykCodeAPI(token=snyk_token, org_id=snyk_org_id)
        vulnerabilities = await snyk_api.scan_directory(temp_dir)
        
        critical_vulns = [v for v in vulnerabilities if v.severity.lower() == 'critical']
        
        # --- Synthesize Final Summary ---
        summary = "I've finished analyzing your project. "
        
        if critical_vulns:
            most_severe = critical_vulns[0]
            summary += (
                f"My security scan found {len(critical_vulns)} critical vulnerabilities. "
                f"The most severe is '{most_severe.title}' in `{most_severe.file_path}`. "
            )
            if most_severe.cvss_score:
                summary += f"It has a CVSS score of {most_severe.cvss_score}. "
        
        summary += "Would you like me to elaborate on any of these findings?"
        
        # --- Send summary to chat service (mocked) ---
        logger.info(f"Sending summary to chat {payload.chat_id}: {summary}")
        await asyncio.sleep(1)

        return {"status": "success", "message": "Analysis complete and summary sent."}
    
    except Exception as e:
        logger.error(f"An error occurred during analysis: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred during analysis.")
    
    finally:
        # Clean up the temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)
        logger.info(f"Cleaned up temporary directory: {temp_dir}")