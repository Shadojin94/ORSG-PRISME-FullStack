# Notes Open Data INSEE - PRISME

**Créé le**: 2026-02-02
**Dernière mise à jour**: 2026-02-02
**Auteur**: Claude / NOVI Connected

---

## Objectif

Ce document trace les sources de données Open Data utilisées pour générer les fichiers Excel de la thématique "Population et conditions de vie" **sans dépendance à MOCA-O**.

---

## Sources INSEE - URLs de téléchargement

### 1. Base Diplômes-Formation (educ)

| Année | ID Stats | URL directe CSV/ZIP |
|-------|----------|---------------------|
| 2022 | 8647010 | https://www.insee.fr/fr/statistiques/fichier/8647010/base-ic-diplomes-formation-2022_csv.zip |
| 2021 | 8268840 | https://www.insee.fr/fr/statistiques/fichier/8268840/base-ic-diplomes-formation-2021_csv.zip |
| 2020 | 7704080 | https://www.insee.fr/fr/statistiques/fichier/7704080/base-ic-diplomes-formation-2020_csv.zip |
| 2019 | 6543298 | https://www.insee.fr/fr/statistiques/fichier/6543298/base-ic-diplomes-formation-2019_csv.zip |
| 2018 | 5650712 | https://www.insee.fr/fr/statistiques/fichier/5650712/base-ic-diplomes-formation-2018_csv.zip |
| 2017 | 4799252 | https://www.insee.fr/fr/statistiques/fichier/4799252/base-ic-diplomes-formation-2017_csv.zip |
| 2016 | 4228430 | https://www.insee.fr/fr/statistiques/fichier/4228430/base-ic-diplomes-formation-2016.zip |
| 2015 | 3627372 | https://www.insee.fr/fr/statistiques/fichier/3627372/base-ic-diplomes-formation-2015.zip |
| 2014 | 3137418 | https://www.insee.fr/fr/statistiques/fichier/3137418/base-ic-diplomes-formation-2014.zip |
| 2013 | 2386698 | https://www.insee.fr/fr/statistiques/fichier/2386698/base-ic-diplomes-formation-2013.zip |
| 2012 | 2028265 | https://www.insee.fr/fr/statistiques/fichier/2028265/base-ic-diplomes-formation-2012.zip |
| 2010 | 2028259 | https://www.insee.fr/fr/statistiques/fichier/2028259/base-ic-diplomes-formation-2010.zip |
| 2007 | 2028253 | https://www.insee.fr/fr/statistiques/fichier/2028253/base-ic-diplomes-formation-2007.zip |

**Variables disponibles** (préfixe P{YY}_) :
- `POP0610`, `POP1114`, `POP1517` : Population par tranche d'âge
- `SCOL0610`, `SCOL1114`, `SCOL1517` : Scolarisés par tranche d'âge
- `NSCOL15P_DIPLMIN` : Non scolarisés 15+ peu diplômés
- `POP1524`, `POP2554`, `POP5564` : Population active

**Note** : Les fichiers avant 2017 sont en format XLS (Excel ancien), pas CSV.

---

### 2. Base Couples-Familles-Ménages

| Année | ID Stats | URL directe CSV/ZIP |
|-------|----------|---------------------|
| 2022 | 8647008 | https://www.insee.fr/fr/statistiques/fichier/8647008/base-ic-couples-familles-menages-2022_csv.zip |
| 2021 | 8268828 | https://www.insee.fr/fr/statistiques/fichier/8268828/base-ic-couples-familles-menages-2021_csv.zip |
| 2020 | 7704086 | https://www.insee.fr/fr/statistiques/fichier/7704086/base-ic-couples-familles-menages-2020_csv.zip |
| 2019 | 6543224 | https://www.insee.fr/fr/statistiques/fichier/6543224/base-ic-couples-familles-menages-2019_csv.zip |
| 2018 | 5650714 | https://www.insee.fr/fr/statistiques/fichier/5650714/base-ic-couples-familles-menages-2018_csv.zip |
| 2017 | 4799268 | https://www.insee.fr/fr/statistiques/fichier/4799268/base-ic-couples-familles-menages-2017_csv.zip |
| 2016 | 4228432 | https://www.insee.fr/fr/statistiques/fichier/4228432/base-ic-couples-familles-menages-2016.zip |
| 2015 | 3627376 | https://www.insee.fr/fr/statistiques/fichier/3627376/base-ic-couples-familles-menages-2015.zip |
| 2014 | 3137409 | https://www.insee.fr/fr/statistiques/fichier/3137409/base-ic-couples-familles-menages-2014.zip |
| 2013 | 2386710 | https://www.insee.fr/fr/statistiques/fichier/2386710/base-ic-couples-familles-menages-2013.zip |
| 2012 | 2028277 | https://www.insee.fr/fr/statistiques/fichier/2028277/base-ic-couples-familles-menages-2012.zip |
| 2010 | 2028271 | https://www.insee.fr/fr/statistiques/fichier/2028271/base-ic-couples-familles-menages-2010.zip |
| 2007 | 2028265 | https://www.insee.fr/fr/statistiques/fichier/2028265/base-ic-couples-familles-menages-2007.zip |

**Variables disponibles** (préfixe C{YY}_ ou P{YY}_) :
- `MEN` : Nombre de ménages
- `POP65P` : Population 65 ans et plus
- `PMEN_MENPSEUL` : Personnes seules
- `FAM_MONO` : Familles monoparentales
- `FAM_COUPAENF` : Couples avec enfants
- `MENCOUPAENF`, `MENFAMMONO` : Ménages par type

---

### 3. Populations légales

| Année | ID Stats | URL |
|-------|----------|-----|
| 2023 | 8680726 | https://www.insee.fr/fr/statistiques/fichier/8680726/ensemble.zip |
| 2022 | 8290591 | https://www.insee.fr/fr/statistiques/fichier/8290591/ensemble.zip |
| 2021 | 7739582 | https://www.insee.fr/fr/statistiques/fichier/7739582/ensemble.zip |
| Historique | 3698339 | https://www.insee.fr/fr/statistiques/3698339 (1876-2023) |

**Variables** :
- `PMUN` : Population municipale
- `PTOT` : Population totale
- `REG`, `DEP`, `COM` : Codes géographiques

---

### 4. CAF - Allocataires (Cafdata)

**API Endpoint** :
```
https://data.caf.fr/api/explore/v2.1/catalog/datasets/s_ben_com_f/exports/csv?lang=fr&timezone=Europe/Paris&delimiter=%3B
```

**Années disponibles** : 2020-2023 (données communales)

**Variables clés** :
- `Nombre foyers NDUR` : Foyers allocataires total
- `Nombre personnes NDUR` : Personnes couvertes
- Détail par prestation : AF, RSA, APL, AAH, etc.

---

### 5. IRCOM - Revenus fiscaux

**Source** : data.gouv.fr - DGFiP

**URL** : https://www.data.gouv.fr/datasets/limpot-sur-le-revenu-par-collectivite-territoriale-ircom/

**Années** : 2021-2023

---

## Calendrier de publication INSEE

| Données de l'année | Publication prévue |
|--------------------|-------------------|
| 2023 | Fin 2025 |
| 2024 | Fin 2026 |

**Cycle** : Les données du recensement année N sont publiées fin N+2.

---

## Codes géographiques Guyane

### Communes (22)
```
97301, 97302, 97303, 97304, 97305, 97306, 97307, 97308,
97309, 97310, 97311, 97312, 97313, 97314, 97352, 97353,
97356, 97357, 97358, 97360, 97361, 97362
```

### Codes agrégés
- **Région Guyane** : 03
- **Département** : 973
- **DOM** : Agrégation 01, 02, 03, 04, 06

---

## Données NON disponibles en Open Data

| Indicateur | Raison | Alternative |
|------------|--------|-------------|
| Taux fécondité par âge mère (communal) | Non publié au niveau communal | Utiliser données régionales |
| CSP détaillées ouvriers/cadres (communal) | Non publié au niveau communal | Utiliser ratios départementaux |

---

## Scripts associés

| Fichier | Description |
|---------|-------------|
| `download_opendata.py` | Téléchargement automatique des sources |
| `opendata_config.json` | Configuration des sources et variables |
| `OPENDATA_SOURCES_INDEX.md` | Index détaillé des sources |

---

## Historique des modifications

| Date | Modification |
|------|--------------|
| 2026-02-02 | Création du document, inventaire complet 2007-2022 |

---

## Contact

Pour toute question sur les données INSEE :
- **INSEE Contact** : https://www.insee.fr/fr/information/1300622
- **Cafdata** : https://data.caf.fr

---

*Ce document doit être mis à jour lors de chaque nouvelle publication INSEE.*
