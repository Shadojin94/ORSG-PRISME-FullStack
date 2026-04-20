# PRISME - Dockerfile for production deployment
# Architecture: Node.js (file_server.js) + Python (generate_from_opendata.py + prisme_engine.py) + PocketBase

FROM node:20-slim

WORKDIR /app

# Install Python 3 + curl + unzip for data downloads and PocketBase
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip curl unzip && \
    rm -rf /var/lib/apt/lists/*

# Download PocketBase (Linux AMD64)
ARG PB_VERSION=0.22.27
RUN curl -fsSL "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    -o /tmp/pocketbase.zip && \
    unzip /tmp/pocketbase.zip -d /app/pocketbase && \
    chmod +x /app/pocketbase/pocketbase && \
    rm /tmp/pocketbase.zip

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
COPY Backend/generate_mocao_consolidated.py ./Backend/
COPY Backend/csv_reader.py ./Backend/
COPY Backend/download_opendata.py ./Backend/
COPY Backend/download_missing_data.py ./Backend/
COPY Backend/opendata_config.json ./Backend/
COPY Backend/themes_config.json ./Backend/
COPY Backend/csv_sources/ ./Backend/csv_sources/
COPY Backend/setup_pocketbase.js ./Backend/
COPY Backend/pb_migrations/ ./Backend/pb_migrations/
COPY Backend/.env.example ./Backend/.env.example

# Seed data: CepiDc + superficie + BAAC Guyane + SPF noyades (not auto-downloadable)
# Stored in _seed_data so entrypoint can copy to volume
COPY Backend/inputs/opendata/cepidc/ ./Backend/_seed_data/cepidc/
COPY Backend/inputs/opendata/superficie_communes.json ./Backend/_seed_data/superficie_communes.json
COPY Backend/inputs/opendata/baac_guyane/ ./Backend/_seed_data/baac_guyane/
COPY Backend/inputs/opendata/spf_noyades/ ./Backend/_seed_data/spf_noyades/

# Copy Frontend build (served by file_server.js)
COPY Frontend/dist/ ./Frontend/dist/

# Create directories
RUN mkdir -p Backend/output Backend/inputs/opendata pb_data

# Entrypoint script (starts PocketBase + downloads data + starts server)
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Environment
ENV PYTHON_EXE=python3
ENV PORT=8000
ENV POCKETBASE_URL=http://127.0.0.1:8090

# Volumes persistants : Open Data (~928 Mo), base PocketBase (users/sessions),
# et rapports Excel generes par les utilisateurs (doivent survivre aux redeploys).
VOLUME ["/app/Backend/inputs/opendata", "/app/pb_data", "/app/Backend/output"]

# Match the port cercleonline expects
EXPOSE 8000

# Entrypoint: start PocketBase + download missing data + start server
ENTRYPOINT ["./entrypoint.sh"]
