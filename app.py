import sys
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# ==========================================
# CONFIGURATION
# ==========================================
BASE_DIR = Path(__file__).parent
BACKEND_DIR = BASE_DIR / "Backend"
FRONTEND_DIST = BASE_DIR / "Frontend" / "dist"

# Add Backend to path to import the engine
sys.path.append(str(BACKEND_DIR))

# Import Engine Logic (prisme_engine.py - config-driven avec tous les datasets)
try:
    from prisme_engine import generate_prisme_excel, OUTPUT_DIR, CSV_SOURCES_DIR
except ImportError as e:
    print(f"CRITICAL ERROR: Could not import generation engine. {e}") 
    sys.exit(1)

# Ensure output directory exists
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# FASTAPI APP
# ==========================================
app = FastAPI(title="PRISME Engine V3", version="3.0.0")

# CORS setup (Allow all for local reliability)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# API ROUTES
# ==========================================

@app.post("/api/generate")
async def generate_report(theme: str, year: int):
    """
    Triggers the generation of the Excel report.
    This runs synchronously in the threadpool (FastAPI default behavior for def),
    which is acceptable for this use case.
    """
    print(f"Request: Generate {theme} for {year}")
    
    try:
        # Call the engine (prisme_engine.generate_prisme_excel(dataset_id, year))
        output_path = generate_prisme_excel(theme, year)
        
        if output_path and output_path.exists():
            filename = output_path.name
            print(f"Success: {filename}")
            return {
                "success": True, 
                "filename": filename,
                "message": "Fichier généré avec succès"
            }
        else:
            print("Failure: Engine returned None")
            return {
                "success": False, 
                "error": "La génération a échoué (Erreur interne moteur)"
            }
            
    except Exception as e:
        print(f"Exception during generation: {e}")
        return {
            "success": False, 
            "error": str(e)
        }

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """
    Serves the generated file from the output directory.
    """
    file_path = OUTPUT_DIR / filename
    
    # Security check: prevent traversing directories
    if ".." in filename or "/" in filename or "\\" in filename:
         raise HTTPException(status_code=400, detail="Invalid filename")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Fichier introuvable")
    
    # Determine media type
    media_type = 'application/octet-stream'
    if filename.endswith('.zip'):
        media_type = 'application/zip'
    elif filename.endswith('.xlsx'):
        media_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        
    return FileResponse(
        path=file_path, 
        filename=filename, 
        media_type=media_type
    )

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "engine": "python-fastapi"}

# ==========================================
# STATIC FILES SERVING (REACT APP)
# ==========================================

if FRONTEND_DIST.exists():
    print(f"Serving Frontend from: {FRONTEND_DIST}")
    
    # Mount assets (CSS, JS, Images)
    if (FRONTEND_DIST / "assets").exists():
        app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")
    
    # Catch-all route for SPA (Single Page Application)
    # This must be defined AFTER API routes
    @app.get("/{catchall:path}")
    async def serve_react_app(catchall: str):
        # 1. Check if the specific file exists in dist root (e.g. favicon.ico, etc.)
        file_path = FRONTEND_DIST / catchall
        if file_path.is_file():
            return FileResponse(file_path)
            
        # 2. Otherwise return index.html (React Router handles the rest)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    print("WARNING: Frontend dist folder not found. API mode only.")

# ==========================================
# MAIN ENTRY POINT
# ==========================================
if __name__ == "__main__":
    print("Starting PRISME Server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
