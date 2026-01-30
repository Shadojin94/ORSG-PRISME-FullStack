import { useState } from "react"
import { BDI_THEMES } from "@/data/bdi_themes"
import { cn } from "@/lib/utils"
import { Search, Download, ChevronRight, ChevronDown, Database, FileSpreadsheet, ExternalLink } from "lucide-react"

export function DocsPage() {
    const [activeThemeId, setActiveThemeId] = useState(BDI_THEMES[0].id)
    const [expandedSubThemes, setExpandedSubThemes] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    const activeTheme = BDI_THEMES.find(t => t.id === activeThemeId)

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
        datasets: st.datasets.filter(ds =>
            ds.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ds.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ds.source.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(st => st.datasets.length > 0 || searchTerm === '')

    const totalDatasets = activeTheme?.subThemes?.reduce((acc, st) => acc + st.datasets.length, 0) || 0

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a4b8c] mb-2">Référentiel BDI</h1>
                    <p className="text-gray-600">
                        Dictionnaire complet des indicateurs et variables de la Base de Données.
                    </p>
                </div>
                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                    <Download className="w-4 h-4" /> Export PDF
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
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
                    <div className="text-2xl font-bold text-[#f5c542]">5</div>
                    <div className="text-xs text-gray-500">Sources de données</div>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">

                {/* Categories Sidebar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-1 h-fit">
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Thématiques BDI
                    </div>
                    {BDI_THEMES.map((theme) => (
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
                                <span className="text-[10px] text-gray-400">
                                    {theme.subThemes?.length || 0} sous-thèmes
                                </span>
                            </div>
                        </button>
                    ))}
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
                            {filteredSubThemes?.map((subTheme) => (
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
                                                <p className="text-xs text-gray-500">{subTheme.datasets.length} indicateurs</p>
                                            </div>
                                        </div>
                                        {expandedSubThemes.includes(subTheme.id) ? (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>

                                    {/* Datasets Table */}
                                    {expandedSubThemes.includes(subTheme.id) && (
                                        <div className="border-t border-gray-200">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-4 py-3">ID Variable</th>
                                                        <th className="px-4 py-3">Nom de l'indicateur</th>
                                                        <th className="px-4 py-3">Source</th>
                                                        <th className="px-4 py-3 text-center">Disponibilité</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {subTheme.datasets.map((ds) => (
                                                        <tr key={ds.id} className="hover:bg-[#3bb3a9]/5 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                                                                    {ds.id}
                                                                </code>
                                                            </td>
                                                            <td className="px-4 py-3 font-medium text-gray-900">{ds.label}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                                                                    <FileSpreadsheet className="w-3 h-3" />
                                                                    {ds.source}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-green-500" title="Disponible"></div>
                                                                    <span className="text-xs text-green-600">Disponible</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}

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
                                    <span className="font-medium text-gray-700">INSEE</span>
                                    <span className="font-medium text-gray-700">MOCA-O</span>
                                    <span className="font-medium text-gray-700">INSERM-CépiDc</span>
                                    <span className="font-medium text-gray-700">DREES</span>
                                </div>
                                <a href="#" className="flex items-center gap-1 text-[#3bb3a9] hover:underline">
                                    Documentation complète <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
