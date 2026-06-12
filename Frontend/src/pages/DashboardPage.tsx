import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import {
    ArrowRight,
    BookOpen,
    Database,
    Download,
    FileSpreadsheet,
    Globe,
    HardDrive,
    History as HistoryIcon,
    Layers,
    Loader2,
    RefreshCw,
    Sparkles,
    TrendingUp,
    Zap,
} from "lucide-react"
import { getDownloadUrl, getFiles, type GeneratedFile } from "@/services/api"
import { useAuth } from "@/hooks/useAuth"
import { formatDateFR } from "@/utils/date"

const ORSG = {
    primary: "#1a4b8c",
    teal: "#3bb3a9",
    gold: "#f5c542",
    green: "#4caf50",
    orange: "#ff9800",
    magenta: "#e91e63",
    navy: "#0033A0",
}

const THEME_PALETTE = [
    "#1a4b8c",
    "#3bb3a9",
    "#f5c542",
    "#4caf50",
    "#ff9800",
    "#e91e63",
    "#0033A0",
    "#00A651",
]

const THEMES_TOTAL = 14

function AnimatedCounter({
    value,
    duration = 1100,
}: {
    value: number
    duration?: number
}) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (value === 0) {
            setCount(0)
            return
        }
        let raf = 0
        let startTime: number | null = null
        const step = (ts: number) => {
            if (startTime === null) startTime = ts
            const progress = Math.min((ts - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * value))
            if (progress < 1) raf = requestAnimationFrame(step)
            else setCount(value)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [value, duration])

    return <>{count.toLocaleString("fr-FR")}</>
}

function getGreeting(): string {
    const h = new Date().getHours()
    if (h < 6) return "Bonne nuit"
    if (h < 12) return "Bonjour"
    if (h < 18) return "Bon après-midi"
    return "Bonsoir"
}

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
            {label && (
                <p className="mb-1 font-bold text-[#1a4b8c]">{label}</p>
            )}
            {payload.map((p: any, i: number) => (
                <p
                    key={i}
                    className="flex items-center gap-2 font-medium text-slate-700"
                >
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: p.color || p.fill }}
                    />
                    <span>{p.name || p.dataKey} :</span>
                    <span className="font-black text-[#1a4b8c]">{p.value}</span>
                </p>
            ))}
        </div>
    )
}

function KPICard({
    icon: Icon,
    label,
    value,
    subtitle,
    accent,
    delay = 0,
}: {
    icon: React.ElementType
    label: string
    value: number | string
    subtitle: string
    accent: string
    delay?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
            <div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-[0.07]"
                style={{ background: accent }}
            />
            <div className="relative flex items-center gap-3">
                <div
                    className="grid h-11 w-11 place-items-center rounded-xl text-white shadow-md"
                    style={{
                        background: accent,
                        boxShadow: `0 8px 22px -8px ${accent}`,
                    }}
                >
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    {label}
                </span>
            </div>
            <div className="mt-3 text-4xl font-black tracking-tight text-[#1a4b8c]">
                {typeof value === "number" ? (
                    <AnimatedCounter value={value} />
                ) : (
                    value
                )}
            </div>
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </motion.div>
    )
}

function ActionTile({
    icon: Icon,
    title,
    text,
    to,
    accent,
    primary,
}: {
    icon: React.ElementType
    title: string
    text: string
    to: string
    accent: string
    primary?: boolean
}) {
    return (
        <Link
            to={to}
            className={[
                "group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                primary
                    ? "border-[#1a4b8c] bg-gradient-to-br from-[#1a4b8c] to-[#2a6499] text-white"
                    : "border-slate-200 bg-white text-slate-900",
            ].join(" ")}
        >
            <div
                className={[
                    "absolute -right-10 -top-10 h-28 w-28 rounded-full",
                    primary ? "bg-white/10" : "opacity-10",
                ].join(" ")}
                style={!primary ? { background: accent } : undefined}
            />
            <div className="relative flex items-start gap-3">
                <div
                    className={[
                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                        primary ? "bg-white/15 text-white" : "text-white",
                    ].join(" ")}
                    style={!primary ? { background: accent } : undefined}
                >
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black">{title}</h3>
                    <p
                        className={[
                            "mt-1 text-sm",
                            primary ? "text-white/85" : "text-slate-500",
                        ].join(" ")}
                    >
                        {text}
                    </p>
                </div>
                <ArrowRight
                    className={[
                        "ml-auto h-5 w-5 shrink-0 transition group-hover:translate-x-1",
                        primary
                            ? "text-white"
                            : "text-slate-400 group-hover:text-[#1a4b8c]",
                    ].join(" ")}
                />
            </div>
        </Link>
    )
}

function EmptyState() {
    return (
        <div className="grid gap-4 p-10 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-300" />
            <div>
                <h3 className="text-base font-black text-slate-900">
                    Aucun fichier généré
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    Lancez votre première génération pour démarrer.
                </p>
            </div>
            <Link
                to="/generate"
                className="mx-auto inline-flex items-center gap-2 rounded-lg bg-[#1a4b8c] px-4 py-2 text-sm font-black text-white transition hover:bg-[#153e75]"
            >
                Générer un fichier
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    )
}

export function DashboardPage() {
    const { user } = useAuth()
    const [files, setFiles] = useState<GeneratedFile[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const loadFiles = async (silent = false) => {
        try {
            if (silent) setRefreshing(true)
            else setLoading(true)
            const data = await getFiles()
            setFiles(data)
        } catch {
            setFiles([])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        loadFiles()
    }, [])

    const stats = useMemo(() => {
        if (!files.length) {
            return {
                totalFiles: 0,
                themesUnique: 0,
                openDataCount: 0,
                mocaCount: 0,
                thisWeekCount: 0,
                thisWeekRatio: 0,
                lastFile: undefined as GeneratedFile | undefined,
                dailyData: [] as { date: string; label: string; count: number }[],
                topThemes: [] as { theme: string; count: number; color: string }[],
                pieData: [] as { name: string; value: number; color: string }[],
            }
        }

        const totalFiles = files.length
        const themesUnique = new Set(files.map((f) => f.theme)).size

        const sourceCounts = files.reduce(
            (acc, f) => {
                const src = f.source || "MOCA-O"
                acc[src] = (acc[src] || 0) + 1
                return acc
            },
            {} as Record<string, number>,
        )
        const openDataCount = sourceCounts["Open Data"] || 0
        const mocaCount = sourceCounts["MOCA-O"] || 0

        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const thisWeekCount = files.filter((f) => {
            const d = new Date(f.date)
            return !isNaN(d.getTime()) && d >= oneWeekAgo
        }).length
        const thisWeekRatio = totalFiles
            ? Math.round((thisWeekCount / totalFiles) * 100)
            : 0

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dailyMap: Record<string, number> = {}
        files.forEach((f) => {
            dailyMap[f.date] = (dailyMap[f.date] || 0) + 1
        })
        const dailyData = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(today)
            d.setDate(d.getDate() - (29 - i))
            const iso = d.toISOString().split("T")[0]
            const dd = d.getDate().toString().padStart(2, "0")
            const mm = (d.getMonth() + 1).toString().padStart(2, "0")
            return {
                date: iso,
                label: `${dd}/${mm}`,
                count: dailyMap[iso] || 0,
            }
        })

        const themeMap: Record<string, number> = {}
        files.forEach((f) => {
            themeMap[f.theme] = (themeMap[f.theme] || 0) + 1
        })
        const topThemes = Object.entries(themeMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([theme, count], i) => ({
                theme,
                count,
                color: THEME_PALETTE[i % THEME_PALETTE.length],
            }))

        const pieData = [
            {
                name: "Open Data",
                value: openDataCount,
                color: ORSG.primary,
            },
            {
                name: "MOCA-O",
                value: mocaCount,
                color: ORSG.teal,
            },
        ].filter((p) => p.value > 0)

        return {
            totalFiles,
            themesUnique,
            openDataCount,
            mocaCount,
            thisWeekCount,
            thisWeekRatio,
            lastFile: files[0],
            dailyData,
            topThemes,
            pieData,
        }
    }, [files])

    const recentFiles = files.slice(0, 5)
    const firstName = user?.name?.split(" ")[0]
    const dailyTotalLast30 = stats.dailyData.reduce((s, d) => s + d.count, 0)

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
            <motion.section
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl shadow-xl"
                style={{
                    background:
                        "linear-gradient(135deg, #1a4b8c 0%, #2a6499 45%, #3bb3a9 100%)",
                }}
            >
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 -translate-y-20 translate-x-20 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 translate-y-16 rounded-full bg-[#f5c542]/30 blur-2xl" />

                <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                    <div className="text-white">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 backdrop-blur-sm">
                            <Sparkles className="h-3.5 w-3.5 text-[#f5c542]" />
                            <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                                ORSG-CTPS · Plateforme Data Visus
                            </span>
                        </div>
                        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl lg:text-5xl">
                            {getGreeting()}
                            {firstName ? `, ${firstName}` : ""}.
                        </h1>
                        <p className="mt-3 max-w-xl text-base leading-7 text-white/85 md:text-lg">
                            Visualisez en un coup d'œil l'activité de la
                            plateforme et générez vos fichiers thématiques pour
                            le territoire guyanais.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                to="/generate"
                                className="group inline-flex items-center gap-2 rounded-xl bg-[#f5c542] px-5 py-3 text-sm font-black text-[#1a4b8c] shadow-lg transition hover:bg-[#fbd566] hover:shadow-xl"
                            >
                                <Zap className="h-4 w-4" />
                                Générer un fichier
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                to="/history"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/20"
                            >
                                <HistoryIcon className="h-4 w-4" />
                                Voir l'historique
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inset-0 animate-ping rounded-full bg-[#4caf50] opacity-75" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4caf50]" />
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-white">
                                    Système opérationnel
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-white/85">
                                Données publiques connectées
                            </p>
                        </div>

                        {stats.lastFile && (
                            <div className="rounded-2xl bg-white/95 p-4 shadow-lg">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                    Dernier fichier
                                </p>
                                <div className="mt-2 flex items-start gap-3">
                                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                                        <FileSpreadsheet className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="truncate text-xs font-black text-[#1a4b8c]"
                                            title={stats.lastFile.filename}
                                        >
                                            {stats.lastFile.filename}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                            {formatDateFR(stats.lastFile.date)} ·{" "}
                                            {stats.lastFile.size}
                                        </p>
                                    </div>
                                    <a
                                        href={getDownloadUrl(
                                            stats.lastFile.filename,
                                        )}
                                        className="shrink-0 rounded-lg bg-[#1a4b8c] p-2 text-white transition hover:bg-[#153e75]"
                                        title="Télécharger"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.section>

            {/* ━━━━━━━━━━━━━━━━━━ KPI ━━━━━━━━━━━━━━━━━━ */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    icon={FileSpreadsheet}
                    label="Fichiers générés"
                    value={stats.totalFiles}
                    subtitle="Production cumulée"
                    accent={ORSG.primary}
                    delay={0.05}
                />
                <KPICard
                    icon={Layers}
                    label="Thèmes couverts"
                    value={stats.themesUnique}
                    subtitle={`Sur ${THEMES_TOTAL} disponibles`}
                    accent={ORSG.teal}
                    delay={0.12}
                />
                <KPICard
                    icon={Globe}
                    label="Open Data"
                    value={stats.openDataCount}
                    subtitle="INSEE, CAF, CepiDc, BAAC..."
                    accent={ORSG.green}
                    delay={0.19}
                />
                <KPICard
                    icon={TrendingUp}
                    label="Cette semaine"
                    value={stats.thisWeekCount}
                    subtitle={
                        stats.totalFiles > 0
                            ? `${stats.thisWeekRatio}% de l'activité`
                            : "Sur 7 jours glissants"
                    }
                    accent={ORSG.orange}
                    delay={0.26}
                />
            </section>

            {/* ━━━━━━━━━━━━━━━━━━ CHARTS ━━━━━━━━━━━━━━━━━━ */}
            {files.length > 0 ? (
                <>
                    <section className="mt-6 grid gap-4 lg:grid-cols-3">
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-[#1a4b8c]">
                                        Activité (30 jours)
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Fichiers générés par jour
                                    </p>
                                </div>
                                <div className="rounded-full bg-[#3bb3a9]/10 px-3 py-1 text-xs font-black text-[#3bb3a9]">
                                    {dailyTotalLast30} sur 30j
                                </div>
                            </div>
                            <div className="mt-4 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={stats.dailyData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="gradActivity"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#3bb3a9"
                                                    stopOpacity={0.45}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#3bb3a9"
                                                    stopOpacity={0.02}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e2e8f0"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="label"
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            interval={4}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            name="Fichiers"
                                            stroke="#1a4b8c"
                                            strokeWidth={2.5}
                                            fill="url(#gradActivity)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.36, duration: 0.5 }}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div>
                                <h2 className="text-lg font-black text-[#1a4b8c]">
                                    Sources
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Répartition des données
                                </p>
                            </div>
                            <div className="mt-4 h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={42}
                                            outerRadius={68}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {stats.pieData.map((entry, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 space-y-1.5">
                                {stats.pieData.map((s) => (
                                    <div
                                        key={s.name}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ background: s.color }}
                                            />
                                            <span className="font-bold text-slate-700">
                                                {s.name}
                                            </span>
                                        </div>
                                        <span className="font-black text-[#1a4b8c]">
                                            {s.value} ·{" "}
                                            {Math.round(
                                                (s.value / stats.totalFiles) *
                                                    100,
                                            )}
                                            %
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </section>

                    {stats.topThemes.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-[#1a4b8c]">
                                        Top thématiques
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Les plus générées
                                    </p>
                                </div>
                                <div className="hidden items-center gap-2 text-xs font-bold text-slate-500 sm:flex">
                                    <Database className="h-3.5 w-3.5" />
                                    {stats.themesUnique} thématiques actives
                                </div>
                            </div>
                            <div className="mt-4 h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stats.topThemes}
                                        layout="vertical"
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 5,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e2e8f0"
                                            horizontal={false}
                                        />
                                        <XAxis
                                            type="number"
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="theme"
                                            stroke="#475569"
                                            fontSize={12}
                                            width={170}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            content={<ChartTooltip />}
                                            cursor={{ fill: "#1a4b8c0a" }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            name="Fichiers"
                                            radius={[0, 6, 6, 0]}
                                        >
                                            {stats.topThemes.map((entry, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.section>
                    )}
                </>
            ) : null}

            {/* ━━━━━━━━━━━━━━━━━━ RECENT FILES ━━━━━━━━━━━━━━━━━━ */}
            <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-lg font-black text-[#1a4b8c]">
                            Activité récente
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Les 5 derniers fichiers générés
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => loadFiles(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#1a4b8c] transition hover:border-[#3bb3a9]"
                        >
                            <RefreshCw
                                className={[
                                    "h-3.5 w-3.5",
                                    refreshing ? "animate-spin" : "",
                                ].join(" ")}
                            />
                            Actualiser
                        </button>
                        <Link
                            to="/history"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#1a4b8c] px-3 py-2 text-xs font-black text-white transition hover:bg-[#153e75]"
                        >
                            Tout voir
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center gap-3 p-10 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin text-[#3bb3a9]" />
                        <span className="text-sm">Chargement...</span>
                    </div>
                ) : recentFiles.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recentFiles.map((file, i) => (
                            <motion.div
                                key={file.filename + i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    delay: 0.5 + i * 0.05,
                                    duration: 0.3,
                                }}
                                className="grid gap-3 p-4 transition hover:bg-slate-50/50 md:grid-cols-[1fr_auto] md:items-center"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className={[
                                            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                                            file.source === "Open Data"
                                                ? "bg-blue-50 text-[#1a4b8c]"
                                                : "bg-emerald-50 text-emerald-700",
                                        ].join(" ")}
                                    >
                                        {file.source === "Open Data" ? (
                                            <Globe className="h-4 w-4" />
                                        ) : (
                                            <HardDrive className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p
                                            className="truncate text-sm font-black text-slate-900"
                                            title={file.filename}
                                        >
                                            {file.filename}
                                        </p>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                                            <span className="font-medium text-slate-600">
                                                {file.theme}
                                            </span>
                                            <span>·</span>
                                            <span>
                                                {formatDateFR(file.date)}
                                            </span>
                                            <span>·</span>
                                            <span className="font-mono">
                                                {file.size}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={getDownloadUrl(file.filename)}
                                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-[#1a4b8c] transition hover:border-[#1a4b8c] hover:bg-[#1a4b8c] hover:text-white"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Télécharger
                                </a>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.section>

            {/* ━━━━━━━━━━━━━━━━━━ ACTION TILES ━━━━━━━━━━━━━━━━━━ */}
            <section className="mt-6 grid gap-4 md:grid-cols-3">
                <ActionTile
                    icon={Layers}
                    title="Générer un fichier"
                    text="Sélectionner une thématique, un millésime, et lancer la production."
                    to="/generate"
                    accent={ORSG.primary}
                    primary
                />
                <ActionTile
                    icon={HistoryIcon}
                    title="Consulter l'historique"
                    text="Toutes les productions, à télécharger en un clic."
                    to="/history"
                    accent={ORSG.teal}
                />
                <ActionTile
                    icon={BookOpen}
                    title="Dictionnaire BDI"
                    text="Définitions et indicateurs pour une lecture éclairée."
                    to="/docs"
                    accent={ORSG.gold}
                />
            </section>
        </main>
    )
}
