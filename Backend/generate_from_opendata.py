#!/usr/bin/env python3
"""
Génère les fichiers Excel PRISME à partir des données Open Data.
Crée la structure complète: dossiers par niveau géo + fichier consolidé.
"""

import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font
from pathlib import Path
import shutil

# Configuration
BASE_DIR = Path(__file__).parent
CSV_SOURCES_DIR = BASE_DIR / "csv_sources"
OUTPUT_DIR = BASE_DIR / "output"

ORANGE_FILL = PatternFill(start_color="FFC000", end_color="FFC000", fill_type="solid")

# Mapping niveaux géographiques
GEO_FOLDER_MAPPING = {
    'com': 'Commune',
    'reg': 'Région',
    'dom': 'DOM',
    'fh': 'France Hexagonale',
    'fra': 'France entière'
}

# Ordre des régions
REGION_ORDER = [11, 24, 27, 28, 32, 44, 52, 53, 75, 76, 84, 93, 94, 1, 2, 3, 4, 6]


def generate_educ_excel_from_opendata(year: int):
    """
    Génère les fichiers Excel pour le dataset educ à partir des données Open Data.

    Structure générée:
    output/
    └── Population et condition de vie/
        └── Education/
            └── Educ/
                └── {year}/
                    ├── Commune/
                    │   └── educ.xlsx
                    ├── Région/
                    │   └── educ.xlsx
                    ├── DOM/
                    │   └── educ.xlsx
                    ├── France Hexagonale/
                    │   └── educ.xlsx
                    ├── France entière/
                    │   └── educ.xlsx
                    └── educ_consolidated_{year}.xlsx
    """
    print(f"\n{'='*60}")
    print(f"Génération fichiers Excel EDUC {year} depuis Open Data")
    print(f"{'='*60}")

    # Charger les données Open Data
    csv_path = CSV_SOURCES_DIR / f"educ_opendata_{year}.csv"
    if not csv_path.exists():
        print(f"[ERROR] Fichier non trouvé: {csv_path}")
        print(f"[INFO] Lancez d'abord: python download_opendata.py --years {year} --source diplomes")
        return None

    df_com = pd.read_csv(csv_path, sep=';')
    print(f"[OK] Données chargées: {len(df_com)} communes")

    # Variables du dataset educ
    variables = ['pop_6_16', 'nb_non_sco', 'pop_15_64', 'nb_peu_dipl']

    # Créer le dossier de sortie
    theme_folder = "Population et condition de vie/Education/Educ"
    root_dir = OUTPUT_DIR / theme_folder / str(year)

    if root_dir.exists():
        shutil.rmtree(root_dir)
    root_dir.mkdir(parents=True)

    print(f"[DIR] Création: {root_dir}")

    # =========================================================================
    # Préparer les données par niveau géographique
    # =========================================================================

    # 1. Communes (données Open Data directes)
    data_com = df_com.to_dict('records')
    for row in data_com:
        row['com'] = row.pop('codgeo')

    # 2. Régions (agrégation fictive - à remplacer par vraies données)
    # Note: Les données Open Data communales ne contiennent pas les agrégats régionaux
    # On crée des lignes vides pour la structure
    data_reg = [{'reg': code, 'annee': year} for code in REGION_ORDER]

    # 3. DOM, France Hexagonale, France Entière (lignes vides)
    data_dom = [{'dom': 'DOM', 'annee': year}]
    data_fh = [{'fh': 0, 'annee': year}]
    data_fra = [{'fra': 99, 'annee': year}]

    # Données par niveau
    all_data = {
        'com': data_com,
        'reg': data_reg,
        'dom': data_dom,
        'fh': data_fh,
        'fra': data_fra
    }

    # =========================================================================
    # Générer un fichier Excel par niveau géographique
    # =========================================================================

    for geo_key, folder_name in GEO_FOLDER_MAPPING.items():
        sub_dir = root_dir / folder_name
        sub_dir.mkdir(exist_ok=True)

        wb = Workbook()
        wb.remove(wb.active)

        ws = wb.create_sheet(geo_key)
        rows_data = all_data[geo_key]

        # En-têtes
        headers = [geo_key, 'annee'] + variables
        for col_idx, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_idx, value=h)
            cell.font = Font(bold=True)
            cell.fill = ORANGE_FILL

        # Données
        for row_idx, row_dict in enumerate(rows_data, 2):
            ws.cell(row=row_idx, column=1, value=row_dict.get(geo_key))
            ws.cell(row=row_idx, column=2, value=row_dict.get('annee'))

            for i, var in enumerate(variables):
                val = row_dict.get(var)
                cell = ws.cell(row=row_idx, column=3 + i, value=val)
                if val is not None:
                    cell.fill = ORANGE_FILL

        # Largeur colonnes
        ws.column_dimensions['A'].width = 15
        ws.column_dimensions['B'].width = 10
        for i, var in enumerate(variables):
            ws.column_dimensions[chr(67 + i)].width = 15

        filepath = sub_dir / "educ.xlsx"
        wb.save(filepath)
        print(f"  [OK] {folder_name}/educ.xlsx ({len(rows_data)} lignes)")

    # =========================================================================
    # Générer le fichier consolidé
    # =========================================================================

    print(f"\n[CONSOLIDATED] Génération fichier consolidé...")

    wb_cons = Workbook()
    wb_cons.remove(wb_cons.active)

    for geo_key in GEO_FOLDER_MAPPING.keys():
        ws = wb_cons.create_sheet(geo_key)
        rows_data = all_data[geo_key]

        # En-têtes
        headers = [geo_key, 'annee'] + variables
        for col_idx, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_idx, value=h)
            cell.font = Font(bold=True)
            cell.fill = ORANGE_FILL

        # Données
        for row_idx, row_dict in enumerate(rows_data, 2):
            ws.cell(row=row_idx, column=1, value=row_dict.get(geo_key))
            ws.cell(row=row_idx, column=2, value=row_dict.get('annee'))

            for i, var in enumerate(variables):
                val = row_dict.get(var)
                cell = ws.cell(row=row_idx, column=3 + i, value=val)
                if val is not None:
                    cell.fill = ORANGE_FILL

        ws.column_dimensions['A'].width = 15
        ws.column_dimensions['B'].width = 10

    cons_path = root_dir / f"educ_consolidated_{year}.xlsx"
    wb_cons.save(cons_path)
    print(f"  [OK] educ_consolidated_{year}.xlsx")

    # =========================================================================
    # Créer le ZIP
    # =========================================================================

    zip_name = f"educ_opendata_{year}"
    zip_path = shutil.make_archive(
        str(OUTPUT_DIR / zip_name),
        'zip',
        str(OUTPUT_DIR / theme_folder),
        str(year)
    )
    print(f"\n[ZIP] Archive créée: {zip_path}")

    # Résumé
    print(f"\n{'='*60}")
    print(f"Résumé - EDUC {year}")
    print(f"{'='*60}")
    print(f"  Communes Guyane: {len(data_com)}")
    print(f"  Régions: {len(data_reg)}")
    print(f"  Fichiers générés: 6 (5 niveaux + 1 consolidé)")
    print(f"  Dossier: {root_dir}")
    print(f"  Archive: {zip_path}")

    return root_dir


if __name__ == "__main__":
    import sys

    year = 2017
    if len(sys.argv) > 1:
        year = int(sys.argv[1])

    generate_educ_excel_from_opendata(year)
