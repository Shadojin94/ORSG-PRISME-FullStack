import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    Home,
    Layers,
    History,
    BookOpen,
    LogOut,
    UserCircle,
    Users,
    LifeBuoy
} from "lucide-react"

const menuItems = [
    { icon: Home, label: "Accueil", path: "/dashboard" },
    { icon: Layers, label: "Thématiques", path: "/generate" },
    { icon: History, label: "Historique", path: "/history" },
    { icon: BookOpen, label: "Référentiel BDI", path: "/docs" },
    { icon: Users, label: "Gestion Utilisateurs", path: "/admin" },
    { icon: LifeBuoy, label: "Aide & Support", path: "/support" },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <div className="w-64 h-screen bg-[#1a4b8c] flex flex-col fixed left-0 top-0 z-50 text-white shadow-xl">
            {/* Logos Header */}
            <div className="p-6">
                <Link to="/dashboard" className="flex items-center space-x-3 cursor-pointer mb-6">
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

            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium",
                            location.pathname === item.path
                                ? "bg-white text-[#1a4b8c] shadow-md"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-[#3bb3a9]" : "")} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer User Profile */}
            <div className="p-4 border-t border-white/10">
                <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-[#3bb3a9] flex items-center justify-center border border-white/30 group-hover:border-white">
                        <UserCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-medium text-white truncate">Expert ORSG</p>
                        <p className="text-xs text-white/50 group-hover:text-white/80">Mon Profil</p>
                    </div>
                </Link>
                <Link to="/login" className="flex items-center gap-2 mt-2 px-3 py-2 text-xs text-white/40 hover:text-white hover:bg-red-500/20 rounded-md transition-colors">
                    <LogOut className="w-3 h-3" /> Déconnexion
                </Link>
            </div>
        </div>
    )
}
