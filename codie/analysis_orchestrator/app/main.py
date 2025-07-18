import os
import re
import json
import shutil
import tempfile
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
from collections import defaultdict
from dataclasses import dataclass
import logging

import websockets
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from contextlib import asynccontextmanager
import httpx
from git import Repo
import zipfile
import hashlib
import time
import requests

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Enhanced Vulnerability Dataclass ---
@dataclass
class Vulnerability:
    title: str
    severity: str
    file_path: str
    line_number: Optional[int] = None
    description: Optional[str] = None
    cvss_score: Optional[float] = None
    cve_url: Optional[str] = None

# --- Snyk API Client with CVE Enrichment ---
class SnykCodeAPI:
    def __init__(self, token: str, org_id: str, base_url: str = "https://api.snyk.io"):
        self.token = token
        self.org_id = org_id
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'token {token}', 'Content-Type': 'application/json'
        })
        self.cve_pattern = re.compile(r'CVE-\d{4}-\d{4,}', re.IGNORECASE)
        self.nvd_base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"

    def enrich_with_cve_details(self, vulnerability: Vulnerability) -> Vulnerability:
        cve_matches = self.cve_pattern.findall(vulnerability.title)
        if not cve_matches:
            return vulnerability
        
        cve_id = cve_matches[0].upper()
        logger.info(f"Enriching vulnerability with CVE data for: {cve_id}")
        
        try:
            time.sleep(6) # Respect NVD API rate limit for unauthenticated users
            response = requests.get(self.nvd_base_url, params={"cveId": cve_id}, timeout=30)
            if response.status_code == 200:
                nvd_data = response.json().get("vulnerabilities", [])
                if nvd_data:
                    metrics = nvd_data[0].get("cve", {}).get("metrics", {})
                    cvss_score = None
                    if "cvssMetricV31" in metrics:
                        cvss_score = metrics["cvssMetricV31"][0]["cvssData"]["baseScore"]
                    elif "cvssMetricV30" in metrics:
                        cvss_score = metrics["cvssMetricV30"][0]["cvssData"]["baseScore"]
                    
                    vulnerability.cvss_score = cvss_score
                    vulnerability.cve_url = f"https://nvd.nist.gov/vuln/detail/{cve_id}"
        except Exception as e:
            logger.error(f"Failed to enrich {cve_id}: {e}")
            
        return vulnerability

    def scan_directory(self, directory_path: str) -> List[Vulnerability]:
        """Complete workflow to scan a local directory. MOCKED for demonstration."""
        logger.info(f"Starting Snyk scan of directory: {directory_path}")
        # In a real implementation, this would call the Snyk API.
        # Here we return mock data to demonstrate the CVE enrichment.
        demo_vulnerabilities = [
            Vulnerability(title="Remote Code Execution via deserialization (CVE-2023-12345)", severity="critical", file_path="src/utils/file_processor.py", line_number=78),
            Vulnerability(title="Hardcoded Secret", severity="high", file_path="src/config.py", line_number=15)
        ]
        
        enriched_vulnerabilities = [self.enrich_with_cve_details(v) for v in demo_vulnerabilities]
        logger.info(f"Scan completed. Found {len(enriched_vulnerabilities)} vulnerabilities.")
        return enriched_vulnerabilities

# --- FastAPI App and other setup ---
from shared.app.database.database import engine
from shared.app.database import models

REPO_ANALYSIS_URL = os.getenv("REPO_ANALYSIS_URL", "http://repo_analysis:8000/api/v1/parse")
# ... (rest of the environment variables)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ... (lifespan logic)

# ... (Pydantic Models)

app = FastAPI(title="Analysis Orchestrator", version="1.0.0", lifespan=lifespan)

# ... (helper functions like create_test_script and send_summary_to_chat)

@app.post("/start-analysis", response_model=StatusResponse)
async def start_analysis(payload: AnalysisPayload):
    # ... (setup logic)
    snyk_token = os.getenv("SNYK_TOKEN")
    snyk_org_id = os.getenv("SNYK_ORG_ID")

    if not snyk_token or not snyk_org_id:
        raise HTTPException(status_code=500, detail="SNYK_TOKEN and SNYK_ORG_ID must be set.")

    try:
        # --- Git Analysis, Static Analysis, etc. ---
        # ... (all previous analysis logic remains here)
        
        # --- Snyk Vulnerability Scanning with CVE Enrichment ---
        snyk_api = SnykCodeAPI(token=snyk_token, org_id=snyk_org_id)
        vulnerabilities = await asyncio.to_thread(snyk_api.scan_directory, temp_dir)
        
        critical_vulns = [v for v in vulnerabilities if v.severity == 'critical']
        
        # --- Synthesize and Send Final Chat Summary ---
        summary = "I've finished analyzing your project. "
        # ... (refactor score summary logic)

        if critical_vulns:
            most_severe = critical_vulns[0]
            summary += (
                f"My security scan found {len(critical_vulns)} critical vulnerabilities. "
                f"The most severe is '{most_severe.title}' in `{most_severe.file_path}`. "
            )
            if most_severe.cvss_score:
                summary += f"It has a CVSS score of {most_severe.cvss_score}. "
        
        summary += "Would you like to discuss these findings?"
        
        await send_summary_to_chat(summary)

        return {"status": "success", "message": "Analysis complete."}
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)