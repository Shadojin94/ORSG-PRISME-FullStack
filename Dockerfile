# PRISME - Dockerfile for production deployment
# Architecture: Node.js (file_server.js) + Python (generate_from_opendata.py + prisme_engine.py)

FROM node:20-slim

WORKDIR /app

# Install Python 3 + curl for data downloads
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip curl && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Node.js dependencies (Backend)
COPY Backend/package.json Backend/package-lock.json ./Backend/
RUN cd Backend && npm install --production

# Copy Backend source code
COPY Backend/file_server.js ./Backend/
COPY Backend/prisme_engine.py ./Backend/
COPY Backend/generate_from_opendata.py ./Backend/
COPY Backend/download_opendata.py ./Backend/
COPY Backend/download_missing_data.py ./Backend/
COPY Backend/opendata_config.json ./Backend/
COPY Backend/themes_config.json ./Backend/
COPY Backend/csv_sources/ ./Backend/csv_sources/

# Seed data: CepiDc + superficie (not auto-downloadable)
# Stored in _seed_data so entrypoint can copy to volume
COPY Backend/inputs/opendata/cepidc/ ./Backend/_seed_data/cepidc/
COPY Backend/inputs/opendata/superficie_communes.json ./Backend/_seed_data/superficie_communes.json

# Copy Frontend build (served by file_server.js)
COPY Frontend/dist/ ./Frontend/dist/

# Create directories
RUN mkdir -p Backend/output Backend/inputs/opendata

# Entrypoint script (downloads data on first run, then starts server)
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Environment
ENV PYTHON_EXE=python3
ENV PORT=8000

# Persistent data volume (OpenData inputs survive container restarts)
VOLUME ["/app/Backend/inputs/opendata"]

# Match the port cercleonline expects
EXPOSE 8000

# Entrypoint: download missing data then start server
ENTRYPOINT ["./entrypoint.sh"]
