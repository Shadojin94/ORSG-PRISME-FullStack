import { useState, useEffect } from "react"
import { User, Shield, Save, Loader2, CheckCircle2, Mail, Clock, ShieldCheck, ShieldOff, KeyRound, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { pb, userInitials } from "@/lib/pocketbase"

export function ProfilePage() {
    const { user, refreshUser } = useAuth()
    const [activeTab, setActiveTab] = useState<'account' | 'security'>('account')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [togglingOtp, setTogglingOtp] = useState(false)

    const [form, setForm] = useState({
        name: '',
        phone: '',
        organization: '',
        department: '',
    })

    // Password change
    const [pwdForm, setPwdForm] = useState({ newPassword: '', confirmPassword: '' })
    const [pwdShow, setPwdShow] = useState(false)
    const [pwdSaving, setPwdSaving] = useState(false)
    const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

    const handleChangePassword = async () => {
        if (!user?.email) return
        setPwdMessage(null)
        if (pwdForm.newPassword.length < 8) {
            setPwdMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' })
            return
        }
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            setPwdMessage({ type: 'error', text: 'La confirmation ne correspond pas au nouveau mot de passe.' })
            return
        }
        setPwdSaving(true)
        try {
            const res = await fetch('/api/auth/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, newPassword: pwdForm.newPassword }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Échec de la mise à jour du mot de passe.')
            }
            setPwdMessage({ type: 'success', text: 'Mot de passe mis à jour. Utilisez-le à votre prochaine connexion.' })
            setPwdForm({ newPassword: '', confirmPassword: '' })
            await refreshUser()
        } catch (err: any) {
            setPwdMessage({ type: 'error', text: err?.message || 'Erreur lors du changement de mot de passe.' })
        }
        setPwdSaving(false)
    }

    const handleToggleOtp = async () => {
        if (!user) return
        const currentOtp = user.otp_enabled !== false
        const newOtp = !currentOtp
        // Warn if disabling OTP without a password set
        if (!newOtp && !user.personal_password_hash) {
            alert("Vous devez d'abord definir un mot de passe avant de desactiver l'OTP. Contactez un administrateur.")
            return
        }
        setTogglingOtp(true)
        try {
            await pb.collection('users').update(user.id, { otp_enabled: newOtp })
            await refreshUser()
        } catch (err) {
            console.error('Failed to toggle OTP:', err)
            alert("Erreur lors du changement du mode d'authentification.")
        }
        setTogglingOtp(false)
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

                                {/* OTP Toggle */}
                                <div className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border",
                                    user?.otp_enabled !== false
                                        ? "bg-sky-50 border-sky-100"
                                        : "bg-gray-50 border-gray-200"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm",
                                            user?.otp_enabled !== false ? "text-sky-600" : "text-gray-400"
                                        )}>
                                            {user?.otp_enabled !== false
                                                ? <ShieldCheck className="w-5 h-5" />
                                                : <ShieldOff className="w-5 h-5" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Authentification par code email (OTP)</p>
                                            <p className={cn("text-xs", user?.otp_enabled !== false ? "text-sky-700" : "text-gray-500")}>
                                                {user?.otp_enabled !== false
                                                    ? "Un code a 6 chiffres vous est envoye a chaque connexion."
                                                    : "Desactive — connexion par mot de passe uniquement."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleToggleOtp}
                                        disabled={togglingOtp}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60",
                                            user?.otp_enabled !== false ? "bg-sky-500" : "bg-gray-300"
                                        )}
                                    >
                                        {togglingOtp ? (
                                            <Loader2 className="w-3 h-3 text-white animate-spin mx-auto" />
                                        ) : (
                                            <span className={cn(
                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                                                user?.otp_enabled !== false ? "translate-x-6" : "translate-x-1"
                                            )} />
                                        )}
                                    </button>
                                </div>

                                {/* Warning if OTP disabled and no password */}
                                {user?.otp_enabled === false && !user?.personal_password_hash && (
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                        <p className="text-sm text-amber-800">
                                            <strong>Attention :</strong> L'OTP est désactivé mais aucun mot de passe n'est configuré.
                                            Définissez-en un ci-dessous pour pouvoir vous connecter sans OTP.
                                        </p>
                                    </div>
                                )}

                                {/* Password change */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm">
                                            <KeyRound className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Mot de passe personnel</p>
                                            <p className="text-xs text-gray-500">
                                                {user?.personal_password_hash
                                                    ? "Un mot de passe est déjà configuré. Vous pouvez le modifier ci-dessous."
                                                    : "Aucun mot de passe défini. Définissez-en un pour vous connecter sans code email."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="relative">
                                            <input
                                                type={pwdShow ? "text" : "password"}
                                                value={pwdForm.newPassword}
                                                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                                placeholder="Nouveau mot de passe"
                                                autoComplete="new-password"
                                                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-orsg-blue/20 outline-none text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPwdShow(!pwdShow)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                                                tabIndex={-1}
                                            >
                                                {pwdShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <input
                                            type={pwdShow ? "text" : "password"}
                                            value={pwdForm.confirmPassword}
                                            onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                                            placeholder="Confirmation"
                                            autoComplete="new-password"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-orsg-blue/20 outline-none text-sm"
                                        />
                                    </div>
                                    {pwdMessage && (
                                        <div className={cn(
                                            "text-sm px-3 py-2 rounded-lg",
                                            pwdMessage.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                                        )}>
                                            {pwdMessage.text}
                                        </div>
                                    )}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={pwdSaving || !pwdForm.newPassword}
                                            className="bg-orsg-blue hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                                        >
                                            {pwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Mettre à jour
                                        </button>
                                    </div>
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
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
