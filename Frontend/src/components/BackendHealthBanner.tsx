import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { checkHealth } from "@/services/api";

/**
 * Bandeau global : si le backend file_server.js ne repond pas,
 * on affiche un message explicite au lieu de laisser l'UI afficher
 * "Aucune donnee disponible" (trompeur).
 * Ping toutes les 30s.
 */
export function BackendHealthBanner() {
    const [offline, setOffline] = useState(false);
    const [checking, setChecking] = useState(false);

    const ping = async () => {
        setChecking(true);
        try {
            const r = await checkHealth();
            setOffline(!r || r.status !== "ok");
        } catch {
            setOffline(true);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        ping();
        const id = setInterval(ping, 30_000);
        return () => clearInterval(id);
    }, []);

    if (!offline) return null;

    return (
        <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 shadow-md text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
                Serveur hors ligne — impossible de charger les donnees. Contactez l'administrateur technique.
            </span>
            <button
                onClick={ping}
                disabled={checking}
                className="ml-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
                <RefreshCw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} />
                Reessayer
            </button>
        </div>
    );
}
