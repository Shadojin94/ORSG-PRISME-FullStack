import { FileSpreadsheet, Info, CheckCircle2, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { BDI_THEMES } from "@/data/bdi_themes";

interface SidebarSummaryProps {
    step: number;
    selectedThemeId: string | null;
    selectedSubThemeId: string | null;
    selectedDatasetId: string | null;
    year: string;
    format: string;
    isProcessing: boolean;
    onGenerate: () => void;
    canGenerate: boolean;
    isOpenDataMode: boolean;
}

export function SidebarSummary({
    step,
    selectedThemeId,
    selectedSubThemeId,
    selectedDatasetId,
    year,
    format,
    isProcessing,
    onGenerate,
    canGenerate,
    isOpenDataMode
}: SidebarSummaryProps) {

    const selectedTheme = selectedThemeId ? BDI_THEMES.find(t => t.id === selectedThemeId) : null;

    // Helper to find sub-theme and dataset label
    // This is a bit complex because of nesting. 
    // We traverse BDI_THEMES to find the names.
    let subThemeTitle = "--";
    let datasetLabel = "--";

    if (selectedTheme) {
        // Recursive search for subtheme title
        const findSubThemeTitle = (items: any[], id: string): string | null => {
            for (const item of items) {
                if (item.id === id) return item.title;
                if (item.subThemes) {
                    const found = findSubThemeTitle(item.subThemes, id);
                    if (found) return found;
                }
            }
            return null;
        };
        if (selectedSubThemeId) {
            subThemeTitle = findSubThemeTitle(selectedTheme.subThemes || [], selectedSubThemeId) || "--";
        }

        // Recursive search for dataset label
        const findDatasetLabel = (items: any[], id: string): string | null => {
            for (const item of items) {
                if (item.datasets) {
                    const ds = item.datasets.find((d: any) => d.id === id);
                    if (ds) return ds.label;
                }
                if (item.subThemes) {
                    const found = findDatasetLabel(item.subThemes, id);
                    if (found) return found;
                }
            }
            // Check root datasets if any
            if (selectedTheme.datasets) {
                const ds = selectedTheme.datasets.find((d: any) => d.id === id);
                if (ds) return ds.label;
            }
            return null;
        };
        if (selectedDatasetId) {
            datasetLabel = findDatasetLabel(selectedTheme.subThemes || [], selectedDatasetId) || "--";
        }
    }

    return (
        <div className="flex flex-col gap-6 sticky top-8 self-start z-30">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black/5 flex flex-col transition-all duration-300" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
                {/* Header */}
                <div className="bg-[#1a4b8c] p-5 text-white flex justify-between items-center z-10 rounded-t-2xl shrink-0">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                        <FileSpreadsheet className="w-5 h-5" /> Récapitulatif
                    </h3>
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        {new Date().getFullYear()}
                    </span>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto">

                    {/* Theme */}
                    <div className={cn("relative pl-6 border-l-2 transition-all duration-300", selectedTheme ? "border-[#3bb3a9]" : "border-gray-200")}>
                        <span className={cn("absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white", selectedTheme ? "border-[#3bb3a9]" : "border-gray-300")} />
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Thématique</p>
                        {selectedTheme ? (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2 font-bold text-[#1a4b8c]">
                                    {selectedTheme.icon && <selectedTheme.icon className="w-4 h-4" />}
                                    {selectedTheme.shortTitle}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 italic">En attente...</p>
                        )}
                    </div>

                    {/* Sub-Theme */}
                    <div className={cn("relative pl-6 border-l-2 transition-all duration-300", selectedSubThemeId ? "border-[#3bb3a9]" : "border-gray-200")}>
                        <span className={cn("absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white", selectedSubThemeId ? "border-[#3bb3a9]" : "border-gray-300")} />
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Sujet</p>
                        {selectedSubThemeId ? (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="font-bold text-gray-800">{subThemeTitle}</div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 italic">--</p>
                        )}
                    </div>

                    {/* Dataset */}
                    <div className={cn("relative pl-6 border-l-2 transition-all duration-300", selectedDatasetId ? "border-[#3bb3a9]" : "border-gray-200")}>
                        <span className={cn("absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white", selectedDatasetId ? "border-[#3bb3a9]" : "border-gray-300")} />
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Indicateur</p>
                        {selectedDatasetId ? (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <div className="font-bold text-[#1a4b8c] text-sm">{datasetLabel}</div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 italic">--</p>
                        )}
                    </div>

                    {/* Open Data Badge */}
                    {isOpenDataMode && selectedDatasetId && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700 mt-2">
                            <span className="font-bold block mb-1">ℹ️ Mode Open Data</span>
                            Données issues des sources publiques (INSEE, CepiDc, etc.)
                        </div>
                    )}

                    {/* Config (only if Step >= 2) */}
                    {step >= 2 && (
                        <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Année</span>
                                <span className="font-bold text-[#1a4b8c]">{year || "--"}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Format</span>
                                <span className="font-bold text-[#1a4b8c] uppercase">{format === 'zip' ? 'Pack Complet' : format}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
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
                                Générer le fichier
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Helper Box */}
            <div className="bg-[#e8f5e9] rounded-xl p-5 border border-[#c8e6c9]">
                <h4 className="flex items-center gap-2 font-bold text-[#2e7d32] mb-2 text-sm">
                    <Info className="w-4 h-4" /> Besoin d'aide ?
                </h4>
                <p className="text-xs text-[#1b5e20] leading-relaxed">
                    Si vous ne trouvez pas l'indicateur souhaité, vérifiez les badges Open Data ou contactez l'administration.
                </p>
            </div>
        </div>
    );
}

