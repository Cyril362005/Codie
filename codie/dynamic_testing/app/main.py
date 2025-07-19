import os
import tempfile
import time
import docker
import subprocess
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# --- Pydantic Models ---
class CodeToExecute(BaseModel):
    code: str

class JavaCodePayload(BaseModel):
    java_code: str

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Dynamic Testing Service",
    description="Executes Python code and generates Java unit tests."
)

# --- Docker Client (for Python execution) ---
try:
    docker_client = docker.from_env()
except docker.errors.DockerException:
    print("ERROR: Docker is not running or accessible for Python execution.")
    docker_client = None

# --- Python Code Execution Endpoint ---
@app.post("/api/v1/execute")
async def execute_python_code(payload: CodeToExecute):
    if not docker_client:
        raise HTTPException(status_code=503, detail="Docker service is unavailable.")

    with tempfile.NamedTemporaryFile(mode='w+', suffix='.py', delete=False) as temp_script:
        temp_script_path = temp_script.name
        temp_script.write(payload.code)

    container = None
    try:
        start_time = time.time()
        container = docker_client.containers.run(
            image='python:3.11-slim',
            command=f"python /app/script.py",
            volumes={temp_script_path: {'bind': '/app/script.py', 'mode': 'ro'}},
            detach=True,
            remove=False
        )
        peak_memory_bytes = 0
        for stat in container.stats(stream=True, decode=True):
            if 'memory_stats' in stat and 'usage' in stat['memory_stats']:
                peak_memory_bytes = max(peak_memory_bytes, stat['memory_stats']['usage'])
        
        result = container.wait()
        end_time = time.time()
        execution_duration = round(end_time - start_time, 4)
        output = container.logs().decode('utf-8')
        peak_memory_mb = round(peak_memory_bytes / (1024 * 1024), 4)
        
        if result['StatusCode'] != 0:
             raise HTTPException(status_code=400, detail=f"Code execution failed:\n{output}")

        return {
            "output": output,
            "execution_duration": execution_duration,
            "peak_memory_mb": peak_memory_mb
        }
    finally:
        if container:
            container.remove(force=True)
        if os.path.exists(temp_script_path):
            os.remove(temp_script_path)

# --- Java Test Generation Endpoint ---
@app.post("/api/v1/generate-java-test")
def generate_java_test(payload: JavaCodePayload):
    with tempfile.TemporaryDirectory() as temp_dir:
        # 1. Create a temporary Maven project structure
        project_path = os.path.join(temp_dir, "test-project")
        src_path = os.path.join(project_path, "src", "main", "java", "com", "example")
        os.makedirs(src_path, exist_ok=True)
        
        # 2. Write the user's Java code to a file
        java_file_path = os.path.join(src_path, "MyClass.java")
        with open(java_file_path, "w") as f:
            f.write(payload.java_code)
            
        # 3. Create a pom.xml for Diffblue to use
        pom_content = """
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>temp-test</artifactId>
    <version>1.0</version>
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>
</project>
"""
        with open(os.path.join(project_path, "pom.xml"), "w") as f:
            f.write(pom_content)
            
        # 4. Run Diffblue Cover using subprocess
        try:
            print(f"Running Diffblue Cover on temporary project in {project_path}")
            # The command needs to be run from within the project directory
            subprocess.run(
                ['dcover', 'create', '--maven', 'com.example.MyClass'],
                cwd=project_path,
                check=True,
                capture_output=True,
                text=True
            )
        except subprocess.CalledProcessError as e:
            # If dcover fails, return its error output for debugging
            raise HTTPException(status_code=500, detail=f"Diffblue Cover failed: {e.stderr}")

        # 5. Read and return the generated test file
        test_file_path = os.path.join(project_path, "src", "test", "java", "com", "example", "MyClassTest.java")
        if os.path.exists(test_file_path):
            with open(test_file_path, "r") as f:
                return {"generated_test_code": f.read()}
        else:
            raise HTTPException(status_code=404, detail="Diffblue Cover ran but did not generate a test file.")

@app.get("/")
def health_check():
    return {"message": "Dynamic Testing Service is running"}


    