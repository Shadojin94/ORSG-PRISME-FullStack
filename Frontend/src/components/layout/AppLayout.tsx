import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Sparkles, Activity } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { BackendHealthBanner } from "@/components/BackendHealthBanner";
import { getSystemStatus, type SystemStatus } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
    children: React.ReactNode;
}

const pageMeta: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": {
        title: "Pilotage PRISME",
        subtitle: "Production, qualite et couverture des donnees ORSG-CTPS",
    },
    "/generate": {
        title: "Generation",
        subtitle: "Construire un fichier Geoclip fiable en quelques etapes",
    },
    "/history": {
        title: "Historique",
        subtitle: "Retrouver les exports, sources et traces de production",
    },
    "/docs": {
        title: "Referentiel BDI",
        subtitle: "Definitions, indicateurs et nomenclatures metier",
    },
    "/profile": {
        title: "Profil",
        subtitle: "Compte, role et preferences utilisateur",
    },
    "/admin": {
        title: "Administration",
        subtitle: "Comptes, roles et support operationnel",
    },
    "/support": {
        title: "Support",
        subtitle: "Suivi des demandes et incidents",
    },
};

export function AppLayout({ children }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const location = useLocation();
    const { user } = useAuth();

    const meta = useMemo(() => pageMeta[location.pathname] || pageMeta["/dashboard"], [location.pathname]);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            try {
                const status = await getSystemStatus();
                if (alive) setSystemStatus(status);
            } catch {
                if (alive) setSystemStatus(null);
            }
        };
        load();
        const id = setInterval(load, 60_000);
        return () => {
            alive = false;
            clearInterval(id);
        };
    }, []);

    const statusOk = systemStatus?.status === "ok";
    const pbStatus = systemStatus?.pocketbase?.status || "inconnu";

    return (
        <div className="min-h-screen bg-[var(--surface-app)] text-foreground antialiased">
            <a
                href="#contenu-principal"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-prisme-900 focus:shadow-lg"
            >
                Aller au contenu principal
            </a>

            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-white/10 bg-prisme-900 px-4 py-3 text-white shadow-sm">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="grid size-10 place-items-center rounded-md hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    aria-label="Ouvrir le menu"
                >
                    <Menu className="size-5" />
                </button>
                <div className="text-center">
                    <p className="text-sm font-black tracking-wide">Data Visus</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">ORSG-CTPS</p>
                </div>
                <span className={`size-3 rounded-full ${statusOk ? "bg-emerald-300" : "bg-amber-300"}`} aria-label={statusOk ? "Systeme sain" : "Systeme a verifier"} />
            </div>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {sidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Fermer le menu"
                />
            )}

            <main id="contenu-principal" className="min-h-screen pt-16 md:ml-72 md:pt-0">
                <BackendHealthBanner />

                <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-xl md:px-8">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-prisme-600">
                                <Sparkles className="size-3.5" />
                                Data Visus
                            </p>
                            <h1 className="text-2xl font-black tracking-tight text-prisme-950 md:text-3xl">{meta.title}</h1>
                            <p className="mt-1 max-w-3xl text-sm text-slate-500">{meta.subtitle}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <span className={`size-2.5 rounded-full ${statusOk ? "bg-emerald-500" : "bg-amber-500"}`} />
                                    <span className="text-xs font-bold text-slate-700">
                                        {statusOk ? "Systeme sain" : "Verification requise"}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-500">PocketBase : {pbStatus}</p>
                            </div>

                            <div className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 lg:block">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Connecte</p>
                                <p className="max-w-[180px] truncate text-xs font-bold text-slate-700">{user?.name || user?.email || "Utilisateur"}</p>
                            </div>

                            <Link
                                to="/generate"
                                className="inline-flex items-center gap-2 rounded-lg bg-prisme-900 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-prisme-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-prisme-600"
                            >
                                <Activity className="size-4" />
                                Generer
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="px-4 py-6 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
