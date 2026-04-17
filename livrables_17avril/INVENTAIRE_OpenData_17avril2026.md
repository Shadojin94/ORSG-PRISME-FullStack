# Inventaire Open Data — Traumatismes (rapport ORSG fin mai 2026)

Date : 2026-04-17
Scope : enrichissement sources pour les 3 indicateurs Traumatismes demandés par N. Chateau-Remy.

Total ajouté : ~90 Mo (BAAC complément vehicules/lieux 2019-2023 + set complet 2024 + 4 CSV Odissé suicide/alcool/tabac + 1 CSV noyades).

---

## 1. Accidents de la route — BAAC / ONISR

**Source officielle** : https://www.data.gouv.fr/datasets/bases-de-donnees-annuelles-des-accidents-corporels-de-la-circulation-routiere-annees-de-2005-a-2024/
**Producteur** : Ministère de l'Intérieur / ONISR
**Licence** : Licence Ouverte / Open Licence
**Dernière MàJ data.gouv** : 29/12/2025

**Emplacement** : `Backend/inputs/opendata/baac/annees_YYYY/`
**Structure** : 4 fichiers CSV par année × 6 années (2019–2024) = 24 fichiers.

| Année | caract | usagers | vehicules | lieux | Total |
|-------|--------|---------|-----------|-------|-------|
| 2019  | 7.0 Mo | 12.5 Mo | 6.9 Mo    | 5.4 Mo | 31.8 Mo |
| 2020  | 5.7 Mo | 10.1 Mo | 5.5 Mo    | 4.5 Mo | 25.7 Mo |
| 2021  | 7.0 Mo | 13.0 Mo | 6.2 Mo    | 5.8 Mo | 32.1 Mo |
| 2022  | 6.9 Mo | 13.0 Mo | 6.0 Mo    | 5.6 Mo | 31.5 Mo |
| 2023  | 6.6 Mo | 13.9 Mo | 6.4 Mo    | 7.2 Mo | 34.1 Mo |
| 2024  | 6.5 Mo | 13.8 Mo | 6.4 Mo    | 7.1 Mo | 33.8 Mo |

**Variables extractibles (demande ORSG)** :
- `nb_acci` : `COUNT(DISTINCT Num_Acc)` depuis `caract_YYYY.csv` (par dep, com, annee)
- `nb_blesses` : `COUNT(grav IN (3,4))` depuis `usagers_YYYY.csv` (joint sur `Num_Acc`)
- `nb_morts` : `COUNT(grav = 2)` depuis `usagers_YYYY.csv`

**Niveaux géo disponibles** : COM (`caract.com`), DEP (`caract.dep`), REG (mapping DEP→REG), FR entière.
**Guyane** : `dep = "973"`. Caractéristiques incluent tous les DOM depuis 2012.

**Note compat** : les fichiers `caract_YYYY.csv` et `usagers_YYYY.csv` à la racine de `baac/` (préexistants avant 17/04) sont conservés pour ne pas casser le code existant. Les mêmes fichiers sont aussi dans `annees_YYYY/` + les nouveaux `vehicules` et `lieux`.

---

## 2. Noyades — Enquête SPF (Santé Publique France)

**Source** : https://odisse.santepubliquefrance.fr/explore/dataset/noyade-nombre-de-noyades-et-deces/
**API CSV** : `https://odisse.santepubliquefrance.fr/api/explore/v2.1/catalog/datasets/noyade-nombre-de-noyades-et-deces/exports/csv`
**Producteur** : Santé Publique France
**Licence** : Open licence 2.0

**Emplacement** : `Backend/inputs/opendata/spf_noyades/noyades_departement_2003_2021.csv` (35 Ko)

**Colonnes** : `Année;Département;Département Code;Nombre de noyades accidentelles;Nombres de noyades accidentelles suivies de décès;Région;Région Code`

**Variables extractibles** :
- `nb_noyades` ← `Nombre de noyades accidentelles`
- `nb_noyades_deces` ← `Nombres de noyades accidentelles suivies de décès`

**Années disponibles** : 2003, 2004, 2006, 2009, 2012, 2015, 2018, 2021 (enquête triennale depuis 2006).
**Niveau géo** : département uniquement (pas de commune).
**Guyane 973** : oui — présente sur toutes les années listées (dernière : 2021 = 20 noyades, 8 décès).

**TODO** — années 2022, 2023, 2024 :
- Non disponibles en CSV Odissé (consolidation dataset s'arrête à 2021).
- Les bilans SPF 2022, 2023 et 2024 sont publiés en PDF uniquement.
- Template manuel fourni : `Backend/csv_sources/noyades_template.csv` (CODGEO;DEP;REG;annee;nb_noyades;nb_noyades_deces).
- Action recommandée : demander à ORSG les chiffres ARS Guyane 2022–2024, ou extraire des bilans PDF SPF.
- Référence bilan 2024 : https://www.santepubliquefrance.fr/maladies-et-traumatismes/traumatismes/noyade/documents/bulletin-national/noyades-en-france.-bilan-de-surveillance-de-l-ete-2024

---

## 3. Suicide / Mortalité comportementale — CépiDc / Odissé

**Producteur** : CépiDc INSERM (via SNDS) restitué sur Odissé SPF.
**Licence** : Open licence 2.0

**Emplacement** : `Backend/inputs/opendata/cepidc/mortalite_causes_comportementales/`

| Fichier | Source dataset | Années | Niveau | Taille | Variable ORSG |
|---------|---------------|--------|--------|--------|---------------|
| `suicides_deces_departement.csv` | `suicides-deces-departement` | 2019–2023 | DEP × âge × sexe | 466 Ko | `m_suicide` OK |
| `suicides_deces_region.csv` | `suicides-deces-region` | 2019–2023 | REG × âge × sexe | 103 Ko | `m_suicide` OK |
| `suicides_deces_france_2019_2023.csv` | `suicides-deces-france` | 2019–2023 | FR × âge × sexe | 5 Ko | `m_suicide` OK |
| `alcool_consommation_quotidienne_region.csv` | `alcool-consommation-quotidienne-region` | 2000–2023 | REG × sexe | 16 Ko | `m_alcool_proxy` (consommation, pas mortalité) |
| `tabac_consommation_quotidienne_region.csv` | `tabac-consommation-quotidienne_reg` | 2000–2023 | REG × sexe | 15 Ko | `m_tabac_proxy` (consommation, pas mortalité) |

**m_suicide (CIM-10 X60-X84)** : OK au niveau département 2019-2023. Variable directement calculable depuis la colonne `Nombre de décès` sommée par (Année, Département Code).

**m_alcool / m_tabac** — TODO :
- La mortalité directe par cause alcool (F10, K70, K73, K74, K86) et tabac (C33-C34, F17) **n'est pas** exposée en CSV Odissé.
- Portail officiel : https://opendata-cepidc.inserm.fr/ — interface interactive uniquement, pas de téléchargement CSV en direct. Dernière mise à jour : 24/10/2025 (année 2023).
- Les fichiers `alcool_consommation_quotidienne_region.csv` et `tabac_consommation_quotidienne_region.csv` sont des PROXY (consommation/prévalence, pas décès). À utiliser uniquement si Naissa accepte l'approximation, sinon :
  - Option A : export manuel depuis l'UI CépiDc (par code CIM-10, département, année).
  - Option B : script Selenium/Playwright pour parser l'UI CépiDc (effort : 1 j).
  - Option C : demande formelle export SAS à CépiDc INSERM.

---

## Config et code

- `Backend/opendata_config.json` mis à jour (version 1.1) : ajout des 3 sources (baac_onisr, spf_noyades_odisse, cepidc_mortalite_comportementale) + 3 datasetMappings (route, noyades, mortalite_comportementale).
- `Backend/csv_sources/README_TRAUMATISMES.md` : doc détaillée des sources + TODO.
- `Backend/csv_sources/noyades_template.csv` : stub pour saisie manuelle 2022–2024.

## Résumé complétude par indicateur

| Indicateur | Variable | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | Niveau géo le plus fin |
|-----------|----------|------|------|------|------|------|------|----------------------|
| Accidents route | nb_acci, nb_blesses, nb_morts | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | COM (commune) |
| Noyades | nb_noyades, nb_noyades_deces | ✗ | ✗ | ✓ | TODO | TODO | TODO | DEP (département) |
| Suicide | m_suicide | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | DEP |
| Mortalité alcool | m_alcool | TODO (proxy REG dispo) | | | | | | REG en proxy |
| Mortalité tabac | m_tabac | TODO (proxy REG dispo) | | | | | | REG en proxy |

---

**Next steps pour intégration moteur Python** :
1. Étendre `generate_from_opendata.py` avec 3 nouveaux générateurs : `route`, `noyades`, `mortalite_comportementale`.
2. Ajouter dans `themes_config.json` les entrées correspondantes côté MOCA-O si compatible.
3. Exposer les 3 nouveaux datasets dans `bdi_themes.ts` (thème "Traumatismes").
4. Côté `file_server.js` : router `/generate-opendata` déjà prêt, juste besoin des générateurs Python.
