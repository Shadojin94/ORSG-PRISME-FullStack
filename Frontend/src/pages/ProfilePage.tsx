import { useState, useEffect } from "react"
import { User, Shield, Save, Loader2, CheckCircle2, Mail, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { pb, userInitials } from "@/lib/pocketbase"

export function ProfilePage() {
    const { user, refreshUser } = useAuth()
    const [activeTab, setActiveTab] = useState<'account' | 'security'>('account')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const [form, setForm] = useState({
        name: '',
        phone: '',
        organization: '',
        department: '',
    })

    // Load user data into form
    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                phone: user.phone || '',
                organization: user.organization || '',
                department: user.department || '',
            })
        }
    }, [user])

    const handleSave = async () => {
        if (!user) return
        setSaving(true)
        setSaved(false)
        try {
            await pb.collection('users').update(user.id, {
                name: form.name,
                phone: form.phone,
                organization: form.organization,
                department: form.department,
            })
            await refreshUser()
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error('Failed to update profile:', err)
            alert('Erreur lors de la sauvegarde du profil.')
        }
        setSaving(false)
    }

    const initials = userInitials(user)

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                <div className="relative">
                    <div className="w-32 h-32 bg-orsg-blue rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                        {initials}
                    </div>
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-800">{user?.name || 'Utilisateur'}</h2>
                    <p className="text-slate-500 mb-4">
                        {user?.department ? `${user.department} - ` : ''}{user?.organization || 'ORSG-CTPS'}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        {user?.role === 'admin' && (
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">Administrateur</span>
                        )}
                        <span className="px-3 py-1 bg-green-50 text-orsg-green rounded-full text-sm font-medium">Compte Actif</span>
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
                            <Shield className="w-4 h-4" /> Securite
                        </button>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2 p-8">

                        {activeTab === 'account' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Informations Personnelles</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email professionnel</label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                                            readOnly
                                        />
                                        <p className="text-xs text-gray-400 mt-1">L'email ne peut pas etre modifie. Contactez un administrateur.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Telephone</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="+594 694 XX XX XX"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Organisation</label>
                                            <input
                                                type="text"
                                                value={form.organization}
                                                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                                                placeholder="ORSG-CTPS"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Departement</label>
                                            <input
                                                type="text"
                                                value={form.department}
                                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                                placeholder="Direction"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end items-center gap-3">
                                        {saved && (
                                            <span className="text-sm text-green-600 flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" /> Enregistre
                                            </span>
                                        )}
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="bg-orsg-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-60"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Enregistrer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">Securite & Connexion</h2>

                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Authentification par code email</p>
                                            <p className="text-xs text-green-700">
                                                Chaque connexion necessite un code a 6 chiffres envoye a votre adresse email.
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Actif</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Email associe</p>
                                            <p className="text-sm text-gray-600">{user?.email || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Compte cree le</p>
                                            <p className="text-sm text-gray-600">
                                                {user?.created ? new Date(user.created).toLocaleDateString('fr-FR', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                }) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-sm text-blue-800">
                                        <strong>Pas de mot de passe a retenir.</strong> Votre compte est protege par un code temporaire
                                        envoye par email a chaque connexion. Ce mecanisme garantit un haut niveau de securite
                                        sans risque de mot de passe compromis.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
