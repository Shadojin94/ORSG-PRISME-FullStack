@echo off
title PRISME V3 - Lancement
color 0A
echo ==========================================
echo    PRISME ORSG - V3 (Mode Standalone)
echo ==========================================
echo.

:: 1. Nettoyage des ports
echo [1/4] Nettoyage des processus precedents...
taskkill /F /IM python.exe /T >NUL 2>&1
taskkill /F /IM py.exe /T >NUL 2>&1
taskkill /F /IM node.exe /T >NUL 2>&1
taskkill /F /IM pocketbase.exe /T >NUL 2>&1

:: 2. Definition du chemin Python
set PYTHON_EXE=c:\Users\chad9\Documents\003.ORSG\Livraison_Client\_ARCHIVE_2026-01-20\ORSG_PRISME_V1\backend\venv\Scripts\python.exe

if not exist "%PYTHON_EXE%" (
    echo [INFO] Python venv introuvable, tentative avec 'py' global...
    set PYTHON_EXE=py
)

:: 3. Installation des dependances legeres (si manquantes)
echo [2/4] Verification des librairies...
"%PYTHON_EXE%" -m pip install fastapi uvicorn python-multipart >NUL 2>&1

:: 4. Demarrage
echo [3/4] Lancement du serveur unifie...
echo.
echo     [INFO] L'application va s'ouvrir dans votre navigateur.
echo     [INFO] Laissez cette fenetre ouverte tant que vous utilisez PRISME.
echo.

:: Ouvrir le navigateur apres une petite pause (pour laisser le temps au serveur de demarrer)
timeout /t 3 /nobreak >NUL
start "" "http://localhost:8000"

:: Lancer le serveur Python
"%PYTHON_EXE%" app.py

pause
