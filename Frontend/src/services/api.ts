/**
 * PRISME API Service
 * Centralise tous les appels à l'API backend
 */

import { pb } from '@/lib/pocketbase';

const API_BASE = '';  // Empty string = same origin

// Types
export interface ThemeTreeNode {
    id: string;
    title: string;
    icon?: string;
    color?: string;
    datasets?: string[];
    subThemes?: ThemeTreeNode[];
}

export interface DatasetInfo {
    id: string;
    name: string;
    folderPath: string;
    fileName: string;
    sheets: string[];
    variables: string[];
}

export interface CsvAvailability {
    available: boolean;
    found: Array<{ variable: string; pattern: string; file: string }>;
    missing: Array<{ variable: string; pattern: string }>;
}

// Health check
export async function checkHealth(): Promise<{ status: string; version: string }> {
    const response = await fetch(`${API_BASE}/api/health`);
    return response.json();
}

// Get theme tree from server
export async function getThemes(): Promise<ThemeTreeNode[]> {
    const response = await fetch(`${API_BASE}/api/themes`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch themes');
    return data.themes;
}

// Get all datasets info
export async function getDatasets(): Promise<Record<string, DatasetInfo>> {
    const response = await fetch(`${API_BASE}/api/datasets`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch datasets');
    return data.datasets;
}

// Get available years for a specific dataset
export async function getAvailableYears(datasetId: string): Promise<number[]> {
    const response = await fetch(`${API_BASE}/api/available-years?dataset=${datasetId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch years');
    return data.years;
}

// Get available years for a dataset in Open Data mode
export async function getAvailableYearsOpenData(datasetId: string): Promise<number[]> {
    const response = await fetch(`${API_BASE}/api/available-years-opendata?dataset=${datasetId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch Open Data years');
    return data.years;
}

// Check CSV availability for a dataset
export async function checkCsvAvailability(datasetId: string): Promise<CsvAvailability> {
    const response = await fetch(`${API_BASE}/api/check-csv?dataset=${datasetId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to check CSV');
    return {
        available: data.available,
        found: data.found,
        missing: data.missing
    };
}

// Get detailed info about a dataset
export async function getDatasetInfo(datasetId: string): Promise<{
    dataset: DatasetInfo & { availableYears: number[]; csvAvailability: CsvAvailability };
}> {
    const response = await fetch(`${API_BASE}/api/dataset-info?id=${datasetId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch dataset info');
    return { dataset: data.dataset };
}

// Generate Excel files
export async function generateExcel(theme: string, year: number): Promise<{
    success: boolean;
    filename?: string;
    error?: string;
    warnings?: string[];
}> {
    const response = await fetch(`${API_BASE}/api/generate?theme=${theme}&year=${year}`, {
        method: 'POST'
    });
    return response.json();
}

// Generate Open Data files
export async function generateOpenData(theme: string, year: number): Promise<{
    success: boolean;
    filename?: string;
    error?: string;
    warnings?: string[];
}> {
    const response = await fetch(`${API_BASE}/api/generate-opendata?theme=${theme}&year=${year}`, {
        method: 'POST'
    });
    return response.json();
}

// Generate consolidated multi-year MOCA-O native xlsx
export async function generateMocaoConsolidated(
    theme: string,
    yearStart: number,
    yearEnd: number,
    source: 'moca' | 'opendata' = 'moca'
): Promise<{ success: boolean; filename?: string; error?: string; warnings?: string[] }> {
    const qs = `theme=${theme}&yearStart=${yearStart}&yearEnd=${yearEnd}&source=${source}`;
    const response = await fetch(`${API_BASE}/api/generate-mocao-consolidated?${qs}`, {
        method: 'POST'
    });
    return response.json();
}

// Upload CSV/XLSX files to Backend/csv_sources/
export interface GeoAnalysis {
    filename: string;
    found: Array<{ code: string; label: string }>;
    missing: Array<{ code: string; label: string }>;
}

export interface UploadResult {
    success: boolean;
    files?: string[];
    converted?: Array<{ original: string; csv: string }>;
    skipped?: Array<{ file: string; reason: string }>;
    geoAnalysis?: GeoAnalysis[];
    geoWarnings?: string[];
    error?: string;
    message?: string;
}

export async function uploadCsvFiles(files: File[], user?: string): Promise<UploadResult> {
    const formData = new FormData();
    for (const file of files) {
        formData.append('files', file, file.name);
    }
    const userParam = user ? `?user=${encodeURIComponent(user)}` : '';
    const response = await fetch(`${API_BASE}/api/upload-csv${userParam}`, {
        method: 'POST',
        body: formData
    });
    return response.json();
}

// Validate a CSV file (returns column info, row count, sample data)
export interface CsvValidation {
    columns: string[];
    rowCount: number;
    sampleRows: Record<string, any>[];
    hasGeoColumn: boolean;
    hasYearColumn: boolean;
    hasValueColumn: boolean;
    fileSize: number;
    separator: string;
}

export async function validateCsvFile(filename: string): Promise<{
    success: boolean;
    validation?: CsvValidation;
    error?: string;
}> {
    const response = await fetch(`${API_BASE}/api/validate-csv?file=${encodeURIComponent(filename)}`);
    return response.json();
}

// Import history
export interface ImportHistoryEntry {
    id: string;
    timestamp: string;
    user: string;
    files: string[];
    converted: Array<{ original: string; csv: string }>;
    count: number;
}

export async function getImportHistory(): Promise<ImportHistoryEntry[]> {
    const response = await fetch(`${API_BASE}/api/import-history`);
    const data = await response.json();
    return data.success ? data.history : [];
}

// Get technical logs (journal technique) — N dernieres lignes de app.log
export async function getLogs(lines = 200): Promise<string[]> {
    const response = await fetch(`${API_BASE}/api/logs?lines=${lines}`);
    if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);
    const data = await response.json();
    return data.success && Array.isArray(data.lines) ? data.lines : [];
}

// List CSV source files on server
export interface CsvSourceFile {
    name: string;
    size: number;
    modified: string;
}

export async function listCsvSources(): Promise<CsvSourceFile[]> {
    const response = await fetch(`${API_BASE}/api/csv-sources`);
    const data = await response.json();
    return data.success ? data.files : [];
}

// Delete a CSV source file
export async function deleteCsvSource(filename: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/api/delete-csv?file=${encodeURIComponent(filename)}`, {
        method: 'POST'
    });
    return response.json();
}

// Reload server config
export async function reloadConfig(): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${API_BASE}/api/reload-config`, {
        method: 'POST'
    });
    return response.json();
}

// Donnees d'un fichier genere pour la dataviz du rapport de synthese
export interface ReportSheet {
    name: string;
    columns: string[];
    rows: Array<Record<string, string | number | null>>;
}

export async function getReportData(file: string): Promise<{ success: boolean; file?: string; sheets?: ReportSheet[]; error?: string }> {
    const response = await fetch(`${API_BASE}/api/report-data?file=${encodeURIComponent(file)}`);
    return response.json();
}

// ===== Avatar (photo de profil) =====

// Envoie une image (data URI base64) au serveur. Max 2 Mo, png/jpeg/webp.
export async function uploadAvatar(dataUri: string): Promise<{ success: boolean; url?: string; error?: string }> {
    const response = await fetch(`${API_BASE}/api/avatar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({ image: dataUri }),
    });
    return response.json();
}

// URL de l'avatar d'un utilisateur (cache-buster optionnel pour rafraichir apres upload).
export function getAvatarUrl(userId: string, version?: number | string): string {
    const v = version ? `?v=${version}` : '';
    return `${API_BASE}/api/avatar/${userId}${v}`;
}

// Download URL helper
export function getDownloadUrl(filename: string): string {
    return `${API_BASE}/api/download/${filename}`;
}

// Get generated files history
export interface GeneratedFile {
    filename: string;
    date: string;
    size: string;
    theme: string;
    source?: string;
}

export async function getFiles(): Promise<GeneratedFile[]> {
    const response = await fetch(`${API_BASE}/api/files`);
    if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}
