"""Extraction des données noyades 2023-2024 depuis les bilans SPF PDF.

Source : "Bilan Noyades -2024-2025.pdf" (Santé publique France, 22 mai 2025).
Le Tableau 3 (pages 5-7) liste noyades + décès par région ET par département pour
2023 ET 2024. Ce tableau est la source la plus fine disponible : c'est de là que
vient ce CSV.

Le 1er PDF ("Bilan Noyades-2023_2024.pdf", été 2023 publié en 2024) ne donne que
des chiffres régionaux (outre-mer agrégé) : pas exploitable département par
département. Il est utilisé ici uniquement pour cohérence Total / âge et il est
archivé dans _noyades_dump/.

Format de sortie : identique à noyades_departement_2003_2021.csv
    Année;Département;Département Code;Nombre de noyades accidentelles;
    Nombres de noyades accidentelles suivies de décès;Région;Région Code
Séparateur ';' ; encoding utf-8-sig (BOM conservée pour cohérence avec source).

Lancement :
    python Backend/scripts/extract_noyades_pdf.py
Produit :
    Backend/inputs/opendata/spf_noyades/noyades_departement_2022_2024.csv
    Backend/inputs/opendata/spf_noyades/noyades_departement_2003_2024.csv  (fusion)
"""
from __future__ import annotations

import csv
import io
import re
import sys
from pathlib import Path

import pdfplumber

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[2]
PDF_DIR = Path(r"C:/Users/chad9/Documents/003.ORSG/Livraison_Client/Version_FullStack/livrables_17avril/Retour client")
PDF_FILE = PDF_DIR / "Bilan Noyades -2024-2025.pdf"
OUT_DIR = ROOT / "Backend" / "inputs" / "opendata" / "spf_noyades"
OUT_NEW = OUT_DIR / "noyades_departement_2022_2024.csv"
OUT_FULL = OUT_DIR / "noyades_departement_2003_2024.csv"
OLD_CSV = OUT_DIR / "noyades_departement_2003_2021.csv"

# Région -> (nom officiel CSV, code INSEE 2-chiffres)
REGIONS = {
    "Auvergne-Rhône-Alpes": ("Auvergne-Rhône-Alpes", "84"),
    "Bourgogne-Franche-Comté": ("Bourgogne-Franche-Comté", "27"),
    "Bretagne": ("Bretagne", "53"),
    "Centre-Val de Loire": ("Centre-Val de Loire", "24"),
    "Corse": ("Corse", "94"),
    "Grand Est": ("Grand Est", "44"),
    "Hauts-de-France": ("Hauts-de-France", "32"),
    "Île-de-France": ("Île-de-France", "11"),
    "Normandie": ("Normandie", "28"),
    "Nouvelle-Aquitaine": ("Nouvelle-Aquitaine", "75"),
    "Occitanie": ("Occitanie", "76"),
    "Pays de la Loire": ("Pays de la Loire", "52"),
    "Provence-Alpes-Côte d’Azur": ("Provence-Alpes-Côte d'Azur", "93"),
    # Outre-Mer : codes INSEE région = même que DEP pour DOM
    "Guadeloupe": ("Guadeloupe", "01"),
    "Martinique": ("Martinique", "02"),
    "Guyane": ("Guyane", "03"),
    "La Réunion": ("La Réunion", "04"),
    "Mayotte": ("Mayotte", "06"),
}

# Mapping département -> (nom officiel, code, région-code)
# Chaque DOM est sa propre région en INSEE (code région = code département)
DEP_TO_REG_CODE = {
    # Auvergne-Rhône-Alpes 84
    "01": "84", "03": "84", "07": "84", "15": "84", "26": "84",
    "38": "84", "42": "84", "43": "84", "63": "84", "69": "84",
    "73": "84", "74": "84",
    # Bourgogne-Franche-Comté 27
    "21": "27", "25": "27", "39": "27", "58": "27", "70": "27",
    "71": "27", "89": "27", "90": "27",
    # Bretagne 53
    "22": "53", "29": "53", "35": "53", "56": "53",
    # Centre-Val de Loire 24
    "18": "24", "28": "24", "36": "24", "37": "24", "41": "24", "45": "24",
    # Corse 94
    "2A": "94", "2B": "94",
    # Grand Est 44
    "08": "44", "10": "44", "51": "44", "52": "44", "54": "44",
    "55": "44", "57": "44", "67": "44", "68": "44", "88": "44",
    # Hauts-de-France 32
    "02": "32", "59": "32", "60": "32", "62": "32", "80": "32",
    # Île-de-France 11
    "75": "11", "77": "11", "78": "11", "91": "11", "92": "11",
    "93": "11", "94": "11", "95": "11",
    # Normandie 28
    "14": "28", "27": "28", "50": "28", "61": "28", "76": "28",
    # Nouvelle-Aquitaine 75
    "16": "75", "17": "75", "19": "75", "23": "75", "24": "75",
    "33": "75", "40": "75", "47": "75", "64": "75", "79": "75",
    "86": "75", "87": "75",
    # Occitanie 76
    "09": "76", "11": "76", "12": "76", "30": "76", "31": "76",
    "32": "76", "34": "76", "46": "76", "48": "76", "65": "76",
    "66": "76", "81": "76", "82": "76",
    # Pays de la Loire 52
    "44": "52", "49": "52", "53": "52", "72": "52", "85": "52",
    # PACA 93
    "04": "93", "05": "93", "06": "93", "13": "93", "83": "93", "84": "93",
    # Outre-mer
    "971": "01", "972": "02", "973": "03", "974": "04", "976": "06",
}

# Nom officiel de chaque département pour la colonne "Département"
DEP_NAME_FIX = {
    "01": "Ain", "02": "Aisne", "03": "Allier",
    "04": "Alpes-de-Haute-Provence", "05": "Hautes-Alpes", "06": "Alpes-Maritimes",
    "07": "Ardèche", "08": "Ardennes", "09": "Ariège",
    "10": "Aube", "11": "Aude", "12": "Aveyron",
    "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal",
    "16": "Charente", "17": "Charente-Maritime", "18": "Cher",
    "19": "Corrèze", "2A": "Corse-du-Sud", "2B": "Haute-Corse",
    "21": "Côte-d'Or", "22": "Côtes d'Armor", "23": "Creuse",
    "24": "Dordogne", "25": "Doubs", "26": "Drôme",
    "27": "Eure", "28": "Eure-et-Loir", "29": "Finistère",
    "30": "Gard", "31": "Haute-Garonne", "32": "Gers",
    "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine",
    "36": "Indre", "37": "Indre-et-Loire", "38": "Isère",
    "39": "Jura", "40": "Landes", "41": "Loir-et-Cher",
    "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique",
    "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne",
    "48": "Lozère", "49": "Maine-et-Loire", "50": "Manche",
    "51": "Marne", "52": "Haute-Marne", "53": "Mayenne",
    "54": "Meurthe-et-Moselle", "55": "Meuse", "56": "Morbihan",
    "57": "Moselle", "58": "Nièvre", "59": "Nord",
    "60": "Oise", "61": "Orne", "62": "Pas-de-Calais",
    "63": "Puy-de-Dôme", "64": "Pyrénées-Atlantiques",
    "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales",
    "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhône",
    "70": "Haute-Saône", "71": "Saône-et-Loire", "72": "Sarthe",
    "73": "Savoie", "74": "Haute-Savoie", "75": "Paris",
    "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines",
    "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn",
    "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse",
    "85": "Vendée", "86": "Vienne", "87": "Haute-Vienne",
    "88": "Vosges", "89": "Yonne", "90": "Territoire-de-Belfort",
    "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis",
    "94": "Val-de-Marne", "95": "Val-D'Oise",
    "971": "Guadeloupe", "972": "Martinique", "973": "Guyane",
    "974": "La Réunion", "976": "Mayotte",
}

REG_NAME_FROM_CODE = {
    "84": "Auvergne-Rhône-Alpes",
    "27": "Bourgogne-Franche-Comté",
    "53": "Bretagne",
    "24": "Centre-Val de Loire",
    "94": "Corse",
    "44": "Grand Est",
    "32": "Hauts-de-France",
    "11": "Île-de-France",
    "28": "Normandie",
    "75": "Nouvelle-Aquitaine",
    "76": "Occitanie",
    "52": "Pays de la Loire",
    "93": "Provence-Alpes-Côte d'Azur",
    "01": "Guadeloupe",
    "02": "Martinique",
    "03": "Guyane",
    "04": "La Réunion",
    "06": "Mayotte",
}

DEP_CODE_RE = re.compile(r"\((\d{1,3}|2A|2B)\)\s*$")


def _normalize_code(raw: str) -> str:
    raw = raw.strip()
    if raw in ("2A", "2B"):
        return raw
    if raw.isdigit():
        if len(raw) == 3:
            return raw  # Outre-mer 971-976
        return raw.zfill(2)
    return raw


def _clean_count(raw: str):
    """Convertit une cellule d'effectif PDF en int, ou None si manquant.

    Le PDF SPF code la donnée non disponible / secret statistique par -9.
    Cette valeur ne doit jamais traverser le pipeline : on la transforme en
    manquant (None -> cellule vide dans le CSV puis dans l'Excel final).
    """
    val = int(str(raw).strip())
    if val == -9:
        return None
    return val


def parse_dep_tables() -> list[dict]:
    """Retourne les lignes par département pour 2023 et 2024."""
    rows: list[dict] = []
    with pdfplumber.open(PDF_FILE) as pdf:
        # Pages 5,6,7 (indices 4,5,6) contiennent le Tableau 3
        for page_num in (4, 5, 6):
            page = pdf.pages[page_num]
            tables = page.extract_tables()
            if not tables:
                continue
            for t in tables:
                for line in t:
                    if not line or not line[0]:
                        continue
                    label = str(line[0]).strip()
                    # Match ligne département "Nom (code)"
                    m = DEP_CODE_RE.search(label)
                    if not m:
                        continue
                    code = _normalize_code(m.group(1))
                    # Valeurs colonnes: 2023_N, 2023_deces, 2023_%, 2024_N, 2024_deces, 2024_%
                    try:
                        n23 = _clean_count(line[1])
                        d23 = _clean_count(line[2])
                        n24 = _clean_count(line[4])
                        d24 = _clean_count(line[5])
                    except (ValueError, IndexError):
                        continue
                    if code not in DEP_NAME_FIX:
                        continue
                    rows.append({"code": code, "n": n23, "d": d23, "year": 2023})
                    rows.append({"code": code, "n": n24, "d": d24, "year": 2024})
    return rows


def write_new_csv(rows: list[dict]):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    header = [
        "Année", "Département", "Département Code",
        "Nombre de noyades accidentelles",
        "Nombres de noyades accidentelles suivies de décès",
        "Région", "Région Code",
    ]
    with open(OUT_NEW, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(header)
        # Trier : année, code département
        def sort_key(r):
            c = r["code"]
            if c in ("2A", "2B"):
                return (r["year"], 20.5 if c == "2A" else 20.6)
            return (r["year"], int(c) if c.isdigit() else 999)

        for r in sorted(rows, key=sort_key):
            code = r["code"]
            dep_name = DEP_NAME_FIX[code]
            reg_code = DEP_TO_REG_CODE.get(code, "")
            reg_name = REG_NAME_FROM_CODE.get(reg_code, "")
            w.writerow([
                r["year"], dep_name, code,
                r["n"], r["d"], reg_name, reg_code,
            ])
    print(f"[OK] {OUT_NEW} : {len(rows)} lignes")


def merge_with_old():
    """Concatène 2003-2021 + 2022-2024 dans 2003-2024."""
    if not OLD_CSV.exists():
        print(f"[WARN] {OLD_CSV} introuvable, skip fusion.")
        return
    total = 0
    with open(OUT_FULL, "w", encoding="utf-8-sig", newline="") as fout:
        # Recopier l'ancien fichier entièrement (incluant header)
        with open(OLD_CSV, "r", encoding="utf-8-sig") as fold:
            for i, line in enumerate(fold):
                fout.write(line)
                total += 1
        # Ajouter le nouveau (sans son header)
        with open(OUT_NEW, "r", encoding="utf-8-sig") as fnew:
            next(fnew)  # skip header
            for line in fnew:
                fout.write(line)
                total += 1
    print(f"[OK] {OUT_FULL} : {total} lignes (header inclus)")


if __name__ == "__main__":
    print(f"Source: {PDF_FILE}")
    rows = parse_dep_tables()
    print(f"Lignes département extraites : {len(rows)} (attendu 97*2=194)")
    # Sanity check Guyane
    guyane = [r for r in rows if r["code"] == "973"]
    print(f"Guyane : {guyane}")
    write_new_csv(rows)
    merge_with_old()
