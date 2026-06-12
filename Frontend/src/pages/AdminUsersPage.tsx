import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Users, Search, MoreVertical, CheckCircle2, XCircle, UserPlus, Shield, Mail, Calendar, X, Loader2, ShieldCheck, ShieldOff, Pencil, KeyRound, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { PageHero } from "@/components/ui/PageHero"
import { Avatar } from "@/components/ui/Avatar"
import { useAuth } from "@/hooks/useAuth"
import { pb, roleLabelFr } from "@/lib/pocketbase"
import type { PrismeUser } from "@/lib/pocketbase"
import { getSettings, saveSettings } from "@/services/api"

const ROLE_OPTIONS = ['admin', 'expert', 'analyste', 'utilisateur', 'invite'] as const

export function AdminUsersPage() {
    const { isAdmin } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState<PrismeUser[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingUser, setEditingUser] = useState<PrismeUser | null>(null)
    const [menuOpen, setMenuOpen] = useState<string | null>(null)

    // Redirect non-admin
    useEffect(() => {
        if (!isAdmin) navigate('/dashboard', { replace: true })
    }, [isAdmin, navigate])

    const loadUsers = useCallback(async () => {
        setLoading(true)
        try {
            const records = await pb.collection('users').getFullList<PrismeUser>({ sort: '-created' })
            setUsers(records)
        } catch (err) {
            console.error("Error loading users:", err)
            setUsers([])
        }
        setLoading(false)
    }, [])

    useEffect(() => { loadUsers() }, [loadUsers])

    const toggleStatus = async (user: PrismeUser) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active'
        try {
            await pb.collection('users').update(user.id, { status: newStatus })
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
        } catch (err) {
            console.error("Error toggling status:", err)
            alert("Erreur lors du changement de statut.")
        }
    }

    const toggleOtp = async (user: PrismeUser) => {
        // otp_enabled defaults to true when null/undefined
        const currentOtp = user.otp_enabled !== false
        const newOtp = !currentOtp
        try {
            await pb.collection('users').update(user.id, { otp_enabled: newOtp })
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, otp_enabled: newOtp } : u))
        } catch (err) {
            console.error("Error toggling OTP:", err)
            alert("Erreur lors du changement du mode d'authentification.")
        }
    }

    const updateRole = async (userId: string, newRole: string) => {
        try {
            await pb.collection('users').update(userId, { role: newRole })
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as PrismeUser['role'] } : u))
        } catch (err) {
            console.error("Error updating role:", err)
            alert("Erreur lors du changement de rôle.")
        }
    }

    const resetPassword = async (user: PrismeUser) => {
        if (!user.email) return
        if (!confirm(`Envoyer un mot de passe temporaire à ${user.email} ? L'utilisateur recevra un email pour se reconnecter.`)) return
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Échec de la réinitialisation.')
            }
            alert(`Email envoyé à ${user.email}. L'utilisateur pourra se reconnecter avec le mot de passe temporaire reçu.`)
        } catch (err: any) {
            console.error('Reset password error:', err)
            alert(err?.message || "Erreur lors de la réinitialisation du mot de passe.")
        }
    }

    const deleteUser = async (user: PrismeUser) => {
        if (!confirm(`Supprimer définitivement le compte ${user.name || user.email} ? Cette action est irréversible.`)) return
        try {
            await pb.collection('users').delete(user.id)
            setUsers(prev => prev.filter(u => u.id !== user.id))
        } catch (err) {
            console.error('Delete user error:', err)
            alert("Erreur lors de la suppression du compte.")
        }
    }

    const saveEdit = async (patch: Partial<PrismeUser>) => {
        if (!editingUser) return
        try {
            const updated = await pb.collection('users').update<PrismeUser>(editingUser.id, patch)
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updated } : u))
            setEditingUser(null)
        } catch (err) {
            console.error('Edit user error:', err)
            alert("Erreur lors de la modification du profil utilisateur.")
        }
    }

    const filteredUsers = users.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        roleLabelFr(user.role).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'expert': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'analyste': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
            case 'utilisateur': return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'invite': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

            <PageHero
                icon={Users}
                eyebrow="Administration"
                title="Comptes utilisateurs"
                description="Gerez les acces, roles et statuts des membres de la plateforme."
                actions={
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-[#f5c542] px-4 py-2.5 text-sm font-black text-[#1a4b8c] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#f3bd2a] hover:shadow-xl"
                    >
                        <UserPlus className="h-4 w-4" /> Nouvel Utilisateur
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1a4b8c]/10 text-[#1a4b8c] mb-3">
                        <Users className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-black text-[#1a4b8c]">{users.length}</div>
                    <div className="text-xs text-slate-500">Utilisateurs total</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#4caf50]/10 text-[#4caf50] mb-3">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-black text-[#4caf50]">{users.filter(u => u.status === 'active').length}</div>
                    <div className="text-xs text-slate-500">Actifs</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-600 mb-3">
                        <XCircle className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-black text-red-500">{users.filter(u => u.status === 'inactive').length}</div>
                    <div className="text-xs text-slate-500">Inactifs</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-600 mb-3">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-black text-purple-500">{users.filter(u => u.role === 'admin').length}</div>
                    <div className="text-xs text-slate-500">Administrateurs</div>
                </motion.div>
            </div>

            {/* Contact support editable */}
            <ContactSupportCard />

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                        />
                    </div>
                    <div className="text-sm text-slate-500">
                        <span className="font-black text-[#1a4b8c]">{filteredUsers.length}</span> utilisateurs
                    </div>
                </div>

                {/* User List */}
                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin text-[#3bb3a9]" />
                        Chargement...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#1a4b8c]/10 to-[#3bb3a9]/10">
                            <Users className="h-9 w-9 text-[#1a4b8c]/60" />
                        </div>
                        <h3 className="font-black text-[#1a4b8c] mb-1">Aucun utilisateur</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                            Aucun utilisateur ne correspond à votre recherche.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredUsers.map((user, idx) => (
                            <div key={user.id} className="p-4 flex items-center justify-between transition-colors hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <Avatar user={user} className="h-12 w-12 rounded-xl text-lg" />
                                    <div>
                                        <div className="font-black text-[#1a4b8c] flex items-center gap-2">
                                            {user.name || user.email}
                                            {user.role === 'admin' && (
                                                <Shield className="w-4 h-4 text-purple-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </span>
                                            {user.department && (
                                                <>
                                                    <span className="text-slate-300">&bull;</span>
                                                    <span>{user.department}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            Créé le : {new Date(user.created).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap justify-end">
                                    <span className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-black border",
                                        getRoleBadgeColor(user.role)
                                    )}>
                                        {roleLabelFr(user.role)}
                                    </span>

                                    {/* OTP toggle */}
                                    <button
                                        onClick={() => toggleOtp(user)}
                                        title={user.otp_enabled !== false ? "OTP actif — cliquer pour désactiver" : "OTP inactif — cliquer pour activer"}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                                            user.otp_enabled !== false
                                                ? 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        )}
                                    >
                                        {user.otp_enabled !== false ? (
                                            <><ShieldCheck className="w-3.5 h-3.5" /> OTP</>
                                        ) : (
                                            <><ShieldOff className="w-3.5 h-3.5" /> OTP off</>
                                        )}
                                    </button>

                                    {/* Status toggle */}
                                    <button
                                        onClick={() => toggleStatus(user)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-colors",
                                            user.status === 'active'
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        )}
                                    >
                                        {user.status === 'active' ? (
                                            <><CheckCircle2 className="w-4 h-4" /> Actif</>
                                        ) : (
                                            <><XCircle className="w-4 h-4" /> Inactif</>
                                        )}
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                                            className="text-slate-400 hover:text-[#1a4b8c] p-2 rounded-lg hover:bg-slate-100"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                        {menuOpen === user.id && (
                                            <div className={cn(
                                                "absolute right-0 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-30 w-56",
                                                idx >= filteredUsers.length - 2 ? "bottom-full mb-1" : "top-full mt-1"
                                            )}>
                                                <button
                                                    onClick={() => { setEditingUser(user); setMenuOpen(null); }}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                                >
                                                    <Pencil className="w-3.5 h-3.5 text-slate-400" /> Modifier le profil
                                                </button>
                                                <button
                                                    onClick={() => { resetPassword(user); setMenuOpen(null); }}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                                >
                                                    <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Réinitialiser le mot de passe
                                                </button>
                                                <div className="border-t border-slate-100 my-1" />
                                                <div className="px-3 py-1 text-xs font-black text-slate-400 uppercase tracking-wide">Changer le rôle</div>
                                                {ROLE_OPTIONS.map(role => (
                                                    <button
                                                        key={role}
                                                        onClick={() => { updateRole(user.id, role); setMenuOpen(null); }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50",
                                                            user.role === role ? "text-[#1a4b8c] font-black" : "text-slate-700"
                                                        )}
                                                    >
                                                        {roleLabelFr(role)}
                                                    </button>
                                                ))}
                                                <div className="border-t border-slate-100 my-1" />
                                                <button
                                                    onClick={() => { deleteUser(user); setMenuOpen(null); }}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Supprimer le compte
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <CreateUserModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => { setShowCreateModal(false); loadUsers(); }}
                />
            )}

            {/* Close menu on outside click */}
            {menuOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
            )}

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={saveEdit}
                />
            )}
        </main>
    )
}

// ===== Contact Support Card (email admin configurable) =====

function ContactSupportCard() {
    const [email, setEmail] = useState('')
    const [cc, setCc] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        getSettings()
            .then(s => { setEmail(s.contact_email || ''); setCc(s.contact_email_cc || '') })
            .catch(() => setError("Impossible de charger les paramètres."))
            .finally(() => setLoading(false))
    }, [])

    const submit = async () => {
        setSaving(true)
        setError('')
        const res = await saveSettings({ contact_email: email.trim(), contact_email_cc: cc.trim() })
        setSaving(false)
        if (res.success) {
            setSaved(true)
            setTimeout(() => setSaved(false), 4000)
        } else {
            setError(res.error || "Erreur lors de l'enregistrement.")
        }
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#1a4b8c]/15 to-[#3bb3a9]/15 text-[#1a4b8c]">
                    <Mail className="h-5 w-5" />
                </span>
                <div>
                    <h2 className="text-lg font-black text-[#1a4b8c]">Contact support</h2>
                    <p className="text-xs text-slate-500">Adresse affichée sur la page Support (« Contacter l'admin »).</p>
                </div>
            </div>

            {loading ? (
                <div className="py-4"><Loader2 className="h-5 w-5 animate-spin text-[#3bb3a9]" /></div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Email de contact</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="support@ors-guyane.org"
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Copie (CC) — optionnel</label>
                        <input
                            type="email"
                            value={cc}
                            onChange={(e) => setCc(e.target.value)}
                            placeholder="copie@ors-guyane.org"
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20"
                        />
                    </div>
                    <div className="flex items-center gap-3 sm:col-span-2">
                        <button
                            onClick={submit}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-lg bg-[#1a4b8c] px-5 py-2.5 text-sm font-black text-white shadow-sm transition-all hover:bg-[#153e75] disabled:opacity-60"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Enregistrer
                        </button>
                        {saved && (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle2 className="h-4 w-4" /> Enregistré
                            </span>
                        )}
                        {error && (
                            <span className="flex items-center gap-1 text-sm text-red-600">
                                <XCircle className="h-4 w-4" /> {error}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// ===== Edit User Modal =====

function EditUserModal({ user, onClose, onSave }: { user: PrismeUser; onClose: () => void; onSave: (patch: Partial<PrismeUser>) => Promise<void> | void }) {
    const [form, setForm] = useState({
        name: user.name || '',
        phone: user.phone || '',
        organization: user.organization || 'ORSG-CTPS',
        department: user.department || '',
    })
    const [saving, setSaving] = useState(false)

    const submit = async () => {
        setSaving(true)
        await onSave(form)
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-[#1a4b8c]">Modifier le profil</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input type="email" value={user.email || ''} readOnly className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500" />
                        <p className="text-xs text-slate-400 mt-1">L'email n'est pas modifiable depuis cette interface.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nom complet</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Téléphone</label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+594 694 XX XX XX"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Organisation</label>
                            <input
                                type="text"
                                value={form.organization}
                                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Département</label>
                            <input
                                type="text"
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 bg-white rounded-lg text-[#1a4b8c] font-bold hover:border-[#3bb3a9]">Annuler</button>
                        <button onClick={submit} disabled={saving} className="flex-1 px-4 py-2 bg-[#1a4b8c] text-white rounded-lg font-black hover:bg-[#153e75] disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ===== Create User Modal =====

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'utilisateur' as string,
        department: '',
        organization: 'ORSG-CTPS',
    })
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')

    const handleCreate = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            setError("Le nom et l'email sont obligatoires.")
            return
        }
        setCreating(true)
        setError('')
        try {
            // Create user via backend API (which handles password generation)
            const res = await fetch('/api/auth/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                setError(data.error || "Erreur lors de la création de l'utilisateur.")
                setCreating(false)
                return
            }
            onCreated()
        } catch {
            setError("Impossible de contacter le serveur.")
            setCreating(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-[#1a4b8c]">Nouvel Utilisateur</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nom complet *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                            placeholder="Prénom Nom"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                            placeholder="prenom.nom@orsg.fr"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Rôle</label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                            >
                                {ROLE_OPTIONS.map(r => (
                                    <option key={r} value={r}>{roleLabelFr(r)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Département</label>
                            <input
                                type="text"
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                                placeholder="Direction"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-200 bg-white rounded-lg text-[#1a4b8c] font-bold hover:border-[#3bb3a9]"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="flex-1 px-4 py-2 bg-[#1a4b8c] text-white rounded-lg font-black hover:bg-[#153e75] disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            Créer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
