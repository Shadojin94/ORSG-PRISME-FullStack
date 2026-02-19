# 🔄 HANDOFF - Coordination Agents IA

**Date de démarrage** : 14 Février 2026  
**Livraison cible** : 20 Février 2026

---

## 📋 INSTRUCTIONS D'UTILISATION

Ce fichier est le **point de coordination central** entre les 3 agents IA :
- **L'ARCHITECTE** (ChatGPT 5.3 Codex)
- **LE MOTEUR** (Claude Opus 4.6)
- **L'INTERFACE** (Gemini 3 Pro)

### Workflow quotidien :

1. **MATIN** : Lire ce fichier pour connaître l'état des travaux
2. **TRAVAIL** : Chaque agent travaille dans son périmètre
3. **SOIR** : Mettre à jour ce fichier avec ce qui a été livré

---

## 📅 JOUR 0 (13 Février 2026) - Mise en Place

### ✅ TERMINÉ
- [x] Création du contexte projet : `CONTEXTE_AGENTS_IA_2026.md`
- [x] Création du dossier `.coordination/`
- [x] Création de ce fichier `HANDOFF.md`
- [x] Structure projet clarifiée (Backend/ + Frontend/)

### ⏳ EN ATTENTE
- [ ] Création des 3 Skills.md (PRISME_ARCHITECTE.md, PRISME_MOTEUR.md, PRISME_INTERFACE.md)
- [ ] Lecture du contexte par tous les agents
- [ ] Démarrage du Jour 1 (14/02)

---

## 📅 TEST RUN (13 Février 2026) - API /api/files

### 📋 L'ARCHITECTE → LE MOTEUR

**Tests créés** : ✅ TERMINÉ
- [x] `Backend/test_api_files.py`
  - Vérifie que GET /api/files retourne status 200
  - Vérifie que la réponse est un array JSON
  - Vérifie que chaque élément contient : filename, date, size, theme
  - Commande de test : `python -m pytest Backend/test_api_files.py`

**Spécification Format JSON** :
```json
[
  {
    "filename": "educ_2022.zip",
    "date": "2026-02-14",
    "size": "1.2 MB",
    "theme": "Education"
  },
  {
    "filename": "alloc_2023.zip",
    "date": "2026-02-13",
    "size": "850 KB",
    "theme": "Allocataires"
  }
]
```

**Règles d'implémentation pour Le Moteur** :
1. Scanner le dossier `Backend/output/`
2. Lister tous les fichiers `.zip`
3. Extraire la date de modification du fichier
4. Calculer la taille en MB ou KB
5. Déduire le thème du nom de fichier (ex: `educ_2022.zip` → "Education")

**Status** : ✅ Test créé, en attente implémentation Moteur

---

## 📅 JOUR 1 (14 Février 2026) - Tests + Open Data

### 📋 L'ARCHITECTE → LE MOTEUR

**Tests à créer** :
- [ ] `Backend/test_opendata_structure.py`
  - Vérifier les 5 onglets Excel : Commune, Region, DOM, France Hexagonale, France Entière
  - Vérifier le code couleur Orange (#FFC000) sur les cellules modifiées
  - Commande de test : `python -m pytest Backend/test_opendata_structure.py`

**Status** : ⏳ En attente

---

### 🔧 LE MOTEUR → L'INTERFACE

**API créée** : ✅ TERMINÉ (13 Février 2026)
- [x] Endpoint : `GET /api/files` (file_server.js, port 3001)
- [x] Description : Retourne la liste des fichiers .zip générés dans `Backend/output/`
- [x] Scanne le dossier, extrait date de modification, taille, thème depuis themes_config.json
- [x] Fail Closed : retourne `[]` si erreur ou dossier vide

**Format réponse** :
```json
[
  {
    "filename": "educ_2022.zip",
    "date": "2026-02-10",
    "size": "33 KB",
    "theme": "Éducation"
  },
  {
    "filename": "alloc_2023.zip",
    "date": "2026-02-10",
    "size": "31 KB",
    "theme": "Allocataires prestations sociales"
  }
]
```

**Tests manuels** :
```bash
# Test curl (port 3001 = file_server.js, PAS 8090)
curl http://127.0.0.1:3001/api/files

# Résultat : JSON array avec 34 fichiers ZIP (au 13/02/2026)
```

**Tests automatisés** :
```bash
python -m pytest Backend/test_api_files.py -v
# 2 tests passent : format JSON + liste vide
```

**Note technique** : Le test a été corrigé pour cibler port 3001 (file_server.js)
au lieu de 8090 (PocketBase = auth seulement, pas d'API fichiers).

**Status** : ✅ Implémenté & Testé

---

### 🎨 L'INTERFACE → L'ARCHITECTE

**Page à modifier** :
**Page à modifier** :
- [x] `Frontend/src/pages/HistoryPage.tsx`
- [x] Action : Consommer l'API `GET /api/files`
- [x] Affichage : Tableau avec colonnes (Nom, Date, Taille, Thème, Action Télécharger)

**Validation UX** :
- [x] Spinner affiché pendant le chargement
- [x] Message "Aucun fichier disponible" si liste vide
- [x] Bouton "Télécharger" fonctionnel pour chaque fichier

**Status** : ✅ Terminé (Code prêt, en attente Backend)

---

## 📅 JOURS SUIVANTS (Placeholders)

### JOUR 2 (15 Février) - Backend → Frontend
*(À compléter par les agents)*

### JOUR 3 (16 Février) - Sécurité
*(À compléter par les agents)*

### JOURS 4-7 (17-20 Février) - Tests E2E + Packaging
*(À compléter par les agents)*

---

## 🚨 PROBLÈMES / BLOCAGES

*(Les agents documentent ici les problèmes rencontrés)*

**Aucun problème signalé pour le moment.**

---

## 💡 NOTES & APPRENTISSAGES

*(Les agents documentent ici les découvertes utiles pour la suite)*

**Aucune note pour le moment.**

---

## ✅ CHECKLIST DE VALIDATION FINALE (20 Février)

- [ ] 9 thèmes générables via Open Data (autonomie client)
- [ ] Tous les fichiers Excel respectent format Géoclip (5 onglets)
- [ ] Code couleur Orange (#FFC000) présent
- [ ] Page Historique fonctionnelle
- [ ] Authentification 2FA opérationnelle
- [ ] Pas de crash si données manquantes (colonnes vides + log)
- [ ] Script d'installation testé sur machine vierge
- [ ] Manuel utilisateur créé (PDF)
- [ ] Archive ZIP finale prête

---

**Rappel** : Mettre à jour ce fichier **matin et soir**. C'est le seul moyen d'éviter que les agents se marchent sur les pieds !
