import { useState } from "react"
import { CheckCircle2, FileSpreadsheet, Download, Play, Calendar, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
// Import BDI Themes
import { BDI_THEMES } from "@/data/bdi_themes"

const STEPS = [
    { id: 1, label: "Périmètre", description: "Thème et Année" },
    { id: 2, label: "Traitement", description: "Génération" },
    { id: 3, label: "Résultat", description: "Rapport Excel" },
]

// Backend URL for direct download
const BACKEND_OUTPUT_URL = "http://127.0.0.1:8090"

export function GeneratorPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)

    // State
    const [selectedThemeId, setSelectedThemeId] = useState("educ")
    const [year, setYear] = useState("2022")
    const [logs, setLogs] = useState<string[]>([])
    const [generatedFile, setGeneratedFile] = useState<string | null>(null)

    const selectedTheme = BDI_THEMES.find(t => t.id === selectedThemeId)

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    // Start generation - calls backend to generate file on-demand
    const startGeneration = async () => {
        setIsProcessing(true)
        setLogs(["🚀 Initialisation du moteur PRISME..."])

        try {
            setLogs(prev => [...prev, "📡 Connexion au serveur de génération..."])

            // Call the generate API
            const response = await fetch(`/api/generate?theme=${selectedThemeId}&year=${year}`, {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                setLogs(prev => [...prev, "📂 Lecture des fichiers CSV sources..."])
                setLogs(prev => [...prev, "⚙️ Parsing format MOCA-O..."])
                setLogs(prev => [...prev, "📊 Extraction des données territoriales..."])
                setLogs(prev => [...prev, `📄 Fichier généré: ${result.filename}`])
                setLogs(prev => [...prev, "✅ TERMINÉ: Génération réussie !"])
                setGeneratedFile(result.filename)
                setIsProcessing(false)
                nextStep()
            } else {
                throw new Error(result.error || 'Génération échouée')
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
            setLogs(prev => [...prev, `❌ ERREUR: ${errorMessage}`])
            setLogs(prev => [...prev, "💡 Vérifiez que le serveur file_server.js est lancé"])
            setIsProcessing(false)
        }
    }

    // Download file using fetch and blob
    const downloadFile = async () => {
        if (!generatedFile) return

        try {
            // Fetch from the file server via Vite proxy
            const response = await fetch(`/api/download/${generatedFile}`)

            if (!response.ok) {
                throw new Error('File not found on server')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = generatedFile
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            // Fallback: copy path to clipboard
            const filePath = `C:\\Users\\chad9\\Documents\\003.ORSG\\Livraison_Client\\Version_FullStack\\Backend\\output\\${generatedFile}`
            await navigator.clipboard.writeText(filePath)
            alert(`⚠️ Le serveur de fichiers n'est pas lancé.\n\nLancez-le avec:\ncd Version_FullStack\\Backend\nnode file_server.js\n\nEn attendant, le chemin a été copié:\n${filePath}`)
        }
    }

    const resetWizard = () => {
        setCurrentStep(1)
        setLogs([])
        setGeneratedFile(null)
    }

    return (
        <div className="max-w-6xl mx-auto py-4 px-4 pb-24">

            {/* Header */}
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-orsg-darkBlue mb-2">Génération PRISME</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Générez automatiquement les fichiers Excel pour PRISME à partir des données MOCA-O.
                </p>
            </div>

            {/* Steps Indicator */}
            <div className="flex justify-between max-w-2xl mx-auto mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10" />
                <div className="absolute top-1/2 left-0 h-1 bg-orsg-green -z-10 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />

                {STEPS.map((step) => (
                    <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300",
                            currentStep > step.id ? "bg-orsg-green text-white" :
                                currentStep === step.id ? "bg-orsg-blue text-white" : "bg-white text-gray-400 border border-gray-200"
                        )}>
                            {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                        </div>
                        <span className={cn("text-xs font-semibold uppercase tracking-wide", currentStep >= step.id ? "text-orsg-darkBlue" : "text-gray-400")}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="space-y-8">

                {/* Step 1: Perimeter Selection */}
                {currentStep === 1 && (
                    <div className="step-card p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid lg:grid-cols-3 gap-8">

                            {/* Theme Selection */}
                            <div className="lg:col-span-2 space-y-4">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    1. Choisissez une thématique
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {BDI_THEMES.map((t) => {
                                        const isAvailable = t.id === 'educ'
                                        return (
                                            <div
                                                key={t.id}
                                                onClick={() => isAvailable && setSelectedThemeId(t.id)}
                                                className={cn(
                                                    "p-4 rounded-lg border-2 transition-all relative overflow-hidden group",
                                                    !isAvailable && "opacity-50 cursor-not-allowed",
                                                    isAvailable && "cursor-pointer hover:shadow-md",
                                                    selectedThemeId === t.id ? "border-orsg-blue bg-blue-50/50" : "border-gray-100 bg-white hover:border-gray-200"
                                                )}
                                            >
                                                <div className="flex items-start gap-3 relative z-10">
                                                    <div className={cn("p-2 rounded-lg bg-white shadow-sm", selectedThemeId === t.id ? "text-orsg-blue" : "text-gray-400 group-hover:text-gray-600")}>
                                                        <t.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className={cn("font-bold text-base leading-tight mb-1", selectedThemeId === t.id ? "text-orsg-darkBlue" : "text-gray-700")}>
                                                            {t.title}
                                                            {!isAvailable && <span className="ml-2 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Bientôt</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-500 line-clamp-2">{t.description}</div>
                                                    </div>
                                                </div>
                                                {selectedThemeId === t.id && (
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orsg-blue/10 to-transparent rounded-bl-full -mr-8 -mt-8" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Year Selection */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                                        2. Année de Référence
                                    </label>

                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-orsg-blue w-6 h-6" />
                                        <input
                                            type="number"
                                            min="2015"
                                            max="2022"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            className="w-full text-4xl font-bold p-4 pl-12 rounded-lg border border-gray-300 focus:ring-4 focus:ring-orsg-blue/20 focus:border-orsg-blue outline-none text-orsg-darkBlue placeholder-gray-300 transition-all"
                                            placeholder="ex: 2022"
                                        />
                                    </div>

                                    <div className="mt-6 space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Années disponibles :</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].map(y => (
                                                <button
                                                    key={y}
                                                    onClick={() => setYear(y)}
                                                    className={cn(
                                                        "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                                        year === y ? "bg-orsg-blue text-white border-orsg-blue" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                                    )}
                                                >
                                                    {y}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-bold block mb-1">Résumé de la sélection :</span>
                                            Génération du rapport <span className="text-orsg-blue font-bold">{selectedTheme?.shortTitle}</span> pour l'année <span className="text-orsg-blue font-bold">{year}</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Processing & Log */}
                {currentStep === 2 && (
                    <div className="step-card p-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orsg-blue shadow-sm flex-shrink-0">
                                {selectedTheme && <selectedTheme.icon className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-orsg-darkBlue">Génération : {selectedTheme?.title} - {year}</h3>
                                <p className="text-sm text-gray-600">Les fichiers CSV sources sont pré-chargés sur le serveur.</p>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm h-[350px] overflow-y-auto shadow-inner border border-gray-800">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                                    <Play className="w-12 h-12 opacity-30" />
                                    <div className="text-center">
                                        <p>Prêt à générer</p>
                                        <p className="text-xs text-gray-600 mt-1">Cliquez sur "Lancer le traitement" pour démarrer</p>
                                    </div>
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={cn(
                                        "mb-2 py-1 border-l-2 pl-3",
                                        log.includes("❌") ? "border-red-500 bg-red-500/10 text-red-200" :
                                            log.includes("✅") ? "border-green-500 bg-green-500/10 text-green-200 font-bold" :
                                                log.includes("✔") ? "border-green-400 text-green-300" :
                                                    log.includes("⚙️") || log.includes("📊") ? "border-blue-400 text-blue-200" :
                                                        "border-transparent text-gray-300"
                                    )}>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Result */}
                {currentStep === 3 && (
                    <div className="step-card p-8 animate-in slide-in-from-bottom-4 duration-500 bg-gradient-to-br from-white to-green-50 border-orsg-green/20">
                        <div className="text-center py-8">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
                                <FileSpreadsheet className="w-12 h-12 text-orsg-green" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Génération Réussie !</h2>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Le fichier <span className="font-bold text-gray-900">{generatedFile}</span> a été généré avec succès.
                            </p>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-sm mx-auto mb-6">
                                <p className="text-sm text-gray-500 mb-2">Emplacement du fichier :</p>
                                <code className="text-xs bg-gray-100 p-2 rounded block text-left break-all">
                                    Version_FullStack/Backend/output/{generatedFile}
                                </code>
                            </div>

                            <button
                                onClick={downloadFile}
                                className="bg-orsg-green hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
                            >
                                <Download className="w-6 h-6" />
                                <span>Télécharger le fichier Excel</span>
                            </button>

                            <button onClick={resetWizard} className="mt-8 text-sm text-gray-500 hover:text-orsg-blue underline">
                                Lancer une nouvelle génération
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Sticky Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-64 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40 transition-all">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1 || isProcessing}
                        className="px-6 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        Retour
                    </button>

                    <div className="text-sm font-medium text-gray-400">
                        Étape {currentStep} sur 3
                    </div>

                    {currentStep === 1 && (
                        <button
                            onClick={nextStep}
                            className="px-8 py-2.5 bg-orsg-blue text-white rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
                        >
                            Suivant
                        </button>
                    )}

                    {currentStep === 2 && !isProcessing && logs.length === 0 && (
                        <button
                            onClick={startGeneration}
                            className="px-8 py-2.5 bg-orsg-green text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transform"
                        >
                            <Play className="w-4 h-4" /> Lancer le traitement
                        </button>
                    )}

                    {currentStep === 2 && isProcessing && (
                        <button disabled className="px-8 py-2.5 bg-gray-400 text-white rounded-lg font-bold flex items-center gap-2 cursor-not-allowed">
                            <Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...
                        </button>
                    )}

                    {currentStep === 3 && (
                        <button
                            onClick={resetWizard}
                            className="px-8 py-2.5 bg-orsg-blue text-white rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-md"
                        >
                            Nouvelle génération
                        </button>
                    )}
                </div>
            </div>

        </div>
    )
}
