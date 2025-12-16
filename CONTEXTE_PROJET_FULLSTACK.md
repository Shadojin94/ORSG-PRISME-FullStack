# 📘 CONTEXTE PROJET ORSG - FullStack Integration
*(Généré le 16/12/2025)*

## 🚀 État Actuel du Projet
Nous avons migré d'une architecture Frontend-Only vers une architecture **Full-Stack**.
Le système est désormais fonctionnel et connecté.

### 📂 Structure des Dossiers
Le projet actif se trouve ici :
`C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack`

Il est divisé en deux parties :
*   **📂 /Frontend** : Application React (Vite + Tailwind + ShadCN).
    *   Port : `http://localhost:5173`
    *   État : Login connecté, Page "Utilisateurs" connectée.
*   **📂 /Backend** : Serveur PocketBase + Moteur Python.
    *   Port : `http://127.0.0.1:8090` (Admin: voir `.env` ou créer un admin)
    *   Script Moteur : `generate_reports.py` (surveille les fichiers en attente).
    *   Script Lancement Facile : `run_engine.bat`.

---

## 🛠️ Stack Technique & Spécificités

### 1. Authentification & Base de Données (PocketBase)
*   **Auth** : Gérée via `pocketbase` SDK (v0.21.5 pour compatibilité).
*   **Collections** :
    *   `users` : Utilisateurs de la plateforme (Synchro OK avec le front).
    *   `themes` : Thématiques BDI (Population, Santé, etc.).
    *   `inputs` : CSV uploadés par l'utilisateur (à traiter).
    *   `reports` : Rapports Excel générés (à télécharger).

### 2. Moteur de Traitement (Python)
*   **Location** : `Version_FullStack/Backend/generate_reports.py`
*   **Environnement** : Il utilise l'interpréteur Python de l'ancien projet (`ORSG_PRISME_V1/backend/venv`) car Python n'est pas installé globalement sur la machine.
*   **Fonctionnement** :
    *   Le script tourne en boucle (`while True`).
    *   Il écoute PocketBase (`status='pending'` dans `inputs`).
    *   Il télécharge le CSV, génère un Excel (mock pour l'instant), et ré-upload le résultat dans `reports`.

---

## 📅 Roadmap / Reste à Faire (Pour le prochain Agent)

Le socle est solide. Il faut maintenant implémenter les fonctionnalités métier.

### 1. Pages Frontend à Finaliser
*   **🏠 Accueil (Dashboard)** : Afficher les KPIs réels venant de PocketBase.
*   **📂 Thématiques** : Lister les thèmes BDI (déjà dans la DB).
*   **📜 Historique** : Afficher la liste des `reports` (Générés par Python).
*   **👤 Compte** : Permettre la modification du profil (Avatar, Nom).

### 2. Feature Principale : Génération de Rapports ("Le Wizard")
C'est le cœur du réacteur.
*   **Frontend** : Créer le formulaire d'upload (Drag & Drop CSV).
*   **Action** : Au clic "Générer", créer une entrée dans la collection `inputs` de PocketBase.
*   **Backend** :
    *   Le script Python va détecter cette entrée.
    *   Il doit traiter le fichier "pour de vrai" (nettoyage CSV -> Template Excel).
    *   Il met à jour le statut (Generating -> Completed).
*   **Retour Front** : Le Frontend doit afficher le nouveau rapport une fois prêt.

### 3. Gestion des Utilisateurs
*   La liste s'affiche (`AdminUsersPage`), mais il faut brancher les boutons "Modifier", "Supprimer" et "Ajouter" aux appels API PocketBase.

---

## ⚠️ Points d'Attention (Troubleshooting)
1.  **Compatibilité SDK** : Toujours utiliser `pocketbase@0.21.5` côté Front pour parler au serveur actuel.
2.  **Lancement Python** : Toujours utiliser `.\run_engine.bat` dans le dossier Backend (ne pas essayer d'appeler `python` directement).
3.  **Page Blanche** : Si une page plante, vérifier les imports React (`useEffect` oublié souvent).

---
**Message pour l'IA suivante :**
Tout est câblé. Tu peux te concentrer sur l'implémentation des vues (UI) et la logique métier (Python) sans te soucier de la config serveur/auth. Bon courage ! 🚀
