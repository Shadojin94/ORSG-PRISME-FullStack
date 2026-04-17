# Sources Traumatismes — ORSG rapport fin mai 2026

## 1. Accidents de la route (BAAC / ONISR)
Source : https://www.data.gouv.fr/datasets/bases-de-donnees-annuelles-des-accidents-corporels-de-la-circulation-routiere-annees-de-2005-a-2024/
Téléchargé : années 2019–2024, 4 fichiers par année (caractéristiques, lieux, véhicules, usagers).
Emplacement : `Backend/inputs/opendata/baac/annees_YYYY/`
Variables extractibles :
- `nb_acci` = nb lignes distinctes `Num_Acc` (caract)
- `nb_blesses` = nb `usagers` avec `grav=3` (blessé hospitalisé) ou `grav=4` (blessé léger)
- `nb_morts` = nb `usagers` avec `grav=2` (tué)
- Jointure géo via caract.`dep`, caract.`com`

## 2. Noyades (Enquête SPF via Odissé)
Source 2003–2021 : https://odisse.santepubliquefrance.fr/explore/dataset/noyade-nombre-de-noyades-et-deces/
Téléchargé : `Backend/inputs/opendata/spf_noyades/noyades_departement_2003_2021.csv`
Variables : `nb_noyades`, `nb_noyades_deces` au niveau département + région + année.
Guyane (973) présente pour années 2003, 2004, 2006, 2009, 2012, 2015, 2018, 2021.

### TODO 2022–2024
Enquête NOYADES 2022–2024 publiée annuellement par SPF mais **pas encore** disponible en CSV Odissé
(consolidation du dataset Odissé s'arrête à 2021 — la surveillance 2022+ reste dans les bilans PDF).
Template fourni : `Backend/csv_sources/noyades_template.csv` — à compléter manuellement
à partir des bilans SPF PDF ou demander à ORSG les données locales ARS Guyane.

Références bilans :
- Été 2024 : https://www.santepubliquefrance.fr/maladies-et-traumatismes/traumatismes/noyade/documents/bulletin-national/noyades-en-france.-bilan-de-surveillance-de-l-ete-2024
- Été 2023 et 2022 : dossier `noyades` sur santepubliquefrance.fr

## 3. Suicide / Mortalité comportementale
Source : https://odisse.santepubliquefrance.fr/ (alimenté par CépiDc/SNDS)
Emplacement : `Backend/inputs/opendata/cepidc/mortalite_causes_comportementales/`

### Suicides — Codes CIM-10 X60-X84 (inclut noyade auto-infligée X71)
- `suicides_deces_departement.csv` : 2019–2023, dep × classe d'âge × sexe × nb décès
- `suicides_deces_region.csv` : 2019–2023, région × classe d'âge × sexe
- `suicides_deces_france_2019_2023.csv` : France entière

### Alcool & Tabac — CONSOMMATION, PAS mortalité directe
- `alcool_consommation_quotidienne_region.csv` : 2000–2023, taux standardisé consommation quotidienne
- `tabac_consommation_quotidienne_region.csv` : 2000–2023, taux standardisé fumeurs quotidiens

### TODO — Mortalité directe alcool (F10, K70, K73, K74, K86) et tabac (C33-C34, F17)
Le portail Odissé n'expose PAS ces causes CIM-10 agrégées en CSV.
Source officielle : https://opendata-cepidc.inserm.fr/ — interface interactive uniquement,
pas de dataset CSV téléchargeable en direct (mise à jour 24/10/2025 pour année 2023).
Action : soit bâtir un script Selenium pour parser l'UI CépiDc, soit demander export personnalisé
à l'INSERM CépiDc pour `m_alcool` et `m_tabac` par département × année.

Alternative data.gouv : https://www.data.gouv.fr/datasets/causes-de-deces (publication DREES/CépiDc),
mais granularité = national + pathologies groupées, pas par commune.
