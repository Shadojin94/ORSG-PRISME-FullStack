import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Download, FileSpreadsheet, Search, AlertCircle, Loader2, TrendingUp, Calendar, History as HistoryIcon, Globe, HardDrive, RefreshCw } from "lucide-react"
import { getFiles, type GeneratedFile, getDownloadUrl } from "../services/api"
import { StatsCard } from "../components/ui/StatsCard"
import { cn } from "@/lib/utils"
import { formatDateFR } from "@/utils/date"
import { Acronym } from "@/components/ui/Acronym"

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
            setError("Connexion impossible. Réessayez dans quelques instants.");
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
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
            >

                {/* En-tête de page */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                            <HistoryIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-[#1a4b8c] sm:text-2xl">Historique des générations</h1>
                            <p className="text-xs text-slate-500 sm:text-sm">
                                Retrouvez, recherchez et téléchargez l'ensemble des fichiers générés.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadFiles}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#1a4b8c] transition hover:border-[#3bb3a9]"
                            title="Rafraîchir"
                        >
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                            {isLoading ? 'Actualisation...' : 'Actualiser'}
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatsCard
                        icon={FileSpreadsheet}
                        color="text-blue-600"
                        bg="bg-blue-100"
                        value={isLoading ? "..." : totalFiles.toString()}
                        label="Fichiers Totaux"
                    />
                    <StatsCard
                        icon={TrendingUp}
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
                    <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="font-medium">{error}</p>
                        <button onClick={loadFiles} className="ml-auto text-sm font-black underline hover:text-red-900">Réessayer</button>
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Toolbar */}
                    <div className="flex flex-col items-center gap-4 border-b border-slate-100 p-5 sm:flex-row">
                        <div className="relative w-full max-w-lg flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, thème, source..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#3bb3a9] focus:ring-4 focus:ring-[#3bb3a9]/10"
                            />
                        </div>
                        <div className="whitespace-nowrap rounded-full bg-[#3bb3a9]/10 px-3 py-1 text-xs font-black text-[#3bb3a9]">
                            {filteredFiles.length} résultats
                        </div>
                    </div>

                    {/* Table */}
                    <div className="min-h-[400px]">
                        {isLoading && files.length === 0 ? (
                            <div className="flex items-center justify-center gap-3 p-10 text-slate-500">
                                <Loader2 className="h-5 w-5 animate-spin text-[#3bb3a9]" />
                                <span>Chargement de l'historique...</span>
                            </div>
                        ) : files.length === 0 && !error ? (
                            <div className="flex flex-col items-center justify-center p-10 text-center">
                                <FileSpreadsheet className="h-12 w-12 text-slate-300" />
                                <h3 className="mt-4 text-base font-black text-[#1a4b8c]">Aucun fichier généré</h3>
                                <p className="mt-1 max-w-xs text-sm text-slate-500">
                                    Lancez une génération depuis le <span className="font-black text-[#3bb3a9]">Générateur</span> pour voir apparaître vos fichiers ici.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full table-fixed text-left text-sm">
                                <colgroup>
                                    <col style={{ width: '40%' }} />
                                    <col style={{ width: '17%' }} />
                                    <col style={{ width: '18%' }} />
                                    <col style={{ width: '12%' }} />
                                    <col style={{ width: '13%' }} />
                                </colgroup>
                                <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-black uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Fichier</th>
                                        <th className="px-6 py-4">Date & Taille</th>
                                        <th className="px-6 py-4">Thématique</th>
                                        <th className="px-6 py-4">Source</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredFiles.map((file, index) => (
                                        <tr key={index} className="group transition-colors hover:bg-slate-50/50">
                                            <td className="px-6 py-4">
                                                <div className="flex min-w-0 items-center gap-4">
                                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                                                        <FileSpreadsheet className="h-5 w-5" />
                                                    </div>
                                                    <span className="min-w-0 truncate font-semibold text-slate-900" title={file.filename}>
                                                        {file.filename}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700">{formatDateFR(file.date)}</span>
                                                    <span className="font-mono text-xs text-slate-400">{file.size}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    title={file.theme}
                                                    className={cn(
                                                        "inline-flex max-w-full items-center truncate rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
                                                        getThemeColor(file.theme).replace("bg-", "bg-opacity-10 ring-").replace("text-", "text-")
                                                    )}
                                                >
                                                    {file.theme}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {file.source === 'Open Data' ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-200">
                                                        <Globe className="h-3 w-3" />
                                                        Open Data
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                        <HardDrive className="h-3 w-3" />
                                                        <Acronym term="MOCA-O" />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDownload(file.filename)}
                                                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#1a4b8c] transition hover:border-[#1a4b8c] hover:bg-[#1a4b8c] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1a4b8c]/20"
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
                </div>
            </motion.div>
        </main>
    )
}
