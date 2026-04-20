import { FileSpreadsheet, Info, CheckCircle2, Loader2, Play, Pencil, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Acronym } from "@/components/ui/Acronym";
import type { SubjectDataset } from "@/pages/GeneratorPage";

interface SidebarSummaryProps {
    step: number;
    themeLabel: string;
    subjectLabel: string;
    subjectDatasets: SubjectDataset[];
    year: string;
    format: string;
    isProcessing: boolean;
    progress: { current: number; total: number; label: string } | null;
    onGenerate: () => void;
    onGoToStep: (step: number) => void;
    canGenerate: boolean;
    isOpenDataMode: boolean;
}

export function SidebarSummary({
    step,
    themeLabel,
    subjectLabel,
    subjectDatasets,
    year,
    format,
    isProcessing,
    progress,
    onGenerate,
    onGoToStep,
    canGenerate,
    isOpenDataMode
}: SidebarSummaryProps) {

    const hasSubject = !!subjectLabel;
    const canGoToStep1 = step > 1 && !isProcessing;
    const canGoToStep2 = step > 2 && !isProcessing;

    const fileCount = subjectDatasets.length;

    return (
        <div className="flex flex-col gap-6 sticky top-8 self-start z-30">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black/5 flex flex-col transition-all duration-300" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
                <div className="bg-[#1a4b8c] p-5 text-white flex justify-between items-center z-10 rounded-t-2xl shrink-0">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                        <FileSpreadsheet className="w-5 h-5" /> Récapitulatif
                    </h3>
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        {new Date().getFullYear()}
                    </span>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">

                    {step === 1 && !hasSubject ? (
                        <div className="flex flex-col items-center text-center py-6 px-4 text-gray-400">
                            <ClipboardList className="w-10 h-10 mb-3 text-gray-300" />
                            <p className="text-sm font-medium text-gray-500">Vos choix apparaîtront ici</p>
                            <p className="text-xs mt-1 leading-relaxed">
                                Sélectionnez une thématique puis un sujet pour composer votre fichier.
                            </p>
                        </div>
                    ) : (
                    <>
                    <div className={cn("relative pl-6 border-l-2 transition-all duration-300", hasSubject ? "border-[#3bb3a9]" : "border-gray-200")}>
                        <span className={cn("absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white", hasSubject ? "border-[#3bb3a9]" : "border-gray-300")} />
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thématique</p>
                            {canGoToStep1 && (
                                <button onClick={() => onGoToStep(1)} className="text-[10px] text-[#3bb3a9] hover:text-[#2f9a91] flex items-center gap-0.5 hover:underline">
                                    <Pencil className="w-3 h-3" /> Modifier
                                </button>
                            )}
                        </div>
                        {themeLabel ? (
                            <div
                                className={cn("bg-gray-50 p-3 rounded-lg border border-gray-100", canGoToStep1 && "cursor-pointer hover:border-[#3bb3a9]/40 hover:bg-[#3bb3a9]/5 transition-colors")}
                                onClick={() => canGoToStep1 && onGoToStep(1)}
                            >
                                <div className="font-bold text-[#1a4b8c]">{themeLabel}</div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 italic">En attente...</p>
                        )}
                    </div>

                    <div className={cn("relative pl-6 border-l-2 transition-all duration-300", hasSubject ? "border-[#3bb3a9]" : "border-gray-200")}>
                        <span className={cn("absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white", hasSubject ? "border-[#3bb3a9]" : "border-gray-300")} />
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sujet</p>
                            {canGoToStep1 && hasSubject && (
                                <button onClick={() => onGoToStep(1)} className="text-[10px] text-[#3bb3a9] hover:text-[#2f9a91] flex items-center gap-0.5 hover:underline">
                                    <Pencil className="w-3 h-3" /> Modifier
                                </button>
                            )}
                        </div>
                        {hasSubject ? (
                            <div
                                className={cn("bg-gray-50 p-3 rounded-lg border border-gray-100", canGoToStep1 && "cursor-pointer hover:border-[#3bb3a9]/40 hover:bg-[#3bb3a9]/5 transition-colors")}
                                onClick={() => canGoToStep1 && onGoToStep(1)}
                            >
                                <div className="font-bold text-gray-800 text-sm">{subjectLabel}</div>
                                {fileCount > 0 && (
                                    <div className="mt-1.5 text-[11px] text-gray-500">
                                        {fileCount} fichier{fileCount > 1 ? 's' : ''} à générer
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 italic">--</p>
                        )}
                    </div>

                    {step >= 2 && (
                        <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 space-y-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Configuration</span>
                                {canGoToStep2 && (
                                    <button onClick={() => onGoToStep(2)} className="text-[10px] text-[#3bb3a9] hover:text-[#2f9a91] flex items-center gap-0.5 hover:underline">
                                        <Pencil className="w-3 h-3" /> Modifier
                                    </button>
                                )}
                            </div>
                            <div
                                className={cn("space-y-2 p-3 rounded-lg border border-gray-100 bg-gray-50", canGoToStep2 && "cursor-pointer hover:border-[#3bb3a9]/40 hover:bg-[#3bb3a9]/5 transition-colors")}
                                onClick={() => canGoToStep2 && onGoToStep(2)}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Source</span>
                                    <span className={cn(
                                        "font-bold text-xs px-2 py-0.5 rounded-full",
                                        isOpenDataMode
                                            ? "bg-green-100 text-green-700"
                                            : "bg-blue-100 text-[#1a4b8c]"
                                    )}>
                                        {isOpenDataMode ? "Open Data" : <Acronym term="MOCA-O" />}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Année</span>
                                    <span className="font-bold text-[#1a4b8c]">{year || "--"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Format</span>
                                    <span className="font-bold text-[#1a4b8c]">{format === 'zip' ? 'Pack Complet' : format}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    </>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    {isProcessing && progress && (
                        <div className="mb-3 text-xs text-gray-600">
                            <div className="flex justify-between mb-1">
                                <span className="font-semibold">Génération {progress.current}/{progress.total}</span>
                                <span className="truncate ml-2 max-w-[160px]" title={progress.label}>{progress.label}</span>
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
                        disabled={!canGenerate || isProcessing || step === 3}
                        className={cn(
                            "w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md",
                            canGenerate && !isProcessing && step !== 3
                                ? "bg-[#3bb3a9] text-white hover:bg-[#2f9a91] hover:shadow-lg hover:-translate-y-0.5"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Génération...
                            </>
                        ) : step === 3 ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Terminé
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 fill-current" />
                                {fileCount > 1 ? `Générer ce sujet (${fileCount} fichiers)` : 'Générer ce sujet'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-[#e8f5e9] rounded-xl p-5 border border-[#c8e6c9]">
                <h4 className="flex items-center gap-2 font-bold text-[#2e7d32] mb-2 text-sm">
                    <Info className="w-4 h-4" /> Besoin d'aide ?
                </h4>
                <p className="text-xs text-[#1b5e20] leading-relaxed">
                    Un sujet regroupe plusieurs indicateurs. La génération produit un fichier Excel par jeu de données.
                </p>
            </div>
        </div>
    );
}
