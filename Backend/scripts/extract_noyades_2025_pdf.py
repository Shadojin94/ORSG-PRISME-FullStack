"""Extraction des données noyades 2025 depuis le bulletin SPF 2026 et fusion.

Source : "bullnat_noyade_20260505.pdf" (Santé publique France, 5 mai 2026,
bilan final été 2025). Le Tableau 3 (pages 5-8, indices 4-7) liste noyades +
décès par région ET par département pour 2024 ET 2025, exactement comme le PDF
bilan 2024. On ne récupère ici que la colonne 2025 (les colonnes 2024 sont déjà
dans le CSV historique, extraites du PDF précédent).

Réutilise les mappings (départements, régions, codes) de extract_noyades_pdf.py
pour ne pas les dupliquer.

Lancement :
    py -3 Backend/scripts/extract_noyades_2025_pdf.py
Produit / met à jour :
    Backend/inputs/opendata/spf_noyades/noyades_departement_2025.csv      (2025 seul)
    Backend/inputs/opendata/spf_noyades/noyades_departement_2003_2024.csv (+2025 si absent)
"""
from __future__ import annotations

import csv
import sys
from pathlib import Path

import pdfplumber

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_noyades_pdf import (  # noqa: E402
    DEP_CODE_RE,
    DEP_NAME_FIX,
    DEP_TO_REG_CODE,
    REG_NAME_FROM_CODE,
    _clean_count,
    _normalize_code,
)

ROOT = Path(__file__).resolve().parents[2]
PDF_DIR = Path(r"C:/Users/chad9/Documents/003.ORSG/Dernier fichiers sources client")
PDF_FILE = PDF_DIR / "bullnat_noyade_20260505.pdf"
OUT_DIR = ROOT / "Backend" / "inputs" / "opendata" / "spf_noyades"
OUT_NEW = OUT_DIR / "noyades_departement_2025.csv"
OUT_FULL = OUT_DIR / "noyades_departement_2003_2024.csv"

YEAR = 2025
HEADER = [
    "Année", "Département", "Département Code",
    "Nombre de noyades accidentelles",
    "Nombres de noyades accidentelles suivies de décès",
    "Région", "Région Code",
]


def parse_2025_rows() -> list[dict]:
    """Lignes par département pour 2025 (colonnes index 4 = N, 5 = décès)."""
    rows: list[dict] = []
    seen: set[str] = set()
    with pdfplumber.open(PDF_FILE) as pdf:
        # Le Tableau 3 2025 s'étend sur 4 pages (indices 4-7) ; les DROM
        # (971-976) et la fin de la liste métropole sont sur la page 7.
        for page_num in (4, 5, 6, 7):
            page = pdf.pages[page_num]
            for t in page.extract_tables() or []:
                for line in t:
                    if not line or not line[0]:
                        continue
                    label = str(line[0]).strip()
                    m = DEP_CODE_RE.search(label)
                    if not m:
                        continue
                    code = _normalize_code(m.group(1))
                    if code not in DEP_NAME_FIX or code in seen:
                        continue
                    try:
                        n25 = _clean_count(line[4])
                        d25 = _clean_count(line[5])
                    except (ValueError, IndexError):
                        continue
                    seen.add(code)
                    rows.append({"code": code, "n": n25, "d": d25, "year": YEAR})
    return rows


def write_new_csv(rows: list[dict]):
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    def sort_key(r):
        c = r["code"]
        if c in ("2A", "2B"):
            return 20.5 if c == "2A" else 20.6
        return int(c) if c.isdigit() else 999

    with open(OUT_NEW, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(HEADER)
        for r in sorted(rows, key=sort_key):
            code = r["code"]
            reg_code = DEP_TO_REG_CODE.get(code, "")
            reg_name = REG_NAME_FROM_CODE.get(reg_code, "")
            w.writerow([r["year"], DEP_NAME_FIX[code], code, r["n"], r["d"], reg_name, reg_code])
    print(f"[OK] {OUT_NEW} : {len(rows)} lignes")


def append_to_full(rows: list[dict]):
    """Ajoute 2025 au CSV historique 2003-2024 (idempotent : skip si déjà présent)."""
    if not OUT_FULL.exists():
        print(f"[WARN] {OUT_FULL} introuvable, skip fusion.")
        return
    existing = OUT_FULL.read_text(encoding="utf-8-sig")
    if "\n2025;" in existing or existing.startswith("2025;"):
        print(f"[SKIP] 2025 déjà présent dans {OUT_FULL.name}")
        return

    def sort_key(r):
        c = r["code"]
        if c in ("2A", "2B"):
            return 20.5 if c == "2A" else 20.6
        return int(c) if c.isdigit() else 999

    with open(OUT_FULL, "a", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, delimiter=";")
        for r in sorted(rows, key=sort_key):
            code = r["code"]
            reg_code = DEP_TO_REG_CODE.get(code, "")
            reg_name = REG_NAME_FROM_CODE.get(reg_code, "")
            w.writerow([r["year"], DEP_NAME_FIX[code], code, r["n"], r["d"], reg_name, reg_code])
    print(f"[OK] 2025 ajouté à {OUT_FULL.name} : +{len(rows)} lignes")


if __name__ == "__main__":
    print(f"Source: {PDF_FILE}")
    rows = parse_2025_rows()
    print(f"Lignes 2025 extraites : {len(rows)} (attendu ~97)")
    guyane = [r for r in rows if r["code"] == "973"]
    print(f"Guyane 2025 : {guyane}")
    write_new_csv(rows)
    append_to_full(rows)
