/**
 * PRISME File Server with On-Demand Generation + Metadata API
 * Handles file generation (via Python), file serving, and config metadata
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3001;
const OUTPUT_DIR = path.join(__dirname, 'output');
const CONFIG_FILE = path.join(__dirname, 'themes_config.json');
const FRONTEND_DIST = path.join(__dirname, '..', 'Frontend', 'dist');
const PYTHON_EXE = 'py';

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

function jsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
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
                jsonResponse(res, 200, {
                    success: true,
                    filename: result.filename,
                    message: `File generated: ${result.filename}`
                });
            } else {
                jsonResponse(res, 500, { success: false, error: result.error });
            }
        } catch (err) {
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
        console.log(`Download: ${filename}`);
        return;
    }

    // ========== LIST FILES ENDPOINT ==========
    if (urlPath === '/files') {
        try {
            const files = fs.readdirSync(OUTPUT_DIR)
                .filter(f => (f.endsWith('.xlsx') || f.endsWith('.zip')) && !f.startsWith('~$'));
            jsonResponse(res, 200, { files });
        } catch {
            jsonResponse(res, 500, { success: false, error: 'Error reading output directory' });
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
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
            return;
        }

        // SPA fallback: serve index.html for all non-API routes
        const indexPath = path.join(FRONTEND_DIST, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
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
                resolve({ success: true, filename });
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
    console.log(`   - GET  /download/educ_2022.zip`);
    console.log(`   - GET  /files`);
    console.log(`${'='.repeat(50)}\n`);
});
