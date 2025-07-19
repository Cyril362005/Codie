FROM python:3.11-slim

WORKDIR /app

# Copy service-specific code and requirements
COPY monitoring_service/app ./app
COPY monitoring_service/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 