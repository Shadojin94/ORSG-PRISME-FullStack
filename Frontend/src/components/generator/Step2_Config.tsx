import { CheckCircle2, Calendar, AlertTriangle, Database, ArrowLeft, Loader2, Globe, HardDrive, Info, ListChecks, Play } from "lucide-react";
import { Acronym } from "@/components/ui/Acronym";
import { cn } from "@/lib/utils";
import { MocaUpload } from "./MocaUpload";

interface Step2Props {
    year: string;
    availableYears: string[];
    yearsLoading: boolean;
    onYearChange: (year: string) => void;

    format: string;
    onFormatChange: (format: string) => void;

    onBack: () => void;
    error: string | null;

    supportsOpenData: boolean;
    sourceMode: 'opendata' | 'moca';
    onSourceChange: (mode: 'opendata' | 'moca') => void;

    subjectLabel: string;
    themeLabel: string;
    indicators: Array<{ id: string; variable: string; label: string; source?: string; demoReady?: boolean }>;

    primaryDatasetId: string | null;
    onUploadComplete: () => void;

    onGenerate: () => void;
    isProcessing: boolean;
    progress: { current: number; total: number; label: string } | null;
    canGenerate: boolean;
    fileCount: number;
}

const CEPIDC_THEMES = [
    'mortalite_gen', 'mortalite_cardio', 'mortalite_tumeurs',
    'mortalite_respi', 'mortalite_neuro', 'mortalite_diabete', 'mortalite_covid'
];

export function Step2_Config({
    year,
    availableYears,
    yearsLoading,
    onYearChange,
    format,
    onFormatChange,
    onBack,
    error,
    supportsOpenData,
    sourceMode,
    onSourceChange,
    subjectLabel,
    themeLabel,
    indicators,
    primaryDatasetId,
    onUploadComplete,
    onGenerate,
    isProcessing,
    progress,
    canGenerate,
    fileCount
}: Step2Props) {

    const sortedYears = [...availableYears].sort((a, b) => parseInt(b) - parseInt(a));
    const isCepiDcSubject = indicators.some(d => CEPIDC_THEMES.includes(d.id));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Back button + breadcrumb */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a4b8c] transition-colors py-1.5 px-3 rounded-lg hover:bg-gray-100"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </button>
                <div className="text-sm text-gray-400">
                    <span className="text-[#1a4b8c] font-medium">{themeLabel}</span>
                    <span className="mx-1.5">/</span>
                    <span className="font-medium text-gray-600">{subjectLabel}</span>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-[#1a4b8c]">2. Configurez la génération</h2>

            {/* Subject summary: included indicators */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-[#3bb3a9]" />
                    Indicateurs inclus dans ce sujet
                    <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {indicators.length}
                    </span>
                </h3>
                <ul className="space-y-1.5">
                    {indicators.map((d, i) => (
                        <li key={`${d.id}-${d.variable}-${i}`} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle2 className={cn("w-4 h-4 shrink-0", d.demoReady ? "text-green-500" : "text-gray-300")} />
                            <span className="flex-1">{d.label}</span>
                            {d.source && (
                                <span className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                    {d.source.split(",")[0].split("/")[0].trim()}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Source Selection */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#3bb3a9]" />
                    Source des données
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        onClick={() => onSourceChange('moca')}
                        className={cn(
                            "flex flex-col p-4 rounded-xl border-2 text-left transition-all",
                            sourceMode === 'moca'
                                ? "border-[#1a4b8c] bg-[#1a4b8c]/5"
                                : "border-gray-200 hover:border-gray-300"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1.5 w-full">
                            <span className="font-bold text-gray-800 flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-[#1a4b8c]" />
                                <Acronym term="MOCA-O" />
                            </span>
                            {sourceMode === 'moca' && <CheckCircle2 className="w-5 h-5 text-[#1a4b8c]" />}
                        </div>
                        <p className="text-xs text-gray-500">
                            Fichiers internes CSV. Plus de données et thématiques disponibles.
                        </p>
                    </button>

                    <button
                        onClick={() => supportsOpenData && onSourceChange('opendata')}
                        disabled={!supportsOpenData}
                        className={cn(
                            "flex flex-col p-4 rounded-xl border-2 text-left transition-all",
                            !supportsOpenData
                                ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                : sourceMode === 'opendata'
                                    ? "border-[#3bb3a9] bg-[#3bb3a9]/5"
                                    : "border-gray-200 hover:border-gray-300"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1.5 w-full">
                            <span className="font-bold text-gray-800 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#3bb3a9]" />
                                Open Data
                                {supportsOpenData && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Recommandé</span>
                                )}
                            </span>
                            {sourceMode === 'opendata' && <CheckCircle2 className="w-5 h-5 text-[#3bb3a9]" />}
                        </div>
                        <p className="text-xs text-gray-500">
                            {supportsOpenData
                                ? "Sources publiques (INSEE, CépiDc...). Données plus récentes, génération automatique."
                                : "Non disponible pour ce sujet."
                            }
                        </p>
                    </button>
                </div>

                {sourceMode === 'moca' && (
                    <div className="mt-4">
                        <MocaUpload
                            datasetId={primaryDatasetId}
                            onUploadComplete={onUploadComplete}
                        />
                    </div>
                )}
            </div>

            {/* Year Selection */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#3bb3a9]" />
                    Année
                </h3>

                {yearsLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Chargement des années disponibles...
                    </div>
                ) : sortedYears.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {sortedYears.map((y) => (
                            <button
                                key={y}
                                onClick={() => onYearChange(y)}
                                className={cn(
                                    "px-4 py-2 rounded-full font-semibold text-sm transition-all border-2",
                                    year === y
                                        ? "bg-[#1a4b8c] text-white border-[#1a4b8c] shadow-md"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-[#3bb3a9] hover:text-[#3bb3a9]"
                                )}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-700">
                        <div className="flex items-center gap-2 font-bold mb-1">
                            <AlertTriangle className="w-4 h-4" />
                            Aucune donnée {sourceMode === 'moca' ? 'MOCA-O' : 'Open Data'} disponible
                        </div>
                        {sourceMode === 'moca' && supportsOpenData ? (
                            <p>Aucun fichier CSV trouvé. Importez vos fichiers ci-dessus ou <button onClick={() => onSourceChange('opendata')} className="underline font-bold hover:text-amber-900">basculez sur Open Data</button>.</p>
                        ) : sourceMode === 'moca' ? (
                            <p>Aucun fichier CSV trouvé pour ce sujet. Importez vos fichiers MOCA-O dans la zone ci-dessus.</p>
                        ) : (
                            <p>Les données Open Data ne sont pas encore disponibles pour ce sujet et cette configuration.</p>
                        )}
                    </div>
                )}
            </div>

            {isCepiDcSubject && sourceMode === 'opendata' && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 animate-in fade-in">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-amber-800">
                            <p className="font-bold mb-1">Données communales non disponibles pour la mortalité</p>
                            <p className="text-amber-700">
                                La source CépiDc ne fournit les données de mortalité qu'au <strong>niveau régional</strong>.
                                Les fichiers générés contiendront :
                            </p>
                            <ul className="mt-1.5 ml-4 list-disc text-amber-700 space-y-0.5">
                                <li><strong>Communes</strong> : effectifs vides, taux = taux régional Guyane (proxy)</li>
                                <li><strong>Régions, DOM, France</strong> : données réelles</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Format Selection */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-3">Format de sortie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        onClick={() => onFormatChange('zip')}
                        className={cn(
                            "p-3 rounded-xl border-2 text-left transition-all",
                            format === 'zip' ? "border-[#3bb3a9] bg-[#3bb3a9]/5" : "border-gray-200 hover:border-gray-300"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-800 text-sm">Pack Complet (.zip)</span>
                            {format === 'zip' && <CheckCircle2 className="w-4 h-4 text-[#3bb3a9]" />}
                        </div>
                        <p className="text-xs text-gray-500">Tous les niveaux géographiques</p>
                    </button>
                    <button
                        onClick={() => onFormatChange('consolidated')}
                        className={cn(
                            "p-3 rounded-xl border-2 text-left transition-all opacity-50 cursor-not-allowed",
                            "border-gray-200"
                        )}
                        disabled
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-800 text-sm">Consolidé</span>
                            <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold">BIENTÔT</span>
                        </div>
                        <p className="text-xs text-gray-500">Un seul fichier Excel</p>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 font-bold text-red-700 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Erreur
                    </div>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
            )}

            {/* Inline CTA: Générer */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm sticky bottom-4">
                {isProcessing && progress && (
                    <div className="mb-3 text-xs text-gray-600">
                        <div className="flex justify-between mb-1">
                            <span className="font-semibold">Génération {progress.current}/{progress.total}</span>
                            <span className="truncate ml-2 max-w-[220px]" title={progress.label}>{progress.label}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#3bb3a9] transition-all duration-300"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
                <button
                    onClick={onGenerate}
                    disabled={!canGenerate || isProcessing}
                    className={cn(
                        "w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md",
                        canGenerate && !isProcessing
                            ? "bg-[#3bb3a9] text-white hover:bg-[#2f9a91] hover:shadow-lg hover:-translate-y-0.5"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Génération en cours...
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" />
                            {fileCount > 1 ? `Générer ce sujet (${fileCount} fichiers)` : 'Générer ce sujet'}
                        </>
                    )}
                </button>
                {!canGenerate && !isProcessing && (
                    <p className="text-[11px] text-gray-500 text-center mt-2">
                        Sélectionnez une année disponible pour lancer la génération.
                    </p>
                )}
            </div>
        </div>
    );
}
