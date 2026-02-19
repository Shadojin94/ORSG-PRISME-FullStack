# 🤖 CONTEXTE AGENTS IA - PRISME 2026
**Date : 13 Février 2026**  
**Livraison : 20 Février 2026**

---

## 🎯 LECTURE OBLIGATOIRE AVANT TOUT TRAVAIL

⚠️ **RÈGLE D'OR** : Lis CE fichier + `CONTEXTE_PROJET_FULLSTACK.md` AVANT de coder quoi que ce soit.

---

## 🏗️ MODÈLES IA ACTUELS (Février 2026)

### Équipe d'Agents Vibecoding

| Agent | Modèle | Version | Rôle | Outil Principal |
|-------|--------|---------|------|----------------|
| **L'ARCHITECTE** | ChatGPT Codex | 5.3 | QA, Tests, Specs | Cline / ChatGPT Web |
| **LE MOTEUR** | Claude Opus | 4.6 | Backend Python, Data | Antigravity / Claude Code |
| **L'INTERFACE** | Gemini Pro | 3.0 | Frontend React/TypeScript | Kilocode / Gemini Web |

### Capacités Clés (Février 2026)

**Claude Opus 4.6** :
- Context window : 200K tokens
- Meilleur pour : Architecture backend, manipulation de données complexes, refactoring
- Limites : Sessions Cowork limitées → Utiliser Claude Code pour le backend

**GPT 5.3 Codex** :
- Raisonnement approfondi (o1-style)
- Meilleur pour : Tests unitaires, debugging, validation de code
- Utiliser pour : Créer les tests AVANT que Claude ne code

**Gemini 3 Pro** :
- Multimodal avancé
- Meilleur pour : UI/UX, intégration frontend, components React
- Utiliser pour : Tout ce qui touche à `/Frontend/src/`

---

## 🔌 MCP DISPONIBLES (Model Context Protocol)

### MCP Actifs pour ce Projet

#### 1. **Firecrawl (Selfhosted)**
- **Usage** : Scraper la documentation web à jour (React 19, Python 3.13, etc.)
- **Commande type** : `firecrawl_scrape(url="https://react.dev/reference/...")`
- **Quand l'utiliser** : Si tu ne connais pas une API récente (>2025)

#### 2. **Context7**
- **Usage** : Obtenir du code de référence à jour des bibliothèques
- **Commande type** : `get-library-docs(libraryID="/vercel/next.js")`
- **Quand l'utiliser** : Pour vérifier la syntaxe exacte de shadcn/ui, Tailwind 4, etc.

#### 3. **GitHub MCP**
- **Usage** : Lire/écrire dans le dépôt Git
- **Commande type** : `get_file_contents(owner, repo, path)`
- **Quand l'utiliser** : Pour vérifier l'historique des commits ou pusher directement

#### 4. **Desktop Commander**
- **Usage** : Accéder aux fichiers locaux, exécuter des scripts
- **Commande type** : `read_file(path="C:\\Users\\chad9\\...")`, `start_process(command="python script.py")`
- **Quand l'utiliser** : Toujours pour les opérations fichiers locales

---

## 📁 STRUCTURE PROJET (NE JAMAIS MODIFIER)

### Arborescence Actuelle (STRICTE)

```
C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\
├── Backend/                    ← TOUT le code Python ICI
│   ├── prisme_engine.py       ← Moteur principal
│   ├── generate_from_opendata.py
│   ├── csv_sources/           ← Données Open Data
│   ├── output/                ← Fichiers Excel générés
│   ├── pb_data/               ← Base PocketBase
│   └── themes_config.json     ← Config thèmes BDI
│
├── Frontend/                   ← TOUT le code React ICI
│   ├── src/
│   │   ├── components/        ← Composants UI
│   │   ├── pages/             ← Pages principales
│   │   ├── services/          ← API calls (PocketBase)
│   │   └── hooks/             ← Custom hooks React
│   └── package.json
│
├── CONTEXTE_PROJET_FULLSTACK.md    ← Contexte technique
├── CONTEXTE_AGENTS_IA_2026.md      ← CE FICHIER (règles agents)
├── .coordination/                   ← Dossier coordination agents
│   └── HANDOFF.md                  ← Transferts quotidiens
│
└── output/                     ← ⚠️ DOUBLON (à ignorer, utiliser Backend/output/)
```

### ⛔ INTERDICTIONS ABSOLUES

**NE JAMAIS** :
1. ❌ Créer de nouveaux dossiers à la racine
2. ❌ Créer des fichiers en dehors de `Backend/` ou `Frontend/`
3. ❌ Modifier `Exemple Arbo Client/` (c'est la référence client)
4. ❌ Toucher aux `.git/` ou `.claude/`
5. ❌ Créer un dossier `Context_Projet/` séparé (CONFUSION GARANTIE)
6. ❌ Dupliquer des scripts existants (cherche d'abord avec `grep`)

**TOUJOURS** :
1. ✅ Coder Python dans `Backend/`
2. ✅ Coder React dans `Frontend/src/`
3. ✅ Documenter dans `.coordination/HANDOFF.md`
4. ✅ Lire `Backend/themes_config.json` avant de modifier les thèmes
5. ✅ Lire `Backend/opendata_config.json` avant de toucher à l'Open Data

---

## 🔄 WORKFLOW VIBECODING (CONTRACT-FIRST)

### Principe : Jamais de Code sans Spécification

**Flux quotidien** :

```
MATIN
┌─────────────────────────────────────────┐
│ 1. Lire .coordination/HANDOFF.md       │
│    → Comprendre ce qui a été fait hier │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. L'ARCHITECTE (ChatGPT 5.3 Codex)    │
│    → Définir les tests du jour         │
│    → Documenter dans HANDOFF.md        │
└─────────────────────────────────────────┘
              ↓
JOURNÉE
┌─────────────────────────────────────────┐
│ 3. LE MOTEUR (Claude Opus 4.6)         │
│    → Lire HANDOFF.md                   │
│    → Coder pour passer les tests       │
│    → Documenter l'API créée             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 4. L'INTERFACE (Gemini 3 Pro)          │
│    → Lire HANDOFF.md                   │
│    → Consommer l'API du Moteur         │
│    → Ne JAMAIS toucher au Python       │
└─────────────────────────────────────────┘
              ↓
SOIR
┌─────────────────────────────────────────┐
│ 5. L'ARCHITECTE valide                 │
│    → Exécute les tests E2E             │
│    → Documente les bugs dans HANDOFF.md│
└─────────────────────────────────────────┘
```

### Format du fichier HANDOFF.md

```markdown
# HANDOFF - 14 Février 2026

## 📋 L'ARCHITECTE → LE MOTEUR
**Tests créés** :
- `Backend/test_opendata_structure.py`
- Validation : 5 onglets Excel obligatoires
- Commande : `pytest Backend/test_opendata_structure.py`

**Attendu** : Le test doit passer ✅

---

## 🔧 LE MOTEUR → L'INTERFACE
**API créée** :
- Endpoint : `GET /api/files`
- Format réponse :
  ```json
  {
    "filename": "educ_2022.zip",
    "date": "2026-02-14",
    "size": "1.2MB"
  }
  ```
- Status : ✅ Testé avec `curl http://127.0.0.1:8090/api/files`

---

## 🎨 L'INTERFACE → L'ARCHITECTE
**Page modifiée** :
- `Frontend/src/pages/HistoryPage.tsx`
- Consomme l'API `/api/files`
- Status : ⏳ En attente validation UX
```

---

## 📚 BEST PRACTICES NOTEBOOKLM (Résumé)

### Concepts Clés de Votre NotebookLM

1. **Progressive Disclosure** : Ne pas donner tout le contexte d'un coup
   - ❌ Mauvais : Envoyer les 660 fichiers CSV au Moteur
   - ✅ Bon : Lui donner `csv_sources/educ_opendata_2022.csv` seulement

2. **Fail Closed** (Échec Sécurisé)
   - Si une donnée manque (ex: BPCO), générer le fichier avec colonne vide
   - Ne JAMAIS crasher, toujours logger dans `MISSING_DATA.log`

3. **TDD pour IA** (Test-Driven Development)
   - L'Architecte écrit le test en PREMIER
   - Le Moteur code pour passer le test
   - L'Interface consomme l'API validée

4. **Reasoning First** (Réfléchir avant d'agir)
   - Prompt type : "Analyse `opendata_config.json` et liste les incohérences AVANT de coder"

5. **Contract-First** (Spécifier avant de coder)
   - Toute API doit être documentée dans HANDOFF.md AVANT d'être implémentée

---

## 🚨 GESTION DES ERREURS

### Données Manquantes (Cas Critique)

**Problème connu** : 3 indicateurs Pathologies manquent dans MOCA-O :
- BPCO (Bronchopneumopathie Chronique Obstructive)
- Trouble mental
- Insuffisance cardiaque

**Action** :
```python
# ❌ MAUVAIS (crash)
if 'BPCO' not in data.columns:
    raise ValueError("Colonne BPCO manquante !")

# ✅ BON (fail closed)
if 'BPCO' not in data.columns:
    logger.warning("Colonne BPCO manquante - colonne vide générée")
    with open('MISSING_DATA.log', 'a') as f:
        f.write(f"{datetime.now()} - BPCO manquant dans {file_name}\n")
    data['BPCO'] = None  # Colonne vide
```

### Format Géoclip (Critique)

**5 onglets OBLIGATOIRES** dans chaque Excel :
1. `Commune`
2. `Region`
3. `DOM`
4. `France Hexagonale`
5. `France Entière`

**Code Couleur** : Orange `#FFC000` pour cellules modifiées (validation client visuelle)

---

## 💰 OPTIMISATIONS FORFAIT

### Économiser les Tokens/Sessions

1. **Backend Python** → Claude Code (1 session = 1 module complet)
2. **Frontend React** → Kilocode (moins cher que Claude Projects)
3. **Tests/QA** → ChatGPT o1 (raisonnement profond, peu d'itérations)
4. **Ne donner que les fichiers pertinents**, pas tout le projet

### Utiliser les MCP pour Réduire les Itérations

**Exemple** :
```python
# ❌ MAUVAIS : Demander à Claude de deviner la syntaxe React 19
# → Risque de 3-4 itérations

# ✅ BON : Utiliser Context7
get-library-docs(libraryID="/facebook/react", topic="useTransition")
# → Syntaxe exacte en 1 coup
```

---

## ✅ CHECKLIST AVANT DE COMMENCER À CODER

- [ ] J'ai lu `CONTEXTE_PROJET_FULLSTACK.md`
- [ ] J'ai lu `CONTEXTE_AGENTS_IA_2026.md` (CE fichier)
- [ ] Je connais mon rôle (Architecte / Moteur / Interface)
- [ ] J'ai lu `.coordination/HANDOFF.md` (si existant)
- [ ] Je sais dans quel dossier je code (`Backend/` ou `Frontend/src/`)
- [ ] Je ne vais PAS créer de nouveaux dossiers
- [ ] J'ai vérifié la version du modèle que j'utilise (Opus 4.6 / GPT 5.3 / Gemini 3)

---

## 🎯 PRIORITÉS PROJET (Roadmap)

### Sprint Actuel (14-20 Février)

**JOUR 1 (14/02)** : Tests + Open Data
- Architecte : Créer `test_opendata_structure.py`
- Moteur : Implémenter `generate_from_opendata.py`

**JOUR 2 (15/02)** : Backend → Frontend
- Moteur : API `/api/files` (Historique)
- Interface : Connecter `HistoryPage.tsx`

**JOUR 3 (16/02)** : Sécurité
- Moteur : SMTP + auth_service.py (2FA)
- Interface : `LoginPage.tsx`

**JOURS 4-7 (17-20/02)** : Tests E2E + Packaging + Livraison

---

## 📞 EN CAS DE BLOCAGE

1. **Conflit entre agents** → Relire HANDOFF.md, l'Architecte tranche
2. **Structure projet confuse** → Relire la section "STRUCTURE PROJET" ci-dessus
3. **Code ne compile pas** → Utiliser Context7 pour vérifier les versions des libs
4. **Données manquantes** → Appliquer "Fail Closed", logger dans MISSING_DATA.log
5. **Forfait dépassé** → Prioriser Kilocode (frontend) + ChatGPT (tests)

---

**Message pour l'Agent IA** :  
Tu es dans une équipe. Ne travaille PAS en solo. Lis HANDOFF.md matin et soir. Documente ton travail pour les autres agents. Reste dans ton périmètre (Backend OU Frontend, jamais les deux). Et surtout : **NE CRÉE PAS DE NOUVEAUX DOSSIERS**. Tout est déjà organisé. 🚀
