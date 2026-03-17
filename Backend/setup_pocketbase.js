/**
 * PocketBase Schema Setup Script
 * Run once to create/update collections and seed initial users.
 *
 * Usage: node setup_pocketbase.js
 *
 * Prerequisites:
 *   - PocketBase running on http://127.0.0.1:8090
 *   - Admin account already created via PocketBase admin UI
 *   - Backend/.env configured with POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD
 */

const fs = require('fs');
const path = require('path');

// Load .env
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
    console.error('ERROR: Set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in Backend/.env');
    process.exit(1);
}

async function main() {
    const PocketBase = (await import('pocketbase')).default;
    const pb = new PocketBase(PB_URL);

    // Authenticate as admin
    console.log(`Connecting to PocketBase at ${PB_URL}...`);
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Admin authenticated.');

    // ===== 1. Extend users collection with custom fields =====
    console.log('\n--- Updating users collection ---');
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
                options: {
                    values: ['active', 'inactive'],
                    maxSelect: 1,
                },
            },
        ];

        let updated = false;
        for (const field of fieldsToAdd) {
            if (!existingFieldNames.includes(field.name)) {
                usersCollection.schema.push(field);
                updated = true;
                console.log(`  + Adding field: ${field.name}`);
            } else {
                console.log(`  = Field exists: ${field.name}`);
            }
        }

        if (updated) {
            await pb.collections.update(usersCollection.id, {
                schema: usersCollection.schema,
            });
            console.log('  Users collection updated.');
        }
    } catch (e) {
        console.error('Failed to update users collection:', e.message);
    }

    // ===== 2. Create/update login_codes collection =====
    console.log('\n--- Setting up login_codes collection ---');
    const loginCodesSchema = [
        { name: 'email', type: 'text', required: true },
        { name: 'code', type: 'text', required: true },
        { name: 'expires_at', type: 'date', required: true },
        { name: 'used', type: 'bool', required: false },
    ];
    try {
        const existing = await pb.collections.getOne('login_codes');
        // Always update schema to fix any issues (e.g. used:required)
        await pb.collections.update(existing.id, { schema: loginCodesSchema });
        console.log('  Collection login_codes updated.');
    } catch (_e) {
        try {
            await pb.collections.create({
                name: 'login_codes',
                type: 'base',
                schema: loginCodesSchema,
                listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
            });
            console.log('  Collection login_codes created.');
        } catch (e) {
            console.error('  Failed to create login_codes:', e.message);
        }
    }

    // ===== 3. Create support_tickets collection =====
    console.log('\n--- Creating support_tickets collection ---');
    try {
        await pb.collections.getOne('support_tickets');
        console.log('  Collection support_tickets already exists.');
    } catch (_e) {
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
                // Users can view/create their own tickets
                listRule: '@request.auth.id != "" && user = @request.auth.id',
                viewRule: '@request.auth.id != "" && user = @request.auth.id',
                createRule: '@request.auth.id != ""',
                updateRule: null, // admin only
                deleteRule: null,
            });
            console.log('  Collection support_tickets created.');
        } catch (e) {
            console.error('  Failed to create support_tickets:', e.message);
        }
    }

    // ===== 4. Seed initial users =====
    console.log('\n--- Seeding initial users ---');
    const seedUsers = [
        { email: 'naissa.chateau@ors-guyane.org', name: 'Naissa Chateau Remy', role: 'admin', organization: 'ORSG-CTPS', department: 'Direction' },
        { email: 'cedric.atticot@live.fr', name: 'Cedric Atticot', role: 'admin', organization: 'N.O.V.I. Connected', department: 'Developpement' },
    ];

    for (const u of seedUsers) {
        try {
            const existing = await pb.collection('users').getFullList({ filter: `email="${u.email}"` });
            if (existing.length > 0) {
                console.log(`  = User exists: ${u.email}`);
                continue;
            }
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
            console.log(`  + Created user: ${u.email} (role: ${u.role})`);
        } catch (e) {
            console.error(`  Failed to seed ${u.email}:`, e.message);
        }
    }

    // ===== 5. Update users API rules =====
    console.log('\n--- Updating API rules ---');
    try {
        const usersCollection = await pb.collections.getOne('users');
        await pb.collections.update(usersCollection.id, {
            // Authenticated users can view all users (needed for admin page)
            listRule: '@request.auth.id != ""',
            viewRule: '@request.auth.id != ""',
            // Users can update their own profile
            updateRule: '@request.auth.id = id',
        });
        console.log('  Users API rules updated.');
    } catch (e) {
        console.error('  Failed to update API rules:', e.message);
    }

    console.log('\n=== Setup complete ===\n');
}

main().catch(e => {
    console.error('Setup failed:', e);
    process.exit(1);
});
