import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
    ArrowRight,
    BookOpen,
    Download,
    FileSpreadsheet,
    History,
    Layers,
    LifeBuoy,
    Loader2,
    RefreshCw,
    Search,
} from "lucide-react"
import { getDownloadUrl, getFiles, type GeneratedFile } from "@/services/api"
import { formatDateFR } from "@/utils/date"

function ActionCard({
    icon: Icon,
    title,
    text,
    to,
    primary = false,
}: {
    icon: React.ElementType
    title: string
    text: string
    to: string
    primary?: boolean
}) {
    return (
        <Link
            to={to}
            className={[
                "group block rounded-lg border p-5 shadow-sm transition",
                primary
                    ? "border-[#1a4b8c] bg-[#1a4b8c] text-white hover:bg-[#153e75]"
                    : "border-slate-200 bg-white text-slate-900 hover:border-[#3bb3a9] hover:shadow-md",
            ].join(" ")}
        >
            <div className="flex items-start gap-4">
                <div
                    className={[
                        "grid h-11 w-11 shrink-0 place-items-center rounded-lg",
                        primary ? "bg-white/15 text-white" : "bg-[#eef8f7] text-[#1a4b8c]",
                    ].join(" ")}
                >
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-base font-black">{title}</h2>
                    <p className={["mt-1 text-sm leading-6", primary ? "text-white/75" : "text-slate-500"].join(" ")}>
                        {text}
                    </p>
                </div>
                <ArrowRight className={["ml-auto mt-1 h-5 w-5 shrink-0 transition group-hover:translate-x-1", primary ? "text-white" : "text-[#3bb3a9]"].join(" ")} />
            </div>
        </Link>
    )
}

function EmptyState() {
    return (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-black text-slate-900">Aucun fichier disponible</h3>
            <p className="mt-1 text-sm text-slate-500">
                Lancez une generation pour creer le premier export.
            </p>
            <Link
                to="/generate"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1a4b8c] px-4 py-2 text-sm font-black text-white transition hover:bg-[#153e75]"
            >
                Generer un fichier
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    )
}

export function DashboardPage() {
    const [files, setFiles] = useState<GeneratedFile[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const loadFiles = async () => {
        try {
            setLoading(true)
            setFiles(await getFiles())
        } catch (error) {
            console.error("Erreur chargement fichiers:", error)
            setFiles([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFiles()
    }, [])

    const recentFiles = useMemo(() => {
        const query = search.trim().toLowerCase()
        return files
            .filter(file => {
                if (!query) return true
                return `${file.filename} ${file.theme} ${file.date}`.toLowerCase().includes(query)
            })
            .slice(0, 8)
    }, [files, search])

    const themeCount = new Set(files.map(file => file.theme)).size
    const lastFile = files[0]

    return (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3bb3a9]">Data Visus ORSG</p>
                        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#1a4b8c] md:text-4xl">
                            Produire et retrouver vos fichiers en toute simplicite.
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                            Choisissez une thematique, selectionnez une annee, puis telechargez le fichier genere.
                            L'interface garde le chemin court pour les equipes metier.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                to="/generate"
                                className="inline-flex items-center gap-2 rounded-lg bg-[#1a4b8c] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#153e75]"
                            >
                                Generer un fichier
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                to="/history"
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#1a4b8c] transition hover:border-[#3bb3a9]"
                            >
                                Voir les fichiers
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-5">
                        <p className="text-sm font-black text-slate-900">Resume</p>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-white p-4">
                                <p className="text-2xl font-black text-[#1a4b8c]">{files.length}</p>
                                <p className="mt-1 text-xs font-bold text-slate-500">fichiers</p>
                            </div>
                            <div className="rounded-lg bg-white p-4">
                                <p className="text-2xl font-black text-[#1a4b8c]">{themeCount}</p>
                                <p className="mt-1 text-xs font-bold text-slate-500">themes</p>
                            </div>
                        </div>
                        <p className="mt-4 text-xs leading-5 text-slate-500">
                            Derniere production : {lastFile ? formatDateFR(lastFile.date) : "aucune pour le moment"}.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
                <ActionCard
                    icon={Layers}
                    title="Creer un export"
                    text="Selectionner une thematique et generer le fichier attendu."
                    to="/generate"
                    primary
                />
                <ActionCard
                    icon={History}
                    title="Retrouver un fichier"
                    text="Consulter les productions recentes et les telecharger."
                    to="/history"
                />
                <ActionCard
                    icon={BookOpen}
                    title="Consulter le BDI"
                    text="Verifier les definitions et les indicateurs disponibles."
                    to="/docs"
                />
            </section>

            <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[#1a4b8c]">Fichiers recents</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Les derniers exports disponibles au telechargement.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder="Rechercher"
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-[#3bb3a9] focus:bg-white sm:w-64"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={loadFiles}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-[#1a4b8c] transition hover:border-[#3bb3a9]"
                        >
                            <RefreshCw className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
                            Actualiser
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-3 p-10 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin text-[#3bb3a9]" />
                        Chargement des fichiers
                    </div>
                ) : files.length === 0 ? (
                    <div className="p-5">
                        <EmptyState />
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recentFiles.map(file => (
                            <div key={file.filename} className="grid gap-3 p-5 transition hover:bg-slate-50 md:grid-cols-[1fr_auto] md:items-center">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                                            <FileSpreadsheet className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-black text-slate-900" title={file.filename}>
                                                {file.filename}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                {file.theme} - {formatDateFR(file.date)} - {file.size}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={getDownloadUrl(file.filename)}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-[#1a4b8c] transition hover:bg-[#1a4b8c] hover:text-white"
                                >
                                    <Download className="h-4 w-4" />
                                    Telecharger
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="mt-6 rounded-lg border border-slate-200 bg-[#f8fbfc] p-5">
                <div className="flex items-start gap-3">
                    <LifeBuoy className="mt-1 h-5 w-5 text-[#3bb3a9]" />
                    <div>
                        <h2 className="font-black text-slate-900">Besoin d'aide ?</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                            En cas de doute sur une thematique, un millesime ou un fichier, utilisez la page Support.
                            Le message sera conserve dans votre espace.
                        </p>
                        <Link
                            to="/support"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#1a4b8c] hover:text-[#153e75]"
                        >
                            Ouvrir le support
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
