import { useState } from "react"
import { CheckCircle2, FileSpreadsheet, Download, Play, Calendar, Loader2, ChevronRight, FolderOpen, Upload, Database } from "lucide-react"
import { cn } from "@/lib/utils"
// Import BDI Themes (fallback) et API hooks
import { BDI_THEMES, getSubThemes } from "@/data/bdi_themes"
import { useDatasetYears } from "@/hooks/useThemes"
import * as api from "@/services/api"
import { UploadCSV } from "@/components/UploadCSV"

const STEPS = [
    { id: 1, label: "Thematique", description: "Choix du theme" },
    { id: 2, label: "Sous-theme", description: "Selection detaillee" },
    { id: 3, label: "Parametres", description: "Annee et format" },
    { id: 4, label: "Generation", description: "Traitement" },
    { id: 5, label: "Resultat", description: "Telechargement" },
]

const LEVELS = [
    { id: 'Commune', label: 'Communes (973)' },
    { id: 'Region', label: 'Regions (18)' },
    { id: 'DOM', label: 'Departements d\'Outre-Mer' },
    { id: 'France_Hexagonale', label: 'France Hexagonale' },
    { id: 'France_Entiere', label: 'France Entiere' }
]

export function GeneratorPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)

    // State
    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)
    const [selectedSubThemeId, setSelectedSubThemeId] = useState<string | null>(null)
    const [selectedSubSubThemeId, setSelectedSubSubThemeId] = useState<string | null>(null)
    const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null)
    const [year, setYear] = useState("2022")
    const [outputFormat, setOutputFormat] = useState<'zip' | 'consolidated' | 'selective'>('zip')
    const [selectedLevel, setSelectedLevel] = useState('Commune')
    const [logs, setLogs] = useState<string[]>([])
    const [generatedFile, setGeneratedFile] = useState<string | null>(null)

    const selectedTheme = BDI_THEMES.find(t => t.id === selectedThemeId)
    const subThemes = selectedThemeId ? getSubThemes(selectedThemeId) : []
    const selectedSubTheme = subThemes.find(st => st.id === selectedSubThemeId)
    // Check if selected subTheme has nested subThemes (3rd level)
    const hasNestedSubThemes = selectedSubTheme && 'subThemes' in selectedSubTheme && Array.isArray((selectedSubTheme as any).subThemes)
    const nestedSubThemes = hasNestedSubThemes ? (selectedSubTheme as any).subThemes : []
    const selectedNestedSubTheme = nestedSubThemes.find((st: any) => st.id === selectedSubSubThemeId)

    // Determine the leaf node (deepest selected level)
    const leafNode = selectedNestedSubTheme || (!hasNestedSubThemes ? selectedSubTheme : null)
    const leafDatasets = leafNode?.datasets || []
    const hasMultipleDatasets = leafDatasets.length > 1

    // Determine the dataset ID to use for generation
    const getDatasetId = (): string | null => {
        // If user explicitly selected a dataset, use it
        if (selectedDatasetId) return selectedDatasetId;
        // If leaf has exactly one dataset, use it
        if (leafDatasets.length === 1) return leafDatasets[0].id;
        return null;
    };
    const currentDatasetId = getDatasetId();

    // Load available years dynamically from API
    const { years: apiYears, loading: yearsLoading } = useDatasetYears(currentDatasetId);

    // Fallback to static years if API not available
    const defaultYears = ['2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015']
    const availableYears: string[] = apiYears.length > 0
        ? apiYears.map(y => String(y))
        : defaultYears

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const handleThemeSelect = (themeId: string) => {
        setSelectedThemeId(themeId)
        setSelectedSubThemeId(null)
        setSelectedSubSubThemeId(null)
        setSelectedDatasetId(null)
        nextStep()
    }

    const handleSubThemeSelect = (subThemeId: string) => {
        setSelectedSubThemeId(subThemeId)
        setSelectedSubSubThemeId(null)
        setSelectedDatasetId(null)
        nextStep()
    }

    const handleSubSubThemeSelect = (subSubThemeId: string) => {
        setSelectedSubSubThemeId(subSubThemeId)
        setSelectedDatasetId(null)
        // Find datasets for this sub-sub-theme
        const nestedST = nestedSubThemes.find((st: any) => st.id === subSubThemeId)
        // If only 1 dataset, auto-select it
        if (nestedST?.datasets?.length === 1) {
            setSelectedDatasetId(nestedST.datasets[0].id)
        }
    }

    const handleDatasetSelect = (datasetId: string) => {
        setSelectedDatasetId(datasetId)
    }

    // Count datasets in a subTheme (including nested)
    const countDatasets = (st: any): number => {
        let count = st.datasets?.length || 0
        if (st.subThemes) {
            for (const nested of st.subThemes) {
                count += countDatasets(nested)
            }
        }
        return count
    }

    // Start generation - DIRECT API MODE with dynamic dataset ID
    const startGeneration = async () => {
        setIsProcessing(true)
        setLogs(["Initialisation de la demande..."])
        setGeneratedFile(null)

        try {
            setLogs(prev => [...prev, "Envoi de la demande au moteur Python..."])

            let datasetToGenerate = currentDatasetId;

            if (!datasetToGenerate) {
                setLogs(prev => [...prev, "Erreur : aucun dataset selectionne"])
                setIsProcessing(false)
                return;
            }

            const queryYear = parseInt(year, 10);

            setLogs(prev => [...prev, `Dataset : ${datasetToGenerate}, Annee : ${queryYear}`])

            const result = await api.generateExcel(datasetToGenerate!, queryYear);

            if (result.success && result.filename) {
                setLogs(prev => [...prev, "Traitement termine avec succes !"])
                setLogs(prev => [...prev, `Fichier genere : ${result.filename}`])
                setGeneratedFile(result.filename)
                setIsProcessing(false)
                nextStep()
            } else {
                throw new Error(result.error || "Erreur lors de la generation")
            }

        } catch (error: any) {
            console.error("Generation error", error)
            setLogs(prev => [...prev, "Erreur : " + error.message])
            setIsProcessing(false)
        }
    }

    // Download file
    const downloadFile = () => {
        if (!generatedFile) {
            alert("Aucun fichier a telecharger.")
            return
        }
        window.open(`/api/download/${generatedFile}`, '_blank')
    }

    const resetWizard = () => {
        setCurrentStep(1)
        setSelectedThemeId(null)
        setSelectedSubThemeId(null)
        setSelectedSubSubThemeId(null)
        setSelectedDatasetId(null)
        setLogs([])
        setGeneratedFile(null)
    }

    // Check if we should show the parameters panel (dataset is resolved)
    const canShowParams = currentDatasetId !== null

    return (
        <div className="max-w-6xl mx-auto py-4 px-4 pb-24">

            {/* Header */}
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-[#1a4b8c] mb-2">Génération Géoclip</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Générez automatiquement les fichiers Excel pour Géoclip à partir des données MOCA-O.
                </p>
            </div>

            {/* Steps Indicator */}
            <div className="flex justify-between max-w-3xl mx-auto mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10" />
                <div className="absolute top-1/2 left-0 h-1 bg-[#4caf50] -z-10 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />

                {STEPS.map((step) => (
                    <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-1">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors duration-300",
                            currentStep > step.id ? "bg-[#4caf50] text-white" :
                                currentStep === step.id ? "bg-[#3bb3a9] text-white" : "bg-white text-gray-400 border border-gray-200"
                        )}>
                            {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                        </div>
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wide text-center", currentStep >= step.id ? "text-[#1a4b8c]" : "text-gray-400")}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="space-y-8">

                {/* Step 1: Theme Selection */}
                {currentStep === 1 && (
                    <div className="step-card p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#1a4b8c] mb-2">1. Choisissez une thematique BDI</h3>
                            <p className="text-gray-500 text-sm">Selectionnez la thematique principale pour la generation des fichiers.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {BDI_THEMES.map((theme) => (
                                <div
                                    key={theme.id}
                                    onClick={() => handleThemeSelect(theme.id)}
                                    className={cn(
                                        "p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg group",
                                        "border-gray-100 bg-white hover:border-[#3bb3a9]"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all",
                                            `bg-gray-100 ${theme.color} group-hover:bg-[#3bb3a9] group-hover:text-white`
                                        )}>
                                            <theme.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 group-hover:text-[#1a4b8c]">
                                                {theme.shortTitle}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {theme.description}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-[#3bb3a9]">
                                                <FolderOpen className="w-3 h-3" />
                                                <span>{theme.subThemes?.length || 0} sous-themes</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#3bb3a9]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Sub-theme Selection */}
                {currentStep === 2 && selectedTheme && (
                    <div className="step-card p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <span className="text-[#3bb3a9]">{selectedTheme.shortTitle}</span>
                                <ChevronRight className="w-4 h-4" />
                                <span>Sous-theme</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#1a4b8c] mb-2">2. Choisissez un sous-theme</h3>
                            <p className="text-gray-500 text-sm">Selectionnez le sous-theme specifique a generer.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {subThemes.map((subTheme) => (
                                <div
                                    key={subTheme.id}
                                    onClick={() => handleSubThemeSelect(subTheme.id)}
                                    className={cn(
                                        "p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg group",
                                        "border-gray-100 bg-white hover:border-[#3bb3a9]"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-800 group-hover:text-[#1a4b8c]">
                                                {subTheme.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {countDatasets(subTheme)} indicateur{countDatasets(subTheme) > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#3bb3a9]" />
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {subTheme.datasets.slice(0, 3).map(ds => (
                                            <span key={ds.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {ds.label.length > 30 ? ds.label.substring(0, 30) + '...' : ds.label}
                                            </span>
                                        ))}
                                        {('subThemes' in subTheme) && (
                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                                {(subTheme as any).subThemes.length} categories
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Sub-Sub-Theme Selection (when nested) */}
                {currentStep === 3 && hasNestedSubThemes && !selectedSubSubThemeId && (
                    <div className="step-card p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <span className="text-[#3bb3a9]">{selectedTheme?.shortTitle}</span>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-[#3bb3a9]">{selectedSubTheme?.title}</span>
                                <ChevronRight className="w-4 h-4" />
                                <span>Categorie</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#1a4b8c] mb-2">3. Choisissez une categorie</h3>
                            <p className="text-gray-500 text-sm">Selectionnez la categorie specifique a generer.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {nestedSubThemes.map((nestedST: any) => (
                                <div
                                    key={nestedST.id}
                                    onClick={() => handleSubSubThemeSelect(nestedST.id)}
                                    className={cn(
                                        "p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg group",
                                        "border-gray-100 bg-white hover:border-[#3bb3a9]"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-800 group-hover:text-[#1a4b8c]">
                                                {nestedST.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {nestedST.datasets?.length || 0} indicateur{(nestedST.datasets?.length || 0) > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#3bb3a9]" />
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {nestedST.datasets?.map((ds: any) => (
                                            <span key={ds.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {ds.label.length > 30 ? ds.label.substring(0, 30) + '...' : ds.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Dataset selection when multiple datasets at leaf level */}
                {currentStep === 3 && ((!hasNestedSubThemes && leafNode) || selectedSubSubThemeId) && hasMultipleDatasets && !selectedDatasetId && (
                    <div className="step-card p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <span className="text-[#3bb3a9]">{selectedTheme?.shortTitle}</span>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-[#3bb3a9]">{selectedSubTheme?.title}</span>
                                {selectedNestedSubTheme && (
                                    <>
                                        <ChevronRight className="w-4 h-4" />
                                        <span className="text-[#3bb3a9]">{selectedNestedSubTheme.title}</span>
                                    </>
                                )}
                                <ChevronRight className="w-4 h-4" />
                                <span>Indicateur</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#1a4b8c] mb-2">Choisissez un indicateur</h3>
                            <p className="text-gray-500 text-sm">Plusieurs fichiers sont disponibles dans cette categorie. Selectionnez celui a generer.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {leafDatasets.map((ds: any) => (
                                <div
                                    key={ds.id}
                                    onClick={() => handleDatasetSelect(ds.id)}
                                    className={cn(
                                        "p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg group",
                                        "border-gray-100 bg-white hover:border-[#3bb3a9]"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-[#3bb3a9] group-hover:text-white transition-colors">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 group-hover:text-[#1a4b8c]">
                                                {ds.label}
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Source : {ds.source}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#3bb3a9]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Parameters (Year & Format) - when dataset is resolved */}
                {currentStep === 3 && canShowParams && (
                    <div className="step-card p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <span className="text-[#3bb3a9]">{selectedTheme?.shortTitle}</span>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-[#3bb3a9]">{selectedSubTheme?.title || 'Tous'}</span>
                                {selectedNestedSubTheme && (
                                    <>
                                        <ChevronRight className="w-4 h-4" />
                                        <span className="text-[#3bb3a9]">{selectedNestedSubTheme.title}</span>
                                    </>
                                )}
                                {selectedDatasetId && hasMultipleDatasets && (
                                    <>
                                        <ChevronRight className="w-4 h-4" />
                                        <span className="text-[#3bb3a9]">{leafDatasets.find((d: any) => d.id === selectedDatasetId)?.label}</span>
                                    </>
                                )}
                                <ChevronRight className="w-4 h-4" />
                                <span>Parametres</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#1a4b8c] mb-2">Parametres de generation</h3>
                            <p className="text-gray-500 text-sm">Definissez l'annee et le format de sortie.</p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Year Selection */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                                    Annee de Reference
                                </label>

                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3bb3a9] w-6 h-6" />
                                    <input
                                        type="number"
                                        min="2015"
                                        max="2022"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="w-full text-4xl font-bold p-4 pl-12 rounded-lg border border-gray-300 focus:ring-4 focus:ring-[#3bb3a9]/20 focus:border-[#3bb3a9] outline-none text-[#1a4b8c] placeholder-gray-300 transition-all"
                                        placeholder="ex: 2022"
                                    />
                                </div>

                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Annees disponibles :
                                        {yearsLoading && <Loader2 className="inline w-3 h-3 ml-2 animate-spin" />}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {availableYears.length === 0 && !yearsLoading && (
                                            <span className="text-xs text-gray-400">Aucune donnee disponible</span>
                                        )}
                                        {availableYears.map(y => (
                                            <button
                                                key={y}
                                                onClick={() => setYear(y)}
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                                    year === y ? "bg-[#3bb3a9] text-white border-[#3bb3a9]" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                                )}
                                            >
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Format Selection */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                                    Format de Sortie
                                </label>

                                <div className="space-y-3">
                                    <div
                                        onClick={() => setOutputFormat('zip')}
                                        className={cn(
                                            "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                            outputFormat === 'zip' ? "border-[#3bb3a9] bg-[#3bb3a9]/10" : "border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="font-bold text-[#1a4b8c] mb-1">Pack Complet (.zip)</div>
                                        <div className="text-xs text-gray-500">Archive contenant tous les fichiers par niveau geographique</div>
                                    </div>

                                    <div
                                        onClick={() => setOutputFormat('consolidated')}
                                        className={cn(
                                            "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                            outputFormat === 'consolidated' ? "border-[#3bb3a9] bg-[#3bb3a9]/10" : "border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="font-bold text-[#1a4b8c] mb-1">Fichier Consolide</div>
                                        <div className="text-xs text-gray-500">Fichier unique avec tous les niveaux (Type A)</div>
                                    </div>

                                    <div
                                        onClick={() => setOutputFormat('selective')}
                                        className={cn(
                                            "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                            outputFormat === 'selective' ? "border-[#3bb3a9] bg-[#3bb3a9]/10" : "border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="font-bold text-[#1a4b8c] mb-1">Par Niveau Geographique</div>
                                        <div className="text-xs text-gray-500">Selection specifique (Type B)</div>
                                    </div>
                                </div>

                                {outputFormat === 'selective' && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Niveau Geographique :</label>
                                        <div className="flex flex-wrap gap-2">
                                            {LEVELS.map(lvl => (
                                                <button
                                                    key={lvl.id}
                                                    onClick={() => setSelectedLevel(lvl.id)}
                                                    className={cn(
                                                        "px-3 py-1.5 text-sm rounded-md border transition-all",
                                                        selectedLevel === lvl.id ? "bg-[#3bb3a9] text-white border-[#3bb3a9] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                    )}
                                                >
                                                    {lvl.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload CSV Section */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <Upload className="w-5 h-5 text-[#3bb3a9]" />
                                <h4 className="font-bold text-gray-700">Ajouter des sources CSV</h4>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                                Uploadez vos fichiers CSV pour ajouter de nouvelles donnees ou annees.
                            </p>
                            <UploadCSV onUploadComplete={() => {
                                window.location.reload();
                            }} />
                        </div>

                        {/* Summary */}
                        <div className="mt-6 p-4 bg-[#1a4b8c]/5 rounded-lg border border-[#1a4b8c]/10">
                            <p className="text-sm text-gray-700">
                                <span className="font-bold">Resume :</span> Generation de{' '}
                                <span className="text-[#3bb3a9] font-bold">
                                    {selectedDatasetId
                                        ? leafDatasets.find((d: any) => d.id === selectedDatasetId)?.label
                                        : selectedNestedSubTheme?.title || selectedSubTheme?.title || selectedTheme?.shortTitle}
                                </span>{' '}
                                pour l'annee <span className="text-[#3bb3a9] font-bold">{year}</span>{' '}
                                au format <span className="text-[#3bb3a9] font-bold">
                                    {outputFormat === 'zip' ? 'Pack Complet' : outputFormat === 'consolidated' ? 'Consolide' : `Par niveau (${selectedLevel})`}
                                </span>.
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 4: Processing & Log */}
                {currentStep === 4 && (
                    <div className="step-card p-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#3bb3a9]/10 border border-[#3bb3a9]/20 rounded-lg p-4 mb-6 flex gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#3bb3a9] shadow-sm flex-shrink-0">
                                {selectedTheme && <selectedTheme.icon className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-[#1a4b8c]">
                                    Generation : {selectedDatasetId
                                        ? leafDatasets.find((d: any) => d.id === selectedDatasetId)?.label
                                        : selectedSubTheme?.title || selectedTheme?.title} - {year}
                                </h3>
                                <p className="text-sm text-gray-600">Les fichiers CSV sources sont pre-charges sur le serveur.</p>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm h-[350px] overflow-y-auto shadow-inner border border-gray-800">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                                    <Play className="w-12 h-12 opacity-30" />
                                    <div className="text-center">
                                        <p>Pret a generer</p>
                                        <p className="text-xs text-gray-600 mt-1">Cliquez sur "Lancer le traitement" pour demarrer</p>
                                    </div>
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={cn(
                                        "mb-2 py-1 border-l-2 pl-3",
                                        log.includes("Erreur") ? "border-red-500 bg-red-500/10 text-red-200" :
                                            log.includes("succes") ? "border-green-500 bg-green-500/10 text-green-200 font-bold" :
                                                log.includes("Dataset") ? "border-blue-400 text-blue-200" :
                                                    "border-transparent text-gray-300"
                                    )}>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Step 5: Result */}
                {currentStep === 5 && (
                    <div className="step-card p-8 animate-in slide-in-from-bottom-4 duration-500 bg-gradient-to-br from-white to-green-50 border-[#4caf50]/20">
                        <div className="text-center py-8">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
                                <FileSpreadsheet className="w-12 h-12 text-[#4caf50]" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Generation Reussie !</h2>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Le fichier <span className="font-bold text-gray-900">{generatedFile}</span> a ete genere avec succes.
                            </p>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-sm mx-auto mb-6">
                                <p className="text-sm text-gray-500 mb-2">Fichier pret au telechargement :</p>
                                <code className="text-xs bg-gray-100 p-2 rounded block text-left break-all">
                                    {generatedFile}
                                </code>
                            </div>

                            <button
                                onClick={downloadFile}
                                className="bg-[#4caf50] hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
                            >
                                <Download className="w-6 h-6" />
                                <span>
                                    {outputFormat === 'zip' ? "Telecharger le dossier ZIP" :
                                        outputFormat === 'consolidated' ? "Telecharger le Fichier Consolide" :
                                            "Telecharger le Fichier"}
                                </span>
                            </button>

                            <button onClick={resetWizard} className="mt-8 text-sm text-gray-500 hover:text-[#3bb3a9] underline">
                                Lancer une nouvelle generation
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Sticky Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-64 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40 transition-all">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => {
                            // Smart back navigation
                            if (currentStep === 3) {
                                // If we have a selected dataset and multiple were available, go back to dataset picker
                                if (selectedDatasetId && hasMultipleDatasets) {
                                    setSelectedDatasetId(null)
                                    return
                                }
                                // If we have a sub-sub-theme selected, go back to sub-sub picker
                                if (selectedSubSubThemeId && hasNestedSubThemes) {
                                    setSelectedSubSubThemeId(null)
                                    setSelectedDatasetId(null)
                                    return
                                }
                            }
                            prevStep()
                        }}
                        disabled={currentStep === 1 || isProcessing}
                        className="px-6 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        Retour
                    </button>

                    <div className="text-sm font-medium text-gray-400">
                        Etape {currentStep} sur 5
                    </div>

                    {currentStep === 3 && canShowParams && (
                        <button
                            onClick={nextStep}
                            className="px-8 py-2.5 bg-[#3bb3a9] text-white rounded-lg font-bold hover:bg-[#2f9a91] transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
                        >
                            Suivant
                        </button>
                    )}

                    {currentStep === 4 && !isProcessing && logs.length === 0 && (
                        <button
                            onClick={startGeneration}
                            className="px-8 py-2.5 bg-[#4caf50] text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transform"
                        >
                            <Play className="w-4 h-4" /> Lancer le traitement
                        </button>
                    )}

                    {currentStep === 4 && isProcessing && (
                        <button disabled className="px-8 py-2.5 bg-gray-400 text-white rounded-lg font-bold flex items-center gap-2 cursor-not-allowed">
                            <Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...
                        </button>
                    )}

                    {currentStep === 5 && (
                        <button
                            onClick={resetWizard}
                            className="px-8 py-2.5 bg-[#3bb3a9] text-white rounded-lg font-bold hover:bg-[#2f9a91] transition-colors shadow-md"
                        >
                            Nouvelle generation
                        </button>
                    )}
                </div>
            </div>

        </div>
    )
}
