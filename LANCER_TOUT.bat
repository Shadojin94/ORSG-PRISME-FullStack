@echo off
echo ==========================================
echo    PRISME ORSG - Demarrage Automatique
echo ==========================================
echo.

:: Start PocketBase
echo [1/3] Lancement de PocketBase...
start "PocketBase" cmd /k "cd /d %~dp0Backend && pocketbase.exe serve"

:: Wait for PocketBase to start
timeout /t 3 /nobreak > nul

:: Start File Server (Node.js)
echo [2/3] Lancement du serveur de fichiers...
start "FileServer" cmd /k "cd /d %~dp0Backend && node file_server.js"

:: Wait for File Server
timeout /t 2 /nobreak > nul

:: Start Python Engine
echo [2.5/3] Lancement du Moteur Python...
start "PrismeEngine" cmd /k "cd /d %~dp0Backend && ..\..\ORSG_PRISME_V1\backend\venv\Scripts\python.exe generate_reports.py"

:: Wait for Engine
timeout /t 2 /nobreak > nul

:: Start Frontend
echo [3/3] Lancement du Frontend...
start "Frontend" cmd /k "cd /d %~dp0Frontend && npm run dev"

:: Wait and open browser
timeout /t 5 /nobreak > nul
echo.
echo ==========================================
echo    Ouverture du navigateur...
echo ==========================================
start http://localhost:5173

echo.
echo Tous les services sont lances !
echo Fermez cette fenetre pour continuer a utiliser l'application.
pause
