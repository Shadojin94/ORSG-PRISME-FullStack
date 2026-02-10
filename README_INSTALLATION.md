# GUIDE D'INSTALLATION - PRISME ORSG
## Version 4.0 - Fevrier 2026

---

## CONTENU DU PACKAGE

```
PRISME_ORSG/
|-- Backend/
|   |-- pocketbase.exe          # Base de donnees et authentification
|   |-- file_server.js          # Serveur API + interface web
|   |-- prisme_engine.py        # Moteur de generation Excel
|   |-- themes_config.json      # Configuration des 16 datasets
|   |-- csv_sources/            # Fichiers CSV MOCA-O (36 fichiers)
|   |-- output/                 # Fichiers Excel/ZIP generes
|   |-- package.json            # Dependances Node.js
|   `-- pb_data/                # Donnees PocketBase
|
|-- Frontend/
|   |-- dist/                   # Application web compilee (prete a l'emploi)
|   |-- src/                    # Code source (pour developpement uniquement)
|   `-- package.json            # Dependances Frontend
|
|-- LANCER_PRODUCTION.bat       # Demarrage rapide (mode production)
|-- LANCER_TOUT.bat             # Demarrage complet (mode developpement)
|-- requirements.txt            # Dependances Python
`-- README_INSTALLATION.md      # Ce fichier
```

---

## PREREQUIS

1. **Windows 10/11** (64 bits)
2. **Node.js 18+** : https://nodejs.org (cliquer "LTS")
3. **Python 3.10+** : https://python.org
   - IMPORTANT : Cocher "Add Python to PATH" pendant l'installation

---

## INSTALLATION (une seule fois)

### Etape 1 : Extraire le ZIP
Extraire le dossier dans un emplacement de votre choix, par exemple :
```
C:\ORSG\PRISME\
```

### Etape 2 : Installer les dependances Python
Ouvrir un terminal (PowerShell ou Invite de commandes) :
```powershell
cd C:\ORSG\PRISME
pip install -r requirements.txt
```
Cela installe pandas et openpyxl.

### Etape 3 : Installer les dependances Node.js
```powershell
cd C:\ORSG\PRISME\Backend
npm install
```

---

## DEMARRAGE

### Mode Production (recommande)
Double-cliquer sur **LANCER_PRODUCTION.bat**

Cela demarre :
- PocketBase (authentification) sur le port 8090
- Le serveur PRISME (API + interface web) sur le port 3001

Ouvrir le navigateur sur : **http://localhost:3001**

### Mode Developpement
Double-cliquer sur **LANCER_TOUT.bat**

Cela demarre en plus le serveur Vite (rechargement en direct) sur le port 5173.
Ouvrir le navigateur sur : **http://localhost:5173**

### Demarrage Manuel (3 terminaux)

**Terminal 1** - PocketBase :
```powershell
cd Backend
.\pocketbase.exe serve
```

**Terminal 2** - Serveur PRISME :
```powershell
cd Backend
node file_server.js
```

**Terminal 3** (optionnel, dev uniquement) :
```powershell
cd Frontend
npm run dev
```

---

## CONNEXION

- **Email** : admin@orsg.fr
- **Mot de passe** : ChangeMe123!
- **Code 2FA** : 123456 (mode demo)

---

## GENERER UN RAPPORT

1. Se connecter sur l'interface
2. Cliquer sur **"Generateur"** dans le menu
3. Selectionner la **thematique** (ex: Population et Conditions de Vie)
4. Selectionner le **sous-theme** (ex: Education)
5. Choisir l'**annee** (les annees disponibles sont detectees automatiquement)
6. Cliquer sur **"Lancer la generation"**
7. Telecharger le fichier ZIP genere

### Thematiques disponibles (14 datasets operationnels)

| Theme | Dataset | Annees |
|-------|---------|--------|
| Education | Scolarisation et diplomes | 2015-2022 |
| Population | Structure quinquennale | 2020-2022 |
| Population | Structure par groupe d'age | 2020-2022 |
| Population | Population < 3 ans | 2020-2022 |
| Naissance | Indice de fecondite | 2022-2023 |
| Naissance | Fecondite | 2022-2023 |
| Emploi | Emploi et activite | 2020-2022 |
| Revenu | Revenus et fiscalite | 2021-2023 |
| Prestations | Allocataires | 2020-2023 |
| Conditions de vie | Personnes 65+ seules | 2020-2022 |
| Conditions de vie | Familles monoparentales | 2020-2022 |
| Conditions de vie | Menages | 2020-2021 |
| Conditions de vie | Types de menages | 2020-2021 |
| Conditions de vie | Accueil petite enfance | partiel |

### Structure du ZIP genere

```
theme_annee.zip
`-- Theme/
    `-- Annee/
        |-- Commune/theme.xlsx
        |-- Region/theme.xlsx
        |-- DOM/theme.xlsx
        |-- France Hexagonale/theme.xlsx
        |-- France entiere/theme.xlsx
        `-- theme_consolidated_annee.xlsx
```

Chaque fichier .xlsx contient un onglet avec les donnees au format Geoclip :
- Colonnes : code geographique, annee, variables du dataset
- En-tetes en orange (#FFC000)

---

## AJOUTER DES DONNEES

### Nouveaux fichiers CSV MOCA-O
1. Placer les fichiers CSV dans `Backend/csv_sources/`
2. Le nom du fichier doit contenir le pattern attendu (ex: `Pop_6-16ans` pour l'education)
3. Les annees disponibles seront automatiquement detectees

### Nouveau dataset
Modifier `Backend/themes_config.json` pour ajouter la configuration du dataset.

---

## DEPANNAGE

| Probleme | Solution |
|----------|----------|
| Page blanche | Verifier que PocketBase et le serveur sont lances |
| Erreur de connexion | Relancer PocketBase : `.\pocketbase.exe serve` |
| Fichier non genere | Verifier les CSV dans `Backend/csv_sources/` |
| Port deja utilise | Fermer l'application precedente ou changer le port |
| Python non trouve | Reinstaller Python en cochant "Add to PATH" |

### Verifier les services
Ouvrir un terminal et taper :
```powershell
netstat -ano | findstr "3001 8090"
```
Les deux ports doivent apparaitre comme LISTENING.

---

## SUPPORT

Pour toute question technique :
- **Cedric ATTICOT** - N.O.V.I. Connected
- Email : contact@novi-connected.fr
- Tel : +33 6 50 75 43 89

---

*Livre par N.O.V.I. Connected - Fevrier 2026*
