# This Dockerfile will be used for all services
FROM python:3.11-slim

# Install git, Java for Diffblue, Maven, and other tools
RUN apt-get update && apt-get install -y \
    git \
    openjdk-17-jdk \
    maven \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

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
COPY ./app ./app
COPY ./requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]