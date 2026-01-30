@echo off
echo ==========================================
echo    Creation du Package de Livraison
echo ==========================================
echo.

:: Variables
set "SRC=C:\Users\chad9\Documents\003.ORSG\Livraison_Client\Version_FullStack"
set "DEST=C:\Users\chad9\Documents\003.ORSG\Livraison_Client\LIVRAISON"
set "ZIP=C:\Users\chad9\Documents\003.ORSG\Livraison_Client\ORSG_PRISME_Livraison.zip"

:: Clean up
if exist "%DEST%" rmdir /s /q "%DEST%"
if exist "%ZIP%" del "%ZIP%"

:: Create destination folder
mkdir "%DEST%"
mkdir "%DEST%\Backend"
mkdir "%DEST%\Frontend"

:: Copy Backend (without large files)
echo [1/4] Copie du Backend...
xcopy "%SRC%\Backend\*.py" "%DEST%\Backend\" /y
xcopy "%SRC%\Backend\*.js" "%DEST%\Backend\" /y
xcopy "%SRC%\Backend\*.bat" "%DEST%\Backend\" /y
xcopy "%SRC%\Backend\*.json" "%DEST%\Backend\" /y
xcopy "%SRC%\Backend\*.example" "%DEST%\Backend\" /y
xcopy "%SRC%\Backend\csv_sources\*" "%DEST%\Backend\csv_sources\" /y /i
xcopy "%SRC%\Backend\pb_data\*" "%DEST%\Backend\pb_data\" /y /i /s
copy "%SRC%\Backend\pocketbase.exe" "%DEST%\Backend\" /y

:: Copy Frontend dist (compiled)
echo [2/4] Copie du Frontend compile...
xcopy "%SRC%\Frontend\dist\*" "%DEST%\Frontend\dist\" /y /i /s
copy "%SRC%\Frontend\package.json" "%DEST%\Frontend\" /y
copy "%SRC%\Frontend\vite.config.ts" "%DEST%\Frontend\" /y
copy "%SRC%\Frontend\tsconfig.json" "%DEST%\Frontend\" /y

:: Copy root files
echo [3/4] Copie des fichiers racine...
copy "%SRC%\README.md" "%DEST%\" /y
copy "%SRC%\README_INSTALLATION.md" "%DEST%\" /y
copy "%SRC%\LANCER_TOUT.bat" "%DEST%\" /y
copy "%SRC%\CONTEXTE_PROJET_FULLSTACK.md" "%DEST%\" /y

:: Create ZIP using PowerShell
echo [4/4] Creation du ZIP...
powershell -Command "Compress-Archive -Path '%DEST%\*' -DestinationPath '%ZIP%' -Force"

echo.
echo ==========================================
echo    Package cree avec succes !
echo    Emplacement: %ZIP%
echo ==========================================
pause
