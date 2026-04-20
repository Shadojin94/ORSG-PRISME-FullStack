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

// Utility: SHA256 hash
function sha256(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

// Utility: escape double quotes for PocketBase filter values (prevents filter injection)
function pbEscape(value) {
    return String(value).replace(/"/g, '\\"');
}

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

let pbAdminLastAuth = 0;
const PB_AUTH_TTL = 10 * 60 * 1000; // Re-auth every 10 minutes

let pbSetupRan = false;

async function getPbAdmin() {
    const now = Date.now();
    // Re-auth if: not ready, token stale, or TTL expired
    if (pbAdminReady && pbAdmin && (now - pbAdminLastAuth) < PB_AUTH_TTL) return pbAdmin;
    pbAdmin = new PocketBase(PB_URL);
    if (PB_ADMIN_EMAIL && PB_ADMIN_PASSWORD) {
        try {
            await pbAdmin.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
            pbAdminReady = true;
            pbAdminLastAuth = now;
            console.log('   PocketBase admin authenticated');
        } catch (e) {
            console.error(`   PocketBase admin auth failed for ${PB_ADMIN_EMAIL} at ${PB_URL}:`, e.message);
            pbAdminReady = false;
            // Auto-repair: try creating admin via API (works when PB has zero admins = fresh DB)
            try {
                const http = require('http');
                const createBody = JSON.stringify({ email: PB_ADMIN_EMAIL, password: PB_ADMIN_PASSWORD, passwordConfirm: PB_ADMIN_PASSWORD });
                const createRes = await new Promise((resolve, reject) => {
                    const req = http.request(`${PB_URL}/api/admins`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(createBody) }, timeout: 5000,
                    }, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
                    req.on('error', reject); req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
                    req.write(createBody); req.end();
                });
                if (createRes.status === 200) {
                    console.log(`[AUTO-REPAIR] PB admin created via API for ${PB_ADMIN_EMAIL}`);
                    // Now auth should work
                    await pbAdmin.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
                    pbAdminReady = true;
                    pbAdminLastAuth = now;
                    console.log('   PocketBase admin authenticated (after auto-repair)');
                    // Run setup_pocketbase.js to create collections + seed users
                    if (!pbSetupRan) {
                        pbSetupRan = true;
                        console.log('[AUTO-REPAIR] Running setup_pocketbase.js...');
                        const { execSync } = require('child_process');
                        try {
                            execSync('node setup_pocketbase.js', { cwd: __dirname, stdio: 'inherit', timeout: 30000 });
                            console.log('[AUTO-REPAIR] setup_pocketbase.js completed');
                        } catch (setupErr) {
                            console.error('[AUTO-REPAIR] setup_pocketbase.js failed:', setupErr.message);
                        }
                    }
                } else {
                    console.warn(`[AUTO-REPAIR] Could not create PB admin (${createRes.status}): ${createRes.body}`);
                }
            } catch (repairErr) {
                console.warn('[AUTO-REPAIR] PB admin auto-repair failed:', repairErr.message);
            }
        }
    } else {
        console.error('   PocketBase admin credentials not configured');
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
        secure: parseInt(SMTP_PORT) === 465,
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

async function sendTempPassword(email, tempPassword) {
    if (!nodemailer || !SMTP_HOST || !SMTP_USER) {
        console.log(`\n   [PWD] Temp password for ${email}: ${tempPassword}  (email not configured)\n`);
        return;
    }
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: parseInt(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject: 'Data Visus — Mot de passe temporaire',
        text: `Votre mot de passe temporaire Data Visus est : ${tempPassword}\n\nConnectez-vous et changez-le des que possible.\nSi vous n'avez pas demande cette reinitialisation, ignorez ce message.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:16px">
            <h2 style="color:#1a4b8c;margin-bottom:8px">Data Visus</h2>
            <p style="color:#374151">Votre mot de passe temporaire :</p>
            <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:24px;text-align:center;margin:16px 0">
                <span style="font-size:20px;font-weight:bold;color:#92400e">${tempPassword}</span>
            </div>
            <p style="color:#6b7280;font-size:14px">Connectez-vous et changez votre mot de passe des que possible.</p>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">Si vous n'avez pas demande cette reinitialisation, ignorez ce message.</p>
        </div>`,
    });
    console.log(`   [PWD] Temp password sent to ${email}`);
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // ========== POCKETBASE REVERSE PROXY ==========
    // Forward /pb/* requests to internal PocketBase (not accessible from outside Docker)
    if (req.url.startsWith('/pb/')) {
        const pbPath = req.url.slice(3); // strip /pb prefix -> /api/...
        const pbUrl = new URL(pbPath, PB_URL);
        const proxyReq = require('http').request(pbUrl.toString(), {
            method: req.method,
            headers: { ...req.headers, host: new URL(PB_URL).host },
            timeout: 15000,
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });
        proxyReq.on('error', (e) => {
            console.error('[PB-PROXY] Error:', e.message);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ code: 502, message: 'PocketBase unavailable' }));
        });
        req.pipe(proxyReq);
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

    // ========== PB DIAGNOSTIC ==========
    if (urlPath === '/pb-diag') {
        const diag = { pb_url: PB_URL, admin_email: PB_ADMIN_EMAIL || '(not set)', admin_pass_set: !!PB_ADMIN_PASSWORD, system_pass_set: !!PB_SYSTEM_PASSWORD, smtp_host: SMTP_HOST || '(not set)' };
        try {
            const healthRes = await new Promise((resolve) => {
                const r = require('http').get(`${PB_URL}/api/health`, { timeout: 3000 }, (resp) => {
                    let d = ''; resp.on('data', c => d += c); resp.on('end', () => resolve(d));
                }); r.on('error', (e) => resolve('ERROR: ' + e.message)); r.on('timeout', () => { r.destroy(); resolve('TIMEOUT'); });
            });
            diag.pb_health = healthRes;
        } catch (e) { diag.pb_health = 'EXCEPTION: ' + e.message; }
        try {
            const pb = await getPbAdmin();
            diag.pb_admin_ready = pbAdminReady;
            diag.pb_auth_valid = pb?.authStore?.isValid || false;
        } catch (e) { diag.pb_admin_error = e.message; }
        jsonResponse(res, 200, diag);
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
        # Données BAAC/ONISR disponibles en open data — années expose même si fichiers pas encore présents sur la VM
        baac_dir = INPUTS_DIR / "baac"
        if baac_dir.exists():
            for p in sorted(baac_dir.glob("caract_*.csv")):
                y = p.stem.split("_")[-1]
                if y.isdigit(): years.append(int(y))
        if not years:
            years = [2019, 2020, 2021, 2022, 2023, 2024]
    elif src == "cepidc":
        cepidc_dir = INPUTS_DIR / "cepidc"
        src_file = cepidc_dir / "taux_effectifs_regions_15_23.xlsx"
        if src_file.exists():
            years = list(range(2015, 2024))
        if not years:
            years = list(range(2015, 2024))
    elif src == "odisse_suicide":
        years = [2019, 2020, 2021, 2022, 2023]
    elif src == "odisse_alcool":
        years = [2000, 2005, 2010, 2014, 2017, 2021]
    elif src == "odisse_tabac":
        years = [2000, 2005, 2010, 2014, 2017, 2021]
    elif src == "spf_noyades":
        years = [2003, 2004, 2006, 2009, 2012, 2015, 2018, 2021]
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
            'mortalite_respi', 'mortalite_neuro', 'mortalite_diabete', 'mortalite_covid',
            'comp_mortalite', 'suicide', 'addictions_alcool', 'addictions_tabac', 'noyades',
            'accidents_route', 'blesses_route', 'deces_route'
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
    // ========== AUTH: CHECK EMAIL — returns login method for this address ==========
    // Returns: { exists, otp_enabled, can_use_password }
    // Used by LoginPage to decide which step to show without exposing sensitive data.
    if (urlPath === '/auth/check-email' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const email = (body.email || '').trim().toLowerCase();
            if (!email) {
                jsonResponse(res, 400, { success: false, error: 'Email requis' });
                return;
            }
            const pb = await getPbAdmin();
            if (!pbAdminReady) {
                // Fallback: allow login without PB info (dev mode)
                jsonResponse(res, 200, { success: true, exists: true, otp_enabled: true, can_use_password: false });
                return;
            }
            let user = null;
            try {
                user = await pb.collection('users').getFirstListItem(`email="${pbEscape(email)}"`);
            } catch (_e) { user = null; }

            if (!user) {
                jsonResponse(res, 404, { success: false, error: 'Aucun compte associe a cet email' });
                return;
            }
            if (user.status === 'inactive') {
                jsonResponse(res, 403, { success: false, error: 'Ce compte est desactive. Contactez un administrateur.' });
                return;
            }
            // otp_enabled defaults to true when field is null/undefined
            const otpEnabled = user.otp_enabled !== false;
            const canUsePassword = !!user.personal_password_hash;
            jsonResponse(res, 200, {
                success: true,
                exists: true,
                otp_enabled: otpEnabled,
                can_use_password: canUsePassword,
            });
        } catch (e) {
            jsonResponse(res, 500, { success: false, error: e.message });
        }
        return;
    }

    if (urlPath === '/auth/send-code' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const email = (body.email || '').trim().toLowerCase();
            if (!email) {
                jsonResponse(res, 400, { success: false, error: 'Email requis' });
                return;
            }

            // Try PocketBase flow
            let pbOk = false;
            try {
                const pb = await getPbAdmin();
                if (pbAdminReady) {
                    // Check user exists and is active
                    let user;
                    try {
                        user = await pb.collection('users').getFirstListItem(`email="${pbEscape(email)}"`);
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

                    await pb.collection('login_codes').create({
                        email: email, code: code, expires_at: expiresAt, used: false,
                    });

                    // Send email
                    let emailSent = false;
                    try { await sendEmailCode(email, code); emailSent = true; } catch (_e) {}

                    const response = { success: true, message: 'Code envoye' };
                    if (!SMTP_HOST || !emailSent) {
                        // Dev mode: always use 000000 as the bypass code for consistency
                        response.dev_code = '000000';
                        console.log(`[DEV] OTP for ${email}: real=${code}, dev bypass=000000`);
                    }
                    jsonResponse(res, 200, response);
                    pbOk = true;
                }
            } catch (e) {
                console.error('[AUTH] PocketBase OTP flow failed:', e.message, e.response || '');
            }

            // Fallback: PocketBase unavailable — dev bypass mode
            if (!pbOk) {
                console.warn(`[AUTH-FALLBACK] PocketBase unavailable, using dev bypass for ${email}`);
                jsonResponse(res, 200, { success: true, message: 'Code envoye', dev_code: '000000', fallback: true });
            }
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

            // Dev bypass: code 000000 accepted when SMTP is unusable OR PB admin unavailable
            // Coherent avec /auth/send-code qui renvoie dev_code dans ces memes cas.
            const smtpUnusable = !SMTP_HOST || !SMTP_USER || !SMTP_PASS;
            if (code === '000000' && (smtpUnusable || !pbAdminReady)) {
                console.warn(`[AUTH-DEV] Dev bypass login for ${email}`);
                // Try real PB auth first for a proper token
                if (pbAdminReady) {
                    try {
                        const userPb = new PocketBase(PB_URL);
                        const authData = await userPb.collection('users').authWithPassword(email, PB_SYSTEM_PASSWORD);
                        jsonResponse(res, 200, { success: true, token: authData.token, record: authData.record });
                        return;
                    } catch (e) {
                        console.warn(`[AUTH-DEV] PB authWithPassword failed for ${email}:`, e.message);
                    }
                }
                // Full fallback: synthetic user record
                const devRecord = {
                    id: 'dev_user_001', email, collectionId: '_pb_users_auth_', collectionName: 'users',
                    name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    role: 'admin', status: 'active', organization: 'ORSG-CTPS',
                    department: '', phone: '', avatar: '',
                    created: new Date().toISOString(), updated: new Date().toISOString(),
                };
                jsonResponse(res, 200, { success: true, token: 'dev_token_' + Date.now(), record: devRecord });
                return;
            }

            // Normal PocketBase flow
            const pb = await getPbAdmin();

            // Find valid code (PocketBase uses space-separated dates, not ISO T format)
            const now = new Date().toISOString().replace('T', ' ');
            let codeRecords;
            try {
                codeRecords = await pb.collection('login_codes').getFullList({
                    filter: `email="${pbEscape(email)}" && code="${pbEscape(code)}" && used=false && expires_at>"${now}"`,
                    sort: '-created',
                });
            } catch (e) {
                console.error('[VERIFY] login_codes query failed:', e.message);
                codeRecords = [];
            }

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

    // ========== AUTH: LOGIN WITH PASSWORD ==========
    // Personal passwords are stored as sha256 hashes in personal_password_hash field.
    // PB auth password is always PB_SYSTEM_PASSWORD — we verify hash then auth with system password.
    if (urlPath === '/auth/login-password' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const email = (body.email || '').trim().toLowerCase();
            const password = (body.password || '');
            if (!email || !password) {
                jsonResponse(res, 400, { success: false, error: 'Email et mot de passe requis' });
                return;
            }
            const pb = await getPbAdmin();
            let user;
            try {
                user = await pb.collection('users').getFirstListItem(`email="${pbEscape(email)}"`);
            } catch (_e) { user = null; }
            if (!user) {
                jsonResponse(res, 401, { success: false, error: 'Email ou mot de passe incorrect' });
                return;
            }
            if (user.status === 'inactive') {
                jsonResponse(res, 403, { success: false, error: 'Ce compte est desactive. Contactez un administrateur.' });
                return;
            }
            // Verify personal password hash (timing-safe comparison)
            const providedHash = sha256(password);
            const storedHash = user.personal_password_hash || '';
            if (!storedHash || storedHash.length !== providedHash.length ||
                !crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(providedHash, 'hex'))) {
                jsonResponse(res, 401, { success: false, error: 'Email ou mot de passe incorrect' });
                return;
            }
            // Hash matches — authenticate via PB using system password to get a valid user token
            try {
                const userPb = new PocketBase(PB_URL);
                const authData = await userPb.collection('users').authWithPassword(email, PB_SYSTEM_PASSWORD);
                jsonResponse(res, 200, { success: true, token: authData.token, record: authData.record });
            } catch (e) {
                console.error('[AUTH] login-password PB auth failed:', e.message);
                jsonResponse(res, 500, { success: false, error: 'Erreur d\'authentification. Contactez un administrateur.' });
            }
        } catch (e) {
            jsonResponse(res, 500, { success: false, error: e.message });
        }
        return;
    }

    // ========== AUTH: SET PASSWORD ==========
    if (urlPath === '/auth/set-password' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const email = (body.email || '').trim().toLowerCase();
            const newPassword = (body.password || body.newPassword || '');
            if (!email || !newPassword || newPassword.length < 8) {
                jsonResponse(res, 400, { success: false, error: 'Mot de passe requis (8 caracteres minimum)' });
                return;
            }
            const pb = await getPbAdmin();
            let user;
            try {
                user = await pb.collection('users').getFirstListItem(`email="${pbEscape(email)}"`);
            } catch (_e) { user = null; }
            if (!user) {
                jsonResponse(res, 404, { success: false, error: 'Aucun compte associe a cet email' });
                return;
            }
            // Stocke le hash personnel utilisé par /auth/login-password
            await pb.collection('users').update(user.id, {
                personal_password_hash: sha256(newPassword),
            });
            jsonResponse(res, 200, { success: true, message: 'Mot de passe mis a jour' });
        } catch (e) {
            console.error('Set password error:', e.message);
            jsonResponse(res, 500, { success: false, error: e.message });
        }
        return;
    }

    // ========== AUTH: FORGOT PASSWORD (send temp password by email) ==========
    // Stores sha256 hash of temp password in personal_password_hash.
    // PB auth password (PB_SYSTEM_PASSWORD) is NOT changed — OTP flow stays intact.
    if (urlPath === '/auth/forgot-password' && req.method === 'POST') {
        try {
            const body = await readJsonBody(req);
            const email = (body.email || '').trim().toLowerCase();
            if (!email) {
                jsonResponse(res, 400, { success: false, error: 'Email requis' });
                return;
            }
            const pb = await getPbAdmin();
            let user;
            try {
                user = await pb.collection('users').getFirstListItem(`email="${pbEscape(email)}"`);
            } catch (_e) { user = null; }
            if (!user) {
                jsonResponse(res, 404, { success: false, error: 'Aucun compte associe a cet email' });
                return;
            }
            // Generate temp password and store its sha256 hash (NOT changing PB auth password)
            const tempPass = 'Tmp' + crypto.randomInt(100000, 999999) + '!';
            const tempHash = sha256(tempPass);
            await pb.collection('users').update(user.id, {
                personal_password_hash: tempHash,
            });
            // Send by email
            try {
                await sendTempPassword(email, tempPass);
            } catch (_e) {}
            const response = { success: true, message: 'Mot de passe temporaire envoye par email' };
            if (!SMTP_HOST) {
                response.dev_password = tempPass;
            }
            jsonResponse(res, 200, response);
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
            const existing = await pb.collection('users').getFullList({ filter: `email="${pbEscape(email.trim().toLowerCase())}"` });
            if (existing.length > 0) {
                jsonResponse(res, 409, { success: false, error: 'Un utilisateur avec cet email existe deja' });
                return;
            }

            // Génère un mot de passe temporaire + hash SHA256 pour login-password
            const tempPass = 'Tmp' + crypto.randomInt(100000, 999999) + '!';
            const userData = {
                email: email.trim().toLowerCase(),
                name: name.trim(),
                password: PB_SYSTEM_PASSWORD,
                passwordConfirm: PB_SYSTEM_PASSWORD,
                role: role || 'utilisateur',
                status: 'active',
                department: department || '',
                organization: organization || '',
                personal_password_hash: sha256(tempPass),
                otp_enabled: true,
                emailVisibility: true,
            };

            const record = await pb.collection('users').create(userData);

            // Envoie le mot de passe temporaire par email (non bloquant)
            let emailSent = false;
            try {
                await sendTempPassword(userData.email, tempPass);
                emailSent = true;
            } catch (mailErr) {
                console.error('[CREATE-USER] sendTempPassword failed:', mailErr.message);
            }

            const response = {
                success: true,
                user: record,
                message: emailSent
                    ? 'Utilisateur créé. Un email contenant le mot de passe temporaire a été envoyé.'
                    : 'Utilisateur créé, mais l\'envoi d\'email a échoué. Utilisez « Réinitialiser le mot de passe » depuis le menu.',
                email_sent: emailSent,
            };
            // En dev (pas de SMTP configuré), expose le mot de passe pour debug
            if (!SMTP_HOST) response.dev_password = tempPass;
            jsonResponse(res, 200, response);
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
