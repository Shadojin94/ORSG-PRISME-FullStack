@echo off
echo ==========================================
echo    PRISME ORSG - Mode Production
echo ==========================================
echo.

:: Start PocketBase
echo [1/2] Lancement de PocketBase...
start "PocketBase" cmd /k "cd /d %~dp0Backend && pocketbase.exe serve"

:: Wait for PocketBase to start
timeout /t 3 /nobreak > nul

:: Start File Server (Node.js) - sert l'API + le frontend
echo [2/2] Lancement du serveur (API + Frontend)...
start "FileServer" cmd /k "cd /d %~dp0Backend && node file_server.js"

:: Wait and open browser
timeout /t 3 /nobreak > nul
echo.
echo ==========================================
echo    Ouverture du navigateur...
echo ==========================================
start http://localhost:3001

echo.
echo ==========================================
echo    Services actifs :
echo    - PocketBase : http://localhost:8090
echo    - Application : http://localhost:3001
echo ==========================================
echo.
echo Mode production : le frontend est compile et servi
echo directement par le serveur Node.js (port 3001).
echo Pas besoin de npm ou Vite.
echo.
pause
