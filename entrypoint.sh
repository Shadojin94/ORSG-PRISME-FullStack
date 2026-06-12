#!/bin/bash
set -e

MARKER="/app/Backend/inputs/opendata/.data_ready"

# ===== PocketBase Admin Setup (BEFORE starting server) =====
if [ -f /app/pocketbase/pocketbase ]; then
    PB_ADMIN_EMAIL="${POCKETBASE_ADMIN_EMAIL:-cedric.atticot@live.fr}"
    PB_ADMIN_PASS="${POCKETBASE_ADMIN_PASSWORD:-PrismeAdmin2026!}"

    # Admin upsert strict (priorite a UPDATE pour forcer le password env).
    # 1. update -> si admin existe et password reinitialise
    # 2. create -> si admin absent
    # 3. logs TOUJOURS visibles (plus de /dev/null silencieux)
    echo "[INIT] Setup admin PocketBase (upsert) pour $PB_ADMIN_EMAIL ..."
    PB_UPDATE_OUT=$(/app/pocketbase/pocketbase admin update "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASS" --dir=/app/pb_data 2>&1) && {
        echo "[INIT] Admin password mis a jour (update): $PB_UPDATE_OUT"
    } || {
        echo "[INIT] Update impossible ($PB_UPDATE_OUT), tentative create..."
        PB_CREATE_OUT=$(/app/pocketbase/pocketbase admin create "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASS" --dir=/app/pb_data 2>&1) && \
            echo "[INIT] Admin cree: $PB_CREATE_OUT" || \
            echo "[ERROR] Admin setup failed: $PB_CREATE_OUT"
    }

    # Generate .env for Node scripts (always regenerate to match env vars)
    cat > /app/Backend/.env <<ENVEOF
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=${PB_ADMIN_EMAIL}
POCKETBASE_ADMIN_PASSWORD=${PB_ADMIN_PASS}
PB_SYSTEM_PASSWORD=${PB_SYSTEM_PASSWORD:-PrismeSystemAuth2026!}
SMTP_HOST=${SMTP_HOST:-smtp.resend.com}
SMTP_PORT=${SMTP_PORT:-465}
SMTP_USER=${SMTP_USER:-resend}
SMTP_PASS=${SMTP_PASS:-}
SMTP_FROM=${SMTP_FROM:-Data Visus <noreply@live.cercleonline.com>}
PRISME_STATE_DIR=${PRISME_STATE_DIR:-/app/Backend/state}
ENVEOF

    # Start PocketBase in background
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

    # Run setup script (idempotent — creates collections + seeds users)
    echo "[INIT] Running PocketBase setup..."
    cd /app/Backend && node setup_pocketbase.js && cd /app || echo "[WARN] PocketBase setup had issues (non-fatal)"
else
    echo "[WARN] PocketBase binary not found, skipping..."
fi

# Copy seed data (CepiDc, superficie, BAAC Guyane, SPF noyades) from image to volume if needed
if [ -d /app/Backend/_seed_data ]; then
    mkdir -p /app/Backend/inputs/opendata/cepidc /app/Backend/inputs/opendata/baac_guyane /app/Backend/inputs/opendata/spf_noyades /app/Backend/inputs/opendata/drees
    # Replicate the full cepidc tree (including nested mortalite_causes_comportementales/)
    cp -rn /app/Backend/_seed_data/cepidc/. /app/Backend/inputs/opendata/cepidc/ 2>/dev/null || true
    cp -n /app/Backend/_seed_data/superficie_communes.json /app/Backend/inputs/opendata/ 2>/dev/null || true
    cp -rn /app/Backend/_seed_data/baac_guyane/. /app/Backend/inputs/opendata/baac_guyane/ 2>/dev/null || true
    cp -rn /app/Backend/_seed_data/spf_noyades/. /app/Backend/inputs/opendata/spf_noyades/ 2>/dev/null || true
    cp -rn /app/Backend/_seed_data/drees/. /app/Backend/inputs/opendata/drees/ 2>/dev/null || true
    echo "[INIT] Seed data copied to /app/Backend/inputs/opendata (cepidc + baac_guyane + spf_noyades + drees)"
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
