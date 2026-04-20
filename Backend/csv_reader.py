#!/usr/bin/env python3
"""
csv_reader — Lecture robuste des CSV MOCA-O / Open Data pour PRISME.

Problèmes récurrents couverts :
- Encodage : utf-8 avec BOM, utf-8, cp1252, latin-1 (export Excel FR)
- Séparateur : ';' majoritaire, ',' parfois, '\\t' rare
- Valeurs manquantes diverses : "", "NA", "N/A", "ND", ".", "-", "–", "—"
- BOM résiduel sur la première colonne (\\ufeff)
- Espaces parasites autour des noms de colonnes

Fournit :
- read_csv_safe(path, sep=None, **kwargs) -> (df, meta)
- normalize_geo_code(value, width=5) -> str  (avec zfill conditionnel)
- log_read(meta)   -> print standardisé [READ] ...
"""

from __future__ import annotations
from pathlib import Path
from typing import Optional, Tuple, Dict, Any
import pandas as pd


# Valeurs à interpréter comme NaN (en plus des standards pandas).
MOCA_NA_VALUES = [
    "", " ", "NA", "N/A", "n/a", "na",
    "ND", "nd", "N.D.", "n.d.",
    ".", "-", "–", "—",
    "null", "NULL", "None", "#N/A",
]

ENCODINGS_TRY_ORDER = ("utf-8-sig", "utf-8", "cp1252", "latin-1")
SEPARATORS_TRY_ORDER = (";", ",", "\t", "|")


def _sniff_separator(sample: str) -> Optional[str]:
    """Devine le séparateur en comptant les occurrences sur la 1ère ligne non vide."""
    for line in sample.splitlines():
        if not line.strip():
            continue
        counts = {s: line.count(s) for s in SEPARATORS_TRY_ORDER}
        best = max(counts, key=counts.get)
        if counts[best] >= 1:
            return best
        return None
    return None


def _clean_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Retire BOM et espaces superflus des noms de colonnes."""
    def _clean(name):
        s = str(name)
        # BOM résiduel (même après utf-8-sig si double encode)
        if s.startswith("\ufeff"):
            s = s.lstrip("\ufeff")
        return s.strip()
    df.columns = [_clean(c) for c in df.columns]
    return df


def read_csv_safe(
    path: Path | str,
    sep: Optional[str] = None,
    dtype: Optional[dict] = None,
    usecols=None,
    extra_na_values: Optional[list] = None,
    **read_csv_kwargs,
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Lit un CSV avec détection robuste encoding + séparateur.

    Args:
        path: chemin du fichier
        sep: séparateur à forcer; None => auto-détection
        dtype: dict passé à pd.read_csv
        usecols: colonnes à lire
        extra_na_values: valeurs supplémentaires à considérer comme NaN
        **read_csv_kwargs: autres kwargs passés à pd.read_csv

    Returns:
        (df, meta) où meta = {
            'path': str, 'encoding': str, 'separator': str,
            'rows': int, 'columns': int,
            'fallback_used': bool
        }

    Raises:
        RuntimeError si aucune combinaison ne parvient à lire.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"CSV introuvable : {path}")

    na_values = list(MOCA_NA_VALUES)
    if extra_na_values:
        na_values.extend(extra_na_values)

    sample: Optional[str] = None
    sample_encoding: Optional[str] = None

    # 1. Lire un échantillon pour sniffer le séparateur si besoin
    for enc in ENCODINGS_TRY_ORDER:
        try:
            with open(path, "r", encoding=enc, errors="strict") as f:
                sample = f.read(8192)
            if "\ufffd" in sample:
                continue
            sample_encoding = enc
            break
        except (UnicodeDecodeError, UnicodeError):
            continue

    if sample is None:
        # Dernier recours : latin-1 avec remplacement
        with open(path, "r", encoding="latin-1", errors="replace") as f:
            sample = f.read(8192)
        sample_encoding = "latin-1 (fallback)"

    sniffed_sep = sep or _sniff_separator(sample) or ";"

    # 2. Tenter la lecture pandas : couple (enc, sep) prioritaire puis fallbacks
    tried = []
    last_error: Optional[Exception] = None

    # Construire la liste d'essais : (encoding, separator)
    encodings_to_try = (sample_encoding,) + tuple(
        e for e in ENCODINGS_TRY_ORDER if e != sample_encoding
    )
    separators_to_try = (sniffed_sep,) + tuple(
        s for s in SEPARATORS_TRY_ORDER if s != sniffed_sep
    )

    for enc in encodings_to_try:
        for s in separators_to_try:
            tried.append((enc, s))
            try:
                df = pd.read_csv(
                    path,
                    sep=s,
                    encoding=enc,
                    dtype=dtype,
                    usecols=usecols,
                    na_values=na_values,
                    keep_default_na=True,
                    low_memory=False,
                    **read_csv_kwargs,
                )
                # Heuristique : on veut au moins 2 colonnes (sinon mauvais séparateur)
                if df.shape[1] < 2 and len(separators_to_try) > 1:
                    continue
                df = _clean_columns(df)
                meta = {
                    "path": str(path),
                    "encoding": enc,
                    "separator": s,
                    "rows": len(df),
                    "columns": len(df.columns),
                    "fallback_used": (enc, s) != (sample_encoding, sniffed_sep),
                }
                return df, meta
            except Exception as exc:
                last_error = exc
                continue

    # 3. Dernier recours : latin-1 + replace
    try:
        df = pd.read_csv(
            path,
            sep=sniffed_sep,
            encoding="latin-1",
            encoding_errors="replace",
            dtype=dtype,
            usecols=usecols,
            na_values=na_values,
            keep_default_na=True,
            low_memory=False,
            **read_csv_kwargs,
        )
        df = _clean_columns(df)
        meta = {
            "path": str(path),
            "encoding": "latin-1 (replace)",
            "separator": sniffed_sep,
            "rows": len(df),
            "columns": len(df.columns),
            "fallback_used": True,
        }
        return df, meta
    except Exception as exc:
        last_error = exc

    raise RuntimeError(
        f"Impossible de lire {path}. Tentatives: {tried[:6]}... "
        f"Dernière erreur: {last_error}"
    )


def normalize_geo_code(value, width: int = 5) -> str:
    """Normalise un code géo : gère float (93.0 -> '93'), 2A/2B, zfill conditionnel.

    width=2 : code région/département standard (ex: '02', '93')
    width=5 : code commune INSEE (ex: '97301')
    Les codes Corse (2A, 2B) et DOM (971-976) sont préservés tels quels.
    """
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    s = str(value).strip()
    if s.endswith(".0"):
        s = s[:-2]
    if s in ("2A", "2B", "2a", "2b"):
        return s.upper()
    if s.isdigit():
        if len(s) < width:
            return s.zfill(width)
        return s
    return s


def log_read(meta: Dict[str, Any], prefix: str = "  [READ]") -> None:
    """Log standardisé d'une lecture CSV."""
    flag = " (fallback)" if meta.get("fallback_used") else ""
    name = Path(meta["path"]).name
    print(
        f"{prefix} {name} -> enc={meta['encoding']} sep={meta['separator']!r} "
        f"rows={meta['rows']} cols={meta['columns']}{flag}"
    )
