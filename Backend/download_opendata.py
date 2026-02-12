#!/usr/bin/env python3
"""
PRISME - Téléchargeur de données Open Data INSEE
Télécharge et prépare les fichiers CSV depuis les sources Open Data
pour alimenter le système PRISME sans dépendance à MOCA-O.

Auteur: NOVI Connected
Date: 2026-02-02
"""

import os
import sys
import requests
import zipfile
import io
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import json

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_DIR = Path(__file__).parent
INPUTS_DIR = BASE_DIR / "inputs" / "opendata"
CSV_SOURCES_DIR = BASE_DIR / "csv_sources"
OUTPUT_DIR = BASE_DIR / "output"

INPUTS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Communes de Guyane (973xx)
COMMUNES_GUYANE = [
    "97301", "97302", "97303", "97304", "97305", "97306", "97307", "97308",
    "97309", "97310", "97311", "97312", "97313", "97314", "97352", "97353",
    "97356", "97357", "97358", "97360", "97361", "97362"
]

# Codes régions
REGIONS_CODES = {
    "11": "Île-de-France", "24": "Centre-Val de Loire", "27": "Bourgogne-Franche-Comté",
    "28": "Normandie", "32": "Hauts-de-France", "44": "Grand Est",
    "52": "Pays de la Loire", "53": "Bretagne", "75": "Nouvelle-Aquitaine",
    "76": "Occitanie", "84": "Auvergne-Rhône-Alpes", "93": "Provence-Alpes-Côte d'Azur",
    "94": "Corse", "01": "Guadeloupe", "02": "Martinique", "03": "Guyane",
    "04": "La Réunion", "06": "Mayotte"
}

# ============================================================================
# SOURCES DE DONNÉES OPEN DATA
# ============================================================================

# ============================================================================
# SOURCES DE DONNÉES OPEN DATA - TOUTES ANNÉES DISPONIBLES
# Voir NOTES_OPENDATA.md pour documentation complète
# ============================================================================

OPENDATA_SOURCES = {
    # =========================================================================
    # INSEE - Base Diplômes-Formation (2007-2022)
    # =========================================================================
    "diplomes_formation_2022": {
        "name": "Base Diplômes-Formation 2022",
        "url": "https://www.insee.fr/fr/statistiques/fichier/8647010/base-ic-diplomes-formation-2022_csv.zip",
        "year": 2022, "format": "csv", "provides": ["educ"]
    },
    "diplomes_formation_2021": {
        "name": "Base Diplômes-Formation 2021",
        "url": "https://www.insee.fr/fr/statistiques/fichier/8268840/base-ic-diplomes-formation-2021_csv.zip",
        "year": 2021, "format": "csv", "provides": ["educ"]
    },
    "diplomes_formation_2020": {
        "name": "Base Diplômes-Formation 2020",
        "url": "https://www.insee.fr/fr/statistiques/fichier/7704080/base-ic-diplomes-formation-2020_csv.zip",
        "year": 2020, "format": "csv", "provides": ["educ"]
    },
    "diplomes_formation_2019": {
        "name": "Base Diplômes-Formation 2019",
        "url": "https://www.insee.fr/fr/statistiques/fichier/6543298/base-ic-diplomes-formation-2019_csv.zip",
        "year": 2019, "format": "csv", "provides": ["educ"]
    },
    "diplomes_formation_2018": {
        "name": "Base Diplômes-Formation 2018",
        "url": "https://www.insee.fr/fr/statistiques/fichier/5650712/base-ic-diplomes-formation-2018_csv.zip",
        "year": 2018, "format": "csv", "provides": ["educ"]
    },
    "diplomes_formation_2017": {
        "name": "Base Diplômes-Formation 2017",
        "url": "https://www.insee.fr/fr/statistiques/fichier/4799252/base-ic-diplomes-formation-2017_csv.zip",
        "year": 2017, "format": "csv", "provides": ["educ"]
    },
    "diplomes_formation_2016": {
        "name": "Base Diplômes-Formation 2016",
        "url": "https://www.insee.fr/fr/statistiques/fichier/4228430/base-ic-diplomes-formation-2016.zip",
        "year": 2016, "format": "xls", "provides": ["educ"]
    },
    "diplomes_formation_2015": {
        "name": "Base Diplômes-Formation 2015",
        "url": "https://www.insee.fr/fr/statistiques/fichier/3627372/base-ic-diplomes-formation-2015.zip",
        "year": 2015, "format": "xls", "provides": ["educ"]
    },
    "diplomes_formation_2014": {
        "name": "Base Diplômes-Formation 2014",
        "url": "https://www.insee.fr/fr/statistiques/fichier/3137418/base-ic-diplomes-formation-2014.zip",
        "year": 2014, "format": "xls", "provides": ["educ"]
    },
    "diplomes_formation_2013": {
        "name": "Base Diplômes-Formation 2013",
        "url": "https://www.insee.fr/fr/statistiques/fichier/2386698/base-ic-diplomes-formation-2013.zip",
        "year": 2013, "format": "xls", "provides": ["educ"]
    },
    "diplomes_formation_2012": {
        "name": "Base Diplômes-Formation 2012",
        "url": "https://www.insee.fr/fr/statistiques/fichier/2028265/base-ic-diplomes-formation-2012.zip",
        "year": 2012, "format": "xls", "provides": ["educ"]
    },
    "diplomes_formation_2010": {
        "name": "Base Diplômes-Formation 2010",
        "url": "https://www.insee.fr/fr/statistiques/fichier/2028259/base-ic-diplomes-formation-2010.zip",
        "year": 2010, "format": "xls", "provides": ["educ"]
    },
    "diplomes_formation_2007": {
        "name": "Base Diplômes-Formation 2007",
        "url": "https://www.insee.fr/fr/statistiques/fichier/2028253/base-ic-diplomes-formation-2007.zip",
        "year": 2007, "format": "xls", "provides": ["educ"]
    },

    # =========================================================================
    # INSEE - Base Couples-Familles-Ménages (2007-2022)
    # =========================================================================
    "couples_familles_2022": {
        "name": "Base Couples-Familles-Ménages 2022",
        "url": "https://www.insee.fr/fr/statistiques/fichier/8647008/base-ic-couples-familles-menages-2022_csv.zip",
        "year": 2022, "format": "csv",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2021": {
        "name": "Base Couples-Familles-Ménages 2021",
        "url": "https://www.insee.fr/fr/statistiques/fichier/8268828/base-ic-couples-familles-menages-2021_csv.zip",
        "year": 2021, "format": "csv",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2020": {
        "name": "Base Couples-Familles-Ménages 2020",
        "url": "https://www.insee.fr/fr/statistiques/fichier/7704086/base-ic-couples-familles-menages-2020_csv.zip",
        "year": 2020, "format": "csv",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2019": {
        "name": "Base Couples-Familles-Ménages 2019",
        "url": "https://www.insee.fr/fr/statistiques/fichier/6543224/base-ic-couples-familles-menages-2019_csv.zip",
        "year": 2019, "format": "csv",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2018": {
        "name": "Base Couples-Familles-Ménages 2018",
        "url": "https://www.insee.fr/fr/statistiques/fichier/5650714/base-ic-couples-familles-menages-2018_csv.zip",
        "year": 2018, "format": "csv",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2017": {
        "name": "Base Couples-Familles-Ménages 2017",
        "url": "https://www.insee.fr/fr/statistiques/fichier/4799268/base-ic-couples-familles-menages-2017_csv.zip",
        "year": 2017, "format": "csv",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2016": {
        "name": "Base Couples-Familles-Ménages 2016",
        "url": "https://www.insee.fr/fr/statistiques/fichier/4228432/base-ic-couples-familles-menages-2016.zip",
        "year": 2016, "format": "xls",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2015": {
        "name": "Base Couples-Familles-Ménages 2015",
        "url": "https://www.insee.fr/fr/statistiques/fichier/3627376/base-ic-couples-familles-menages-2015.zip",
        "year": 2015, "format": "xls",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2014": {
        "name": "Base Couples-Familles-Ménages 2014",
        "url": "https://www.insee.fr/fr/statistiques/fichier/3137409/base-ic-couples-familles-menages-2014.zip",
        "year": 2014, "format": "xls",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2013": {
        "name": "Base Couples-Familles-Ménages 2013",
        "url": "https://www.insee.fr/fr/statistiques/fichier/2386710/base-ic-couples-familles-menages-2013.zip",
        "year": 2013, "format": "xls",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2012": {
        "name": "Base Couples-Familles-Ménages 2012",
        "url": "https://www.insee.fr/fr/statistiques/fichier/2028277/base-ic-couples-familles-menages-2012.zip",
        "year": 2012, "format": "xls",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },
    "couples_familles_2010": {
        "name": "Base Couples-Familles-Ménages 2010",
        "url": "https://www.insee.fr/fr/statistiques/fichier/2028271/base-ic-couples-familles-menages-2010.zip",
        "year": 2010, "format": "xls",
        "provides": ["pers_sup65ans_seules", "familles_mono", "pop_inf3ans", "pers_menages", "types_menages"]
    },

    # =========================================================================
    # INSEE - Populations légales
    # =========================================================================
    "populations_2023": {
        "name": "Populations légales 2023",
        "url": "https://www.insee.fr/fr/statistiques/fichier/8680726/ensemble.zip",
        "year": 2023, "format": "csv", "provides": ["densite", "structure_pop"]
    },
    "populations_2022": {
        "name": "Populations légales 2022",
        "url": "https://www.insee.fr/fr/statistiques/fichier/8290591/ensemble.zip",
        "year": 2022, "format": "csv", "provides": ["densite", "structure_pop"]
    },
    "populations_2021": {
        "name": "Populations légales 2021",
        "url": "https://www.insee.fr/fr/statistiques/fichier/7739582/ensemble.zip",
        "year": 2021, "format": "csv", "provides": ["densite", "structure_pop"]
    },
    "populations_historique": {
        "name": "Populations historiques 1876-2023",
        "url": "https://www.insee.fr/fr/statistiques/fichier/3698339/base-pop-historiques-1876-2021.xlsx",
        "year": "historique", "format": "xlsx", "provides": ["densite"]
    },

    # =========================================================================
    # CAF - Allocataires
    # =========================================================================
    "caf_allocataires": {
        "name": "CAF - Allocataires par commune (toutes années)",
        "url": "https://data.caf.fr/api/explore/v2.1/catalog/datasets/s_ben_com_f/exports/csv?lang=fr&timezone=Europe%2FParis&use_labels=true&delimiter=%3B",
        "year": "2020-2023", "format": "csv", "provides": ["alloc"]
    },

    # =========================================================================
    # Autres sources
    # =========================================================================
    "ircom": {
        "name": "IRCOM - Revenus fiscaux",
        "url": "https://www.data.gouv.fr/fr/datasets/limpot-sur-le-revenu-par-collectivite-territoriale-ircom/",
        "year": "2021-2023", "format": "csv", "provides": ["revenu"],
        "note": "Téléchargement manuel requis depuis data.gouv.fr"
    }
}

# ============================================================================
# FONCTIONS DE TÉLÉCHARGEMENT
# ============================================================================

def download_file(url: str, dest_path: Path, force: bool = False) -> bool:
    """Télécharge un fichier depuis une URL."""
    if dest_path.exists() and not force:
        print(f"  [SKIP] Fichier existant: {dest_path.name}")
        return True

    print(f"  [DL] Téléchargement: {url[:80]}...")
    try:
        response = requests.get(url, timeout=120, stream=True)
        response.raise_for_status()

        with open(dest_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"  [OK] Téléchargé: {dest_path.name} ({dest_path.stat().st_size / 1024 / 1024:.1f} Mo)")
        return True
    except Exception as e:
        print(f"  [ERROR] Échec téléchargement: {e}")
        return False


def download_and_extract_zip(url: str, dest_dir: Path, target_filename: str = None) -> Optional[Path]:
    """Télécharge et extrait un fichier ZIP."""
    print(f"  [DL] Téléchargement ZIP: {url[:80]}...")
    try:
        response = requests.get(url, timeout=120)
        response.raise_for_status()

        with zipfile.ZipFile(io.BytesIO(response.content)) as z:
            # Liste tous les fichiers dans l'archive
            all_files = z.namelist()
            print(f"  [ZIP] Contenu: {len(all_files)} fichiers")

            # Chercher les CSV (insensible à la casse)
            csv_files = [f for f in all_files if f.lower().endswith('.csv') and 'meta' not in f.lower()]

            # Si pas de CSV, chercher aussi les TXT qui pourraient être des données
            if not csv_files:
                csv_files = [f for f in all_files if f.lower().endswith('.txt') and 'meta' not in f.lower() and 'readme' not in f.lower()]

            if not csv_files:
                print(f"  [DEBUG] Fichiers dans l'archive: {all_files[:5]}...")
                print(f"  [ERROR] Aucun fichier CSV/TXT trouvé dans l'archive")
                return None

            # Sélectionner le fichier le plus gros (souvent le fichier de données principal)
            if len(csv_files) > 1:
                file_sizes = [(f, z.getinfo(f).file_size) for f in csv_files]
                file_sizes.sort(key=lambda x: x[1], reverse=True)
                source_file = file_sizes[0][0]
                print(f"  [INFO] Plusieurs fichiers, sélection du plus gros: {source_file}")
            else:
                source_file = csv_files[0]

            # Extraire
            dest_path = dest_dir / Path(source_file).name
            with z.open(source_file) as src, open(dest_path, 'wb') as dst:
                dst.write(src.read())

            print(f"  [OK] Extrait: {dest_path.name} ({dest_path.stat().st_size / 1024 / 1024:.1f} Mo)")
            return dest_path

    except Exception as e:
        print(f"  [ERROR] Échec extraction: {e}")
        import traceback
        traceback.print_exc()
        return None


def download_all_sources(force: bool = False, years: List[int] = None, sources: List[str] = None) -> Dict[str, Path]:
    """
    Télécharge les sources Open Data.

    Args:
        force: Re-télécharger même si le fichier existe
        years: Liste des années à télécharger (ex: [2020, 2021, 2022]). None = toutes
        sources: Liste des types de sources (ex: ['diplomes_formation', 'couples_familles']). None = toutes
    """
    print("=" * 60)
    print("Téléchargement des sources Open Data")
    print("=" * 60)

    if years:
        print(f"  Années sélectionnées: {years}")
    if sources:
        print(f"  Sources sélectionnées: {sources}")

    downloaded = {}
    skipped = 0
    errors = 0

    for source_id, config in OPENDATA_SOURCES.items():
        # Filtrer par source
        if sources:
            source_type = source_id.rsplit('_', 1)[0]  # ex: diplomes_formation_2022 -> diplomes_formation
            if not any(s in source_id for s in sources):
                continue

        # Filtrer par année
        source_year = config.get('year')
        if years and isinstance(source_year, int) and source_year not in years:
            continue

        # Ignorer les sources avec note (téléchargement manuel)
        if config.get('note'):
            print(f"\n[{source_id}] {config['name']}")
            print(f"  [SKIP] {config['note']}")
            skipped += 1
            continue

        print(f"\n[{source_id}] {config['name']}")

        url = config['url']
        file_format = config.get('format', 'csv')

        # Déterminer le nom du fichier de destination
        year_str = str(source_year) if isinstance(source_year, int) else source_year
        dest_filename = f"{source_id}.{file_format}"

        if url.endswith('.zip'):
            path = download_and_extract_zip(url, INPUTS_DIR, None)
            if path:
                # Renommer avec un nom plus explicite
                new_path = INPUTS_DIR / dest_filename
                if path != new_path and not new_path.exists():
                    try:
                        path.rename(new_path)
                        path = new_path
                    except:
                        pass  # Garder le nom original
        elif url.endswith('.xlsx') or url.endswith('.xls'):
            dest_path = INPUTS_DIR / dest_filename
            if download_file(url, dest_path, force):
                path = dest_path
            else:
                path = None
                errors += 1
        else:
            # CSV direct ou API
            dest_path = INPUTS_DIR / dest_filename
            if download_file(url, dest_path, force):
                path = dest_path
            else:
                path = None
                errors += 1

        if path:
            downloaded[source_id] = path
            # Stocker l'année pour référence
            downloaded[source_id + "_year"] = source_year

    print(f"\n{'=' * 60}")
    print(f"Résumé: {len(downloaded)//2} téléchargés, {skipped} ignorés, {errors} erreurs")
    return downloaded


# ============================================================================
# FONCTIONS DE TRANSFORMATION
# ============================================================================

def extract_commune_code(code: str) -> str:
    """Extrait le code commune depuis un code IRIS ou commune."""
    code_str = str(code).strip()
    # IRIS: 9 caractères, Commune: 5 caractères
    if len(code_str) >= 5:
        return code_str[:5]
    return code_str


def is_guyane_commune(code: str) -> bool:
    """Vérifie si le code correspond à une commune de Guyane."""
    commune_code = extract_commune_code(code)
    return commune_code in COMMUNES_GUYANE


def get_region_from_commune(code: str) -> Optional[str]:
    """Extrait le code région depuis un code commune."""
    commune_code = extract_commune_code(code)
    if len(commune_code) >= 2:
        dep = commune_code[:2]
        if dep == "97":
            # DOM: utiliser le 3ème caractère
            if len(commune_code) >= 3:
                dom_code = commune_code[2]
                dom_mapping = {"1": "01", "2": "02", "3": "03", "4": "04", "6": "06"}
                return dom_mapping.get(dom_code)
        else:
            # Métropole: département -> région
            dep_to_reg = {
                "75": "11", "77": "11", "78": "11", "91": "11", "92": "11", "93": "11", "94": "11", "95": "11",
                "18": "24", "28": "24", "36": "24", "37": "24", "41": "24", "45": "24",
                # ... (mapping complet à ajouter)
            }
            return dep_to_reg.get(dep)
    return None


# ============================================================================
# TRANSFORMATION : ÉDUCATION (educ)
# ============================================================================

def transform_education_data(source_path: Path, year: int) -> Dict[str, pd.DataFrame]:
    """
    Transforme les données INSEE Diplômes-Formation en format PRISME.

    Variables générées:
    - pop_6_16: Population 6-16 ans
    - nb_non_sco: Jeunes 6-16 ans non scolarisés
    - pop_15_64: Population 15-64 ans
    - nb_peu_dipl: Personnes 15+ peu diplômées
    """
    print(f"\n[EDUC] Transformation données éducation {year}...")

    try:
        df = pd.read_csv(source_path, sep=';', dtype={'IRIS': str, 'COM': str}, low_memory=False)
        print(f"  Lignes lues: {len(df)}")
    except Exception as e:
        print(f"  [ERROR] Lecture fichier: {e}")
        return {}

    # Déterminer la colonne géographique
    geo_col = 'COM' if 'COM' in df.columns else 'CODGEO'

    # Filtrer Guyane
    df['commune_code'] = df[geo_col].apply(extract_commune_code)
    df_guyane = df[df['commune_code'].isin(COMMUNES_GUYANE)].copy()
    print(f"  Lignes Guyane: {len(df_guyane)}")

    if df_guyane.empty:
        print("  [WARN] Aucune donnée Guyane trouvée")
        return {}

    # Agréger par commune (depuis IRIS)
    numeric_cols = [c for c in df_guyane.columns if c.startswith('P') and any(char.isdigit() for char in c)]

    df_communal = df_guyane.groupby('commune_code')[numeric_cols].sum().reset_index()

    # Calculer les indicateurs
    result_data = []

    # Variables attendues dans les bases INSEE (préfixe P22_ pour 2022, P21_ pour 2021)
    prefix = f"P{str(year)[2:]}_"

    for _, row in df_communal.iterrows():
        commune = int(row['commune_code'])

        # Population 6-16 ans (approximation: P22_POP0610 + P22_POP1114 + 2/3 * P22_POP1517)
        pop_0610 = row.get(f'{prefix}POP0610', 0) or 0
        pop_1114 = row.get(f'{prefix}POP1114', 0) or 0
        pop_1517 = row.get(f'{prefix}POP1517', 0) or 0
        pop_6_16 = pop_0610 + pop_1114 + (pop_1517 * 2/3)

        # Non scolarisés 6-16 ans
        scol_0610 = row.get(f'{prefix}SCOL0610', 0) or 0
        scol_1114 = row.get(f'{prefix}SCOL1114', 0) or 0
        scol_1517 = row.get(f'{prefix}SCOL1517', 0) or 0

        ns_0610 = max(0, pop_0610 - scol_0610)
        ns_1114 = max(0, pop_1114 - scol_1114)
        ns_1517 = max(0, pop_1517 - scol_1517)
        nb_non_sco = ns_0610 + ns_1114 + (ns_1517 * 2/3)

        # Population 15-64 ans
        pop_1524 = row.get(f'{prefix}POP1524', 0) or 0
        pop_2554 = row.get(f'{prefix}POP2554', 0) or 0
        pop_5564 = row.get(f'{prefix}POP5564', 0) or 0
        # Alternative si colonnes différentes
        if pop_1524 == 0:
            pop_1517 = row.get(f'{prefix}POP1517', 0) or 0
            pop_1824 = row.get(f'{prefix}POP1824', 0) or 0
            pop_2529 = row.get(f'{prefix}POP2529', 0) or 0
            pop_30p = row.get(f'{prefix}POP30P', 0) or 0
            pop_15_64 = pop_1517 + pop_1824 + pop_2529 + (pop_30p * 0.88)
        else:
            pop_15_64 = pop_1524 + pop_2554 + pop_5564

        # Peu diplômés
        peu_dipl = row.get(f'{prefix}NSCOL15P_DIPLMIN', 0) or 0
        if peu_dipl == 0:
            # Alternative
            sans_dipl = row.get(f'{prefix}NSCOL15P', 0) or 0
            peu_dipl = sans_dipl

        result_data.append({
            'codgeo': commune,
            'annee': year,
            'pop_6_16': round(pop_6_16, 2),
            'nb_non_sco': round(nb_non_sco, 2),
            'pop_15_64': round(pop_15_64, 2),
            'nb_peu_dipl': round(peu_dipl, 2)
        })

    # Créer DataFrame résultat
    df_result = pd.DataFrame(result_data)

    print(f"  [OK] {len(df_result)} communes traitées")

    return {
        'com': df_result,
        'year': year,
        'dataset': 'educ'
    }


# ============================================================================
# TRANSFORMATION : CONDITIONS DE VIE ANCIENS (pers_sup65ans_seules)
# ============================================================================

def transform_conditions_vie_anciens(source_path: Path, year: int) -> Dict[str, pd.DataFrame]:
    """
    Transforme les données Couples-Familles-Ménages en format PRISME.

    Variables générées:
    - nb_pop_65ans: Population 65 ans et plus
    - nb_pop_65ans_seule: Personnes seules de 65 ans et plus
    """
    print(f"\n[COND_VIE_ANCIENS] Transformation données conditions de vie anciens {year}...")

    try:
        df = pd.read_csv(source_path, sep=';', dtype={'IRIS': str, 'COM': str}, low_memory=False)
        print(f"  Lignes lues: {len(df)}")
    except Exception as e:
        print(f"  [ERROR] Lecture fichier: {e}")
        return {}

    geo_col = 'COM' if 'COM' in df.columns else 'CODGEO'
    df['commune_code'] = df[geo_col].apply(extract_commune_code)
    df_guyane = df[df['commune_code'].isin(COMMUNES_GUYANE)].copy()

    print(f"  Lignes Guyane: {len(df_guyane)}")

    if df_guyane.empty:
        return {}

    # Agréger par commune
    numeric_cols = [c for c in df_guyane.columns if c.startswith('C') or c.startswith('P')]
    df_communal = df_guyane.groupby('commune_code')[numeric_cols].sum().reset_index()

    prefix = f"C{str(year)[2:]}_"

    result_data = []
    for _, row in df_communal.iterrows():
        commune = int(row['commune_code'])

        # Population 65+
        pop_65p = row.get(f'{prefix}POP65P', 0) or 0
        # Alternative
        if pop_65p == 0:
            pop_65p = row.get(f'P{str(year)[2:]}_POP65P', 0) or 0

        # Personnes seules 65+
        # Variable: C22_PMEN_MENPSEUL65P ou similaire
        seules_65p = row.get(f'{prefix}PMEN_MENPSEUL65P', 0) or 0
        if seules_65p == 0:
            # Approximation via ménages d'une personne 65+
            men_1pers = row.get(f'{prefix}MEN_PMEN1', 0) or 0
            # Estimation: ~60% des ménages 1 personne sont 65+
            seules_65p = men_1pers * 0.3  # Approximation conservatrice

        result_data.append({
            'codgeo': commune,
            'annee': year,
            'nb_pop_65ans': round(pop_65p, 2),
            'nb_pop_65ans_seule': round(seules_65p, 2)
        })

    df_result = pd.DataFrame(result_data)
    print(f"  [OK] {len(df_result)} communes traitées")

    return {
        'com': df_result,
        'year': year,
        'dataset': 'pers_sup65ans_seules'
    }


# ============================================================================
# TRANSFORMATION : FAMILLES MONOPARENTALES (familles_mono)
# ============================================================================

def transform_familles_mono(source_path: Path, year: int) -> Dict[str, pd.DataFrame]:
    """
    Variables générées:
    - nb_familles_enf: Familles avec enfant(s) < 25 ans
    - nb_familles_mono_enf: Familles monoparentales avec enfant(s) < 25 ans
    """
    print(f"\n[FAMILLES_MONO] Transformation données familles monoparentales {year}...")

    try:
        df = pd.read_csv(source_path, sep=';', dtype={'IRIS': str, 'COM': str}, low_memory=False)
    except Exception as e:
        print(f"  [ERROR] Lecture fichier: {e}")
        return {}

    geo_col = 'COM' if 'COM' in df.columns else 'CODGEO'
    df['commune_code'] = df[geo_col].apply(extract_commune_code)
    df_guyane = df[df['commune_code'].isin(COMMUNES_GUYANE)].copy()

    if df_guyane.empty:
        return {}

    numeric_cols = [c for c in df_guyane.columns if c.startswith('C') or c.startswith('P')]
    df_communal = df_guyane.groupby('commune_code')[numeric_cols].sum().reset_index()

    prefix = f"C{str(year)[2:]}_"

    result_data = []
    for _, row in df_communal.iterrows():
        commune = int(row['commune_code'])

        # Familles avec enfants
        fam_enf = row.get(f'{prefix}FAM_COUPAENF', 0) or 0
        fam_mono = row.get(f'{prefix}FAM_MONO', 0) or 0

        # Alternative via ménages
        if fam_enf == 0:
            fam_couple_enf = row.get(f'{prefix}MENCOUPAENF', 0) or 0
            fam_enf = fam_couple_enf + fam_mono

        # Familles monoparentales
        if fam_mono == 0:
            fam_mono = row.get(f'{prefix}MENFAMMONO', 0) or 0

        result_data.append({
            'codgeo': commune,
            'annee': year,
            'nb_familles_enf': round(fam_enf + fam_mono, 2),
            'nb_familles_mono_enf': round(fam_mono, 2)
        })

    df_result = pd.DataFrame(result_data)
    print(f"  [OK] {len(df_result)} communes traitées")

    return {
        'com': df_result,
        'year': year,
        'dataset': 'familles_mono'
    }


# ============================================================================
# EXPORT EN FORMAT PRISME
# ============================================================================

def export_to_prisme_csv(data: Dict, output_dir: Path = None) -> Path:
    """Exporte les données transformées en format CSV compatible PRISME."""
    if output_dir is None:
        output_dir = CSV_SOURCES_DIR

    output_dir.mkdir(parents=True, exist_ok=True)

    dataset = data.get('dataset', 'unknown')
    year = data.get('year', 2022)
    df = data.get('com', pd.DataFrame())

    if df.empty:
        print(f"  [WARN] Aucune donnée à exporter pour {dataset}")
        return None

    # Nom fichier format PRISME
    filename = f"{dataset}_opendata_{year}.csv"
    filepath = output_dir / filename

    df.to_csv(filepath, index=False, sep=';', encoding='utf-8')
    print(f"  [EXPORT] {filepath.name} ({len(df)} lignes)")

    return filepath


# ============================================================================
# MAIN
# ============================================================================

def main():
    """
    Point d'entrée principal.

    Usage:
        python download_opendata.py                    # Télécharge tout
        python download_opendata.py --years 2020 2021 2022  # Années spécifiques
        python download_opendata.py --recent           # Seulement 2020-2022
        python download_opendata.py --source diplomes  # Seulement diplômes-formation
        python download_opendata.py --list             # Liste les sources disponibles
    """
    import argparse

    parser = argparse.ArgumentParser(description="PRISME - Téléchargeur Open Data INSEE")
    parser.add_argument('--years', nargs='+', type=int, help="Années à télécharger (ex: 2020 2021 2022)")
    parser.add_argument('--recent', action='store_true', help="Télécharger seulement 2020-2022")
    parser.add_argument('--all', action='store_true', help="Télécharger toutes les années (2007-2022)")
    parser.add_argument('--source', type=str, help="Type de source (diplomes, couples, populations, caf)")
    parser.add_argument('--list', action='store_true', help="Lister les sources disponibles")
    parser.add_argument('--force', action='store_true', help="Re-télécharger même si fichier existe")

    args = parser.parse_args()

    print("=" * 70)
    print("PRISME - Téléchargeur et Transformateur Open Data INSEE")
    print("Voir NOTES_OPENDATA.md pour documentation")
    print("=" * 70)

    # Mode liste
    if args.list:
        print("\nSources disponibles:")
        for source_id, config in OPENDATA_SOURCES.items():
            year = config.get('year', '?')
            fmt = config.get('format', '?')
            print(f"  [{source_id}] {config['name']} (année: {year}, format: {fmt})")
        return

    # Déterminer les années
    years = None
    if args.years:
        years = args.years
    elif args.recent:
        years = [2020, 2021, 2022]
    elif args.all:
        years = None  # Toutes les années

    # Déterminer les sources
    sources = None
    if args.source:
        sources = [args.source]

    # 1. Télécharger les sources
    downloaded = download_all_sources(force=args.force, years=years, sources=sources)

    if not downloaded:
        print("\n[ERROR] Aucune source téléchargée")
        return

    # Compter les fichiers (pas les métadonnées _year)
    file_count = len([k for k in downloaded.keys() if not k.endswith('_year')])
    print(f"\n[INFO] {file_count} fichiers téléchargés")

    # 2. Transformer les données (seulement pour les fichiers CSV récents)
    print("\n" + "=" * 70)
    print("Transformation des données")
    print("=" * 70)

    results = []

    # Traiter les fichiers diplômes-formation téléchargés
    for source_id, path in downloaded.items():
        if source_id.endswith('_year') or not isinstance(path, Path):
            continue

        if 'diplomes_formation' in source_id:
            year = downloaded.get(source_id + '_year')
            if isinstance(year, int) and year >= 2017:  # CSV seulement
                data = transform_education_data(path, year)
                if data:
                    export_to_prisme_csv(data)
                    results.append(data)

        elif 'couples_familles' in source_id:
            year = downloaded.get(source_id + '_year')
            if isinstance(year, int) and year >= 2017:  # CSV seulement
                data = transform_conditions_vie_anciens(path, year)
                if data:
                    export_to_prisme_csv(data)
                    results.append(data)

                data = transform_familles_mono(path, year)
                if data:
                    export_to_prisme_csv(data)
                    results.append(data)

    # Résumé
    print("\n" + "=" * 70)
    print("Résumé")
    print("=" * 70)
    print(f"Datasets générés: {len(results)}")

    for r in results:
        if r:
            df = r.get('com', pd.DataFrame())
            print(f"  - {r.get('dataset', '?')} {r.get('year', '?')}: {len(df)} communes")

    print("\n[INFO] Fichiers exportés dans:", CSV_SOURCES_DIR)


if __name__ == "__main__":
    main()
