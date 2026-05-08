import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { roleLabelFr, userInitials } from "@/lib/pocketbase";
import {
    BookOpen,
    History,
    Home,
    Layers,
    LifeBuoy,
    LogOut,
    Shield,
    UserCircle,
    Users,
    X,
} from "lucide-react";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();

    const menuItems = [
        { icon: Home, label: "Pilotage", path: "/dashboard" },
        { icon: Layers, label: "Generateur", path: "/generate" },
        { icon: History, label: "Historique", path: "/history" },
        { icon: BookOpen, label: "Referentiel BDI", path: "/docs" },
        ...(isAdmin ? [{ icon: Users, label: "Utilisateurs", path: "/admin" }] : []),
        { icon: LifeBuoy, label: "Support", path: "/support" },
    ];

    const handleNavClick = (path: string) => {
        if (path === "/generate") {
            try { sessionStorage.removeItem("prisme_generator_state"); } catch (_e) { /* noop */ }
        }
        onClose?.();
    };

    const handleLogout = () => {
        logout();
        onClose?.();
        navigate("/login", { replace: true });
    };

    const displayName = user?.name || user?.email || "Utilisateur";
    const displayRole = user ? roleLabelFr(user.role) : "Profil";
    const initials = userInitials(user);

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-prisme-950 text-white shadow-2xl transition-transform duration-300 ease-out md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
            aria-label="Navigation principale"
        >
            <div className="relative border-b border-white/10 p-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 grid size-9 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white md:hidden"
                    aria-label="Fermer le menu"
                >
                    <X className="size-5" />
                </button>

                <Link to="/dashboard" className="group flex items-center gap-3" onClick={onClose}>
                    <div className="grid size-12 place-items-center rounded-lg bg-white shadow-sm">
                        <div className="flex h-7 items-end gap-1">
                            <span className="h-6 w-2 rounded-sm bg-prisme-gold" />
                            <span className="h-7 w-2 rounded-sm bg-prisme-green" />
                            <span className="h-5 w-2 rounded-sm bg-prisme-teal" />
                        </div>
                    </div>
                    <div>
                        <p className="text-lg font-black leading-none tracking-tight">Data Visus</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">ORSG-CTPS</p>
                    </div>
                </Link>

                <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="mt-0.5 size-4 text-prisme-gold" />
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">Espace securise</p>
                            <p className="mt-1 text-xs leading-relaxed text-white/50">Exports Geoclip, sources CSV et comptes ORSG sous controle.</p>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => handleNavClick(item.path)}
                            className={cn(
                                "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition",
                                active
                                    ? "bg-white text-prisme-950 shadow-sm"
                                    : "text-white/65 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-prisme-teal" />}
                            <item.icon className={cn("size-5 transition", active ? "text-prisme-teal" : "text-white/45 group-hover:text-white")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 bg-black/15 p-4">
                <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-white/10"
                >
                    <div className="relative">
                        <div className="grid size-11 place-items-center rounded-lg bg-prisme-teal text-sm font-black text-white shadow-sm">
                            {user ? initials : <UserCircle className="size-6" />}
                        </div>
                        <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-prisme-950 bg-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black">{displayName}</p>
                        <p className="truncate text-xs text-white/45">{displayRole}</p>
                    </div>
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/60 transition hover:border-red-300/30 hover:bg-red-500/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                    <LogOut className="size-3.5" />
                    Deconnexion
                </button>
            </div>
        </aside>
    );
}
