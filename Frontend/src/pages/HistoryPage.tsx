import { Download, FileSpreadsheet, Search, Filter, Calendar, CheckCircle2 } from "lucide-react"

// Données réalistes basées sur les thématiques BDI réelles
const HISTORY_DATA = [
    {
        id: 1,
        file: "educ_2022.xlsx",
        theme: "Population et Conditions de Vie",
        subTheme: "Éducation",
        date: "22/01/2026 09:15",
        user: "Expert ORSG",
        size: "285 Ko",
        status: "Succès",
        source: "INSEE / MOCA-O",
        levels: ["Commune", "Région", "DOM", "France Hexagonale", "France Entière"]
    },
    {
        id: 2,
        file: "educ_2021.xlsx",
        theme: "Population et Conditions de Vie",
        subTheme: "Éducation",
        date: "21/01/2026 14:30",
        user: "Admin ORSG",
        size: "278 Ko",
        status: "Succès",
        source: "INSEE / MOCA-O",
        levels: ["Commune", "Région", "DOM", "France Hexagonale", "France Entière"]
    },
    {
        id: 3,
        file: "mortalite_cardio_2021.xlsx",
        theme: "Pathologies",
        subTheme: "Maladies Cardiovasculaires",
        date: "20/01/2026 11:45",
        user: "Expert ORSG",
        size: "456 Ko",
        status: "Succès",
        source: "INSERM-CépiDc / MOCA-O",
        levels: ["Région", "France Hexagonale", "France Entière"]
    },
    {
        id: 4,
        file: "densite_2022.xlsx",
        theme: "Population et Conditions de Vie",
        subTheme: "Démographie",
        date: "19/01/2026 16:20",
        user: "Admin ORSG",
        size: "198 Ko",
        status: "Succès",
        source: "INSEE",
        levels: ["Commune", "Région", "DOM", "France Hexagonale", "France Entière"]
    },
    {
        id: 5,
        file: "esp_vie_2020.xlsx",
        theme: "État de Santé",
        subTheme: "Espérance de Vie",
        date: "18/01/2026 10:00",
        user: "Expert ORSG",
        size: "312 Ko",
        status: "Succès",
        source: "INSEE / MOCA-O",
        levels: ["Région", "France Entière"]
    },
    {
        id: 6,
        file: "ds_med_2022.xlsx",
        theme: "Structures et Activités de Soins",
        subTheme: "Professionnels de Santé",
        date: "17/01/2026 09:30",
        user: "Admin ORSG",
        size: "523 Ko",
        status: "Succès",
        source: "RPPS / MOCA-O",
        levels: ["Commune", "Région", "France Hexagonale"]
    },
]

const getThemeColor = (theme: string) => {
    switch (theme) {
        case "Population et Conditions de Vie": return "bg-blue-100 text-blue-800"
        case "État de Santé": return "bg-green-100 text-green-800"
        case "Pathologies": return "bg-red-100 text-red-800"
        case "Structures et Activités de Soins": return "bg-cyan-100 text-cyan-800"
        case "Comportements": return "bg-amber-100 text-amber-800"
        case "Traumatismes": return "bg-orange-100 text-orange-800"
        default: return "bg-gray-100 text-gray-800"
    }
}

export function HistoryPage() {
    return (
        <div className="max-w-6xl mx-auto py-8 px-4">

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a4b8c] mb-2">Historique des Générations</h1>
                    <p className="text-gray-600">
                        Consultez, téléchargez et auditez les fichiers Excel générés par la plateforme.
                    </p>
                </div>
                <div className="bg-white border rounded-lg flex items-center p-1 shadow-sm">
                    <button className="px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filtrer
                    </button>
                    <div className="h-4 w-px bg-gray-200 mx-1"></div>
                    <button className="px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Date
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un fichier, un utilisateur, une source..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="font-bold text-gray-900">{HISTORY_DATA.length}</span> fichiers générés
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-xs">
                                <th className="px-6 py-4 font-bold">Fichier Généré</th>
                                <th className="px-6 py-4 font-bold">Thématique BDI</th>
                                <th className="px-6 py-4 font-bold">Sources</th>
                                <th className="px-6 py-4 font-bold">Date & Heure</th>
                                <th className="px-6 py-4 font-bold">Utilisateur</th>
                                <th className="px-6 py-4 font-bold">Taille</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {HISTORY_DATA.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                                                <FileSpreadsheet className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900">{item.file}</span>
                                                <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {item.status}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getThemeColor(item.theme)}`}>
                                                {item.theme}
                                            </span>
                                            <div className="text-xs text-gray-500">{item.subTheme}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-gray-600 bg-gray-100 border border-gray-200">
                                            {item.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                        {item.date}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#3bb3a9] flex items-center justify-center text-xs font-bold text-white">
                                                {item.user.charAt(0)}
                                            </div>
                                            {item.user}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                        {item.size}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-[#3bb3a9] transition-colors p-2 rounded-full hover:bg-[#3bb3a9]/10">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
                    <span className="text-xs text-gray-500">Affichage 1-{HISTORY_DATA.length} sur {HISTORY_DATA.length}</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 rounded border border-gray-300 bg-white text-xs disabled:opacity-50" disabled>Précédent</button>
                        <button className="px-3 py-1 rounded border border-gray-300 bg-white text-xs disabled:opacity-50" disabled>Suivant</button>
                    </div>
                </div>

            </div>
        </div>
    )
}
