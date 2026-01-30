import { useState, useEffect } from "react"
import { Users, Search, MoreVertical, CheckCircle2, XCircle, UserPlus, Shield, Settings, ToggleLeft, ToggleRight, Mail, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

// 5 fictitious users for demo
const DEMO_USERS = [
    {
        id: "1",
        name: "Dr. Marie Dupont",
        email: "marie.dupont@orsg-ctps.fr",
        role: "Administrateur",
        status: "active",
        lastLogin: "22/01/2026 09:30",
        department: "Direction"
    },
    {
        id: "2",
        name: "Jean-Pierre Martin",
        email: "jp.martin@orsg-ctps.fr",
        role: "Expert",
        status: "active",
        lastLogin: "21/01/2026 14:15",
        department: "Études & Analyses"
    },
    {
        id: "3",
        name: "Sophie Bernard",
        email: "sophie.bernard@orsg-ctps.fr",
        role: "Analyste",
        status: "active",
        lastLogin: "20/01/2026 11:45",
        department: "Data & Statistiques"
    },
    {
        id: "4",
        name: "Thomas Leroy",
        email: "thomas.leroy@orsg-ctps.fr",
        role: "Utilisateur",
        status: "active",
        lastLogin: "18/01/2026 16:00",
        department: "Communication"
    },
    {
        id: "5",
        name: "Claire Moreau",
        email: "claire.moreau@externe.fr",
        role: "Invité",
        status: "inactive",
        lastLogin: "10/01/2026 10:30",
        department: "Consultant Externe"
    },
]

export function AdminUsersPage() {
    const [users, setUsers] = useState<typeof DEMO_USERS>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [simulationMode, setSimulationMode] = useState(true)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [simulationMode])

    async function loadUsers() {
        setLoading(true)

        if (simulationMode) {
            // Use demo data in simulation mode
            setTimeout(() => {
                setUsers(DEMO_USERS)
                setLoading(false)
            }, 300)
        } else {
            // Try to load from PocketBase (will likely fail without server)
            try {
                // In real mode, we would fetch from PocketBase
                // For now, show empty state
                setUsers([])
                setLoading(false)
            } catch (err) {
                console.error("Error loading users:", err)
                setUsers([])
                setLoading(false)
            }
        }
    }

    const toggleStatus = (id: string) => {
        setUsers(users.map(u =>
            u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
        ))
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Administrateur': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'Expert': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'Analyste': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
            case 'Utilisateur': return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'Invité': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getRoleAvatarColor = (role: string) => {
        switch (role) {
            case 'Administrateur': return 'bg-purple-500'
            case 'Expert': return 'bg-blue-500'
            case 'Analyste': return 'bg-cyan-500'
            case 'Utilisateur': return 'bg-gray-500'
            case 'Invité': return 'bg-yellow-500'
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
                <button className="bg-[#3bb3a9] hover:bg-[#2f9a91] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Nouvel Utilisateur
                </button>
            </div>

            {/* Simulation Mode Toggle */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900">Mode Simulation</h3>
                            <p className="text-sm text-amber-700">
                                {simulationMode
                                    ? "Données de démonstration actives - Aucune modification réelle"
                                    : "Mode production - Connexion à la base de données requise"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSimulationMode(!simulationMode)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all",
                            simulationMode
                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        )}
                    >
                        {simulationMode ? (
                            <>
                                <ToggleRight className="w-5 h-5" />
                                Simulation Active
                            </>
                        ) : (
                            <>
                                <ToggleLeft className="w-5 h-5" />
                                Simulation Désactivée
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
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
                    <div className="text-2xl font-bold text-purple-500">{users.filter(u => u.role === 'Administrateur').length}</div>
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
                            {simulationMode
                                ? "Activez le mode simulation pour voir les utilisateurs de démonstration."
                                : "Connectez-vous à la base de données pour gérer les utilisateurs."}
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
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                            {user.name}
                                            {user.role === 'Administrateur' && (
                                                <Shield className="w-4 h-4 text-purple-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span>{user.department}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            Dernière connexion: {user.lastLogin}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <span className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                                        getRoleBadgeColor(user.role)
                                    )}>
                                        {user.role}
                                    </span>

                                    <button
                                        onClick={() => toggleStatus(user.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-colors",
                                            user.status === 'active'
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        )}
                                    >
                                        {user.status === 'active' ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" /> Actif
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4" /> Inactif
                                            </>
                                        )}
                                    </button>

                                    <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Info Card */}
            {simulationMode && (
                <div className="mt-6 bg-[#3bb3a9]/10 border border-[#3bb3a9]/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#3bb3a9]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-[#3bb3a9]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#1a4b8c] mb-1">Mode Démonstration</h4>
                            <p className="text-sm text-gray-600">
                                Les modifications effectuées en mode simulation ne sont pas persistées.
                                Vous pouvez activer/désactiver les utilisateurs pour tester l'interface.
                                Pour gérer les utilisateurs réels, désactivez le mode simulation et connectez-vous à PocketBase.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
