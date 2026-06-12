import { CheckCircle2, Calendar, AlertTriangle, Database, ArrowLeft, Loader2, Globe, HardDrive, Info, ListChecks, Play, FileSpreadsheet } from "lucide-react";
import { Acronym } from "@/components/ui/Acronym";
import { cn } from "@/lib/utils";
import { MocaUpload } from "./MocaUpload";

interface Step2Props {
    year: string;
    yearEnd: string;
    onYearEndChange: (year: string) => void;
    availableYears: string[];
    yearsLoading: boolean;
    yearsError: string | null;
    onYearChange: (year: string) => void;

    format: string;
    onFormatChange: (format: string) => void;

    onBack: () => void;
    error: string | null;

    supportsOpenData: boolean;
    supportsMoca: boolean;
    sourceMode: 'opendata' | 'moca';
    onSourceChange: (mode: 'opendata' | 'moca') => void;
    autoSwitchNotice: string | null;

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
    yearEnd,
    onYearEndChange,
    availableYears,
    yearsLoading,
    yearsError,
    onYearChange,
    format,
    onFormatChange,
    onBack,
    error,
    supportsOpenData,
    supportsMoca,
    sourceMode,
    onSourceChange,
    autoSwitchNotice,
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
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 mt-6">

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

            <h2 className="text-2xl font-extrabold text-[#1a4b8c] tracking-tight">2. Configurez la génération</h2>

            {autoSwitchNotice && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-in fade-in">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-800">{autoSwitchNotice}</p>
                    </div>
                </div>
            )}

            {/* Subject summary: included indicators */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#3bb3a9]/10 text-[#3bb3a9]">
                        <ListChecks className="w-5 h-5" />
                    </span>
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
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#3bb3a9]/10 text-[#3bb3a9]">
                        <Database className="w-5 h-5" />
                    </span>
                    Source des données
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        onClick={() => onSourceChange('moca')}
                        className={cn(
                            "flex flex-col p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5",
                            sourceMode === 'moca'
                                ? "border-[#1a4b8c] bg-[#1a4b8c]/5 ring-2 ring-[#1a4b8c]/20 shadow-md"
                                : "border-slate-200 hover:border-[#1a4b8c]/40 hover:shadow-md"
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
                            "flex flex-col p-4 rounded-2xl border-2 text-left transition-all duration-200",
                            !supportsOpenData
                                ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                : sourceMode === 'opendata'
                                    ? "border-[#3bb3a9] bg-[#3bb3a9]/5 ring-2 ring-[#3bb3a9]/20 shadow-md hover:-translate-y-0.5"
                                    : "border-slate-200 hover:border-[#3bb3a9]/40 hover:shadow-md hover:-translate-y-0.5"
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
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#3bb3a9]/10 text-[#3bb3a9]">
                        <Calendar className="w-5 h-5" />
                    </span>
                    {format === 'consolidated' ? 'Plage d\'années' : 'Année'}
                </h3>

                {format === 'consolidated' && !yearsLoading && sortedYears.length > 0 && (
                    <div className="flex items-center gap-3 mb-3 text-sm">
                        <span className="text-gray-500 font-medium">De</span>
                        <select
                            value={year}
                            onChange={(e) => onYearChange(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold focus:border-[#1a4b8c] focus:outline-none"
                        >
                            {[...sortedYears].reverse().map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <span className="text-gray-500 font-medium">à</span>
                        <select
                            value={yearEnd || year}
                            onChange={(e) => onYearEndChange(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold focus:border-[#1a4b8c] focus:outline-none"
                        >
                            {[...sortedYears].reverse().map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                )}

                {yearsLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Vérification des données disponibles…
                    </div>
                ) : yearsError ? (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-sm text-red-600">
                        <div className="flex items-center gap-2 font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            Connexion impossible. Réessayez dans quelques instants.
                        </div>
                    </div>
                ) : format === 'consolidated' ? null : sortedYears.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                        {sortedYears.map((y) => (
                            <button
                                key={y}
                                onClick={() => onYearChange(y)}
                                className={cn(
                                    "px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 border-2",
                                    year === y
                                        ? "bg-[#1a4b8c] text-white border-[#1a4b8c] shadow-md scale-105"
                                        : "bg-white text-gray-600 border-slate-200 hover:border-[#3bb3a9] hover:text-[#3bb3a9] hover:-translate-y-0.5"
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
                            <p>Aucun fichier importé pour ce sujet. Importez les fichiers MOCA-O attendus (la liste précise des fichiers requis est affichée dans la zone d'import ci-dessus, avec leur statut) pour pouvoir générer.</p>
                        ) : supportsMoca ? (
                            <p>Les données publiques ne sont pas encore disponibles pour ce sujet. <button onClick={() => onSourceChange('moca')} className="underline font-bold hover:text-amber-900">Importez vos fichiers MOCA-O</button> pour générer.</p>
                        ) : (
                            <p>Les données ne sont pas encore disponibles pour ce sujet et cette configuration.</p>
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
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#3bb3a9]/10 text-[#3bb3a9]">
                        <FileSpreadsheet className="w-5 h-5" />
                    </span>
                    Format de sortie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        onClick={() => onFormatChange('zip')}
                        className={cn(
                            "p-4 rounded-2xl border-2 text-left transition-all duration-200",
                            format === 'zip' ? "border-[#3bb3a9] bg-[#3bb3a9]/5 ring-2 ring-[#3bb3a9]/20 shadow-md hover:-translate-y-0.5" : "border-slate-200 hover:border-[#3bb3a9]/40 hover:shadow-md hover:-translate-y-0.5"
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
                            "p-4 rounded-2xl border-2 text-left transition-all duration-200",
                            format === 'consolidated' ? "border-[#3bb3a9] bg-[#3bb3a9]/5 ring-2 ring-[#3bb3a9]/20 shadow-md hover:-translate-y-0.5" : "border-slate-200 hover:border-[#3bb3a9]/40 hover:shadow-md hover:-translate-y-0.5"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-800 text-sm">MOCA-O Consolidé (.xlsx)</span>
                            {format === 'consolidated' && <CheckCircle2 className="w-4 h-4 text-[#3bb3a9]" />}
                        </div>
                        <p className="text-xs text-gray-500">Multi-années, format natif client</p>
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
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-lg sticky bottom-4">
                {isProcessing && progress && (
                    <div className="mb-3 text-xs text-gray-600">
                        <div className="flex justify-between mb-1">
                            <span className="font-semibold">Génération {progress.current}/{progress.total}</span>
                            <span className="truncate ml-2 max-w-[220px]" title={progress.label}>{progress.label}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#1a4b8c] to-[#3bb3a9] transition-all duration-300"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
                <button
                    onClick={onGenerate}
                    disabled={!canGenerate || isProcessing}
                    className={cn(
                        "w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md",
                        canGenerate && !isProcessing
                            ? "bg-gradient-to-r from-[#3bb3a9] to-[#2f9a91] text-white hover:shadow-xl hover:shadow-[#3bb3a9]/30 hover:-translate-y-0.5"
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
