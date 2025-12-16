import PocketBase from 'pocketbase';
import readline from 'readline';

// We will use raw fetch for auth to debug, then SDK for the rest
const BASE_URL = 'http://127.0.0.1:8090';

async function prompt(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function rawAuth(email, password) {
    console.log(`\n📡 Connecting to ${BASE_URL}...`);

    // Try Admin Auth (Legacy/Standard)
    try {
        const resp = await fetch(`${BASE_URL}/api/admins/auth-with-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: email, password: password })
        });

        const data = await resp.json();

        if (!resp.ok) {
            console.error(`❌ HTTP Error ${resp.status}:`, data);
            throw new Error(data.message || "Auth Failed");
        }

        console.log("✅ Raw Auth Successful! Token received.");
        return data.token;
    } catch (e) {
        console.error("❌ Raw connection failed:", e.message);
        return null;
    }
}

async function createCollection(pb, data) {
    try {
        await pb.collections.create(data);
        console.log(`✅ Collection '${data.name}' created.`);
    } catch (err) {
        if (err.data?.message?.includes("already exists") || err.status === 400) {
            console.log(`⚠️ Collection '${data.name}' already exists (Skipping).`);
        } else {
            console.error(`❌ Error creating '${data.name}':`, err.message);
            // console.error(err.data);
        }
    }
}

async function main() {
    console.log("--- PocketBase Schema Setup (Debug Mode) ---");

    const email = await prompt("Enter Admin Email: ");
    const password = await prompt("Enter Admin Password: ");

    // 1. Get Token via Fetch
    const token = await rawAuth(email, password);
    if (!token) {
        console.log("🛑 Stopping script due to auth failure.");
        return;
    }

    // 2. Initialize SDK with Token
    const pb = new PocketBase(BASE_URL);
    pb.authStore.save(token, { email: email, id: "admin" }); // Manually set store

    console.log("🔄 SDK Initialized with token.");

    // 3. Define Collections
    console.log("\n📦 Creating Collections...");

    // Themes
    await createCollection(pb, {
        name: 'themes',
        type: 'base',
        schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'code', type: 'text', required: true, unique: true },
            { name: 'description', type: 'text' }
        ]
    });

    // Inputs (CSV Sources)
    await createCollection(pb, {
        name: 'inputs',
        type: 'base',
        schema: [
            { name: 'year', type: 'number', required: true },
            { name: 'theme', type: 'relation', collectionId: 'themes', cascadeDelete: false },
            { name: 'variable_target', type: 'text', required: true },
            { name: 'file', type: 'file', options: { mimeTypes: ['text/csv', 'application/vnd.ms-excel', 'text/plain'] } },
            { name: 'status', type: 'select', options: { values: ['pending', 'processed', 'error'] } }
        ]
    });

    // Reports (Excel Outputs)
    await createCollection(pb, {
        name: 'reports',
        type: 'base',
        schema: [
            { name: 'year', type: 'number', required: true },
            { name: 'theme', type: 'relation', collectionId: 'themes', cascadeDelete: false },
            { name: 'file', type: 'file', options: { mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] } },
            { name: 'status', type: 'select', options: { values: ['pending', 'generating', 'completed', 'error'] } },
            { name: 'logs', type: 'json' }
        ]
    });

    // 4. Seed Data
    console.log("\n🌱 Seeding Themes...");
    const themes = [
        { name: "Population", code: "pop", description: "Données démographiques" },
        { name: "Éducation", code: "educ", description: "Scolarisation et diplômes" },
        { name: "Santé", code: "sante", description: "État de santé général" },
        { name: "Offre de Soins", code: "sae", description: "Structures et équipements" },
        { name: "Pathologies", code: "patho", description: "Maladies chroniques" },
    ];

    for (const theme of themes) {
        try {
            // Need to fetch themes collection first to check existence or just try create
            await pb.collection('themes').create(theme);
            console.log(`   + Created theme: ${theme.name}`);
        } catch (e) {
            // Ignore duplicates
        }
    }

    console.log("\n🎉 Setup Complete!");
}

main();
