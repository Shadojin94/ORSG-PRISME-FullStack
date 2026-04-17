"""
Ajuste les roles ORSG : Cedric admin, les autres expert.
Usage : POCKETBASE_URL=... POCKETBASE_ADMIN_EMAIL=... POCKETBASE_ADMIN_PASSWORD=... python set_users_roles.py
"""
import os, sys, requests

PB_URL = os.environ.get("POCKETBASE_URL", "http://localhost:8090").rstrip("/")
ADMIN_EMAIL = os.environ.get("POCKETBASE_ADMIN_EMAIL", "cedric.atticot@live.fr")
ADMIN_PASSWORD = os.environ.get("POCKETBASE_ADMIN_PASSWORD", "PrismeAdmin2026!")

# Emails qui RESTENT admin
ADMINS = {"cedric.atticot@live.fr", "marc.ravino@gmail.com"}
TARGET_ROLE_FOR_OTHERS = "expert"

def admin_token():
    for path in ("/api/collections/_superusers/auth-with-password", "/api/admins/auth-with-password"):
        try:
            r = requests.post(f"{PB_URL}{path}", json={"identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
            if r.ok:
                return r.json().get("token")
        except Exception:
            pass
    print(f"X Auth failed on {PB_URL}")
    sys.exit(1)

def list_users(token):
    items = []
    page = 1
    while True:
        r = requests.get(f"{PB_URL}/api/collections/users/records",
                         headers={"Authorization": f"Bearer {token}"},
                         params={"page": page, "perPage": 200}, timeout=20)
        r.raise_for_status()
        data = r.json()
        items.extend(data.get("items", []))
        if page >= data.get("totalPages", 1):
            break
        page += 1
    return items

def main():
    print(f"Connecting to {PB_URL}")
    token = admin_token()
    print("Auth OK.")
    users = list_users(token)
    print(f"{len(users)} user(s).")
    upd = sk = 0
    for u in users:
        email = (u.get("email") or "").lower()
        uid = u["id"]
        target = "admin" if email in ADMINS else TARGET_ROLE_FOR_OTHERS
        cur = u.get("role")
        if cur == target:
            print(f"= {email} already {target}")
            sk += 1
            continue
        r = requests.patch(f"{PB_URL}/api/collections/users/records/{uid}",
                           headers={"Authorization": f"Bearer {token}"},
                           json={"role": target}, timeout=15)
        if r.ok:
            print(f"v {email} : {cur} -> {target}")
            upd += 1
        else:
            print(f"X {email} failed: {r.status_code} {r.text[:100]}")
    print(f"\nDone. updated={upd} skipped={sk}")

if __name__ == "__main__":
    main()
