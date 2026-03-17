#!/bin/bash
set -e

MARKER="/app/Backend/inputs/opendata/.data_ready"

# ===== Start PocketBase in background =====
if [ -f /app/pocketbase/pocketbase ]; then
    echo "[INIT] Starting PocketBase..."
    /app/pocketbase/pocketbase serve --http=0.0.0.0:8090 --dir=/app/pb_data &
    PB_PID=$!
    # Wait for PocketBase to be ready
    for i in $(seq 1 30); do
        if curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
            echo "[INIT] PocketBase ready (PID $PB_PID)"
            break
        fi
        sleep 1
    done
else
    echo "[WARN] PocketBase binary not found, skipping..."
fi

# Copy seed data (CepiDc, superficie) from image to volume if needed
if [ -d /app/Backend/_seed_data ]; then
    mkdir -p /app/Backend/inputs/opendata/cepidc
    cp -n /app/Backend/_seed_data/cepidc/* /app/Backend/inputs/opendata/cepidc/ 2>/dev/null || true
    cp -n /app/Backend/_seed_data/superficie_communes.json /app/Backend/inputs/opendata/ 2>/dev/null || true
fi

# Download missing data on first run
if [ ! -f "$MARKER" ]; then
    echo "[INIT] First run - downloading Open Data sources..."
    python3 /app/Backend/download_missing_data.py || echo "[WARN] Some data downloads failed (non-fatal)"
    touch "$MARKER"
else
    echo "[INIT] Data already downloaded."
fi

echo "[START] Starting PRISME File Server..."
exec node Backend/file_server.js
