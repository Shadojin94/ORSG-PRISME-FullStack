import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { userInitials, roleLabelFr } from "@/lib/pocketbase"
import {
    BookOpen,
    History,
    Home,
    Layers,
    LifeBuoy,
    LogOut,
    UserCircle,
    Users,
    X,
} from "lucide-react"

interface SidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isAdmin, logout } = useAuth()

    const menuItems = [
        { icon: Home, label: "Accueil", path: "/dashboard" },
        { icon: Layers, label: "Generer", path: "/generate" },
        { icon: History, label: "Fichiers", path: "/history" },
        { icon: BookOpen, label: "Dictionnaire BDI", path: "/docs" },
        ...(isAdmin ? [{ icon: Users, label: "Comptes", path: "/admin" }] : []),
        { icon: LifeBuoy, label: "Support", path: "/support" },
    ]

    const handleNavClick = (path: string) => {
        if (path === "/generate") {
            try { sessionStorage.removeItem("prisme_generator_state") } catch (_e) { /* ignore */ }
        }
        onClose?.()
    }

    const handleLogout = () => {
        logout()
        onClose?.()
        navigate("/login", { replace: true })
    }

    const displayName = user?.name || "Utilisateur"
    const displayRole = user ? roleLabelFr(user.role) : "Mon profil"
    const initials = userInitials(user)

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a4b8c] text-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="relative p-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white md:hidden"
                    aria-label="Fermer le menu"
                >
                    <X className="h-5 w-5" />
                </button>

                <Link to="/dashboard" className="mb-6 flex items-center gap-3" onClick={onClose}>
                    <div className="flex items-center">
                        <span className="h-6 w-3 rounded-l-sm bg-[#f5c542]" />
                        <span className="h-6 w-3 bg-[#4caf50]" />
                        <span className="h-6 w-3 rounded-r-sm bg-[#3bb3a9]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-wide text-white">Data Visus</h1>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">ORSG-CTPS</p>
                    </div>
                </Link>
            </div>

            <nav className="h-[calc(100vh-210px)] flex-1 space-y-1 overflow-y-auto px-4">
                {menuItems.map((item) => {
                    const active = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => handleNavClick(item.path)}
                            className={cn(
                                "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition",
                                active
                                    ? "bg-white text-[#1a4b8c] shadow-sm"
                                    : "text-white/72 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {active && <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r bg-[#3bb3a9]" />}
                            <item.icon className={cn("h-5 w-5", active ? "text-[#3bb3a9]" : "text-white/55 group-hover:text-white")} />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="absolute bottom-0 w-full border-t border-white/10 bg-[#153e75] p-4">
                <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-white/5"
                >
                    <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-[#3bb3a9] text-sm font-black text-white">
                            {user ? initials : <UserCircle className="h-6 w-6" />}
                        </div>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#153e75] bg-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-white">{displayName}</p>
                        <p className="truncate text-xs text-white/55">{displayRole}</p>
                    </div>
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-transparent p-2 text-xs font-bold text-white/65 transition hover:border-red-500/30 hover:bg-red-500/20 hover:text-white"
                >
                    <LogOut className="h-3 w-3" />
                    Deconnexion
                </button>
            </div>
        </aside>
    )
}
