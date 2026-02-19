import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Link } from "react-router-dom"
import {
    ArrowRight, History, BookOpen, FileSpreadsheet,
    TrendingUp, BarChart3, Download, Calendar, Loader2, Globe
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
// Carte KPI
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
// Camembert SVG animé — Temps économisé
// ─────────────────────────────────────────────
function DonutChart({ ratio, centerValue, centerLabel, color, size = 140 }: {
    ratio: number; centerValue: string; centerLabel: string; color: string; size?: number
}) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    const r = 40
    const stroke = 11
    const circumference = 2 * Math.PI * r

    return (
        <div ref={ref} className="flex flex-col items-center gap-2">
            <div style={{ width: size, height: size }} className="relative">
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
                    {/* Piste */}
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
                    {/* Arc */}
                    <motion.circle
                        cx="50" cy="50" r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={inView
                            ? { strokeDashoffset: circumference * (1 - ratio) }
                            : { strokeDashoffset: circumference }
                        }
                        transition={{ duration: 1.8, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-black text-xl leading-none" style={{ color }}>{centerValue}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{centerLabel}</span>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// Bar Chart CSS — Production par thématique
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
                    <div className="w-52 text-xs font-medium text-gray-500 truncate text-right flex-shrink-0" title={theme}>
                        {theme}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
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

    // Ratio camembert : 2min vs 4h (240min)
    const timeRatio = (240 - 2) / 240 // ~0.992

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">

            {/* ── En-tête ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a4b8c] tracking-tight">
                        Tableau de bord opérationnel
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Indicateurs de santé de Guyane — ORSG-CTPS, {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium text-gray-600">Système actif</span>
                </div>
            </div>

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard
                    value={loading ? 0 : fileCount}
                    label="Fichiers Excel produits"
                    icon={FileSpreadsheet}
                    topColor="bg-gradient-to-r from-[#1a4b8c] to-[#3bb3a9]"
                    iconColor="bg-blue-50 text-[#1a4b8c]"
                    delay={0}
                />
                <KpiCard
                    value={219}
                    label="Indicateurs BDI référencés"
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
                    label="Temps valorisé (estimé)"
                    icon={Calendar}
                    topColor="bg-[#f5c542]"
                    iconColor="bg-yellow-50 text-yellow-600"
                    delay={0.3}
                />
            </div>

            {/* ── CTA Génération ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative rounded-3xl overflow-hidden shadow-lg"
            >
                <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" src="/bg-video.mp4" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a4b8c]/92 via-[#1a4b8c]/82 to-[#3bb3a9]/65" />
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
                            Le fichier est prêt en moins de deux minutes, format Géoclip, prêt à l'import.
                        </p>
                    </div>
                    <Link
                        to="/generate"
                        className="group/btn flex-shrink-0 flex items-center gap-3 bg-white text-[#1a4b8c] px-8 py-4 rounded-xl font-bold text-base shadow-xl hover:bg-[#f5c542] transition-all transform hover:scale-105"
                    >
                        Démarrer
                        <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </div>
            </motion.div>

            {/* ── Temps de production — Camembert + chiffres clés ── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
            >
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#1a4b8c]">
                        Temps de production par indicateur
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Comparaison : production conventionnelle vs génération automatisée.
                        Base de référence : 4h par fichier (collecte manuelle, mise en forme, vérification).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">

                    {/* Camembert */}
                    <div className="flex flex-col items-center">
                        <DonutChart
                            ratio={timeRatio}
                            centerValue="99%"
                            centerLabel="économisé"
                            color="#3bb3a9"
                            size={150}
                        />
                        <p className="text-xs text-gray-400 mt-3 text-center">Part du temps évité<br />par génération</p>
                    </div>

                    {/* Comparaison chiffrée */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                Production conventionnelle
                            </p>
                            <p className="text-4xl font-black text-gray-700">4<span className="text-xl font-bold ml-0.5">h</span></p>
                            <p className="text-xs text-gray-400 mt-1">par indicateur / par année</p>
                        </div>
                        <div className="bg-[#3bb3a9]/8 rounded-2xl p-5 border border-[#3bb3a9]/20">
                            <p className="text-xs font-semibold text-[#3bb3a9] uppercase tracking-wide mb-2">
                                Avec la plateforme
                            </p>
                            <p className="text-4xl font-black text-[#3bb3a9]">2<span className="text-xl font-bold ml-0.5">min</span></p>
                            <p className="text-xs text-gray-400 mt-1">génération automatisée</p>
                        </div>
                    </div>

                    {/* Total valorisé */}
                    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#1a4b8c] to-[#3bb3a9] rounded-2xl p-6 text-white text-center">
                        {loading ? (
                            <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                        ) : (
                            <>
                                <p className="text-4xl font-black">{hoursSaved.toLocaleString("fr-FR")}<span className="text-xl ml-0.5">h</span></p>
                                <p className="text-xs text-blue-100 mt-1">de travail valorisé</p>
                                <div className="mt-3 pt-3 border-t border-white/20 w-full">
                                    <p className="text-xs text-blue-200">
                                        soit ~{Math.round(hoursSaved / 7.5)} jours-personne
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <p className="text-xs text-gray-300 mt-6">
                    * Estimation basée sur un benchmark documenté de 4h par indicateur en production manuelle (collecte multi-sources, saisie, contrôle qualité, formatage Géoclip).
                    Durée réelle variable selon la complexité thématique.
                </p>
            </motion.div>

            {/* ── Production par thématique ── */}
            {!loading && files.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#1a4b8c]">
                            Répartition par thématique
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {files.length} fichiers produits — 8 thématiques les plus actives
                        </p>
                    </div>
                    <ThemeBarChart files={files} />
                </motion.div>
            )}

            {/* ── Activité récente ── */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="font-bold text-[#1a4b8c] flex items-center gap-2 text-base">
                        <History className="w-4 h-4 opacity-70" />
                        Productions récentes
                    </h2>
                    <Link to="/history" className="text-xs font-semibold text-[#3bb3a9] hover:underline">
                        Consulter l'historique
                    </Link>
                </div>
                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-10 flex justify-center text-gray-200">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : recentFiles.length === 0 ? (
                        <div className="p-10 text-center text-sm text-gray-400">
                            Aucun fichier produit. Lancez une première génération depuis le module ci-dessus.
                        </div>
                    ) : (
                        recentFiles.map((file, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.07 }}
                                className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#1a4b8c] group-hover:bg-[#1a4b8c] group-hover:text-white transition-colors">
                                        <FileSpreadsheet className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{file.filename}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-400">{file.theme}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span className="text-xs text-gray-400">{file.size}</span>
                                            {file.source === "Open Data" && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="text-xs text-[#3bb3a9] flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        Open Data
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">{file.date}</span>
                                    <button
                                        onClick={() => window.open(`/api/download/${file.filename}`, "_blank")}
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

            {/* ── Navigation ── */}
            <div className="grid md:grid-cols-2 gap-5">
                <Link to="/history"
                    className="group flex items-center gap-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#4caf50]/30 transition-all"
                >
                    <div className="p-3 bg-green-50 rounded-xl group-hover:bg-[#4caf50] transition-colors">
                        <History className="w-6 h-6 text-[#4caf50] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Historique des productions</p>
                        <p className="text-sm text-gray-500">
                            {loading ? "..." : files.length} fichiers disponibles — recherche et téléchargement
                        </p>
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
                        <p className="text-sm text-gray-500">
                            219 indicateurs documentés — définitions, sources, méthodes de calcul
                        </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

        </div>
    )
}
