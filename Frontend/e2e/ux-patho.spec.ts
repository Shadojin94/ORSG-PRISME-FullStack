import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

/**
 * Vérification visuelle du parcours « Pathologies » :
 *  - étape 1 : le thème déplié montre ses sujets, SANS zone de réagencement/upload ;
 *  - étape 2 (pathologies) : carte « Réagencement d'une extraction MOCA-O » à la place de « Source des données » ;
 *  - étape 2 (autre thème) : carte « Source des données » intacte.
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

    await page.screenshot({ path: path.join(SHOTS, 'step1-pathologies-deplie.png'), fullPage: true });
});

test('etape 2 — Pathologies : carte Réagencement à la place de Source des données', async ({ page }) => {
    await openGenerator(page);

    await page.getByRole('heading', { level: 3, name: 'Pathologies', exact: true }).click();
    await page.getByRole('heading', { level: 4, name: 'Cardiopathies ischémiques' }).click();

    await expect(page.getByRole('heading', { name: '2. Configurez la génération' })).toBeVisible();
    await expect(page.getByRole('heading', { name: "Réagencement d'une extraction MOCA-O" })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Source des données' })).toHaveCount(0);

    await page.screenshot({ path: path.join(SHOTS, 'step2-pathologies.png'), fullPage: true });
});

test('etape 2 — autre thème : carte Source des données intacte', async ({ page }) => {
    await openGenerator(page);

    await page.getByRole('heading', { level: 3, name: 'État de Santé', exact: true }).click();
    await page.getByRole('heading', { level: 4, name: 'Mortalité générale et prématurée' }).click();

    await expect(page.getByRole('heading', { name: '2. Configurez la génération' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Source des données' })).toBeVisible();
    await expect(page.getByRole('heading', { name: "Réagencement d'une extraction MOCA-O" })).toHaveCount(0);

    await page.screenshot({ path: path.join(SHOTS, 'step2-autre-theme.png'), fullPage: true });
});
