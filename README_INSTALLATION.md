# 📦 GUIDE DE LIVRAISON AUTONOME - PRISME ORSG
## Version 1.0 - Janvier 2026

---

## 🎯 OBJECTIF DE CE DOCUMENT

Ce guide permet à l'équipe ORSG d'installer, configurer et utiliser le système PRISME **de manière 100% autonome**, sans intervention du prestataire.

---

## 📋 CONTENU DU PACKAGE

```
ORSG_PRISME_Livraison/
├── Backend/
│   ├── pocketbase.exe          # Base de données (auto-géré)
│   ├── pb_data/                # Données persistantes
│   ├── generate_reports.py     # Moteur de génération
│   ├── file_server.js          # Serveur de fichiers
│   ├── csv_sources/            # Vos fichiers MOCA vont ici
│   ├── output/                 # Fichiers générés ici
│   └── LANCER_BACKEND.bat      # Double-cliquer pour démarrer
│
├── Frontend/
│   ├── dist/                   # Application web compilée
│   └── LANCER_FRONTEND.bat     # Double-cliquer pour démarrer
│
└── README_INSTALLATION.md      # Ce fichier
```

---

## 🚀 INSTALLATION (Une seule fois)

### Prérequis
- **Windows 10/11**
- **Node.js** : Télécharger sur https://nodejs.org (version LTS)
- **Python 3.10+** : Télécharger sur https://python.org

### Étape 1 : Extraire le ZIP
Extrayez le dossier `ORSG_PRISME_Livraison.zip` dans `C:\ORSG\` (ou un emplacement de votre choix).

### Étape 2 : Installer les dépendances Python
Ouvrez un terminal (PowerShell) dans le dossier `Backend` et exécutez :
```powershell
pip install pandas openpyxl requests
```

### Étape 3 : Installer les dépendances Node.js
Dans le dossier `Frontend`, exécutez :
```powershell
npm install
```

---

## ▶️ DÉMARRAGE QUOTIDIEN

### Option A : Automatique (Recommandé)
1. Double-cliquez sur `LANCER_TOUT.bat` (à la racine du dossier)
2. Attendez 10 secondes
3. Ouvrez votre navigateur sur `http://localhost:5173`

### Option B : Manuel
1. **Terminal 1 (Backend)** :
   ```powershell
   cd Backend
   .\pocketbase.exe serve
   ```
2. **Terminal 2 (Serveur Fichiers)** :
   ```powershell
   cd Backend
   node file_server.js
   ```
3. **Terminal 3 (Frontend)** :
   ```powershell
   cd Frontend
   npm run dev
   ```

---

## 🔐 CONNEXION

- **URL** : http://localhost:5173
- **Email** : `admin@orsg.fr`
- **Mot de passe** : `ChangeMe123!`
- **Code 2FA** : `123456` (pour le mode démo)

> ⚠️ **Changez ces identifiants avant mise en production !**

---

## 📂 AJOUTER VOS DONNÉES MOCA

### Pour ajouter une nouvelle thématique :

1. Placez vos fichiers CSV MOCA dans le dossier `Backend/csv_sources/`
2. Renommez-les selon ce format :
   - `Pop_6-16ans_*.csv`
   - `nb_non_scol_*.csv`
   - etc.
3. Relancez le serveur

Les fichiers seront automatiquement détectés lors de la prochaine génération.

---

## 📊 GÉNÉRER UN RAPPORT

1. Connectez-vous sur l'interface
2. Cliquez sur "Générer un Rapport"
3. Sélectionnez :
   - **Thématique** : Éducation (ou autre si configurée)
   - **Année** : 2015-2022
4. Cliquez sur "Lancer le traitement"
5. Téléchargez le ZIP généré

### Structure du ZIP généré :
```
educ_2022.zip
└── 2022/
    ├── Commune/educ.xlsx
    ├── Region/educ.xlsx
    ├── DOM/educ.xlsx
    ├── France_Hexagonale/educ.xlsx
    └── France_Entiere/educ.xlsx
```

---

## 🆘 DÉPANNAGE

| Problème | Solution |
|----------|----------|
| Page blanche | Vérifiez que les 3 serveurs sont lancés |
| "Erreur de connexion" | Relancez PocketBase |
| Fichier non généré | Vérifiez que les CSV sont dans `csv_sources/` |
| Port déjà utilisé | Fermez les autres applications ou changez le port |

---

## 📞 SUPPORT

Pour toute question technique :
- **Email** : contact@novi-connected.fr
- **Documentation complète** : Voir le dossier `docs/`

---

## ✅ CHECKLIST DE LIVRAISON

- [ ] Package ZIP extrait
- [ ] Dépendances installées (pip, npm)
- [ ] Connexion testée (admin@orsg.fr)
- [ ] Génération "Éducation 2022" testée
- [ ] ZIP téléchargé et vérifié

---

*Livré par N.O.V.I. Connected - Janvier 2026*
