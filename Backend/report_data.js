"use strict";

/**
 * report_data.js
 *
 * GET /api/report-data?file=<nom>
 * Localise un fichier genere dans output/ (xlsx direct, ou xlsx contenu dans
 * un zip), lit les feuilles et renvoie un JSON compact pour la dataviz du
 * rapport de synthese cote frontend.
 *
 * Aucune dependance externe : un zip et un xlsx sont tous deux des conteneurs
 * ZIP. On lit le central directory et on inflate les entrees avec zlib natif.
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUTPUT_DIR = path.join(__dirname, "output");
const MAX_ROWS = 200;

// ---------------------------------------------------------------------------
// Mini lecteur ZIP (central directory + inflate raw)
// ---------------------------------------------------------------------------

// Retourne une Map<nomEntree, Buffer decompresse>
function readZip(buf) {
    const entries = new Map();
    // Localiser l'End Of Central Directory (signature 0x06054b50)
    let eocd = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) {
            eocd = i;
            break;
        }
    }
    if (eocd < 0) throw new Error("ZIP invalide (EOCD introuvable)");

    const total = buf.readUInt16LE(eocd + 10);
    let off = buf.readUInt32LE(eocd + 16);

    for (let n = 0; n < total; n++) {
        if (buf.readUInt32LE(off) !== 0x02014b50) break; // central dir header
        const method = buf.readUInt16LE(off + 10);
        const compSize = buf.readUInt32LE(off + 20);
        const nameLen = buf.readUInt16LE(off + 28);
        const extraLen = buf.readUInt16LE(off + 30);
        const commentLen = buf.readUInt16LE(off + 32);
        const localOff = buf.readUInt32LE(off + 42);
        const name = buf.toString("utf8", off + 46, off + 46 + nameLen);

        // Lire le local file header pour connaitre la taille reelle des champs
        const lhNameLen = buf.readUInt16LE(localOff + 26);
        const lhExtraLen = buf.readUInt16LE(localOff + 28);
        const dataStart = localOff + 30 + lhNameLen + lhExtraLen;
        const raw = buf.slice(dataStart, dataStart + compSize);

        let content;
        if (method === 0) {
            content = raw; // stored
        } else if (method === 8) {
            content = zlib.inflateRawSync(raw); // deflate
        } else {
            content = null; // methode non supportee, on ignore
        }
        if (content) entries.set(name, content);

        off += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
}

// ---------------------------------------------------------------------------
// Parsing xlsx minimal (cellules inlineStr / numeriques, pas de sharedStrings)
// ---------------------------------------------------------------------------

function colToIndex(ref) {
    // "AB12" -> index colonne (0-based)
    const m = /^([A-Z]+)/.exec(ref);
    if (!m) return 0;
    let idx = 0;
    for (const ch of m[1]) idx = idx * 26 + (ch.charCodeAt(0) - 64);
    return idx - 1;
}

function decodeXml(s) {
    return s
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");
}

// Lit une feuille (XML brut) -> { columns, rows }
function parseSheet(xml) {
    const rows = [];
    const rowRe = /<row[^>]*>([\s\S]*?)<\/row>/g;
    let rowMatch;
    while ((rowMatch = rowRe.exec(xml)) !== null) {
        const cells = {};
        // Cellule avec corps (<c ...>...</c>) ou auto-fermante (<c .../>)
        const cellRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
        let cMatch;
        while ((cMatch = cellRe.exec(rowMatch[1])) !== null) {
            const attrs = cMatch[1];
            const refM = /r="([A-Z]+\d+)"/.exec(attrs);
            if (!refM) continue;
            const ci = colToIndex(refM[1]);
            const typeM = /t="([^"]*)"/.exec(attrs);
            const type = typeM ? typeM[1] : "n";
            const body = cMatch[2] || "";
            let value;
            if (type === "inlineStr") {
                const t = /<t[^>]*>([\s\S]*?)<\/t>/.exec(body);
                value = t ? decodeXml(t[1]) : "";
            } else if (type === "str") {
                const v = /<v>([\s\S]*?)<\/v>/.exec(body);
                value = v ? decodeXml(v[1]) : "";
            } else {
                const v = /<v>([\s\S]*?)<\/v>/.exec(body);
                value = v ? Number(v[1]) : null;
            }
            cells[ci] = value;
        }
        rows.push(cells);
    }
    if (rows.length === 0) return { columns: [], rows: [] };

    // Largeur max
    let width = 0;
    for (const r of rows) for (const k of Object.keys(r)) width = Math.max(width, Number(k) + 1);

    const headerCells = rows[0];
    const columns = [];
    for (let i = 0; i < width; i++) {
        const h = headerCells[i];
        columns.push(h != null && h !== "" ? String(h) : `col_${i + 1}`);
    }

    const dataRows = [];
    for (let r = 1; r < rows.length && dataRows.length < MAX_ROWS; r++) {
        const obj = {};
        let hasValue = false;
        for (let i = 0; i < width; i++) {
            const v = rows[r][i];
            obj[columns[i]] = v === undefined ? null : v;
            if (v !== undefined && v !== null && v !== "") hasValue = true;
        }
        if (hasValue) dataRows.push(obj);
    }
    return { columns, rows: dataRows };
}

// Workbook -> liste ordonnee de { name, relId } via workbook.xml + rels
function readWorkbook(entries) {
    const wb = entries.get("xl/workbook.xml");
    const rels = entries.get("xl/_rels/workbook.xml.rels");
    if (!wb) return [];

    const wbXml = wb.toString("utf8");
    const relsXml = rels ? rels.toString("utf8") : "";

    // rId -> target (attributs dans un ordre quelconque)
    const relMap = {};
    const relRe = /<Relationship\b([^>]*)\/?>/g;
    let rm;
    while ((rm = relRe.exec(relsXml)) !== null) {
        const attrs = rm[1];
        const id = /Id="([^"]+)"/.exec(attrs);
        const target = /Target="([^"]+)"/.exec(attrs);
        if (id && target) relMap[id[1]] = target[1];
    }

    const sheets = [];
    const sheetRe = /<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?>/g;
    let sm;
    while ((sm = sheetRe.exec(wbXml)) !== null) {
        let target = relMap[sm[2]] || "";
        target = target.replace(/^\//, "");
        if (target && !target.startsWith("xl/")) target = "xl/" + target;
        sheets.push({ name: decodeXml(sm[1]), path: target });
    }
    return sheets;
}

function parseXlsxBuffer(buf) {
    const entries = readZip(buf);
    const sheetDefs = readWorkbook(entries);
    const sheets = [];
    for (const def of sheetDefs) {
        const xmlBuf = entries.get(def.path);
        if (!xmlBuf) continue;
        const parsed = parseSheet(xmlBuf.toString("utf8"));
        sheets.push({ name: def.name, columns: parsed.columns, rows: parsed.rows });
    }
    return sheets;
}

// ---------------------------------------------------------------------------
// Localisation du fichier xlsx a partir du parametre `file`
// ---------------------------------------------------------------------------

// Cherche le premier *_consolidated_*.xlsx dans un repertoire (recursif leger)
function findConsolidatedXlsx(dir) {
    let found = null;
    const walk = (d) => {
        if (found) return;
        let list;
        try {
            list = fs.readdirSync(d, { withFileTypes: true });
        } catch {
            return;
        }
        for (const e of list) {
            if (found) return;
            const full = path.join(d, e.name);
            if (e.isDirectory()) walk(full);
            else if (/consolidated.*\.xlsx$/i.test(e.name)) found = full;
        }
    };
    walk(dir);
    // Fallback : n'importe quel xlsx
    if (!found) {
        const walk2 = (d) => {
            if (found) return;
            let list;
            try {
                list = fs.readdirSync(d, { withFileTypes: true });
            } catch {
                return;
            }
            for (const e of list) {
                if (found) return;
                const full = path.join(d, e.name);
                if (e.isDirectory()) walk2(full);
                else if (/\.xlsx$/i.test(e.name)) found = full;
            }
        };
        walk2(dir);
    }
    return found;
}

// Renvoie un Buffer xlsx a partir du nom `file` (xlsx, zip, ou repertoire genere)
function resolveXlsx(file) {
    const base = path.join(OUTPUT_DIR, file);

    if (/\.xlsx$/i.test(file)) {
        return fs.readFileSync(base);
    }

    if (/\.zip$/i.test(file)) {
        const zipBuf = fs.readFileSync(base);
        const entries = readZip(zipBuf);
        // Choisir le consolidated, sinon le premier xlsx
        let pick = null;
        for (const name of entries.keys()) {
            if (/consolidated.*\.xlsx$/i.test(name)) {
                pick = name;
                break;
            }
        }
        if (!pick) {
            for (const name of entries.keys()) {
                if (/\.xlsx$/i.test(name)) {
                    pick = name;
                    break;
                }
            }
        }
        if (!pick) throw new Error("Aucun xlsx dans le zip");
        return entries.get(pick);
    }

    // Repertoire genere (ex: alloc_opendata)
    const stat = fs.existsSync(base) ? fs.statSync(base) : null;
    if (stat && stat.isDirectory()) {
        const xlsx = findConsolidatedXlsx(base);
        if (!xlsx) throw new Error("Aucun xlsx dans le repertoire");
        return fs.readFileSync(xlsx);
    }

    // Nom sans extension : essayer .zip puis repertoire
    if (fs.existsSync(base + ".zip")) {
        return resolveXlsx(file + ".zip");
    }
    throw new Error("Fichier introuvable");
}

// ---------------------------------------------------------------------------
// Handler HTTP
// ---------------------------------------------------------------------------

function handleReportData(req, res, urlPath, query) {
    const send = (code, payload) => {
        res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(payload));
    };

    try {
        const file = query && query.file ? String(query.file) : "";
        if (!file) return send(400, { success: false, error: "Parametre 'file' requis" });

        // Securite : pas de traversee de chemin
        if (file.includes("/") || file.includes("\\") || file.includes("..")) {
            return send(400, { success: false, error: "Nom de fichier invalide" });
        }

        const buf = resolveXlsx(file);
        const sheets = parseXlsxBuffer(buf);
        return send(200, { success: true, file, sheets });
    } catch (err) {
        return send(404, { success: false, error: err && err.message ? err.message : "Erreur lecture donnees" });
    }
}

module.exports = { handleReportData };
