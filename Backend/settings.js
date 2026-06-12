// ============================================================
// Module settings : parametres editables de la plateforme.
// Stockage JSON dans PRISME_STATE_DIR/settings.json.
//
//   GET  /api/settings   -> { success, settings }   (lecture libre)
//   POST /api/settings   { contact_email, contact_email_cc }
//                        -> reserve aux administrateurs (JWT + role=admin)
//
// L'identite vient du JWT PocketBase (userIdFromToken d'avatar.js) ;
// le role est verifie cote serveur via le client PocketBase admin.
// ============================================================

const fs = require('fs');
const path = require('path');
const { userIdFromToken } = require('./avatar');

const STATE_DIR = process.env.PRISME_STATE_DIR || path.join(__dirname, 'state');
const SETTINGS_FILE = path.join(STATE_DIR, 'settings.json');

// Valeurs par defaut (fallback historique cote front).
const DEFAULTS = {
    contact_email: 'naissa.chateau@ors-guyane.org',
    contact_email_cc: '',
};

function jsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(data));
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        let size = 0;
        req.on('data', (chunk) => {
            size += chunk.length;
            if (size > 64 * 1024) { reject(new Error('Corps trop volumineux')); req.destroy(); return; }
            body += chunk.toString();
        });
        req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); }
            catch (e) { reject(new Error('Corps JSON invalide')); }
        });
        req.on('error', reject);
    });
}

function readSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const stored = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
            return { ...DEFAULTS, ...stored };
        }
    } catch (e) { /* fichier corrompu -> defaults */ }
    return { ...DEFAULTS };
}

// getPbAdmin : fonction fournie par file_server.js renvoyant un client PB admin (ou null).
async function isAdminRequest(req, getPbAdmin) {
    const userId = userIdFromToken(req);
    if (!userId) return false;
    try {
        const pbAdmin = await getPbAdmin();
        if (!pbAdmin) return false;
        const user = await pbAdmin.collection('users').getOne(userId);
        return user && user.role === 'admin';
    } catch (e) {
        return false;
    }
}

async function handleSettings(req, res, urlPath, getPbAdmin) {
    if (urlPath !== '/settings') return false;

    if (req.method === 'GET') {
        jsonResponse(res, 200, { success: true, settings: readSettings() });
        return true;
    }

    if (req.method === 'POST') {
        if (!(await isAdminRequest(req, getPbAdmin))) {
            jsonResponse(res, 403, { success: false, error: 'Reserve aux administrateurs' });
            return true;
        }
        let body;
        try { body = await readJsonBody(req); }
        catch (e) { jsonResponse(res, 400, { success: false, error: e.message }); return true; }

        const current = readSettings();
        const next = { ...current };
        if (typeof body.contact_email === 'string') next.contact_email = body.contact_email.trim();
        if (typeof body.contact_email_cc === 'string') next.contact_email_cc = body.contact_email_cc.trim();

        try {
            if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(next, null, 2));
            jsonResponse(res, 200, { success: true, settings: next });
        } catch (e) {
            jsonResponse(res, 500, { success: false, error: 'Echec de la sauvegarde' });
        }
        return true;
    }

    return false;
}

module.exports = { handleSettings };
