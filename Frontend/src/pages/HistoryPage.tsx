import { useEffect, useState } from "react"
import { Download, FileSpreadsheet, Search, AlertCircle, Loader2 } from "lucide-react"
import { getFiles, type GeneratedFile, getDownloadUrl } from "../services/api"
import { Card } from "../components/ui/card"

const getThemeColor = (theme: string) => {
    // Normalisation pour correspondre aux clés exactes si besoin
    const themeLower = theme.toLowerCase();

    if (themeLower.includes("population")) return "bg-blue-100 text-blue-800"
    if (themeLower.includes("santé") || themeLower.includes("sante")) return "bg-green-100 text-green-800"
    if (themeLower.includes("patholog")) return "bg-red-100 text-red-800"
    if (themeLower.includes("structures") || themeLower.includes("soins")) return "bg-cyan-100 text-cyan-800"
    if (themeLower.includes("comportement")) return "bg-amber-100 text-amber-800"
    if (themeLower.includes("traumatisme")) return "bg-orange-100 text-orange-800"

    return "bg-gray-100 text-gray-800"
}

export function HistoryPage() {
    const [files, setFiles] = useState<GeneratedFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadFiles();
    }, []);

    async function loadFiles() {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getFiles();
            setFiles(data);
        } catch (err) {
            console.error("Erreur chargement historique:", err);
            setError("Impossible de charger l'historique. Vérifiez que le Backend est lancé.");
        } finally {
            setIsLoading(false);
        }
    }

    const filteredFiles = files.filter(f =>
        f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.theme.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = (filename: string) => {
        const url = getDownloadUrl(filename);
        window.open(url, '_blank');
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a4b8c] mb-2">Historique des Générations</h1>
                    <p className="text-gray-600">
                        Consultez et téléchargez les fichiers Excel générés par la plateforme.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadFiles}
                        className="px-3 py-1.5 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-600 flex items-center gap-2 border shadow-sm bg-white"
                        title="Rafraîchir"
                    >
                        <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Chargement...' : 'Actualiser'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                    <button onClick={loadFiles} className="ml-auto text-sm font-semibold underline hover:text-red-900">Réessayer</button>
                </div>
            )}

            <Card className="overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un fichier, une thématique..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none transition-all"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="font-bold text-gray-900">{filteredFiles.length}</span> fichiers
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[300px]">
                    {isLoading && files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#3bb3a9]" />
                            <p>Chargement des données...</p>
                        </div>
                    ) : files.length === 0 && !error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <FileSpreadsheet className="w-12 h-12 mb-4 opacity-20" />
                            <p>Aucun fichier disponible</p>
                            <p className="text-sm mt-2">Allez dans le "Générateur" pour créer votre premier rapport.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-xs">
                                    <th className="px-6 py-4 font-bold">Nom du fichier</th>
                                    <th className="px-6 py-4 font-bold">Date</th>
                                    <th className="px-6 py-4 font-bold">Taille</th>
                                    <th className="px-6 py-4 font-bold">Thématique</th>
                                    <th className="px-6 py-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredFiles.map((file, index) => (
                                    <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                                                    <FileSpreadsheet className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium text-gray-900">{file.filename}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {file.date}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {file.size}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getThemeColor(file.theme)}`}>
                                                {file.theme}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDownload(file.filename)}
                                                className="inline-flex items-center justify-center rounded-md bg-[#1a4b8c] px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-[#1a4b8c]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                                title="Télécharger le fichier"
                                            >
                                                <Download className="mr-2 h-4 w-4" /> Télécharger
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    )
}
