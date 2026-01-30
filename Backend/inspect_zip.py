import zipfile
import os
from pathlib import Path

zip_path = Path(r"c:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack\Backend\output\educ_2022.zip")

if not zip_path.exists():
    print("Zip file not found!")
    exit(1)

print(f"Inspecting {zip_path}...")
with zipfile.ZipFile(zip_path, 'r') as z:
    for name in z.namelist():
        print(name)
