# PRISME / Data Visus — Déploiement Ubuntu

Guide d'installation autonome pour serveur Ubuntu 22.04 / 24.04 LTS (sans Coolify).

## 1. Prérequis serveur

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Docker + Compose
sudo apt install -y docker.io docker-compose-plugin git curl

# Démarrage Docker
sudo systemctl enable --now docker

# Vérification
docker --version        # >= 24.0
docker compose version  # >= 2.20
```

## 2. Récupération du code

```bash
cd /opt
sudo git clone https://github.com/Shadojin94/ORSG-PRISME-FullStack.git prisme
cd prisme
```

## 3. Configuration — fichier `.env` racine (optionnel)

Le `docker-compose.yml` fournit des valeurs par défaut. Si vous voulez personnaliser :

```bash
sudo nano .env
```

```ini
# Admin PocketBase (backoffice technique)
POCKETBASE_ADMIN_EMAIL=admin@orsg.fr
POCKETBASE_ADMIN_PASSWORD=ChangeMeSecure2026!

# Mot de passe système interne (ne pas diffuser)
PB_SYSTEM_PASSWORD=PrismeSystemAuth2026!

# SMTP (optionnel — sans SMTP, les codes OTP s'affichent en console)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=
SMTP_FROM=Data Visus <noreply@votre-domaine.fr>
```

## 4. Premier démarrage

```bash
sudo docker compose up -d --build
```

Le build prend 3-5 minutes (image Node + Python + PocketBase + données Open Data ~928 Mo).

**Suivre les logs d'initialisation** :

```bash
sudo docker compose logs -f prisme
```

Attendre les messages :
- `[INIT] Admin password mis a jour (update)`
- `[SETUP] Admin authentifie`
- `[INIT] Seed data copied`
- `[START] Starting PRISME File Server...`

## 5. Accès à l'application

- **Application web** : `http://IP_DU_SERVEUR:8000`
- **Backoffice PocketBase** : `http://IP_DU_SERVEUR:8000/pb/_/`
- **Health check** : `http://IP_DU_SERVEUR:8000/api/health`

## 6. Comptes pré-créés (mot de passe initial : `Prisme2026!`)

| Email | Rôle |
|---|---|
| naissa.chateau@ors-guyane.org | admin |
| cedric.atticot@live.fr | admin |
| m-j.castor@ors-guyane.org | expert |
| jessy.pajot@ors-guyane.org | expert |
| m.imounga-desroziers@ors-guyane.org | expert |

**Chaque utilisateur doit changer son mot de passe à la première connexion** (menu profil).

## 7. Reverse proxy HTTPS (recommandé production)

Avec Caddy (plus simple) :

```bash
sudo apt install -y caddy
sudo nano /etc/caddy/Caddyfile
```

```
prisme.orsg.fr {
    reverse_proxy 127.0.0.1:8000
}
```

```bash
sudo systemctl reload caddy
```

Caddy gère Let's Encrypt automatiquement.

## 8. Persistance — volumes Docker

3 volumes nommés préservent les données :

| Volume | Contenu | Taille typique |
|---|---|---|
| `prisme_pb_data` | Utilisateurs, sessions, tickets support | ~5 Mo |
| `prisme_opendata` | Open Data INSEE/CAF/CepiDc/BAAC/noyades | ~1 Go |
| `prisme_output` | Fichiers Excel générés par les utilisateurs | variable |

**Sauvegarder** :

```bash
sudo docker run --rm -v prisme_pb_data:/data -v /backup:/backup alpine \
    tar czf /backup/pb_data_$(date +%Y%m%d).tar.gz -C /data .
```

**Restaurer** :

```bash
sudo docker run --rm -v prisme_pb_data:/data -v /backup:/backup alpine \
    tar xzf /backup/pb_data_YYYYMMDD.tar.gz -C /data
```

## 9. Maintenance courante

**Mise à jour du code** :

```bash
cd /opt/prisme
sudo git pull
sudo docker compose up -d --build
```

**Redémarrage** :

```bash
sudo docker compose restart prisme
```

**Arrêt** :

```bash
sudo docker compose down
```

**Consulter les logs** :

```bash
sudo docker compose logs --tail 200 prisme
```

## 10. Dépannage

### Login impossible / "mode dev — SMTP non configuré"

- Cause : `SMTP_PASS` vide dans `.env` → les codes OTP s'affichent dans la console Docker
- Solution : soit configurer SMTP, soit utiliser le flux "mot de passe" (bouton "J'ai déjà un mot de passe" sur la page login)

### Volume `prisme_pb_data` vide après migration

Si vous migrez depuis un volume anonyme existant :

```bash
# Stopper le conteneur
sudo docker compose down

# Copier données anciennes vers le nouveau volume nommé
sudo docker run --rm \
  -v OLD_VOLUME_NAME:/source \
  -v prisme_pb_data:/dest \
  alpine sh -c "cp -a /source/. /dest/"

# Redémarrer
sudo docker compose up -d
```

### PocketBase inaccessible

```bash
# Diagnostic
curl http://localhost:8000/pb-diag

# Attendu: {"pb_admin_ready":true,"pb_auth_valid":true}
```

Si `pb_admin_ready: false` : les variables `POCKETBASE_ADMIN_EMAIL` et `POCKETBASE_ADMIN_PASSWORD` du `.env` ne correspondent pas à l'admin actuel dans le volume. Solution :

```bash
# Forcer reset du mot de passe admin
sudo docker compose exec prisme /app/pocketbase/pocketbase admin update \
    "$POCKETBASE_ADMIN_EMAIL" "$POCKETBASE_ADMIN_PASSWORD" --dir=/app/pb_data
sudo docker compose restart prisme
```

## 11. Ports et firewall

Ouvrir uniquement le port 8000 (ou 443 derrière Caddy) :

```bash
sudo ufw allow 22/tcp       # SSH
sudo ufw allow 443/tcp      # HTTPS (Caddy)
# sudo ufw allow 8000/tcp   # direct (dev uniquement)
sudo ufw enable
```

## 12. Contact

- **Support technique initial** : Cédric Atticot — cedric.atticot@live.fr
- **Référent métier** : Naïssa Chateau Remy — naissa.chateau@ors-guyane.org
- **Code source** : github.com/Shadojin94/ORSG-PRISME-FullStack
