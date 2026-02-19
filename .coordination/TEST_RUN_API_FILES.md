# 🧪 TEST RUN : API /api/files (Historique)

**Date** : 13 Février 2026  
**Durée estimée** : 1-2 heures  
**Objectif** : Valider le workflow vibecoding avec les 3 agents

---

## 🎯 Objectif du Test

Créer l'endpoint **GET /api/files** qui :
- Scanne le dossier `Backend/output/`
- Retourne la liste des fichiers ZIP générés
- Permet à la page Historique d'afficher les fichiers téléchargeables

---

## 👤 ÉTAPE 1 : L'ARCHITECTE (20 min)

### Outil : ChatGPT 5.3 Codex (o1) ou Cline

### Prompt à utiliser :
```
Lis le fichier .coordination/PRISME_ARCHITECTE.md puis .coordination/HANDOFF.md.

Ta mission : Créer un test pytest pour valider l'endpoint GET /api/files.

Le test doit vérifier que :
1. L'endpoint répond avec status 200
2. Le JSON retourné est un array
3. Chaque élément contient les champs : filename, date, size, theme

Crée le fichier Backend/test_api_files.py avec ce test.

Documente ensuite dans .coordination/HANDOFF.md la spécification exacte 
du format JSON attendu.
```

### Livrable attendu :
- Fichier : `Backend/test_api_files.py`
- Documentation dans `.coordination/HANDOFF.md`

### Exemple de test attendu :
```python
import pytest
import requests

def test_api_files_returns_valid_json():
    """Vérifie que GET /api/files retourne un JSON valide"""
    response = requests.get('http://127.0.0.1:8090/api/files')
    
    assert response.status_code == 200
    data = response.json()
    
    assert isinstance(data, list)
    if len(data) > 0:
        assert 'filename' in data[0]
        assert 'date' in data[0]
        assert 'size' in data[0]
```

---

## 🔧 ÉTAPE 2 : LE MOTEUR (30 min)

### Outil : Claude Code (Antigravity)

### Prompt à utiliser :
```
Lis le fichier .coordination/PRISME_MOTEUR.md puis .coordination/HANDOFF.md.

Ta mission : Créer l'endpoint GET /api/files dans Backend/generate_reports.py.

L'endpoint doit :
1. Scanner le dossier Backend/output/
2. Lister tous les fichiers .zip
3. Pour chaque fichier, extraire :
   - filename (nom du fichier)
   - date (date de modification)
   - size (taille en MB)
   - theme (déduit du nom du fichier)

4. Retourner un JSON au format documenté dans HANDOFF.md

5. Le test Backend/test_api_files.py doit passer ✅

Important : Utilise le framework PocketBase déjà en place.
Ne crée pas de nouveau serveur.
```

### Livrable attendu :
- Endpoint fonctionnel dans `Backend/generate_reports.py` ou nouveau fichier `Backend/api_routes.py`
- Test qui passe : `pytest Backend/test_api_files.py`
- Documentation dans `.coordination/HANDOFF.md`

### Format JSON attendu (exemple) :
```json
[
  {
    "filename": "educ_2022.zip",
    "date": "2026-02-13",
    "size": "1.2 MB",
    "theme": "Education"
  },
  {
    "filename": "alloc_2023.zip",
    "date": "2026-02-12",
    "size": "850 KB",
    "theme": "Allocataires"
  }
]
```

### Vérification manuelle :
```bash
# Tester l'API avec curl
curl http://127.0.0.1:8090/api/files

# Doit retourner un JSON valide
```

---

## 🎨 ÉTAPE 3 : L'INTERFACE (30 min)

### Outil : Kilocode ou Gemini Web

### Prompt à utiliser :
```
Lis le fichier .coordination/PRISME_INTERFACE.md puis .coordination/HANDOFF.md.

Ta mission : Connecter la page Frontend/src/pages/HistoryPage.tsx à l'API GET /api/files.

1. Crée un service API dans Frontend/src/services/api.ts :
   - Fonction getFiles() qui appelle http://127.0.0.1:8090/api/files

2. Modifie Frontend/src/pages/HistoryPage.tsx :
   - Utilise React Query pour charger les fichiers
   - Affiche un Spinner pendant le chargement
   - Affiche un tableau avec les colonnes : Nom, Date, Taille, Thème, Action
   - Bouton "Télécharger" pour chaque fichier

3. Respecte les directives UX :
   - Message "Aucun fichier disponible" si liste vide
   - Gestion d'erreur si le backend ne répond pas

Important : Ne touche PAS au code Python.
Consomme UNIQUEMENT l'API documentée dans HANDOFF.md.
```

### Livrable attendu :
- Service : `Frontend/src/services/api.ts`
- Page modifiée : `Frontend/src/pages/HistoryPage.tsx`
- Page fonctionnelle dans le navigateur : http://localhost:5173

### Vérification visuelle :
1. Lancer le frontend : `cd Frontend && npm run dev`
2. Ouvrir http://localhost:5173
3. Naviguer vers "Historique"
4. Voir la liste des fichiers générés

---

## ✅ VALIDATION FINALE (10 min)

### Checklist du Test Run :

- [ ] Le test `pytest Backend/test_api_files.py` passe ✅
- [ ] L'API répond : `curl http://127.0.0.1:8090/api/files` retourne JSON valide
- [ ] La page Historique affiche les fichiers dans le navigateur
- [ ] Le fichier `.coordination/HANDOFF.md` est à jour avec les 3 sections :
  - L'ARCHITECTE → LE MOTEUR
  - LE MOTEUR → L'INTERFACE
  - L'INTERFACE → L'ARCHITECTE

---

## 🎓 APPRENTISSAGES

### Ce test vous apprend :

1. **Workflow Contract-First** : Le test d'abord, le code ensuite
2. **Coordination via HANDOFF.md** : Chaque agent documente son travail
3. **Séparation des rôles** : Architecte/Moteur/Interface ne se mélangent pas
4. **MCP si besoin** : Utiliser Context7 pour les syntaxes React/Python à jour

### Si ça ne fonctionne pas :

1. **Test échoue** → L'Architecte relit HANDOFF.md et ajuste le test
2. **API plante** → Le Moteur relit PRISME_MOTEUR.md (Fail Closed !)
3. **Frontend ne compile pas** → L'Interface utilise Context7 pour vérifier la syntaxe React

---

## 📊 RÉSULTAT ATTENDU

**Après ce test** :
- ✅ Workflow vibecoding validé
- ✅ Page Historique fonctionnelle
- ✅ Équipe d'agents coordonnée
- ✅ Prêt pour le Jour 1 complet demain (14/02)

**Si succès** : Vous avez votre premier deliverable en 1-2h ! 🚀

**Si problème** : On débug ensemble et on ajuste le workflow.

---

**Bonne chance ! Et n'oubliez pas : TOUT documenter dans HANDOFF.md** 📝
