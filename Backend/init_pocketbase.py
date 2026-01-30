import requests
import json
import sys

# Config
PB_URL = "http://127.0.0.1:8090"
ADMIN_EMAIL = "admin@orsg.fr"        # Default admin creds potentially used in PB
ADMIN_PASS = "OrsgAdmin2026!"        # Need to guess or ask or check .env if available. 
# The user manual or context might have these. 
# In generate_reports.py it was: ADMIN_EMAIL = os.getenv("POCKETBASE_ADMIN_EMAIL", "admin@example.com")
# ADMIN_PASSWORD = os.getenv("POCKETBASE_ADMIN_PASSWORD", "ChangeMe123!")

# Let's try the Defaults from generate_reports.py first
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASS = "ChangeMe123!"

def init_pb():
    print(f"Connecting to {PB_URL}...")
    
    # 1. Auth
    try:
        resp = requests.post(f"{PB_URL}/api/admins/auth-with-password", json={
            "identity": ADMIN_EMAIL, 
            "password": ADMIN_PASS
        })
    except Exception as e:
        print(f"Connection failed: {e}. Make sure PocketBase is running.")
        return

    if resp.status_code != 200:
        print(f"Auth failed: {resp.status_code} {resp.text}")
        print("Please ensure PocketBase is running and admin credentials are correct.")
        return

    token = resp.json()["token"]
    headers = {"Authorization": token}
    print("Auth Successful.")

    # 2. Check Collections
    required_cols = {
        "inputs": {
            "name": "inputs",
            "type": "base",
            "schema": [
                {"name": "year", "type": "number", "required": False},
                {"name": "theme", "type": "text", "required": False},
                {"name": "status", "type": "select", "options": ["pending", "processing", "processed", "error"]},
                {"name": "logs", "type": "text"},
                {"name": "file", "type": "file"}
            ]
        },
        "reports": {
            "name": "reports",
            "type": "base",
            "schema": [
                {"name": "year", "type": "number", "required": False},
                {"name": "status", "type": "text"},
                {"name": "file", "type": "file"}
            ]
        }
    }

    try:
        cols_resp = requests.get(f"{PB_URL}/api/collections", headers=headers)
        existing_cols = {c["name"]: c for c in cols_resp.json()["items"]}
    except:
        existing_cols = {}

    for col_name, schema_def in required_cols.items():
        if col_name not in existing_cols:
            print(f"Creating collection '{col_name}'...")
            try:
                r = requests.post(f"{PB_URL}/api/collections", headers=headers, json=schema_def)
                if r.status_code == 200:
                    print(f"✅ Collection '{col_name}' created.")
                else:
                    print(f"❌ Failed to create '{col_name}': {r.text}")
            except Exception as e:
                print(f"❌ Error creating '{col_name}': {e}")
        else:
            print(f"ℹ️ Collection '{col_name}' already exists.")

if __name__ == "__main__":
    init_pb()
