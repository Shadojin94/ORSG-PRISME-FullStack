# ORSG PRISME - Full Stack Edition

Projet de refonte de l'application PRISME pour l'Observatoire Régional de la Santé de Guyane (ORSG).

## 📂 Structure du Projet

- **Frontend/** : Application React + Vite + Tailwind CSS. Interface utilisateur Wizard.
- **Backend/** : 
  - Serveur Node.js (`file_server.js`) pour servir les fichiers et l'API.
  - Moteur Python (`generate_reports.py`) pour le traitement de données MOCA-O.
  - PocketBase pour l'authentification et le stockage de données structurées.

## 🚀 Démarrage Rapide

### 1. Backend
```bash
cd Backend
# Lancer PocketBase
./pocketbase.exe serve
# Lancer l'API & File Server (dans un autre terminal)
node file_server.js
```

### 2. Frontend
```bash
cd Frontend
npm run dev
```

### 3. Utilisation
Ouvrir http://localhost:5174/generate pour accéder au générateur.

## 📄 Documentation
Voir [CONTEXTE_PROJET_FULLSTACK.md](./CONTEXTE_PROJET_FULLSTACK.md) pour les détails techniques et l'historique.
