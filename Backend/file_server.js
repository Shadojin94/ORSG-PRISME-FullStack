/**
 * PRISME File Server with On-Demand Generation + Metadata API
 * Handles file generation (via Python), file serving, config metadata, and OTP auth
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const Busboy = require('busboy');
const PocketBase = require('pocketbase').default || require('pocketbase');

// Load .env file if present (simple parser, no dotenv dependency)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = val;
        }
    }
}

const PORT = process.env.PORT || 3001;
const OUTPUT_DIR = path.join(__dirname, 'output');
const CONFIG_FILE = path.join(__dirname, 'themes_config.json');
const CSV_SOURCES_DIR = path.join(__dirname, 'csv_sources');
const IMPORT_HISTORY_FILE = path.join(CSV_SOURCES_DIR, 'import_history.json');
const FRONTEND_DIST = path.join(__dirname, '..', 'Frontend', 'dist');
const PYTHON_EXE = process.env.PYTHON_EXE || 'py';
const ACTIVITY_LOG_FILE = path.join(__dirname, 'activity_log.json');

// PocketBase config
const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || '';
const PB_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || '';
const PB_SYSTEM_PASSWORD = process.env.PB_SYSTEM_PASSWORD || 'PrismeSystemAuth2026!';

// SMTP config (optional — if absent, codes are logged to console)
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'Data Visus ORSG <noreply@orsg.fr>';

// PocketBase admin client (initialized lazily)
let pbAdmin = null;
let pbAdminReady = false;

async function getPbAdmin() {
    if (pbAdminReady && pbAdmin) return pbAdmin;
    pbAdmin = new PocketBase(PB_URL);
    if (PB_ADMIN_EMAIL && PB_ADMIN_PASSWORD) {
        try {
            await pbAdmin.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
            pbAdminReady = true;
            console.log('   PocketBase admin authenticated');
        } catch (e) {
            console.error(`   PocketBase admin auth failed for ${PB_ADMIN_EMAIL} at ${PB_URL}:`, e.message);
            console.error('   Check POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in .env');
            pbAdminReady = false;
        }
    } else {
        console.error('   PocketBase admin credentials not configured (POCKETBASE_ADMIN_EMAIL / POCKETBASE_ADMIN_PASSWORD)');
    }
    return pbAdmin;
}

// Nodemailer (loaded lazily to not crash if not installed)
let nodemailer = null;
try {
    nodemailer = require('nodemailer');
} catch (_e) {
    console.warn('   nodemailer not installed — OTP codes will be logged to console only');
}

async function sendEmailCode(email, code) {
    if (!nodemailer || !SMTP_HOST || !SMTP_USER) {
        console.log(`\n   [OTP] Code for ${email}: ${code}  (email not configured, showing in console)\n`);
        return;
    }
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject: `Votre code de connexion Data Visus : ${code}`,
        text: `Votre code de connexion Data Visus est : ${code}\n\nCe code expire dans 5 minutes.\nSi vous n'avez pas demande ce code, ignorez ce message.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:16px">
            <h2 style="color:#1a4b8c;margin-bottom:8px">Data Visus</h2>
            <p style="color:#374151">Votre code de connexion :</p>
            <div style="background:#f0f9ff;border:2px solid #3bb3a9;border-radius:12px;padding:24px;text-align:center;margin:16px 0">
                <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a4b8c">${code}</span>
            </div>
            <p style="color:#6b7280;font-size:14px">Ce code expire dans <strong>5 minutes</strong>.</p>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">Si vous n'avez pas demande ce code, ignorez ce message.</p>
        </div>`,
    });
    console.log(`   [OTP] Code sent to ${email}`);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load themes config (cached, reloadable)
let themesConfig = loadConfig();

function loadConfig() {
    try {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error(`Failed to load config: ${e.message}`);
        return { datasets: {}, themeTree: [], geoLevels: {} };
    }
}

/**
 * Read JSON body from a request
 */
function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}

function jsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    // Strip /api prefix so routes work both with and without it
    // (Vite dev proxy strips it, but production mode sends it directly)
    const rawPath = url.pathname;
    const urlPath = rawPath.startsWith('/api/') ? rawPath.replace(/^\/api/, '') : rawPath;

    // ========== HEALTH CHECK ==========
    if (urlPath === '/health') {
        jsonResponse(res, 200, { status: 'ok', version: '4.0' });
        return;
    }

    // ========== THEMES TREE ==========
    if (urlPath === '/themes' && req.method === 'GET') {
        jsonResponse(res, 200, { success: true, themes: themesConfig.themeTree || [] });
        return;
    }

    // ========== DATASETS LIST ==========
    if (urlPath === '/datasets' && req.method === 'GET') {
        const datasets = {};
        for (const [id, cfg] of Object.entries(themesConfig.datasets || {})) {
            datasets[id] = {
                id,
                name: cfg.name || id,
                folderPath: cfg.folderPath || '',
                fileName: cfg.fileName || id,
                sheets: cfg.sheets || ['com', 'reg', 'dom', 'fh', 'fra'],
                variables: (cfg.columns || []).filter(c => c.type === 'variable').map(c => c.id)
            };
        }
        jsonResponse(res, 200, { success: true, datasets });
        return;
    }

    // ========== DATASET INFO ==========
    if (urlPath === '/dataset-info' && req.method === 'GET') {
        const datasetId = url.searchParams.get('id');
        const cfg = (themesConfig.datasets || {})[datasetId];
        if (!cfg) {
            jsonResponse(res, 404, { success: false, error: `Dataset not found: ${datasetId}` });
            return;
        }
        const variables = (cfg.columns || []).filter(c => c.type === 'variable');
        const csvDir = path.join(__dirname, 'csv_sources');

        // Check CSV availability
        const found = [];
        const missing = [];
        for (const v of variables) {
            if (!v.csvPattern || v.parser === 'external') continue;
            const files = fs.readdirSync(csvDir).filter(f => f.includes(v.csvPattern) && f.endsWith('.csv'));
            if (files.length > 0) {
                found.push({ variable: v.id, pattern: v.csvPattern, file: files[0] });
            } else {
                missing.push({ variable: v.id, pattern: v.csvPattern });
            }
        }

        jsonResponse(res, 200, {
            success: true,
            dataset: {
                id: datasetId,
                name: cfg.name || datasetId,
                folderPath: cfg.folderPath || '',
                fileName: cfg.fileName || datasetId,
                sheets: cfg.sheets || ['com', 'reg', 'dom', 'fh', 'fra'],
                variables: variables.map(c => c.id),
                csvAvailability: { available: missing.length === 0 && found.length > 0, found, missing }
            }
        });
        return;
    }

    // ========== AVAILABLE YEARS ==========
    if (urlPath === '/available-years' && req.method === 'GET') {
        const datasetId = url.searchParams.get('dataset');
        if (!datasetId) {
            jsonResponse(res, 400, { success: false, error: 'Missing dataset parameter' });
            return;
        }
        // Use Python to detect years (relies on CSV parsing)
        try {
            const result = await runPython(`
import sys, json
sys.path.insert(0, '${__dirname.replace(/\\/g, '/')}')
from prisme_engine import detect_available_years, reload_config
reload_config()
years = detect_available_years('${datasetId}')
print(json.dumps({"success": True, "years": years}))
`);
            const data = JSON.parse(result.stdout.trim().split('\n').pop());
            jsonResponse(res, 200, data);
        } catch (e) {
            jsonResponse(res, 500, { success: false, years: [], error: e.message });
        }
        return;
    }

    // ========== AVAILABLE YEARS OPEN DATA ==========
    if (urlPath === '/available-years-opendata' && req.method === 'GET') {
        const datasetId = url.searchParams.get('dataset');
        if (!datasetId) {
            jsonResponse(res, 400, { success: false, error: 'Missing dataset parameter' });
            return;
        }
        try {
            const result = await runPython(`
import sys, json
sys.path.insert(0, '${__dirname.replace(/\\/g, '/')}')
from generate_from_opendata import THEME_CONFIGS, INPUTS_DIR

dataset = '${datasetId}'
if dataset not in THEME_CONFIGS:
    print(json.dumps({"success": True, "years": []}))
else:
    src = THEME_CONFIGS[dataset]["source_type"]
    years = []
    if src == "educ":
        for p in sorted(INPUTS_DIR.glob("diplomes_formation_*.csv")):
            y = p.stem.split("_")[-1]
            if y.isdigit(): years.append(int(y))
    elif src == "couples":
        for p in sorted(INPUTS_DIR.glob("couples_familles_*.csv")):
            y = p.stem.split("_")[-1]
            if y.isdigit(): years.append(int(y))
    elif src == "caf":
        import pandas as pd
        caf = INPUTS_DIR / "caf_allocataires_2023.csv"
        if caf.exists():
            df = pd.read_csv(caf, sep=";", low_memory=False)
            if "Date référence" in df.columns:
                years = sorted(set(int(str(v)[:4]) for v in df["Date référence"].dropna()))
    elif src == "ircom":
        for p in INPUTS_DIR.rglob("ircom_communes_complet_revenus_*.xlsx"):
            y = p.stem.split("_")[-1]
            if y.isdigit(): years.append(int(y))
    elif src == "pop_legales":
        for p in sorted(INPUTS_DIR.glob("populations_*.csv")):
            y = p.stem.split("_")[-1]
            if y.isdigit(): years.append(int(y))
    elif src == "baac":
        baac_dir = INPUTS_DIR / "baac"
        if baac_dir.exists():
            for p in sorted(baac_dir.glob("caract_*.csv")):
                y = p.stem.split("_")[-1]
                if y.isdigit(): years.append(int(y))
    elif src == "cepidc":
        cepidc_dir = INPUTS_DIR / "cepidc"
        src_file = cepidc_dir / "taux_effectifs_regions_15_23.xlsx"
        if src_file.exists():
            years = list(range(2015, 2024))
    years = sorted(set(years))
    print(json.dumps({"success": True, "years": years}))
`);
            const data = JSON.parse(result.stdout.trim().split('\n').pop());
            jsonResponse(res, 200, data);
        } catch (e) {
            jsonResponse(res, 500, { success: false, years: [], error: e.message });
        }
        return;
    }

    // ========== CHECK CSV AVAILABILITY ==========
    if (urlPath === '/check-csv' && req.method === 'GET') {
        const datasetId = url.searchParams.get('dataset');
        const cfg = (themesConfig.datasets || {})[datasetId];
        if (!cfg) {
            jsonResponse(res, 404, { success: false, error: `Dataset not found: ${datasetId}` });
            return;
        }
        const variables = (cfg.columns || []).filter(c => c.type === 'variable');
        const csvDir = path.join(__dirname, 'csv_sources');
        const found = [];
        const missing = [];
        for (const v of variables) {
            if (!v.csvPattern || v.parser === 'external') continue;
            const files = fs.readdirSync(csvDir).filter(f => f.includes(v.csvPattern) && f.endsWith('.csv'));
            if (files.length > 0) {
                found.push({ variable: v.id, pattern: v.csvPattern, file: files[0] });
            } else {
                missing.push({ variable: v.id, pattern: v.csvPattern });
            }
        }
        jsonResponse(res, 200, {
            success: true,
            available: missing.length === 0 && found.length > 0,
            found,
            missing
        });
        return;
    }

    // ========== UPLOAD FILES (CSV + XLSX) ==========
    if (urlPath === '/upload-csv' && req.method === 'POST') {
        try {
            const files = await parseUploadedFiles(req);
            if (files.length === 0) {
                jsonResponse(res, 400, { success: false, error: 'Aucun fichier reçu.' });
                return;
            }

            // Ensure csv_sources directory exists
            if (!fs.existsSync(CSV_SOURCES_DIR)) {
                fs.mkdirSync(CSV_SOURCES_DIR, { recursive: true });
            }

            const saved = [];
            const converted = [];
            const skipped = [];
            const user = url.searchParams.get('user') || 'anonymous';

            for (const file of files) {
                const ext = path.extname(file.filename).toLowerCase();
                // Sanitize: keep accented chars and common CSV naming patterns
                const safeName = file.filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');

                if (ext === '.csv') {
                    const destPath = path.join(CSV_SOURCES_DIR, safeName);
                    fs.writeFileSync(destPath, file.data);
                    saved.push(safeName);
                    console.log(`   Uploaded CSV: ${safeName} (${file.data.length} bytes)`);
                } else if (ext === '.xlsx' || ext === '.xls') {
                    // Save temp XLSX then convert to CSV via Python
                    const tmpPath = path.join(CSV_SOURCES_DIR, `_tmp_${safeName}`);
                    fs.writeFileSync(tmpPath, file.data);
                    try {
                        const csvFiles = await convertXlsxToCsv(tmpPath, CSV_SOURCES_DIR);
                        converted.push(...csvFiles.map(f => ({ original: safeName, csv: f })));
                        saved.push(...csvFiles);
                        console.log(`   Converted XLSX: ${safeName} -> ${csvFiles.join(', ')}`);
                    } catch (convErr) {
                        console.error(`   XLSX conversion failed for ${safeName}:`, convErr.message);
                        skipped.push({ file: safeName, reason: `Conversion XLSX échouée: ${convErr.message}` });
                    } finally {
                        try { fs.unlinkSync(tmpPath); } catch (e) { }
                    }
                } else {
                    skipped.push({ file: safeName, reason: 'Format non supporté (CSV ou XLSX uniquement)' });
                }
            }

            // Record import history
            if (saved.length > 0) {
                recordImportHistory(saved, user, converted);
            }

            // Analyze geo levels for each saved CSV
            const geoAnalysis = saved.map(f => analyzeGeoLevels(f));
            const geoWarnings = [];
            for (const analysis of geoAnalysis) {
                if (analysis.found.length > 0 && analysis.missing.length > 0) {
                    const missingLabels = analysis.missing.map(m => m.label).join(', ');
                    geoWarnings.push(`${analysis.filename} : niveaux manquants: ${missingLabels}`);
                }
            }

            // Log activity
            logActivity('upload', {
                user,
                files: saved,
                converted: converted.map(c => c.csv),
                skipped: skipped.map(s => s.file),
                geoWarnings
            });

            if (saved.length === 0) {
                jsonResponse(res, 400, {
                    success: false,
                    error: 'Aucun fichier valide. Formats acceptés: .csv, .xlsx',
                    skipped
                });
                return;
            }

            jsonResponse(res, 200, {
                success: true,
                files: saved,
                converted,
                skipped,
                geoAnalysis,
                geoWarnings,
                message: `${saved.length} fichier(s) importé(s) avec succès.`
            });
        } catch (e) {
            console.error('Upload error:', e.message);
            jsonResponse(res, 500, { success: false, error: `Erreur d'import: ${e.message}` });
        }
        return;
    }

    // ========== VALIDATE UPLOADED CSV ==========
    if (urlPath === '/validate-csv' && req.method === 'GET') {
        const filename = url.searchParams.get('file');
        if (!filename || filename.includes('..')) {
            jsonResponse(res, 400, { success: false, error: 'Nom de fichier invalide' });
            return;
        }
        const filePath = path.join(CSV_SOURCES_DIR, filename);
        if (!fs.existsSync(filePath)) {
            jsonResponse(res, 404, { success: false, error: 'Fichier non trouvé' });
            return;
        }
        try {
            const result = await runPython(`
import sys, json, os
sys.path.insert(0, '${__dirname.replace(/\\/g, '/')}')
import pandas as pd

filepath = r'${filePath.replace(/\\/g, '/')}'
try:
    df = pd.read_csv(filepath, sep=';', low_memory=False, nrows=100)
    cols = list(df.columns)
    rows_total = len(pd.read_csv(filepath, sep=';', low_memory=False))
    sample = df.head(5).fillna('').to_dict(orient='records')
    # Check for typical MOCA-O structure
    has_geo = any('geo' in c.lower() or 'code' in c.lower() for c in cols)
    has_year = any('ann' in c.lower() or 'year' in c.lower() for c in cols)
    has_value = any('val' in c.lower() for c in cols)
    print(json.dumps({
        "success": True,
        "validation": {
            "columns": cols,
            "rowCount": rows_total,
            "sampleRows": sample,
            "hasGeoColumn": has_geo,
            "hasYearColumn": has_year,
            "hasValueColumn": has_value,
            "fileSize": os.path.getsize(filepath),
            "separator": ";"
        }
    }))
except Exception as e:
    # Try comma separator
    try:
        df = pd.read_csv(filepath, sep=',', low_memory=False, nrows=100)
        cols = list(df.columns)
        rows_total = len(pd.read_csv(filepath, sep=',', low_memory=False))
        sample = df.head(5).fillna('').to_dict(orient='records')
        has_geo = any('geo' in c.lower() or 'code' in c.lower() for c in cols)
        has_year = any('ann' in c.lower() or 'year' in c.lower() for c in cols)
        has_value = any('val' in c.lower() for c in cols)
        print(json.dumps({
            "success": True,
            "validation": {
                "columns": cols,
                "rowCount": rows_total,
                "sampleRows": sample,
                "hasGeoColumn": has_geo,
                "hasYearColumn": has_year,
                "hasValueColumn": has_value,
                "fileSize": os.path.getsize(filepath),
                "separator": ","
            }
        }))
    except Exception as e2:
        print(json.dumps({"success": False, "error": str(e2)}))
`);
            const data = JSON.parse(result.stdout.trim().split('\n').pop());
            jsonResponse(res, 200, data);
        } catch (e) {
            jsonResponse(res, 500, { success: false, error: e.message });
        }
        return;
    }

    // ========== IMPORT HISTORY ==========
    if (urlPath === '/import-history' && req.method === 'GET') {
        try {
            const history = loadImportHistory();
            jsonResponse(res, 200, { success: true, history });
        } catch (e) {
            jsonResponse(res, 200, { success: true, history: [] });
        }
        return;
    }

    // ========== LIST CSV SOURCE FILES ==========
    if (urlPath === '/csv-sources' && req.method === 'GET') {
        try {
            const files = fs.readdirSync(CSV_SOURCES_DIR)
                .filter(f => f.endsWith('.csv'))
                .map(f => {
                    const stat = fs.statSync(path.join(CSV_SOURCES_DIR, f));
                    return {
                        name: f,
                        size: stat.size,
                        modified: stat.mtime.toISOString()
                    };
                });
            jsonResponse(res, 200, { success: true, files });
        } catch (e) {
            jsonResponse(res, 200, { success: true, files: [] });
        }
        return;
    }

    // ========== DELETE CSV SOURCE FILE ==========
    if (urlPath === '/delete-csv' && req.method === 'POST') {
        const filename = url.searchParams.get('file');
        if (!filename || filename.includes('..') || !filename.endsWith('.csv')) {
            jsonResponse(res, 400, { success: false, error: 'Invalid filename' });
            return;
        }
        const filePath = path.join(CSV_SOURCES_DIR, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logActivity('delete', { filename });
            jsonResponse(res, 200, { success: true, message: `Deleted: ${filename}` });
        } else {
            jsonResponse(res, 404, { success: false, error: 'File not found' });
        }
        return;
    }

    // ========== RELOAD CONFIG ==========
    if (urlPath === '/reload-config' && req.method === 'POST') {
        themesConfig = loadConfig();
        jsonResponse(res, 200, { success: true, message: 'Config reloaded' });
        return;
    }

    // ========== GENERATE ENDPOINT ==========
    // POST /generate?theme=educ&year=2022
    if (urlPath === '/generate' && req.method === 'POST') {
        const theme = url.searchParams.get('theme') || 'educ';
        const year = url.searchParams.get('year') || '2022';

        console.log(`\nGeneration requested: ${theme}_${year}`);

        try {
            const result = await generateFile(theme, parseInt(year));

            if (result.success) {
                logActivity('generate', { source: 'moca', theme, year: parseInt(year), filename: result.filename, warnings: result.warnings || [] });
                const resp = {
                    success: true,
                    filename: result.filename,
                    message: `File generated: ${result.filename}`
                };
                if (result.warnings && result.warnings.length > 0) {
                    resp.warnings = result.warnings;
                }
                jsonResponse(res, 200, resp);
            } else {
                logActivity('error', { source: 'moca', theme, year: parseInt(year), error: result.error });
                jsonResponse(res, 500, { success: false, error: result.error });
            }
        } catch (err) {
            logActivity('error', { source: 'moca', theme, year: parseInt(year), error: err.message });
            jsonResponse(res, 500, { success: false, error: err.message });
        }
        return;
    }

    // ========== GENERATE OPEN DATA ENDPOINT ==========
    // POST /generate-opendata?theme=educ&year=2022
    if (urlPath === '/generate-opendata' && req.method === 'POST') {
        const theme = url.searchParams.get('theme') || 'educ';
        const year = url.searchParams.get('year') || '2022';

        console.log(`\nOpen Data generation requested: ${theme}_${year}`);

        // Themes supportés par generate_from_opendata.py
        const supportedThemes = [
            'educ', 'pers_sup65ans_seules', 'familles_mono', 'pop_inf3ans',
            'pers_menages', 'types_menages', 'alloc', 'revenu', 'densite',
            'route', 'mortalite_gen', 'mortalite_cardio', 'mortalite_tumeurs',
            'mortalite_respi', 'mortalite_neuro', 'mortalite_diabete', 'mortalite_covid'
        ];

        if (!supportedThemes.includes(theme)) {
            jsonResponse(res, 400, {
                success: false,
                error: `Theme non supporté pour Open Data. Themes disponibles: ${supportedThemes.join(', ')}`
            });
            return;
        }

        try {
            const result = await generateOpenDataFile(theme, parseInt(year));

            if (result.success) {
                logActivity('generate', { source: 'opendata', theme, year: parseInt(year), filename: result.filename });
                jsonResponse(res, 200, {
                    success: true,
                    filename: result.filename,
                    message: `Open Data file generated: ${result.filename}`
                });
            } else {
                logActivity('error', { source: 'opendata', theme, year: parseInt(year), error: result.error });
                jsonResponse(res, 500, { success: false, error: result.error });
            }
        } catch (err) {
            logActivity('error', { source: 'opendata', theme, year: parseInt(year), error: err.message });
            jsonResponse(res, 500, { success: false, error: err.message });
        }
        return;
    }

    // ========== DOWNLOAD ENDPOINT ==========
    if (urlPath.startsWith('/download/')) {
        const filename = decodeURIComponent(urlPath.replace('/download/', ''));

        if (filename.includes('..') || (!filename.endsWith('.xlsx') && !filename.endsWith('.zip'))) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid file request. Only .xlsx and .zip are allowed.');
            return;
        }

        const filePath = path.join(OUTPUT_DIR, filename);
        if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(`File not found: ${filename}`);
            return;
        }

        let contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        if (filename.endsWith('.zip')) {
            contentType = 'application/zip';
        }

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
        });
        fs.createReadStream(filePath).pipe(res);
        logActivity('download', { filename });
        console.log(`Download: ${filename}`);
        return;
    }

    // ========== LIST FILES ENDPOINT ==========
    // GET /api/files — Returns metadata array for all generated .zip files
    // Format: [{ filename, date, size, theme }]
    if (urlPath === '/files' && req.method === 'GET') {
        try {
            const zipFiles = fs.readdirSync(OUTPUT_DIR)
                .filter(f => f.endsWith('.zip') && !f.startsWith('~$'));

            const result = zipFiles.map(f => {
                const filePath = path.join(OUTPUT_DIR, f);
                const stat = fs.statSync(filePath);

                // Date: YYYY-MM-DD from mtime
                const mtime = stat.mtime;
                const date = `${mtime.getFullYear()}-${String(mtime.getMonth() + 1).padStart(2, '0')}-${String(mtime.getDate()).padStart(2, '0')}`;

                // Size: human-readable
                const bytes = stat.size;
                const size = bytes >= 1024 * 1024
                    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
                    : `${(bytes / 1024).toFixed(0)} KB`;

                // Source: detect from filename pattern
                const isOpenData = f.includes('_opendata_');
                const source = isOpenData ? 'Open Data' : 'MOCA-O';

                // Theme: extract prefix before first '_' or year pattern, lookup in config
                const baseName = f.replace(/\.zip$/, '');
                const themeId = baseName.replace(/_opendata_\d{4}.*$/, '').replace(/_\d{4}.*$/, '');
                const cfg = (themesConfig.datasets || {})[themeId];
                const theme = cfg ? cfg.name : themeId;

                return { filename: f, date, size, theme, source };
            });

            jsonResponse(res, 200, result);
        } catch (e) {
            console.error(`Error listing files: ${e.message}`);
            jsonResponse(res, 500, { error: `Erreur lecture des fichiers: ${e.message}` });
        }
        return;
    }

    // ========== ACTIVITY LOG ==========
    if (urlPath === '/activity-log' && req.method === 'GET') {
        try {
            let logs = [];
            if (fs.existsSync(ACTIVITY_LOG_FILE)) {
                logs = JSON.parse(fs.readFileSync(ACTIVITY_LOG_FILE, 'utf8'));
            }
            const limit = parseInt(url.searchParams.get('limit') || '50');
            const typeFilter = url.searchParams.get('type');
            let filtered = typeFilter ? logs.filter(l => l.type === typeFilter) : logs;
            jsonResponse(res, 200, { success: true, logs: filtered.slice(0, limit), total: logs.length });
        } catch (e) {
            jsonResponse(res, 200, { success: true, logs: [], total: 0 });
        }
        return;
    }

    // ========== AUTH: SEND OTP CODE ==========
    if (urlPath === '/auth/send-code' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const email = (body.email || '').trim().toLowerCase();
            if (!email) {
                jsonResponse(res, 400, { success: false, error: 'Email requis' });
                return;
            }

            const pb = await getPbAdmin();
            // Check user exists and is active
            let user;
            try {
                const records = await pb.collection('users').getFullList({ filter: `email="${email}"` });
                user = records[0];
            } catch (_e) { user = null; }

            if (!user) {
                jsonResponse(res, 404, { success: false, error: 'Aucun compte associe a cet email' });
                return;
            }
            if (user.status === 'inactive') {
                jsonResponse(res, 403, { success: false, error: 'Ce compte est desactive. Contactez un administrateur.' });
                return;
            }

            // Generate 6-digit code
            const code = String(crypto.randomInt(100000, 999999));
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

            // Store in login_codes collection
            try {
                await pb.collection('login_codes').create({
                    email: email,
                    code: code,
                    expires_at: expiresAt,
                    used: false,
                });
            } catch (e) {
                console.error('Failed to store login code:', e.message);
                jsonResponse(res, 500, { success: false, error: 'Erreur interne lors de la creation du code' });
                return;
            }

            // Send email
            try {
                await sendEmailCode(email, code);
            } catch (e) {
                console.error('Failed to send email:', e.message);
                // Code is still valid in DB, user can retry or we log it
            }

            jsonResponse(res, 200, { success: true, message: 'Code envoye' });
        } catch (e) {
            jsonResponse(res, 500, { success: false, error: e.message });
        }
        return;
    }

    // ========== AUTH: VERIFY OTP CODE ==========
    if (urlPath === '/auth/verify-code' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const email = (body.email || '').trim().toLowerCase();
            const code = (body.code || '').trim();

            if (!email || !code) {
                jsonResponse(res, 400, { success: false, error: 'Email et code requis' });
                return;
            }

            const pb = await getPbAdmin();

            // Find valid code
            const now = new Date().toISOString();
            let codeRecords;
            try {
                codeRecords = await pb.collection('login_codes').getFullList({
                    filter: `email="${email}" && code="${code}" && used=false && expires_at>"${now}"`,
                    sort: '-created',
                });
            } catch (_e) { codeRecords = []; }

            if (!codeRecords || codeRecords.length === 0) {
                jsonResponse(res, 401, { success: false, error: 'Code invalide ou expire' });
                return;
            }

            // Mark code as used
            try {
                await pb.collection('login_codes').update(codeRecords[0].id, { used: true });
            } catch (_e) { /* best effort */ }

            // Authenticate user — use authWithPassword with system password
            try {
                const userPb = new PocketBase(PB_URL);
                const authData = await userPb.collection('users').authWithPassword(email, PB_SYSTEM_PASSWORD);
                jsonResponse(res, 200, {
                    success: true,
                    token: authData.token,
                    record: authData.record,
                });
            } catch (e) {
                console.error('PB auth failed:', e.message);
                jsonResponse(res, 500, { success: false, error: 'Erreur d\'authentification. Contactez un administrateur.' });
            }
        } catch (e) {
            jsonResponse(res, 500, { success: false, error: e.message });
        }
        return;
    }

    // ========== AUTH: CREATE USER (admin only) ==========
    if (urlPath === '/auth/create-user' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const { name, email, role, department, organization } = body;

            if (!name || !email) {
                jsonResponse(res, 400, { success: false, error: 'Nom et email requis' });
                return;
            }

            const pb = await getPbAdmin();

            // Check if email already exists
            const existing = await pb.collection('users').getFullList({ filter: `email="${email.trim().toLowerCase()}"` });
            if (existing.length > 0) {
                jsonResponse(res, 409, { success: false, error: 'Un utilisateur avec cet email existe deja' });
                return;
            }

            const userData = {
                email: email.trim().toLowerCase(),
                name: name.trim(),
                password: PB_SYSTEM_PASSWORD,
                passwordConfirm: PB_SYSTEM_PASSWORD,
                role: role || 'utilisateur',
                status: 'active',
                department: department || '',
                organization: organization || '',
                emailVisibility: true,
            };

            const record = await pb.collection('users').create(userData);
            jsonResponse(res, 200, { success: true, user: record });
        } catch (e) {
            console.error('Create user error:', e.message);
            jsonResponse(res, 500, { success: false, error: e.message });
        }
        return;
    }

    // ========== STATIC FILE SERVING (Frontend dist/) ==========
    if (fs.existsSync(FRONTEND_DIST)) {
        const MIME_TYPES = {
            '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
            '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff',
            '.woff2': 'font/woff2', '.ttf': 'font/ttf'
        };

        // Try to serve a static file
        let filePath = path.join(FRONTEND_DIST, urlPath === '/' ? 'index.html' : urlPath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType, 'X-Robots-Tag': 'noindex, nofollow' });
            fs.createReadStream(filePath).pipe(res);
            return;
        }

        // SPA fallback: serve index.html for all non-API routes
        const indexPath = path.join(FRONTEND_DIST, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.writeHead(200, { 'Content-Type': 'text/html', 'X-Robots-Tag': 'noindex, nofollow' });
            fs.createReadStream(indexPath).pipe(res);
            return;
        }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
});

/**
 * Run a Python script and return stdout/stderr
 */
function runPython(script) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '_tmp_api.py');
        fs.writeFileSync(scriptPath, script, 'utf8');

        const child = spawn(PYTHON_EXE, [scriptPath], { cwd: __dirname });
        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => { stdout += data.toString(); });
        child.stderr.on('data', (data) => { stderr += data.toString(); });

        child.on('close', (code) => {
            try { fs.unlinkSync(scriptPath); } catch (e) { }
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(stderr || `Python exited with code ${code}`));
            }
        });

        child.on('error', (err) => {
            try { fs.unlinkSync(scriptPath); } catch (e) { }
            reject(err);
        });
    });
}

/**
 * Generate a file using the Python engine
 */
function generateFile(theme, year) {
    return new Promise((resolve) => {
        const scriptPath = path.join(__dirname, 'run_generation.py');

        const pythonScript = `
import sys
sys.path.insert(0, '${__dirname.replace(/\\/g, '/')}')
from prisme_engine import generate_prisme_excel, reload_config
reload_config()
result = generate_prisme_excel('${theme}', ${year})
if result:
    print(f"SUCCESS:{result.name}")
else:
    print("ERROR:Generation failed")
`;

        fs.writeFileSync(scriptPath, pythonScript, 'utf8');

        const child = spawn(PYTHON_EXE, [scriptPath], { cwd: __dirname });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            console.log(`   ${data.toString().trim()}`);
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            try { fs.unlinkSync(scriptPath); } catch (e) { }

            if (stdout.includes('SUCCESS:')) {
                const filename = stdout.split('SUCCESS:')[1].trim();
                console.log(`Generated: ${filename}`);
                // Extract warnings (year coverage + missing geo data)
                const warnings = [];
                const warnLines = stdout.split('\n').filter(l => l.includes('[WARN_YEAR]') || l.includes('[WARN_DATA]'));
                for (const wl of warnLines) {
                    const m = wl.match(/\[WARN_(?:YEAR|DATA)\]\s*(.+)/);
                    if (m) warnings.push(m[1].trim());
                }
                resolve({ success: true, filename, warnings });
            } else {
                console.log(`Generation failed (exit ${code})`);
                resolve({ success: false, error: stderr || stdout || 'Unknown error' });
            }
        });

        child.on('error', (err) => {
            resolve({ success: false, error: err.message });
        });
    });
}

/**
 * Generate a file using generate_from_opendata.py
 */
function generateOpenDataFile(theme, year) {
    return new Promise((resolve) => {
        const scriptPath = path.join(__dirname, 'generate_from_opendata.py');

        if (!fs.existsSync(scriptPath)) {
            resolve({ success: false, error: 'generate_from_opendata.py not found' });
            return;
        }

        // Call generate_from_opendata.py --theme <theme> --year <year>
        const child = spawn(PYTHON_EXE, [scriptPath, '--theme', theme, '--year', year.toString()], { 
            cwd: __dirname 
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            console.log(`   ${data.toString().trim()}`);
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
            console.error(`   ERROR: ${data.toString().trim()}`);
        });

        child.on('close', (code) => {
            if (code === 0 && stdout.includes('[OK]')) {
                // Extract filename from output: "[OK] educ 2022: .../output/educ_opendata_2022.zip"
                const match = stdout.match(/([a-z0-9_]+_opendata_\d{4}\.zip)/);
                if (match) {
                    const filename = match[1];
                    console.log(`Generated Open Data: ${filename}`);
                    resolve({ success: true, filename });
                } else {
                    console.log('Generation succeeded but filename not found in output');
                    resolve({ success: true, filename: `${theme}_opendata_${year}.zip` });
                }
            } else {
                console.log(`Open Data generation failed (exit ${code})`);
                resolve({ success: false, error: stderr || stdout || 'Unknown error' });
            }
        });

        child.on('error', (err) => {
            resolve({ success: false, error: err.message });
        });
    });
}

/**
 * Parse uploaded files using busboy (robust multipart parser)
 * Accepts CSV and XLSX files, up to 50MB total
 */
function parseUploadedFiles(req) {
    return new Promise((resolve, reject) => {
        const files = [];
        const busboy = Busboy({
            headers: req.headers,
            limits: { fileSize: 50 * 1024 * 1024, files: 20 }
        });

        busboy.on('file', (fieldname, stream, info) => {
            const { filename, encoding, mimeType } = info;
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => {
                if (filename) {
                    files.push({ filename, data: Buffer.concat(chunks) });
                }
            });
        });

        busboy.on('finish', () => resolve(files));
        busboy.on('error', (err) => reject(err));
        req.pipe(busboy);
    });
}

/**
 * Convert an XLSX file to one or more CSVs using Python pandas
 * Returns array of generated CSV filenames
 */
function convertXlsxToCsv(xlsxPath, outputDir) {
    return new Promise((resolve, reject) => {
        const script = `
import sys, json, pandas as pd, os

xlsx_path = r'${xlsxPath.replace(/\\/g, '/')}'
output_dir = r'${outputDir.replace(/\\/g, '/')}'
base = os.path.splitext(os.path.basename(xlsx_path))[0]
# Remove _tmp_ prefix if present
if base.startswith('_tmp_'):
    base = base[5:]

xls = pd.ExcelFile(xlsx_path)
sheet_names = xls.sheet_names
csv_files = []

if len(sheet_names) == 1:
    df = pd.read_excel(xlsx_path, sheet_name=0)
    csv_name = base.rsplit('.', 1)[0] + '.csv' if '.' in base else base + '.csv'
    csv_path = os.path.join(output_dir, csv_name)
    df.to_csv(csv_path, sep=';', index=False, encoding='utf-8-sig')
    csv_files.append(csv_name)
else:
    for sheet in sheet_names:
        df = pd.read_excel(xlsx_path, sheet_name=sheet)
        safe_sheet = sheet.replace(' ', '_').replace('/', '_')
        csv_name = f"{base}_{safe_sheet}.csv"
        csv_path = os.path.join(output_dir, csv_name)
        df.to_csv(csv_path, sep=';', index=False, encoding='utf-8-sig')
        csv_files.append(csv_name)

print(json.dumps({"success": True, "files": csv_files}))
`;
        const scriptPath = path.join(__dirname, '_tmp_convert.py');
        fs.writeFileSync(scriptPath, script, 'utf8');

        const child = spawn(PYTHON_EXE, [scriptPath], { cwd: __dirname });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (d) => { stdout += d.toString(); });
        child.stderr.on('data', (d) => { stderr += d.toString(); });
        child.on('close', (code) => {
            try { fs.unlinkSync(scriptPath); } catch (e) { }
            if (code === 0) {
                try {
                    const data = JSON.parse(stdout.trim().split('\n').pop());
                    resolve(data.files || []);
                } catch (e) {
                    reject(new Error('Failed to parse XLSX conversion output'));
                }
            } else {
                reject(new Error(stderr || `XLSX conversion failed (code ${code})`));
            }
        });
        child.on('error', (err) => {
            try { fs.unlinkSync(scriptPath); } catch (e) { }
            reject(err);
        });
    });
}

/**
 * Import history management
 */
function loadImportHistory() {
    try {
        if (fs.existsSync(IMPORT_HISTORY_FILE)) {
            return JSON.parse(fs.readFileSync(IMPORT_HISTORY_FILE, 'utf8'));
        }
    } catch (e) { }
    return [];
}

function recordImportHistory(files, user, converted) {
    const history = loadImportHistory();
    history.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        timestamp: new Date().toISOString(),
        user: user,
        files: files,
        converted: converted || [],
        count: files.length
    });
    // Keep last 200 entries
    if (history.length > 200) history.length = 200;
    try {
        fs.writeFileSync(IMPORT_HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to save import history:', e.message);
    }
}

/**
 * Activity logging system - persistent JSON log for all operations
 */
function logActivity(type, details) {
    try {
        let logs = [];
        if (fs.existsSync(ACTIVITY_LOG_FILE)) {
            logs = JSON.parse(fs.readFileSync(ACTIVITY_LOG_FILE, 'utf8'));
        }
        logs.unshift({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            timestamp: new Date().toISOString(),
            type,      // 'upload', 'generate', 'download', 'delete', 'error', 'config'
            ...details
        });
        // Keep last 500 entries
        if (logs.length > 500) logs.length = 500;
        fs.writeFileSync(ACTIVITY_LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to write activity log:', e.message);
    }
}

/**
 * Analyze CSV filename for geographic level indicators
 * MOCA naming: Name_GF_REG_DOM_Fh_Fe_years.csv
 * Returns { levels: string[], missing: string[], filename: string }
 */
function analyzeGeoLevels(filename) {
    const upperName = filename.toUpperCase();
    const allLevels = [
        { code: 'GF', label: 'Communes Guyane' },
        { code: 'REG', label: 'Régions' },
        { code: 'DOM', label: 'DOM' },
        { code: 'FH', label: 'France Hexagonale' },
        { code: 'FE', label: 'France Entière' }
    ];

    const found = [];
    const missing = [];
    // Check for geo level codes in filename (surrounded by _ or at start/end)
    for (const level of allLevels) {
        const pattern = new RegExp(`(^|_)${level.code}(_|\\.|$)`, 'i');
        if (pattern.test(filename)) {
            found.push(level);
        } else {
            missing.push(level);
        }
    }

    return { found, missing, filename };
}

server.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`PRISME File Server v4.0`);
    console.log(`${'='.repeat(50)}`);
    console.log(`   Port: http://localhost:${PORT}`);
    console.log(`   Output: ${OUTPUT_DIR}`);
    console.log(`   Config: ${CONFIG_FILE}`);
    console.log(`\n   API Endpoints:`);
    console.log(`   - GET  /health`);
    console.log(`   - GET  /themes`);
    console.log(`   - GET  /datasets`);
    console.log(`   - GET  /dataset-info?id=educ`);
    console.log(`   - GET  /available-years?dataset=educ`);
    console.log(`   - GET  /check-csv?dataset=educ`);
    console.log(`   - POST /reload-config`);
    console.log(`   - POST /generate?theme=educ&year=2022`);
    console.log(`   - POST /generate-opendata?theme=educ&year=2022`);
    console.log(`   - GET  /download/educ_2022.zip`);
    console.log(`   - POST /upload-csv          (import CSV/XLSX files)`);
    console.log(`   - GET  /validate-csv?file=X (validate a CSV file)`);
    console.log(`   - GET  /import-history      (import audit trail)`);
    console.log(`   - GET  /csv-sources         (list uploaded CSVs)`);
    console.log(`   - POST /delete-csv?file=X   (delete a CSV)`);
    console.log(`   - GET  /files               (metadata: filename, date, size, theme)`);
    console.log(`   - GET  /activity-log        (persistent activity logs)`);
    console.log(`   - POST /auth/send-code      (OTP: send code by email)`);
    console.log(`   - POST /auth/verify-code    (OTP: verify code & get token)`);
    console.log(`   - POST /auth/create-user    (create new user)`);
    console.log(`   PocketBase: ${PB_URL}`);
    console.log(`   SMTP: ${SMTP_HOST ? SMTP_HOST + ':' + SMTP_PORT : '(not configured — codes in console)'}`);
    console.log(`${'='.repeat(50)}\n`);
    // Initialize PocketBase admin connection
    getPbAdmin().catch(e => console.warn('PB admin init deferred:', e.message));
});
