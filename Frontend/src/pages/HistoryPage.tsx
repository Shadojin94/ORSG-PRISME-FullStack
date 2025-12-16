import { Download, FileSpreadsheet, Search, Filter, Calendar } from "lucide-react"

const MOCK_HISTORY = [
    { id: 1, file: "pop_cond_vie_2023.xlsx", theme: "Population", date: "16/12/2024 10:30", user: "Admin", size: "450 Ko", status: "Succès", source: "INSEE, MOCA-O" },
    { id: 2, file: "etat_sante_2022.xlsx", theme: "Santé", date: "15/12/2024 14:15", user: "Expert ORSG", size: "1.2 Mo", status: "Succès", source: "CépiDc" },
    { id: 3, file: "pathologies_2023.xlsx", theme: "Pathologies", date: "12/12/2024 09:45", user: "Admin", size: "890 Ko", status: "Succès", source: "CNAM" },
    { id: 4, file: "struct_soins_2021.xlsx", theme: "Offre de Soins", date: "10/12/2024 16:20", user: "Expert ORSG", size: "2.1 Mo", status: "Succès", source: "DREES (SAE)" },
    { id: 5, file: "comportements_2023.xlsx", theme: "Comportements", date: "08/12/2024 11:00", user: "Admin", size: "600 Ko", status: "Succès", source: "Baromètre Santé" },
]

export function HistoryPage() {
    return (
        <div className="max-w-6xl mx-auto py-8 px-4">

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-orsg-darkBlue mb-2">Historique des Générations</h1>
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
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="font-bold text-gray-900">{MOCK_HISTORY.length}</span> fichiers trouvés
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-xs">
                                <th className="px-6 py-4 font-bold">Fichier Généré</th>
                                <th className="px-6 py-4 font-bold">Thématique</th>
                                <th className="px-6 py-4 font-bold">Sources</th>
                                <th className="px-6 py-4 font-bold">Date & Heure</th>
                                <th className="px-6 py-4 font-bold">Utilisateur</th>
                                <th className="px-6 py-4 font-bold">Taille</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {MOCK_HISTORY.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                                                <FileSpreadsheet className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-gray-900">{item.file}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                                            {item.theme}
                                        </span>
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
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {item.user.charAt(0)}
                                            </div>
                                            {item.user}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                        {item.size}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-orsg-blue transition-colors p-2 rounded-full hover:bg-blue-50">
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
                    <span className="text-xs text-gray-500">Affichage 1-5 sur 5</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 rounded border border-gray-300 bg-white text-xs disabled:opacity-50" disabled>Précédent</button>
                        <button className="px-3 py-1 rounded border border-gray-300 bg-white text-xs disabled:opacity-50" disabled>Suivant</button>
                    </div>
                </div>

            </div>
        </div>
    )
}
