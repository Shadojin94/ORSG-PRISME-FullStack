# PRISME - Document RAG pour Refonte UI/UX

> **Objectif** : Fournir toutes les informations necessaires a Gemini pour redesigner l'interface utilisateur (UI) et le parcours utilisateur (UX) de l'application PRISME, **sans toucher au backend ni aux couches de service/API frontend** pour eviter toute regression.

---

## 1. CONTEXTE PROJET

### 1.1 Qu'est-ce que PRISME ?
PRISME est un generateur automatise de fichiers Excel destines a etre importes dans **Geoclip** (plateforme d'observatoire cartographique). Il est utilise par l'**ORSG-CTPS** (Observatoire Regional de la Sante de Guyane) pour transformer des donnees CSV en fichiers Excel structures par theme, annee et niveau geographique.

### 1.2 Utilisateurs cibles
- **Naissa CHATEAU REMY** : Chargee d'etudes sante publique, utilisatrice principale
- **Equipe ORSG** : 3-4 personnes, competences techniques limitees
- **Profil type** : Non-developpeur, besoin d'une interface simple et guidee en francais

### 1.3 Cas d'usage principal
1. L'utilisateur se connecte
2. Choisit un theme/dataset (ex: Education, Population, Revenus...)
3. Choisit une annee
4. Lance la generation
5. Telecharge le fichier ZIP resultant
6. Importe ce fichier dans Geoclip

---

## 2. ARCHITECTURE TECHNIQUE - CE QU'IL FAUT SAVOIR

### 2.1 Stack
- **Frontend** : React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend** : Node.js (file_server.js port 3001) + Python (prisme_engine.py / generate_from_opendata.py)
- **Auth** : PocketBase (port 8090) - mode demo avec localStorage
- **Build** : `npm run build` dans Frontend/ produit le dossier `dist/`

### 2.2 Ports
| Service | Port | Usage |
|---------|------|-------|
| Frontend dev (Vite) | 5173 | Dev seulement |
| File Server (production) | 3001 | API + Frontend dist |
| PocketBase | 8090 | Auth seulement |

### 2.3 Proxy Vite (dev mode)
En dev, Vite proxy les appels `/api/*` vers `http://localhost:3001` en supprimant le prefixe `/api`. Le file_server.js gere les deux cas (avec et sans `/api/` prefix).

---

## 3. CONTRAT API - ENDPOINTS BACKEND

> **CRITIQUE** : Ces endpoints sont implementes dans `file_server.js` et doivent etre appeles exactement comme decrit. Ne pas modifier les URLs, les methodes HTTP, ni les formats de reponse.

### 3.1 Endpoints de lecture (GET)

#### `GET /api/health`
```json
// Response
{ "status": "ok", "version": "4.0" }
```

#### `GET /api/themes`
Retourne l'arbre hierarchique des themes depuis `themes_config.json`.
```json
// Response
{
  "success": true,
  "themes": [
    {
      "id": "pop_cond_vie",
      "title": "Population et Conditions de Vie",
      "subThemes": [
        {
          "id": "population",
          "title": "Population",
          "subThemes": [...],
          "datasets": ["structure_quinq", "structure_grp"]
        }
      ]
    }
  ]
}
```

#### `GET /api/datasets`
Retourne les metadonnees de tous les datasets.
```json
// Response
{
  "success": true,
  "datasets": {
    "educ": {
      "id": "educ",
      "name": "Scolarisation et diplomes",
      "folderPath": "Education/Educ",
      "fileName": "educ",
      "sheets": ["com", "reg", "dom", "fh", "fra"],
      "variables": ["scol_6_16", "dip_brevet", ...]
    }
  }
}
```

#### `GET /api/available-years?dataset={datasetId}`
Retourne les annees disponibles pour un dataset (mode standard MOCA-O).
```json
// Response
{ "success": true, "years": [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022] }
```

#### `GET /api/available-years-opendata?dataset={datasetId}`
Retourne les annees disponibles pour un dataset (mode Open Data INSEE).
```json
// Response
{ "success": true, "years": [2017, 2018, 2019, 2020, 2021, 2022] }
```

#### `GET /api/check-csv?dataset={datasetId}`
Verifie si les fichiers CSV necessaires sont presents.
```json
// Response
{
  "success": true,
  "available": true,
  "found": [{ "variable": "scol_6_16", "pattern": "educ", "file": "educ_973.csv" }],
  "missing": []
}
```

#### `GET /api/dataset-info?id={datasetId}`
Retourne les infos detaillees d'un dataset.
```json
// Response
{
  "success": true,
  "dataset": {
    "id": "educ",
    "name": "Scolarisation et diplomes",
    "folderPath": "Education/Educ",
    "fileName": "educ",
    "sheets": ["com", "reg", "dom", "fh", "fra"],
    "variables": ["scol_6_16", "dip_brevet"],
    "csvAvailability": { "available": true, "found": [...], "missing": [] }
  }
}
```

#### `GET /api/files`
Liste les fichiers generes (historique).
```json
// Response (array directement, pas d'objet wrapper)
[
  { "filename": "educ_2022.zip", "date": "2026-02-15", "size": "145 KB", "theme": "Scolarisation et diplomes" },
  { "filename": "revenu_opendata_2023.zip", "date": "2026-02-16", "size": "89 KB", "theme": "revenu" }
]
```

#### `GET /api/download/{filename}`
Telecharge un fichier genere (.zip ou .xlsx). Reponse binaire avec `Content-Disposition: attachment`.

### 3.2 Endpoints d'action (POST)

#### `POST /api/generate?theme={datasetId}&year={year}`
Genere un fichier Excel en mode standard (MOCA-O CSV).
```json
// Response succes
{ "success": true, "filename": "educ_2022.zip", "message": "File generated: educ_2022.zip" }
// Response erreur
{ "success": false, "error": "CSV file not found for variable scol_6_16" }
```

#### `POST /api/generate-opendata?theme={datasetId}&year={year}`
Genere un fichier Excel en mode Open Data (sources INSEE/CAF/IRCOM).
```json
// Response succes
{ "success": true, "filename": "educ_opendata_2022.zip", "message": "Open Data file generated: educ_opendata_2022.zip" }
// Response erreur
{ "success": false, "error": "Theme non supporte pour Open Data..." }
```

**Themes supportes en Open Data** : `educ`, `pers_sup65ans_seules`, `familles_mono`, `pop_inf3ans`, `pers_menages`, `types_menages`, `alloc`, `revenu`, `densite`

#### `POST /api/reload-config`
Recharge la config serveur.
```json
{ "success": true, "message": "Config reloaded" }
```

#### `POST /api/upload` (FormData)
Upload de fichiers CSV. Attend un `FormData` avec un champ `file`.

---

## 4. FICHIERS FRONTEND - ZONES INTERDITES vs ZONES LIBRES

### 4.1 NE PAS MODIFIER (risque de regression)

| Fichier | Raison |
|---------|--------|
| `src/services/api.ts` | Couche API - tous les appels backend. Contrat strict. |
| `src/hooks/useThemes.ts` | Hook de chargement themes/datasets/annees. Connecte a l'API. |
| `src/data/bdi_themes.ts` | Arborescence BDI complete - source de verite pour les themes. |
| `src/lib/utils.ts` | Utilitaire `cn()` (clsx + tailwind-merge). |
| `vite.config.ts` | Config Vite avec proxy vers backend. |
| `tsconfig*.json` | Config TypeScript. |

### 4.2 PEUT ETRE MODIFIE LIBREMENT (UI/UX seulement)

| Fichier | Contenu actuel | Ce qu'on peut changer |
|---------|----------------|----------------------|
| `src/pages/LoginPage.tsx` | Login 2 etapes (email + code 2FA) | Design, animations, layout. Garder la logique localStorage. |
| `src/pages/DashboardPage.tsx` | Stats hardcodees + liens rapides | Tout (c'est du statique) |
| `src/pages/GeneratorPage.tsx` | Wizard 5 etapes | Layout, design, flow UX. **Garder les appels API et la logique de generation.** |
| `src/pages/HistoryPage.tsx` | Table de fichiers | Design, filtres. Garder `getFiles()` et `getDownloadUrl()`. |
| `src/pages/ProfilePage.tsx` | 3 tabs profil | Tout (statique/demo) |
| `src/pages/AdminUsersPage.tsx` | Gestion users | Tout (mode simulation) |
| `src/pages/DocsPage.tsx` | Reference BDI | Design. Garder import de `bdi_themes.ts`. |
| `src/pages/SupportPage.tsx` | 2 cartes contact | Tout (statique) |
| `src/components/layout/AppLayout.tsx` | Layout wrapper | Structure, sidebar width, responsive |
| `src/components/layout/Sidebar.tsx` | Navigation laterale | Design, items menu, responsive |
| `src/components/UploadCSV.tsx` | Upload drag-and-drop | Design. Garder l'appel POST `/api/upload`. |
| `src/index.css` | Variables CSS, couleurs ORSG | Couleurs, typographie, animations |

### 4.3 PEUT CREER DE NOUVEAUX FICHIERS
- Nouveaux composants UI dans `src/components/`
- Nouveaux hooks dans `src/hooks/` (qui utilisent les fonctions existantes de `api.ts`)
- Nouveaux fichiers CSS/styles

---

## 5. ARBORESCENCE DES THEMES BDI

L'arborescence est definie dans `src/data/bdi_themes.ts`. C'est la **source de verite** pour le frontend. Voici la structure complete :

### 5.1 Les 6 themes principaux

| ID | Titre | Icone | Couleur | Sous-themes |
|----|-------|-------|---------|-------------|
| `pop_cond_vie` | Population et Conditions de Vie | Users | blue-600 | 5 sous-themes |
| `etat_sante` | Etat de Sante | HeartPulse | green-600 | 2 sous-themes |
| `struct_acti_soins` | Structures et Activites de Soins | Stethoscope | cyan-600 | 3 sous-themes |
| `pathologies` | Pathologies | Activity | red-600 | 7 sous-themes |
| `comportements` | Comportements | AlertTriangle | amber-600 | 2 sous-themes |
| `traumatismes` | Traumatismes | Car | orange-600 | 2 sous-themes |

### 5.2 Hierarchie detaillee

```
pop_cond_vie (Population et Conditions de Vie)
├── population (Population)
│   ├── structure_pop (Structure de la population)
│   │   ├── densite                    [Non disponible]
│   │   ├── structure_quinq            [PRET - 2020-2022]
│   │   └── structure_grp              [PRET - 2020-2022]
│   ├── naissance_fecondite
│   │   ├── indice_fecondite           [PRET - 2022-2023]
│   │   └── fecondite                  [PRET - 2022-2023]
│   ├── petite_enfance
│   │   └── pop_inf3ans                [PRET - 2020-2023]
│   └── personnes_agees
│       └── accroiss_sup65ans          [Non disponible]
├── education
│   └── educ                           [PRET - 2015-2022]
├── emploi_revenu
│   ├── emploi
│   │   └── emplois                    [PRET - 2020-2022]
│   └── revenu
│       └── revenu                     [PRET - 2021-2023]
├── prestations_sociales
│   └── alloc                          [PRET - 2020-2023]
└── conditions_vie
    ├── cond_vie_anciens
    │   └── pers_sup65ans_seules       [PRET - 2020-2022]
    ├── cond_vie_enfants
    │   ├── familles_mono              [PRET - 2020-2022]
    │   └── accueil_pop_inf3ans        [Non disponible]
    └── cond_vie_generales
        ├── pers_menages               [Non disponible]
        └── types_menages              [PRET - 2020-2021]

etat_sante (Etat de Sante)
├── esperance_vie → esp_vie            [Non disponible]
└── mortalite
    ├── dc_gene_prema                  [Non disponible]
    └── dc_infantil_neonat             [Non disponible]

struct_acti_soins (Offre de Soins)
├── equipements → equipements_acti     [Non disponible]
├── activites → recours_hospi          [Non disponible]
└── professionnels
    ├── ds_med                         [Non disponible]
    ├── ds_gene_tousmode               [Non disponible]
    ├── ds_medspe                      [Non disponible]
    ├── apl_medgene                    [Non disponible]
    └── autres_prof_med_pha            [Non disponible]

pathologies
├── cardiovasculaire
│   ├── mortalite_cardio               [Non disponible]
│   └── prevalence_cardio              [Non disponible]
├── respiratoire → mortalite_respi     [Non disponible]
├── neurologique → mortalite_neuro     [Non disponible]
├── cancers → mortalite_cancer         [Non disponible]
├── metabolique → mortalite_diabete    [Non disponible]
├── infectieuses → mortalite_vih       [Non disponible]
└── troubles_mentaux → mortalite_psy   [Non disponible]

comportements
├── addictions
│   ├── comp_mortalite_alcool          [Non disponible]
│   └── comp_mortalite_tabac           [Non disponible]
└── suicide → comp_mortalite_suicide   [Non disponible]

traumatismes
├── accidents_route → route            [Non disponible]
└── noyades → noyades                  [Non disponible]
```

### 5.3 Proprietes d'un dataset

```typescript
interface Dataset {
    id: string;           // Identifiant technique (ex: "educ")
    label: string;        // Nom affiche (ex: "Scolarisation et diplomes")
    source: string;       // Source de donnees (ex: "INSEE / MOCA-O")
    demoReady?: boolean;  // true si le dataset est fonctionnel
    availableYears?: number[]; // Annees statiques (fallback si API non dispo)
}
```

**Important** : Un dataset est considere "pret" (`demoReady: true`) quand il a des fichiers CSV disponibles et que le moteur Python peut le traiter. Les datasets sans `demoReady` sont grises dans l'UI.

### 5.4 Datasets fonctionnels (14 sur ~40)
Les datasets avec `demoReady: true` :
- `educ` (2015-2022)
- `structure_quinq` (2020-2022)
- `structure_grp` (2020-2022)
- `indice_fecondite` (2022-2023)
- `fecondite` (2022-2023)
- `pop_inf3ans` (2020-2023)
- `emplois` (2020-2022)
- `revenu` (2021-2023)
- `alloc` (2020-2023)
- `pers_sup65ans_seules` (2020-2022)
- `familles_mono` (2020-2022)
- `types_menages` (2020-2021)

---

## 6. DEUX MODES DE GENERATION

### 6.1 Mode Standard (MOCA-O)
- Utilise les CSV dans `Backend/csv_sources/`
- Appelle `POST /api/generate?theme={id}&year={year}`
- Moteur Python : `prisme_engine.py`
- Sortie : `{theme}_{year}.zip`

### 6.2 Mode Open Data (INSEE)
- Utilise les CSV dans `Backend/inputs/opendata/`
- Appelle `POST /api/generate-opendata?theme={id}&year={year}`
- Moteur Python : `generate_from_opendata.py`
- Sortie : `{theme}_opendata_{year}.zip`
- **9 themes supportes** : educ, pers_sup65ans_seules, familles_mono, pop_inf3ans, pers_menages, types_menages, alloc, revenu, densite

### 6.3 Choix du mode dans l'UI
Le mode est choisi via un toggle dans l'etape Parametres. Il n'est actif que si le dataset selectionne fait partie des 9 themes supportes. Le hook `useDatasetYears` change automatiquement d'endpoint API selon le mode.

---

## 7. PARCOURS UTILISATEUR ACTUEL (5 etapes)

### Etape 1 : Choix du Theme principal
- Affiche les 6 themes BDI en grille (3 colonnes)
- Chaque theme montre : icone, titre, description, nombre de sous-themes
- Badge vert "X Demo" pour les themes avec datasets prets
- Themes sans dataset pret sont grises (non-cliquables)

### Etape 2 : Choix du Sous-theme
- Breadcrumb de navigation (Theme > Sous-theme)
- Grille de sous-themes (2 colonnes)
- Chaque sous-theme montre : titre, nombre d'indicateurs, badges
- Sous-themes sans dataset pret sont grises

### Etape 3 : Parametres (variable selon la profondeur)
**Si le sous-theme a des sous-sous-themes** (ex: Population > Structure) :
- Selection de la categorie (3eme niveau)

**Si plusieurs datasets au meme niveau** :
- Selection du dataset specifique

**Une fois le dataset resolu** :
- Selection de l'annee (input numerique + boutons annees disponibles)
- Selection du format de sortie (3 options) :
  - Pack Complet (.zip) : tous les niveaux geographiques
  - Fichier Consolide (Type A) : un seul fichier multi-feuilles
  - Par Niveau Geographique (Type B) : un fichier pour un niveau specifique
- Toggle "Mode Open Data" (si le dataset le supporte)
- Section upload CSV (pour ajouter des sources)
- Resume de la selection

### Etape 4 : Generation
- Console de logs (fond noir, style terminal)
- Bouton "Lancer le traitement" dans la barre sticky en bas
- Appel API et affichage des logs en temps reel
- Passage automatique a l'etape 5 en cas de succes

### Etape 5 : Resultat
- Ecran de succes avec animation
- Nom du fichier genere
- Bouton "Telecharger" (vert, prominent)
- Lien "Lancer une nouvelle generation"

### Barre de navigation sticky (bas de page)
- Bouton "Retour" (gauche)
- Indicateur "Etape X sur 5" (centre)
- Bouton contextuel (droite) : "Suivant", "Lancer le traitement", ou "Nouvelle generation"
- Fixe en bas de page, fond semi-transparent avec blur

---

## 8. COMPOSANTS UI EXISTANTS

### 8.1 Layout
- **AppLayout** : Sidebar fixe (256px) + zone de contenu avec `ml-64`
- **Sidebar** : Fond bleu fonce (#1a4b8c), logo "Data Visus" avec 3 barres de couleur, 6 liens de navigation, profil utilisateur en bas
- Sidebar **non responsive** actuellement (fixe 256px)

### 8.2 Navigation (Sidebar)
| Label | Route | Icone |
|-------|-------|-------|
| Accueil | /dashboard | Home |
| Thematiques | /generate | Layers |
| Historique | /history | History |
| Referentiel BDI | /docs | BookOpen |
| Gestion Utilisateurs | /admin | Users |
| Aide & Support | /support | LifeBuoy |

### 8.3 Composants UI reutilisables
- `Card` (Radix UI) : Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `Tabs` (Radix UI) : Tabs, TabsList, TabsTrigger, TabsContent
- `UploadCSV` : Zone drag-and-drop pour upload CSV

### 8.4 Librairies d'icones
- **Lucide React** : toutes les icones utilisees viennent de lucide-react
- Icones utilisees : Users, HeartPulse, Stethoscope, Activity, AlertTriangle, Car, Home, Layers, History, BookOpen, LifeBuoy, Play, Download, Upload, Calendar, CheckCircle2, ChevronRight, Loader2, FolderOpen, Database, FileSpreadsheet, etc.

---

## 9. CHARTE GRAPHIQUE / DESIGN SYSTEM

### 9.1 Couleurs ORSG
```css
--ors-blue:    #1a4b8c   /* Bleu principal (sidebar, titres) */
--ors-teal:    #3bb3a9   /* Teal/Cyan (boutons, accents, etapes actives) */
--ors-yellow:  #f5c542   /* Jaune/Or (logo) */
--ors-green:   #4caf50   /* Vert (succes, progression, bouton generer) */
--ors-magenta: #e91e63   /* Magenta (alertes) */
--ors-orange:  #ff9800   /* Orange (avertissements) */
```

### 9.2 Typographie
- Police principale : `Poppins, 'Segoe UI', sans-serif`
- Titres : `font-bold text-[#1a4b8c]`
- Labels : `text-sm font-bold text-gray-700 uppercase tracking-wider`
- Corps : `text-gray-600`

### 9.3 Composants visuels
- Cartes : `rounded-xl border-2 shadow-sm hover:shadow-lg`
- Boutons primaires : `bg-[#3bb3a9] text-white rounded-lg font-bold hover:bg-[#2f9a91]`
- Boutons succes : `bg-[#4caf50] text-white rounded-xl font-bold`
- Badges : `text-[10px] px-2 py-0.5 rounded-full font-medium`
- Step indicator : cercles colores avec progression verte

---

## 10. LOGIQUE METIER DANS LE FRONTEND

### 10.1 Authentification (LoginPage)
```typescript
// Mode demo - code 2FA hardcode
const DEMO_CODE = "30012026";
// Stockage
localStorage.setItem("demo_authenticated", "true");
// Verification (ProtectedRoute)
localStorage.getItem("demo_authenticated") === "true"
// Deconnexion
localStorage.removeItem("demo_authenticated");
```

### 10.2 Resolution du dataset (GeneratorPage)
```typescript
// Le dataset est resolu par navigation hierarchique :
// Theme -> SubTheme -> (SubSubTheme) -> (Dataset si multiples)
const currentDatasetId = getDatasetId();

// getDatasetId() retourne :
// 1. selectedDatasetId si l'utilisateur l'a choisi
// 2. leafDatasets[0].id si un seul dataset au noeud feuille
// 3. null sinon
```

### 10.3 Detection Open Data
```typescript
const OPEN_DATA_SUPPORTED_THEMES = [
    'educ', 'pers_sup65ans_seules', 'familles_mono', 'pop_inf3ans',
    'pers_menages', 'types_menages', 'alloc', 'revenu', 'densite'
];
const isOpenDataSupported = currentDatasetId
    ? OPEN_DATA_SUPPORTED_THEMES.includes(currentDatasetId)
    : false;
```

### 10.4 Chargement des annees
```typescript
// Hook mode-aware
const { years, loading } = useDatasetYears(
    currentDatasetId,
    isOpenDataMode && isOpenDataSupported
);
// Appelle /api/available-years ou /api/available-years-opendata selon le mode
```

### 10.5 Generation
```typescript
// Appel API
const result = isOpenDataMode
    ? await api.generateOpenData(datasetId, year)
    : await api.generateExcel(datasetId, year);

// Telechargement
window.open(`/api/download/${filename}`, '_blank');
```

---

## 11. CONTRAINTES GEOCLIP

### 11.1 Structure des fichiers generes
Chaque ZIP contient des fichiers Excel organises par niveau geographique :
```
theme_year.zip
└── Theme/Year/
    ├── Commune/theme.xlsx        (22 communes de Guyane)
    ├── Region/theme.xlsx         (18 regions francaises)
    ├── DOM/theme.xlsx            (territoires d'Outre-Mer)
    ├── France_Hexagonale/theme.xlsx
    └── France_Entiere/theme.xlsx
```

### 11.2 Structure Excel
Chaque fichier `.xlsx` contient 5-7 feuilles :
- `com` : donnees communales
- `reg` : donnees regionales
- `dom` : DOM
- `fh` : France hexagonale
- `fra` : France entiere
- `code_regions` : reference codes regions
- `Dic_variables` : dictionnaire des variables

### 11.3 Nomenclature fichiers
Les noms de fichiers ZIP suivent le pattern : `{datasetId}_{year}.zip` (standard) ou `{datasetId}_opendata_{year}.zip` (Open Data).

### 11.4 Contrainte Geoclip
- **Pas d'import multi-feuilles** : Geoclip importe feuille par feuille
- Le **nom du fichier** doit correspondre a la nomenclature attendue
- Les **en-tetes** doivent correspondre exactement au dictionnaire BDI

---

## 12. SUGGESTIONS D'AMELIORATION UX

### 12.1 Points faibles actuels
1. **Wizard trop lineaire** : 5 etapes dont certaines sont redondantes (sub-sub-theme selection)
2. **Pas de responsive** : sidebar fixe 256px, non adaptee mobile/tablette
3. **Pas de feedback en temps reel** pendant la generation
4. **Historique basique** : juste un tableau, pas de filtres avances
5. **Dashboard statique** : les KPIs sont hardcodes
6. **Pas de batch generation** : un dataset a la fois
7. **Login demo** : le code 2FA est hardcode

### 12.2 Opportunites
1. **Simplifier le wizard** : Combiner les etapes 1-2 en un selecteur hierarchique
2. **Ajouter des previews** : Montrer un apercu des donnees avant generation
3. **Dashboard dynamique** : Utiliser `/api/files` pour afficher de vrais stats
4. **Responsive design** : Sidebar collapsible sur mobile
5. **Dark mode** : Toggle theme clair/sombre
6. **Notifications** : Toast pour succes/erreur au lieu de logs
7. **Favoris** : Permettre de sauvegarder des configurations frequentes
8. **Batch mode** : Generer plusieurs annees en une fois
9. **Comparaison** : Comparer les resultats entre annees

### 12.3 Ce qui fonctionne bien (a garder)
1. La **progression visuelle** (step indicator) est claire
2. Les **badges demoReady** aident a comprendre ce qui est disponible
3. Le **breadcrumb** dans les etapes 2-3 aide la navigation
4. Les **couleurs ORSG** donnent une identite visuelle
5. Le **toggle Open Data** est bien place dans les parametres
6. La **barre sticky** en bas pour la navigation etapes

---

## 13. REGLES DE REFONTE

### 13.1 Regles absolues
1. **NE JAMAIS modifier** : `api.ts`, `useThemes.ts`, `bdi_themes.ts`, `utils.ts`, `vite.config.ts`
2. **NE JAMAIS changer** les URLs d'API ni les methodes HTTP
3. **NE JAMAIS changer** les noms des fonctions exportees de `api.ts`
4. **NE JAMAIS modifier** les types/interfaces TypeScript dans `api.ts`
5. **Garder React Router** avec les memes routes
6. **Garder localStorage** pour l'authentification demo
7. **Garder les imports** de `bdi_themes.ts` et ses helpers

### 13.2 Regles souples
1. Peut **ajouter** de nouvelles routes (mais pas supprimer les existantes)
2. Peut **restructurer** les composants (creer de nouveaux, decomposer les existants)
3. Peut **changer Tailwind** classes, couleurs, spacing
4. Peut **ajouter** des animations (Framer Motion est deja installe)
5. Peut **ajouter** des librairies UI (mais preferrer ce qui existe : Radix, Lucide)
6. Peut **modifier** le flow du wizard tant que la logique de generation reste identique
7. Peut **ajouter** des hooks personnalises qui wrappent les fonctions existantes de `api.ts`

### 13.3 Test de non-regression
Apres toute modification :
1. Verifier que le login fonctionne (email + code 30012026)
2. Verifier que la navigation fonctionne (toutes les routes)
3. Verifier que la generation fonctionne :
   - Selectionner `pop_cond_vie` > `education` > `educ`
   - Annee 2022, format Pack Complet
   - Lancer la generation
   - Telecharger le ZIP
4. Verifier que l'historique affiche les fichiers
5. Verifier que le toggle Open Data fonctionne pour les 9 themes supportes
6. `npm run build` doit reussir sans erreur

---

## 14. FICHIER TYPE POUR REFERENCE

### 14.1 api.ts - Fonctions exportees (NE PAS MODIFIER)
```typescript
export async function checkHealth(): Promise<{status: string; version: string}>
export async function getThemes(): Promise<ThemeTreeNode[]>
export async function getDatasets(): Promise<Record<string, DatasetInfo>>
export async function getAvailableYears(datasetId: string): Promise<number[]>
export async function getAvailableYearsOpenData(datasetId: string): Promise<number[]>
export async function checkCsvAvailability(datasetId: string): Promise<CsvAvailability>
export async function getDatasetInfo(datasetId: string): Promise<{dataset: DatasetInfo & {...}}>
export async function generateExcel(theme: string, year: number): Promise<{success: boolean; filename?: string; error?: string}>
export async function generateOpenData(theme: string, year: number): Promise<{success: boolean; filename?: string; error?: string}>
export async function reloadConfig(): Promise<{success: boolean; message?: string}>
export function getDownloadUrl(filename: string): string
export async function getFiles(): Promise<GeneratedFile[]>
```

### 14.2 Types exportes (NE PAS MODIFIER)
```typescript
export interface ThemeTreeNode {
    id: string;
    title: string;
    icon?: string;
    color?: string;
    datasets?: string[];
    subThemes?: ThemeTreeNode[];
}

export interface DatasetInfo {
    id: string;
    name: string;
    folderPath: string;
    fileName: string;
    sheets: string[];
    variables: string[];
}

export interface CsvAvailability {
    available: boolean;
    found: Array<{variable: string; pattern: string; file: string}>;
    missing: Array<{variable: string; pattern: string}>;
}

export interface GeneratedFile {
    filename: string;
    date: string;
    size: string;
    theme: string;
}
```

### 14.3 Hooks exportes (NE PAS MODIFIER la signature)
```typescript
// useThemes.ts
export function useThemes(): {
    themes: FrontendTheme[];
    datasets: Record<string, DatasetInfo>;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    getYearsForDataset: (datasetId: string) => Promise<number[]>;
    checkAvailability: (datasetId: string) => Promise<boolean>;
}

export function useDatasetYears(datasetId: string | null, openDataMode?: boolean): {
    years: number[];
    loading: boolean;
    error: string | null;
}
```

### 14.4 bdi_themes.ts - Exports (NE PAS MODIFIER)
```typescript
export const BDI_THEMES: Theme[]
export function getFlatThemes(): FlatTheme[]
export function getThemeDatasets(themeId: string): Dataset[]
export function getSubThemes(themeId: string): SubTheme[]
```

---

## 15. DEPENDANCES INSTALLEES

```json
{
  "dependencies": {
    "@radix-ui/react-tabs": "^1.1.12",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.23.26",
    "lucide-react": "^0.479.0",
    "pocketbase": "^0.21.5",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.10.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.18",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.5.2",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3",
    "vite": "^7.2.4"
  }
}
```

---

## 16. STRUCTURE DES DOSSIERS FRONTEND

```
Frontend/src/
├── App.tsx                          # Router + ProtectedRoute + LayoutWrapper
├── index.css                        # Tailwind + ORSG colors + custom classes
├── main.tsx                         # Entry point (React 19 createRoot)
├── vite-env.d.ts                    # Vite types
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx            # Sidebar + content wrapper
│   │   └── Sidebar.tsx              # Navigation laterale
│   ├── ui/
│   │   ├── card.tsx                 # Radix Card components
│   │   └── tabs.tsx                 # Radix Tabs components
│   ├── HierarchicalThemeSelector.tsx # LEGACY - non utilise
│   └── UploadCSV.tsx                # Upload drag-and-drop
├── data/
│   └── bdi_themes.ts               # Arborescence BDI complete
├── hooks/
│   └── useThemes.ts                 # Hooks API (themes, years)
├── lib/
│   └── utils.ts                     # cn() utility
├── pages/
│   ├── LoginPage.tsx                # Auth (2 etapes)
│   ├── DashboardPage.tsx            # Accueil + stats
│   ├── GeneratorPage.tsx            # Wizard generation (950 lignes)
│   ├── HistoryPage.tsx              # Fichiers generes
│   ├── ProfilePage.tsx              # Profil utilisateur
│   ├── AdminUsersPage.tsx           # Gestion users
│   ├── DocsPage.tsx                 # Reference BDI
│   └── SupportPage.tsx              # Aide/contact
└── services/
    └── api.ts                       # Couche API backend
```

---

**FIN DU DOCUMENT RAG**

*Ce document contient tout ce qu'il faut pour redesigner l'interface sans casser le backend. En cas de doute, la regle est simple : si ca touche a un appel API ou a une source de donnees, ne pas modifier.*
