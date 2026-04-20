/**
 * PocketBase - Script de setup IDEMPOTENT
 *
 * Objectifs :
 *  - Ne JAMAIS ecraser des utilisateurs existants (persistance Coolify garantie cote volumes)
 *  - Ne seed que si la collection est vide
 *  - Tolerer un admin dont le password a ete change manuellement (log warning, pas de crash)
 *
 * SDK installe : pocketbase ^0.21.5 (cf Backend/package.json)
 *   -> API admin = pb.admins.authWithPassword (pas encore _superusers qui arrive en 0.23+)
 *
 * Usage : node setup_pocketbase.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

// Chargement .env (genere par entrypoint.sh)
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

const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;
const PB_SYSTEM_PASSWORD = process.env.PB_SYSTEM_PASSWORD || 'PrismeSystemAuth2026!';

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
    console.error('[SETUP] ERREUR : POCKETBASE_ADMIN_EMAIL et POCKETBASE_ADMIN_PASSWORD doivent etre definis.');
    process.exit(1);
}

/**
 * Tente d'authentifier l'admin. Retourne l'instance PB si OK, null sinon.
 * Ne plante PAS si le password est invalide (cas : admin deja present avec mot de passe different).
 */
async function tryAuthAdmin(pb) {
    try {
        await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
        console.log(`[SETUP] Admin authentifie : ${PB_ADMIN_EMAIL}`);
        return true;
    } catch (e) {
        console.warn(`[SETUP] WARNING : echec authentification admin (${e.status || '?'} ${e.message}).`);
        console.warn('[SETUP] L\'admin existe probablement avec un autre mot de passe (volume persistant).');
        console.warn('[SETUP] Les collections et users existants sont donc PRESERVES. Aucune modification ne sera faite.');
        return false;
    }
}

async function ensureUsersSchema(pb) {
    console.log('\n[SETUP] --- Verification schema collection users ---');
    try {
        const usersCollection = await pb.collections.getOne('users');
        const existingFieldNames = usersCollection.schema.map(f => f.name);

        const fieldsToAdd = [
            { name: 'phone', type: 'text', required: false },
            { name: 'organization', type: 'text', required: false },
            { name: 'department', type: 'text', required: false },
            {
                name: 'role', type: 'select', required: true,
                options: {
                    values: ['admin', 'expert', 'analyste', 'utilisateur', 'invite'],
                    maxSelect: 1,
                },
            },
            {
                name: 'status', type: 'select', required: true,
                options: { values: ['active', 'inactive'], maxSelect: 1 },
            },
            { name: 'personal_password_hash', type: 'text', required: false },
            { name: 'otp_enabled', type: 'bool', required: false },
        ];

        let updated = false;
        for (const field of fieldsToAdd) {
            if (!existingFieldNames.includes(field.name)) {
                usersCollection.schema.push(field);
                updated = true;
                console.log(`  + Ajout champ : ${field.name}`);
            }
        }

        if (updated) {
            await pb.collections.update(usersCollection.id, { schema: usersCollection.schema });
            console.log('  Schema users mis a jour.');
        } else {
            console.log('  Schema users deja complet, pas de modification.');
        }
    } catch (e) {
        console.error('[SETUP] Echec verification users :', e.message);
    }
}

async function ensureLoginCodesCollection(pb) {
    console.log('\n[SETUP] --- Verification collection login_codes ---');
    const loginCodesSchema = [
        { name: 'email', type: 'text', required: true },
        { name: 'code', type: 'text', required: true },
        { name: 'expires_at', type: 'date', required: true },
        { name: 'used', type: 'bool', required: false },
    ];
    try {
        await pb.collections.getOne('login_codes');
        console.log('  Collection login_codes deja presente (pas de reset).');
    } catch (_e) {
        try {
            await pb.collections.create({
                name: 'login_codes',
                type: 'base',
                schema: loginCodesSchema,
                listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
            });
            console.log('  Collection login_codes creee.');
        } catch (e) {
            console.error('  Echec creation login_codes :', e.message);
        }
    }
}

async function ensureSupportTicketsCollection(pb) {
    console.log('\n[SETUP] --- Verification collection support_tickets ---');
    try {
        await pb.collections.getOne('support_tickets');
        console.log('  Collection support_tickets deja presente.');
        return;
    } catch (_e) {
        // n'existe pas, on la cree
    }
    try {
        await pb.collections.create({
            name: 'support_tickets',
            type: 'base',
            schema: [
                { name: 'subject', type: 'text', required: true, options: { min: 3, max: 200 } },
                { name: 'description', type: 'text', required: true, options: { min: 10 } },
                {
                    name: 'priority', type: 'select', required: true,
                    options: { values: ['low', 'medium', 'high', 'critical'], maxSelect: 1 },
                },
                {
                    name: 'category', type: 'select', required: true,
                    options: { values: ['account', 'generation', 'bug', 'question', 'other'], maxSelect: 1 },
                },
                {
                    name: 'status', type: 'select', required: true,
                    options: { values: ['open', 'in_progress', 'resolved', 'closed'], maxSelect: 1 },
                },
                { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
                { name: 'admin_notes', type: 'text', required: false },
            ],
            listRule: '@request.auth.id != "" && user = @request.auth.id',
            viewRule: '@request.auth.id != "" && user = @request.auth.id',
            createRule: '@request.auth.id != ""',
            updateRule: null,
            deleteRule: null,
        });
        console.log('  Collection support_tickets creee.');
    } catch (e) {
        console.error('  Echec creation support_tickets :', e.message);
    }
}

async function seedUsersIfEmpty(pb) {
    console.log('\n[SETUP] --- Verification seed des utilisateurs ---');

    // Idempotence forte : si au moins 1 user existe, on NE TOUCHE A RIEN.
    // Ceci evite toute collision avec des comptes crees depuis l'UI admin Coolify.
    let existingCount = 0;
    try {
        const existingList = await pb.collection('users').getList(1, 1);
        existingCount = existingList.totalItems;
    } catch (e) {
        console.error('  Echec lecture collection users :', e.message);
        return;
    }

    if (existingCount > 0) {
        console.log(`  ${existingCount} utilisateur(s) deja present(s) -> seed ignore (idempotent).`);
        // NB : on continue quand meme dans main() pour reposer les hashes personnels
        // (voir ensurePersonalPasswordsAlways ci-dessous, appele hors seedUsersIfEmpty)
        return;
    }

    console.log('  Collection users vide -> seed initial des 6 comptes.');
    const seedUsers = [
        { email: 'naissa.chateau@ors-guyane.org', name: 'Naissa Chateau Remy', role: 'admin', organization: 'ORSG-CTPS', department: 'Direction' },
        { email: 'cedric.atticot@live.fr', name: 'Cedric Atticot', role: 'admin', organization: 'N.O.V.I. Connected', department: 'Developpement' },
        { email: 'marc.ravino@gmail.com', name: 'Cedric Atticot', role: 'admin', organization: 'N.O.V.I. Connected', department: 'Developpement' },
        { email: 'm-j.castor@ors-guyane.org', name: 'Marie-Josiane Castor', role: 'admin', organization: 'ORSG-CTPS', department: 'Observation' },
        { email: 'jessy.pajot@ors-guyane.org', name: 'Jessy Pajot', role: 'admin', organization: 'ORSG-CTPS', department: 'Observation' },
        { email: 'm.imounga-desroziers@ors-guyane.org', name: 'Manuella Imounga-Desroziers', role: 'admin', organization: 'ORSG-CTPS', department: 'Observation' },
    ];

    for (const u of seedUsers) {
        try {
            await pb.collection('users').create({
                email: u.email,
                name: u.name,
                password: PB_SYSTEM_PASSWORD,
                passwordConfirm: PB_SYSTEM_PASSWORD,
                role: u.role,
                status: 'active',
                organization: u.organization || '',
                department: u.department || '',
                emailVisibility: true,
            });
            console.log(`  + Utilisateur cree : ${u.email} (role: ${u.role})`);
        } catch (e) {
            console.error(`  Echec creation ${u.email} :`, e.message);
        }
    }

    // Hashes personnels (uniquement pour comptes sans OTP fiable : live.fr bloque Resend)
    console.log('\n[SETUP] --- Hashes mots de passe personnels ---');
    const personalPasswords = [
        { email: 'cedric.atticot@live.fr', password: 'Prisme2026!' },
        { email: 'marc.ravino@gmail.com', password: 'Prisme2026!' },
    ];
    for (const p of personalPasswords) {
        try {
            const users = await pb.collection('users').getFullList({ filter: `email="${p.email}"` });
            if (users.length > 0) {
                await pb.collection('users').update(users[0].id, {
                    password: PB_SYSTEM_PASSWORD,
                    passwordConfirm: PB_SYSTEM_PASSWORD,
                    personal_password_hash: sha256(p.password),
                });
                console.log(`  + Hash personnel pose pour : ${p.email}`);
            }
        } catch (e) {
            console.error(`  Echec pose hash ${p.email} :`, e.message);
        }
    }
}

/**
 * Pose/met a jour le personal_password_hash sur les comptes cles A CHAQUE boot.
 * Idempotent : si le hash est deja correct, aucune action.
 * Evite la regression "can_use_password: false" apres un redeploy.
 */
async function ensurePersonalPasswordsAlways(pb) {
    console.log('\n[SETUP] --- Mise a jour hashes mots de passe personnels (always) ---');
    const personalPasswords = [
        { email: 'cedric.atticot@live.fr', password: 'Prisme2026!' },
        { email: 'marc.ravino@gmail.com', password: 'Prisme2026!' },
        { email: 'naissa.chateau@ors-guyane.org', password: 'Prisme2026!' },
        { email: 'm-j.castor@ors-guyane.org', password: 'Prisme2026!' },
        { email: 'jessy.pajot@ors-guyane.org', password: 'Prisme2026!' },
        { email: 'm.imounga-desroziers@ors-guyane.org', password: 'Prisme2026!' },
    ];
    for (const p of personalPasswords) {
        try {
            const users = await pb.collection('users').getFullList({ filter: `email="${p.email}"` });
            if (users.length === 0) {
                console.log(`  ~ User absent, skip : ${p.email}`);
                continue;
            }
            const user = users[0];
            const desiredHash = sha256(p.password);
            if (user.personal_password_hash === desiredHash) {
                console.log(`  = Hash deja correct : ${p.email}`);
                continue;
            }
            await pb.collection('users').update(user.id, {
                personal_password_hash: desiredHash,
            });
            console.log(`  + Hash pose/mis a jour : ${p.email}`);
        } catch (e) {
            console.error(`  Echec pose hash ${p.email} :`, e.message);
        }
    }
}

/**
 * Met a jour le role des utilisateurs existants si necessaire.
 * Couvre le cas ou les users ont ete crees avec role 'expert' avant la correction.
 */
async function ensureUserRoles(pb) {
    console.log('\n[SETUP] --- Verification roles utilisateurs ---');
    const expectedRoles = [
        { email: 'naissa.chateau@ors-guyane.org', role: 'admin' },
        { email: 'cedric.atticot@live.fr', role: 'admin' },
        { email: 'marc.ravino@gmail.com', role: 'admin' },
        { email: 'm-j.castor@ors-guyane.org', role: 'admin' },
        { email: 'jessy.pajot@ors-guyane.org', role: 'admin' },
        { email: 'm.imounga-desroziers@ors-guyane.org', role: 'admin' },
    ];
    for (const entry of expectedRoles) {
        try {
            const users = await pb.collection('users').getFullList({ filter: `email="${entry.email}"` });
            if (users.length === 0) continue;
            const user = users[0];
            if (user.role === entry.role) {
                console.log(`  = Role deja correct : ${entry.email} (${entry.role})`);
                continue;
            }
            await pb.collection('users').update(user.id, { role: entry.role });
            console.log(`  + Role mis a jour : ${entry.email} ${user.role} -> ${entry.role}`);
        } catch (e) {
            console.error(`  Echec mise a jour role ${entry.email} :`, e.message);
        }
    }
}

async function ensureUsersApiRules(pb) {
    console.log('\n[SETUP] --- Verification regles API users ---');
    try {
        const usersCollection = await pb.collections.getOne('users');
        const desired = {
            listRule: '@request.auth.id != ""',
            viewRule: '@request.auth.id != ""',
            updateRule: '@request.auth.id = id || @request.auth.role = "admin"',
            deleteRule: '@request.auth.role = "admin"',
        };
        const needsUpdate =
            usersCollection.listRule !== desired.listRule ||
            usersCollection.viewRule !== desired.viewRule ||
            usersCollection.updateRule !== desired.updateRule ||
            usersCollection.deleteRule !== desired.deleteRule;

        if (needsUpdate) {
            await pb.collections.update(usersCollection.id, desired);
            console.log('  Regles API users mises a jour.');
        } else {
            console.log('  Regles API users deja correctes.');
        }
    } catch (e) {
        console.error('  Echec mise a jour regles API :', e.message);
    }
}

async function main() {
    const PocketBase = (await import('pocketbase')).default;
    const pb = new PocketBase(PB_URL);

    console.log(`[SETUP] Connexion a PocketBase : ${PB_URL}`);
    const authed = await tryAuthAdmin(pb);
    if (!authed) {
        console.log('\n[SETUP] === Setup ignore (admin inaccessible, donnees existantes preservees) ===\n');
        return;
    }

    await ensureUsersSchema(pb);
    await ensureLoginCodesCollection(pb);
    await ensureSupportTicketsCollection(pb);
    await seedUsersIfEmpty(pb);
    await ensurePersonalPasswordsAlways(pb);
    await ensureUserRoles(pb);
    await ensureUsersApiRules(pb);

    console.log('\n[SETUP] === Setup termine (idempotent) ===\n');
}

main().catch(e => {
    console.error('[SETUP] Echec global :', e);
    // NB : on ne fait PAS process.exit(1) pour ne pas casser l'entrypoint.
    // L'appli doit demarrer meme si le setup a un probleme non-fatal.
    process.exit(0);
});
