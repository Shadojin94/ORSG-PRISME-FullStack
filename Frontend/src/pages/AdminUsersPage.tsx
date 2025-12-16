import { useState, useEffect } from "react"
import { Users, Search, MoreVertical, Shield, ShieldAlert, CheckCircle2, XCircle } from "lucide-react"

import { pb } from "../lib/pocketbase"

export function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        try {
            const records = await pb.collection('users').getFullList({ sort: '-created' })
            setUsers(records.map(r => ({
                id: r.id,
                name: r.name || r.username,
                email: r.email,
                role: "Utilisateur", // Default for now
                status: "active"     // Default for now
            })))
        } catch (err) {
            console.error("Error loading users:", err)
        } finally {
            setLoading(false)
        }
    }

    const toggleStatus = (id: string) => {
        // Todo: Implement Backend Update
        setUsers(users.map(u =>
            u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
        ))
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-orsg-darkBlue mb-2">Gestion des Utilisateurs</h1>
                    <p className="text-gray-600">
                        Administration des accès et des rôles de la plateforme.
                    </p>
                </div>
                <button className="bg-orsg-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2">
                    <Users className="w-4 h-4" /> Nouvel Utilisateur
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                        />
                    </div>
                </div>

                {/* User List */}
                <div className="divide-y divide-gray-100">
                    {users.map((user) => (
                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role.includes('Admin') ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {user.role}
                                </span>

                                <button
                                    onClick={() => toggleStatus(user.id)}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${user.status === 'active'
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        }`}
                                >
                                    {user.status === 'active' ? (
                                        <>
                                            <CheckCircle2 className="w-3 h-3" /> Actif
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-3 h-3" /> Inactif
                                        </>
                                    )}
                                </button>

                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}
