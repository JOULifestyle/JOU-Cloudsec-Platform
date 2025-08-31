FROM python:3.11-slim

# Set base working directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Install dependencies with retries
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt

# Copy the entire project structure
COPY . .

# ✅ Set default AWS region
ENV AWS_DEFAULT_REGION=us-east-1

# Switch to backend directory
WORKDIR /app/backend

# Run FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
