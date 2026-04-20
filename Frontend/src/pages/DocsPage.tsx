import { useState, useEffect, useCallback } from "react"
import { BDI_THEMES } from "@/data/bdi_themes"
import { cn } from "@/lib/utils"
import { Search, ChevronRight, ChevronDown, Database, FileSpreadsheet, Loader2 } from "lucide-react"
import { checkCsvAvailability } from "@/services/api"
import { Acronym } from "@/components/ui/Acronym"

// Collect unique sources from BDI_THEMES
function countUniqueSources(): number {
    const sources = new Set<string>()
    const walk = (items: any[]) => {
        for (const item of items) {
            if (item.datasets) {
                for (const ds of item.datasets) {
                    if (ds.source) sources.add(ds.source.split(' / ')[0].trim())
                }
            }
            if (item.subThemes) walk(item.subThemes)
        }
    }
    for (const theme of BDI_THEMES) walk(theme.subThemes || [])
    return sources.size
}

const UNIQUE_SOURCES_COUNT = countUniqueSources()

// Count datasets ready (demoReady) for a theme
function countThemeReady(theme: any): number {
    let count = 0
    const walk = (items: any[]) => {
        for (const item of items) {
            if (item.datasets) count += item.datasets.filter((d: any) => d.demoReady).length
            if (item.subThemes) walk(item.subThemes)
        }
    }
    walk(theme.subThemes || [])
    return count
}
function countThemeTotal(theme: any): number {
    let count = 0
    const walk = (items: any[]) => {
        for (const item of items) {
            if (item.datasets) count += item.datasets.length
            if (item.subThemes) walk(item.subThemes)
        }
    }
    walk(theme.subThemes || [])
    return count
}

export function DocsPage() {
    const [activeThemeId, setActiveThemeId] = useState(BDI_THEMES[0].id)
    const [expandedSubThemes, setExpandedSubThemes] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    // Track real availability: datasetId -> { available, foundCount, totalCount }
    const [availability, setAvailability] = useState<Record<string, { available: boolean; foundCount: number; totalCount: number; hasOpenData: boolean }>>({})
    const [loadingAvail, setLoadingAvail] = useState(false)

    const activeTheme = BDI_THEMES.find(t => t.id === activeThemeId)

    // Fetch availability for all datasets in active theme
    const fetchAvailability = useCallback(async () => {
        if (!activeTheme) return
        const allDatasets: { id: string; hasOpenData: boolean }[] = []
        const walk = (items: any[]) => {
            for (const item of items) {
                if (item.datasets) {
                    for (const ds of item.datasets) {
                        allDatasets.push({
                            id: ds.id,
                            hasOpenData: !!(ds.source && (ds.source.includes('Open Data') || ds.source.includes('INSEE')))
                        })
                    }
                }
                if (item.subThemes) walk(item.subThemes)
            }
        }
        walk(activeTheme.subThemes || [])
        if (allDatasets.length === 0) return

        setLoadingAvail(true)
        const results: typeof availability = {}
        await Promise.all(allDatasets.map(async ({ id: dsId, hasOpenData }) => {
            try {
                const data = await checkCsvAvailability(dsId)
                results[dsId] = {
                    available: data.available,
                    foundCount: data.found.length,
                    totalCount: data.found.length + data.missing.length,
                    hasOpenData
                }
            } catch {
                // Dataset not in backend config = not configured yet
                results[dsId] = { available: false, foundCount: 0, totalCount: 0, hasOpenData }
            }
        }))
        setAvailability(prev => ({ ...prev, ...results }))
        setLoadingAvail(false)
    }, [activeTheme])

    useEffect(() => { fetchAvailability() }, [fetchAvailability])

    const toggleSubTheme = (subThemeId: string) => {
        setExpandedSubThemes(prev =>
            prev.includes(subThemeId)
                ? prev.filter(id => id !== subThemeId)
                : [...prev, subThemeId]
        )
    }

    // Filter datasets based on search
    const filteredSubThemes = activeTheme?.subThemes?.map(st => ({
        ...st,
        datasets: st.datasets.filter((ds: any) =>
            ds.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ds.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ds.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ds.variable && ds.variable.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (ds.tool && ds.tool.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    })).filter(st => st.datasets.length > 0 || searchTerm === '')

    const totalDatasets = activeTheme?.subThemes?.reduce((acc, st) => acc + st.datasets.length, 0) || 0

    // Availability badge renderer — consistent color coding:
    // green = fully available (MOCA CSV ready)
    // blue = Open Data source available
    // amber = partial (some CSV missing)
    // gray = not configured
    const renderAvailability = (dsId: string, ds: any) => {
        const avail = availability[dsId]
        if (loadingAvail && !avail) {
            return (
                <div className="flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                </div>
            )
        }

        // Has demoReady flag = generation is supported
        if (ds.demoReady) {
            if (avail && avail.available) {
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        MOCA + Config
                    </span>
                )
            }
            if (avail && avail.foundCount > 0) {
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        {avail.foundCount}/{avail.totalCount} CSV
                    </span>
                )
            }
            // demoReady but no MOCA CSV - likely Open Data only
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Open Data
                </span>
            )
        }

        // Not demoReady - check if backend has config
        if (avail && avail.totalCount > 0) {
            if (avail.available) {
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Disponible
                    </span>
                )
            }
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Partiel
                </span>
            )
        }

        // No config at all
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                Non configuré
            </span>
        )
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a4b8c] mb-2">Référentiel <Acronym term="BDI" /></h1>
                    <p className="text-gray-600">
                        Dictionnaire complet des indicateurs et variables de la Base de Données.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-[#1a4b8c]">{BDI_THEMES.length}</div>
                    <div className="text-xs text-gray-500">Thématiques</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-[#3bb3a9]">
                        {BDI_THEMES.reduce((acc, t) => acc + (t.subThemes?.length || 0), 0)}
                    </div>
                    <div className="text-xs text-gray-500">Sous-thèmes</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-[#4caf50]">
                        {BDI_THEMES.reduce((acc, t) => acc + (t.subThemes?.reduce((a, st) => a + st.datasets.length, 0) || 0), 0)}
                    </div>
                    <div className="text-xs text-gray-500">Indicateurs</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-[#f5c542]">{UNIQUE_SOURCES_COUNT}</div>
                    <div className="text-xs text-gray-500">Sources de données</div>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">

                {/* Categories Sidebar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-1 h-fit">
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Thématiques BDI
                    </div>
                    {BDI_THEMES.map((theme) => {
                        const tReady = countThemeReady(theme)
                        const tTotal = countThemeTotal(theme)
                        return (
                        <button
                            key={theme.id}
                            onClick={() => {
                                setActiveThemeId(theme.id)
                                setExpandedSubThemes([])
                                setSearchTerm("")
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all",
                                activeThemeId === theme.id
                                    ? "bg-[#3bb3a9]/10 text-[#1a4b8c] font-bold shadow-sm border border-[#3bb3a9]/20"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <theme.icon className={cn("w-5 h-5", activeThemeId === theme.id ? "text-[#3bb3a9]" : "text-gray-400")} />
                            <div className="flex-1 min-w-0">
                                <span className="text-sm block truncate">{theme.shortTitle}</span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-2">
                                    {theme.subThemes?.length || 0} sous-thèmes
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-full font-medium",
                                        tReady === tTotal && tReady > 0
                                            ? "bg-green-50 text-green-600"
                                            : tReady > 0
                                                ? "bg-amber-50 text-amber-600"
                                                : "bg-gray-50 text-gray-400"
                                    )}>
                                        {tReady}/{tTotal}
                                    </span>
                                </span>
                            </div>
                        </button>
                        )
                    })}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">

                        {/* Theme Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", activeTheme?.bgColor)}>
                                        {activeTheme && <activeTheme.icon className="w-6 h-6 text-white" />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-[#1a4b8c]">
                                            {activeTheme?.title}
                                        </h2>
                                        <p className="text-sm text-gray-500">{activeTheme?.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-[#3bb3a9]">{totalDatasets}</div>
                                        <div className="text-xs text-gray-500">indicateurs</div>
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="mt-4 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un indicateur, une variable, une source..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                                />
                            </div>
                        </div>

                        {/* Sub-themes and Datasets */}
                        <div className="p-4 space-y-3">
                            {filteredSubThemes?.map((subTheme) => {
                                const stReady = subTheme.datasets.filter((d: any) => d.demoReady).length
                                const stTotal = subTheme.datasets.length
                                return (
                                <div key={subTheme.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Sub-theme Header */}
                                    <button
                                        onClick={() => toggleSubTheme(subTheme.id)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Database className="w-5 h-5 text-[#3bb3a9]" />
                                            <div className="text-left">
                                                <h3 className="font-bold text-gray-800">{subTheme.title}</h3>
                                                <p className="text-xs text-gray-500">{stTotal} indicateurs</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                                                stReady === stTotal && stReady > 0
                                                    ? "bg-green-50 text-green-600 border border-green-200"
                                                    : stReady > 0
                                                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                                                        : "bg-gray-50 text-gray-400 border border-gray-200"
                                            )}>
                                                {stReady}/{stTotal} dispo
                                            </span>
                                            {expandedSubThemes.includes(subTheme.id) ? (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Datasets Table */}
                                    {expandedSubThemes.includes(subTheme.id) && (
                                        <div className="border-t border-gray-200">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-4 py-3">Nom de l'indicateur</th>
                                                        <th className="px-4 py-3">Variable</th>
                                                        <th className="px-4 py-3">Source</th>
                                                        <th className="px-4 py-3">Outil</th>
                                                        <th className="px-4 py-3 text-center">Disponibilité</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {subTheme.datasets.map((ds: any, idx: number) => (
                                                        <tr key={`${ds.id}-${idx}`} className="hover:bg-[#3bb3a9]/5 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                                {ds.label}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {ds.variable && (
                                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                                                                        {ds.variable}
                                                                    </code>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                                                                    <FileSpreadsheet className="w-3 h-3" />
                                                                    {ds.source}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {ds.tool && (
                                                                    <span className="text-xs text-gray-500">{ds.tool}</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {renderAvailability(ds.id, ds)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )})}

                            {/* Empty state for search */}
                            {filteredSubThemes?.length === 0 && searchTerm && (
                                <div className="text-center py-12">
                                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="font-bold text-gray-600 mb-2">Aucun résultat</h3>
                                    <p className="text-sm text-gray-500">
                                        Aucun indicateur ne correspond à "{searchTerm}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-4">
                                    <span>Sources principales :</span>
                                    <span className="font-medium text-gray-700"><Acronym term="INSEE" /></span>
                                    <span className="font-medium text-gray-700"><Acronym term="MOCA-O" /></span>
                                    <span className="font-medium text-gray-700">INSERM-<Acronym term="CépiDc" /></span>
                                    <span className="font-medium text-gray-700">DREES</span>
                                    <span className="font-medium text-gray-700">ONISR</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px]">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> CSV prêts</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Open Data</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Partiel</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Non configuré</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
