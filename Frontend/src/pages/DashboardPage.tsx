import { Link } from "react-router-dom"
import { Wand2, History, BookOpen, ArrowRight, FileText } from "lucide-react"

export function DashboardPage() {
    return (
        <div className="max-w-6xl mx-auto py-8">

            {/* Welcom Header */}
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bonjour, Admin</h1>
                <p className="text-gray-500">Bienvenue sur votre espace de pilotage des données de santé.</p>
            </div>

            {/* Main Action Card */}
            <div className="mb-12">
                <Link to="/generate" className="block group">
                    <div className="bg-gradient-to-r from-orsg-darkBlue to-blue-900 rounded-2xl p-8 relative overflow-hidden shadow-2xl hover:shadow-blue-900/20 transition-all border border-blue-800 transform hover:-translate-y-1">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <div className="bg-white/10 w-fit px-4 py-1 rounded-full text-xs font-semibold text-blue-200 mb-4 border border-white/10 uppercase tracking-widest">
                                    Nouveau
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Générer un Rapport</h2>
                                <p className="text-blue-100 max-w-xl text-lg leading-relaxed">
                                    Lancez l'assistant intelligent pour transformer vos fichiers CSV MOCA-O en tableaux Excel validés et formatés.
                                </p>
                            </div>
                            <div className="bg-white text-orsg-darkBlue px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-blue-50 transition-colors shadow-lg group-hover:scale-105 duration-200">
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
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all h-full hover:border-orsg-green/30">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <History className="w-6 h-6 text-orsg-green" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orsg-green transition-colors">Historique</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Accédez à vos 12 derniers rapports générés et téléchargez-les à nouveau.
                        </p>
                        <div className="flex items-center text-sm font-medium text-orsg-green opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                            Consulter <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </Link>

                {/* Documentation Card */}
                <Link to="/docs" className="group">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all h-full hover:border-orsg-yellow/50">
                        <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors">Référentiel BDI</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Documentation complète des indicateurs et variables (MOCA-O, DREES).
                        </p>
                        <div className="flex items-center text-sm font-medium text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                            Explorer <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </Link>

                {/* Templates Card (Placeholder) */}
                <div className="group cursor-pointer">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all h-full hover:border-orsg-blue/30">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-orsg-blue" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orsg-blue transition-colors">Modèles Excel</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Télécharger les gabarits vierges pour la saisie manuelle des données.
                        </p>
                        <div className="flex items-center text-sm font-medium text-orsg-blue opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                            Télécharger <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}
