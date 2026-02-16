import { useState, useEffect, useMemo } from "react";
import { SidebarSummary } from "@/components/generator/SidebarSummary";
import { Step1_ThemeSelection } from "@/components/generator/Step1_ThemeSelection";
import { Step2_Config } from "@/components/generator/Step2_Config";
import { Step3_Result } from "@/components/generator/Step3_Result";
import * as api from "@/services/api";
import { useDatasetYears } from "@/hooks/useThemes";
import { BDI_THEMES } from "@/data/bdi_themes";
import { cn } from "@/lib/utils";

// Supported Open Data Themes
const OPEN_DATA_SUPPORTED_THEMES = [
    'educ',
    'pers_sup65ans_seules',
    'familles_mono',
    'pop_inf3ans',
    'pers_menages',
    'types_menages',
    'alloc',
    'revenu',
    'densite',
    'route',
    'mortalite_gen',
    'mortalite_cardio',
    'mortalite_tumeurs',
    'mortalite_respi',
    'mortalite_neuro',
    'mortalite_diabete',
    'mortalite_covid'
];

// Persist generator state in sessionStorage so navigation doesn't lose progress
const STORAGE_KEY = 'prisme_generator_state';

interface SavedState {
    step: number;
    selectedThemeId: string | null;
    selectedSubThemeId: string | null;
    selectedDatasetId: string | null;
    sourceMode: 'opendata' | 'moca';
    year: string;
    format: string;
    generatedFile: string | null;
}

function loadSavedState(): Partial<SavedState> {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) { }
    return {};
}

function saveState(state: SavedState) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { }
}

export function GeneratorPage() {
    // ----------------------------------------------------
    // State (restored from sessionStorage if available)
    // ----------------------------------------------------
    const saved = useMemo(() => loadSavedState(), []);

    const [step, setStep] = useState<number>(saved.step || 1);

    // Selection
    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(saved.selectedThemeId || null);
    const [selectedSubThemeId, setSelectedSubThemeId] = useState<string | null>(saved.selectedSubThemeId || null);
    const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(saved.selectedDatasetId || null);

    // Config
    const [year, setYear] = useState<string>(saved.year || "");
    const [format, setFormat] = useState<string>(saved.format || "zip");

    // Source Mode
    const [sourceMode, setSourceMode] = useState<'opendata' | 'moca'>(saved.sourceMode || 'moca');

    // Process
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedFile, setGeneratedFile] = useState<string | null>(saved.generatedFile || null);

    const [error, setError] = useState<string | null>(null);

    // Persist state on every change
    useEffect(() => {
        saveState({
            step, selectedThemeId, selectedSubThemeId, selectedDatasetId,
            sourceMode, year, format, generatedFile
        });
    }, [step, selectedThemeId, selectedSubThemeId, selectedDatasetId, sourceMode, year, format, generatedFile]);

    // ----------------------------------------------------
    // Computed Checks
    // ----------------------------------------------------
    // Does the selected dataset support Open Data?
    const supportsOpenData = selectedDatasetId
        ? OPEN_DATA_SUPPORTED_THEMES.includes(selectedDatasetId)
        : false;

    // Compute labels for breadcrumb in Step2
    const { themeLabel, datasetLabel } = useMemo(() => {
        if (!selectedThemeId || !selectedDatasetId) return { themeLabel: "", datasetLabel: "" };
        const theme = (BDI_THEMES as any[]).find(t => t.id === selectedThemeId);
        if (!theme) return { themeLabel: "", datasetLabel: "" };

        let dsLabel = "";
        const findDataset = (items: any[]) => {
            for (const item of items) {
                if (item.datasets) {
                    const ds = item.datasets.find((d: any) => d.id === selectedDatasetId);
                    if (ds) { dsLabel = ds.label; return; }
                }
                if (item.subThemes) findDataset(item.subThemes);
                if (dsLabel) return;
            }
        };
        findDataset(theme.subThemes || []);
        if (!dsLabel && theme.datasets) {
            const ds = theme.datasets.find((d: any) => d.id === selectedDatasetId);
            if (ds) dsLabel = ds.label;
        }
        return { themeLabel: theme.shortTitle || theme.title, datasetLabel: dsLabel };
    }, [selectedThemeId, selectedDatasetId]);

    // Load years for selected dataset based on CURRENT source mode
    const { years: availableYears, loading: yearsLoading, reload: reloadYears } = useDatasetYears(
        selectedDatasetId,
        sourceMode === 'opendata'
    );

    // ----------------------------------------------------
    // Effects
    // ----------------------------------------------------
    // Auto-select latest year when dataset changes (or years loaded)
    useEffect(() => {
        if (availableYears && availableYears.length > 0) {
            const maxYear = Math.max(...availableYears);
            setYear(String(maxYear));
        } else {
            setYear(""); // Reset if no years
        }
    }, [availableYears, selectedDatasetId, sourceMode]);

    // ----------------------------------------------------
    // Handlers
    // ----------------------------------------------------
    const handleDatasetSelect = (themeId: string, subThemeId: string, datasetId: string) => {
        setSelectedThemeId(themeId);
        setSelectedSubThemeId(subThemeId);
        setSelectedDatasetId(datasetId);

        // Auto-detect best mode
        // If dataset supports OpenData, default to it? Or user preference?
        // Prompt implies user choice, but usually defaults stick.
        // Let's default to OpenData if available as it is "better/faster/client-like".
        if (OPEN_DATA_SUPPORTED_THEMES.includes(datasetId)) {
            setSourceMode('opendata');
        } else {
            setSourceMode('moca');
        }

        setStep(2); // Go to Config
        setGeneratedFile(null); // Reset previous result
        setError(null);
    };

    const handleGenerate = async () => {
        if (!selectedDatasetId || !year) return;

        setIsProcessing(true);
        setError(null);

        try {
            const result = sourceMode === 'opendata'
                ? await api.generateOpenData(selectedDatasetId, parseInt(year))
                : await api.generateExcel(selectedDatasetId, parseInt(year));

            if (result.success && result.filename) {
                setGeneratedFile(result.filename);
                setStep(3); // Success!
            } else {
                setError(result.error || "Erreur inconnue lors de la génération.");
            }
        } catch (error: any) {
            console.error("Generation error:", error);
            setError(`Erreur système: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = (filename: string) => {
        window.open(`/api/download/${filename}`, '_blank');
    };

    const handleGoToStep = (targetStep: number) => {
        if (targetStep >= step) return; // Can only go back
        if (isProcessing) return;

        if (targetStep === 1) {
            // Back to indicator selection - keep selections so accordion is open
            setStep(1);
            setYear("");
            setGeneratedFile(null);
            setError(null);
        } else if (targetStep === 2) {
            // Back to config - keep dataset selection, reset result
            setStep(2);
            setGeneratedFile(null);
            setError(null);
        }
    };

    const handleBack = () => handleGoToStep(step - 1);

    const handleRestart = () => {
        setStep(1);
        setSelectedSubThemeId(null);
        setSelectedDatasetId(null);
        setSelectedThemeId(null);
        setGeneratedFile(null);
        setYear("");
        setError(null);
        try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { }
    };

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-4 pb-32">

            {/* Header / Title */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-4xl font-extrabold text-[#1a4b8c] mb-4 tracking-tight">
                    Assistant de Génération
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Créez vos fichiers de données en 3 étapes simples.
                </p>

                {/* Visual Steps Indicator - clickable for completed steps */}
                <div className="flex justify-center items-center gap-4 mt-8">
                    {[
                        { n: 1, label: "Indicateur" },
                        { n: 2, label: "Configuration" },
                        { n: 3, label: "Résultat" }
                    ].map(({ n: s, label }) => {
                        const isClickable = s < step && !isProcessing;
                        return (
                            <div key={s} className="flex items-center gap-2">
                                <button
                                    onClick={() => isClickable && handleGoToStep(s)}
                                    disabled={!isClickable}
                                    className={cn(
                                        "flex flex-col items-center gap-1 group",
                                        isClickable ? "cursor-pointer" : "cursor-default"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                                        step === s ? "bg-[#1a4b8c] text-white scale-110 shadow-lg" :
                                            step > s ? "bg-[#4caf50] text-white group-hover:bg-[#388e3c] group-hover:scale-105" :
                                                "bg-gray-100 text-gray-400"
                                    )}>
                                        {step > s ? "✓" : s}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-medium",
                                        step === s ? "text-[#1a4b8c]" :
                                            step > s ? "text-[#4caf50] group-hover:text-[#388e3c]" :
                                                "text-gray-400"
                                    )}>
                                        {label}
                                    </span>
                                </button>
                                {s < 3 && <div className={cn("w-12 h-1 bg-gray-200 mt-[-14px]", step > s && "bg-[#4caf50]")} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative pb-20">

                {/* Main Content Area (Left) */}
                <div className="lg:col-span-8 space-y-8 min-h-[500px]">

                    {step === 1 && (
                        <Step1_ThemeSelection
                            onDatasetSelect={handleDatasetSelect}
                            selectedThemeId={selectedThemeId}
                            selectedSubThemeId={selectedSubThemeId}
                            selectedDatasetId={selectedDatasetId}
                        />
                    )}

                    {step === 2 && (
                        <Step2_Config
                            year={year}
                            availableYears={availableYears.map(String)}
                            yearsLoading={yearsLoading}
                            onYearChange={setYear}
                            format={format}
                            onFormatChange={setFormat}
                            onGenerate={handleGenerate}
                            onBack={handleBack}
                            isProcessing={isProcessing}
                            error={error}
                            supportsOpenData={supportsOpenData}
                            sourceMode={sourceMode}
                            onSourceChange={setSourceMode}
                            datasetLabel={datasetLabel}
                            themeLabel={themeLabel}
                            datasetId={selectedDatasetId}
                            onUploadComplete={reloadYears}
                        />
                    )}

                    {step === 3 && (
                        <Step3_Result
                            generatedFile={generatedFile}
                            onDownload={handleDownload}
                            onRestart={handleRestart}
                        />
                    )}

                </div>

                {/* Right Panel (Sticky Summary) */}
                <div className="hidden lg:block lg:col-span-4">
                    <SidebarSummary
                        step={step}
                        selectedThemeId={selectedThemeId}
                        selectedSubThemeId={selectedSubThemeId}
                        selectedDatasetId={selectedDatasetId}
                        year={year}
                        format={format}
                        isProcessing={isProcessing}
                        onGenerate={handleGenerate}
                        onGoToStep={handleGoToStep}
                        canGenerate={!!selectedDatasetId && !!year}
                        isOpenDataMode={sourceMode === 'opendata'}
                    />
                </div>
            </div>

        </div>
    );
}
