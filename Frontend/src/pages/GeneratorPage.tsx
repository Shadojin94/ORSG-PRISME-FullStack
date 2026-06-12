import { useState, useEffect, useMemo } from "react";
import { SidebarSummary } from "@/components/generator/SidebarSummary";
import { Step1_ThemeSelection } from "@/components/generator/Step1_ThemeSelection";
import { Step2_Config } from "@/components/generator/Step2_Config";
import { Step3_Result } from "@/components/generator/Step3_Result";
import * as api from "@/services/api";
import { useDatasetYears } from "@/hooks/useThemes";
import { BDI_THEMES } from "@/data/bdi_themes";
import { OPEN_DATA_SUPPORTED_THEMES } from "@/constants/openDataThemes";
import { cn } from "@/lib/utils";

const STORAGE_KEY = 'prisme_generator_state';

export interface SubjectDataset {
    id: string;
    variable: string;
    label: string;
    source: string;
    demoReady: boolean;
}

interface SavedState {
    step: number;
    selectedThemeId: string | null;
    selectedSubThemeId: string | null;
    sourceMode: 'opendata' | 'moca';
    year: string;
    format: string;
    generatedFiles: string[];
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

function findSubject(themeId: string | null, subThemeId: string | null): { theme: any; sub: any } | null {
    if (!themeId || !subThemeId) return null;
    const theme = (BDI_THEMES as any[]).find(t => t.id === themeId);
    if (!theme) return null;
    const walk = (items: any[]): any => {
        for (const item of items) {
            if (item.id === subThemeId) return item;
            if (item.subThemes) {
                const found = walk(item.subThemes);
                if (found) return found;
            }
        }
        return null;
    };
    const sub = walk(theme.subThemes || []);
    if (!sub) return null;
    return { theme, sub };
}

export function GeneratorPage() {
    const saved = useMemo(() => loadSavedState(), []);

    const [step, setStep] = useState<number>(saved.step || 1);

    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(saved.selectedThemeId || null);
    const [selectedSubThemeId, setSelectedSubThemeId] = useState<string | null>(saved.selectedSubThemeId || null);

    const [year, setYear] = useState<string>(saved.year || "");
    const [yearEnd, setYearEnd] = useState<string>("");
    const [format, setFormat] = useState<string>(saved.format || "zip");

    const [sourceMode, setSourceMode] = useState<'opendata' | 'moca'>(saved.sourceMode || 'opendata');

    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number; label: string } | null>(null);
    const [generatedFiles, setGeneratedFiles] = useState<string[]>(saved.generatedFiles || []);
    const [generationWarnings, setGenerationWarnings] = useState<string[]>([]);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        saveState({
            step, selectedThemeId, selectedSubThemeId,
            sourceMode, year, format, generatedFiles
        });
    }, [step, selectedThemeId, selectedSubThemeId, sourceMode, year, format, generatedFiles]);

    // Compute subject context
    const subjectCtx = useMemo(() => findSubject(selectedThemeId, selectedSubThemeId), [selectedThemeId, selectedSubThemeId]);

    // Unique datasets of selected subject (one entry per backend-distinct dataset ID)
    const subjectDatasets: SubjectDataset[] = useMemo(() => {
        if (!subjectCtx) return [];
        // Cibles de génération : on exclut les calculs, les indicateurs masqués (non implémentés)
        // et ceux non disponibles en accès public (génération impossible).
        const all = (subjectCtx.sub.datasets || []).filter((d: any) => d?.tool !== "Calcul" && !d?.hidden && !d?.publicUnavailable);
        const seen = new Set<string>();
        const out: SubjectDataset[] = [];
        for (const d of all) {
            if (seen.has(d.id)) continue;
            seen.add(d.id);
            out.push({
                id: d.id,
                variable: d.variable,
                label: d.label,
                source: d.source || '',
                demoReady: !!d.demoReady
            });
        }
        return out;
    }, [subjectCtx]);

    // All indicator entries (includes duplicates with different variables, for display)
    const subjectIndicators = useMemo(() => {
        if (!subjectCtx) return [];
        // Affichage : on masque les calculs et les indicateurs masqués, mais on garde
        // ceux non disponibles en accès public (affichés avec une mention explicite).
        return (subjectCtx.sub.datasets || []).filter((d: any) => d?.tool !== "Calcul" && !d?.hidden);
    }, [subjectCtx]);

    const themeLabel = subjectCtx?.theme.shortTitle || subjectCtx?.theme.title || "";
    const subjectLabel = subjectCtx?.sub.title || "";

    // Primary dataset (for year detection — backend offers per-dataset year endpoint only)
    const primaryDatasetId = subjectDatasets[0]?.id || null;

    // Does the subject support Open Data? (true if ANY of its datasets supports it)
    const supportsOpenData = subjectDatasets.some(d => OPEN_DATA_SUPPORTED_THEMES.includes(d.id));

    // Le sujet peut toujours être alimenté par import MOCA-O dès qu'il a un jeu de données.
    const supportsMoca = subjectDatasets.length > 0;

    // Message d'aiguillage non technique affiché quand on bascule automatiquement de source.
    const [autoSwitchNotice, setAutoSwitchNotice] = useState<string | null>(null);

    const { years: availableYears, loading: yearsLoading, reload: reloadYears } = useDatasetYears(
        primaryDatasetId,
        sourceMode === 'opendata'
    );

    // Anti cul-de-sac : Open Data sans année disponible -> bascule auto vers l'import MOCA-O.
    useEffect(() => {
        if (
            sourceMode === 'opendata' &&
            !yearsLoading &&
            availableYears.length === 0 &&
            supportsMoca
        ) {
            setSourceMode('moca');
            setAutoSwitchNotice(
                "Les données publiques ne sont pas encore disponibles pour ce sujet. Importez vos fichiers MOCA-O ci-dessous pour générer."
            );
        }
    }, [sourceMode, yearsLoading, availableYears, supportsMoca]);

    useEffect(() => {
        if (availableYears && availableYears.length > 0) {
            const maxYear = Math.max(...availableYears);
            const minYear = Math.min(...availableYears);
            setYear(String(maxYear));
            setYearEnd(String(maxYear));
            // Default consolidated range = full span
            if (format === 'consolidated') {
                setYear(String(minYear));
                setYearEnd(String(maxYear));
            }
        } else {
            setYear("");
            setYearEnd("");
        }
    }, [availableYears, primaryDatasetId, sourceMode, format]);

    const handleSubjectSelect = (themeId: string, subThemeId: string) => {
        setSelectedThemeId(themeId);
        setSelectedSubThemeId(subThemeId);

        const ctx = findSubject(themeId, subThemeId);
        const ds = (ctx?.sub.datasets || []).filter((d: any) => d?.tool !== "Calcul");
        const hasOpenData = ds.some((d: any) => OPEN_DATA_SUPPORTED_THEMES.includes(d.id));
        setSourceMode(hasOpenData ? 'opendata' : 'moca');
        setAutoSwitchNotice(null);

        setStep(2);
        setGeneratedFiles([]);
        setError(null);
    };

    const handleGenerate = async () => {
        if (subjectDatasets.length === 0 || !year) return;

        setIsProcessing(true);
        setError(null);
        setGeneratedFiles([]);
        setGenerationWarnings([]);

        const files: string[] = [];
        const warnings: string[] = [];
        const total = subjectDatasets.length;

        try {
            for (let i = 0; i < subjectDatasets.length; i++) {
                const ds = subjectDatasets[i];
                setProgress({ current: i + 1, total, label: ds.label });

                // Use open data only if this specific dataset supports it
                const useOpenData = sourceMode === 'opendata' && OPEN_DATA_SUPPORTED_THEMES.includes(ds.id);

                let result;
                if (format === 'consolidated') {
                    const ys = parseInt(year);
                    const ye = parseInt(yearEnd || year);
                    result = await api.generateMocaoConsolidated(
                        ds.id, Math.min(ys, ye), Math.max(ys, ye),
                        useOpenData ? 'opendata' : 'moca'
                    );
                } else if (useOpenData) {
                    result = await api.generateOpenData(ds.id, parseInt(year));
                } else {
                    result = await api.generateExcel(ds.id, parseInt(year));
                }

                if (result.success && result.filename) {
                    files.push(result.filename);
                    if (result.warnings?.length) warnings.push(...result.warnings);
                } else {
                    warnings.push(`[${ds.label}] ${result.error || 'Erreur inconnue'}`);
                }
            }

            if (files.length === 0) {
                setError(warnings.join(' · ') || "Aucun fichier généré");
            } else {
                setGeneratedFiles(files);
                setGenerationWarnings(warnings);
                setStep(3);
            }
        } catch (err: any) {
            console.error("Generation error:", err);
            setError(`Erreur système: ${err.message}`);
        } finally {
            setIsProcessing(false);
            setProgress(null);
        }
    };

    const handleDownload = (filename: string) => {
        window.open(`/api/download/${filename}`, '_blank');
    };

    const handleGoToStep = (targetStep: number) => {
        if (targetStep >= step) return;
        if (isProcessing) return;

        if (targetStep === 1) {
            setStep(1);
            setYear("");
            setGeneratedFiles([]);
            setError(null);
        } else if (targetStep === 2) {
            setStep(2);
            setGeneratedFiles([]);
            setError(null);
        }
    };

    const handleBack = () => handleGoToStep(step - 1);

    const handleRestart = () => {
        setStep(1);
        setSelectedSubThemeId(null);
        setSelectedThemeId(null);
        setGeneratedFiles([]);
        setYear("");
        setError(null);
        try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { }
    };

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-4 pb-32">

            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-4xl font-extrabold text-[#1a4b8c] mb-4 tracking-tight">
                    Assistant de Génération
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Créez vos fichiers de données en 3 étapes simples.
                </p>

                <div className="flex justify-center items-center gap-4 mt-8">
                    {[
                        { n: 1, label: "Sujet" },
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

            <div className={cn(
                "grid grid-cols-1 gap-8 items-start relative pb-20",
                step === 1 ? "lg:grid-cols-12" : ""
            )}>

                <div className={cn(
                    "space-y-8 min-h-[500px]",
                    step === 1 ? "lg:col-span-8" : "max-w-4xl mx-auto w-full"
                )}>

                    {step === 1 && (
                        <Step1_ThemeSelection
                            onSubjectSelect={handleSubjectSelect}
                            selectedThemeId={selectedThemeId}
                            selectedSubThemeId={selectedSubThemeId}
                        />
                    )}

                    {step === 2 && (
                        <Step2_Config
                            year={year}
                            yearEnd={yearEnd}
                            onYearEndChange={setYearEnd}
                            availableYears={availableYears.map(String)}
                            yearsLoading={yearsLoading}
                            onYearChange={setYear}
                            format={format}
                            onFormatChange={setFormat}
                            onBack={handleBack}
                            error={error}
                            supportsOpenData={supportsOpenData}
                            supportsMoca={supportsMoca}
                            sourceMode={sourceMode}
                            onSourceChange={(mode) => { setAutoSwitchNotice(null); setSourceMode(mode); }}
                            autoSwitchNotice={autoSwitchNotice}
                            subjectLabel={subjectLabel}
                            themeLabel={themeLabel}
                            indicators={subjectIndicators}
                            primaryDatasetId={primaryDatasetId}
                            onUploadComplete={reloadYears}
                            onGenerate={handleGenerate}
                            isProcessing={isProcessing}
                            progress={progress}
                            canGenerate={subjectDatasets.length > 0 && !!year}
                            fileCount={subjectDatasets.length}
                        />
                    )}

                    {step === 3 && (
                        <Step3_Result
                            generatedFiles={generatedFiles}
                            warnings={generationWarnings}
                            onDownload={handleDownload}
                            onRestart={handleRestart}
                        />
                    )}

                </div>

                {step === 1 && (
                    <div className="hidden lg:block lg:col-span-4">
                        <SidebarSummary
                            step={step}
                            themeLabel={themeLabel}
                            subjectLabel={subjectLabel}
                            subjectDatasets={subjectDatasets}
                            year={year}
                            format={format}
                            isProcessing={isProcessing}
                            progress={progress}
                            onGenerate={handleGenerate}
                            onGoToStep={handleGoToStep}
                            canGenerate={subjectDatasets.length > 0 && !!year}
                            isOpenDataMode={sourceMode === 'opendata'}
                        />
                    </div>
                )}
            </div>

        </div>
    );
}
