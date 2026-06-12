import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
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

    const { years: availableYears, loading: yearsLoading, error: yearsError, reload: reloadYears } = useDatasetYears(
        primaryDatasetId,
        sourceMode === 'opendata'
    );

    // Anti cul-de-sac : Open Data sans année disponible -> bascule auto vers l'import MOCA-O.
    useEffect(() => {
        if (
            sourceMode === 'opendata' &&
            !yearsLoading &&
            !yearsError &&
            availableYears.length === 0 &&
            supportsMoca
        ) {
            setSourceMode('moca');
            setAutoSwitchNotice(
                "Les données publiques ne sont pas encore disponibles pour ce sujet. Importez vos fichiers MOCA-O ci-dessous pour générer."
            );
        }
    }, [sourceMode, yearsLoading, yearsError, availableYears, supportsMoca]);

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
        <div className="pb-32">

            <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <PageHero
                    icon={Sparkles}
                    eyebrow="Génération"
                    title="Assistant de génération"
                    description="Créez vos fichiers de données en 3 étapes simples."
                />

                <GeneratorStepper
                    step={step}
                    isProcessing={isProcessing}
                    onGoToStep={handleGoToStep}
                />
            </main>

            <div className="relative mx-auto max-w-[1600px] px-4 pb-20">

                <div className={cn(
                    "space-y-8 min-h-[500px] w-full",
                    step === 1 ? "max-w-6xl mx-auto" : "max-w-4xl mx-auto"
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
                            yearsError={yearsError}
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
                            themeLabel={themeLabel}
                            subjectLabel={subjectLabel}
                            indicators={subjectIndicators}
                            year={year}
                            sourceMode={sourceMode}
                            format={format}
                        />
                    )}

                </div>

            </div>

        </div>
    );
}

const STEPPER_STEPS = [
    { n: 1, label: "Sujet" },
    { n: 2, label: "Configuration" },
    { n: 3, label: "Résultat" }
];

function GeneratorStepper({
    step,
    isProcessing,
    onGoToStep
}: {
    step: number;
    isProcessing: boolean;
    onGoToStep: (target: number) => void;
}) {
    // Progression de la barre : 0% à l'étape 1, 50% à l'étape 2, 100% à l'étape 3.
    const progressPct = ((step - 1) / (STEPPER_STEPS.length - 1)) * 100;

    return (
        <div className="max-w-2xl mx-auto mt-8 mb-12 px-4">
            <div className="relative flex items-start justify-between">
                {/* Rail de fond + barre de progression animée */}
                <div className="absolute left-0 right-0 top-6 h-1 rounded-full bg-slate-200">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#1a4b8c] to-[#3bb3a9]"
                        initial={false}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>

                {STEPPER_STEPS.map(({ n: s, label }) => {
                    const isClickable = s < step && !isProcessing;
                    const isActive = step === s;
                    const isDone = step > s;
                    return (
                        <button
                            key={s}
                            onClick={() => isClickable && onGoToStep(s)}
                            disabled={!isClickable}
                            className={cn(
                                "relative z-10 flex flex-col items-center gap-2 group",
                                isClickable ? "cursor-pointer" : "cursor-default"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border-2 transition-all duration-300",
                                isActive
                                    ? "bg-[#1a4b8c] border-[#1a4b8c] text-white shadow-lg shadow-[#1a4b8c]/30 scale-110 ring-4 ring-[#f5c542]/40"
                                    : isDone
                                        ? "bg-[#4caf50] border-[#4caf50] text-white group-hover:bg-[#388e3c] group-hover:border-[#388e3c] group-hover:scale-105"
                                        : "bg-white border-slate-200 text-slate-400"
                            )}>
                                {isDone ? <Check className="w-6 h-6" strokeWidth={3} /> : s}
                            </div>
                            <span className={cn(
                                "text-xs font-semibold transition-colors duration-300",
                                isActive
                                    ? "text-[#1a4b8c]"
                                    : isDone
                                        ? "text-[#4caf50] group-hover:text-[#388e3c]"
                                        : "text-slate-400"
                            )}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
