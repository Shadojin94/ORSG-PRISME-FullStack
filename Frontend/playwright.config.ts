import { defineConfig, devices } from '@playwright/test';

// Vérification visuelle du parcours « Pathologies » (preuve, pas une suite de tests).
// L'app doit tourner en local : Backend/node file_server.js (port 3001, sert Frontend/dist).
export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: process.env.PRISME_BASE_URL || 'http://localhost:3001',
        viewport: { width: 1280, height: 900 },
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    ],
});
