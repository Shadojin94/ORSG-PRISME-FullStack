#!/bin/bash
set -e

MARKER="/app/Backend/inputs/opendata/.data_ready"

# ===== Start PocketBase in background =====
if [ -f /app/pocketbase/pocketbase ]; then
    echo "[INIT] Starting PocketBase..."
    /app/pocketbase/pocketbase serve --http=0.0.0.0:8090 --dir=/app/pb_data --migrationsDir=/app/Backend/pb_migrations &
    PB_PID=$!
    # Wait for PocketBase to be ready
    for i in $(seq 1 30); do
        if curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
            echo "[INIT] PocketBase ready (PID $PB_PID)"
            break
        fi
        sleep 1
    done

    # Create admin account if it doesn't exist yet (first deploy)
    PB_ADMIN_EMAIL="${POCKETBASE_ADMIN_EMAIL:-cedric.atticot@live.fr}"
    PB_ADMIN_PASS="${POCKETBASE_ADMIN_PASSWORD:-PrismeAdmin2026!}"
    /app/pocketbase/pocketbase admin create "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASS" --dir=/app/pb_data 2>/dev/null && \
        echo "[INIT] Admin $PB_ADMIN_EMAIL created" || \
        echo "[INIT] Admin $PB_ADMIN_EMAIL already exists"

    # Generate .env for setup script if not present
    if [ ! -f /app/Backend/.env ]; then
        cat > /app/Backend/.env <<ENVEOF
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=${PB_ADMIN_EMAIL}
POCKETBASE_ADMIN_PASSWORD=${PB_ADMIN_PASS}
PB_SYSTEM_PASSWORD=${PB_SYSTEM_PASSWORD:-PrismeSystemAuth2026!}
ENVEOF
    fi

    # Run setup script (idempotent — safe to re-run)
    echo "[INIT] Running PocketBase setup..."
    cd /app/Backend && node setup_pocketbase.js && cd /app || echo "[WARN] PocketBase setup had issues (non-fatal)"
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
