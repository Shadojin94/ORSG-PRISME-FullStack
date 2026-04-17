"""
set_all_admin.py
----------------
Met le champ `role` a "admin" pour tous les users de la collection `users`
dans la PocketBase locale.

Usage:
    python set_all_admin.py
"""

import os
import sys
import requests

# --- Load .env if present (simple parser, no external dep) ---
ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
if os.path.isfile(ENV_PATH):
    with open(ENV_PATH, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())

PB_URL = os.environ.get("POCKETBASE_URL", "http://localhost:8090").rstrip("/")
ADMIN_EMAIL = os.environ.get("POCKETBASE_ADMIN_EMAIL", "cedric.atticot@live.fr")
ADMIN_PASS = os.environ.get("POCKETBASE_ADMIN_PASSWORD", "PrismeAdmin2026!")


def _auth_admin():
    """Authenticate as PocketBase admin, return auth token."""
    # PB >= 0.23 uses _superusers; older uses admins. Try new first, fallback.
    for path in ("/api/collections/_superusers/auth-with-password",
                 "/api/admins/auth-with-password"):
        try:
            r = requests.post(f"{PB_URL}{path}", json={
                "identity": ADMIN_EMAIL,
                "password": ADMIN_PASS,
            }, timeout=10)
            if r.status_code == 200:
                return r.json()["token"]
        except requests.RequestException as e:
            print(f"! Connection error on {path}: {e}")
            continue
    print(f"X Admin auth failed on {PB_URL} with {ADMIN_EMAIL}")
    sys.exit(1)


def _list_all_users(headers):
    """Return every record from the `users` collection, paginated."""
    users = []
    page = 1
    while True:
        r = requests.get(
            f"{PB_URL}/api/collections/users/records",
            headers=headers,
            params={"page": page, "perPage": 200},
            timeout=15,
        )
        if r.status_code != 200:
            print(f"X Failed to list users page {page}: {r.status_code} {r.text}")
            sys.exit(1)
        data = r.json()
        users.extend(data.get("items", []))
        if page >= data.get("totalPages", 1):
            break
        page += 1
    return users


def main():
    print(f"Connecting to {PB_URL} as {ADMIN_EMAIL}...")
    token = _auth_admin()
    headers = {"Authorization": token}
    print("Auth OK.")

    users = _list_all_users(headers)
    print(f"Found {len(users)} user(s).")

    ok, skip, err = 0, 0, 0
    for u in users:
        uid = u.get("id")
        email = u.get("email", "?")
        current_role = u.get("role")
        if current_role == "admin":
            print(f"= {email} already admin")
            skip += 1
            continue
        r = requests.patch(
            f"{PB_URL}/api/collections/users/records/{uid}",
            headers=headers,
            json={"role": "admin"},
            timeout=10,
        )
        if r.status_code == 200:
            print(f"v {email} -> admin")
            ok += 1
        else:
            print(f"X {email} failed: {r.status_code} {r.text}")
            err += 1

    print(f"\nDone. updated={ok} already={skip} errors={err}")


if __name__ == "__main__":
    main()
