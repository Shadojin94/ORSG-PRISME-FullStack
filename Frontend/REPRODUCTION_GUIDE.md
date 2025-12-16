# Guide de Reproduction - Dashboard Data Visus v2

Ce document détaille l'architecture technique, la configuration et les étapes nécessaires pour reproduire exactement le Dashboard "Data Visus" (v2).

## 1. Stack Technique

*   **Framework Frontend :** React 18+ (via Vite)
*   **Langage :** TypeScript
*   **Styling :** Tailwind CSS v4 (Alpha/Beta) ou v3 avec PostCSS
*   **Composants UI :** ShadCN UI (Radix Primitives)
*   **Icons :** Lucide React
*   **Navigation :** React Router DOM v6
*   **Gestion de Classes :** `clsx`, `tailwind-merge`

## 2. Structure du Projet

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx       # Wrapper principal avec Sidebar
│   │   └── Sidebar.tsx         # Navigation latérale (Responsive)
│   └── ui/                     # Composants ShadCN (Card, Button, etc.)
├── data/
│   └── bdi_themes.ts           # Données statiques BDI (Indicateurs, Thèmes)
├── lib/
│   └── utils.ts                # Utilitaire 'cn' pour fusion de classes
├── pages/
│   ├── AdminUsersPage.tsx      # Gestion des utilisateurs
│   ├── DashboardPage.tsx       # Accueil après login
│   ├── DocsPage.tsx            # Référentiel BDI (Tableaux)
│   ├── GeneratorPage.tsx       # Assistant de génération (Wizard)
│   ├── HistoryPage.tsx         # Historique des fichiers
│   ├── LoginPage.tsx           # Authentification (2FA, MDP Oublié)
│   ├── ProfilePage.tsx         # Profil utilisateur (Onglets)
│   └── SupportPage.tsx         # Centre d'aide
├── App.tsx                     # Routing central
├── main.tsx                    # Point d'entrée
└── index.css                   # Styles globaux & Variables CSS
```

## 3. Configuration Essentielle

### A. Tailwind CSS (`tailwind.config.js`)
La personnalisation des couleurs est le cœur du design ORSG.

```javascript
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
    extend: {
        colors: {
            orsg: {
                blue: "#009FE3",       // Bleu Cyan ORSG
                darkBlue: "#1B1464",   // Bleu Nuit Profond
                green: "#8BC63E",      // Vert Pomme
                yellow: "#FFD200",     // Jaune Vif
                gray: "#F1F5F9",       // Fond clair
            },
            // ... variables ShadCN (primary, secondary, etc.)
        },
        borderRadius: {
            lg: "var(--radius)",
            md: "calc(var(--radius) - 2px)",
            sm: "calc(var(--radius) - 4px)",
        },
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

### B. Styles Globaux (`src/index.css`)
Définition des variables CSS pour le theming ShadCN.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... autres variables ShadCN */
    --radius: 0.75rem; /* Arrondi global 12px */
  }
}
```

### C. Utilitaires (`src/lib/utils.ts`)
Indispensable pour gérer les classes conditionnelles.

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 4. Architecture de Navigation

### Router (`App.tsx`)
On sépare distinctement le Login (Plein écran) du reste de l'application (Sidebar + Contenu).

```tsx
<Routes>
  {/* Layout Plein écran */}
  <Route path="/login" element={<LoginPage />} />

  {/* Layout Applicatif (Sidebar) */}
  <Route path="/dashboard" element={
    <AppLayout><DashboardPage /></AppLayout>
  } />
  {/* ... autres routes protégées */}
</Routes>
```

### Layout Responsif (`AppLayout.tsx` & `Sidebar.tsx`)
*   **Sidebar :** Fixe sur Desktop, menu burger sur Mobile. Utilise `NavLink` pour l'état actif.
*   **AppLayout :** Conteneur `flex` qui gère simplement l'inclusion de la Sidebar et le rendu des `children`.

## 5. Détail des Fonctionnalités Clés

### A. Page de Connexion (`LoginPage.tsx`)
*   **Design :** Arrière-plan épuré, décors flous (blur) aux couleurs de l'ORSG.
*   **Features :**
    *   Toggle "Mot de passe" vs "Code d'Authentification" (State React).
    *   Vue conditionnelle "Mot de passe oublié".
    *   Feedback visuel lors du chargement (`Loader2` animate-spin).

### B. Le Générateur (`GeneratorPage.tsx`)
C'est le cœur fonctionnel.
1.  **Wizard (Étapes) :** Géré par un state `currentStep` (1 à 4).
2.  **Données :** Importe `BDI_THEMES` depuis `src/data/bdi_themes.ts`.
3.  **Sélection Année :** Input numérique + Boutons rapides (2020, 2021, etc.).
4.  **Sticky Footer :** Une barre de navigation fixe en bas d'écran (`fixed bottom-0`) pour garantir que les boutons "Suivant/Précédent" sont toujours visibles.

### C. Historique & Sources (`HistoryPage.tsx`)
*   Tableau simple avec entêtes gris clair.
*   Ajout colonne **Source** pour traçabilité (INSEE, MOCA-O).
*   Badges de couleur pour les thématiques.

### D. Profil & Onglets (`ProfilePage.tsx`)
*   Architecture "Master-Detail" interne.
*   Sidebar locale pour changer d'onglet (`activeTab` state : 'account', 'security', 'preferences').
*   Reproduit fidèlement le design HTML statique d'origine.

## 6. Guide de Style ORSG

Pour respecter la charte, utilisez systématiquement ces codes couleurs :

| Couleur | Code Hex | Classe Tailwind | Usage |
| :--- | :--- | :--- | :--- |
| **Bleu Cyan** | `#009FE3` | `bg-orsg-blue` / `text-orsg-blue` | Actions principales, Liens, Logo |
| **Bleu Nuit** | `#1B1464` | `bg-orsg-darkBlue` / `text-orsg-darkBlue` | Titres, Sidebar, Contrastes forts |
| **Vert Pomme** | `#8BC63E` | `bg-orsg-green` / `text-orsg-green` | Succès, Validation, Accents secondaires |
| **Jaune Vif** | `#FFD200` | `bg-orsg-yellow` / `text-orsg-yellow` | Alertes, Décoration logo |

## 7. Commandes Utiles

*   **Lancer le dev server :** `npm run dev`
*   **Builder pour la prod :** `npm run build`
*   **Prévisualiser le build :** `npm run preview`

---
*Généré par Antigravity - Décembre 2024*
