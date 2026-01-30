/**
 * useThemes Hook
 * Charge les thèmes et datasets depuis l'API backend
 */

import { useState, useEffect, useCallback } from 'react';
import * as api from '@/services/api';

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

// Hook pour charger les années d'un dataset spécifique
export function useDatasetYears(datasetId: string | null) {
    const [years, setYears] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!datasetId) {
            setYears([]);
            return;
        }

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const yearsData = await api.getAvailableYears(datasetId);
                setYears(yearsData);
            } catch (err) {
                console.error(`Failed to load years for ${datasetId}:`, err);
                setError(err instanceof Error ? err.message : 'Erreur');
                setYears([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [datasetId]);

    return { years, loading, error };
}
