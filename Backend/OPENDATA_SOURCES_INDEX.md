# Index des Sources de Données - Population et Conditions de Vie

**Généré le**: 2026-02-02
**Objectif**: Identifier les sources Open Data alternatives à MOCA-O pour chaque indicateur

---

## Résumé Exécutif

| Statut | Nombre de datasets |
|--------|-------------------|
| Disponible en Open Data | 12 |
| Requiert MOCA-O | 4 |
| Source externe spécifique | 2 |

---

## 1. ÉDUCATION (educ)

### Variables requises
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `pop_6_16` | Population 6-16 ans | INSEE - Base infracommunale Diplômes-Formation | [2022](https://www.insee.fr/fr/statistiques/8647010) | ✅ DISPONIBLE |
| `nb_non_sco` | Jeunes non scolarisés | INSEE - Base infracommunale Diplômes-Formation | [2022](https://www.insee.fr/fr/statistiques/8647010) | ✅ DISPONIBLE |
| `pop_15_64` | Population 15-64 ans | INSEE - Base infracommunale Diplômes-Formation | [2022](https://www.insee.fr/fr/statistiques/8647010) | ✅ DISPONIBLE |
| `nb_peu_dipl` | Peu diplômés | INSEE - Base infracommunale Diplômes-Formation | [2022](https://www.insee.fr/fr/statistiques/8647010) | ✅ DISPONIBLE |

**Téléchargement direct CSV**:
- https://www.insee.fr/fr/statistiques/fichier/8647010/base-ic-diplomes-formation-2022_csv.zip

**Années disponibles**: 2017-2022 (annuel)

---

## 2. POPULATION - Structure

### 2.1 Densité (densite)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `rp` | Population RP | INSEE - Populations légales | [2023](https://www.insee.fr/fr/statistiques/8680726) | ✅ DISPONIBLE |
| `superficie` | Superficie km² | data.gouv.fr - Communes | [Lien](https://www.data.gouv.fr/datasets/communes-et-villes-de-france-en-csv-excel-json-parquet-et-feather) | ✅ DISPONIBLE |

### 2.2 Structure quinquennale (structure_quinq)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `pop_homme` | Population masculine par âge | INSEE - Base Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |
| `pop_femme` | Population féminine par âge | INSEE - Base Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |
| `rp` | Population totale RP | INSEE - Populations légales | [2023](https://www.insee.fr/fr/statistiques/8680726) | ✅ DISPONIBLE |

**Téléchargement direct CSV**:
- https://www.insee.fr/fr/statistiques/fichier/8647008/base-ic-couples-familles-menages-2022_csv.zip

### 2.3 Structure par groupe d'âge (structure_grp)
| Variable | Description | Source Open Data | Statut |
|----------|-------------|------------------|--------|
| `pop_age` | Population par groupe | ⚠️ Calcul à partir de structure_quinq | ✅ CALCULABLE |

---

## 3. POPULATION - Natalité/Fécondité

### 3.1 Indice de fécondité (indice_fecondite)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `icf` | Indice conjoncturel fécondité | INSEE - État civil naissances | [2024](https://www.insee.fr/fr/statistiques/8582142) | ✅ DISPONIBLE |
| `tx_natalite` | Taux de natalité | INSEE - État civil naissances | [2024](https://www.insee.fr/fr/statistiques/8582142) | ✅ DISPONIBLE |

### 3.2 Fécondité par âge (fecondite)
| Variable | Description | Source Open Data | Statut |
|----------|-------------|------------------|--------|
| `tx_fecondite` | Taux fécondité par âge | ❌ MOCA-O requis | ⚠️ MOCA-O |
| `nb_naiss_vivante` | Naissances vivantes | ❌ MOCA-O requis (détail âge mère) | ⚠️ MOCA-O |

**Note**: Les données par tranche d'âge de la mère au niveau communal ne sont pas disponibles en Open Data.

---

## 4. POPULATION - Petite enfance

### 4.1 Population < 3 ans (pop_inf3ans)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `pop_inf3ans` | Population < 3 ans | INSEE - Base Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |
| `rp` | Population totale | INSEE - Populations légales | [2023](https://www.insee.fr/fr/statistiques/8680726) | ✅ DISPONIBLE |

---

## 5. POPULATION - Personnes âgées

### 5.1 Accroissement 65+ (accroiss_sup65ans)
| Variable | Description | Source Open Data | Statut |
|----------|-------------|------------------|--------|
| `tx_accroiss` | Taux d'accroissement | ❌ Calcul historique requis | ⚠️ CALCUL |

**Note**: Nécessite des données sur plusieurs périodes - calculable à partir des données annuelles.

---

## 6. EMPLOI ET REVENU

### 6.1 Emploi (emplois)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `nb_actifs` | Nombre d'actifs | data.gouv.fr - Data INSEE communes | [Lien](https://www.data.gouv.fr/datasets/data-insee-sur-les-communes) | ✅ DISPONIBLE |
| `nb_pop` | Population 15+ | INSEE - Recensement | Dossier complet | ✅ DISPONIBLE |
| `nb_ouvriers` | Nombre d'ouvriers | ❌ MOCA-O requis (CSP détaillée) | ⚠️ MOCA-O |
| `nb_cadres` | Nombre de cadres | ❌ MOCA-O requis (CSP détaillée) | ⚠️ MOCA-O |

### 6.2 Revenu (revenu)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `nb_foyers_non_impo` | Foyers non imposés | data.gouv.fr - IRCOM | [Lien](https://www.data.gouv.fr/datasets/limpot-sur-le-revenu-par-collectivite-territoriale-ircom) | ✅ DISPONIBLE |
| `nb_foyers_imposes` | Foyers imposés | data.gouv.fr - IRCOM | [Lien](https://www.data.gouv.fr/datasets/limpot-sur-le-revenu-par-collectivite-territoriale-ircom) | ✅ DISPONIBLE |

---

## 7. PRESTATIONS SOCIALES

### 7.1 Allocataires (alloc)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `nb_alloc` | Personnes couvertes CNAF | Cafdata - Allocataires communal | [Lien](https://data.caf.fr/explore/dataset/s_ben_com_f/) | ✅ DISPONIBLE |
| `nb_menages` | Nombre de ménages | INSEE - Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |

---

## 8. CONDITIONS DE VIE

### 8.1 Personnes 65+ seules (pers_sup65ans_seules)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `nb_pop_65ans` | Population 65+ | INSEE - Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |
| `nb_pop_65ans_seule` | Personnes 65+ seules | INSEE - Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |

### 8.2 Familles monoparentales (familles_mono)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `nb_familles_enf` | Familles avec enfants | INSEE - Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |
| `nb_familles_mono_enf` | Familles mono avec enfants | INSEE - Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |

### 8.3 Ménages par nombre de personnes (pers_menages)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `nb_menages` | Ménages par taille | INSEE - Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |

### 8.4 Types de ménages (types_menages)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `nb_menages` | Ménages par type | INSEE - Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |
| `tot_menages` | Total ménages | INSEE - Couples-Familles-Ménages | [2022](https://www.insee.fr/fr/statistiques/8647008) | ✅ DISPONIBLE |

### 8.5 Accueil petite enfance (accueil_pop_inf3ans)
| Variable | Description | Source Open Data | URL | Statut |
|----------|-------------|------------------|-----|--------|
| `pop_inf3ans` | Population < 3 ans | INSEE - Couples-Familles-Ménages | ✅ | DISPONIBLE |
| `nb_places_*` | Places d'accueil | DREES - Observatoire | [Lien](https://drees.solidarites-sante.gouv.fr/sources-outils-et-enquetes/laccueil-des-jeunes-enfants) | ⚠️ EXTERNE |
| `nb_etab_*` | Établissements | DREES - Observatoire | [Lien](https://drees.solidarites-sante.gouv.fr/sources-outils-et-enquetes/laccueil-des-jeunes-enfants) | ⚠️ EXTERNE |

---

## Données NÉCESSITANT MOCA-O Obligatoirement

| Dataset | Variables | Raison |
|---------|-----------|--------|
| `fecondite` | `tx_fecondite`, `nb_naiss_vivante` | Détail par tranche d'âge de la mère au niveau communal non dispo en Open Data |
| `emplois` | `nb_ouvriers`, `nb_cadres` | CSP détaillées par commune non disponibles en Open Data |

---

## Sources Open Data Principales

### INSEE (insee.fr)
| Base | URL | Contenu |
|------|-----|---------|
| Diplômes-Formation | https://www.insee.fr/fr/statistiques/8647010 | Éducation, scolarisation |
| Couples-Familles-Ménages | https://www.insee.fr/fr/statistiques/8647008 | Ménages, familles, âges |
| Populations légales | https://www.insee.fr/fr/statistiques/8680726 | Population par commune |
| État civil naissances | https://www.insee.fr/fr/statistiques/8582142 | Naissances, fécondité |
| Dossier complet | https://www.insee.fr/fr/statistiques/5359146 | ~1900 indicateurs |

### data.gouv.fr
| Jeu de données | URL | Contenu |
|----------------|-----|---------|
| Data INSEE communes | https://www.data.gouv.fr/datasets/data-insee-sur-les-communes | Indicateurs synthétiques |
| IRCOM | https://www.data.gouv.fr/datasets/limpot-sur-le-revenu-par-collectivite-territoriale-ircom | Revenus fiscaux |
| Communes France | https://www.data.gouv.fr/datasets/communes-et-villes-de-france-en-csv-excel-json-parquet-et-feather | Référentiel géographique |

### Cafdata (data.caf.fr)
| Jeu de données | URL | Contenu |
|----------------|-----|---------|
| Allocataires communal | https://data.caf.fr/explore/dataset/s_ben_com_f/ | Prestations CAF |

### DREES
| Jeu de données | URL | Contenu |
|----------------|-----|---------|
| Accueil jeune enfance | https://drees.solidarites-sante.gouv.fr | Places crèches, halte-garderies |

---

## Plan d'Implémentation

### Phase 1 : Datasets 100% Open Data (prioritaire)
1. `educ` - Éducation
2. `pers_sup65ans_seules` - Conditions vie anciens
3. `familles_mono` - Familles monoparentales
4. `pop_inf3ans` - Petite enfance
5. `pers_menages` - Proportion ménages
6. `types_menages` - Types de ménages
7. `densite` - Densité population
8. `structure_quinq` - Structure quinquennale
9. `revenu` - Revenus (via IRCOM)
10. `alloc` - Allocataires (via Cafdata)

### Phase 2 : Datasets partiellement Open Data
1. `emplois` - Emploi (actifs OK, CSP via MOCA-O)
2. `indice_fecondite` - ICF OK, taux par région

### Phase 3 : Datasets nécessitant MOCA-O
1. `fecondite` - Taux par âge mère (MOCA-O obligatoire)

---

## Script de Téléchargement

Voir le fichier `download_opendata.py` pour le téléchargement automatique des données.
