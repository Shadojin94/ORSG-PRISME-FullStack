# PRISME / Data Visus — Guide de deploiement VPS

**Cible** : serveur Ubuntu 22.04+ accessible en SSH, sans Coolify / Portainer.
**Duree installation** : ~15 minutes (hors telechargement Open Data).

---

## 1. Prerequis sur le VPS

Se connecter en SSH avec un utilisateur `sudo` (ou root).

```bash
# Docker + docker compose plugin
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker

# Ajouter l'utilisateur au groupe docker (eviter sudo systematique)
sudo usermod -aG docker $USER
newgrp docker

# Verifier
docker --version
docker compose version
```

---

## 2. Cloner et configurer le projet

```bash
sudo mkdir -p /opt/prisme
sudo chown $USER:$USER /opt/prisme
cd /opt/prisme

git clone https://github.com/Shadojin94/ORSG-PRISME-FullStack.git .

# Fichier d'environnement (SMTP Resend obligatoire pour les emails OTP)
cp Backend/.env.example .env
nano .env
```

**Variables critiques a renseigner dans `.env`** :

```ini
POCKETBASE_ADMIN_EMAIL=admin@ors-guyane.org
POCKETBASE_ADMIN_PASSWORD=<mot-de-passe-fort>
PB_SYSTEM_PASSWORD=<autre-mot-de-passe-fort>

# SMTP Resend (envoi des codes OTP)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxx     # cle API Resend
SMTP_FROM=Data Visus <noreply@votre-domaine.com>
```

---

## 3. Lancer le stack

```bash
cd /opt/prisme
docker compose up -d --build

# Suivre les logs (le premier lancement telecharge ~928 Mo d'Open Data)
docker compose logs -f prisme
```

Une fois vu `file_server.js listening on :8000` → **c'est bon**.

**Verifier** :

```bash
curl http://localhost:8000/api/health
# doit retourner : {"status":"ok","version":"4.0"}
```

---

## 4. Exposer en HTTPS (reverse proxy)

Le container ecoute sur `8000`. En prod, mettre Caddy (simple) ou Nginx devant.

### Option A — Caddy (recommande, HTTPS auto Let's Encrypt)

```bash
sudo apt install -y caddy
sudo nano /etc/caddy/Caddyfile
```

```caddyfile
datavisus.ors-guyane.org {
    reverse_proxy 127.0.0.1:8000
}
```

```bash
sudo systemctl reload caddy
```

### Option B — Nginx (si deja present)

```nginx
server {
    listen 443 ssl http2;
    server_name datavisus.ors-guyane.org;
    # ... certificats SSL ...

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
}
```

Pointer le DNS `datavisus.ors-guyane.org` → IP du VPS.

---

## 5. Persistance des donnees (volumes Docker)

Le `docker-compose.yml` cree 3 volumes persistants **qui survivent aux redemarrages et aux redeploy** :

| Volume | Chemin interne | Contenu |
|--------|---------------|---------|
| `prisme_pb_data` | `/app/pb_data` | Base PocketBase (utilisateurs, tickets, codes OTP) |
| `prisme_opendata` | `/app/Backend/inputs/opendata` | Fichiers Open Data (~928 Mo INSEE/CepiDc/CAF/IRCOM) |
| `prisme_output` | `/app/Backend/output` | Rapports Excel generes par les utilisateurs |

Les inspecter :

```bash
docker volume ls | grep prisme
docker volume inspect prisme_pb_data
```

---

## 6. Operations courantes

| Action | Commande |
|--------|----------|
| Voir les logs | `docker compose logs -f prisme` |
| Redemarrer | `docker compose restart prisme` |
| Arreter | `docker compose down` |
| Mise a jour (pull + rebuild) | `git pull && docker compose up -d --build` |
| Sauvegarde PocketBase | `docker run --rm -v prisme_pb_data:/data -v $(pwd):/backup alpine tar czf /backup/pb_backup_$(date +%F).tar.gz /data` |
| Restaurer une sauvegarde | `docker run --rm -v prisme_pb_data:/data -v $(pwd):/backup alpine tar xzf /backup/pb_backup_XXXX.tar.gz -C /` |
| Sante du service | `curl http://localhost:8000/api/health` |

---

## 7. Redemarrage automatique

Le `docker-compose.yml` a deja `restart: unless-stopped`.
→ **Si le container crash ou si le VPS reboot, tout redemarre seul.**

Pour verifier que le demon Docker demarre bien au boot :

```bash
sudo systemctl is-enabled docker    # doit afficher "enabled"
```

---

## 8. Premiere connexion

1. Ouvrir `https://datavisus.ors-guyane.org` (ou `http://IP_VPS:8000` en test)
2. Se connecter avec l'admin defini dans `.env` (`POCKETBASE_ADMIN_EMAIL`)
3. Creer les comptes experts via **Admin > Utilisateurs**
4. Generer un premier ZIP (Generateur > choisir un sujet > Generer) pour valider le pipeline Python

---

## 9. Support

- **Healthcheck** : le container est flagge `unhealthy` si `/api/health` ne repond plus (`docker ps` affiche l'etat)
- **UI** : une banniere rouge "Serveur hors ligne" apparait automatiquement en haut de l'interface si le backend tombe
- **Logs** : `/opt/prisme/` > `docker compose logs -f prisme`
- **Contact technique** : Cedric Atticot / N.O.V.I. Connected

---

**Derniere mise a jour** : 2026-04-20
