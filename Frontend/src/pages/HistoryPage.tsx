import { useEffect, useMemo, useState } from "react";
import {
    Calendar,
    Download,
    FileSpreadsheet,
    Globe2,
    HardDrive,
    History as HistoryIcon,
    Loader2,
    RefreshCw,
    Search,
    SlidersHorizontal,
} from "lucide-react";
import { getDownloadUrl, getFiles, type GeneratedFile } from "@/services/api";
import { formatDateFR } from "@/utils/date";

type SourceFilter = "all" | "opendata" | "moca";

function normalize(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function HistoryPage() {
    const [files, setFiles] = useState<GeneratedFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

    async function loadFiles() {
        try {
            setIsLoading(true);
            setError(null);
            setFiles(await getFiles());
        } catch (err) {
            console.error("Erreur chargement historique:", err);
            setError("Impossible de charger l'historique. Verifiez que le serveur est disponible.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadFiles();
    }, []);

    const filteredFiles = useMemo(() => {
        const q = normalize(searchTerm.trim());
        return files.filter(file => {
            const source = file.source === "Open Data" ? "opendata" : "moca";
            const sourceOk = sourceFilter === "all" || sourceFilter === source;
            const text = normalize(`${file.filename} ${file.theme} ${file.source || ""} ${file.date}`);
            return sourceOk && (!q || text.includes(q));
        });
    }, [files, searchTerm, sourceFilter]);

    const stats = useMemo(() => {
        const openData = files.filter(f => f.source === "Open Data").length;
        const themes = new Set(files.map(f => f.theme)).size;
        const latest = files[0]?.date || null;
        return { openData, moca: files.length - openData, themes, latest };
    }, [files]);

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
                <article className="dv-panel p-5 md:col-span-2">
                    <div className="flex items-start gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-prisme-900 text-white">
                            <HistoryIcon className="size-6" />
                        </div>
                        <div>
                            <p className="dv-kicker">Historique durable</p>
                            <h2 className="mt-2 text-2xl font-black text-prisme-950">Exports, sources et preuves de production</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Cette vue est pensée pour retrouver vite un fichier client, verifier la source
                                et relancer une production sans fouiller dans le serveur.
                            </p>
                        </div>
                    </div>
                </article>

                <article className="dv-panel p-5">
                    <p className="dv-kicker">Resume</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-md bg-slate-50 p-3">
                            <p className="text-2xl font-black text-prisme-950">{files.length}</p>
                            <p className="text-xs font-bold text-slate-500">exports</p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                            <p className="text-2xl font-black text-prisme-950">{stats.themes}</p>
                            <p className="text-xs font-bold text-slate-500">themes</p>
                        </div>
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="size-4" />
                        Derniere production : {stats.latest ? formatDateFR(stats.latest) : "-"}
                    </p>
                </article>
            </section>

            <section className="dv-panel overflow-hidden">
                <div className="border-b border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Rechercher un fichier, theme, annee ou source..."
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-prisme-600 focus:bg-white"
                                />
                            </div>

                            <div className="inline-flex h-11 rounded-lg border border-slate-200 bg-slate-50 p-1">
                                {[
                                    ["all", "Tous"],
                                    ["opendata", "Open Data"],
                                    ["moca", "MOCA-O"],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setSourceFilter(value as SourceFilter)}
                                        className={`rounded-md px-3 text-xs font-black transition ${sourceFilter === value ? "bg-white text-prisme-950 shadow-sm" : "text-slate-500 hover:text-prisme-900"}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 xl:justify-end">
                            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
                                <SlidersHorizontal className="size-4" />
                                {filteredFiles.length} resultat{filteredFiles.length > 1 ? "s" : ""}
                            </div>
                            <button
                                type="button"
                                onClick={loadFiles}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-prisme-800 transition hover:bg-prisme-900 hover:text-white"
                            >
                                <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
                                Actualiser
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm font-bold text-red-700">
                        {error}
                    </div>
                )}

                <div className="min-h-[420px] overflow-x-auto dv-scrollbar">
                    {isLoading && files.length === 0 ? (
                        <div className="grid min-h-[420px] place-items-center text-slate-500">
                            <div className="text-center">
                                <Loader2 className="mx-auto size-8 animate-spin text-prisme-teal" />
                                <p className="mt-3 text-sm font-bold">Chargement de l'historique</p>
                            </div>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="grid min-h-[420px] place-items-center p-8 text-center">
                            <div>
                                <FileSpreadsheet className="mx-auto size-12 text-slate-300" />
                                <h3 className="mt-4 text-lg font-black text-slate-900">Aucun export trouve</h3>
                                <p className="mt-1 text-sm text-slate-500">Ajustez la recherche ou lancez une nouvelle generation.</p>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Fichier</th>
                                    <th className="px-5 py-4">Theme</th>
                                    <th className="px-5 py-4">Source</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4">Taille</th>
                                    <th className="px-5 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredFiles.map((file) => {
                                    const isOpenData = file.source === "Open Data";
                                    return (
                                        <tr key={file.filename} className="transition hover:bg-slate-50">
                                            <td className="px-5 py-4">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                                                        <FileSpreadsheet className="size-5" />
                                                    </div>
                                                    <span className="max-w-[360px] truncate font-black text-slate-900" title={file.filename}>{file.filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex max-w-[260px] truncate rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700" title={file.theme}>
                                                    {file.theme}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ${isOpenData ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
                                                    {isOpenData ? <Globe2 className="size-3.5" /> : <HardDrive className="size-3.5" />}
                                                    {isOpenData ? "Open Data" : "MOCA-O"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-bold text-slate-600">{formatDateFR(file.date)}</td>
                                            <td className="px-5 py-4 font-mono text-xs text-slate-500">{file.size}</td>
                                            <td className="px-5 py-4 text-right">
                                                <a
                                                    href={getDownloadUrl(file.filename)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-prisme-900 px-3 py-2 text-xs font-black text-white transition hover:bg-prisme-800"
                                                >
                                                    <Download className="size-4" />
                                                    Télécharger
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
}
