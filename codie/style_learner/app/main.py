import os
import shutil
import tempfile
from collections import Counter
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from tree_sitter_languages import get_parser
from git import Repo

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Style Learner Service",
    description="Analyzes code style by counting common identifiers in a repository.",
)

# --- Pydantic Models ---
class StyleInput(BaseModel):
    repo_url: HttpUrl

# --- Core Logic ---
@app.post("/api/v1/learn-style")
async def learn_style(item: StyleInput):
    repo_url = str(item.repo_url)
    temp_dir = tempfile.mkdtemp(prefix="style_learner_")
    
    try:
        # Clone the repo into the temporary directory
        print(f"Cloning repo for style analysis: {repo_url}")
        Repo.clone_from(repo_url, temp_dir)
        
        identifier_counts = Counter()
        parser = get_parser("python")

        # Walk through all Python files in the cloned repo
        for root, _, files in os.walk(temp_dir):
            for file in files:
                if file.endswith(".py"):
                    file_path = Path(root) / file
                    try:
                        source_code = file_path.read_text(encoding="utf-8")
                        tree = parser.parse(bytes(source_code, "utf8"))
                        
                        q = [tree.root_node]
                        while q:
                            node = q.pop(0)
                            if node.type == 'identifier':
                                identifier = source_code[node.start_byte:node.end_byte]
                                identifier_counts.update([identifier])
                            q.extend(node.children)
                    except Exception:
                        # Ignore files that can't be parsed
                        continue
        
        return {"top_identifiers": dict(identifier_counts.most_common(50))}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed during style analysis: {str(e)}")
    finally:
        # Clean up the temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)