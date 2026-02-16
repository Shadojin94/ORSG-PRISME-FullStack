# PROMPT GEMINI - Refonte UX GeneratorPage PRISME

> **Objectif** : Réécrire `Frontend/src/pages/GeneratorPage.tsx` pour transformer le parcours utilisateur de 5 étapes confuses en **3 étapes limpides**, en appliquant les principes UX 2026 ci-dessous. **ZÉRO modification backend.**

---

## CONTEXTE PROJET

PRISME est un outil interne pour l'ORSG (Observatoire Régional de la Santé de Guyane). L'utilisatrice principale est **Naïssa**, chargée d'études en santé publique. Elle n'est **PAS technique**. Elle veut : choisir un indicateur → choisir une année → télécharger un Excel. C'est tout.

---

## PROBLÈMES UX ACTUELS (à corriger)

| # | Problème | Principe UX violé |
|---|---------|-------------------|
| 1 | **5 étapes au lieu de 3** : Thème → Sous-thème → [Sous-sous-thème → Dataset →] Params → Suivant → Lancer → Résultat = jusqu'à 7 clics | **Keep it short and simple** |
| 2 | **Step 3 = monstre** : gère sous-sous-thème + dataset + année + format + niveau géo sur un seul step logique | **Avoid Choice Overload** |
| 3 | **Toggle "Open Data"** en haut de page : l'utilisatrice ne sait pas ce que c'est, ça réinitialise tout | **Default Everything**, **Avoid Cognitive Overhead** |
| 4 | **Terminal noir avec logs** sur Step 4 : totalement inadapté pour une non-technique | **Make UI Professional and Beautiful** |
| 5 | **Deux boutons séquentiels** : "Suivant" puis "Lancer le traitement" au lieu d'un seul "Générer" | **Lessen the Burden of Action** |
| 6 | **Heading "4. Configuration finale"** affiché pendant le Step 3 de l'indicateur | **Make Progress Visible** |
| 7 | **CSV upload** mélangé dans la page de génération | **Clear the Page of Distractions** |
| 8 | **Bouton "Prêt à générer"** dans le panneau droit toujours disabled | **Call to Action** |
| 9 | **Année par défaut = 2022** fixe au lieu de la dernière année disponible | **Default Everything** |

---

## PARCOURS CIBLE : 3 ÉTAPES

```
┌─────────────────────────────────────────────────────┐
│  ÉTAPE 1 : SÉLECTION                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ Thème (cards grid)                           │   │
│  │  → click → Sous-thème (inline expand ou      │   │
│  │            slide-in, PAS une nouvelle page)   │   │
│  │    → click → Dataset (auto-select si unique)  │   │
│  └──────────────────────────────────────────────┘   │
│  Tout dans UN seul écran avec drill-down animé.     │
│  Badge "Disponible" vert = Open Data auto-détecté.  │
│  Pas de toggle Open Data. Pas de Step 2 séparé.     │
├─────────────────────────────────────────────────────┤
│  ÉTAPE 2 : CONFIGURATION                           │
│  ┌──────────────────────────────────────────────┐   │
│  │ Année : chips sélectionnables                │   │
│  │ (default = dernière année disponible)        │   │
│  │                                              │   │
│  │ Format : Pack Complet (défaut) | Consolidé   │   │
│  │ | Par Niveau (+ sélecteur si choisi)         │   │
│  │                                              │   │
│  │ ┌──────────────────────────────────────────┐ │   │
│  │ │  🟢 GÉNÉRER MON FICHIER                 │ │   │
│  │ │  (bouton unique, gros, proéminent)       │ │   │
│  │ └──────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────┘   │
│  Un seul bouton "Générer" = lance le traitement     │
│  ET passe au résultat. Pas de step intermédiaire.   │
├─────────────────────────────────────────────────────┤
│  ÉTAPE 3 : RÉSULTAT                                │
│  ┌──────────────────────────────────────────────┐   │
│  │ ✅ Succès ! (ou spinner pendant génération)  │   │
│  │                                              │   │
│  │ ┌──────────────────────────────────────────┐ │   │
│  │ │  ⬇️  TÉLÉCHARGER                        │ │   │
│  │ └──────────────────────────────────────────┘ │   │
│  │                                              │   │
│  │ [Nouvelle génération]                        │   │
│  └──────────────────────────────────────────────┘   │
│  Pendant le processing : spinner + texte simple     │
│  "Génération en cours..." (PAS de terminal/logs).   │
│  Quand terminé : bouton download + résumé.          │
└─────────────────────────────────────────────────────┘
```

---

## CONTRAINTES ABSOLUES (NE PAS MODIFIER)

### Fichiers INTERDITS de modification
- `Frontend/src/services/api.ts` - Contrat API figé
- `Frontend/src/hooks/useThemes.ts` - Hook de données figé
- `Frontend/src/data/bdi_themes.ts` - Structure BDI figée
- `Frontend/src/lib/utils.ts` - Utilitaires figés
- `Backend/*` - Aucun fichier backend
- `vite.config.ts` - Config build figée

### Fichier À MODIFIER
- **`Frontend/src/pages/GeneratorPage.tsx`** - Réécriture complète autorisée

### Fichiers OPTIONNELS à modifier/créer
- `Frontend/src/components/GeneratorWizard.tsx` - Si tu veux extraire des composants
- `Frontend/src/components/ThemeSelector.tsx` - Composant de sélection
- Tout nouveau composant dans `Frontend/src/components/`

---

## API DISPONIBLE (ne pas changer, juste utiliser)

```typescript
// Frontend/src/services/api.ts - Fonctions disponibles :

// Génération Open Data (thèmes avec demoReady: true)
api.generateOpenData(theme: string, year: number)
// → POST /api/generate-opendata?theme=educ&year=2022
// → { success: true, filename: "educ_opendata_2022.zip" }

// Génération Standard (MOCA-O)
api.generateExcel(theme: string, year: number)
// → POST /api/generate?theme=educ&year=2022

// Téléchargement
window.open(`/api/download/${filename}`, '_blank')

// Les 17 thèmes Open Data supportés :
const OPEN_DATA_SUPPORTED_THEMES = [
    'educ', 'pers_sup65ans_seules', 'familles_mono', 'pop_inf3ans',
    'pers_menages', 'types_menages', 'alloc', 'revenu', 'densite',
    'route', 'mortalite_gen', 'mortalite_cardio', 'mortalite_tumeurs',
    'mortalite_respi', 'mortalite_neuro', 'mortalite_diabete', 'mortalite_covid'
]
```

### Hook pour les années disponibles
```typescript
import { useDatasetYears } from "@/hooks/useThemes"
// Usage :
const { years, loading } = useDatasetYears(datasetId, isOpenData)
// years = [2019, 2020, 2021, 2022, 2023] (ints)
```

---

## STRUCTURE BDI (arborescence des thèmes)

```
BDI_THEMES[] (6 thèmes racine)
├── pop_cond_vie (Population et Conditions de Vie)
│   ├── population
│   │   ├── structure_pop → [densite✅, structure_quinq✅, structure_grp✅]
│   │   ├── naissance_fecondite → [indice_fecondite✅, fecondite✅]
│   │   ├── petite_enfance → [pop_inf3ans✅]
│   │   └── personnes_agees → [accroiss_sup65ans❌]
│   ├── education → [educ✅]
│   ├── emploi_revenu
│   │   ├── emploi → [emplois✅]
│   │   └── revenu → [revenu✅]
│   ├── prestations_sociales → [alloc✅]
│   └── conditions_vie
│       ├── cond_vie_anciens → [pers_sup65ans_seules✅]
│       ├── cond_vie_enfants → [familles_mono✅, accueil_pop_inf3ans❌]
│       └── cond_vie_generales → [pers_menages✅, types_menages✅]
├── etat_sante (Etat de Santé)
│   ├── esperance_vie → [esp_vie❌]
│   └── mortalite → [mortalite_gen✅, mortalite_covid✅, dc_gene_prema❌, dc_infantil_neonat❌]
├── struct_acti_soins (Structures et Activités de Soins) → tout ❌
├── pathologies
│   ├── cardiovasculaire → [mortalite_cardio✅, prevalence_cardio❌]
│   ├── respiratoire → [mortalite_respi✅]
│   ├── neurologique → [mortalite_neuro✅]
│   ├── cancers → [mortalite_tumeurs✅]
│   ├── metabolique → [mortalite_diabete✅]
│   ├── infectieuses → [mortalite_vih❌]
│   └── troubles_mentaux → [mortalite_psy❌]
├── comportements → tout ❌
└── traumatismes
    ├── accidents_route → [route✅]
    └── noyades → [noyades❌]

✅ = demoReady: true (Open Data disponible, peut générer)
❌ = pas encore disponible (afficher grisé avec "Bientôt")
```

---

## DESIGN SYSTEM

### Couleurs
```
Primary Navy:    #1a4b8c (headers, titres)
Accent Teal:    #3bb3a9 (boutons action, liens, sélection active)
Success Green:  #4caf50 (badges "Disponible", succès)
Gold:           #f5c542 (badges warning)
Error Red:      #ef4444 (erreurs)
Background:     #f8fafc (fond page)
Card:           #ffffff (fond cartes)
Border:         #e2e8f0 (bordures subtiles)
```

### Composants disponibles (Tailwind + Radix)
```
import { cn } from "@/lib/utils"
import { BDI_THEMES } from "@/data/bdi_themes"
import { useDatasetYears } from "@/hooks/useThemes"
import * as api from "@/services/api"

// Icônes Lucide (déjà installé) :
import { CheckCircle2, FileSpreadsheet, Download, Play, Calendar,
         Loader2, ChevronRight, ChevronDown, FolderOpen, Database,
         Info, ArrowLeft, Sparkles, Search } from "lucide-react"
```

### Responsive
- Desktop : `grid-cols-12` (8 contenu + 4 panneau récap)
- Tablet : panneau récap caché, contenu pleine largeur
- Mobile : `grid-cols-1`, navigation simplifiée

---

## PRINCIPES UX À APPLIQUER (du document UX Design 2026)

### Obligatoires
1. **Default Everything** : Année = dernière disponible. Format = "Pack Complet". Mode = auto-détecté.
2. **Lessen the Burden** : Maximum 3 clics pour arriver au téléchargement.
3. **Avoid Choice Overload** : 1 décision par écran. Si un sous-thème n'a qu'un dataset, l'auto-sélectionner.
4. **Make Progress Visible** : Indicateur 3 étapes qui correspond EXACTEMENT au contenu affiché.
5. **Clear the Page of Distractions** : Pas de CSV upload sur cette page. Pas de toggle technique.
6. **Call to Action** : UN SEUL bouton primaire visible par écran.
7. **Deploy Social Proof** : Badge "17 indicateurs disponibles" ou "Source : INSEE Open Data".
8. **Make it Easy to Understand** : Labels en français clair, pas de jargon technique.

### Interdits
- PAS de terminal/console de logs
- PAS de toggle "Mode Open Data"
- PAS de bouton toujours disabled
- PAS de step "vide" qui attend un clic supplémentaire
- PAS de heading "4" quand l'indicateur montre "3"
- PAS de CSV upload section dans cette page

---

## COMPORTEMENT ATTENDU

### Étape 1 - Sélection (drill-down en 1 écran)
```
1. Afficher les 6 thèmes en grid (2 cols desktop)
2. Click thème → les sous-thèmes s'affichent EN DESSOUS (accordion/expand)
   Le thème cliqué reste visible en haut comme breadcrumb
3. Click sous-thème → les datasets s'affichent
   Si 1 seul dataset demoReady → auto-sélectionné, passer à Étape 2
   Si multiple → afficher choix, click sélectionne et passe à Étape 2
4. Les éléments non-disponibles sont grisés avec badge "Bientôt"
```

### Étape 2 - Configuration
```
1. Résumé de la sélection en haut (thème > sous-thème > indicateur)
2. Sélection année (chips, default = dernière année du dataset)
3. Sélection format (3 options, default = Pack Complet)
4. Si format "Par Niveau" : afficher sélecteur niveau géographique
5. GROS bouton vert "Générer mon fichier" en bas
6. Click → spinner overlay "Génération en cours..." → auto-passage Étape 3
```

### Étape 3 - Résultat
```
1. Animation de succès (icône check verte)
2. Résumé de ce qui a été généré
3. GROS bouton "Télécharger" (vert)
4. Lien discret "Nouvelle génération" en dessous
```

### Logique Open Data (auto-détection)
```typescript
// Déterminer automatiquement si on utilise Open Data :
const isOpenData = OPEN_DATA_SUPPORTED_THEMES.includes(selectedDatasetId)

// Appeler la bonne API en conséquence :
const result = isOpenData
    ? await api.generateOpenData(datasetId, year)
    : await api.generateExcel(datasetId, year)
```

### Année par défaut intelligente
```typescript
// Utiliser la dernière année disponible du dataset sélectionné :
const { years } = useDatasetYears(datasetId, isOpenData)
const defaultYear = years.length > 0 ? String(Math.max(...years)) : "2022"
// Initialiser year avec defaultYear quand le dataset change
```

---

## PANNEAU RÉCAPITULATIF (droite, sticky)

Garder le panneau récap à droite mais le rendre **UTILE** :
- Afficher le résumé des sélections en temps réel
- Le bouton "Générer" dans le panneau droit doit être **ACTIF** quand tout est sélectionné
- Quand on clique "Générer" depuis le panneau = même action que le bouton principal
- Sur mobile : le panneau devient un bandeau fixe en bas avec le résumé + bouton

---

## BARRE DE NAVIGATION FIXE EN BAS

Simplifier :
- **Étape 1** : pas de barre en bas (la navigation se fait par les clics dans le contenu)
- **Étape 2** : bouton "Retour" à gauche + "Générer mon fichier" à droite
- **Étape 3** : bouton "Télécharger" centré + "Nouvelle génération" à droite

Adapter le `left-64` pour le décalage sidebar (déjà en place).

---

## EXEMPLE DE STRUCTURE JSX ATTENDUE

```tsx
export function GeneratorPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null)
    const [year, setYear] = useState<string>("")
    const [format, setFormat] = useState<'zip' | 'consolidated' | 'selective'>('zip')
    const [level, setLevel] = useState('Commune')
    const [isProcessing, setIsProcessing] = useState(false)
    const [generatedFile, setGeneratedFile] = useState<string | null>(null)

    // ... breadcrumb state pour drill-down étape 1

    const isOpenData = selectedDatasetId
        ? OPEN_DATA_SUPPORTED_THEMES.includes(selectedDatasetId)
        : false

    const { years, loading: yearsLoading } = useDatasetYears(
        selectedDatasetId, isOpenData
    )

    // Auto-set year to latest when dataset changes
    useEffect(() => {
        if (years.length > 0) {
            setYear(String(Math.max(...years)))
        }
    }, [years])

    const handleGenerate = async () => {
        if (!selectedDatasetId || !year) return
        setIsProcessing(true)
        setStep(3) // Passer à l'étape 3 immédiatement (affiche spinner)

        try {
            const result = isOpenData
                ? await api.generateOpenData(selectedDatasetId, parseInt(year))
                : await api.generateExcel(selectedDatasetId, parseInt(year))

            if (result.success && result.filename) {
                setGeneratedFile(result.filename)
            } else {
                throw new Error(result.error || "Erreur")
            }
        } catch (err: any) {
            // Gérer erreur (toast ou message inline)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-4">
            {/* Header */}
            {/* Step Indicator (3 étapes) */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    {step === 1 && <ThemeSelector onSelect={...} />}
                    {step === 2 && <ConfigPanel year={year} format={format} onGenerate={handleGenerate} />}
                    {step === 3 && <ResultPanel isProcessing={isProcessing} file={generatedFile} />}
                </div>

                <div className="hidden lg:block lg:col-span-4">
                    <SummaryPanel ... />
                </div>
            </div>
        </div>
    )
}
```

---

## CHECKLIST DE VALIDATION

Avant de soumettre, vérifie que :

- [ ] Le parcours fait EXACTEMENT 3 étapes (indicateur + contenu correspondent)
- [ ] Zéro toggle "Open Data" visible
- [ ] Zéro terminal/console de logs
- [ ] L'année par défaut = dernière disponible (pas 2022 fixe)
- [ ] Un seul bouton d'action par écran
- [ ] Les thèmes non-disponibles sont grisés (pas cachés)
- [ ] Auto-sélection quand 1 seul dataset disponible
- [ ] Le bouton "Générer" dans le panneau récap est ACTIF quand prêt
- [ ] Pas de section CSV upload sur cette page
- [ ] `npm run build` compile sans erreur TypeScript
- [ ] Les appels API utilisent exactement `api.generateOpenData()` et `api.generateExcel()`
- [ ] Le téléchargement utilise `window.open('/api/download/${filename}', '_blank')`
- [ ] Aucun fichier modifié en dehors de `Frontend/src/pages/` et `Frontend/src/components/`

---

## TEST FONCTIONNEL

Après ta refonte, ce scénario doit marcher en 3 clics :

1. **Clic** sur "Population et Conditions de Vie" → sous-thèmes apparaissent
2. **Clic** sur "Education" → educ auto-sélectionné (seul dataset) → passage Étape 2 avec année 2022 pré-sélectionnée
3. **Clic** sur "Générer mon fichier" → spinner → succès → bouton Télécharger visible

Total : **3 clics** du lancement à la possibilité de télécharger.
