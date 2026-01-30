@echo off
echo ==========================================
echo    NETTOYAGE - PRISME ORSG
echo ==========================================
echo.
echo [1/3] Arret de NodeJS...
taskkill /F /IM node.exe /T 2>NUL
echo [2/3] Arret de Python...
taskkill /F /IM python.exe /T 2>NUL
taskkill /F /IM py.exe /T 2>NUL
echo [3/3] Arret de PocketBase...
taskkill /F /IM pocketbase.exe /T 2>NUL

echo.
echo Nettoyage termine ! Vous pouvez relancer LANCER_TOUT.bat
pause
