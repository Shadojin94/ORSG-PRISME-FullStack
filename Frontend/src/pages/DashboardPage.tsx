import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Activity,
    ArrowRight,
    Database,
    Download,
    FileSpreadsheet,
    Globe2,
    History,
    Layers3,
    RefreshCw,
    ShieldCheck,
    UploadCloud,
} from "lucide-react";
import { getFiles, getSystemStatus, type GeneratedFile, type SystemStatus } from "@/services/api";
import { formatDateFR } from "@/utils/date";

function StatTile({ label, value, helper, icon: Icon, tone = "blue" }: {
    label: string;
    value: string | number;
    helper: string;
    icon: React.ElementType;
    tone?: "blue" | "teal" | "green" | "gold";
}) {
    const tones = {
        blue: "bg-prisme-900 text-white",
        teal: "bg-prisme-teal text-white",
        green: "bg-prisme-green text-white",
        gold: "bg-prisme-gold text-prisme-950",
    };

    return (
        <article className="dv-panel p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-bold text-slate-500">{label}</p>
                    <p className="mt-3 text-3xl font-black tracking-tight text-prisme-950">{value}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{helper}</p>
                </div>
                <div className={`grid size-11 place-items-center rounded-lg ${tones[tone]}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </article>
    );
}

function StatusLine({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-700">{label}</p>
                <p className="truncate text-xs text-slate-500">{detail}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                <span className={`size-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />
                {ok ? "OK" : "A verifier"}
            </span>
        </div>
    );
}

function themeFromFilename(file: GeneratedFile) {
    return file.theme || file.filename.replace(/(_opendata)?_\d{4}.+$/, "");
}

export function DashboardPage() {
    const [files, setFiles] = useState<GeneratedFile[]>([]);
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const [nextFiles, nextStatus] = await Promise.all([getFiles(), getSystemStatus()]);
            setFiles(nextFiles);
            setStatus(nextStatus);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const metrics = useMemo(() => {
        const themes = new Set(files.map(themeFromFilename));
        const years = new Set(files.map(f => f.filename.match(/(\d{4})/)?.[1]).filter(Boolean));
        const openData = files.filter(f => f.source === "Open Data").length;
        const moca = files.length - openData;
        const latest = files[0]?.date || null;
        return { themes: themes.size, years: years.size, openData, moca, latest };
    }, [files]);

    const recentFiles = files.slice(0, 6);
    const outputDir = status?.directories.find(d => d.label === "Rapports generes");
    const csvDir = status?.directories.find(d => d.label === "Sources CSV importees");
    const pbDir = status?.directories.find(d => d.label === "Base PocketBase");
    const stateDir = status?.directories.find(d => d.label === "Historique applicatif");

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
                <div className="overflow-hidden rounded-lg bg-prisme-950 text-white shadow-sm">
                    <div className="relative p-6 md:p-8">
                        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(135deg,rgba(47,183,170,.28),rgba(245,197,66,.18))] lg:block" />
                        <div className="relative max-w-3xl">
                            <p className="dv-kicker text-prisme-gold">Plateforme epidemiologique</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                                Transformer les sources ORSG en exports fiables, traçables et relançables.
                            </h2>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                                Le tableau de bord priorise l'exploitation : état de la base, disponibilité des exports,
                                sources importées et prochains gestes utiles pour l'équipe métier.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link to="/generate" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-black text-prisme-950 transition hover:bg-prisme-gold">
                                    Generer un export
                                    <ArrowRight className="size-4" />
                                </Link>
                                <Link to="/history" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-black text-white/85 transition hover:bg-white/10">
                                    Voir l'historique
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="dv-panel p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="dv-kicker">Exploitation</p>
                            <h3 className="mt-1 text-xl font-black text-prisme-950">Statut systeme</h3>
                        </div>
                        <button
                            type="button"
                            onClick={load}
                            className="grid size-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:text-prisme-900"
                            aria-label="Actualiser le statut"
                        >
                            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                    <div className="mt-4 space-y-2">
                        <StatusLine label="PocketBase" ok={status?.pocketbase.status === "ok"} detail={`${status?.pocketbase.latency_ms ?? "-"} ms`} />
                        <StatusLine label="Base utilisateurs" ok={!!pbDir?.exists && !!pbDir?.writable} detail={pbDir?.total_size || "non mesure"} />
                        <StatusLine label="Exports persistants" ok={!!outputDir?.exists && !!outputDir?.writable} detail={`${outputDir?.file_count ?? 0} fichiers`} />
                        <StatusLine label="Traces & imports" ok={!!csvDir?.exists && !!stateDir?.exists} detail={`${csvDir?.file_count ?? 0} CSV sources`} />
                    </div>
                </aside>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile label="Exports disponibles" value={files.length} helper={outputDir ? `${outputDir.total_size} conserves` : "Chargement"} icon={FileSpreadsheet} tone="blue" />
                <StatTile label="Themes couverts" value={metrics.themes} helper={`${metrics.years} millesimes identifies`} icon={Layers3} tone="teal" />
                <StatTile label="Open Data" value={metrics.openData} helper={`${metrics.moca} exports MOCA-O en parallele`} icon={Globe2} tone="green" />
                <StatTile label="Derniere production" value={metrics.latest ? formatDateFR(metrics.latest) : "-"} helper="Base de consultation client" icon={History} tone="gold" />
            </section>

            <section className="grid gap-4 xl:grid-cols-[0.68fr_0.32fr]">
                <div className="dv-panel overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="dv-kicker">Production recente</p>
                            <h3 className="mt-1 text-xl font-black text-prisme-950">Exports prêts pour consultation</h3>
                        </div>
                        <Link to="/history" className="inline-flex items-center gap-2 text-sm font-black text-prisme-700 hover:text-prisme-950">
                            Tout consulter
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>

                    {recentFiles.length === 0 ? (
                        <div className="p-10 text-center">
                            <FileSpreadsheet className="mx-auto size-10 text-slate-300" />
                            <p className="mt-3 font-black text-slate-800">Aucun export pour le moment</p>
                            <p className="mt-1 text-sm text-slate-500">Lancez une generation pour alimenter l'historique.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentFiles.map((file) => (
                                <div key={file.filename} className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1fr_auto] md:items-center">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                                                <FileSpreadsheet className="size-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-slate-900">{file.filename}</p>
                                                <p className="mt-0.5 truncate text-xs text-slate-500">{file.theme} · {file.size} · {formatDateFR(file.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={`/api/download/${encodeURIComponent(file.filename)}`}
                                        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-black text-prisme-800 transition hover:border-prisme-700 hover:bg-prisme-900 hover:text-white"
                                    >
                                        <Download className="size-4" />
                                        Télécharger
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="space-y-4">
                    <div className="dv-panel p-5">
                        <p className="dv-kicker">Parcours recommande</p>
                        <div className="mt-4 space-y-3">
                            {[
                                { icon: UploadCloud, title: "Importer les sources", text: "CSV/XLSX convertis puis traces." },
                                { icon: Activity, title: "Generer un export", text: "Mode Open Data ou MOCA-O selon le theme." },
                                { icon: ShieldCheck, title: "Verifier la persistance", text: "Exports, imports et BDD doivent rester verts." },
                            ].map(({ icon: Icon, title, text }) => (
                                <div key={title} className="flex gap-3 rounded-md bg-slate-50 p-3">
                                    <Icon className="mt-0.5 size-4 shrink-0 text-prisme-teal" />
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{title}</p>
                                        <p className="text-xs leading-relaxed text-slate-500">{text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dv-panel p-5">
                        <p className="dv-kicker">Connecteurs</p>
                        <div className="mt-4 space-y-2">
                            <StatusLine label="PocketBase" ok={status?.pocketbase.status === "ok"} detail="Auth, roles, tickets" />
                            <StatusLine label="Stockage Docker" ok={status?.status === "ok"} detail="Volumes et dossiers persistants" />
                            <StatusLine label="Open Data cache" ok={!!status?.directories.find(d => d.label === "Open Data cache")?.exists} detail="INSEE, BAAC, CepiDc, SPF" />
                        </div>
                    </div>

                    <div className="dv-panel-muted p-5">
                        <div className="flex items-start gap-3">
                            <Database className="mt-1 size-5 text-prisme-700" />
                            <div>
                                <p className="font-black text-prisme-950">Best practice BDD</p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    Les donnees critiques doivent vivre dans PocketBase ou des volumes nommes,
                                    jamais uniquement dans l'image Docker.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    );
}
