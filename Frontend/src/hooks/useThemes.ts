/**
 * useThemes Hook
 * Charge les thèmes et datasets depuis l'API backend
 */

import { useState, useEffect, useCallback } from 'react';
import * as api from '@/services/api';
import { BDI_THEMES } from '@/data/bdi_themes';

// Types locaux enrichis pour le frontend
export interface FrontendTheme {
    id: string;
    title: string;
    shortTitle: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
    available: boolean;
    subThemes: FrontendSubTheme[];
}

export interface FrontendSubTheme {
    id: string;
    title: string;
    datasets: FrontendDataset[];
    availableYears?: number[];
    subThemes?: FrontendSubTheme[];
}

export interface FrontendDataset {
    id: string;
    label: string;
    source: string;
    available?: boolean;
}

// Icon et color mapping pour les thèmes principaux
const THEME_STYLES: Record<string, { icon: string; color: string; bgColor: string; description: string }> = {
    'pop_cond_vie': {
        icon: 'Users',
        color: 'text-blue-600',
        bgColor: 'bg-blue-600',
        description: 'Démographie, Éducation, Emploi, Revenus, Conditions de vie'
    },
    'etat_sante': {
        icon: 'HeartPulse',
        color: 'text-green-600',
        bgColor: 'bg-green-600',
        description: 'Espérance de vie, Mortalité générale et prématurée'
    },
    'struct_acti_soins': {
        icon: 'Stethoscope',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-600',
        description: 'Équipements hospitaliers, Activités, Professionnels de santé'
    },
    'pathologies': {
        icon: 'Activity',
        color: 'text-red-600',
        bgColor: 'bg-red-600',
        description: 'Maladies cardiovasculaires, respiratoires, cancers, diabète'
    },
    'comportements': {
        icon: 'AlertTriangle',
        color: 'text-amber-600',
        bgColor: 'bg-amber-600',
        description: 'Addictions (Alcool, Tabac), Suicide'
    },
    'traumatismes': {
        icon: 'Car',
        color: 'text-orange-600',
        bgColor: 'bg-orange-600',
        description: 'Accidents de la route, Noyades'
    }
};

export function useThemes() {
    const [themes, setThemes] = useState<FrontendTheme[]>([]);
    const [datasets, setDatasets] = useState<Record<string, api.DatasetInfo>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les thèmes depuis l'API
    const loadThemes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Charger thèmes et datasets en parallèle
            const [themesData, datasetsData] = await Promise.all([
                api.getThemes(),
                api.getDatasets()
            ]);

            setDatasets(datasetsData);

            // Transformer les données de l'API pour le frontend
            const frontendThemes: FrontendTheme[] = themesData.map((theme) => {
                const style = THEME_STYLES[theme.id] || {
                    icon: 'Folder',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-600',
                    description: theme.title
                };

                return {
                    id: theme.id,
                    title: theme.title,
                    shortTitle: theme.title.length > 30 ? theme.title.substring(0, 27) + '...' : theme.title,
                    description: style.description,
                    icon: style.icon,
                    color: style.color,
                    bgColor: style.bgColor,
                    available: true,
                    subThemes: transformSubThemes(theme.subThemes || [], datasetsData)
                };
            });

            setThemes(frontendThemes);
        } catch (err) {
            console.error('Failed to load themes:', err);
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, []);

    // Transformer les sous-thèmes récursivement
    function transformSubThemes(
        subThemes: api.ThemeTreeNode[],
        datasetsInfo: Record<string, api.DatasetInfo>
    ): FrontendSubTheme[] {
        return subThemes.map((st) => ({
            id: st.id,
            title: st.title,
            datasets: (st.datasets || []).map((dsId) => {
                const dsInfo = datasetsInfo[dsId];
                return {
                    id: dsId,
                    label: dsInfo?.name || dsId,
                    source: 'MOCA-O / OpenData',
                    available: true // Sera vérifié plus tard
                };
            }),
            subThemes: st.subThemes ? transformSubThemes(st.subThemes, datasetsInfo) : undefined
        }));
    }

    // Charger les années disponibles pour un dataset
    const getYearsForDataset = useCallback(async (datasetId: string): Promise<number[]> => {
        try {
            return await api.getAvailableYears(datasetId);
        } catch (err) {
            console.error(`Failed to get years for ${datasetId}:`, err);
            return [];
        }
    }, []);

    // Vérifier la disponibilité CSV pour un dataset
    const checkAvailability = useCallback(async (datasetId: string): Promise<boolean> => {
        try {
            const result = await api.checkCsvAvailability(datasetId);
            return result.available;
        } catch (err) {
            console.error(`Failed to check availability for ${datasetId}:`, err);
            return false;
        }
    }, []);

    // Charger au montage
    useEffect(() => {
        loadThemes();
    }, [loadThemes]);

    return {
        themes,
        datasets,
        loading,
        error,
        reload: loadThemes,
        getYearsForDataset,
        checkAvailability
    };
}

// Helper: find static years from BDI_THEMES for a dataset (fallback)
function getStaticYears(datasetId: string): number[] {
    const findInItems = (items: any[]): number[] | null => {
        for (const item of items) {
            if (item.datasets) {
                const ds = item.datasets.find((d: any) => d.id === datasetId);
                if (ds?.availableYears) return ds.availableYears;
            }
            if (item.subThemes) {
                const found = findInItems(item.subThemes);
                if (found) return found;
            }
        }
        return null;
    };
    for (const theme of BDI_THEMES as any[]) {
        if (theme.subThemes) {
            const found = findInItems(theme.subThemes);
            if (found) return found;
        }
        if (theme.datasets) {
            const ds = theme.datasets.find((d: any) => d.id === datasetId);
            if (ds?.availableYears) return ds.availableYears;
        }
    }
    return [];
}

// Hook pour charger les années d'un dataset spécifique
export function useDatasetYears(datasetId: string | null, openDataMode: boolean = false) {
    const [years, setYears] = useState<number[]>([]);
    // On démarre en chargement dès qu'un dataset est présent : évite une fenêtre
    // où l'UI croit qu'aucune donnée n'existe avant même le premier appel réseau.
    const [loading, setLoading] = useState<boolean>(!!datasetId);
    const [error, setError] = useState<string | null>(null);
    const [refreshCounter, setRefreshCounter] = useState(0);

    useEffect(() => {
        if (!datasetId) {
            setYears([]);
            setLoading(false);
            return;
        }

        // Bascule en chargement de façon synchrone (avant l'await) pour fermer la
        // fenêtre years=[] / loading=false lors d'un changement de sujet ou de source.
        setLoading(true);

        const load = async () => {
            setError(null);
            try {
                const yearsData = openDataMode
                    ? await api.getAvailableYearsOpenData(datasetId)
                    : await api.getAvailableYears(datasetId);
                setYears(yearsData);
            } catch (err) {
                console.error(`Failed to load years for ${datasetId} (openData=${openDataMode}):`, err);
                // Fallback: use static years from bdi_themes.ts
                const staticYears = getStaticYears(datasetId);
                if (staticYears.length > 0) {
                    console.warn(`Using static fallback years for ${datasetId}:`, staticYears);
                    setYears(staticYears);
                    setError(null); // Clear error since we have fallback data
                } else {
                    setError(err instanceof Error ? err.message : 'Erreur');
                    setYears([]);
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [datasetId, openDataMode, refreshCounter]);

    const reload = useCallback(() => {
        setRefreshCounter(c => c + 1);
    }, []);

    return { years, loading, error, reload };
}
