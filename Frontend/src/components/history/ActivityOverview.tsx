import { useMemo } from "react"
import { motion } from "framer-motion"
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { Activity, FileSpreadsheet, Layers, Clock } from "lucide-react"
import type { GeneratedFile } from "../../services/api"

const PALETTE = ["#1a4b8c", "#3bb3a9", "#4caf50", "#7c5cbf", "#e8853a", "#d24b6a"]

/** Préfixe lisible déduit du début du nom de fichier (avant le 1er "_" ou séparateur). */
function themeFromFilename(filename: string): string {
    const base = filename.replace(/\.[^.]+$/, "")
    const token = base.split(/[_\-\s]/)[0] || base
    if (!token) return "Autre"
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()
}

function relativeDateFR(date: Date): string {
    const diffMs = Date.now() - date.getTime()
    const diffDays = Math.floor(diffMs / 86_400_000)
    if (diffDays <= 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) {
        const w = Math.floor(diffDays / 7)
        return `Il y a ${w} semaine${w > 1 ? "s" : ""}`
    }
    if (diffDays < 365) {
        const m = Math.floor(diffDays / 30)
        return `Il y a ${m} mois`
    }
    const y = Math.floor(diffDays / 365)
    return `Il y a ${y} an${y > 1 ? "s" : ""}`
}

export function ActivityOverview({ files }: { files: GeneratedFile[] }) {
    const data = useMemo(() => {
        const parsed = files
            .map((f) => ({ file: f, d: new Date(f.date) }))
            .filter((x) => !isNaN(x.d.getTime()))

        // Série temporelle : générations par jour, sur la période couverte.
        const byDay = new Map<string, number>()
        for (const { d } of parsed) {
            const key = d.toISOString().slice(0, 10)
            byDay.set(key, (byDay.get(key) || 0) + 1)
        }

        let timeline: { key: string; label: string; count: number }[] = []
        if (byDay.size > 0) {
            const keys = [...byDay.keys()].sort()
            const start = new Date(keys[0])
            const end = new Date(keys[keys.length - 1])
            const spanDays = Math.round((end.getTime() - start.getTime()) / 86_400_000)

            const fmtDay = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" })
            const fmtWeek = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" })

            if (spanDays > 60) {
                // Agrégation hebdomadaire si la période est longue (lisibilité).
                const byWeek = new Map<string, number>()
                for (const { d } of parsed) {
                    const monday = new Date(d)
                    const dow = (monday.getDay() + 6) % 7
                    monday.setDate(monday.getDate() - dow)
                    const wk = monday.toISOString().slice(0, 10)
                    byWeek.set(wk, (byWeek.get(wk) || 0) + 1)
                }
                timeline = [...byWeek.keys()].sort().map((k) => ({
                    key: k,
                    label: `sem. ${fmtWeek.format(new Date(k))}`,
                    count: byWeek.get(k) || 0,
                }))
            } else {
                // Remplir chaque jour de la période (0 inclus) pour une courbe continue.
                for (
                    let t = new Date(start);
                    t.getTime() <= end.getTime();
                    t.setDate(t.getDate() + 1)
                ) {
                    const k = t.toISOString().slice(0, 10)
                    timeline.push({ key: k, label: fmtDay.format(t), count: byDay.get(k) || 0 })
                }
            }
        }

        // Répartition par thématique (préfixe du nom de fichier).
        const byTheme = new Map<string, number>()
        for (const f of files) {
            const t = themeFromFilename(f.filename)
            byTheme.set(t, (byTheme.get(t) || 0) + 1)
        }
        const themes = [...byTheme.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)

        const last = parsed.length > 0
            ? parsed.reduce((a, b) => (a.d.getTime() > b.d.getTime() ? a : b)).d
            : null

        return {
            timeline,
            themes,
            totalFiles: files.length,
            themeCount: byTheme.size,
            lastRelative: last ? relativeDateFR(last) : "—",
        }
    }, [files])

    if (files.length === 0) return null

    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div className="mb-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#1a4b8c] to-[#3bb3a9] text-white shadow-sm">
                    <Activity className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-base font-black text-[#1a4b8c]">Activité de génération</h2>
                    <p className="text-xs text-slate-500">
                        Vue d'ensemble construite à partir de vos fichiers produits.
                    </p>
                </div>
            </div>

            {/* Cartes chiffres clés */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KeyStat
                    icon={FileSpreadsheet}
                    accent="#1a4b8c"
                    value={data.totalFiles.toString()}
                    label="Fichiers générés"
                />
                <KeyStat
                    icon={Layers}
                    accent="#3bb3a9"
                    value={data.themeCount.toString()}
                    label={data.themeCount > 1 ? "Thématiques couvertes" : "Thématique couverte"}
                />
                <KeyStat
                    icon={Clock}
                    accent="#4caf50"
                    value={data.lastRelative}
                    label="Dernière génération"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Courbe d'activité */}
                <div className="lg:col-span-3">
                    <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">
                        Générations dans le temps
                    </h3>
                    <div className="h-64 w-full rounded-xl bg-slate-50/60 p-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.timeline} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1a4b8c" stopOpacity={0.55} />
                                        <stop offset="100%" stopColor="#3bb3a9" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="activityStroke" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#1a4b8c" />
                                        <stop offset="100%" stopColor="#3bb3a9" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={24}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={32}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: "1px solid #e2e8f0",
                                        fontSize: 12,
                                    }}
                                    labelStyle={{ fontWeight: 700, color: "#1a4b8c" }}
                                    formatter={(v: number) => [`${v} fichier${v > 1 ? "s" : ""}`, "Générations"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="url(#activityStroke)"
                                    strokeWidth={2.5}
                                    fill="url(#activityFill)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Répartition par thématique */}
                <div className="lg:col-span-2">
                    <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">
                        Répartition par thématique
                    </h3>
                    <div className="flex h-64 items-center gap-4 rounded-xl bg-slate-50/60 p-3">
                        <div className="h-full w-1/2 min-w-[120px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.themes}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius="55%"
                                        outerRadius="85%"
                                        paddingAngle={2}
                                        stroke="none"
                                    >
                                        {data.themes.map((_, i) => (
                                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 12,
                                            border: "1px solid #e2e8f0",
                                            fontSize: 12,
                                        }}
                                        formatter={(v: number, n: string) => [`${v} fichier${v > 1 ? "s" : ""}`, n]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <ul className="flex max-h-full w-1/2 flex-col gap-2 overflow-y-auto pr-1">
                            {data.themes.map((t, i) => (
                                <li key={t.name} className="flex items-center gap-2 text-xs">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ background: PALETTE[i % PALETTE.length] }}
                                    />
                                    <span className="min-w-0 flex-1 truncate font-semibold text-slate-700" title={t.name}>
                                        {t.name}
                                    </span>
                                    <span className="font-mono text-slate-400">{t.value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </motion.section>
    )
}

function KeyStat({
    icon: Icon,
    accent,
    value,
    label,
}: {
    icon: typeof Activity
    accent: string
    value: string
    label: string
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-sm"
                style={{ background: accent }}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <div className="truncate text-lg font-black text-slate-900" title={value}>
                    {value}
                </div>
                <div className="text-xs font-medium text-slate-500">{label}</div>
            </div>
        </div>
    )
}
