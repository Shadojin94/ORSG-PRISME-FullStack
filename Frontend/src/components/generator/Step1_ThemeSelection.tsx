import { useState } from "react";
import { cn } from "@/lib/utils";
import { BDI_THEMES } from "@/data/bdi_themes";
import { ChevronDown, Database, Globe, BarChart3, ArrowRight, Upload } from "lucide-react";
import { Acronym } from "@/components/ui/Acronym";

const OPEN_DATA_SUPPORTED_THEMES = [
    'educ', 'pers_sup65ans_seules', 'familles_mono', 'pop_inf3ans',
    'pers_menages', 'types_menages', 'alloc', 'revenu', 'densite',
    'route', 'mortalite_gen', 'mortalite_cardio', 'mortalite_tumeurs',
    'mortalite_respi', 'mortalite_neuro', 'mortalite_diabete', 'mortalite_covid'
];

interface Step1Props {
    onSubjectSelect: (themeId: string, subThemeId: string) => void;
    selectedThemeId: string | null;
    selectedSubThemeId: string | null;
}

const isCalculated = (d: any) => d?.tool === "Calcul";
const isSelectable = (d: any) => !isCalculated(d);
const isOpenData = (d: any) => OPEN_DATA_SUPPORTED_THEMES.includes(d?.id);

function flattenSubThemes(items: any[]): any[] {
    const out: any[] = [];
    for (const item of items) {
        if (item.datasets && item.datasets.length > 0) out.push(item);
        if (item.subThemes) out.push(...flattenSubThemes(item.subThemes));
    }
    return out;
}

function uniqueDatasetIds(datasets: any[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const d of datasets) {
        if (!isSelectable(d)) continue;
        if (!seen.has(d.id)) { seen.add(d.id); out.push(d.id); }
    }
    return out;
}

function countReady(subjects: any[]): number {
    let c = 0;
    for (const s of subjects) {
        if (uniqueDatasetIds((s.datasets || []).filter((d: any) => d.demoReady)).length > 0) c++;
    }
    return c;
}

function globalStats() {
    let readySubjects = 0, totalSubjects = 0, openDataDs = 0, mocaDs = 0;
    for (const theme of BDI_THEMES as any[]) {
        const subs = flattenSubThemes(theme.subThemes || []);
        for (const sub of subs) {
            totalSubjects++;
            const ds = (sub.datasets || []).filter(isSelectable);
            const uniq = uniqueDatasetIds(ds);
            const hasReady = uniq.some(id => ds.find((d: any) => d.id === id)?.demoReady);
            if (hasReady) readySubjects++;
            for (const id of uniq) {
                const sample = ds.find((d: any) => d.id === id);
                if (!sample?.demoReady) continue;
                if (isOpenData(sample)) openDataDs++;
                else mocaDs++;
            }
        }
    }
    return { readySubjects, totalSubjects, openDataDs, mocaDs };
}

export function Step1_ThemeSelection({
    onSubjectSelect,
    selectedThemeId,
    selectedSubThemeId
}: Step1Props) {
    const [expandedThemeId, setExpandedThemeId] = useState<string | null>(selectedThemeId);

    const handleThemeClick = (id: string) => {
        setExpandedThemeId(expandedThemeId === id ? null : id);
    };

    const renderSubject = (sub: any, themeId: string) => {
        const datasets = (sub.datasets || []).filter(isSelectable);
        const uniqIds = uniqueDatasetIds(datasets);
        const readyDs = uniqIds.filter(id => datasets.find((d: any) => d.id === id)?.demoReady);
        const hasData = readyDs.length > 0;
        const isSelected = selectedSubThemeId === sub.id;
        const hasAnyDataset = uniqIds.length > 0;

        return (
            <button
                key={sub.id}
                onClick={() => hasAnyDataset && onSubjectSelect(themeId, sub.id)}
                disabled={!hasAnyDataset}
                className={cn(
                    "w-full text-left rounded-lg border-2 transition-all p-4 group",
                    isSelected
                        ? "border-[#3bb3a9] bg-[#3bb3a9]/5 shadow-sm"
                        : hasData
                            ? "border-gray-200 bg-white hover:border-[#3bb3a9]/60 hover:shadow-sm cursor-pointer"
                            : hasAnyDataset
                                ? "border-amber-200 bg-amber-50/40 hover:border-amber-400 hover:bg-amber-50 cursor-pointer"
                                : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                )}
            >
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm">{sub.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            {datasets.length} indicateur{datasets.length > 1 ? 's' : ''}
                            {uniqIds.length !== datasets.length && ` · ${uniqIds.length} jeu${uniqIds.length > 1 ? 'x' : ''} de données`}
                        </p>
                    </div>
                    {hasData ? (
                        <span className={cn(
                            "shrink-0 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                            isSelected ? "opacity-100 text-[#3bb3a9]" : "text-[#1a4b8c]"
                        )}>
                            Choisir
                            <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    ) : hasAnyDataset ? (
                        <span className="shrink-0 text-[10px] font-semibold flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                            <Upload className="w-3 h-3" />
                            Import requis
                        </span>
                    ) : null}
                </div>

                {/* Indicators as info pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {datasets.map((ds: any, idx: number) => {
                        const dsIsOpenData = isOpenData(ds);
                        return (
                            <span
                                key={`${ds.id}-${ds.variable}-${idx}`}
                                title={`${ds.label} · ${ds.source || ''}`}
                                className={cn(
                                    "text-[10px] px-2 py-1 rounded-full font-medium flex items-center gap-1 border",
                                    !ds.demoReady
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : dsIsOpenData
                                            ? "bg-blue-50 text-blue-700 border-blue-100"
                                            : "bg-green-50 text-green-700 border-green-100"
                                )}
                            >
                                {ds.demoReady && (dsIsOpenData
                                    ? <Globe className="w-2.5 h-2.5" />
                                    : <Database className="w-2.5 h-2.5" />)}
                                <span className="truncate max-w-[180px]">{ds.label}</span>
                            </span>
                        );
                    })}
                </div>
            </button>
        );
    };

    const stats = globalStats();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-[#1a4b8c]">1. Choisissez un sujet</h2>
            </div>

            {/* Summary stats bar */}
            <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-gray-800">{stats.readySubjects}<span className="text-sm font-normal text-gray-400">/{stats.totalSubjects}</span></div>
                        <div className="text-[11px] text-gray-500">Sujets disponibles</div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                        <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-blue-600">{stats.openDataDs}</div>
                        <div className="text-[11px] text-gray-500">Open Data (<Acronym term="INSEE" />, <Acronym term="CépiDc" />...)</div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                        <Database className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-green-600">{stats.mocaDs}</div>
                        <div className="text-[11px] text-gray-500"><Acronym term="MOCA-O" /> (CSV locaux)</div>
                    </div>
                </div>
            </div>

            {/* Theme Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(BDI_THEMES as any[]).map((theme) => {
                    const isExpanded = expandedThemeId === theme.id;
                    const Icon = theme.icon;
                    const subjects = flattenSubThemes(theme.subThemes || []);
                    const ready = countReady(subjects);
                    const total = subjects.length;

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
                            <button
                                onClick={() => handleThemeClick(theme.id)}
                                className="w-full text-left p-4 flex items-center gap-4"
                            >
                                <div className={cn("p-2.5 rounded-lg text-white shrink-0", theme.bgColor || "bg-gray-500")}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-gray-800 leading-snug" title={theme.title || theme.shortTitle}>{theme.shortTitle}</h3>
                                        {ready > 0 && (
                                            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                                                {ready}/{total} sujets
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{theme.description}</p>
                                </div>
                                <ChevronDown className={cn("w-5 h-5 text-gray-400 shrink-0 transition-transform", isExpanded && "rotate-180")} />
                            </button>

                            {isExpanded && (
                                <div className="bg-gray-50 border-t border-gray-100 p-3 grid grid-cols-1 md:grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {subjects.map((sub: any) => renderSubject(sub, theme.id))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
