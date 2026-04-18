import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Users, Search, MoreVertical, CheckCircle2, XCircle, UserPlus, Shield, Mail, Calendar, X, Loader2, ShieldCheck, ShieldOff, Pencil, KeyRound, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { pb, roleLabelFr } from "@/lib/pocketbase"
import type { PrismeUser } from "@/lib/pocketbase"

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

    const getRoleAvatarColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-500'
            case 'expert': return 'bg-blue-500'
            case 'analyste': return 'bg-cyan-500'
            case 'utilisateur': return 'bg-gray-500'
            case 'invite': return 'bg-yellow-500'
            default: return 'bg-gray-400'
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a4b8c] mb-2">Gestion des Utilisateurs</h1>
                    <p className="text-gray-600">
                        Administration des accès et des rôles de la plateforme.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#3bb3a9] hover:bg-[#2f9a91] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" /> Nouvel Utilisateur
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-[#1a4b8c]">{users.length}</div>
                    <div className="text-xs text-gray-500">Utilisateurs total</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-[#4caf50]">{users.filter(u => u.status === 'active').length}</div>
                    <div className="text-xs text-gray-500">Actifs</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-red-500">{users.filter(u => u.status === 'inactive').length}</div>
                    <div className="text-xs text-gray-500">Inactifs</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-purple-500">{users.filter(u => u.role === 'admin').length}</div>
                    <div className="text-xs text-gray-500">Administrateurs</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="font-bold text-gray-900">{filteredUsers.length}</span> utilisateurs
                    </div>
                </div>

                {/* User List */}
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-[#3bb3a9] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Chargement des utilisateurs...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-gray-700 mb-2">Aucun utilisateur</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            Aucun utilisateur ne correspond à votre recherche.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg",
                                        getRoleAvatarColor(user.role)
                                    )}>
                                        {(user.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                            {user.name || user.email}
                                            {user.role === 'admin' && (
                                                <Shield className="w-4 h-4 text-purple-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </span>
                                            {user.department && (
                                                <>
                                                    <span className="text-gray-300">&bull;</span>
                                                    <span>{user.department}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            Créé le : {new Date(user.created).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap justify-end">
                                    <span className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
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
                                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                        {menuOpen === user.id && (
                                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 w-56">
                                                <button
                                                    onClick={() => { setEditingUser(user); setMenuOpen(null); }}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                                >
                                                    <Pencil className="w-3.5 h-3.5 text-gray-500" /> Modifier le profil
                                                </button>
                                                <button
                                                    onClick={() => { resetPassword(user); setMenuOpen(null); }}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                                >
                                                    <KeyRound className="w-3.5 h-3.5 text-gray-500" /> Réinitialiser le mot de passe
                                                </button>
                                                <div className="border-t border-gray-100 my-1" />
                                                <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase">Changer le rôle</div>
                                                {ROLE_OPTIONS.map(role => (
                                                    <button
                                                        key={role}
                                                        onClick={() => { updateRole(user.id, role); setMenuOpen(null); }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50",
                                                            user.role === role ? "text-[#1a4b8c] font-bold" : "text-gray-700"
                                                        )}
                                                    >
                                                        {roleLabelFr(role)}
                                                    </button>
                                                ))}
                                                <div className="border-t border-gray-100 my-1" />
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
                    <h3 className="text-xl font-bold text-gray-900">Modifier le profil</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value={user.email || ''} readOnly className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500" />
                        <p className="text-xs text-gray-400 mt-1">L'email n'est pas modifiable depuis cette interface.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+594 694 XX XX XX"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
                            <input
                                type="text"
                                value={form.organization}
                                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                            <input
                                type="text"
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3bb3a9]/20 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Annuler</button>
                        <button onClick={submit} disabled={saving} className="flex-1 px-4 py-2 bg-[#3bb3a9] text-white rounded-lg font-bold hover:bg-[#2f9a91] disabled:opacity-60 flex items-center justify-center gap-2">
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
                    <h3 className="text-xl font-bold text-gray-900">Nouvel Utilisateur</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                            placeholder="Prénom Nom"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                            placeholder="prenom.nom@orsg.fr"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                            >
                                {ROLE_OPTIONS.map(r => (
                                    <option key={r} value={r}>{roleLabelFr(r)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                            <input
                                type="text"
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orsg-blue/20 outline-none"
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
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="flex-1 px-4 py-2 bg-[#3bb3a9] text-white rounded-lg font-bold hover:bg-[#2f9a91] disabled:opacity-60 flex items-center justify-center gap-2"
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
