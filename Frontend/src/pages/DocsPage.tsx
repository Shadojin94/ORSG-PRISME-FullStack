import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { BDI_THEMES } from "@/data/bdi_themes"
import { cn } from "@/lib/utils"
import { Search, ChevronRight, Database, FileSpreadsheet, Loader2, BookOpen } from "lucide-react"
import { checkCsvAvailability } from "@/services/api"
import { Acronym } from "@/components/ui/Acronym"
import { PageHero } from "@/components/ui/PageHero"

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
                    <Loader2 className="h-3 w-3 animate-spin text-[#3bb3a9]" />
                </div>
            )
        }

        // Indicateur non disponible en accès public (ex. prévalences SNDS).
        if (ds.publicUnavailable) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    Non disponible en accès public
                </span>
            )
        }

        // Indicateur disponible uniquement via import de fichiers ORSG (MOCA-O).
        if (ds.importRequired) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Import de fichiers ORSG requis
                </span>
            )
        }

        // Has demoReady flag = generation is supported
        if (ds.demoReady) {
            if (avail && avail.available) {
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        MOCA + Config
                    </span>
                )
            }
            if (avail && avail.foundCount > 0) {
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        {avail.foundCount}/{avail.totalCount} CSV
                    </span>
                )
            }
            // demoReady but no MOCA CSV - likely Open Data only
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Open Data
                </span>
            )
        }

        // Not demoReady - check if backend has config
        if (avail && avail.totalCount > 0) {
            if (avail.available) {
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Disponible
                    </span>
                )
            }
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Partiel
                </span>
            )
        }

        // No config at all
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Non configuré
            </span>
        )
    }

    return (
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

            {/* En-tete de page premium */}
            <PageHero
                icon={BookOpen}
                eyebrow="Reference des donnees"
                title="Dictionnaire BDI"
                description="Explorez les themes, sources et jeux de donnees de la Base de Donnees Indicateurs."
            />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
            >

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="text-2xl font-black text-[#1a4b8c]">{BDI_THEMES.length}</div>
                        <div className="text-xs text-slate-500">Thématiques</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="text-2xl font-black text-[#3bb3a9]">
                            {BDI_THEMES.reduce((acc, t) => acc + (t.subThemes?.length || 0), 0)}
                        </div>
                        <div className="text-xs text-slate-500">Sous-thèmes</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="text-2xl font-black text-[#4caf50]">
                            {BDI_THEMES.reduce((acc, t) => acc + (t.subThemes?.reduce((a, st) => a + st.datasets.length, 0) || 0), 0)}
                        </div>
                        <div className="text-xs text-slate-500">Indicateurs</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div className="text-2xl font-black text-[#f5c542]">{UNIQUE_SOURCES_COUNT}</div>
                        <div className="text-xs text-slate-500">Sources de données</div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4">

                    {/* Categories Sidebar */}
                    <div className="h-fit space-y-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-500">
                            Thématiques BDI
                        </div>
                        {BDI_THEMES.map((theme) => {
                            const tReady = countThemeReady(theme)
                            const tTotal = countThemeTotal(theme)
                            const isActive = activeThemeId === theme.id
                            return (
                            <button
                                key={theme.id}
                                onClick={() => {
                                    setActiveThemeId(theme.id)
                                    setExpandedSubThemes([])
                                    setSearchTerm("")
                                }}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                                    isActive
                                        ? "border border-[#3bb3a9]/20 bg-gradient-to-r from-[#1a4b8c]/5 to-[#3bb3a9]/10 font-black text-[#1a4b8c] shadow-sm"
                                        : "border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                {/* Pastille d'icone arrondie degradee */}
                                <span className={cn(
                                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all",
                                    isActive
                                        ? "bg-gradient-to-br from-[#1a4b8c] to-[#3bb3a9] text-white shadow-sm"
                                        : "bg-slate-100 text-slate-400"
                                )}>
                                    <theme.icon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <span className="block truncate text-sm">{theme.shortTitle}</span>
                                    <span className="flex items-center gap-2 text-[10px] text-slate-400">
                                        {theme.subThemes?.length || 0} sous-thèmes
                                        <span className={cn(
                                            "rounded-full px-1.5 py-0.5 font-medium",
                                            tReady === tTotal && tReady > 0
                                                ? "bg-green-50 text-green-600"
                                                : tReady > 0
                                                    ? "bg-amber-50 text-amber-600"
                                                    : "bg-slate-50 text-slate-400"
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
                        <div className="min-h-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            {/* Theme Header */}
                            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5 sm:p-6">
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("grid h-12 w-12 place-items-center rounded-2xl shadow-sm", activeTheme?.bgColor)}>
                                            {activeTheme && <activeTheme.icon className="h-6 w-6 text-white" />}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-[#1a4b8c]">
                                                {activeTheme?.title}
                                            </h2>
                                            <p className="text-sm text-slate-500">{activeTheme?.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-[#3bb3a9]">{totalDatasets}</div>
                                            <div className="text-xs text-slate-500">indicateurs</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Search premium */}
                                <div className="relative mt-5">
                                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un indicateur, une variable, une source..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-[#3bb3a9] focus:shadow-md focus:ring-4 focus:ring-[#3bb3a9]/10"
                                    />
                                </div>
                            </div>

                            {/* Sub-themes and Datasets */}
                            <div className="space-y-3 p-4 sm:p-5">
                                {filteredSubThemes?.map((subTheme) => {
                                    // On masque les indicateurs marqués hidden (non implémentés).
                                    const visibleDatasets = subTheme.datasets.filter((d: any) => !d.hidden)
                                    const stReady = visibleDatasets.filter((d: any) => d.demoReady).length
                                    const stTotal = visibleDatasets.length
                                    const isOpen = expandedSubThemes.includes(subTheme.id)
                                    return (
                                    <div key={subTheme.id} className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
                                        {/* Sub-theme Header */}
                                        <button
                                            onClick={() => toggleSubTheme(subTheme.id)}
                                            className={cn(
                                                "flex w-full items-center justify-between p-4 transition-colors",
                                                isOpen ? "bg-slate-50" : "bg-white hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Pastille d'icone degradee */}
                                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#1a4b8c]/10 to-[#3bb3a9]/15 text-[#3bb3a9]">
                                                    <Database className="h-5 w-5" />
                                                </span>
                                                <div className="text-left">
                                                    <h3 className="font-black text-slate-800">{subTheme.title}</h3>
                                                    <p className="text-xs text-slate-500">{stTotal} indicateurs</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                                                    stReady === stTotal && stReady > 0
                                                        ? "border border-green-200 bg-green-50 text-green-600"
                                                        : stReady > 0
                                                            ? "border border-amber-200 bg-amber-50 text-amber-600"
                                                            : "border border-slate-200 bg-slate-50 text-slate-400"
                                                )}>
                                                    {stReady}/{stTotal} dispo
                                                </span>
                                                {/* Chevron anime au depliage */}
                                                <ChevronRight className={cn(
                                                    "h-5 w-5 text-slate-400 transition-transform duration-200",
                                                    isOpen && "rotate-90"
                                                )} />
                                            </div>
                                        </button>

                                        {/* Datasets Table */}
                                        {isOpen && (
                                            <div className="border-t border-slate-200">
                                                <table className="w-full text-left">
                                                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                                                        <tr>
                                                            <th className="px-4 py-3">Nom de l'indicateur</th>
                                                            <th className="px-4 py-3">Variable</th>
                                                            <th className="px-4 py-3">Source</th>
                                                            <th className="px-4 py-3">Outil</th>
                                                            <th className="px-4 py-3 text-center">Disponibilité</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 text-sm">
                                                        {visibleDatasets.map((ds: any, idx: number) => (
                                                            <tr key={`${ds.id}-${idx}`} className="transition-colors hover:bg-slate-50">
                                                                <td className="px-4 py-3 font-medium text-slate-900">
                                                                    {ds.label}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {ds.variable && (
                                                                        <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                                                                            {ds.variable}
                                                                        </code>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                                                        <FileSpreadsheet className="h-3 w-3" />
                                                                        {ds.source}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {ds.tool && (
                                                                        <span className="text-xs text-slate-500">{ds.tool}</span>
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
                                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                        <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#1a4b8c]/10 to-[#3bb3a9]/10">
                                            <Search className="h-9 w-9 text-[#3bb3a9]" />
                                        </div>
                                        <h3 className="mt-5 text-base font-black text-[#1a4b8c]">Aucun résultat</h3>
                                        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                                            Aucun indicateur ne correspond à « {searchTerm} ». Essayez un autre terme ou une autre thématique.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-4">
                                        <span>Sources principales :</span>
                                        <span className="font-medium text-slate-700"><Acronym term="INSEE" /></span>
                                        <span className="font-medium text-slate-700"><Acronym term="MOCA-O" /></span>
                                        <span className="font-medium text-slate-700">INSERM-<Acronym term="CépiDc" /></span>
                                        <span className="font-medium text-slate-700">DREES</span>
                                        <span className="font-medium text-slate-700">ONISR</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px]">
                                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-500" /> CSV prêts</span>
                                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> Open Data</span>
                                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Partiel</span>
                                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-slate-300" /> Non configuré</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </motion.div>
        </main>
    )
}
