// ============================================================
// Module avatar : upload et service des photos de profil.
// PocketBase n'est pas joignable depuis le navigateur ; ce module
// stocke les avatars sur le disque du serveur, nommes par userId.
//
//   POST /api/avatar          { image: "data:image/png;base64,..." }
//   GET  /api/avatar/<userId>
//
// L'identite est extraite du JWT PocketBase envoye dans l'en-tete
// Authorization: Bearer <token> (meme token que pb.authStore cote front).
// ============================================================

const fs = require('fs');
const path = require('path');

// Dossier state : persiste via volume en prod (PRISME_STATE_DIR=/app/Backend/state)
const AVATARS_DIR = path.join(process.env.PRISME_STATE_DIR || path.join(__dirname, 'state'), 'avatars');
const MAX_BYTES = 2 * 1024 * 1024; // 2 Mo

// Extensions autorisees -> type MIME servi
const MIME_BY_EXT = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
};
// MIME (du data URI) -> extension de fichier
const EXT_BY_MIME = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
};

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

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
            // Garde-fou : data URI base64 ~ +33%, on coupe largement au-dela de la limite
            if (size > MAX_BYTES * 2) {
                reject(new Error('Fichier trop volumineux'));
                req.destroy();
                return;
            }
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Corps JSON invalide'));
            }
        });
        req.on('error', reject);
    });
}

// Decode le payload d'un JWT PocketBase et renvoie l'id utilisateur.
// Pas de verification de signature : ce serveur delegue l'auth a PocketBase
// (aucun middleware), on se contente d'identifier l'appelant.
function userIdFromToken(req) {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : header;
    if (!token || token.startsWith('dev_token_')) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
        const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        );
        return typeof payload.id === 'string' && payload.id ? payload.id : null;
    } catch (e) {
        return null;
    }
}

// Recherche le fichier avatar existant pour un userId (extension inconnue).
function findAvatarFile(userId) {
    for (const ext of Object.keys(MIME_BY_EXT)) {
        const p = path.join(AVATARS_DIR, `${userId}.${ext}`);
        if (fs.existsSync(p)) return { filePath: p, ext };
    }
    return null;
}

async function handleAvatar(req, res, urlPath) {
    // ----- POST /avatar : upload (base64 JSON) -----
    if (urlPath === '/avatar' && req.method === 'POST') {
        const userId = userIdFromToken(req);
        if (!userId) {
            jsonResponse(res, 401, { success: false, error: 'Authentification requise' });
            return true;
        }
        let body;
        try {
            body = await readJsonBody(req);
        } catch (e) {
            jsonResponse(res, 413, { success: false, error: e.message });
            return true;
        }
        const dataUri = body.image || '';
        const match = /^data:([^;]+);base64,(.+)$/.exec(dataUri);
        if (!match) {
            jsonResponse(res, 400, { success: false, error: 'Image base64 invalide' });
            return true;
        }
        const mime = match[1].toLowerCase();
        const ext = EXT_BY_MIME[mime];
        if (!ext) {
            jsonResponse(res, 400, { success: false, error: 'Format non supporte (png, jpeg, webp)' });
            return true;
        }
        const buffer = Buffer.from(match[2], 'base64');
        if (buffer.length > MAX_BYTES) {
            jsonResponse(res, 413, { success: false, error: 'Image trop lourde (max 2 Mo)' });
            return true;
        }
        try {
            ensureDir(AVATARS_DIR);
            // Supprime un eventuel avatar avec une autre extension
            const existing = findAvatarFile(userId);
            if (existing && existing.ext !== ext) fs.unlinkSync(existing.filePath);
            fs.writeFileSync(path.join(AVATARS_DIR, `${userId}.${ext}`), buffer);
            jsonResponse(res, 200, { success: true, url: `/api/avatar/${userId}` });
        } catch (e) {
            jsonResponse(res, 500, { success: false, error: 'Echec de la sauvegarde' });
        }
        return true;
    }

    // ----- GET /avatar/<userId> : service du fichier -----
    if (urlPath.startsWith('/avatar/') && req.method === 'GET') {
        const userId = decodeURIComponent(urlPath.slice('/avatar/'.length));
        // Nom de fichier sur : pas de separateur de chemin
        if (!userId || /[\\/]/.test(userId)) {
            jsonResponse(res, 404, { success: false, error: 'Avatar introuvable' });
            return true;
        }
        const found = findAvatarFile(userId);
        if (!found) {
            jsonResponse(res, 404, { success: false, error: 'Avatar introuvable' });
            return true;
        }
        res.writeHead(200, {
            'Content-Type': MIME_BY_EXT[found.ext],
            'Cache-Control': 'private, max-age=60',
        });
        fs.createReadStream(found.filePath).pipe(res);
        return true;
    }

    return false;
}

module.exports = { handleAvatar };
