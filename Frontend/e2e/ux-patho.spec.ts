import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

/**
 * Vérification visuelle du parcours « Pathologies » :
 *  - étape 1 : le thème déplié montre ses sujets, SANS zone de réagencement/upload ;
 *  - étape 2 (pathologies, source MOCA-O) : dans la carte « Source des données », le
 *    réagencement d'une extraction remplace l'import MOCA-O par sujet ; l'option
 *    Open Data reste disponible ;
 *  - étape 2 (pathologies, source Open Data) : aucune zone de réagencement ;
 *  - étape 2 (autre thème) : carte « Source des données » + MocaUpload intacts.
 */

const SHOTS = process.env.PRISME_SHOTS_DIR || path.resolve(__dirname, 'shots');

// Bypass d'authentification : le front accepte un token préfixé « dev_token_ »
// (voir src/hooks/useAuth.tsx) sans appeler authRefresh. Le segment central doit
// rester décodable en JWT pour que pb.authStore.isValid soit vrai.
function devAuthToken(): string {
    const payload = Buffer.from(
        JSON.stringify({ id: 'e2etestuser0001', type: 'authRecord', collectionId: 'users', exp: 9999999999 })
    ).toString('base64').replace(/=+$/, '');
    return `dev_token_hdr.${payload}.sig`;
}

async function authenticate(page: Page) {
    const auth = {
        token: devAuthToken(),
        model: {
            id: 'e2etestuser0001',
            collectionId: 'users',
            collectionName: 'users',
            email: 'e2e@prisme.local',
            name: 'E2E Test',
            role: 'admin',
            status: 'active',
            organization: 'ORSG',
            department: 'QA',
            phone: '',
            avatar: '',
            otp_enabled: false,
            created: '2026-01-01 00:00:00.000Z',
            updated: '2026-01-01 00:00:00.000Z',
        },
    };
    await page.addInitScript((value) => {
        window.localStorage.setItem('pocketbase_auth', value);
    }, JSON.stringify(auth));
}

/**
 * Capture pleine page. Le CTA « Générer ce sujet » est en `position: sticky` :
 * en capture fullPage, Chromium le fige à sa position d'écran et il chevauche
 * les cartes. On le repasse en flux le temps du screenshot — artefact de capture
 * uniquement, la mise en page réelle est correcte (vérifiée en capture viewport).
 */
async function shoot(page: Page, name: string) {
    await page.addStyleTag({ content: '.sticky { position: static !important; }' });
    await page.screenshot({ path: path.join(SHOTS, name), fullPage: true });
}

async function openGenerator(page: Page) {
    await authenticate(page);
    await page.goto('/generate');
    await expect(page.getByRole('heading', { name: 'Choisissez un sujet' })).toBeVisible({ timeout: 15000 });
}

test('etape 1 — thème Pathologies déplié : sujets seuls, aucun réagencement', async ({ page }) => {
    await openGenerator(page);

    await page.getByRole('heading', { level: 3, name: 'Pathologies', exact: true }).click();

    // Les sujets du thème sont affichés avec leurs indicateurs.
    await expect(page.getByRole('heading', { level: 4, name: 'Cardiopathies ischémiques' })).toBeVisible();
    await expect(page.getByText('Mortalité par cardiopathies ischémiques').first()).toBeVisible();

    // Aucune zone d'upload / de réagencement à l'étape 1.
    await expect(page.getByText("Réagencement d'une extraction MOCA-O")).toHaveCount(0);
    await expect(page.getByText('Déposez votre extraction MOCA-O')).toHaveCount(0);

    await shoot(page, 'step1-pathologies-deplie.png');
});

async function openPathoSubject(page: Page) {
    await openGenerator(page);
    await page.getByRole('heading', { level: 3, name: 'Pathologies', exact: true }).click();
    await page.getByRole('heading', { level: 4, name: 'Cardiopathies ischémiques' }).click();
    await expect(page.getByRole('heading', { name: '2. Configurez la génération' })).toBeVisible();
    // La carte source reste présente pour tous les thèmes, avec ses deux options.
    await expect(page.getByRole('heading', { name: 'Source des données' })).toBeVisible();
}

test('etape 2 — Pathologies / MOCA-O : réagencement dans la carte Source des données', async ({ page }) => {
    await openPathoSubject(page);

    await page.getByRole('button', { name: /MOCA-O/ }).first().click();

    // Les deux options de source restent offertes.
    await expect(page.getByRole('button', { name: /Open Data/ }).first()).toBeVisible();
    // Le réagencement remplace l'import MOCA-O par sujet.
    await expect(page.getByRole('heading', { name: "Réagencement d'une extraction MOCA-O" })).toBeVisible();
    await expect(page.getByText('Glissez-déposez vos fichiers ici')).toHaveCount(0);

    await shoot(page, 'step2-pathologies-moca.png');
});

test('etape 2 — Pathologies / Open Data : aucune zone de réagencement', async ({ page }) => {
    // Sans années Open Data, l'anti cul-de-sac rebascule aussitôt sur MOCA-O :
    // on stubbe l'endpoint pour pouvoir observer l'état Open Data.
    await page.route('**/available-years-opendata*', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, years: [2021, 2022] }) })
    );

    await openPathoSubject(page);

    await page.getByRole('button', { name: /Open Data/ }).first().click();

    await expect(page.getByRole('heading', { name: "Réagencement d'une extraction MOCA-O" })).toHaveCount(0);
    await expect(page.getByText('Déposez votre extraction MOCA-O (.xls)')).toHaveCount(0);

    await shoot(page, 'step2-pathologies-opendata.png');
});

test('etape 2 — autre thème : carte Source des données intacte', async ({ page }) => {
    await openGenerator(page);

    await page.getByRole('heading', { level: 3, name: 'État de Santé', exact: true }).click();
    await page.getByRole('heading', { level: 4, name: 'Mortalité générale et prématurée' }).click();

    await expect(page.getByRole('heading', { name: '2. Configurez la génération' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Source des données' })).toBeVisible();
    await expect(page.getByRole('heading', { name: "Réagencement d'une extraction MOCA-O" })).toHaveCount(0);
    // MocaUpload (import par sujet) reste le process des autres thèmes.
    await expect(page.getByText('Glissez-déposez vos fichiers ici')).toBeVisible();

    await shoot(page, 'step2-autre-theme.png');
});
