#!/usr/bin/env python3
"""
PRISME - Download missing OpenData files for Docker/VPS deployment.
Idempotent: skips files that already exist.
Called by entrypoint.sh on first container start.
"""
import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).parent
INPUTS_DIR = BASE_DIR / "inputs" / "opendata"

# BAAC data from data.gouv.fr (ONISR road accident database)
# Using the dataset API to resolve current download URLs
BAAC_DATASET_ID = "53698f4ca3a729239d2036df"
BAAC_YEARS = [2019, 2020, 2021, 2022, 2023, 2024]


def download_baac():
    """Download BAAC road accident CSV files from data.gouv.fr"""
    baac_dir = INPUTS_DIR / "baac"
    baac_dir.mkdir(parents=True, exist_ok=True)

    # Check if already complete
    needed = []
    for year in BAAC_YEARS:
        if not (baac_dir / f"caract_{year}.csv").exists():
            needed.append(("caract", year))
        if not (baac_dir / f"usagers_{year}.csv").exists():
            needed.append(("usagers", year))

    if not needed:
        print("[BAAC] All files present, skipping.")
        return

    print(f"[BAAC] Downloading {len(needed)} missing files...")

    try:
        import requests
        # Get dataset metadata from data.gouv.fr API
        resp = requests.get(
            f"https://www.data.gouv.fr/api/1/datasets/{BAAC_DATASET_ID}/",
            timeout=30
        )
        resp.raise_for_status()
        resources = resp.json().get("resources", [])

        # Build a map of resource titles/filenames to URLs
        url_map = {}
        for r in resources:
            title = (r.get("title", "") + " " + r.get("url", "")).lower()
            url_map[title] = r.get("url", "")

        for file_type, year in needed:
            # Search for matching resource
            search_terms = [f"{file_type}-{year}", f"{file_type}_{year}", f"caractéristiques-{year}" if file_type == "caract" else f"usagers-{year}"]
            url = None
            for term in search_terms:
                for title, u in url_map.items():
                    if term.lower() in title:
                        url = u
                        break
                if url:
                    break

            if not url:
                # Fallback: try direct pattern
                url = f"https://static.data.gouv.fr/resources/bases-de-donnees-annuelles-des-accidents-corporels-de-la-circulation-routiere-annees-de-2005-a-2023/20241007-094323/{file_type}-{year}.csv"

            dest = baac_dir / f"{file_type}_{year}.csv"
            print(f"  -> {dest.name} ...")
            try:
                r = requests.get(url, timeout=120)
                r.raise_for_status()
                dest.write_bytes(r.content)
                print(f"     OK ({len(r.content) // 1024} KB)")
            except Exception as e:
                print(f"     FAILED: {e}")

    except ImportError:
        print("[BAAC] 'requests' not available, trying curl fallback...")
        for file_type, year in needed:
            dest = baac_dir / f"{file_type}_{year}.csv"
            url = f"https://static.data.gouv.fr/resources/bases-de-donnees-annuelles-des-accidents-corporels-de-la-circulation-routiere-annees-de-2005-a-2023/20241007-094323/{file_type}-{year}.csv"
            os.system(f'curl -sL "{url}" -o "{dest}"')
    except Exception as e:
        print(f"[BAAC] Error: {e}")


def download_insee():
    """Run download_opendata.py for INSEE/CAF data"""
    script = BASE_DIR / "download_opendata.py"
    if not script.exists():
        print("[INSEE] download_opendata.py not found, skipping.")
        return

    # Check if some key files already exist
    has_diplomes = any(INPUTS_DIR.glob("diplomes_formation_202*.csv"))
    has_couples = any(INPUTS_DIR.glob("couples_familles_202*.csv"))

    if has_diplomes and has_couples:
        print("[INSEE] Key files already present, skipping download.")
        return

    print("[INSEE] Downloading Open Data sources...")
    try:
        subprocess.run(
            [sys.executable, str(script), "--recent"],
            cwd=str(BASE_DIR),
            timeout=600,
            check=False
        )
    except Exception as e:
        print(f"[INSEE] Download error: {e}")


def main():
    print("=" * 60)
    print("PRISME - Checking/downloading missing data files")
    print("=" * 60)

    INPUTS_DIR.mkdir(parents=True, exist_ok=True)

    download_insee()
    download_baac()

    # Summary
    print("\n" + "=" * 60)
    csv_count = len(list(INPUTS_DIR.rglob("*.csv")))
    xlsx_count = len(list(INPUTS_DIR.rglob("*.xlsx")))
    print(f"Data files: {csv_count} CSV + {xlsx_count} XLSX")
    print("=" * 60)


if __name__ == "__main__":
    main()
