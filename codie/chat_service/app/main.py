import os
import re
import asyncio
import math
import statistics
from typing import Dict, List, Any, Literal

import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel, HttpUrl

# --- FastAPI App Initialization ---
app = FastAPI(title="Codie Chat Service - Final Version")

# --- Environment Variables & API Clients ---
HF_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
# ... (other service URLs)

if not HF_API_TOKEN:
    raise RuntimeError("Missing HUGGINGFACE_API_TOKEN environment variable.")

headers = {"Authorization": f"Bearer {HF_API_TOKEN}", "Content-Type": "application/json"}
client_history: Dict[str, List[Dict[str, str]]] = {}
CONFIDENCE_THRESHOLD = 0.5 # Filter responses with less than 50% average confidence

# --- Pydantic Models ---
class TestGenRequest(BaseModel):
    language: Literal["python", "javascript"]
    code: str

# --- AI & Prompting Logic with Confidence Scoring ---
async def fetch_ai_response_with_filtering(prompt: str, max_tokens: int = 400) -> str:
    """
    Fetches AI response and filters it based on a confidence score derived from log probabilities.
    """
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": max_tokens,
            "do_sample": True,
            "return_full_text": False,
            "details": True  # Request detailed token information
        }
    }
    async with httpx.AsyncClient(timeout=90.0) as client:
        try:
            response = await client.post(HF_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

            generated_text = data[0].get("generated_text", "")
            details = data[0].get("details", {})
            tokens = details.get("tokens", [])

            # Calculate confidence score if token probabilities are available
            if tokens:
                logprobs = [tok.get("logprob") for tok in tokens if tok.get("logprob") is not None]
                if logprobs:
                    probabilities = [math.exp(lp) for lp in logprobs]
                    average_confidence = statistics.mean(probabilities)
                    
                    print(f"AI Response Confidence: {average_confidence:.2f}")
                    
                    if average_confidence < CONFIDENCE_THRESHOLD:
                        return "I have a suggestion, but I'm not confident enough in its quality. Would you like me to elaborate anyway?"
            
            return generated_text.strip()

        except Exception as e:
            return f"Sorry, an error occurred while contacting the AI model: {e}"

# --- WebSocket Endpoint ---
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    client_history.setdefault(client_id, [])
    try:
        while True:
            message = await websocket.receive_text()
            # ... (WebSocket logic remains the same, but now calls the new function)
            ai_reply = await fetch_ai_response_with_filtering(message)
            await websocket.send_text(ai_reply)
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected.")

# --- AI Unit Test Generation Endpoint ---
@app.post("/api/v1/generate-test")
async def generate_test(request: TestGenRequest):
    # ... (Prompt engineering logic remains the same)
    prompt = f"Generate a unit test for the following {request.language} code..."
    
    # This endpoint now benefits from confidence filtering
    ai_response = await fetch_ai_response_with_filtering(prompt, max_tokens=1024)

    # ... (Response parsing logic remains the same)
    match = re.search(r"```(?:\w+)?\n(.*?)```", ai_response, re.DOTALL)
    test_code = match.group(1).strip() if match else "Could not extract test code from AI response."
    
    return {"generated_test_code": test_code}

@app.get("/")
def health_check():
    return {"message": "Chat Service is running"}