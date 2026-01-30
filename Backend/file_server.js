/**
 * PRISME File Server with On-Demand Generation
 * Handles both file generation (via Python) and file serving
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3001;
const OUTPUT_DIR = path.join(__dirname, 'output');
// Use Windows Python launcher 'py' which is more reliable
const PYTHON_EXE = 'py';
const GENERATOR_SCRIPT = path.join(__dirname, 'generate_reports.py');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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

    const urlPath = req.url;

    // ========== GENERATE ENDPOINT ==========
    // POST /generate?theme=educ&year=2022
    if (urlPath.startsWith('/generate') && req.method === 'POST') {
        const urlParams = new URL(req.url, `http://localhost:${PORT}`);
        const theme = urlParams.searchParams.get('theme') || 'educ';
        const year = urlParams.searchParams.get('year') || '2022';

        console.log(`\n🚀 Generation requested: ${theme}_${year}`);

        try {
            // Call Python to generate the file
            const result = await generateFile(theme, parseInt(year));

            if (result.success) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    filename: result.filename,
                    message: `File generated: ${result.filename}`
                }));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: result.error
                }));
            }
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // ========== DOWNLOAD ENDPOINT ==========
    if (urlPath.startsWith('/download/')) {
        const filename = urlPath.replace('/download/', '');
        const filePath = path.join(OUTPUT_DIR, filename);

        // Allow xlsx and zip
        if (filename.includes('..') || (!filename.endsWith('.xlsx') && !filename.endsWith('.zip'))) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid file request. Only .xlsx and .zip are allowed.');
            return;
        }

        if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(`File not found: ${filename}`);
            return;
        }

        const fileStream = fs.createReadStream(filePath);

        // Determine Content-Type
        let contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        if (filename.endsWith('.zip')) {
            contentType = 'application/zip';
        }

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
        });
        fileStream.pipe(res);
        console.log(`📥 Serving: ${filename}`);
        return;
    }

    // ========== LIST FILES ENDPOINT ==========
    if (urlPath === '/' || urlPath === '/files') {
        try {
            const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ files }));
        } catch {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading output directory');
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
});

/**
 * Generate a file using the Python engine
 */
function generateFile(theme, year) {
    return new Promise((resolve) => {
        console.log(`   Using Python: ${PYTHON_EXE}`);
        console.log(`   Working dir: ${__dirname}`);

        // Use a separate Python script file instead of inline code for Windows compatibility
        const scriptPath = path.join(__dirname, 'run_generation.py');

        // Create a temporary Python script
        const pythonScript = `
import sys
sys.path.insert(0, '${__dirname.replace(/\\/g, '/')}')
from generate_reports import generate_prisme_excel, CSV_SOURCES_DIR
result = generate_prisme_excel('${theme}', ${year}, CSV_SOURCES_DIR)
if result:
    print(f"SUCCESS:{result.name}")
else:
    print("ERROR:Generation failed")
`;

        // Write the script to a file
        fs.writeFileSync(scriptPath, pythonScript, 'utf8');

        const child = spawn(PYTHON_EXE, [scriptPath], {
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
            console.error(`   ⚠ ${data.toString().trim()}`);
        });

        child.on('close', (code) => {
            console.log(`   Python exit code: ${code}`);
            // Clean up the temp script
            try { fs.unlinkSync(scriptPath); } catch (e) { }

            if (stdout.includes('SUCCESS:')) {
                const filename = stdout.split('SUCCESS:')[1].trim();
                console.log(`✅ Generated: ${filename}`);
                resolve({ success: true, filename });
            } else {
                console.log(`❌ Generation failed`);
                console.log(`   stdout: ${stdout}`);
                console.log(`   stderr: ${stderr}`);
                resolve({ success: false, error: stderr || stdout || 'Unknown error' });
            }
        });

        child.on('error', (err) => {
            console.error(`   ❌ Spawn error: ${err.message}`);
            resolve({ success: false, error: err.message });
        });
    });
}

server.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📂 PRISME File Server (On-Demand Generation)`);
    console.log(`${'='.repeat(50)}`);
    console.log(`   Port: http://localhost:${PORT}`);
    console.log(`   Output: ${OUTPUT_DIR}`);
    console.log(`\n   Endpoints:`);
    console.log(`   - POST /generate?theme=educ&year=2022`);
    console.log(`   - GET  /download/educ_2022.xlsx`);
    console.log(`   - GET  /files`);
    console.log(`${'='.repeat(50)}\n`);
});
