import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Link } from "react-router-dom"
import {
    ArrowRight, History, BookOpen, FileSpreadsheet,
    TrendingUp, BarChart3, Download, Calendar, Loader2, Globe, HardDrive
} from "lucide-react"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts"
import { getFiles } from "@/services/api"
import type { GeneratedFile } from "@/services/api"

// ── Palette ORSG ──
const C = {
    darkBlue: "#1a4b8c",
    teal: "#3bb3a9",
    green: "#4caf50",
    yellow: "#f5c542",
    orange: "#ff9800",
    magenta: "#e91e63",
    slate: "#64748b",
    lightBlue: "#0083B0",
    purple: "#7c3aed",
}

const THEME_COLORS = [C.darkBlue, C.teal, C.green, C.yellow, C.lightBlue, C.orange, C.magenta, C.purple]
const SOURCE_COLORS = [C.darkBlue, C.teal]

// ── Hook : animated count 0 → target ──
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
            className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group focus-within:ring-2 focus-within:ring-[#1a4b8c]/30"
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

// ── Chart card wrapper ──
function ChartCard({ title, subtitle, children, className = "" }: {
    title: string; subtitle?: string; children: React.ReactNode; className?: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}
        >
            <div className="mb-5">
                <h2 className="text-lg font-bold text-[#1a4b8c]">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </motion.div>
    )
}

// ── Custom tooltip for recharts ──
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-500">{entry.name} :</span>
                    <span className="font-bold text-gray-800">{entry.value}</span>
                </p>
            ))}
        </div>
    )
}

// ── Donut center label ──
function PieLabel({ viewBox, value, sub }: { viewBox?: any; value: string; sub: string }) {
    const { cx, cy } = viewBox || {}
    return (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
            <tspan x={cx} dy="-6" className="text-2xl font-black" fill={C.darkBlue}>{value}</tspan>
            <tspan x={cx} dy="18" className="text-[10px]" fill="#94a3b8">{sub}</tspan>
        </text>
    )
}

// ── Main page ──
export function DashboardPage() {
    const [files, setFiles] = useState<GeneratedFile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getFiles()
            .then(setFiles)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    // ── Computed data ──
    const fileCount = files.length
    const openDataCount = files.filter(f => f.source === "Open Data").length
    const mocaCount = files.filter(f => f.source !== "Open Data").length
    const uniqueThemes = new Set(files.map(f => f.theme)).size
    const recentFiles = files.slice(0, 5)

    // ── Timeline data (files per month) ──
    const timelineData = useMemo(() => {
        if (files.length === 0) return []
        const byMonth: Record<string, { moca: number; opendata: number }> = {}
        for (const f of files) {
            // date format: YYYY-MM-DD
            const month = f.date?.slice(0, 7) || "inconnu"
            if (!byMonth[month]) byMonth[month] = { moca: 0, opendata: 0 }
            if (f.source === "Open Data") byMonth[month].opendata++
            else byMonth[month].moca++
        }
        return Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, counts]) => ({
                mois: month,
                "MOCA-O": counts.moca,
                "Open Data": counts.opendata,
                total: counts.moca + counts.opendata,
            }))
    }, [files])

    // ── Theme distribution (horizontal bar) ──
    const themeData = useMemo(() => {
        if (files.length === 0) return []
        const counts: Record<string, number> = {}
        for (const f of files) {
            const label = f.theme || "Autre"
            counts[label] = (counts[label] || 0) + 1
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, value]) => ({ name, value }))
    }, [files])

    // ── Source split (pie chart) ──
    const sourceData = useMemo(() => {
        if (files.length === 0) return []
        return [
            { name: "MOCA-O", value: mocaCount },
            { name: "Open Data", value: openDataCount },
        ].filter(d => d.value > 0)
    }, [files, mocaCount, openDataCount])

    // ── Year distribution (vertical bar) ──
    const yearData = useMemo(() => {
        if (files.length === 0) return []
        const counts: Record<string, { moca: number; opendata: number }> = {}
        for (const f of files) {
            // Extract year from filename: theme_YYYY.zip or theme_opendata_YYYY.zip
            const m = f.filename.match(/(\d{4})/)
            const year = m ? m[1] : "?"
            if (!counts[year]) counts[year] = { moca: 0, opendata: 0 }
            if (f.source === "Open Data") counts[year].opendata++
            else counts[year].moca++
        }
        return Object.entries(counts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([year, c]) => ({ annee: year, "MOCA-O": c.moca, "Open Data": c.opendata }))
    }, [files])

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
                        <h1 className="text-3xl font-bold text-[#1a4b8c] tracking-tight">
                            Tableau de bord
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Suivi de production — ORSG-CTPS,{" "}
                            <time dateTime={new Date().toISOString().split("T")[0]}>
                                {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                            </time>
                        </p>
                    </div>
                    <div
                        className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm"
                        role="status"
                        aria-live="polite"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                        <span className="font-medium text-gray-600">
                            {loading ? "Chargement..." : `${fileCount} fichiers`}
                        </span>
                    </div>
                </header>

                {/* ── KPI cards ── */}
                <section aria-label="Indicateurs clés">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        <KpiCard value={loading ? 0 : fileCount} label="Fichiers produits" icon={FileSpreadsheet}
                            topColor="bg-gradient-to-r from-[#1a4b8c] to-[#3bb3a9]" iconColor="bg-blue-50 text-[#1a4b8c]" delay={0} />
                        <KpiCard value={219} label="Indicateurs BDI" icon={BarChart3}
                            topColor="bg-[#3bb3a9]" iconColor="bg-teal-50 text-[#3bb3a9]" delay={0.1} />
                        <KpiCard value={loading ? 0 : uniqueThemes} label="Thématiques couvertes" icon={TrendingUp}
                            topColor="bg-[#4caf50]" iconColor="bg-green-50 text-[#4caf50]" delay={0.2} />
                        <KpiCard value={loading ? 0 : fileCount * 4} suffix="h" label="Temps valorisé (est.)" icon={Calendar}
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
                    <video autoPlay muted loop playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                        src="/bg-video.mp4"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a4b8c]/92 via-[#1a4b8c]/82 to-[#3bb3a9]/65" aria-hidden="true" />
                    <div className="relative z-10 px-8 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <p className="text-[#f5c542] text-xs font-semibold uppercase tracking-widest">
                                Génération de rapports
                            </p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                Produire un indicateur
                            </h2>
                            <p className="text-blue-100 text-base leading-relaxed">
                                Sélectionnez une thématique, choisissez l'année de référence.
                                Le fichier est prêt en moins de deux minutes, format Géoclip.
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

                {/* ────────────────────────────────────────
                    DATA VISUALIZATION — Bento grid
                   ──────────────────────────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#3bb3a9]" />
                        <span className="sr-only">Chargement des données</span>
                    </div>
                ) : files.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-200 mb-4" aria-hidden="true" />
                        <p className="text-lg font-bold text-gray-800 mb-1">Aucune donnée de production</p>
                        <p className="text-sm text-gray-400">
                            Les graphiques apparaîtront après la première génération de fichiers.
                        </p>
                    </div>
                ) : (
                    <section aria-label="Visualisation des données de production" className="space-y-6">

                        {/* Row 1: Timeline (large) + Source donut (small) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Area chart — Production timeline */}
                            <ChartCard
                                title="Production dans le temps"
                                subtitle={`${timelineData.length} période${timelineData.length > 1 ? "s" : ""} de production`}
                                className="lg:col-span-2"
                            >
                                <div className="h-[280px]" role="img" aria-label="Graphique en aire montrant l'évolution de la production par mois">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="gradMoca" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={C.darkBlue} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={C.darkBlue} stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gradOpen" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={C.teal} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis
                                                dataKey="mois" tick={{ fontSize: 11, fill: "#94a3b8" }}
                                                axisLine={false} tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                                axisLine={false} tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <ReTooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone" dataKey="MOCA-O" name="MOCA-O"
                                                stroke={C.darkBlue} strokeWidth={2}
                                                fill="url(#gradMoca)"
                                                animationDuration={1500}
                                            />
                                            <Area
                                                type="monotone" dataKey="Open Data" name="Open Data"
                                                stroke={C.teal} strokeWidth={2}
                                                fill="url(#gradOpen)"
                                                animationDuration={1500}
                                                animationBegin={300}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center gap-6 mt-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-1 rounded-full bg-[#1a4b8c]" />
                                        MOCA-O ({mocaCount})
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-1 rounded-full bg-[#3bb3a9]" />
                                        Open Data ({openDataCount})
                                    </span>
                                </div>
                            </ChartCard>

                            {/* Donut — Source split */}
                            <ChartCard
                                title="Sources de données"
                                subtitle={`${fileCount} fichiers au total`}
                            >
                                <div className="h-[220px]" role="img" aria-label={`Répartition des sources : MOCA-O ${mocaCount} fichiers, Open Data ${openDataCount} fichiers`}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={sourceData}
                                                cx="50%" cy="50%"
                                                innerRadius={55} outerRadius={80}
                                                paddingAngle={3}
                                                dataKey="value"
                                                animationDuration={1200}
                                                stroke="none"
                                            >
                                                {sourceData.map((_entry, i) => (
                                                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                                                ))}
                                                <PieLabel viewBox={undefined} value={fileCount.toString()} sub="fichiers" />
                                            </Pie>
                                            <ReTooltip content={<CustomTooltip />} />
                                            <Legend
                                                verticalAlign="bottom"
                                                formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="bg-[#1a4b8c]/5 rounded-lg p-3 text-center">
                                        <p className="text-lg font-black text-[#1a4b8c]">{mocaCount}</p>
                                        <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                                            <HardDrive className="w-3 h-3" aria-hidden="true" />
                                            MOCA-O
                                        </p>
                                    </div>
                                    <div className="bg-[#3bb3a9]/5 rounded-lg p-3 text-center">
                                        <p className="text-lg font-black text-[#3bb3a9]">{openDataCount}</p>
                                        <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                                            <Globe className="w-3 h-3" aria-hidden="true" />
                                            Open Data
                                        </p>
                                    </div>
                                </div>
                            </ChartCard>
                        </div>

                        {/* Row 2: Theme bar chart + Year distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Horizontal bar — Theme distribution */}
                            <ChartCard
                                title="Répartition par thématique"
                                subtitle={`${uniqueThemes} thématiques — top 8`}
                            >
                                <div className="h-[300px]" role="img" aria-label="Graphique en barres horizontales de la répartition par thématique">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={themeData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <YAxis
                                                type="category" dataKey="name"
                                                tick={{ fontSize: 11, fill: "#64748b" }}
                                                axisLine={false} tickLine={false}
                                                width={140}
                                            />
                                            <ReTooltip content={<CustomTooltip />} />
                                            <Bar
                                                dataKey="value" name="Fichiers" radius={[0, 6, 6, 0]}
                                                animationDuration={1200}
                                            >
                                                {themeData.map((_entry, i) => (
                                                    <Cell key={i} fill={THEME_COLORS[i % THEME_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </ChartCard>

                            {/* Vertical stacked bar — Year distribution */}
                            <ChartCard
                                title="Distribution par année"
                                subtitle="Fichiers produits par année de référence"
                            >
                                <div className="h-[300px]" role="img" aria-label="Graphique en barres verticales de la distribution par année de référence">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={yearData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="annee" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <ReTooltip content={<CustomTooltip />} />
                                            <Bar
                                                dataKey="MOCA-O" name="MOCA-O"
                                                stackId="a" fill={C.darkBlue}
                                                radius={[0, 0, 0, 0]}
                                                animationDuration={1200}
                                            />
                                            <Bar
                                                dataKey="Open Data" name="Open Data"
                                                stackId="a" fill={C.teal}
                                                radius={[4, 4, 0, 0]}
                                                animationDuration={1200}
                                                animationBegin={300}
                                            />
                                            <Legend
                                                verticalAlign="top" align="right" height={30}
                                                formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </ChartCard>
                        </div>
                    </section>
                )}

                {/* ── Recent files ── */}
                <section aria-label="Productions récentes">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="font-bold text-[#1a4b8c] flex items-center gap-2 text-base">
                                <History className="w-4 h-4 opacity-70" aria-hidden="true" />
                                Productions récentes
                            </h2>
                            <Link
                                to="/history"
                                className="text-xs font-semibold text-[#3bb3a9] hover:underline focus-visible:outline-2 focus-visible:outline-[#3bb3a9] focus-visible:rounded"
                            >
                                Consulter l'historique
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50" role="list" aria-label="Derniers fichiers produits">
                            {loading ? (
                                <div className="p-10 flex justify-center text-gray-200" aria-busy="true" aria-live="polite">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span className="sr-only">Chargement des données</span>
                                </div>
                            ) : recentFiles.length === 0 ? (
                                <div className="p-10 text-center text-sm text-gray-400">
                                    Aucun fichier produit.
                                </div>
                            ) : (
                                recentFiles.map((file, idx) => (
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
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Nav cards ── */}
                <nav aria-label="Navigation rapide" className="grid md:grid-cols-2 gap-5">
                    <Link
                        to="/history"
                        className="group flex items-center gap-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#4caf50]/30 transition-all focus-visible:outline-2 focus-visible:outline-[#4caf50] focus-visible:rounded-2xl"
                    >
                        <div className="p-3 bg-green-50 rounded-xl group-hover:bg-[#4caf50] transition-colors" aria-hidden="true">
                            <History className="w-6 h-6 text-[#4caf50] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">Historique des productions</p>
                            <p className="text-sm text-gray-500">
                                {loading ? "..." : files.length} fichiers disponibles
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-[#4caf50] group-hover:translate-x-1 transition-all" aria-hidden="true" />
                    </Link>

                    <Link
                        to="/docs"
                        className="group flex items-center gap-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#f5c542]/50 transition-all focus-visible:outline-2 focus-visible:outline-[#f5c542] focus-visible:rounded-2xl"
                    >
                        <div className="p-3 bg-yellow-50 rounded-xl group-hover:bg-[#f5c542] transition-colors" aria-hidden="true">
                            <BookOpen className="w-6 h-6 text-yellow-500 group-hover:text-[#1a4b8c] transition-colors" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">Référentiel BDI</p>
                            <p className="text-sm text-gray-500">
                                219 indicateurs documentés
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" aria-hidden="true" />
                    </Link>
                </nav>

            </main>
        </>
    )
}
