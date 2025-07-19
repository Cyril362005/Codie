# This Dockerfile will be used for all services
FROM python:3.11-slim

# Install git, which is needed by the GitPython library
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set the Python path to include the root app directory.
ENV PYTHONPATH=/app

# Copy service-specific code and requirements
COPY style_learner/app ./app
COPY style_learner/requirements.txt .
COPY shared/requirements.txt ./shared-requirements.txt
COPY shared/app/database ./app/database

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r shared-requirements.txt

EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]