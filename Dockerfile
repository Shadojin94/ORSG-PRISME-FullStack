FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .
COPY Backend/prisme_engine.py ./Backend/
COPY Backend/themes_config.json ./Backend/
COPY Backend/csv_sources/ ./Backend/csv_sources/

# Copy frontend build
COPY Frontend/dist/ ./Frontend/dist/

# Create output directories
RUN mkdir -p Backend/output Backend/temp

EXPOSE 8000

CMD ["python", "app.py"]
