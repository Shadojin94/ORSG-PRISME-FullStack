import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Link } from "react-router-dom"
import {
    ArrowRight, History, BookOpen, FileSpreadsheet,
    TrendingUp, BarChart3, Download, Calendar, Loader2, Globe, HardDrive
} from "lucide-react"
import { getFiles } from "@/services/api"
import type { GeneratedFile } from "@/services/api"

// ─────────────────────────────────────────────
// Hook : compte animé 0 → target
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
// Carte KPI (RGAA: role region + aria-label)
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Donut SVG — RGAA role="img" + aria-label
// ─────────────────────────────────────────────
function DonutChart({ ratio, centerValue, subLabel, color, size = 180, ariaLabel }: {
    ratio: number; centerValue: string; subLabel: string; color: string; size?: number; ariaLabel: string
}) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    const r = 40
    const stroke = 11
    const circumference = 2 * Math.PI * r

    return (
        <div ref={ref} className="flex flex-col items-center gap-3">
            <div style={{ width: size, height: size }} className="relative">
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    style={{ transform: "rotate(-90deg)" }}
                    role="img"
                    aria-label={ariaLabel}
                >
                    <title>{ariaLabel}</title>
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
                    <motion.circle
                        cx="50" cy="50" r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={inView ? { strokeDashoffset: circumference * (1 - ratio) } : { strokeDashoffset: circumference }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
                    <span className="font-black text-2xl leading-none" style={{ color }}>{centerValue}</span>
                    <span className="text-xs text-gray-400 mt-1 text-center px-2">{subLabel}</span>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// Barre de comparaison horizontale animée
// ─────────────────────────────────────────────
function ComparisonBar({ label, value, max, color, textValue, delay = 0 }: {
    label: string; value: number; max: number; color: string; textValue: string; delay?: number
}) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })
    const pct = (value / max) * 100

    return (
        <div ref={ref} className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <span className="text-sm font-bold" style={{ color }}>{textValue}</span>
            </div>
            <div
                className="bg-gray-100 rounded-full h-5 overflow-hidden"
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={`${label} : ${textValue}`}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${pct}%` } : { width: 0 }}
                    transition={{ duration: 1.2, delay, ease: "easeOut" }}
                    className="h-full rounded-full flex items-center justify-end px-2.5"
                    style={{ backgroundColor: color, minWidth: pct < 5 ? "2.5rem" : undefined }}
                >
                    {pct >= 5 && <span className="text-xs font-bold text-white">{textValue}</span>}
                </motion.div>
                {pct < 5 && (
                    <span className="text-xs font-bold ml-2 text-gray-600 absolute">{textValue}</span>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// Barres thématiques (bar chart)
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

    const sorted = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
    const max = sorted[0]?.[1] || 1

    return (
        <div
            ref={ref}
            role="list"
            aria-label="Répartition des fichiers produits par thématique"
            className="space-y-3"
        >
            {sorted.map(([theme, count], i) => (
                <div key={theme} role="listitem" className="flex items-center gap-4">
                    <div className="w-52 text-xs font-medium text-gray-500 truncate text-right flex-shrink-0" title={theme}>
                        {theme}
                    </div>
                    <div
                        className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden"
                        role="progressbar"
                        aria-valuenow={count}
                        aria-valuemin={0}
                        aria-valuemax={max}
                        aria-label={`${theme} : ${count} fichier${count > 1 ? "s" : ""}`}
                    >
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
    const openDataCount = files.filter(f => f.source === "Open Data").length
    const mocaCount = files.filter(f => f.source !== "Open Data").length
    const uniqueThemes = new Set(files.map(f => f.theme)).size
    const recentFiles = files.slice(0, 5)

    return (
        <>
            {/* ── Lien d'évitement RGAA ── */}
            <a
                href="#contenu-principal"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#1a4b8c] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
            >
                Aller au contenu principal
            </a>

            <main
                id="contenu-principal"
                className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10"
                aria-label="Tableau de bord opérationnel PRISME"
            >

                {/* ── En-tête ── */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a4b8c] tracking-tight">
                            Tableau de bord opérationnel
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Indicateurs de santé de Guyane — ORSG-CTPS,{" "}
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
                        <span className="font-medium text-gray-600">Système actif</span>
                    </div>
                </header>

                {/* ── KPI Grid ── */}
                <section aria-label="Indicateurs clés">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        <KpiCard value={loading ? 0 : fileCount} label="Fichiers Excel produits" icon={FileSpreadsheet}
                            topColor="bg-gradient-to-r from-[#1a4b8c] to-[#3bb3a9]" iconColor="bg-blue-50 text-[#1a4b8c]" delay={0} />
                        <KpiCard value={219} label="Indicateurs BDI référencés" icon={BarChart3}
                            topColor="bg-[#3bb3a9]" iconColor="bg-teal-50 text-[#3bb3a9]" delay={0.1} />
                        <KpiCard value={loading ? 0 : uniqueThemes} label="Thématiques couvertes" icon={TrendingUp}
                            topColor="bg-[#4caf50]" iconColor="bg-green-50 text-[#4caf50]" delay={0.2} />
                        <KpiCard value={loading ? 0 : hoursSaved} suffix="h" label="Temps valorisé (estimé)" icon={Calendar}
                            topColor="bg-[#f5c542]" iconColor="bg-yellow-50 text-yellow-600" delay={0.3} />
                    </div>
                </section>

                {/* ── CTA Génération ── */}
                <motion.section
                    aria-label="Accès rapide à la génération de rapports"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="relative rounded-3xl overflow-hidden shadow-lg"
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
                                Le fichier est prêt en moins de deux minutes, format Géoclip, prêt à l'import.
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

                {/* ── Efficacité de production — Bento 2 colonnes ── */}
                <section aria-label="Efficacité de production">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="px-8 pt-8 pb-0">
                            <h2 className="text-xl font-bold text-[#1a4b8c]">Efficacité de production</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Production conventionnelle vs génération automatisée.
                                Référence : 4h/fichier (collecte multi-sources, saisie, contrôle, formatage Géoclip).
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

                            {/* Colonne 1 : Donut centré */}
                            <div className="flex flex-col items-center justify-center p-8 gap-4">
                                <DonutChart
                                    ratio={(240 - 2) / 240}
                                    centerValue="99%"
                                    subLabel="temps économisé par génération"
                                    color="#3bb3a9"
                                    size={190}
                                    ariaLabel="Diagramme circulaire : 99% du temps économisé par rapport à la production conventionnelle"
                                />
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">
                                        2 min (plateforme) vs 4h (conventionnel)
                                    </p>
                                </div>
                            </div>

                            {/* Colonne 2 : Barres de comparaison */}
                            <div className="flex flex-col justify-center p-8 gap-5">
                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                    Durée par indicateur / par année
                                </p>

                                {/* Barre conventionnel : 240min = 100% */}
                                <ComparisonBar
                                    label="Production conventionnelle"
                                    value={240} max={240}
                                    color="#94a3b8"
                                    textValue="4 h 00"
                                    delay={0}
                                />
                                {/* Barre PRISME : 2min = ~0.8% → on la scale différemment pour la lisibilité */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Avec la plateforme</span>
                                        <span className="text-sm font-bold text-[#3bb3a9]">2 min</span>
                                    </div>
                                    <div
                                        className="bg-gray-100 rounded-full h-5 overflow-hidden"
                                        role="progressbar"
                                        aria-valuenow={2}
                                        aria-valuemin={0}
                                        aria-valuemax={240}
                                        aria-label="Avec la plateforme : 2 minutes"
                                    >
                                        {/* Volontairement overscaled à 8% min pour la lisibilité visuelle */}
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "8%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                            className="h-5 rounded-full"
                                            style={{ backgroundColor: "#3bb3a9" }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">Échelle ajustée pour la lisibilité</p>
                                </div>

                                <div className="mt-2 flex items-center gap-3 bg-[#1a4b8c]/5 rounded-xl px-4 py-3">
                                    <span className="text-2xl font-black text-[#1a4b8c]">×120</span>
                                    <span className="text-sm text-gray-600">plus rapide qu'en production manuelle</span>
                                </div>
                            </div>

                            {/* Colonne 3 : Total valorisé + Source split */}
                            <div className="flex flex-col gap-4 p-8">

                                {/* Total heures */}
                                <div className="bg-gradient-to-br from-[#1a4b8c] to-[#3bb3a9] rounded-2xl p-5 text-white text-center">
                                    {loading ? (
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto opacity-50" aria-label="Chargement" />
                                    ) : (
                                        <>
                                            <p className="text-4xl font-black" aria-live="polite">
                                                {hoursSaved.toLocaleString("fr-FR")}<span className="text-2xl ml-0.5">h</span>
                                            </p>
                                            <p className="text-xs text-blue-100 mt-1">de travail valorisé</p>
                                            <div className="mt-3 pt-3 border-t border-white/20">
                                                <p className="text-xs text-blue-200">
                                                    soit ~{Math.round(hoursSaved / 7.5)} jours-personne
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Split MOCA-O vs Open Data — deux mini donuts */}
                                {!loading && files.length > 0 && (
                                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                                            Source des données
                                        </p>
                                        <div className="flex items-center justify-around gap-3">
                                            <DonutChart
                                                ratio={mocaCount / fileCount}
                                                centerValue={`${Math.round((mocaCount / fileCount) * 100)}%`}
                                                subLabel="MOCA-O"
                                                color="#1a4b8c"
                                                size={90}
                                                ariaLabel={`MOCA-O : ${mocaCount} fichiers sur ${fileCount}, soit ${Math.round((mocaCount / fileCount) * 100)}%`}
                                            />
                                            <DonutChart
                                                ratio={openDataCount / fileCount}
                                                centerValue={`${Math.round((openDataCount / fileCount) * 100)}%`}
                                                subLabel="Open Data"
                                                color="#3bb3a9"
                                                size={90}
                                                ariaLabel={`Open Data : ${openDataCount} fichiers sur ${fileCount}, soit ${Math.round((openDataCount / fileCount) * 100)}%`}
                                            />
                                        </div>
                                        <div className="flex justify-around mt-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <HardDrive className="w-3 h-3 text-[#1a4b8c]" aria-hidden="true" />
                                                {mocaCount} fichiers
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Globe className="w-3 h-3 text-[#3bb3a9]" aria-hidden="true" />
                                                {openDataCount} fichiers
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-8 py-3 border-t border-gray-50 bg-gray-50/50">
                            <p className="text-xs text-gray-400">
                                * Estimation. Base de référence : 4h/fichier en production manuelle (collecte multi-sources,
                                saisie, contrôle qualité, formatage Géoclip). Durée réelle variable selon la complexité thématique.
                            </p>
                        </div>
                    </motion.div>
                </section>

                {/* ── Répartition par thématique ── */}
                {!loading && files.length > 0 && (
                    <section aria-label="Répartition des productions par thématique">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
                        >
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-[#1a4b8c]">Répartition par thématique</h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    {files.length} fichiers produits — 8 thématiques les plus actives
                                </p>
                            </div>
                            <ThemeBarChart files={files} />
                        </motion.div>
                    </section>
                )}

                {/* ── Productions récentes ── */}
                <section aria-label="Productions récentes">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
                                    Aucun fichier produit. Lancez une première génération depuis le module ci-dessus.
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

                {/* ── Navigation ── */}
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
                                {loading ? "..." : files.length} fichiers disponibles — recherche et téléchargement
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
                                219 indicateurs documentés — définitions, sources, méthodes de calcul
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" aria-hidden="true" />
                    </Link>
                </nav>

            </main>
        </>
    )
}
