/**
 * PRISME API Service
 * Centralise tous les appels à l'API backend
 */

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
}> {
    const response = await fetch(`${API_BASE}/api/generate?theme=${theme}&year=${year}`, {
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
}

export async function getFiles(): Promise<GeneratedFile[]> {
    try {
        const response = await fetch(`${API_BASE}/api/files`);
        if (!response.ok) throw new Error('Erreur serveur');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("API error in getFiles:", error);
        return [];
    }
}
