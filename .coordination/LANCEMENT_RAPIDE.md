# 🚀 LANCEMENT RAPIDE - PRISME

**Date**: 13 février 2026  
**Statut**: ✅ TEST RUN VALIDÉ

---

## ⚡ DÉMARRER L'APPLICATION (2 terminaux)

### Terminal 1 : Backend
```bash
cd C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\Backend
node file_server.js
```
→ API sur http://localhost:3001

### Terminal 2 : Frontend
```bash
cd C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\Frontend
npm run dev
```
→ Interface sur http://localhost:5173

### ✅ Tester
Ouvrir http://localhost:5173/history → Vous devriez voir 34 fichiers

---

## 📄 DOCUMENTS CRÉÉS

### Pour Vous (Cédric)
| Document | Localisation | Usage |
|----------|--------------|-------|
| **README_CEDRIC.md** | .coordination/ | Guide rapide + prompts agents |
| **TEST_RUN_VALIDATION_PRISME.docx** | /mnt/outputs/ | Rapport Word professionnel |
| **LANCEMENT_RAPIDE.md** | .coordination/ | Ce fichier (démarrage rapide) |

### Pour les Agents IA
| Document | Agent | Localisation |
|----------|-------|--------------|
| PRISME_ARCHITECTE.md | ChatGPT 5.3 | .coordination/ |
| PRISME_MOTEUR.md | Claude Opus 4.6 | .coordination/ |
| PRISME_INTERFACE.md | Gemini 3 Pro | .coordination/ |
| HANDOFF.md | Tous | .coordination/ |

### Technique
| Document | Description |
|----------|-------------|
| CONTEXTE_AGENTS_IA_2026.md | Contexte projet complet |
| VALIDATION_TEST_RUN.md | Détails techniques TEST RUN |
| RAPPORT_VALIDATION_FINALE.md | Rapport complet 385 lignes |
| TEST_RUN_API_FILES.md | Guide step-by-step |

---

## 🎯 AUJOURD'HUI (14 février) - JOUR 1

### Objectif
Implémenter génération **Open Data**

### Checklist
- [ ] Lancer Backend + Frontend
- [ ] Vérifier page Historique fonctionne
- [ ] Tester téléchargement d'un fichier
- [ ] **L'Architecte** : Créer test_opendata_structure.py
- [ ] **Le Moteur** : Coder POST /generate-opendata
- [ ] **L'Interface** : Ajouter bouton "Générer Open Data"

---

## ⚠️ RAPPELS IMPORTANTS

### Ports
- **3001** = file_server.js (API fichiers)
- **8090** = PocketBase (auth uniquement)
- **5173** = Vite (interface)

### Best Practices
1. **Contract-First** : Spec dans HANDOFF.md AVANT de coder
2. **Progressive Disclosure** : Chaque agent lit UNIQUEMENT son Skills.md
3. **Fail Closed** : Retourner [], {} au lieu de crash
4. **TDD** : Test AVANT implémentation

---

## 📞 PROMPTS AGENTS (Copier-Coller)

### ChatGPT 5.3 (L'Architecte)
```
Tu es L'ARCHITECTE du projet PRISME.
1. Lis ton Skills: C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\.coordination\PRISME_ARCHITECTE.md
2. Lis le contexte: C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\CONTEXTE_AGENTS_IA_2026.md
3. Lis la coordination: C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\.coordination\HANDOFF.md
4. Tâche: Créer le test pour Open Data (test_opendata_structure.py)
```

### Claude Opus 4.6 (Le Moteur)
```
Tu es LE MOTEUR du projet PRISME.
1. Lis ton Skills: C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\.coordination\PRISME_MOTEUR.md
2. Lis le contexte: C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\CONTEXTE_AGENTS_IA_2026.md
3. Lis la coordination: C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\.coordination\HANDOFF.md
4. Tâche: Implémenter POST /generate-opendata
```

### Gemini 3 Pro (L'Interface)
```
Tu es L'INTERFACE du projet PRISME.
1. Lis ton Skills: C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\.coordination\PRISME_INTERFACE.md
2. Lis le contexte: C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\CONTEXTE_AGENTS_IA_2026.md
3. Lis la coordination: C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\.coordination\HANDOFF.md
4. Tâche: Ajouter bouton "Générer Open Data"
```

---

## ✅ RÉSUMÉ TEST RUN

- ✅ Backend actif (port 3001, 34 fichiers)
- ✅ Frontend connecté (port 5173)
- ✅ Tests pytest 2/2 passés
- ✅ Workflow 3-agents validé
- ✅ Contract-First fonctionnel
- ✅ Fail Closed implémenté
- ✅ Deadline 20/02 maintenue

---

**Prêt pour le Jour 1 ! 💪**
