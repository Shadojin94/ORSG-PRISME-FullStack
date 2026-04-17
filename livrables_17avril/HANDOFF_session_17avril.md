# Handoff — Session PRISME / ORSG du 17 avril 2026

> Document de reprise pour continuer sur une nouvelle session Claude Code.
> Commit de référence : **`3f98191`** sur `main` — tout est poussé.

---

## Contexte client

- Projet : **PRISME / Data Visus** — plateforme d'automatisation Excel pour Geoclip (ORSG-CTPS Guyane)
- Prestataire MVP : **N.O.V.I. Connected** (BDC N250219 — 10 000 € HT — entièrement payé)
- Consultant : **Cédric ATTICOT DIT RAVINO** — Architecte Digital, partenaire N.O.V.I. (pas fondateur, pas d'email @novi-connected)
- Prod : https://orsgdemo.console.cercleonline.com/ — Coolify auto-deploy depuis `main`
- Repo (privé) : github.com/Shadojin94/ORSG-PRISME-FullStack

### Interlocuteurs ORSG (ordre d'importance pour la relation commerciale)
1. **Dr. Marie-Josiane CASTOR** — Directrice, décisionnaire principale (m-j.castor@ors-guyane.org)
2. Naïssa CHATEAU REMY — Chargée d'études (naissa.chateau@ors-guyane.org)
3. Jessy PAJOT
4. Manuella IMOUNGA-DESROZIERS
5. Marie-Thérèse DANIEL (en CC)

---

## Commits de la session (tous sur `origin/main`)

| Hash | Sujet |
|---|---|
| `b59880c` | Corrections post-livraison : breadcrumb suicide, filtrage taux UI, thématiques cliquables |
| `490d7e6` | Filtre `tx_*` au niveau génération Excel backend + sources Open Data Traumatismes |
| `7299a26` | AdminUsersPage production-ready + fix `/auth/set-password` |
| `abc289a` | UI expose les années Open Data (fallback catalogue) |
| `dee830f` | Audit Open Data — 25 datasets OK |
| `8715775` | BAAC Guyane filtré (1,4 Mo) + SPF noyades commités |
| `f11b119` | Dockerfile/entrypoint seed les nouvelles données au volume |
| `a02cb80` | Alias thèmes `accidents_route` / `blesses_route` / `deces_route` |
| `62db0e1` | setup_pocketbase.js persiste rule admin + `/auth/create-user` envoie email |
| `3f98191` | **Pathologies MOCA-O 2018-2023 — 13/17 indicateurs** |

---

## Ce qui est LIVRÉ et FONCTIONNEL en prod

### Gestion des utilisateurs (production-ready)
- PocketBase rule : `@request.auth.id = id || @request.auth.role = "admin"` (persistée via `setup_pocketbase.js`)
- Admins peuvent : modifier profil (nom, tél, dept, org), toggler OTP, changer statut, changer rôle, réinitialiser mot de passe par email, supprimer compte
- `/auth/create-user` envoie un email avec mot de passe temporaire à la création
- ProfilePage : utilisateur peut changer son mot de passe personnel
- Bug `/auth/set-password` corrigé : écrit désormais `personal_password_hash` (champ lu par login)

### Rôles actuels sur prod
- `cedric.atticot@live.fr` : admin
- `marc.ravino@gmail.com` : admin
- Les 4 comptes ORSG (Dr. Castor, Naïssa, Jessy, Manuella) : expert
- Script de gestion : `Backend/set_users_roles.py` (idempotent)

### Génération Excel — filtre taux
- Les variables `tx_*` sont exclues de TOUS les Excel générés (moteur + open data)
- Cf. demande client Naïssa 7 avril : PRISME recalcule les taux, outil ne fournit que le brut

### Données Open Data disponibles en génération live
- **Accidents de la route** (BAAC 2019-2024) — filtré Guyane 973
- **Noyades SPF** (2003-2021, enquêtes triennales Odissé)
- **Suicide / alcool / tabac** (CépiDc/Odissé 2019-2023)
- **Mortalité générale et pathologies CépiDc** (2015-2023)
- **Éducation / Allocataires / Revenu / Ménages / Familles / Densité / Pop** (INSEE/CAF/IRCOM)
- **25 datasets OK** au total — cf. `Backend/AUDIT_OPENDATA_17AVRIL.md`

### Pathologies MOCA-O (commit 3f98191)
- Source : `Moca O_mortalite_patho_2018_2023 (1).xls` fourni par Naïssa
- CSV consolidé : `Backend/csv_sources/Mortalite_Patho_GF_2018_2023.csv` (3 192 lignes)
- Script de régénération : `Backend/build_pathologies_csv.py` (idempotent)
- **Années disponibles : 2018-2023** sur ces 7 thèmes :
  - `mortalite_cardio` : m_hta, m_avc, M_Cardiopath_isch
  - `mortalite_respi` : M_Maladies_Respi, m_asthme
  - `mortalite_neuro` : m_alzheimer, m_parkinson
  - `mortalite_digestif` : m_foie
  - `mortalite_diabete` : m_diabete
  - `mortalite_vih` : m_sida
  - `mortalite_tumeurs` : m_kc_poumon, m_kc_sein, m_kc_colon, m_kc_prostate
- Tests validés en prod : `mortalite_cardio_2022.zip` / `mortalite_tumeurs_2023.zip` / `mortalite_neuro_2022.zip`
- Note : valeurs commune souvent vides (secret statistique MOCA -999 exclu — limite source)

---

## Livrables réunion 17 avril (dossier `livrables_17avril/`)

- `PRISME_ORSG_Point_17avril2026.pptx` — 14 slides, audience non technique, Dr. Castor en tête, roadmap 30 avril, tarifs Cédric direct
- `RECAP_17avril2026.html` — récap 2 onglets (ORSG / technique), charte ORSG, tarifs alignés
- `INVENTAIRE_OpenData_17avril2026.md` — inventaire sources Open Data avec tableau de complétude
- `build_pptx.js` — script de regénération du PPTX

### Tarifs post-MVP proposés (facturés par Cédric en direct)
- **Déploiement VM ORSG + VPN** : forfait **6 500 € HT** (5 j ouvrés, négociable)
- **Maintenance annuelle** :
  - Essentielle : 3 600 € HT/an (300 €/mois)
  - Standard (recommandée) : 7 200 € HT/an (600 €/mois)
  - Étendue : 14 400 € HT/an (1 200 €/mois)
- **Support à la carte** : TJM 950 € HT/jour, pack 10h prépayé 1 100 € HT
- **Geste offert hors BDC** : ~25 000 € HT de travail supplémentaire (app full-stack, 2FA, gestion users, pipeline Open Data, doc complète)

---

## Reste à faire (ordre recommandé)

1. **Fichier MOCA complémentaire** à demander à Naïssa pour les 3 pathologies manquantes :
   - `m_bpco` — BPCO
   - `M_Insuff_Cardiaque` — Insuffisance cardiaque
   - `M_Trouble_Ment` — Troubles mentaux
   > Le parser est en place, il suffit d'ajouter le CSV dans `Backend/csv_sources/` et d'ajouter les variables dans `themes_config.json`.

2. **Noyades 2022-2024** : SPF publie des bilans PDF mais pas de CSV direct. ORSG peut fournir un fichier MOCA noyades au format standard.

3. **Recette formelle** : Dr. Castor + Naïssa + Cédric, semaine du 21 avril.

4. **Déploiement VM ORSG** : attente fourniture VM par leur prestataire technique (semaine du 28 avril).

5. **Clôture officielle** : 30 avril.

6. **Formation utilisateurs** : dispo à partir du **4 mai**, tous jours ouvrés **sauf mercredis**. 3 créneaux proposés dans le PPTX.

7. **Contractualisation maintenance** : à discuter avec Dr. Castor après recette.

---

## Pointeurs techniques utiles pour reprendre

| Fichier | Rôle |
|---|---|
| `Backend/prisme_engine.py` | Moteur MOCA-O (filtre `tx_*` appliqué) |
| `Backend/generate_from_opendata.py` | Moteur Open Data (filtre `tx_*` + fallback `baac_guyane/`) |
| `Backend/themes_config.json` | Config 19+ datasets |
| `Backend/opendata_config.json` | 8 sources Open Data (v1.1) |
| `Backend/file_server.js` | API REST 18+ endpoints |
| `Backend/setup_pocketbase.js` | Initialisation PB (rules, users seed) — s'exécute au boot du conteneur |
| `Backend/set_users_roles.py` | Utilitaire rôles en masse |
| `Backend/build_pathologies_csv.py` | Regénération CSV pathologies depuis xls |
| `Backend/AUDIT_OPENDATA_17AVRIL.md` | Matrice datasets OK/KO |
| `entrypoint.sh` | Seed des données vers volume persistant |
| `Dockerfile` | Build prod (Node + Python + PocketBase) |

### Comptes et URLs
- Prod : https://orsgdemo.console.cercleonline.com
- PB prod admin : `cedric.atticot@live.fr` / `PrismeAdmin2026!` via `/pb/api/admins/auth-with-password`
- Python local : `c:/Users/chad9/AppData/Local/Programs/Python/Python313/python.exe`

### Paramètres API à connaître (pièges rencontrés)
- `/generate` attend `?theme=X&year=Y` (PAS `dataset_id`)
- `/generate-opendata` attend `?theme=X&year=Y` (PAS body JSON)
- `/available-years?dataset=X` — param `dataset` (pas `theme`)
- `/available-years-opendata?dataset=X` — idem

---

## État Zetamind

- Memoire Qdrant : rien stocké automatiquement pour cette session (à faire en début de prochaine session si besoin, cf skill `zeta-context`)
- Wiki Obsidian : page `wiki/sources/2026-04-11 — Contexte ORSG PRISME` existe mais n'a pas été mise à jour avec le 17 avril
- Vault PC : `C:\Users\chad9\Documents\00O - Obsidian\Zetamind`
- Vault VPS : `/root/zetamind-vault` via `zeta-obs`

Pour reprendre propre, au début de la prochaine session :
```
zeta-obs read wiki/sources/2026-04-11\ —\ Contexte\ ORSG\ PRISME.md
cat livrables_17avril/HANDOFF_session_17avril.md  # ce document
```

---

*Document généré en fin de session, 17 avril 2026 — Cédric ATTICOT DIT RAVINO.*
