# AUDIT Open Data PRISME — 17 avril 2026

Date : 2026-04-17
Test base URL : `http://localhost:3001`

## 1. Datasets OK (avec années dispo)

Testés via `GET /available-years-opendata?dataset=<id>` :

| Dataset           | Années dispo                               | Source              |
|-------------------|--------------------------------------------|---------------------|
| educ              | 2017–2022                                  | INSEE diplomes      |
| pop_inf3ans       | 2017–2022                                  | INSEE couples       |
| pers_sup65ans_seules | 2017–2022                              | INSEE couples       |
| familles_mono     | 2017–2022                                  | INSEE couples       |
| pers_menages      | 2017–2022                                  | INSEE couples       |
| types_menages     | 2017–2022                                  | INSEE couples       |
| alloc             | 2020–2023                                  | CAF                 |
| revenu            | 2019–2023                                  | IRCOM               |
| densite           | 2021–2023                                  | INSEE populations   |
| route             | 2019–2023                                  | BAAC ONISR          |
| **accidents_route** | **2019–2023** (alias ajouté 17avril)     | BAAC ONISR          |
| **blesses_route**   | **2019–2023** (alias ajouté 17avril)     | BAAC ONISR          |
| **deces_route**     | **2019–2023** (alias ajouté 17avril)     | BAAC ONISR          |
| mortalite_gen     | 2015–2023                                  | CépiDc              |
| mortalite_cardio  | 2015–2023                                  | CépiDc              |
| mortalite_tumeurs | 2015–2023                                  | CépiDc              |
| mortalite_respi   | 2015–2023                                  | CépiDc              |
| mortalite_neuro   | 2015–2023                                  | CépiDc              |
| mortalite_diabete | 2015–2023                                  | CépiDc              |
| mortalite_covid   | 2015–2023                                  | CépiDc              |
| **comp_mortalite** | **2019–2023** (nouveau 17avril)           | Odissé suicide DEP  |
| **suicide**        | **2019–2023** (nouveau 17avril)           | Odissé suicide DEP  |
| **addictions_alcool** | **2000,05,10,14,17,21** (nouveau 17avril) | Odissé conso REG |
| **addictions_tabac**  | **2000,05,10,14,17,21** (nouveau 17avril) | Odissé conso REG |
| **noyades**        | **2003,04,06,09,12,15,18,21** (nouveau 17avril) | SPF noyades DEP |

**25 datasets opérationnels** (vs 14 avant).

## 2. Datasets KO + cause

| Dataset              | Cause                                                                 | Reste à faire                        |
|----------------------|-----------------------------------------------------------------------|--------------------------------------|
| structure_quinq / structure_grp | Pas de source Open Data INSEE attachée (MOCA-O only)        | Parser `Pop_Age_Quinq_*.csv` csv_sources |
| indice_fecondite / fecondite | CSV `ICF_2022_2023_fr_entiere.csv` en csv_sources — pas implémenté | Ajouter source_type "insee_fecondite" |
| accroiss_sup65ans    | Aucune source (dérivé de pop_sup65 inter-annuel)                      | Calcul à partir de 2 années          |
| emplois              | CSV présents (`Nb_Actifs_*`, `Nb_Cadres_Ouvriers_*`) mais parser manquant | Ajouter source_type INSEE emploi   |
| accueil_pop_inf3ans  | Source DREES non automatisée (Excel PDF annuel)                       | Ingestion manuelle                   |
| esp_vie              | Source INSEE TABLES-MORT — pas automatisé                             | CSV INSEE à intégrer                 |
| dc_gene_prema / dc_infantil_neonat / mortalite_infantile | CépiDc existe mais mapping sheet distinct manquant | Ajouter entrées THEME_CONFIGS avec `cepidc_sheet` spécifique |
| mortalite_psy / mortalite_digestif / mortalite_vih | CépiDc sheet ≠ config actuelle                        | Mapper vers feuilles Troubles mentaux, Digestif, VIH |
| cancers, cardio_*, digestif, respiratoire, neurologique, metabolique, infectieuses, handicap, troubles_mentaux | Datasets "pathologies" (prévalence + DCIR) — pas de CSV Open Data | Nécessite export DCIR/SNDS (non Open Data) |
| prevalence_*         | Idem — nécessite DCIR/SNDS                                            | Hors scope MVP                       |
| addictions_ensemble  | Agrégation alcool+tabac — pas implémenté                              | Addition simple des deux             |
| comportements / traumatismes / pathologies | Thèmes parents (conteneurs BDI) — pas des datasets    | Normal, ignorer                     |
| equip_*, acti_*, equipements_acti | SAE/DREES Enquête (hors Open Data gratuit)                  | Export manuel SAE                    |
| prof_* / ds_* / nb_* / pt_* / dens_* / apl_* | RPPS/ADELI (DREES) — licence requise              | Hors scope Open Data                |

## 3. Quick fixes appliqués (17 avril 2026)

### 3.1 Nouveaux builders Python (`generate_from_opendata.py`)
- `_build_odisse_suicide_levels()` : lit `inputs/opendata/cepidc/mortalite_causes_comportementales/suicides_deces_departement.csv` (encoding utf-8-sig, sep `;`) — agrégation DEP/REG/DOM/FH/FR, Guyane commune = NaN (pas de ventilation communale).
- `_build_odisse_consommation_levels(kind)` : alcool/tabac consommation quotidienne REG-only — Guyane commune = taux régional 03 (proxy).
- `_build_spf_noyades_levels()` : noyades par DEP → agrégation REG/nationale. Test 2021 : **1477 noyades / 393 décès** en France.
- `_read_odisse()` : helper encoding-tolérant (utf-8-sig → utf-8 → latin-1).

### 3.2 THEME_CONFIGS étendus
Ajout de 8 entrées : `comp_mortalite`, `suicide`, `addictions_alcool`, `addictions_tabac`, `noyades`, `accidents_route`, `blesses_route`, `deces_route`.
Variables (non-`tx_*` pour éviter filter is_calculated_variable) : `m_suicide`, `prev_alcool_quotidien`, `prev_tabac_quotidien`, `nb_noyades`, `nb_noyades_deces`.

### 3.3 file_server.js
- `supportedThemes[]` : +8 entrées (comp_mortalite, suicide, addictions_alcool, addictions_tabac, noyades, accidents_route, blesses_route, deces_route).
- `/available-years-opendata` : branches `odisse_suicide`, `odisse_alcool`, `odisse_tabac`, `spf_noyades` ajoutées.

### 3.4 Impact démo
- **Route 2023** : POST `/generate-opendata?theme=route&year=2023` → ZIP avec 97302 (Cayenne) = **441 accidents, 570 blessés, 4 morts** ; France entière = **54 381 accidents / 3 302 morts**.
- **comp_mortalite 2023** : 35 401 suicides France entière, ventilation par région.
- **noyades 2021** : 1 477 noyades / 393 décès France entière, ventilation région.
- **addictions_alcool 2021** : taux conso quotidienne par région (6.1 IDF, 7.7 Centre-VdL...).
- L'UI `Step1/Step2` ne dira plus "Aucune donnée Open Data" pour : route, comp_mortalite, suicide, addictions_alcool, addictions_tabac, noyades, accidents_route, blesses_route, deces_route.

### 3.5 Non-régression vérifiée
- educ 2022 : OK (génération + download)
- mortalite_gen 2022 : OK
- alloc 2023, revenu 2023, densite 2023 : OK
- Backup : `generate_from_opendata.py.bak2` créé avant modifs.

## 4. Prochaines étapes recommandées (hors scope 1h)
1. **indice_fecondite / fecondite** : parser `csv_sources/ICF_2022_2023_fr_entiere.csv` (format national uniquement, ajouter source_type `insee_fecondite_national`).
2. **emplois** : parser `csv_sources/Nb_Actifs_GF_REG_DOM_Fh_2020_2021_2022.csv` + `Nb_Cadres_Ouvriers_*` (format REG uniquement, pas commune).
3. **mortalite_infantile / dc_gene_prema** : ajouter feuilles CépiDc dédiées (Feuille "Périnatale" / "Prématurée") — lecture identique à mortalite_gen.
4. **addictions_ensemble** : wrapper qui somme alcool + tabac par région.
5. Migration **structure_quinq** depuis MOCA-O vers Open Data : parser `Pop_Age_Quinq_Fh_DOM_2020_2021_2022.csv` (csv_sources).
