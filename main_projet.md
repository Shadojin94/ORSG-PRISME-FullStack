# MAIN_PROJET.MD - Guide de Référence Multi-Agents PRISME

**Dernière mise à jour**: 2026-02-12
**Version**: 1.2
**Statut**: Document de référence pour collaboration multi-agents IA
**Deadline livraison**: 20/02/2026 (8 jours restants)

---

## 🎯 OBJECTIF DE CE DOCUMENT

Ce fichier sert de **source unique de vérité** pour tous les agents IA travaillant sur le projet PRISME.

**RÈGLE ABSOLUE**: Avant toute action, **LIRE CE FICHIER EN ENTIER** pour éviter:
- ❌ Modifier des fichiers obsolètes
- ❌ Utiliser de mauvais chemins
- ❌ Créer des conflits entre agents
- ❌ Perdre du travail par manque de coordination

**Après chaque intervention**: **METTRE À JOUR** la section [Journal des Modifications](#journal-des-modifications)

---

## 🤖 AGENTS IA — HIÉRARCHIE & RÉPARTITION

### Les 3 Agents Actifs

| Agent | Outil | Confiance | Spécialité | Restriction |
|-------|-------|-----------|------------|-------------|
| **Claude Code Opus 4.6** | Claude Code (CLI/VSCode) | 🥇 #1 — Référence | Architecture, Backend Python, Debug, Décisions critiques | **Usage limité** (quota par session). Réserver pour tâches critiques |
| **GPT 5.3 Codex** | Codex (CLI/IDE) | 🥈 #2 — Fiable | Backend, Frontend, Intégration, Développement général | Vérifier la cohérence avec l'existant avant de merger |
| **Gemini 3 Pro** | Antigravity | 🥉 #3 — Frontend/Intégration uniquement | Frontend React, pages statiques, UI, intégration composants | **⛔ INTERDIT BACKEND & PYTHON**. A causé des erreurs en backend |

### Règles d'Affectation par Chantier

| Chantier | Agent recommandé | Pourquoi |
|----------|-----------------|----------|
| **A** Open Data (Python) | GPT Codex ou Claude (validation) | Python pur, logique métier complexe |
| **B** Historique (file_server.js + HistoryPage.tsx) | GPT Codex | Fullstack Node.js + React |
| **C** Gestion utilisateurs (PocketBase + AdminUsersPage) | GPT Codex ou Gemini (front seulement) | API PocketBase + UI |
| **D** Auth email (file_server.js + LoginPage.tsx) | GPT Codex | Backend Node.js critique |
| **E** Pages statiques (DocsPage, SupportPage, ProfilePage) | Gemini 3 Pro ✅ | Frontend React pur, pas de risque backend |
| **F** Recette + Livraison | Claude Opus (pilotage) | Décisions critiques, validation finale |

### Stratégie d'Utilisation de Claude Opus 4.6

> **⚠️ Quota limité** : Déjà à ~19% d'utilisation cette session.

**Utiliser Claude pour** :
- Valider/reviewer le code produit par les autres agents
- Résoudre des bugs complexes (Python, architecture)
- Prendre des décisions d'architecture
- Mettre à jour `main_projet.md` et coordonner les agents
- Recette finale et validation livraison

**NE PAS utiliser Claude pour** :
- Écrire des pages frontend simples (Gemini peut le faire)
- Du code boilerplate ou répétitif (GPT Codex)
- Des tâches de recherche ou exploration (n'importe quel agent)

### ⛔ RESTRICTIONS GEMINI 3 PRO

**Historique** : Gemini a fait des erreurs en backend qui ont causé des régressions. Pour protéger le projet :

**Gemini NE DOIT PAS modifier** :
- `Backend/prisme_engine.py` — Moteur Python critique
- `Backend/file_server.js` — Serveur API Node.js
- `Backend/themes_config.json` — Configuration des datasets
- `Backend/generate_from_opendata.py` — Pipeline Open Data
- `Backend/download_opendata.py` — Téléchargement Open Data
- Tout fichier `.py` dans `Backend/`

**Gemini PEUT modifier** :
- `Frontend/src/pages/*.tsx` — Pages React
- `Frontend/src/components/*.tsx` — Composants UI
- `Frontend/src/lib/*.ts` — Utilitaires frontend
- `Frontend/src/data/*.ts` — Données mock/seed
- Fichiers `.css`, `.md` dans `Frontend/`

### 🔄 Protocole de Coordination Inter-Agents

```
1. AVANT de commencer :
   → Lire main_projet.md (ce fichier)
   → Consulter le Journal des Modifications
   → Vérifier qu'aucun autre agent ne travaille sur le même fichier

2. PENDANT le travail :
   → Écrire une entrée [EN COURS] dans le Journal
   → Ne modifier QUE les fichiers dans votre périmètre
   → En cas de doute → DEMANDER à Cédric (l'humain)

3. APRÈS le travail :
   → Mettre à jour le Journal avec [TERMINÉ]
   → Lister TOUS les fichiers modifiés
   → Si le travail impacte un autre chantier → le signaler

4. EN CAS DE CONFLIT :
   → L'agent avec le rang de confiance le plus élevé a priorité
   → Claude Opus > GPT Codex > Gemini Pro
   → En cas de doute → DEMANDER à Cédric
```

### Template pour Briefer un Agent

Pour donner une tâche à un agent, copier-coller ce template :

```
CONTEXTE : Projet PRISME (générateur Excel pour Géoclip)
FICHIER DE RÉFÉRENCE : Lire c:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\main_projet.md AVANT toute action
DOSSIER RACINE : c:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\
TÂCHE : [Décrire la tâche]
CHANTIER : [A/B/C/D/E/F]
FICHIERS À MODIFIER : [Liste exacte]
FICHIERS À NE PAS TOUCHER : [Si applicable]
APRÈS : Mettre à jour le Journal dans main_projet.md
```

---

## 📍 LOCALISATION DU PROJET

### Dossier Racine
```
c:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\
```

### Structure Active (SEULEMENT ces dossiers!)
```
Version_FullStack/
├── Backend/
│   ├── pocketbase.exe               # Auth + DB (Port 8090)
│   ├── file_server.js               # API + Frontend prod (Port 3001)
│   ├── prisme_engine.py             # ⭐ MOTEUR PRINCIPAL (~1110 lignes)
│   ├── themes_config.json           # ⭐ CONFIG 16 DATASETS
│   ├── csv_sources/                 # CSV sources MOCA
│   ├── output/                      # ⭐ SORTIE ZIP (utilisé par engine + server)
│   ├── requirements.txt             # pandas + openpyxl
│   └── package.json                 # Node deps
│
├── Frontend/
│   ├── src/
│   │   ├── pages/GeneratorPage.tsx  # ⭐ UI principale
│   │   ├── components/              # Composants réutilisables
│   │   ├── lib/                     # Utilitaires
│   │   └── data/                    # Mock data
│   ├── dist/                        # ⭐ BUILD PRODUCTION (servi par file_server.js)
│   ├── package.json
│   └── vite.config.ts               # Proxy -> http://localhost:3001
│
├── LANCER_PRODUCTION.bat            # ⭐ MODE PROD: PocketBase + file_server.js
├── LANCER_TOUT.bat                  # ⭐ MODE DEV: + Vite dev server
├── CREER_LIVRAISON.bat              # Créer ZIP livraison client
├── main_projet.md                   # ⭐ CE FICHIER
└── README_INSTALLATION.md           # Guide installation client
```

### ⚠️ DOSSIERS OBSOLÈTES (NE PAS TOUCHER!)
```
../ORSG_PRISME_V1/           # Ancien projet Python venv
../Prototype V1/             # Ancien prototype React
../Frontend_Existant/        # Anciens HTML
../Frontend_New/             # Tentative abandonnée
../Demo_old/                 # Démo obsolète
../_ARCHIVE/                 # Fichiers archivés
```

**RÈGLE**: Si vous devez travailler en dehors de `Version_FullStack/`, **DEMANDER CONFIRMATION** d'abord!

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique

| Composant | Technologie | Port | Commande |
|-----------|-------------|------|----------|
| **Frontend Dev** | React 19 + Vite 7 + TypeScript | 5173 | `cd Frontend && npm run dev` |
| **Frontend Prod** | Servi par file_server.js | 3001 | Automatique avec LANCER_PRODUCTION.bat |
| **API Server** | Node.js (file_server.js) | 3001 | `cd Backend && node file_server.js` |
| **Auth + DB** | PocketBase | 8090 | `cd Backend && pocketbase.exe serve` |
| **Processing** | Python 3.13 + pandas + openpyxl | N/A | Appelé par file_server.js |

### Flux de Données

```
┌─────────────┐
│   User UI   │ (React @ localhost:5173 dev OU localhost:3001 prod)
└──────┬──────┘
       │ POST /api/generate
       ↓
┌─────────────────┐
│ file_server.js  │ (Port 3001)
│ - Reçoit params │
│ - Lance Python  │
└──────┬──────────┘
       │ subprocess.spawn('c:/Users/chad9/AppData/Local/Programs/Python/Python313/python.exe')
       ↓
┌──────────────────┐
│ prisme_engine.py │
│ 1. Lit config    │ ← themes_config.json
│ 2. Parse CSV     │ ← csv_sources/theme.csv
│ 3. Génère Excel  │ → output/theme_year.zip
└──────┬───────────┘
       │ Retourne JSON {success, files, ...}
       ↓
┌─────────────────┐
│ file_server.js  │
│ - Envoie result │
└──────┬──────────┘
       │ 200 OK + JSON
       ↓
┌─────────────┐
│   User UI   │ Download ZIP
└─────────────┘
```

### Python PATH Critique
```python
# ⚠️ ATTENTION: Utiliser CE chemin exact dans file_server.js
"c:/Users/chad9/AppData/Local/Programs/Python/Python313/python.exe"
```

---

## 🔑 FICHIERS CLÉS À CONNAÎTRE

### 1. Backend/prisme_engine.py (~1110 lignes)
**Rôle**: Moteur de génération Excel config-driven

**Fonctions principales**:
- `load_config()` - Charge themes_config.json
- `parse_moca_legacy_csv()` - Parse ancien format MOCA
- `parse_moca_csv()` - Parse nouveau format MOCA
- `parse_tabular_csv()` - Parse format tabulaire (alloc, revenu, etc.)
- `parse_multidim_csv()` - Parse format multi-dimensions (familles_mono, etc.)
- `generate_reports_for_theme()` - Génère ZIP pour un thème/année

**Point d'entrée CLI**:
```bash
python prisme_engine.py --theme educ --year 2022
```

**Point d'entrée depuis file_server.js**:
```javascript
const pythonProcess = spawn(pythonPath, [
  path.join(__dirname, 'prisme_engine.py'),
  '--theme', theme,
  '--year', year.toString()
]);
```

### 2. Backend/themes_config.json
**Rôle**: Configuration centralisée des 16 datasets

**Structure par thème**:
```json
{
  "educ": {
    "label": "Education",
    "csv_file": "csv_sources/educ.csv",
    "parser_type": "legacy_moca",
    "variables": {
      "educ_tx_non_scol_15_24ans": {
        "label": "Tx non-scolarisation 15-24 ans",
        "col_indices": {"year": 3, "geo": 5, "value": 6}
      }
    }
  }
}
```

**Datasets opérationnels (14/16)**:
✅ educ, structure_quinq, structure_grp, pop_inf3ans, indice_fecondite, fecondite, emplois, revenu, alloc, pers_sup65ans_seules, familles_mono, pers_menages, types_menages, accueil_pop_inf3ans

❌ Manquants: densite, accroiss_sup65ans (CSV pas encore créés)

### 3. Frontend/src/pages/GeneratorPage.tsx
**Rôle**: Interface principale de génération

**Flux utilisateur**:
1. Sélection thème (dropdown)
2. Détection années disponibles (API /api/detect-years)
3. Sélection année (dropdown)
4. Clic "Générer le rapport"
5. Appel POST /api/generate
6. Téléchargement ZIP

**États React clés**:
- `selectedTheme`: string
- `selectedYear`: number
- `availableYears`: number[]
- `isGenerating`: boolean

### 4. Backend/file_server.js
**Rôle**: Serveur Node.js unifié (API + Frontend prod)

**Endpoints**:
- `GET /` - Sert Frontend/dist/index.html
- `GET /assets/*` - Sert CSS/JS build
- `POST /api/generate` - Lance prisme_engine.py
- `POST /api/detect-years` - Détecte années disponibles
- `GET /api/download/:filename` - Télécharge ZIP

**Configuration**:
```javascript
const PORT = 3001;
const OUTPUT_DIR = path.join(__dirname, 'output');
const pythonPath = 'c:/Users/chad9/AppData/Local/Programs/Python/Python313/python.exe';
```

---

## 📝 COMMANDES ESSENTIELLES

### Démarrage Rapide

**Mode Production** (client final):
```bash
cd c:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack
.\LANCER_PRODUCTION.bat
```
→ Ouvre http://localhost:3001 (Frontend servi par file_server.js)

**Mode Développement** (avec hot-reload):
```bash
.\LANCER_TOUT.bat
```
→ Ouvre http://localhost:5173 (Vite dev server avec proxy)

**Tester le moteur Python seul**:
```bash
cd Backend
c:/Users/chad9/AppData/Local/Programs/Python/Python313/python.exe prisme_engine.py --theme educ --year 2022
```
→ Génère `output/educ_2022.zip`

### Build Frontend
```bash
cd Frontend
npm run build
```
→ Génère `dist/` (servi par file_server.js en prod)

### Installer les dépendances

**Backend Python**:
```bash
cd Backend
pip install -r requirements.txt
```

**Backend Node**:
```bash
cd Backend
npm install
```

**Frontend**:
```bash
cd Frontend
npm install
```

---

## 🐛 BUGS CONNUS & FIXES APPLIQUÉS

### ✅ Bugs Résolus (2026-02-09/10)

| Bug | Symptôme | Fix appliqué |
|-----|----------|--------------|
| Duplicate `parse_moca_csv` | NameError dans prisme_engine.py | Renommé première fonction → `parse_moca_legacy_csv` |
| Mauvais indices colonnes | Données vides dans Excel | Ajouté `col_indices` explicites dans themes_config.json |
| numpy int64 not serializable | JSON error dans detect_available_years | Cast `.tolist()` ou `int()` |
| Proxy Vite mauvais port | 404 sur /api/ | Changé proxy 8000 → 3001 dans vite.config.ts |
| file_server.js appelle generate_reports.py | Erreur "educ seul supporté" | Changé vers prisme_engine.py |
| OUTPUT_DIR mismatch | Fichiers dans mauvais dossier | Unifié sur `Backend/output/` |

### ⚠️ Limitations Actuelles

1. **Pathologies**: 3 variables manquent (bpco, trouble_ment, insuff_cardiaque) - CSV incomplets
2. **Geoclip Import**: Pas encore validé avec client (contrainte: 1 fichier = 1 sheet, nom doit matcher nomenclature)
3. **Fichiers binaires**: Read tool ne peut pas lire .xlsx → utiliser openpyxl en Python
4. **2 datasets manquants**: densite, accroiss_sup65ans (CSV pas créés)

---

## 🎨 FORMAT DE SORTIE

### Structure ZIP Générée
```
educ_2022.zip
├── Education/
│   ├── 2022/
│   │   ├── Commune/
│   │   │   └── educ.xlsx
│   │   ├── Region/
│   │   │   └── educ.xlsx
│   │   ├── DOM/
│   │   │   └── educ.xlsx
│   │   ├── France_Hexagonale/
│   │   │   └── educ.xlsx
│   │   └── France_Entiere/
│   │       └── educ.xlsx
│   └── educ_2022_consolidated.xlsx  # Optionnel (toutes années + geo)
```

### Structure Excel (chaque fichier)
7 sheets:
- `com` - Communes (22 pour Guyane)
- `reg` - Régions (18)
- `dom` - DOM
- `fh` - France Hexagonale
- `fra` - France Entière
- `code_régions` - Codes régions
- `Dic_variables` - Dictionnaire variables

**Coloration**: Cellules données = Orange (#FFC000)

---

## 📊 DATASETS DISPONIBLES

### Parser Types

| Type | Description | Datasets |
|------|-------------|----------|
| `legacy_moca` | Ancien format MOCA avec ANNEE en colonne | educ, structure_quinq, structure_grp, pop_inf3ans, indice_fecondite, fecondite, accueil_pop_inf3ans |
| `tabular` | Format tabulaire classique | emplois, revenu, alloc |
| `multidim` | Multi-dimensions (sexe/âge/etc.) | familles_mono, pers_sup65ans_seules, pers_menages, types_menages |

### Fichiers CSV Sources
```
Backend/csv_sources/
├── educ.csv
├── structure_quinq.csv
├── structure_grp.csv
├── pop_inf3ans.csv
├── indice_fecondite.csv
├── fecondite.csv
├── emplois.csv
├── revenu.csv
├── alloc.csv
├── pers_sup65ans_seules.csv
├── familles_mono.csv
├── pers_menages.csv
├── types_menages.csv
└── accueil_pop_inf3ans.csv
```

---

## 📦 LIVRAISON CLIENT

### Package à livrer (via CREER_LIVRAISON.bat)
```
PRISME_Livraison_v1.0.zip
├── LANCER_PRODUCTION.bat
├── README_INSTALLATION.md
├── Backend/
│   ├── pocketbase.exe
│   ├── file_server.js
│   ├── prisme_engine.py
│   ├── themes_config.json
│   ├── csv_sources/
│   ├── package.json
│   └── requirements.txt
└── Frontend/
    └── dist/
```

### Contrat
- **Budget total**: 14 000 EUR
- **Acompte payé**: 7 000 EUR (04/12/2025)
- **Solde dû**: 7 000 EUR (fin février 2026)
- **Hors scope**: Phase 3 Deploy, Archives, API REST, 2FA email

### Jalons
- ✅ Workshop 12/02/2026
- 🎯 Livraison 20/02/2026
- 🎯 Clôture fin février 2026

---

## 🚨 RÈGLES DE SÉCURITÉ POUR AGENTS IA

### ❌ INTERDIT

1. **Ne JAMAIS modifier**:
   - `Backend/pocketbase.exe`
   - `Backend/pb_data/` (base de données)
   - Fichiers dans `../*` (hors Version_FullStack)
   - `.git/` (sans demander confirmation)

2. **Ne JAMAIS supprimer**:
   - `Backend/output/*.zip` (sauvegardes)
   - `Frontend/dist/` (build production)
   - `csv_sources/*.csv`

3. **Ne JAMAIS installer** de packages non listés sans demander:
   - Python: voir `requirements.txt`
   - Node: voir `package.json`

### ✅ AUTORISÉ

1. **Lecture libre** de tous fichiers `.py`, `.ts`, `.tsx`, `.js`, `.json`, `.md`
2. **Modification prudente** après avoir:
   - Lu le fichier complet avec Read tool
   - Compris le contexte
   - Utilisé Edit (pas sed/awk)
3. **Création de fichiers** uniquement si:
   - Documenté dans JOURNAL ci-dessous
   - Justifié par tâche claire

### 🛑 ANTI-SCOPE-CREEP (RÈGLE CRITIQUE)

**Ce projet a déjà coûté 5x le temps prévu sans budget additionnel.**

- **Ne PAS** ajouter de fonctionnalités non listées dans le Plan de Finalisation (chantiers A-F)
- **Ne PAS** refactorer du code qui fonctionne "pour l'améliorer"
- **Ne PAS** ajouter de tests, docstrings, ou commentaires non demandés
- **Ne PAS** proposer de "nice to have" ou "améliorations futures"
- **FOCUS** : Faire fonctionner ce qui est prévu, livrer le 20/02, facturer 7 000 EUR

> Si un agent veut faire quelque chose hors plan → **DEMANDER CONFIRMATION** à l'utilisateur d'abord.

### 🤝 COLLABORATION

**Avant toute action importante**:
1. Lire [Journal des Modifications](#journal-des-modifications)
2. Vérifier qu'un autre agent ne fait pas la même chose
3. Ajouter une entrée avec `[EN COURS]` tag
4. À la fin, mettre à jour avec `[TERMINÉ]`

**Format d'entrée**:
```
- **[YYYY-MM-DD HH:MM]** [Agent ID] [EN COURS/TERMINÉ] Description
  - Fichiers modifiés: ...
  - Résultat: ...
```

---

## 🗓️ PLAN DE FINALISATION (5 jours-homme, deadline 20/02/2026)

> **Source**: Plan Gemini (implementation_plan.md.resolved) + `Context_Projet/ROADMAP_FINALISATION.md`
> **Budget restant**: 7 000 EUR (solde à facturer à la livraison)
> **Décision clé CR 30/01**: Générer fichiers MOCA-O ET Open Data séparément pour comparaison client
> **Référence détaillée**: Pour le plan complet jour par jour, voir aussi `Context_Projet/ROADMAP_FINALISATION.md`
> **Audit sources**: Couverture réelle validée dans `Context_Projet/AUDIT_OPENDATA_FIRECRAWL.md`
>
> **⚠️ ANTI-SCOPE-CREEP**: Ce projet a déjà coûté 5x le temps prévu (voir `Context_Projet/insights.md`). NE PAS ajouter de fonctionnalités hors plan. Focus LIVRAISON uniquement.

### État Réel des Sources de Données

| Source | État | Détail |
|--------|------|--------|
| **CSV MOCA-O** (fournis par Naissa) | ✅ 36 fichiers dans `csv_sources/`, 24 ZIP générés | **C'est ce qui fonctionne aujourd'hui** |
| **Open Data INSEE** (pipeline automatique) | ⚠️ Seul `educ` validé | Scripts prêts (`download_opendata.py`, 838 lignes), 8 thèmes restent à brancher |

> **IMPORTANT**: Aujourd'hui la génération se fait à partir des CSV MOCA-O pré-fournis, PAS des sources primaires. Le pipeline Open Data existe comme infrastructure mais n'est pas en production sauf pour `educ`.

### Les 6 Chantiers

| # | Chantier | Priorité | Estimation | Statut |
|---|----------|----------|------------|--------|
| **A** | Open Data : brancher 8 thèmes restants | 🔴 CRITIQUE | 1.5 jours | ⏳ À faire |
| **B** | Historique réel + re-téléchargement | 🟡 Important | 0.5 jour | ⏳ À faire |
| **C** | Gestion utilisateurs réelle (PocketBase) | 🟡 Important | 0.5 jour | ⏳ À faire |
| **D** | Auth email (envoi du code) | 🟠 Souhaitable | 0.5 jour | ⏳ À faire |
| **E** | Pages statiques (Référentiel BDI, Support, Profil) | 🟢 Facile | 0.5 jour | ⏳ À faire |
| **F** | Recette complète + Package livraison | 🔴 CRITIQUE | 1 jour | ⏳ À faire |
| | **TOTAL** | | **4.5 jours** | Marge 0.5j |

### Planning Jour par Jour

#### Jour 1 — Open Data : Brancher les sources primaires
- **1.1** Adapter `generate_from_opendata.py` pour `pers_sup65ans_seules`
- **1.2** Adapter pour `familles_mono`
- **1.3** Adapter pour `pop_inf3ans`
- **1.4** Adapter pour `pers_menages` et `types_menages`
- **1.5** Adapter pour `alloc` (CAF Data)
- **1.6** Adapter pour `revenu` (IRCOM data.gouv.fr)
- **1.7** Tester génération comparative MOCA-O vs Open Data
- **Livrable**: 9 thèmes générables en Open Data

#### Jour 2 — Open Data fin + Historique + Utilisateurs
- **2.1** Tests + corrections Open Data (agrégation Région/DOM/FH/FR)
- **2.2** Historique réel: lister ZIP dans `output/` avec dates, rendre téléchargeables dans `HistoryPage.tsx`
- **2.3** Gestion utilisateurs PocketBase: brancher CRUD dans `AdminUsersPage.tsx`
- **Livrable**: Historique fonctionnel, utilisateurs réels dans PocketBase

#### Jour 3 — Auth email + Pages statiques
- **3.1** Envoi email pour code auth (Brevo gratuit 300/jour OU Nodemailer SMTP)
- **3.2** Référentiel BDI dans `DocsPage.tsx` (16 datasets, sources, colonnes, années)
- **3.3** Page Support dans `SupportPage.tsx` (infos NOVI Connected)
- **3.4** Profil utilisateur connecté à PocketBase dans `ProfilePage.tsx`
- **Livrable**: Auth email fonctionnelle, pages utiles à jour

#### Jour 4 — Recette + Intégration templates
- **4.1** Recette workflow complet (Login → Dashboard → Génération → Téléchargement → Historique)
- **4.2** Tester génération des 16 datasets
- **4.3** Intégrer templates client (si reçus) dans `themes_config.json`
- **4.4** Comparaison MOCA-O vs Open Data, documenter écarts
- **Livrable**: Application recettée, fichiers comparatifs prêts

#### Jour 5 — Package livraison + Documentation
- **5.1** Clean build frontend (`npm run build`)
- **5.2** Nettoyage (`node_modules`, `__pycache__`, fichiers temp)
- **5.3** Vérifier `requirements.txt` (pandas, openpyxl, requests)
- **5.4** Manuel utilisateur (PDF/MD en français)
- **5.5** Exécuter `CREER_LIVRAISON.bat`
- **5.6** Test installation machine vierge
- **5.7** Facture solde 7 000 EUR
- **Livrable**: ZIP de livraison testée + facture

### Fichiers Clés par Chantier

| Chantier | Fichiers à modifier |
|----------|---------------------|
| **A** Open Data | `Backend/generate_from_opendata.py`, `Backend/download_opendata.py`, `Backend/opendata_config.json` |
| **B** Historique | `Frontend/src/pages/HistoryPage.tsx`, `Backend/file_server.js` |
| **C** Utilisateurs | `Frontend/src/pages/AdminUsersPage.tsx`, `Frontend/src/services/api.ts` |
| **D** Auth email | `Backend/file_server.js`, `Frontend/src/pages/LoginPage.tsx` |
| **E** Pages statiques | `Frontend/src/pages/DocsPage.tsx`, `SupportPage.tsx`, `ProfilePage.tsx` |
| **F** Livraison | `CREER_LIVRAISON.bat`, `README_INSTALLATION.md`, `requirements.txt` |

### Tests de Vérification

```bash
# 1. Endpoints API
curl.exe http://localhost:3001/api/health
curl.exe http://localhost:3001/api/themes
curl.exe http://localhost:3001/api/files

# 2. Génération MOCA-O
curl.exe -X POST "http://localhost:3001/api/generate?theme=educ&year=2022"

# 3. Génération Open Data
python generate_from_opendata.py educ 2022

# 4. Vérifier contenu ZIP
python -c "import zipfile; z=zipfile.ZipFile('output/educ_2022.zip'); print(z.namelist())"
```

### Risques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Templates client en retard | Moyen | Livrer avec CSV existants, ajouter templates en mise à jour |
| Valeurs Open Data ≠ MOCA-O | Faible | Attendu, documenté dans CR 30/01 - client choisira |
| SMTP bloqué/rate-limité | Faible | Fallback : garder code démo, ajouter email en V2 |

---

## 📝 JOURNAL DES MODIFICATIONS

### 2026-02-12

- **[13:00]** [Claude Code Opus 4.6] [TERMINÉ] Ajout section Agents IA — Hiérarchie & Répartition
  - Ajouts: Tableau 3 agents (Claude/GPT/Gemini), règles d'affectation par chantier, restrictions Gemini (backend interdit), stratégie quota Claude, protocole coordination, template briefing
  - Résultat: Chaque agent sait ce qu'il peut et ne peut pas faire

- **[12:30]** [Claude Code] [TERMINÉ] Intégration du dossier Context_Projet/ dans main_projet.md
  - Source: `C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Context_Projet\` (10 fichiers + Echange Client/)
  - Ajouts: Section "Dossier Contexte Projet" (références 10 fichiers + sous-dossier), règle anti-scope-creep, références croisées vers ROADMAP et AUDIT
  - Résultat: Tout agent a maintenant accès au contexte complet du projet

- **[12:00]** [Claude Code] [TERMINÉ] Intégration du plan Gemini dans main_projet.md
  - Source: `.gemini/antigravity/brain/.../implementation_plan.md.resolved`
  - Résultat: Plan 5 jours, 6 chantiers (A-F), fichiers par chantier, tests de vérification

- **[11:30]** [Claude Code] [TERMINÉ] Création de main_projet.md
  - Fichiers créés: `main_projet.md`
  - Résultat: Document de référence pour collaboration multi-agents

---

### 2026-02-10

- **[Historique]** [Cédric] [TERMINÉ] Finalisation technique avant livraison
  - Fichiers modifiés: `prisme_engine.py`, `themes_config.json`, `file_server.js`, `vite.config.ts`
  - Résultat: 14/16 datasets opérationnels, bugs fixes appliqués, email client envoyé

---

## 🔗 RESSOURCES EXTERNES

### Client
- **Email**: naissa.chateau@ors-guyane.org
- **Organisation**: ORSG-CTPS, Cayenne, Guyane Française

### Documentation
- **CLAUDE.md**: Guide complet projet (racine Version_FullStack)
- **MEMORY.md**: `C:\Users\chad9\.claude\projects\c--Users-chad9-Documents-003-ORSG-Livraison-Client-Version-FullStack\memory\MEMORY.md`
- **Exemple Arbo Client**: 660 fichiers Excel de référence dans `../Exemple Arbo Client/`

### Outils
- **Python**: `c:/Users/chad9/AppData/Local/Programs/Python/Python313/python.exe`
- **Node**: Installer via https://nodejs.org (LTS)
- **PocketBase**: Embarqué dans `Backend/pocketbase.exe`

---

## 📂 DOSSIER CONTEXTE PROJET

**Chemin**: `C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Context_Projet\`

> Ce dossier contient l'historique complet des decisions, echanges client, et strategies. **CONSULTEZ-LE** avant de prendre des decisions qui impactent le perimetre, la communication client, ou l'architecture Open Data.

### Fichiers de Reference

| Fichier | Description | Priorite | Quand consulter |
|---------|-------------|----------|-----------------|
| **context.md** | Contexte exhaustif du projet (chronologie, 100+ jours, 5+ reunions) | 🔴 CRITIQUE | En debut de session pour comprendre l'historique |
| **ROADMAP_FINALISATION.md** | Plan d'action 5 jours detaille (J1-J5) | 🔴 CRITIQUE | Pour savoir quoi faire et dans quel ordre |
| **todos.md** | Checklist en 5 phases (Urgent → Cloture) | 🔴 CRITIQUE | Pour verifier ce qui reste a faire |
| **AUDIT_OPENDATA_FIRECRAWL.md** | Audit reel des sources Open Data (valide par Firecrawl) | 🟡 HAUTE | Avant tout travail sur le pipeline Open Data |
| **STRATEGIE_OPENDATA.md** | Strategie client : 80% sans MOCA-O, argumentaire autonomie | 🟡 HAUTE | Pour communication client ou choix de sources |
| **insights.md** | Lecons apprises, risques identifies, scope creep documente | 🟡 HAUTE | Pour comprendre les pieges a eviter |
| **CONTENU_PRESENTATION_GAMMA.md** | 11 slides pour presentation client (atelier 12/02) | 🟢 MOYENNE | Si travail sur la presentation |
| **PROJET_EMAIL_CLIENT.txt** | Template email client (ton diplomate, professionnel) | 🟢 MOYENNE | Si redaction de mail client |
| **CLAUDE.MD** | Regles de dev + contexte IA (version Context_Projet) | 🟢 MOYENNE | Complement au CLAUDE.md racine |
| **Refining Client Communication.md** | Historique decisions de communication | 🟢 MOYENNE | Pour retrouver une decision passee |

### Sous-dossier Echange Client/

**Chemin**: `Context_Projet/Echange Client/`

| Document | Contenu |
|----------|---------|
| **Bon de commande_N.O.V.I Connected.pdf** | Commande N250219 (25/11/2025), 10 000 EUR TTC |
| **Devis signe_N.O.V.I Connected.pdf** | Offre Standard MVP 10 000 EUR HT (signe 24/11/2025) |
| **Compte Rendu Atelier 1 - ORSG.pdf** | CR atelier cadrage initial (20/11/2025) |
| **Compte_Rendu_Technique_ORSG_080126.pdf** | CR atelier validation (08/01/2026) |
| **CR_Atelier_Validation_080126.md** | Decisions cles : structure fichiers, MFA email, SharePoint |
| **CR_Atelier_Process_Metier_300126.md** | Processus client : extraction MOCA → Excel. Formats heterogenes |
| **Mail au 09022026.txt** | Historique emails client recents |

### Donnees Cles Extraites

**Couverture Open Data reelle** (source: AUDIT_OPENDATA_FIRECRAWL.md):
- **9 themes 100% Open Data**: educ, pers_sup65ans_seules, familles_mono, pop_inf3ans, pers_menages, types_menages, alloc, revenu, densite
- **2 themes partiels**: emplois (60%), indice_fecondite (80% regional)
- **2 themes MOCA-O obligatoire**: fecondite (par age), pathologies
- **Sources validees**: INSEE Diplomes-Formation, INSEE Couples-Familles-Menages, CAF Data, IRCOM data.gouv.fr

**Scope creep** (source: insights.md):
- Travail reel = **5x** le travail initial prevu
- Demande : script Python simple → Livraison : App Full-Stack (React + PocketBase + Node.js + 8 pages)
- Budget non revise. **Ne PAS ajouter de features supplementaires.**

---

## 📞 CONTACT EN CAS DE DOUTE

**RÈGLE D'OR**: Si un agent IA n'est pas sûr:
1. Ne PAS deviner
2. Ne PAS modifier au hasard
3. **DEMANDER CONFIRMATION** à l'utilisateur via AskUserQuestion tool
4. **DOCUMENTER** l'incertitude dans le Journal

**Exemple**:
```
Agent: "Je ne suis pas sûr si je dois modifier themes_config.json
ou créer un nouveau fichier. Quelle approche préférez-vous ?"
```

---

## ✅ CHECKLIST PRÉ-INTERVENTION

Avant toute tâche, vérifier:

- [ ] J'ai lu `main_projet.md` en entier
- [ ] Je connais le fichier cible exact (chemin absolu)
- [ ] J'ai vérifié que le fichier est dans `Version_FullStack/`
- [ ] J'ai lu le fichier avec Read tool avant modification
- [ ] J'ai consulté le Journal pour éviter conflits
- [ ] Je vais documenter mon intervention dans le Journal

---

**FIN DU DOCUMENT**

*Ce fichier est vivant. Chaque agent doit le mettre à jour après intervention significative.*
