# PROMPT CORRECTIONS ORSG — 17 avril 2026 — DEADLINE 14h

> **CONTEXTE** : Projet PRISME (plateforme d'automatisation de fichiers Excel pour Geoclip/PRISME ORSG-CTPS). Livraison faite le 2 avril. Réunion client le 2 avril a identifié des corrections. Le client attend aujourd'hui une plateforme corrigée sur https://orsgdemo.console.cercleonline.com/. Chaque minute passée sur ce projet est gratuite — on corrige, on pousse, on ferme.

## STACK

- **Backend** : Node.js (`file_server.js` — 18 endpoints), Python (`prisme_engine.py`, `generate_from_opendata.py`), PocketBase 0.21.5 (auth + BDD, port 8090)
- **Frontend** : React 19.2 + TypeScript, Vite 7.2, Tailwind 4.1, Recharts, React Router 7.10, PocketBase SDK
- **Déploiement** : Docker + Coolify, repo GitHub `Shadojin94/ORSG-PRISME-FullStack`
- **URL prod** : https://orsgdemo.console.cercleonline.com/
- **Config PocketBase** : `.env` dans `Backend/` (admin: `cedric.atticot@live.fr` / `PrismeAdmin2026!`)

## CORRECTIONS A FAIRE — PAR ORDRE DE PRIORITÉ

### 1. CORRIGER LE LIBELLÉ SUICIDE (2 min)

**Fichier** : `Frontend/src/data/bdi_themes.ts`
**Ligne** : Dans la section `id: "comportements"`, sous-thème `id: "suicide"`
**Problème** : Le breadcrumb/chemin affiche "Mortalité liée à l'alcool" quand on navigue vers Suicide
**Fix** : Vérifier que le dataset sous `suicide` a bien `label: "Mortalité par suicide"` (c'est déjà le cas dans le code, le problème est probablement dans le composant de navigation qui utilise le mauvais parent ou le breadcrumb qui prend le dataset précédent). Chercher dans les composants de thématique comment le breadcrumb est construit et corriger.

### 2. RETIRER LES TAUX DE L'OUTIL D'AUTOMATISATION (15 min)

**Contexte** : Les taux (tx_*) sont calculés par PRISME, pas par l'outil d'automatisation. Ils ne doivent PAS apparaître comme indicateurs sélectionnables dans la page de génération de fichiers.

**Fichier principal** : `Frontend/src/data/bdi_themes.ts`
**Action** : Pour CHAQUE dataset qui a `tool: "Calcul"`, il ne doit PAS être sélectionnable dans le parcours de génération de fichiers. Options :
- Soit ajouter une propriété `calculatedByPrisme: true` à chaque dataset avec `tool: "Calcul"` et filtrer dans le composant de sélection
- Soit les retirer de la liste des datasets affichés dans la page thématiques/génération (mais les garder dans le référentiel BDI pour consultation)

**Datasets concernés** (tous ceux avec `tool: "Calcul"`) :
- `tx_non_sco` (Part des jeunes non scolarisés)
- `tx_peu_dipl` (Part des peu diplômés)
- `tx_actifs` (Taux d'activité)
- `rapp_ouvriers_cadres` (Rapport ouvriers/cadres)
- `tx_fecondite`, `tx_natalite`
- `tx_inf3ans`
- `tx_accroiss`
- `tx_acci`, `tx_blesses`, `tx_morts` (traumatismes)
- `tx_noyades`, `tx_noyades_deces`
- Tous les `tx_*` dans pathologies, etc.

**IMPORTANT** : Ne PAS supprimer ces datasets du fichier. Les marquer comme `calculatedByPrisme: true` et les filtrer dans l'UI de génération. Ils doivent rester visibles dans le référentiel BDI (page de consultation).

### 3. RENDRE TOUTES LES THÉMATIQUES CLIQUABLES (10 min)

**Problème** : Dans la page thématiques, certains indicateurs non-MOCA (ex: espérance de vie, noyades) ne sont pas cliquables. L'utilisateur ne peut pas naviguer vers eux pour importer des données.

**Cause probable** : La logique de rendu conditionne le clic sur la disponibilité de fichiers CSV dans `csv_sources/`. Si aucun fichier CSV n'est trouvé, le lien est désactivé.

**Fix** : Tous les indicateurs doivent être cliquables, même si aucune donnée n'est encore importée. L'utilisateur doit pouvoir naviguer vers n'importe quel indicateur pour :
- Voir les détails
- Importer un fichier CSV/Excel (MOCA ou autre)
- Choisir la source (MOCA, open data, ou import manuel)

Chercher dans les composants Frontend la condition qui désactive le clic et la retirer ou l'assouplir.

### 4. PERMETTRE L'IMPORT DE FICHIERS CSV/EXCEL HORS MOCA (30 min)

**Problème** : L'outil n'accepte que les fichiers au format MOCA. Or certaines données viennent de sources externes (baromètre accidents, enquête noyades SPF) en CSV/Excel standard.

**Backend** : `Backend/file_server.js` — endpoint d'upload/import (chercher les routes POST qui gèrent l'upload de fichiers CSV dans `csv_sources/`)
**Backend** : `Backend/prisme_engine.py` — le moteur de génération qui lit les CSV sources
**Config** : `Backend/themes_config.json` — les datasets `route`, `noyades`, `suicide` N'EXISTENT PAS encore dans cette config. Il faut les ajouter.

**Actions** :
1. Ajouter les datasets `route`, `noyades`, `comp_mortalite` (suicide) dans `themes_config.json` avec la bonne structure
2. Dans le frontend, au lieu de forcer "MOCA-O" ou "Open Data" comme seules sources, ajouter une option "Import fichier CSV/Excel" qui permet d'uploader un fichier quelconque
3. Le backend doit accepter ce fichier, le stocker dans `csv_sources/`, et le rendre disponible pour la génération

### 5. GESTION DES UTILISATEURS — TOUT LE MONDE EN ADMIN (5 min)

**Contexte** : Les utilisateurs ORSG doivent tous être administrateurs. Surtout Marie-Josiane Castor.

**Action** : Via PocketBase, mettre à jour les rôles de tous les utilisateurs existants en "admin". Vérifier dans `Backend/file_server.js` comment les rôles sont gérés (collection `users` PocketBase, champ `role`).

**Utilisateurs connus** :
- Naïssa Chateau Remy (naissa.chateau@ors-guyane.org) → admin
- Marie-Josiane Castor → admin (PRIORITAIRE)
- Manuela → admin
- Jessie → admin
- Cédric Atticot (cedric.atticot@live.fr) → admin (déjà le cas)

Si tu n'as pas accès direct à PocketBase en prod, prépare un script `Backend/set_all_admin.py` qui se connecte à PB et met tout le monde en admin, ou fais-le via l'API PocketBase.

### 6. VÉRIFIER LA DATA — TOUS LES DATASETS EXISTANTS FONCTIONNENT (10 min)

**Action** : Vérifier que les datasets qui étaient déjà fonctionnels (éducation, population, mortalité en open data) fonctionnent toujours après les modifications. Pas de régression.

- Lancer le backend localement (`node Backend/file_server.js`)
- Tester la génération d'un fichier éducation 2021 (MOCA)
- Tester la génération d'un fichier mortalité (open data)
- Vérifier que le ZIP contient les 5 niveaux géographiques

### 7. BUILD + PUSH + DÉPLOIEMENT (5 min)

**Actions** :
1. `cd Frontend && npm run build` — vérifier que le build TypeScript passe sans erreur
2. `git add -A && git commit -m "fix: corrections post-livraison 17 avril (taux, libellés, import CSV, rôles admin)"`
3. `git push origin main`
4. Coolify devrait auto-déployer depuis le repo GitHub
5. Vérifier que https://orsgdemo.console.cercleonline.com/ charge correctement

## FICHIERS CLÉS À MODIFIER

| Fichier | Quoi |
|---------|------|
| `Frontend/src/data/bdi_themes.ts` | Libellé suicide, marquer les taux comme `calculatedByPrisme` |
| `Frontend/src/pages/` ou `Frontend/src/components/` | Breadcrumb suicide, thématiques cliquables, filtrage des taux dans la génération |
| `Backend/themes_config.json` | Ajouter datasets `route`, `noyades`, `comp_mortalite` |
| `Backend/file_server.js` | Endpoint import CSV générique (pas que MOCA) |
| `Backend/prisme_engine.py` | Parser CSV pour les nouvelles sources non-MOCA |
| PocketBase (via API ou script) | Rôles utilisateurs → tous admin |

## CONTRAINTES

- **ZERO régression** sur les fonctionnalités existantes (éducation, population, mortalité)
- **Le build doit passer** (`tsc -b && vite build`)
- **Le code doit être poussé** sur `origin main` (GitHub: Shadojin94/ORSG-PRISME-FullStack)
- **Coolify auto-déploie** — vérifier que le Dockerfile fonctionne
- **Ne PAS toucher** aux credentials, au SMTP, aux clés API
- **Ne PAS ajouter de nouvelles dépendances** sauf absolue nécessité

## ORDRE D'EXÉCUTION

1. Corrections Frontend (libellé, taux, cliquabilité) — points 1, 2, 3
2. Backend (import CSV, themes_config) — point 4
3. PocketBase users — point 5
4. Tests locaux — point 6
5. Build + push — point 7
