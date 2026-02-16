import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Wand2, History, BookOpen, ArrowRight, FileText, Users, TrendingUp, Calendar, Loader2 } from "lucide-react"
import { getFiles } from "@/services/api"
import type { GeneratedFile } from "@/services/api"
import { StatsCard } from "@/components/ui/StatsCard"
import { ActionCard } from "@/components/ui/ActionCard"

export function DashboardPage() {
    const [files, setFiles] = useState<GeneratedFile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getFiles()
                setFiles(data)
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    // Derived stats
    const uniqueThemes = new Set(files.map(f => f.theme)).size
    const recentFiles = files.slice(0, 3)

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a4b8c] tracking-tight">Bonjour, Expert ORSG</h1>
                    <p className="text-gray-500 mt-1">Bienvenue sur votre espace de pilotage des données de santé.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Système opérationnel
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    icon={FileText}
                    color="text-[#3bb3a9]"
                    bg="bg-[#3bb3a9]/10"
                    value={loading ? "..." : files.length.toString()}
                    label="Fichiers générés"
                />
                <StatsCard
                    icon={TrendingUp}
                    color="text-[#4caf50]"
                    bg="bg-[#4caf50]/10"
                    value={loading ? "..." : uniqueThemes.toString()}
                    label="Thématiques actives"
                />
                <StatsCard
                    icon={Calendar}
                    color="text-[#f5c542]"
                    bg="bg-[#f5c542]/10"
                    value="2015-2023"
                    label="Années disponibles"
                />
                <StatsCard
                    icon={Users}
                    color="text-purple-600"
                    bg="bg-purple-100"
                    value="5"
                    label="Utilisateurs"
                />
            </div>

            {/* Main Action Card */}
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl transition-all hover:shadow-[#3bb3a9]/20 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a4b8c] to-[#0083B0] opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#3bb3a9] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#4caf50] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#f5c542] text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-sm">
                            <Wand2 className="w-3 h-3" />
                            Assistant IA
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                            Générer un nouveau rapport
                        </h2>
                        <p className="text-blue-100 text-lg leading-relaxed">
                            Lancez l'assistant intelligent pour transformer vos données brutes en tableaux Excel formatés, validés et prêts pour Geoclip.
                        </p>
                    </div>
                    <Link
                        to="/generate"
                        className="group/btn relative flex items-center justify-center gap-3 bg-white text-[#1a4b8c] px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-[#f5c542] hover:text-[#1a4b8c] transition-all transform hover:scale-105 min-w-[200px]"
                    >
                        <span>Commencer</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </div>
            </div>

            {/* Secondary Actions Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                <ActionCard
                    to="/history"
                    icon={History}
                    color="text-[#4caf50]"
                    bg="bg-[#4caf50]/10"
                    borderColor="hover:border-[#4caf50]/50"
                    title="Historique"
                    description="Accédez à vos derniers rapports générés et téléchargez-les à nouveau."
                />
                <ActionCard
                    to="/docs"
                    icon={BookOpen}
                    color="text-[#f5c542]"
                    bg="bg-[#f5c542]/10"
                    borderColor="hover:border-[#f5c542]/50"
                    title="Référentiel BDI"
                    description="Documentation complète des indicateurs et variables (MOCA-O, DREES)."
                />
                <ActionCard
                    to="/generate" // Could be a different route if models exist
                    icon={FileText}
                    color="text-[#3bb3a9]"
                    bg="bg-[#3bb3a9]/10"
                    borderColor="hover:border-[#3bb3a9]/50"
                    title="Modèles Excel"
                    description="Télécharger les gabarits vierges pour la saisie manuelle des données."
                    linkText="Télécharger"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1a4b8c] flex items-center gap-2">
                        <History className="w-5 h-5 opacity-70" />
                        Activité Récente
                    </h2>
                    <Link to="/history" className="text-sm font-medium text-[#3bb3a9] hover:text-[#2a8a81] transition-colors">
                        Voir tout
                    </Link>
                </div>

                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-8 flex justify-center text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Aucun fichier généré pour le moment.
                        </div>
                    ) : (
                        recentFiles.map((file, idx) => (
                            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-[#1a4b8c] group-hover:text-white transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 group-hover:text-[#1a4b8c] transition-colors">
                                            {file.filename}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                {file.theme}
                                            </span>
                                            <span className="text-xs text-gray-400">{file.size}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-400 font-medium block">{file.date}</span>
                                    <button
                                        onClick={() => window.open(`/api/download/${file.filename}`, '_blank')}
                                        className="text-xs font-semibold text-[#3bb3a9] opacity-0 group-hover:opacity-100 transition-opacity mt-1 hover:underline cursor-pointer"
                                    >
                                        Télécharger
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
