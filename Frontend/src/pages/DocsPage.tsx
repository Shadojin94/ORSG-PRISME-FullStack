import { useState } from "react"
import { BDI_THEMES } from "@/data/bdi_themes"
import { cn } from "@/lib/utils"
import { Search, Download, Table } from "lucide-react"

export function DocsPage() {
    const [activeThemeId, setActiveThemeId] = useState(BDI_THEMES[0].id)
    const activeTheme = BDI_THEMES.find(t => t.id === activeThemeId)

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-orsg-darkBlue mb-2">Référentiel BDI</h1>
                    <p className="text-gray-600">
                        Dictionnaire complet des indicateurs et variables de la Base de Données.
                    </p>
                </div>
                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                    <Download className="w-4 h-4" /> Export PDF
                </button>
            </div>

            <div className="grid md:grid-cols-4 gap-6">

                {/* Categories Sidebar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 space-y-1 h-fit">
                    {BDI_THEMES.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => setActiveThemeId(theme.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                                activeThemeId === theme.id
                                    ? "bg-orsg-blue/10 text-orsg-blue font-bold shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <theme.icon className={cn("w-5 h-5", activeThemeId === theme.id ? "text-orsg-blue" : "text-gray-400")} />
                            <span className="text-sm">{theme.shortTitle}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">

                        {/* Theme Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className={cn("w-3 h-3 rounded-full", activeTheme?.bgColor)}></span>
                                    {activeTheme?.title}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">{activeTheme?.description}</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Chercher un indicateur..."
                                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orsg-blue/20 outline-none w-full md:w-64"
                                />
                            </div>
                        </div>

                        {/* Datasets Table */}
                        <div className="p-0">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">ID Variable</th>
                                        <th className="px-6 py-4">Nom de l'indicateur</th>
                                        <th className="px-6 py-4">Source</th>
                                        <th className="px-6 py-4 text-center">Disponibilité</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {activeTheme?.datasets.map((ds) => (
                                        <tr key={ds.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{ds.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{ds.label}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                                                    {ds.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mx-auto" title="Disponible"></div>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Filling empty space example */}
                                    <tr className="bg-gray-50/30">
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic text-xs">
                                            + 15 autres variables techniques masquées (voir version complète)
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
