import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Link } from "react-router-dom"
import {
    ArrowRight, Wand2, History, BookOpen, Clock, Database,
    FileSpreadsheet, TrendingUp, Zap, CheckCircle2, XCircle,
    BarChart3, Download, Calendar, FileText, Loader2, Globe
} from "lucide-react"
import { getFiles } from "@/services/api"
import type { GeneratedFile } from "@/services/api"

// ─────────────────────────────────────────────
// Hook : compte animé de 0 → target
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Carte KPI animée
// ─────────────────────────────────────────────
function KpiCard({ value, label, suffix = "", icon: Icon, topColor, iconColor, delay = 0 }: {
    value: number; label: string; suffix?: string
    icon: React.ElementType; topColor: string; iconColor: string; delay?: number
}) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: "-40px" })
    const count = useCountUp(value, 1800, inView)

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay }}
            className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
        >
            <div className={`absolute top-0 inset-x-0 h-1 ${topColor}`} />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-4xl font-black text-[#1a4b8c] tabular-nums leading-none">
                        {count.toLocaleString("fr-FR")}{suffix}
                    </p>
                    <p className="text-sm font-medium text-gray-500 mt-2 leading-snug">{label}</p>
                </div>
                <div className={`p-3 rounded-xl ${iconColor} transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────
// Section Avant / Après — Pain Points
// ─────────────────────────────────────────────
const PAIN_POINTS = [
    {
        icon: Clock,
        before: "4h par indicateur",
        beforeSub: "Saisie, vérification, mise en forme manuelle",
        after: "~2 minutes",
        afterSub: "Génération automatique et validation intégrée",
    },
    {
        icon: Database,
        before: "9 sources éparpillées",
        beforeSub: "INSEE, CAF, IRCOM, DREES… accès séparés",
        after: "1 interface unifiée",
        afterSub: "Toutes les sources intégrées en un seul endroit",
    },
    {
        icon: XCircle,
        before: "Erreurs humaines fréquentes",
        beforeSub: "Recopie manuelle, formules instables",
        after: "Données fiables — 0 erreur",
        afterSub: "Sourcées directement, format contrôlé",
    },
    {
        icon: FileSpreadsheet,
        before: "Format non standardisé",
        beforeSub: "Chaque fichier différent selon l'analyste",
        after: "Géoclip-ready (5 onglets)",
        afterSub: "Structure normalisée, importable directement",
    },
    {
        icon: BarChart3,
        before: "Aucune traçabilité",
        beforeSub: "Impossible de retrouver qui a fait quoi",
        after: "Audit trail complet",
        afterSub: "Historique horodaté de toutes les générations",
    },
]

// ─────────────────────────────────────────────
// Bar Chart CSS — Distribution par thématique
// ─────────────────────────────────────────────
const BAR_COLORS = ["#1a4b8c", "#3bb3a9", "#4caf50", "#f5c542", "#0083B0", "#9c27b0", "#ff9800", "#e91e63"]

function ThemeBarChart({ files }: { files: GeneratedFile[] }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: "-60px" })

    const themeCounts = files.reduce((acc, f) => {
        const label = f.theme || f.filename.split("_")[0]
        acc[label] = (acc[label] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const sorted = Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)

    const max = sorted[0]?.[1] || 1

    return (
        <div ref={ref} className="space-y-3">
            {sorted.map(([theme, count], i) => (
                <div key={theme} className="flex items-center gap-4">
                    <div
                        className="w-52 text-xs font-semibold text-gray-500 truncate text-right flex-shrink-0"
                        title={theme}
                    >
                        {theme}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={inView ? { width: `${(count / max) * 100}%` } : { width: 0 }}
                            transition={{ duration: 0.9, delay: i * 0.07, ease: "easeOut" }}
                            className="h-full rounded-full flex items-center justify-end px-3"
                            style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                        >
                            <span className="text-xs font-bold text-white">{count}</span>
                        </motion.div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────
// Mini progress bar card
// ─────────────────────────────────────────────
function CoverageCard({ label, value, max, color, icon: Icon }: {
    label: string; value: number; max: number; color: string; icon: React.ElementType
}) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    return (
        <div ref={ref} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
            </div>
            <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-black" style={{ color }}>{value}</span>
                <span className="text-sm text-gray-400 mb-1">/ {max}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${(value / max) * 100}%` } : { width: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────
export function DashboardPage() {
    const [files, setFiles] = useState<GeneratedFile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getFiles()
            .then(setFiles)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const fileCount = files.length
    const hoursSaved = fileCount * 4
    const uniqueThemes = new Set(files.map(f => f.theme)).size
    const recentFiles = files.slice(0, 4)

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">

            {/* ── En-tête ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a4b8c] tracking-tight">
                        Bonjour, Expert ORSG 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Tableau de bord de pilotage — Indicateurs de santé de Guyane
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium text-gray-600">Système opérationnel</span>
                </div>
            </div>

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard
                    value={loading ? 0 : fileCount}
                    label="Fichiers Excel générés"
                    icon={FileSpreadsheet}
                    topColor="bg-gradient-to-r from-[#1a4b8c] to-[#3bb3a9]"
                    iconColor="bg-blue-50 text-[#1a4b8c]"
                    delay={0}
                />
                <KpiCard
                    value={219}
                    label="Indicateurs BDI disponibles"
                    icon={BarChart3}
                    topColor="bg-[#3bb3a9]"
                    iconColor="bg-teal-50 text-[#3bb3a9]"
                    delay={0.1}
                />
                <KpiCard
                    value={loading ? 0 : uniqueThemes}
                    label="Thématiques couvertes"
                    icon={TrendingUp}
                    topColor="bg-[#4caf50]"
                    iconColor="bg-green-50 text-[#4caf50]"
                    delay={0.2}
                />
                <KpiCard
                    value={loading ? 0 : hoursSaved}
                    suffix="h"
                    label="Heures économisées vs. manuel"
                    icon={Clock}
                    topColor="bg-[#f5c542]"
                    iconColor="bg-yellow-50 text-yellow-600"
                    delay={0.3}
                />
            </div>

            {/* ── Impact PRISME — Avant / Après ── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a4b8c] to-[#0083B0] px-8 py-6 flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Zap className="w-6 h-6 text-[#f5c542]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Impact PRISME</h2>
                        <p className="text-blue-200 text-sm mt-0.5">
                            Transformer la production d'indicateurs de santé en Guyane
                        </p>
                    </div>
                    <div className="ml-auto hidden md:flex flex-col items-center bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/20">
                        <span className="text-3xl font-black text-[#f5c542]">×120</span>
                        <span className="text-xs text-blue-200 font-medium">plus rapide</span>
                    </div>
                </div>

                {/* Grille Avant / Après */}
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                    {/* AVANT */}
                    <div className="p-7 bg-red-50/40">
                        <div className="flex items-center gap-2 mb-5">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <h3 className="font-bold text-red-700 uppercase tracking-wider text-sm">Avant PRISME</h3>
                        </div>
                        <div className="space-y-4">
                            {PAIN_POINTS.map((p, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="p-1.5 bg-red-100 rounded-lg mt-0.5 flex-shrink-0">
                                        <p.icon className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-red-800">{p.before}</p>
                                        <p className="text-xs text-red-500 mt-0.5">{p.beforeSub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* APRÈS */}
                    <div className="p-7 bg-green-50/40">
                        <div className="flex items-center gap-2 mb-5">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <h3 className="font-bold text-green-700 uppercase tracking-wider text-sm">Après PRISME</h3>
                        </div>
                        <div className="space-y-4">
                            {PAIN_POINTS.map((p, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07 + 0.15 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="p-1.5 bg-green-100 rounded-lg mt-0.5 flex-shrink-0">
                                        <p.icon className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-green-800">{p.after}</p>
                                        <p className="text-xs text-green-600 mt-0.5">{p.afterSub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Couverture données ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <CoverageCard label="Sources Open Data intégrées" value={9} max={9} color="#3bb3a9" icon={Globe} />
                <CoverageCard label="Années de données couvertes" value={9} max={9} color="#1a4b8c" icon={Calendar} />
                <CoverageCard label="Niveaux géographiques" value={5} max={5} color="#4caf50" icon={FileText} />
            </div>

            {/* ── Distribution par thématique ── */}
            {!loading && files.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#1a4b8c] flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[#3bb3a9]" />
                            Production par thématique
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {files.length} fichiers générés · Top 8 thèmes
                        </p>
                    </div>
                    <ThemeBarChart files={files} />
                </motion.div>
            )}

            {/* ── CTA + Activité récente ── */}
            <div className="grid md:grid-cols-5 gap-6">

                {/* CTA Card avec video */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="md:col-span-2 relative rounded-3xl overflow-hidden shadow-xl"
                >
                    <video autoPlay muted loop playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                        src="/bg-video.mp4"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a4b8c]/90 to-[#3bb3a9]/80" />
                    <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[280px]">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-[#f5c542] text-xs font-bold uppercase tracking-wider border border-white/25 mb-4">
                                <Wand2 className="w-3 h-3" />
                                Assistant IA
                            </div>
                            <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                                Générer un nouveau rapport
                            </h2>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                3 étapes. Données validées. Format Géoclip.
                            </p>
                        </div>
                        <Link
                            to="/generate"
                            className="mt-6 group/btn flex items-center justify-center gap-2 bg-white text-[#1a4b8c] px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#f5c542] transition-all transform hover:scale-105"
                        >
                            Commencer
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                    </div>
                </motion.div>

                {/* Activité récente */}
                <div className="md:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="font-bold text-[#1a4b8c] flex items-center gap-2 text-base">
                            <History className="w-4 h-4 opacity-70" />
                            Dernières générations
                        </h2>
                        <Link to="/history" className="text-xs font-semibold text-[#3bb3a9] hover:underline">
                            Voir tout →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            <div className="p-8 flex justify-center text-gray-300">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : recentFiles.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-400">
                                Aucun fichier généré — lancez le générateur !
                            </div>
                        ) : (
                            recentFiles.map((file, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.07 }}
                                    className="px-6 py-3.5 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#1a4b8c] group-hover:bg-[#1a4b8c] group-hover:text-white transition-colors">
                                            <FileSpreadsheet className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 leading-none">{file.filename}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400">{file.theme}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className="text-xs text-gray-400">{file.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400">{file.date}</span>
                                        <button
                                            onClick={() => window.open(`/api/download/${file.filename}`, '_blank')}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#3bb3a9]/10 text-[#3bb3a9]"
                                            title="Télécharger"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Raccourcis secondaires ── */}
            <div className="grid md:grid-cols-2 gap-5">
                <Link to="/history"
                    className="group flex items-center gap-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#4caf50]/30 transition-all"
                >
                    <div className="p-3 bg-green-50 rounded-xl group-hover:bg-[#4caf50] transition-colors">
                        <History className="w-6 h-6 text-[#4caf50] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Historique complet</p>
                        <p className="text-sm text-gray-500">{loading ? "..." : files.length} fichiers · Recherche &amp; téléchargement</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-[#4caf50] group-hover:translate-x-1 transition-all" />
                </Link>

                <Link to="/docs"
                    className="group flex items-center gap-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#f5c542]/50 transition-all"
                >
                    <div className="p-3 bg-yellow-50 rounded-xl group-hover:bg-[#f5c542] transition-colors">
                        <BookOpen className="w-6 h-6 text-yellow-500 group-hover:text-[#1a4b8c] transition-colors" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Référentiel BDI</p>
                        <p className="text-sm text-gray-500">219 indicateurs · Documentation complète</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

        </div>
    )
}
