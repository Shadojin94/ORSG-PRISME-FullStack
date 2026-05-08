import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { getSystemStatus } from "@/services/api";

export function BackendHealthBanner() {
    const [offline, setOffline] = useState(false);
    const [degraded, setDegraded] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);

    const ping = async () => {
        setChecking(true);
        try {
            const status = await getSystemStatus();
            setOffline(false);

            if (!status || status.status !== "ok") {
                const failingDirs = status?.directories
                    ?.filter(d => !d.exists || !d.writable)
                    ?.map(d => d.label)
                    ?.join(", ");
                setDegraded(failingDirs || "PocketBase ou stockage a verifier");
            } else {
                setDegraded(null);
            }
        } catch {
            setOffline(true);
            setDegraded(null);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        ping();
        const id = setInterval(ping, 30_000);
        return () => clearInterval(id);
    }, []);

    if (!offline && !degraded) return null;

    return (
        <div className={`${offline ? "bg-red-600" : "bg-amber-500"} text-white px-4 py-2.5 flex items-center justify-center gap-3 shadow-md text-sm font-medium`}>
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
                {offline
                    ? "Serveur hors ligne - impossible de charger les donnees."
                    : `Attention exploitation - ${degraded}.`}
            </span>
            <button
                onClick={ping}
                disabled={checking}
                className="ml-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
                <RefreshCw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} />
                Reessayer
            </button>
        </div>
    );
}
