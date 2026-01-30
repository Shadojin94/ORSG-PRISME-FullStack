import { Link } from "react-router-dom"
import { Wand2, History, BookOpen, ArrowRight, FileText, Users, TrendingUp, Calendar } from "lucide-react"

export function DashboardPage() {
    return (
        <div className="max-w-6xl mx-auto py-8 px-4">

            {/* Welcome Header */}
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-[#1a4b8c] mb-2">Bonjour, Expert ORSG</h1>
                <p className="text-gray-500">Bienvenue sur votre espace de pilotage des données de santé.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3bb3a9]/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#3bb3a9]" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#1a4b8c]">15</div>
                            <div className="text-xs text-gray-500">Fichiers générés</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#4caf50]/10 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-[#4caf50]" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#4caf50]">6</div>
                            <div className="text-xs text-gray-500">Thématiques actives</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#f5c542]/10 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#f5c542]" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#f5c542]">2015-2022</div>
                            <div className="text-xs text-gray-500">Années disponibles</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-600">5</div>
                            <div className="text-xs text-gray-500">Utilisateurs</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Action Card */}
            <div className="mb-12">
                <Link to="/generate" className="block group">
                    <div className="bg-gradient-to-r from-[#1a4b8c] to-[#3bb3a9] rounded-2xl p-8 relative overflow-hidden shadow-2xl hover:shadow-[#3bb3a9]/20 transition-all border border-[#3bb3a9]/30 transform hover:-translate-y-1">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <div className="bg-white/10 w-fit px-4 py-1 rounded-full text-xs font-semibold text-[#f5c542] mb-4 border border-white/10 uppercase tracking-widest">
                                    Nouveau
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Générer un Rapport</h2>
                                <p className="text-white/80 max-w-xl text-lg leading-relaxed">
                                    Lancez l'assistant intelligent pour transformer vos fichiers CSV MOCA-O en tableaux Excel validés et formatés.
                                </p>
                            </div>
                            <div className="bg-white text-[#1a4b8c] px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-[#f5c542] hover:text-[#1a4b8c] transition-colors shadow-lg group-hover:scale-105 duration-200">
                                <Wand2 className="w-5 h-5" />
                                Commencer
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Secondary Actions Grid */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* History Card */}
                <Link to="/history" className="group">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all h-full hover:border-[#4caf50]/30">
                        <div className="w-12 h-12 bg-[#4caf50]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <History className="w-6 h-6 text-[#4caf50]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#4caf50] transition-colors">Historique</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Accédez à vos 15 derniers rapports générés et téléchargez-les à nouveau.
                        </p>
                        <div className="flex items-center text-sm font-medium text-[#4caf50] opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                            Consulter <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </Link>

                {/* Documentation Card */}
                <Link to="/docs" className="group">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all h-full hover:border-[#f5c542]/50">
                        <div className="w-12 h-12 bg-[#f5c542]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6 text-[#f5c542]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#f5c542] transition-colors">Référentiel BDI</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Documentation complète des indicateurs et variables (MOCA-O, DREES).
                        </p>
                        <div className="flex items-center text-sm font-medium text-[#f5c542] opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                            Explorer <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </Link>

                {/* Templates Card */}
                <Link to="/generate" className="group">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all h-full hover:border-[#3bb3a9]/30">
                        <div className="w-12 h-12 bg-[#3bb3a9]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-[#3bb3a9]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#3bb3a9] transition-colors">Modèles Excel</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Télécharger les gabarits vierges pour la saisie manuelle des données.
                        </p>
                        <div className="flex items-center text-sm font-medium text-[#3bb3a9] opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                            Télécharger <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </Link>

            </div>

            {/* Recent Activity */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-[#1a4b8c] mb-4">Activité Récente</h2>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">educ_2022.zip</p>
                                    <p className="text-xs text-gray-500">Éducation • Scolarisation</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">Il y a 2 heures</span>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">pop_cond_vie_2022.zip</p>
                                    <p className="text-xs text-gray-500">Population • Démographie</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">Hier</span>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">pathologies_cardio_2021.xlsx</p>
                                    <p className="text-xs text-gray-500">Pathologies • Cardiovasculaire</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">Il y a 3 jours</span>
                        </div>
                    </div>
                    <Link to="/history" className="block p-3 text-center text-sm font-medium text-[#3bb3a9] hover:bg-[#3bb3a9]/5 border-t border-gray-100">
                        Voir tout l'historique →
                    </Link>
                </div>
            </div>

        </div>
    )
}
