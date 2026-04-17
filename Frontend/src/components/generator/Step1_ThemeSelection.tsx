import { useState } from "react";
import { cn } from "@/lib/utils";
import { BDI_THEMES } from "@/data/bdi_themes";
import { ChevronDown, ChevronRight, Database, Upload } from "lucide-react";

interface Step1Props {
    onDatasetSelect: (themeId: string, subThemeId: string, datasetId: string, variable: string) => void;
    selectedThemeId: string | null;
    selectedSubThemeId: string | null;
    selectedDatasetId: string | null;
    selectedDatasetVariable: string | null;
}

const isCalculated = (d: any) => d?.tool === "Calcul";
const isSelectable = (d: any) => !isCalculated(d);

function countReadyDatasets(items: any[]): number {
    let count = 0;
    for (const item of items) {
        if (item.datasets) {
            count += item.datasets.filter((d: any) => isSelectable(d) && d.demoReady).length;
        }
        if (item.subThemes) {
            count += countReadyDatasets(item.subThemes);
        }
    }
    return count;
}
function countAllDatasets(items: any[]): number {
    let count = 0;
    for (const item of items) {
        if (item.datasets) count += item.datasets.filter((d: any) => isSelectable(d)).length;
        if (item.subThemes) count += countAllDatasets(item.subThemes);
    }
    return count;
}

export function Step1_ThemeSelection({
    onDatasetSelect,
    selectedThemeId,
    selectedDatasetId,
    selectedDatasetVariable
}: Step1Props) {
    const [expandedThemeId, setExpandedThemeId] = useState<string | null>(selectedThemeId);
    const [expandedSubThemeId, setExpandedSubThemeId] = useState<string | null>(null);

    const handleThemeClick = (id: string) => {
        setExpandedThemeId(expandedThemeId === id ? null : id);
        setExpandedSubThemeId(null);
    };

    const handleSubThemeClick = (subTheme: any, themeId: string) => {
        const id = subTheme.id;
        if (expandedSubThemeId === id) {
            setExpandedSubThemeId(null);
            return;
        }
        setExpandedSubThemeId(id);

        // Auto-select if only 1 selectable dataset
        const allDs: any[] = [];
        if (subTheme.datasets) allDs.push(...subTheme.datasets);
        if (subTheme.subThemes) {
            for (const nested of subTheme.subThemes) {
                if (nested.datasets) allDs.push(...nested.datasets);
            }
        }
        const selectable = allDs.filter(isSelectable);
        if (selectable.length === 1) {
            onDatasetSelect(themeId, id, selectable[0].id, selectable[0].variable);
        }
    };

    const renderDatasetButton = (ds: any, themeId: string, subThemeId: string) => {
        if (isCalculated(ds)) return null;
        const isSelected = selectedDatasetId === ds.id && selectedDatasetVariable === ds.variable;
        return (
            <button
                key={`${subThemeId}::${ds.id}::${ds.variable}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onDatasetSelect(themeId, subThemeId, ds.id, ds.variable);
                }}
                className={cn(
                    "w-full text-left py-2.5 px-3 rounded-lg text-sm transition-all flex items-center justify-between gap-2",
                    isSelected
                        ? "bg-[#3bb3a9]/10 text-[#2f9a91] font-semibold ring-1 ring-[#3bb3a9]/30"
                        : ds.demoReady
                            ? "text-gray-700 hover:bg-[#3bb3a9]/5 hover:text-[#2f9a91] cursor-pointer"
                            : "text-gray-700 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
                )}
            >
                <span className="flex-1">{ds.label}</span>
                <span className="flex items-center gap-1.5 shrink-0">
                    {ds.demoReady ? (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            Disponible
                        </span>
                    ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            Import requis
                        </span>
                    )}
                </span>
            </button>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-[#1a4b8c]">1. Choisissez un indicateur</h2>
                <span className="text-sm text-gray-400">
                    {countReadyDatasets(BDI_THEMES as any[])} indicateurs disponibles
                </span>
            </div>

            {/* Theme Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(BDI_THEMES as any[]).map((theme) => {
                    const isExpanded = expandedThemeId === theme.id;
                    const Icon = theme.icon;
                    const readyCount = countReadyDatasets(theme.subThemes || []);
                    const totalCount = countAllDatasets(theme.subThemes || []);

                    return (
                        <div
                            key={theme.id}
                            className={cn(
                                "border rounded-xl transition-all duration-200 bg-white overflow-hidden",
                                isExpanded
                                    ? "ring-2 ring-[#3bb3a9] shadow-lg md:col-span-2"
                                    : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                            )}
                        >
                            {/* Theme Header */}
                            <button
                                onClick={() => handleThemeClick(theme.id)}
                                className="w-full text-left p-4 flex items-center gap-4"
                            >
                                <div className={cn("p-2.5 rounded-lg text-white shrink-0", theme.bgColor || "bg-gray-500")}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-800">{theme.shortTitle}</h3>
                                        {readyCount > 0 && (
                                            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                                                {readyCount}/{totalCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{theme.description}</p>
                                </div>
                                <ChevronDown className={cn("w-5 h-5 text-gray-400 shrink-0 transition-transform", isExpanded && "rotate-180")} />
                            </button>

                            {/* Expanded: Sub-themes */}
                            {isExpanded && (
                                <div className="bg-gray-50 border-t border-gray-100 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {theme.subThemes?.map((sub: any) => {
                                        const isSubExpanded = expandedSubThemeId === sub.id;
                                        const hasContent = (sub.datasets && sub.datasets.length > 0) || (sub.subThemes && sub.subThemes.length > 0);

                                        return (
                                            <div key={sub.id} className={cn(
                                                "rounded-lg bg-white border overflow-hidden transition-all",
                                                isSubExpanded ? "border-[#3bb3a9]/30 shadow-sm" : "border-gray-100"
                                            )}>
                                                <button
                                                    onClick={() => handleSubThemeClick(sub, theme.id)}
                                                    className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", isSubExpanded ? "bg-[#3bb3a9]" : "bg-gray-300")} />
                                                        {sub.title}
                                                    </span>
                                                    {hasContent && (
                                                        <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", isSubExpanded && "rotate-90")} />
                                                    )}
                                                </button>

                                                {isSubExpanded && (
                                                    <div className="px-3 pb-3 space-y-1">
                                                        {/* Direct datasets */}
                                                        {sub.datasets?.map((ds: any) => renderDatasetButton(ds, theme.id, sub.id))}

                                                        {/* Nested sub-themes (Level 3) */}
                                                        {sub.subThemes?.map((nested: any) => (
                                                            <div key={nested.id} className="mt-2">
                                                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-3">
                                                                    {nested.title}
                                                                </div>
                                                                {nested.datasets?.map((ds: any) => renderDatasetButton(ds, theme.id, nested.id))}
                                                            </div>
                                                        ))}
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
