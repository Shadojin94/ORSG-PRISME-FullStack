# BILAN COMPLET DU PROJET PRISME / DATA VISUS

## Cadre contractuel

| Élément | Détail |
|---------|--------|
| **Client** | ORSG-CTPS (Observatoire Régional de Santé de Guyane) |
| **Contact client** | Naissa CHATEAU REMY (naissa.chateau@ors-guyane.org) |
| **Prestataire** | Cedric ATTICOT / N.O.V.I. Connected |
| **Bon de commande** | N250219 du 25/11/2025 — 10 000 EUR HT |
| **Acompte versé** | 3 000 EUR (04/12/2025) |
| **Solde** | 7 000 EUR (à la livraison) |
| **Durée de développement** | 16 déc. 2025 → 19 fév. 2026 (47 commits, ~66 jours) |

---

## Livrables

### 1. Application Full-Stack "Data Visus"

- **8 pages fonctionnelles** : Accueil/Dashboard, Thématiques (Générateur), Historique, Référentiel BDI, Gestion Utilisateurs, Aide & Support, Profil, Login
- **3 151 lignes backend** (Python + Node.js), **5 799 lignes frontend** (React/TypeScript)
- **Authentification** PocketBase avec écran de connexion sécurisé
- **Déploiement Docker** (Coolify) + scripts BAT pour exécution locale Windows

### 2. Moteur de génération MOCA-O (`prisme_engine.py` — 1 170 lignes)

- Moteur config-driven piloté par `themes_config.json` (16 datasets)
- 3 parsers CSV : MOCA standard, MOCA avec filtre, tabulaire
- Support multi-dimensions (ex: structure_quinq = hommes/femmes)
- Génération ZIP : arborescence `Theme/Année/NiveauGeo/fichier.xlsx` + consolidated
- **14 thèmes opérationnels** : educ, structure_quinq, structure_grp, pop_inf3ans, indice_fecondite, fecondite, emplois, revenu, alloc, pers_sup65ans_seules, familles_mono, pers_menages, types_menages, accueil_pop_inf3ans
- **5 niveaux géographiques** : Communes (22), Région, DOM, France hexagonale, France entière

### 3. Moteur Open Data (`generate_from_opendata.py` — 947 lignes)

**14 thèmes Open Data** en autonomie totale (pas besoin de MOCA-O) :

| Source | Thèmes | Années |
|--------|--------|--------|
| INSEE Diplômes-Formation | educ | 2017-2022 |
| INSEE Couples-Familles | pop_inf3ans, pers_sup65ans_seules, familles_mono, pers_menages, types_menages | 2017-2022 |
| CAF Allocataires | alloc | 2020-2023 |
| IRCOM Revenus | revenu | 2019-2023 |
| Populations légales | densite | 2021-2023 |
| BAAC Accidents route | route | 2019-2023 |
| CepiDc Mortalité | mortalite_gen, mortalite_cardio, mortalite_tumeurs, mortalite_respi | 2015-2023 |

- **928 Mo de données sources** collectées, nettoyées et intégrées (300+ fichiers)
- Téléchargement automatique via `download_opendata.py`

### 4. 101 fichiers Excel pré-générés

Prêts à l'import dans Geoclip, couvrant toutes les combinaisons thème × année × source disponibles.

### 5. Référentiel BDI complet

**219 indicateurs** cartographiés depuis le dictionnaire client (6 domaines) :
- Population & Conditions de Vie
- État de Santé
- Structures & Activités de Soins
- Pathologies
- Comportements
- Traumatismes

### 6. API REST complète (`file_server.js` — 1 034 lignes)

- 12 endpoints : `/health`, `/themes`, `/datasets`, `/dataset-info`, `/available-years`, `/available-years-opendata`, `/check-csv`, `/files`, `/generate`, `/generate-opendata`, `/reload-config`, `/download`
- Upload de fichiers CSV/XLSX avec synchronisation
- Journalisation des activités (`activity_log.json`)
- Warnings intelligents (données manquantes, couverture temporelle)

### 7. UI/UX

- Parcours guidé en 3 étapes : Sélection indicateur → Configuration → Résultat
- Double source de données (MOCA-O / Open Data) avec détection automatique
- Drag & drop pour import de fichiers CSV
- Dashboard avec KPI, graphiques Recharts, matrice de couverture
- Historique des générations avec filtres et téléchargement
- Design responsive, palette institutionnelle ORSG

### 8. Infrastructure de déploiement

- `LANCER_PRODUCTION.bat` : PocketBase + API + Frontend (port 3001)
- `LANCER_TOUT.bat` : Mode développement complet
- `CREER_LIVRAISON.bat` : Package ZIP de livraison (avec Open Data)
- Dockerfile pour déploiement cloud (Coolify/cercleonline)
- `requirements.txt` : pandas + openpyxl + requests

---

## Chronologie des phases

| Phase | Période | Réalisations clés |
|-------|---------|-------------------|
| **Phase 1 — Fondations** | 16 déc. — 30 jan. | Architecture Full-Stack, moteur MOCA-O, 14 datasets, auth PocketBase, Docker |
| **Phase 2 — Open Data** | 30 jan. — 10 fév. | Pipeline INSEE/CAF/IRCOM, 9 thèmes Open Data, upload CSV, historique |
| **Phase 3 — Extension** | 10-16 fév. | BAAC (accidents route), CepiDc (4 mortalités), total 14 thèmes Open Data |
| **Phase 4 — BDI + Dashboard** | 16-19 fév. | 219 indicateurs BDI, dashboard KPI, graphiques, corrections bugs |

---

## Bugs majeurs résolus

- Parser MOCA-O : multi-dimensions, détection geo, duplications
- IRCOM : recherche par année (`*revenus_{year}*`)
- CAF 2023 : fallback `nb_menages` vers 2022
- Open Data educ : erreur silencieuse corrigée (FileNotFoundError explicite)
- Tailwind v3→v4 : migration CSS cassé
- Vite proxy : port mismatch
- BAAC 2022 : `Accident_Id` vs `Num_Acc`
- Warnings données sources : colonnes vides = données CSV manquantes, pas bug applicatif

---

## Hors scope (devis Standard / MVP)

Selon le devis signé, les éléments suivants sont **exclus du périmètre actuel** :

- Phase 3 : Déploiement en production chez le client
- Archives automatisées
- API publique documentée
- Double authentification (2FA) — prévu dans l'offre Premium
- Gestion utilisateurs fonctionnelle (création, activation, désactivation)
- Système de tickets/support avec logs BDD
- Envoi de mails automatiques

---

## Métriques de livraison

| Métrique | Valeur |
|----------|--------|
| Commits | 47 |
| Lignes de code backend | 3 151 |
| Lignes de code frontend | 5 799 |
| Fichiers CSV sources MOCA-O | 39 |
| Fichiers Open Data | 300+ (928 Mo) |
| ZIPs Excel pré-générés | 101 |
| Indicateurs BDI référencés | 219 |
| Thèmes MOCA-O opérationnels | 14/16 |
| Thèmes Open Data opérationnels | 14 |
| Pages applicatives | 8 |
| Endpoints API | 12 |

---

*Document généré le 19 février 2026 — Projet PRISME v4.0*
