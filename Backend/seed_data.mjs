import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Helper to authenticate as admin (required to write to restricted collections)
// We use the credentials you just validated
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || "ChangeMe123!";

async function main() {
    console.log("🌱 Seeding Demo Data...");

    try {
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log("✅ Auth Successful");
    } catch (e) {
        console.error("❌ Auth Failed. Please ensure server is running and creds are correct.");
        return;
    }

    // 1. Seed Users (replacing "Naissa" mock)
    const users = [
        {
            username: "naissa_orsg",
            email: "naissa@orsg.fr",
            emailVisibility: true,
            password: "Password123",
            passwordConfirm: "Password123",
            name: "Naissa (Demo)",
            avatar: "" // Optional
        },
        {
            username: "cedric_novi",
            email: "cedric@noviconnect.fr",
            emailVisibility: true,
            password: "Password123",
            passwordConfirm: "Password123",
            name: "Cédric (Dev)",
        },
        {
            username: "dr_pinceau",
            email: "pinceau@orsg.fr",
            emailVisibility: true,
            password: "Password123",
            passwordConfirm: "Password123",
            name: "Dr. Pinceau",
        }
    ];

    console.log("\n👤 Creating Users...");
    for (const u of users) {
        try {
            // Check if exists
            const exists = await pb.collection('users').getList(1, 1, { filter: `email = "${u.email}"` });
            if (exists.totalItems === 0) {
                await pb.collection('users').create(u);
                console.log(`   + Created: ${u.name}`);
            } else {
                console.log(`   = Exists: ${u.name}`);
            }
        } catch (e) {
            console.error(`   ! Error creating ${u.name}:`, e.message);
        }
    }

    // 2. Seed Reports (History)
    console.log("\n📄 Creating Fake Reports (History)...");

    // We need theme IDs first
    let themeEduc, themePop;
    try {
        const t1 = await pb.collection('themes').getFirstListItem('code="educ"');
        themeEduc = t1.id;
        const t2 = await pb.collection('themes').getFirstListItem('code="pop"');
        themePop = t2.id;
    } catch (e) {
        console.log("   ⚠️ Themes not found, skipping reports seeding (Run setup first).");
    }

    if (themeEduc && themePop) {
        const reports = [
            { theme: themeEduc, year: 2021, status: "completed", logs: { source: "INSEE" } },
            { theme: themePop, year: 2022, status: "completed", logs: { source: "MOCA-O" } },
            { theme: themeEduc, year: 2023, status: "generating", logs: { source: "DREES" } },
        ];

        for (const r of reports) {
            try {
                // Check dupe logic omitted for simplicity, just create
                await pb.collection('reports').create(r);
                console.log(`   + Created Report: ${r.year}`);
            } catch (e) {
                console.log(`   ! Error report: ${e.message}`);
            }
        }
    }

    console.log("\n✅ Database populated with fake data!");
}

main();
