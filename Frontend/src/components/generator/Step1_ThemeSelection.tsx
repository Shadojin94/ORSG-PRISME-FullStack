import { useState } from "react";
import { cn } from "@/lib/utils";
import { BDI_THEMES } from "@/data/bdi_themes";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";

interface Step1Props {
    onDatasetSelect: (themeId: string, subThemeId: string, datasetId: string) => void;
    selectedThemeId: string | null;
    selectedSubThemeId: string | null;
    selectedDatasetId: string | null;
}

export function Step1_ThemeSelection({
    onDatasetSelect,
    selectedThemeId,
    selectedSubThemeId,
    selectedDatasetId
}: Step1Props) {
    const [expandedThemeId, setExpandedThemeId] = useState<string | null>(selectedThemeId);
    const [expandedSubThemeId, setExpandedSubThemeId] = useState<string | null>(selectedSubThemeId);

    const handleThemeClick = (id: string) => {
        if (expandedThemeId === id) {
            setExpandedThemeId(null);
        } else {
            setExpandedThemeId(id);
        }
    };

    const handleSubThemeClick = (id: string) => {
        if (expandedSubThemeId === id) {
            setExpandedSubThemeId(null);
        } else {
            setExpandedSubThemeId(id);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1a4b8c] mb-6">1. Sélectionnez vos données</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BDI_THEMES.map((theme) => {
                    const isExpanded = expandedThemeId === theme.id;
                    const isSelected = selectedThemeId === theme.id;
                    const Icon = theme.icon;

                    return (
                        <div
                            key={theme.id}
                            className={cn(
                                "border rounded-xl transition-all duration-300 bg-white overflow-hidden shadow-sm hover:shadow-md",
                                isExpanded ? "ring-2 ring-[#3bb3a9]" : "border-gray-200"
                            )}
                        >
                            {/* Theme Header Card */}
                            <button
                                onClick={() => handleThemeClick(theme.id)}
                                className="w-full text-left p-4 flex items-start gap-4"
                            >
                                <div className={cn(
                                    "p-3 rounded-lg text-white shrink-0",
                                    theme.bgColor || "bg-gray-500"
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800 text-lg">{theme.shortTitle}</h3>
                                        <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isExpanded && "rotate-180")} />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {theme.description}
                                    </p>
                                </div>
                            </button>

                            {/* Expanded Content (Sub-themes) */}
                            {isExpanded && (
                                <div className="bg-gray-50 border-t border-gray-100 p-4 space-y-2 animate-in slide-in-from-top-2">
                                    {theme.subThemes?.map((subTheme) => {
                                        const isSubExpanded = expandedSubThemeId === subTheme.id;
                                        const hasDirectDatasets = subTheme.datasets && subTheme.datasets.length > 0;
                                        const hasNestedSubThemes = subTheme.subThemes && subTheme.subThemes.length > 0;

                                        // Helper to render datasets list
                                        const renderDatasets = (datasets: any[]) => (
                                            <div className="pl-4 space-y-1 mt-2 mb-2 border-l-2 border-gray-200 ml-2">
                                                {datasets.map((ds) => {
                                                    const isDsSelected = selectedDatasetId === ds.id;
                                                    return (
                                                        <button
                                                            key={ds.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDatasetSelect(theme.id, subTheme.id, ds.id);
                                                            }}
                                                            className={cn(
                                                                "w-full text-left py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-between group",
                                                                isDsSelected
                                                                    ? "bg-[#3bb3a9]/10 text-[#2f9a91] font-bold"
                                                                    : "text-gray-600 hover:bg-white hover:text-[#3bb3a9]"
                                                            )}
                                                        >
                                                            <span>{ds.label}</span>
                                                            {ds.demoReady && (
                                                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium ml-2 shrink-0">
                                                                    Open Data
                                                                </span>
                                                            )}
                                                            {isDsSelected && <CheckCircle2 className="w-4 h-4" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );

                                        return (
                                            <div key={subTheme.id} className="rounded-lg bg-white border border-gray-100 overflow-hidden">
                                                <button
                                                    onClick={() => handleSubThemeClick(subTheme.id)}
                                                    className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", isSubExpanded ? "bg-[#3bb3a9]" : "bg-gray-300")} />
                                                        {subTheme.title}
                                                    </span>
                                                    {(hasDirectDatasets || hasNestedSubThemes) && (
                                                        <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", isSubExpanded && "rotate-90")} />
                                                    )}
                                                </button>

                                                {isSubExpanded && (
                                                    <div className="px-3 pb-3">
                                                        {/* Direct Datasets */}
                                                        {hasDirectDatasets && renderDatasets(subTheme.datasets)}

                                                        {/* Nested Sub-themes (Level 3) */}
                                                        {hasNestedSubThemes && (
                                                            <div className="space-y-2 mt-1 pl-4">
                                                                {subTheme.subThemes.map((nested: any) => (
                                                                    <div key={nested.id}>
                                                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2">
                                                                            {nested.title}
                                                                        </div>
                                                                        {nested.datasets && renderDatasets(nested.datasets)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
