# PRISME - Dockerfile for production deployment
# Architecture: Node.js (file_server.js) + Python (prisme_engine.py)

FROM node:20-slim

WORKDIR /app

# Install Python 3 for prisme_engine.py
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Node.js dependencies (Backend)
COPY Backend/package.json ./Backend/
RUN cd Backend && npm install --production

# Copy Backend source code
COPY Backend/file_server.js ./Backend/
COPY Backend/prisme_engine.py ./Backend/
COPY Backend/themes_config.json ./Backend/
COPY Backend/csv_sources/ ./Backend/csv_sources/

# Copy Frontend build (served by file_server.js)
COPY Frontend/dist/ ./Frontend/dist/

# Create output directory
RUN mkdir -p Backend/output

# Environment: Python command for Linux
ENV PYTHON_EXE=python3

# file_server.js listens on port 3001
EXPOSE 3001

# Start the Node.js server
CMD ["node", "Backend/file_server.js"]
