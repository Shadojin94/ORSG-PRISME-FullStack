import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    Home,
    Layers,
    History,
    BookOpen,
    LogOut,
    UserCircle,
    Users,
    LifeBuoy,
    X
} from "lucide-react"

const menuItems = [
    { icon: Home, label: "Accueil", path: "/dashboard" },
    { icon: Layers, label: "Thématiques", path: "/generate" },
    { icon: History, label: "Historique", path: "/history" },
    { icon: BookOpen, label: "Référentiel BDI", path: "/docs" },
    { icon: Users, label: "Gestion Utilisateurs", path: "/admin" },
    { icon: LifeBuoy, label: "Aide & Support", path: "/support" },
]

interface SidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()

    const handleNavClick = (path: string) => {
        // Clicking "Thématiques" always resets generator to step 1
        if (path === '/generate') {
            try { sessionStorage.removeItem('prisme_generator_state'); } catch (e) { }
        }
        onClose?.()
    }

    const handleLogout = () => {
        localStorage.removeItem("demo_authenticated")
        sessionStorage.clear()
        onClose?.()
        navigate("/login", { replace: true })
    }

    return (
        <div className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a4b8c] text-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Logos Header */}
            <div className="p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white md:hidden"
                >
                    <X className="w-5 h-5" />
                </button>

                <Link to="/dashboard" className="flex items-center space-x-3 cursor-pointer mb-6" onClick={onClose}>
                    <div className="flex items-center">
                        <span className="w-3 h-6 bg-[#f5c542] rounded-l-sm"></span>
                        <span className="w-3 h-6 bg-[#4caf50]"></span>
                        <span className="w-3 h-6 bg-[#3bb3a9] rounded-r-sm"></span>
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-wide">
                        Data Visus
                    </h1>
                </Link>
                <div className="px-3 py-1 bg-white/10 rounded-full inline-block">
                    <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">ORSG-CTPS</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto h-[calc(100vh-200px)] custom-scrollbar">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium group relative overflow-hidden",
                            location.pathname === item.path
                                ? "bg-white text-[#1a4b8c] shadow-md translate-x-1"
                                : "text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1"
                        )}
                    >
                        {/* Active Indicator Line */}
                        {location.pathname === item.path && (
                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#3bb3a9] rounded-l-lg" />
                        )}

                        <item.icon className={cn(
                            "w-5 h-5 transition-transform duration-300",
                            location.pathname === item.path ? "text-[#3bb3a9] scale-110" : "group-hover:scale-110"
                        )} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer User Profile */}
            <div className="absolute bottom-0 w-full p-4 border-t border-white/10 bg-[#153e75]">
                <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                >
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3bb3a9] to-[#2f9a91] flex items-center justify-center border-2 border-white/20 group-hover:border-white transition-colors shadow-lg">
                            <UserCircle className="w-6 h-6 text-white" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#153e75] rounded-full"></span>
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-bold text-white truncate">Expert ORSG</p>
                        <p className="text-xs text-white/50 group-hover:text-white/80 transition-colors">Mon Profil</p>
                    </div>
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 mt-3 p-2 w-full text-xs font-medium text-white/60 hover:text-white hover:bg-red-500/20 rounded-lg transition-all border border-transparent hover:border-red-500/30 cursor-pointer"
                >
                    <LogOut className="w-3 h-3" /> Déconnexion
                </button>
            </div>
        </div>
    )
}
