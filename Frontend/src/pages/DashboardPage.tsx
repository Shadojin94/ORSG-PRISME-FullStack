import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Link } from "react-router-dom"
import {
    ArrowRight, History, BookOpen, FileSpreadsheet,
    TrendingUp, BarChart3, Download, Loader2, Globe, HardDrive,
    CheckCircle2, Layers, Clock, MapPin
} from "lucide-react"
import {
    ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as ReTooltip
} from "recharts"
import { getFiles } from "@/services/api"
import type { GeneratedFile } from "@/services/api"

// ── Palette ORSG ──
const C = { darkBlue: "#1a4b8c", teal: "#3bb3a9", green: "#4caf50", yellow: "#f5c542" }
const SOURCE_COLORS = [C.darkBlue, C.teal]

// ── Hook : count up 0 → target ──
function useCountUp(target: number, duration = 1600, shouldStart = true) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!shouldStart || target === 0) return
        let raf: number
        const start = performance.now()
        const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setCount(Math.round(eased * target))
            if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [target, duration, shouldStart])
    return count
}

// ── KPI Card ──
function KpiCard({ value, label, suffix = "", icon: Icon, topColor, iconColor, delay = 0 }: {
    value: number; label: string; suffix?: string
    icon: React.ElementType; topColor: string; iconColor: string; delay?: number
}) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: "-40px" })
    const count = useCountUp(value, 1800, inView)
    return (
        <motion.article
            ref={ref}
            role="region"
            aria-label={`${label} : ${value}${suffix}`}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay }}
            className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
        >
            <div className={`absolute top-0 inset-x-0 h-1 ${topColor}`} aria-hidden="true" />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-4xl font-black text-[#1a4b8c] tabular-nums leading-none" aria-live="polite">
                        {count.toLocaleString("fr-FR")}{suffix}
                    </p>
                    <p className="text-sm font-medium text-gray-500 mt-2 leading-snug">{label}</p>
                </div>
                <div className={`p-3 rounded-xl ${iconColor} transition-transform group-hover:scale-110`} aria-hidden="true">
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </motion.article>
    )
}

// ── Tooltip recharts ──
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((e: any, i: number) => (
                <p key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                    <span className="text-gray-500">{e.name} :</span>
                    <span className="font-bold text-gray-800">{e.value}</span>
                </p>
            ))}
        </div>
    )
}

// ── Coverage Matrix ──
type DotStatus = 'moca' | 'opendata' | 'both'
const DOT: Record<DotStatus, string> = { moca: '#1a4b8c', opendata: '#3bb3a9', both: '#4caf50' }

function CoverageMatrix({ files }: { files: GeneratedFile[] }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: "-60px" })

    const { rows, years } = useMemo(() => {
        const acc: Record<string, Record<string, DotStatus>> = {}
        for (const f of files) {
            const theme = f.theme || "Autre"
            const m = f.filename.match(/(\d{4})/)
            const year = m ? m[1] : "?"
            if (!acc[theme]) acc[theme] = {}
            const cur = acc[theme][year]
            const isOpen = f.source === "Open Data"
            if (!cur) acc[theme][year] = isOpen ? 'opendata' : 'moca'
            else if ((cur === 'moca' && isOpen) || (cur === 'opendata' && !isOpen)) acc[theme][year] = 'both'
        }
        const years = [...new Set(files.map(f => f.filename.match(/(\d{4})/)?.[1] || "?"))].sort()
        const rows = Object.entries(acc).sort((a, b) => Object.keys(b[1]).length - Object.keys(a[1]).length)
        return { rows, years }
    }, [files])

    return (
        <div ref={ref} className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-0.5 text-xs" aria-label="Matrice de disponibilité des données par thématique et millésime">
                <thead>
                    <tr>
                        <th scope="col" className="text-left text-gray-400 font-medium pb-3 pr-6 w-52">Thématique</th>
                        {years.map(y => (
                            <th key={y} scope="col" className="text-center text-gray-500 font-bold pb-3 w-10">{y}</th>
                        ))}
                        <th scope="col" className="text-center text-gray-400 font-medium pb-3 pl-4 w-28">Couverture</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(([theme, yearMap], rowIdx) => {
                        const total = Object.keys(yearMap).length
                        const pct = Math.round((total / years.length) * 100)
                        return (
                            <motion.tr
                                key={theme}
                                initial={{ opacity: 0, x: -8 }}
                                animate={inView ? { opacity: 1, x: 0 } : {}}
                                transition={{ delay: rowIdx * 0.035, duration: 0.3 }}
                                className="group hover:bg-blue-50/40 transition-colors rounded"
                            >
                                <td className="text-gray-600 font-medium text-xs pr-6 py-1.5 group-hover:text-[#1a4b8c] transition-colors">
                                    <div className="truncate max-w-[200px]" title={theme}>{theme}</div>
                                </td>
                                {years.map((year, colIdx) => {
                                    const status = yearMap[year]
                                    return (
                                        <td key={year} className="text-center py-1.5">
                                            <motion.div
                                                className="w-5 h-5 rounded-full mx-auto"
                                                style={{
                                                    backgroundColor: status ? DOT[status] : '#e9eef5',
                                                    boxShadow: status ? `0 2px 5px ${DOT[status]}66` : 'none'
                                                }}
                                                initial={{ scale: 0 }}
                                                animate={inView ? { scale: 1 } : {}}
                                                transition={{
                                                    delay: rowIdx * 0.035 + colIdx * 0.012,
                                                    type: "spring", stiffness: 500, damping: 20
                                                }}
                                                role="img"
                                                aria-label={status
                                                    ? `${theme} ${year} : ${status === 'both' ? 'MOCA-O et Open Data' : status === 'opendata' ? 'Open Data' : 'MOCA-O'}`
                                                    : `${theme} ${year} : non disponible`}
                                                title={status
                                                    ? `${theme} — ${year} (${status === 'both' ? 'MOCA-O + Open Data' : status === 'opendata' ? 'Open Data' : 'MOCA-O'})`
                                                    : `${theme} — ${year} : non disponible`}
                                            />
                                        </td>
                                    )
                                })}
                                <td className="pl-4 py-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${theme} : ${total} sur ${years.length} millésimes`}>
                                            <div className="h-full rounded-full bg-[#3bb3a9] transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">{total}/{years.length}</span>
                                    </div>
                                </td>
                            </motion.tr>
                        )
                    })}
                </tbody>
            </table>

            <div className="flex flex-wrap items-center gap-5 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#1a4b8c]" />MOCA-O (base interne)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#3bb3a9]" />Open Data (INSEE · CAF · IRCOM)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#4caf50]" />Les deux sources disponibles</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#e9eef5] border border-gray-200" />Non disponible</span>
            </div>
        </div>
    )
}

// ── Main page ──
export function DashboardPage() {
    const [files, setFiles] = useState<GeneratedFile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getFiles().then(setFiles).catch(console.error).finally(() => setLoading(false))
    }, [])

    const fileCount = files.length
    const openDataCount = files.filter(f => f.source === "Open Data").length
    const mocaCount = files.filter(f => f.source !== "Open Data").length
    const uniqueThemes = new Set(files.map(f => f.theme)).size
    const recentFiles = files.slice(0, 5)
    const uniqueYears = useMemo(() =>
        [...new Set(files.map(f => f.filename.match(/(\d{4})/)?.[1]).filter(Boolean))].length,
        [files]
    )

    const sourceData = useMemo(() => {
        if (!files.length) return []
        return [
            { name: "MOCA-O", value: mocaCount },
            { name: "Open Data", value: openDataCount },
        ].filter(d => d.value > 0)
    }, [files, mocaCount, openDataCount])

    return (
        <>
            {/* RGAA skip link */}
            <a
                href="#contenu-principal"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#1a4b8c] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
            >
                Aller au contenu principal
            </a>

            <main
                id="contenu-principal"
                className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8"
                aria-label="Tableau de bord PRISME"
            >

                {/* ── Header ── */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a4b8c] tracking-tight">Tableau de bord</h1>
                        <p className="text-gray-500 mt-1">
                            Suivi de production — ORSG-CTPS,{" "}
                            <time dateTime={new Date().toISOString().split("T")[0]}>
                                {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                            </time>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm" role="status" aria-live="polite">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                        <span className="font-medium text-gray-600">{loading ? "Chargement…" : `${fileCount} fichiers`}</span>
                    </div>
                </header>

                {/* ── KPI ── */}
                <section aria-label="Indicateurs clés">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        <KpiCard value={loading ? 0 : fileCount} label="Fichiers produits" icon={FileSpreadsheet}
                            topColor="bg-gradient-to-r from-[#1a4b8c] to-[#3bb3a9]" iconColor="bg-blue-50 text-[#1a4b8c]" delay={0} />
                        <KpiCard value={219} label="Indicateurs BDI référencés" icon={BarChart3}
                            topColor="bg-[#3bb3a9]" iconColor="bg-teal-50 text-[#3bb3a9]" delay={0.1} />
                        <KpiCard value={loading ? 0 : uniqueThemes} label="Thématiques couvertes" icon={TrendingUp}
                            topColor="bg-[#4caf50]" iconColor="bg-green-50 text-[#4caf50]" delay={0.2} />
                        <KpiCard value={5} label="Niveaux géographiques auto-générés" icon={Layers}
                            topColor="bg-[#f5c542]" iconColor="bg-yellow-50 text-yellow-600" delay={0.3} />
                    </div>
                </section>

                {/* ── CTA ── */}
                <motion.section
                    aria-label="Génération de rapports"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="relative rounded-2xl overflow-hidden shadow-lg"
                >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" src="/bg-video.mp4" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a4b8c]/92 via-[#1a4b8c]/82 to-[#3bb3a9]/65" aria-hidden="true" />
                    <div className="relative z-10 px-8 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <p className="text-[#f5c542] text-xs font-semibold uppercase tracking-widest">Génération de rapports</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">Produire un indicateur</h2>
                            <p className="text-blue-100 text-base leading-relaxed">
                                Sélectionnez une thématique et une année de référence.
                                Le fichier est prêt en moins de deux minutes — 5 niveaux géographiques, format Géoclip.
                            </p>
                        </div>
                        <Link
                            to="/generate"
                            className="group/btn flex-shrink-0 flex items-center gap-3 bg-white text-[#1a4b8c] px-8 py-4 rounded-xl font-bold text-base shadow-xl hover:bg-[#f5c542] transition-all transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                        >
                            Démarrer
                            <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
                        </Link>
                    </div>
                </motion.section>

                {/* ── Loading / Empty state ── */}
                {loading ? (
                    <div className="flex items-center justify-center py-16" aria-busy="true" aria-live="polite">
                        <Loader2 className="w-8 h-8 animate-spin text-[#3bb3a9]" />
                        <span className="sr-only">Chargement des données</span>
                    </div>
                ) : files.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
                        <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-200 mb-4" aria-hidden="true" />
                        <p className="text-lg font-bold text-gray-800 mb-1">Aucune donnée de production</p>
                        <p className="text-sm text-gray-400">Les informations apparaîtront après la première génération.</p>
                    </div>
                ) : (
                    <>
                        {/* ══════════════════════════════════════════
                            BLOC 1 — 3 colonnes : Vitesse · Sources · Conformité
                           ══════════════════════════════════════════ */}
                        <section aria-label="Apports de la plateforme" className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Vitesse */}
                            <motion.article
                                role="region"
                                aria-label="Gain de temps"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-orange-50 rounded-lg" aria-hidden="true">
                                        <Clock className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <h2 className="font-bold text-[#1a4b8c] text-base">Temps de production</h2>
                                </div>

                                {/* Avant / Après */}
                                <div className="flex items-stretch gap-3">
                                    <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-semibold">Avant</p>
                                        <p className="text-3xl font-black text-gray-300">45<span className="text-base font-bold"> min</span></p>
                                        <p className="text-[10px] text-gray-400 mt-1">par indicateur · manuel</p>
                                    </div>
                                    <div className="flex items-center justify-center px-1">
                                        <ArrowRight className="w-4 h-4 text-gray-300" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1 bg-gradient-to-br from-[#3bb3a9]/10 to-[#1a4b8c]/5 rounded-xl p-4 text-center border border-[#3bb3a9]/20">
                                        <p className="text-[10px] text-[#3bb3a9] uppercase tracking-widest mb-2 font-semibold">Après</p>
                                        <p className="text-3xl font-black text-[#1a4b8c]">&lt;2<span className="text-base font-bold"> min</span></p>
                                        <p className="text-[10px] text-[#3bb3a9] mt-1 font-medium">automatisé · Géoclip</p>
                                    </div>
                                </div>

                                {/* Stat bas */}
                                <div className="bg-[#1a4b8c]/5 rounded-xl p-3 flex items-center justify-between mt-auto">
                                    <span className="text-xs text-gray-500">Fichiers générés à ce jour</span>
                                    <span className="text-sm font-black text-[#1a4b8c]">{fileCount}</span>
                                </div>
                            </motion.article>

                            {/* Sources donut */}
                            <motion.article
                                role="region"
                                aria-label={`Sources : ${mocaCount} MOCA-O, ${openDataCount} Open Data`}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 rounded-lg" aria-hidden="true">
                                        <HardDrive className="w-5 h-5 text-[#1a4b8c]" />
                                    </div>
                                    <h2 className="font-bold text-[#1a4b8c] text-base">Sources de données</h2>
                                </div>

                                <div className="h-[160px]" role="img" aria-label={`MOCA-O : ${mocaCount}, Open Data : ${openDataCount}`}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={sourceData}
                                                cx="50%" cy="50%"
                                                innerRadius={45} outerRadius={65}
                                                paddingAngle={3} dataKey="value"
                                                animationDuration={1200} stroke="none"
                                            >
                                                {sourceData.map((_e, i) => (
                                                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ReTooltip content={<CustomTooltip />} />
                                            <Legend verticalAlign="bottom" formatter={(v: string) => <span className="text-xs text-gray-600">{v}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <div className="bg-[#1a4b8c]/5 rounded-xl p-3 text-center">
                                        <p className="text-xl font-black text-[#1a4b8c]">{mocaCount}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">MOCA-O</p>
                                    </div>
                                    <div className="bg-[#3bb3a9]/10 rounded-xl p-3 text-center">
                                        <p className="text-xl font-black text-[#3bb3a9]">{openDataCount}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Open Data</p>
                                    </div>
                                </div>
                            </motion.article>

                            {/* Conformité Géoclip */}
                            <motion.article
                                role="region"
                                aria-label="Conformité Géoclip"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-green-50 rounded-lg" aria-hidden="true">
                                        <CheckCircle2 className="w-5 h-5 text-[#4caf50]" />
                                    </div>
                                    <h2 className="font-bold text-[#1a4b8c] text-base">Conformité Géoclip</h2>
                                </div>

                                <div className="space-y-4 flex-1">
                                    {[
                                        {
                                            icon: Layers,
                                            value: "5 niveaux",
                                            label: "géographiques générés",
                                            sub: "Commune · Région · DOM · France Hex. · France Entière",
                                            color: "text-[#1a4b8c]", bg: "bg-blue-50"
                                        },
                                        {
                                            icon: CheckCircle2,
                                            value: "100%",
                                            label: "compatible Géoclip",
                                            sub: "Structure, nomenclature et mise en forme validées automatiquement",
                                            color: "text-[#4caf50]", bg: "bg-green-50"
                                        },
                                        {
                                            icon: MapPin,
                                            value: "22",
                                            label: "communes de Guyane",
                                            sub: "Couverture complète du territoire guyanais",
                                            color: "text-[#3bb3a9]", bg: "bg-teal-50"
                                        },
                                    ].map(({ icon: Icon, value, label, sub, color, bg }) => (
                                        <div key={value + label} className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${bg} flex-shrink-0 mt-0.5`} aria-hidden="true">
                                                <Icon className={`w-4 h-4 ${color}`} />
                                            </div>
                                            <div>
                                                <p className={`text-lg font-black leading-tight ${color}`}>{value}</p>
                                                <p className="text-xs font-semibold text-gray-700">{label}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.article>

                        </section>

                        {/* ══════════════════════════════════════════
                            BLOC 2 — Disponibilité des données
                            Matrice thème × millésime — vue centrale
                           ══════════════════════════════════════════ */}
                        <motion.section
                            aria-label="Disponibilité des données par thème et millésime"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                        >
                            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-[#1a4b8c]">Disponibilité des données</h2>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {uniqueThemes} thématiques × {uniqueYears} millésimes —
                                        chaque point indique un fichier Excel disponible en téléchargement direct
                                    </p>
                                </div>
                                <Link
                                    to="/generate"
                                    className="flex-shrink-0 text-xs font-semibold text-[#3bb3a9] hover:underline focus-visible:outline-2 focus-visible:outline-[#3bb3a9] focus-visible:rounded"
                                >
                                    Générer un fichier manquant →
                                </Link>
                            </div>
                            <CoverageMatrix files={files} />
                        </motion.section>

                        {/* ── Productions récentes ── */}
                        <section aria-label="Productions récentes">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                    <h2 className="font-bold text-[#1a4b8c] flex items-center gap-2 text-base">
                                        <History className="w-4 h-4 opacity-70" aria-hidden="true" />
                                        Productions récentes
                                    </h2>
                                    <Link to="/history" className="text-xs font-semibold text-[#3bb3a9] hover:underline focus-visible:outline-2 focus-visible:outline-[#3bb3a9] focus-visible:rounded">
                                        Consulter l'historique
                                    </Link>
                                </div>
                                <div className="divide-y divide-gray-50" role="list" aria-label="Derniers fichiers produits">
                                    {recentFiles.map((file, idx) => (
                                        <motion.div
                                            key={idx}
                                            role="listitem"
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.07 }}
                                            className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#1a4b8c] group-hover:bg-[#1a4b8c] group-hover:text-white transition-colors" aria-hidden="true">
                                                    <FileSpreadsheet className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{file.filename}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-gray-400">{file.theme}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" aria-hidden="true" />
                                                        <span className="text-xs text-gray-400">{file.size}</span>
                                                        {file.source === "Open Data" && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-gray-300" aria-hidden="true" />
                                                                <span className="text-xs text-[#3bb3a9] flex items-center gap-1">
                                                                    <Globe className="w-3 h-3" aria-hidden="true" />
                                                                    Open Data
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <time dateTime={file.date} className="text-xs text-gray-400">{file.date}</time>
                                                <button
                                                    onClick={() => window.open(`/api/download/${file.filename}`, "_blank")}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#3bb3a9]/10 text-[#3bb3a9] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[#3bb3a9]"
                                                    aria-label={`Télécharger ${file.filename}`}
                                                >
                                                    <Download className="w-4 h-4" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* ── Navigation ── */}
                <nav aria-label="Navigation rapide" className="grid md:grid-cols-2 gap-5">
                    <Link to="/history" className="group flex items-center gap-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#4caf50]/30 transition-all focus-visible:outline-2 focus-visible:outline-[#4caf50] focus-visible:rounded-2xl">
                        <div className="p-3 bg-green-50 rounded-xl group-hover:bg-[#4caf50] transition-colors" aria-hidden="true">
                            <History className="w-6 h-6 text-[#4caf50] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">Historique des productions</p>
                            <p className="text-sm text-gray-500">{loading ? "…" : files.length} fichiers disponibles</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-[#4caf50] group-hover:translate-x-1 transition-all" aria-hidden="true" />
                    </Link>
                    <Link to="/docs" className="group flex items-center gap-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#f5c542]/50 transition-all focus-visible:outline-2 focus-visible:outline-[#f5c542] focus-visible:rounded-2xl">
                        <div className="p-3 bg-yellow-50 rounded-xl group-hover:bg-[#f5c542] transition-colors" aria-hidden="true">
                            <BookOpen className="w-6 h-6 text-yellow-500 group-hover:text-[#1a4b8c] transition-colors" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">Référentiel BDI</p>
                            <p className="text-sm text-gray-500">219 indicateurs documentés</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" aria-hidden="true" />
                    </Link>
                </nav>

            </main>
        </>
    )
}
