import { useEffect, useState } from "react"
import { Download, FileSpreadsheet, Search, AlertCircle, Loader2, TrendingUp, Calendar, History as HistoryIcon, Globe, HardDrive } from "lucide-react"
import { getFiles, type GeneratedFile, getDownloadUrl } from "../services/api"
import { Card } from "../components/ui/card"
import { StatsCard } from "../components/ui/StatsCard"
import { cn } from "@/lib/utils"

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

    const filteredFiles = (Array.isArray(files) ? files : []).filter(f =>
        f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.source && f.source.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDownload = (filename: string) => {
        const url = getDownloadUrl(filename);
        window.open(url, '_blank');
    };

    // Calculate stats
    const totalFiles = files.length
    const mostFrequentTheme = files.length > 0
        ? Object.entries(files.reduce((acc, f) => { acc[f.theme] = (acc[f.theme] || 0) + 1; return acc; }, {} as Record<string, number>))
            .sort((a, b) => b[1] - a[1])[0][0]
        : "N/A"
    const lastGeneration = files.length > 0 ? files[0].date : "N/A"

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a4b8c] mb-2 flex items-center gap-3">
                        <HistoryIcon className="w-8 h-8 text-[#3bb3a9]" />
                        Historique des Générations
                    </h1>
                    <p className="text-gray-600 max-w-2xl">
                        Retrouvez l'ensemble des fichiers générés. Vous pouvez rechercher, filtrer et télécharger vos rapports.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadFiles}
                        className="px-4 py-2 rounded-lg hover:bg-white hover:shadow-md text-sm font-bold text-gray-600 flex items-center gap-2 border border-gray-200 bg-gray-50 transition-all"
                        title="Rafraîchir"
                    >
                        <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Actualisation...' : 'Actualiser'}
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard
                    icon={FileSpreadsheet}
                    color="text-blue-600"
                    bg="bg-blue-100"
                    value={isLoading ? "..." : totalFiles.toString()}
                    label="Fichiers Totaux"
                />
                <StatsCard
                    icon={TrendingUp} // Changed from PieChart to TrendingUp to match existing imports or import new one
                    color="text-emerald-600"
                    bg="bg-emerald-100"
                    value={isLoading ? "..." : mostFrequentTheme}
                    label="Thématique Fréquente"
                />
                <StatsCard
                    icon={Calendar}
                    color="text-purple-600"
                    bg="bg-purple-100"
                    value={isLoading ? "..." : lastGeneration}
                    label="Dernière Génération"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium">{error}</p>
                    <button onClick={loadFiles} className="ml-auto text-sm font-bold underline hover:text-red-900">Réessayer</button>
                </div>
            )}

            <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 bg-white/80 backdrop-blur-sm">

                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4 bg-white">
                    <div className="relative flex-1 w-full max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, theme, date..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-[#3bb3a9]/10 focus:border-[#3bb3a9] outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="text-sm font-medium text-gray-500 whitespace-nowrap bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        <span className="font-bold text-[#1a4b8c]">{filteredFiles.length}</span> résultats
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading && files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#3bb3a9]" />
                            <p>Chargement de l'historique...</p>
                        </div>
                    ) : files.length === 0 && !error ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <FileSpreadsheet className="w-8 h-8 opacity-40" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Aucun fichier généré</h3>
                            <p className="text-sm max-w-xs text-center">
                                Lancez une génération depuis le <span className="font-bold text-[#3bb3a9]">Générateur</span> pour voir apparaître vos fichiers ici.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 text-gray-500 uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Fichier</th>
                                    <th className="px-6 py-4">Date & Taille</th>
                                    <th className="px-6 py-4">Thématique</th>
                                    <th className="px-6 py-4">Source</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredFiles.map((file, index) => (
                                    <tr key={index} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                                                    <FileSpreadsheet className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold text-gray-900 line-clamp-1" title={file.filename}>
                                                    {file.filename}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-700">{file.date}</span>
                                                <span className="text-xs text-gray-400 font-mono">{file.size}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-inset",
                                                getThemeColor(file.theme).replace("bg-", "bg-opacity-10 ring-").replace("text-", "text-") // Tweaking colors
                                            )}>
                                                {file.theme}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {file.source === 'Open Data' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                                                    <Globe className="w-3 h-3" />
                                                    Open Data
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                    <HardDrive className="w-3 h-3" />
                                                    MOCA-O
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDownload(file.filename)}
                                                className="inline-flex items-center justify-center rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-[#1a4b8c] shadow-sm hover:bg-[#1a4b8c] hover:text-white hover:border-[#1a4b8c] transition-all focus:outline-none focus:ring-2 focus:ring-[#1a4b8c]/20 transform hover:-translate-y-0.5"
                                                title="Télécharger"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Télécharger
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
