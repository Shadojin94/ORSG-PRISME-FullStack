#!/usr/bin/env python3
"""
Extrait le fichier MOCA-O mortalite_patho_2018_2023.xls et produit
un CSV consolide au format MOCA lu par parse_moca_filter_csv.

Structure CSV (separateur ;, encodage cp1252) :
  col0-2 : vides (padding pour respecter year=3, filter=4, geo=5, value=6)
  col3 : annee
  col4 : cause (libelle pathologie, sert de filtre)
  col5 : commune (format "97301 - Regina" ou libelle France/DOM/Region)
  col6 : valeur

Les 2 premieres lignes sont des headers ignores par le parser (pas de 4-digit year).
Agregation : pour chaque (annee, commune, cause) on somme masculin+feminin
(le fichier source contient aussi une ligne "Sexe" = total, qu'on privilegie).
"""
import pandas as pd
from pathlib import Path

SRC = Path(r'C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Donnees_Pathologies_Population\Moca O_mortalite_patho_2018_2023 (1).xls')
OUT = Path(__file__).parent / 'csv_sources' / 'Mortalite_Patho_GF_2018_2023.csv'

print(f'[1/3] Lecture {SRC.name}...')
df = pd.read_excel(SRC, sheet_name=0, header=None)
data = df.iloc[3:, [0, 1, 2, 3, 4, 5, 6]].copy()
data.columns = ['annee', 'commune', 'sexe', 'age', 'popref', 'cause_raw', 'valeur']

# Nettoyer cause : extraire apres # si present
data = data[data['cause_raw'].notna()].copy()
data['cause'] = data['cause_raw'].astype(str).str.split('#').str[-1].str.strip()

# Filtrer header leftovers
BAD = {'Causes_de_deces_alphabetique', 'Cause_deces', ''}
data = data[~data['cause'].isin(BAD)]
data = data[data['annee'].apply(lambda x: isinstance(x, (int, float)) and 2000 <= x <= 2030)]

# Valeur numerique
data['valeur'] = pd.to_numeric(data['valeur'], errors='coerce')
# -999 = secret stat => drop (le parser mettra 0 si absent, mieux que -999)
data = data[data['valeur'].notna() & (data['valeur'] != -999)]

# Strategie : on prefere la ligne "Sexe" (total) quand elle existe, sinon somme M+F.
# Dans le fichier observe seules les lignes "Sexe" portent une valeur; M/F sont NaN.
# On garde donc toutes les lignes non nulles.
print(f'  {len(data)} lignes valides apres filtrage (valeur != -999 et != NaN)')
print(f'  Causes presentes : {sorted(data["cause"].unique())}')
print(f'  Annees : {sorted(data["annee"].astype(int).unique())}')
print(f'  Communes : {data["commune"].nunique()}')

# Agregation : si plusieurs lignes par (annee, commune, cause), on fait la somme
# (cas ou M+F sont renseignes separement sans total)
agg = (data.groupby(['annee', 'commune', 'cause'], as_index=False)['valeur']
       .sum())
agg['annee'] = agg['annee'].astype(int)

print(f'[2/3] Agregation : {len(agg)} lignes finales')

# Ecriture CSV format MOCA
# Layout: ;;;{annee};{cause};{commune};{valeur}
print(f'[3/3] Ecriture {OUT}')
OUT.parent.mkdir(parents=True, exist_ok=True)
with open(OUT, 'w', encoding='cp1252', errors='replace', newline='') as f:
    # 2 lignes header (ignorees par parser car pas de year 4 chiffres)
    f.write(';;;Date_deces_Cim10#Annee;Cause_deces#Causes_de_deces_alphabetique;Lieu_domicile#commune;Nb_deces_standardises\r\n')
    f.write(';;;;;;\r\n')
    for _, row in agg.iterrows():
        annee = row['annee']
        cause = str(row['cause']).replace(';', ',')
        commune = str(row['commune']).replace(';', ',')
        val = f'{row["valeur"]:.2f}'.replace('.', ',')
        f.write(f';;;{annee};{cause};{commune};{val}\r\n')

print(f'OK -> {OUT} ({OUT.stat().st_size} octets, {len(agg)} lignes)')
