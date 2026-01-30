import { useState } from "react"
import { User, Shield, Key, Bell, Save, Globe, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'account' | 'security' | 'preferences'>('account')

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                <div className="relative">
                    <div className="w-32 h-32 bg-orsg-blue rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                        NC
                    </div>
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-800">Naïssa Château</h2>
                    <p className="text-slate-500 mb-4">Chargée d'Etudes - ORSG-CTPS</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="px-3 py-1 bg-blue-50 text-orsg-blue rounded-full text-sm font-medium">Administrateur</span>
                        <span className="px-3 py-1 bg-green-50 text-orsg-green rounded-full text-sm font-medium">Compte Vérifié</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid md:grid-cols-3 min-h-[500px]">

                    {/* Sidebar Menu */}
                    <div className="bg-gray-50 border-r border-gray-200 p-6 space-y-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Compte</div>
                        <button
                            onClick={() => setActiveTab('account')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                                activeTab === 'account' ? "bg-white shadow-sm text-orsg-blue border border-gray-200" : "text-gray-600 hover:bg-gray-100"
                            )}
                        >
                            <User className="w-4 h-4" /> Informations
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                                activeTab === 'security' ? "bg-white shadow-sm text-orsg-blue border border-gray-200" : "text-gray-600 hover:bg-gray-100"
                            )}
                        >
                            <Shield className="w-4 h-4" /> Sécurité
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                                activeTab === 'preferences' ? "bg-white shadow-sm text-orsg-blue border border-gray-200" : "text-gray-600 hover:bg-gray-100"
                            )}
                        >
                            <Bell className="w-4 h-4" /> Préférences
                        </button>
                    </div>

                    {/* Content Form */}
                    <div className="md:col-span-2 p-8">

                        {activeTab === 'account' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Informations Personnelles</h2>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                                            <input type="text" defaultValue="Naïssa" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                            <input type="text" defaultValue="Château" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email professionnel</label>
                                        <input type="email" defaultValue="n.chateau@orsg-guyane.org" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500" readOnly />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                                        <input type="tel" defaultValue="+594 694 12 34 56" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white" />
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <button type="button" className="bg-orsg-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2">
                                            <Save className="w-4 h-4" /> Enregistrer
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Sécurité & Connexion</h2>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm">
                                            <Key className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Mot de passe</p>
                                            <p className="text-xs text-gray-500">Dernière modification il y a 3 mois</p>
                                        </div>
                                    </div>
                                    <button className="text-sm text-orsg-blue font-medium hover:underline">Modifier</button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Double Authentification (2FA)</p>
                                            <p className="text-xs text-green-700">Activée (Email)</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </div>
                                </div>

                                <button className="w-full border border-red-200 text-red-600 font-medium py-2 rounded-xl hover:bg-red-50 transition-colors text-sm">
                                    Déconnexion de tous les appareils
                                </button>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Préférences de l'application</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 border border-gray-200 rounded-xl hover:border-orsg-blue cursor-pointer transition-colors flex justify-between items-center group">
                                        <div>
                                            <div className="font-semibold text-gray-700 group-hover:text-orsg-blue">Notifications Email</div>
                                            <p className="text-xs text-gray-500">Alertes pour chaque rapport généré.</p>
                                        </div>
                                        <Bell className="w-5 h-5 text-gray-400 group-hover:text-orsg-blue" />
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-xl hover:border-orsg-blue cursor-pointer transition-colors flex justify-between items-center group">
                                        <div>
                                            <div className="font-semibold text-gray-700 group-hover:text-orsg-blue">Langue</div>
                                            <p className="text-xs text-gray-500">Français (Défaut)</p>
                                        </div>
                                        <Globe className="w-5 h-5 text-gray-400 group-hover:text-orsg-blue" />
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-xl hover:border-orsg-blue cursor-pointer transition-colors flex justify-between items-center group">
                                        <div>
                                            <div className="font-semibold text-gray-700 group-hover:text-orsg-blue">Thème</div>
                                            <p className="text-xs text-gray-500">Clair (Système)</p>
                                        </div>
                                        <Moon className="w-5 h-5 text-gray-400 group-hover:text-orsg-blue" />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    )
}
