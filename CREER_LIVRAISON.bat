@echo off
echo ==========================================
echo    Creation du Package de Livraison
echo    PRISME ORSG v4.0 - Fevrier 2026
echo ==========================================
echo.

:: Variables
set "SRC=%~dp0"
set "DEST=%~dp0..\LIVRAISON_PRISME"
set "ZIP=%~dp0..\ORSG_PRISME_Livraison_v4.zip"

:: Clean up
if exist "%DEST%" rmdir /s /q "%DEST%"
if exist "%ZIP%" del "%ZIP%"

:: Create destination folder
mkdir "%DEST%"
mkdir "%DEST%\Backend"
mkdir "%DEST%\Backend\csv_sources"
mkdir "%DEST%\Backend\output"
mkdir "%DEST%\Frontend"

:: ===== BACKEND =====
echo [1/5] Copie du Backend...

:: Core files
copy "%SRC%Backend\file_server.js" "%DEST%\Backend\" /y
copy "%SRC%Backend\prisme_engine.py" "%DEST%\Backend\" /y
copy "%SRC%Backend\themes_config.json" "%DEST%\Backend\" /y
copy "%SRC%Backend\package.json" "%DEST%\Backend\" /y
copy "%SRC%Backend\package-lock.json" "%DEST%\Backend\" /y
copy "%SRC%Backend\pocketbase.exe" "%DEST%\Backend\" /y

:: CSV sources
echo [2/5] Copie des donnees CSV (36 fichiers)...
xcopy "%SRC%Backend\csv_sources\*.csv" "%DEST%\Backend\csv_sources\" /y /i /q

:: PocketBase data (database + migrations)
echo [3/5] Copie de la base de donnees...
xcopy "%SRC%Backend\pb_data\*" "%DEST%\Backend\pb_data\" /y /i /s /q
if exist "%SRC%Backend\pb_migrations" (
    xcopy "%SRC%Backend\pb_migrations\*" "%DEST%\Backend\pb_migrations\" /y /i /s /q
)

:: ===== FRONTEND =====
echo [4/5] Copie du Frontend compile...
xcopy "%SRC%Frontend\dist\*" "%DEST%\Frontend\dist\" /y /i /s /q

:: Frontend source (for dev mode)
xcopy "%SRC%Frontend\src\*" "%DEST%\Frontend\src\" /y /i /s /q
copy "%SRC%Frontend\package.json" "%DEST%\Frontend\" /y
copy "%SRC%Frontend\package-lock.json" "%DEST%\Frontend\" /y 2>nul
copy "%SRC%Frontend\vite.config.ts" "%DEST%\Frontend\" /y
copy "%SRC%Frontend\tsconfig.json" "%DEST%\Frontend\" /y
copy "%SRC%Frontend\tsconfig.app.json" "%DEST%\Frontend\" /y 2>nul
copy "%SRC%Frontend\index.html" "%DEST%\Frontend\" /y
copy "%SRC%Frontend\tailwind.config.*" "%DEST%\Frontend\" /y 2>nul
copy "%SRC%Frontend\postcss.config.*" "%DEST%\Frontend\" /y 2>nul
copy "%SRC%Frontend\components.json" "%DEST%\Frontend\" /y 2>nul

:: ===== ROOT FILES =====
echo [5/5] Copie des fichiers racine...
copy "%SRC%README_INSTALLATION.md" "%DEST%\" /y
copy "%SRC%LANCER_TOUT.bat" "%DEST%\" /y
copy "%SRC%LANCER_PRODUCTION.bat" "%DEST%\" /y
copy "%SRC%requirements.txt" "%DEST%\" /y

:: ===== CREATE ZIP =====
echo.
echo Creation du ZIP...
powershell -Command "Compress-Archive -Path '%DEST%\*' -DestinationPath '%ZIP%' -Force"

:: ===== SUMMARY =====
echo.
echo ==========================================
echo    Package cree avec succes !
echo ==========================================
echo.
echo    Dossier: %DEST%
echo    ZIP:     %ZIP%
echo.

:: Show size
for %%A in ("%ZIP%") do echo    Taille: %%~zA octets

echo.
echo    Contenu:
echo    - Backend (moteur + API + PocketBase)
echo    - Frontend (compile + sources)
echo    - 36 fichiers CSV MOCA-O
echo    - Documentation d'installation
echo    - Scripts de demarrage
echo.
pause
