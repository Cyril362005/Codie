# This Dockerfile will be used for all services
FROM python:3.11-slim

# Set the Python path to include the root app directory.

# Download and install Diffblue Cover CLI
RUN wget https://release.diffblue.com/cli/latest -O /tmp/dcover.zip && \
    unzip /tmp/dcover.zip -d /opt/dcover && \
    rm /tmp/dcover.zip

# Add Diffblue Cover to the system's PATH
ENV PATH="/opt/dcover/bin:${PATH}"

WORKDIR /app

# Set the Python path
ENV PYTHONPATH=/app

# Copy service-specific code and requirements
COPY dynamic_testing/app ./app
COPY dynamic_testing/requirements.txt .
COPY shared/requirements.txt ./shared-requirements.txt
COPY shared/app/database ./app/database

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r shared-requirements.txt

EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]