"""
Convertit le fichier MOCA-O Comportements fourni par ORSG-CTPS (.xls) au format
CSV MOCA-O standard (identique a Mortalite_Patho_GF_2018_2023.csv) exploitable
par le parser `moca_filter` de prisme_engine.py.

Source : livrables_17avril/Retour client/Fichier Moca O_Comportement_2018_2023.xls
Cible  : Backend/csv_sources/Comportement_MOCAO_2018_2023.csv

Structure source (10 feuilles) :
- COM           : [Annee, commune, alcool, Tabac, Suicide]
- DROM          : [Annee, "Departements d'outre mer", cause_label, Alcool, Tabac, Suicide]
- franENT       : [Annee, "France (y compris Mayotte)", Alcool, tabac, suicide]
- FranHEX       : [Annee, "France metropolitaine", alcool, tabac, suicide]
- REG 2018..2023: [Annee, region_name, code, alcool, tabac, suicide]

Format cible (separateur ;) :
    ;;;Date_deces_Cim10#Annee;Cause_deces#Causes_de_deces_alphabetique;Lieu_domicile#commune;Nb_deces_standardises
    ;;;;;;
    ;;;2018;Alcool;97301 - Regina;12,34
    ...

Les causes sont normalisees en : "Alcool", "Tabac", "Suicide".
Les valeurs -999 (pas de donnee) sont remplacees par chaine vide pour
eviter une lecture en taux reel nul.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import xlrd

ROOT = Path(__file__).resolve().parents[2]
# On cherche le .xls d'abord dans le repo (racine projet), sinon dans la racine
# principale (hors worktree). Permet de rejouer le script depuis n'importe ou.
_CANDIDATES = [
    ROOT / "livrables_17avril" / "Retour client" / "Fichier Moca O_Comportement_2018_2023.xls",
    Path("C:/Users/chad9/Documents/003.ORSG/Livraison_Client/Version_FullStack") /
        "livrables_17avril" / "Retour client" / "Fichier Moca O_Comportement_2018_2023.xls",
]
SRC_XLS = next((p for p in _CANDIDATES if p.exists()), _CANDIDATES[0])
DST_CSV = ROOT / "Backend" / "csv_sources" / "Comportement_MOCAO_2018_2023.csv"

CAUSES = ["Alcool", "Tabac", "Suicide"]
HEADER = "Date_deces_Cim10#Annee;Cause_deces#Causes_de_deces_alphabetique;Lieu_domicile#commune;Nb_deces_standardises"


def fmt_val(raw) -> str:
    """Formate une valeur xlrd en chaine virgule decimale. Filtre -999 et vides."""
    if raw is None:
        return ""
    if isinstance(raw, str):
        s = raw.strip().replace(",", ".")
        if s == "" or s.lower() in ("nd", "-999", "-999.0"):
            return ""
        try:
            v = float(s)
        except ValueError:
            return ""
    else:
        try:
            v = float(raw)
        except (TypeError, ValueError):
            return ""
    if v == -999 or v <= -998.9:
        return ""
    # Format 2 decimales, virgule francaise
    return f"{v:.2f}".replace(".", ",")


def fmt_year(raw) -> str:
    try:
        y = int(float(raw))
    except (TypeError, ValueError):
        return ""
    if 2000 <= y <= 2030:
        return str(y)
    return ""


def clean_str(s) -> str:
    if s is None:
        return ""
    return str(s).strip()


def build_rows() -> list[tuple[str, str, str, str]]:
    """Retourne liste de (annee, cause, lieu, valeur) - chaine prete a ecrire."""
    wb = xlrd.open_workbook(str(SRC_XLS))
    rows: list[tuple[str, str, str, str]] = []

    # --- COM (col: annee, commune, alcool, tabac, suicide) ---
    sh = wb.sheet_by_name("COM")
    for r in range(1, sh.nrows):
        annee = fmt_year(sh.cell_value(r, 0))
        commune = clean_str(sh.cell_value(r, 1))
        if not annee or not commune:
            continue
        for idx, cause in enumerate(CAUSES):
            val = fmt_val(sh.cell_value(r, 2 + idx))
            rows.append((annee, cause, commune, val))

    # --- DROM (col: annee, lieu, cause_label, alcool, tabac, suicide) ---
    sh = wb.sheet_by_name("DROM")
    for r in range(1, sh.nrows):
        annee = fmt_year(sh.cell_value(r, 0))
        lieu = clean_str(sh.cell_value(r, 1))
        if not annee or not lieu:
            continue
        for idx, cause in enumerate(CAUSES):
            val = fmt_val(sh.cell_value(r, 3 + idx))
            rows.append((annee, cause, lieu, val))

    # --- franENT (col: annee, lieu, alcool, tabac, suicide) ---
    sh = wb.sheet_by_name("franENT")
    for r in range(1, sh.nrows):
        annee = fmt_year(sh.cell_value(r, 0))
        lieu = clean_str(sh.cell_value(r, 1))
        if not annee or not lieu:
            continue
        for idx, cause in enumerate(CAUSES):
            val = fmt_val(sh.cell_value(r, 2 + idx))
            rows.append((annee, cause, lieu, val))

    # --- FranHEX (col: annee, lieu, alcool, tabac, suicide) ---
    sh = wb.sheet_by_name("FranHEX")
    for r in range(1, sh.nrows):
        annee = fmt_year(sh.cell_value(r, 0))
        lieu = clean_str(sh.cell_value(r, 1))
        if not annee or not lieu:
            continue
        for idx, cause in enumerate(CAUSES):
            val = fmt_val(sh.cell_value(r, 2 + idx))
            rows.append((annee, cause, lieu, val))

    # --- REG <annee> (col: annee, region_name, code, alcool, tabac, suicide) ---
    for name in wb.sheet_names():
        if not name.startswith("REG "):
            continue
        sh = wb.sheet_by_name(name)
        for r in range(1, sh.nrows):
            annee = fmt_year(sh.cell_value(r, 0))
            region = clean_str(sh.cell_value(r, 1))
            if not annee or not region:
                continue
            for idx, cause in enumerate(CAUSES):
                val = fmt_val(sh.cell_value(r, 3 + idx))
                rows.append((annee, cause, region, val))

    return rows


def main() -> int:
    if not SRC_XLS.exists():
        print(f"[ERREUR] Source introuvable : {SRC_XLS}")
        return 1
    print(f"[SRC] {SRC_XLS}")
    rows = build_rows()
    print(f"[PARSE] {len(rows)} lignes generees")

    DST_CSV.parent.mkdir(parents=True, exist_ok=True)
    with DST_CSV.open("w", encoding="utf-8", newline="") as f:
        f.write(";;;" + HEADER + "\n")
        f.write(";;;;;;\n")
        for annee, cause, lieu, val in rows:
            f.write(f";;;{annee};{cause};{lieu};{val}\n")

    size_ko = DST_CSV.stat().st_size / 1024
    print(f"[OK] Ecrit {DST_CSV} ({size_ko:.1f} Ko)")

    # QA rapide
    df = pd.DataFrame(rows, columns=["annee", "cause", "lieu", "valeur"])
    print("\n[QA] Plage annees:", sorted(df["annee"].unique()))
    print("[QA] Causes:", sorted(df["cause"].unique()))
    com_rows = df[df["lieu"].str.match(r"^973\d{2}")]
    print(f"[QA] Nb lignes communes Guyane: {len(com_rows)}")
    print(f"[QA] Nb communes distinctes: {com_rows['lieu'].nunique()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
