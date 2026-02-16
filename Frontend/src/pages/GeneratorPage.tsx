import { useState } from "react"
import { CheckCircle2, FileSpreadsheet, Download, Play, Calendar, Loader2, ChevronRight, FolderOpen, Database, Info } from "lucide-react"
import { cn } from "@/lib/utils"
// Import BDI Themes (fallback) et API hooks
import { BDI_THEMES } from "@/data/bdi_themes"
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

// Thématiques supportées par Open Data (generate_from_opendata.py)
const OPEN_DATA_SUPPORTED_THEMES = [
    'educ',
    'pers_sup65ans_seules',
    'familles_mono',
    'pop_inf3ans',
    'pers_menages',
    'types_menages',
    'alloc',
    'revenu',
    'densite',
    'route',
    'mortalite_gen',
    'mortalite_cardio',
    'mortalite_tumeurs',
    'mortalite_respi',
    'mortalite_neuro',
    'mortalite_diabete',
    'mortalite_covid'
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
    const [isOpenDataMode, setIsOpenDataMode] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const [generatedFile, setGeneratedFile] = useState<string | null>(null)

    // Helper to check if a dataset is supported in current mode
    const isDatasetSupported = (datasetId: string) => {
        if (!isOpenDataMode) return true;
        return OPEN_DATA_SUPPORTED_THEMES.includes(datasetId);
    };

    // Recursive helper to filter subthemes based on supported datasets
    const getFilteredStructure = (themeOrSubTheme: any): any => {
        // If it's a dataset leaf node (though usually we deal with subthemes here)
        if (themeOrSubTheme.datasets && !themeOrSubTheme.subThemes) {
            const validDatasets = themeOrSubTheme.datasets.filter((d: any) => isDatasetSupported(d.id));
            if (validDatasets.length === 0) return null;
            return { ...themeOrSubTheme, datasets: validDatasets };
        }

        // If it has subThemes (nested)
        if (themeOrSubTheme.subThemes) {
            const validSubThemes = themeOrSubTheme.subThemes
                .map((st: any) => getFilteredStructure(st))
                .filter((st: any) => st !== null);

            let validDatasets = themeOrSubTheme.datasets
                ? themeOrSubTheme.datasets.filter((d: any) => isDatasetSupported(d.id))
                : [];

            // A node is valid if it has valid subthemes OR valid datasets
            if (validSubThemes.length === 0 && validDatasets.length === 0) return null;

            return {
                ...themeOrSubTheme,
                subThemes: validSubThemes,
                datasets: validDatasets
            };
        }

        return null;
    };

    // Filter themes based on Open Data Mode
    const filteredThemes = isOpenDataMode
        ? BDI_THEMES.map(theme => getFilteredStructure(theme)).filter(t => t !== null)
        : BDI_THEMES;

    // Get filtered subthemes for the current selected theme
    const currentThemeNode = filteredThemes.find(t => t.id === selectedThemeId);
    const filteredSubThemes = currentThemeNode ? (currentThemeNode.subThemes || []) : [];

    // Get filtered nested subthemes
    const currentSubThemeNode = filteredSubThemes.find((st: any) => st.id === selectedSubThemeId);
    const filteredNestedSubThemes = currentSubThemeNode ? (currentSubThemeNode.subThemes || []) : [];

    // --- Derived State (Must be after filtering logic) ---
    const selectedTheme = filteredThemes.find(t => t.id === selectedThemeId)
    // subThemes are now derived from filteredThemes in the main body variables
    const selectedSubTheme = filteredSubThemes.find((st: any) => st.id === selectedSubThemeId)
    // Check if selected subTheme has nested subThemes (3rd level)
    const hasNestedSubThemes = selectedSubTheme && 'subThemes' in selectedSubTheme && Array.isArray((selectedSubTheme as any).subThemes)
    const nestedSubThemes = hasNestedSubThemes ? (selectedSubTheme as any).subThemes : []
    const selectedNestedSubTheme = filteredNestedSubThemes.find((st: any) => st.id === selectedSubSubThemeId)

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

    // Check if current dataset is supported by Open Data
    const isOpenDataSupported = currentDatasetId ? OPEN_DATA_SUPPORTED_THEMES.includes(currentDatasetId) : false;

    // Load available years dynamically from API or Config (mode-aware)
    const { years: apiYears, loading: yearsLoading } = useDatasetYears(currentDatasetId, isOpenDataMode && isOpenDataSupported);

    // Check for static availableYears in config
    const selectedDatasetConfig = leafDatasets.find((d: any) => d.id === currentDatasetId);
    const staticAvailableYears = selectedDatasetConfig?.availableYears?.map(String);

    // Fallback to static years if API not available
    const defaultYears = ['2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015']
    const availableYears: string[] = staticAvailableYears || (apiYears.length > 0
        ? apiYears.map(y => String(y))
        : defaultYears)

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

    // Count demo-ready datasets in a subTheme (including nested)
    const countDemoReady = (st: any): number => {
        let count = st.datasets?.filter((d: any) => d.demoReady)?.length || 0
        if (st.subThemes) {
            for (const nested of st.subThemes) {
                count += countDemoReady(nested)
            }
        }
        return count
    }

    // Count demo-ready datasets in an entire theme
    const countThemeDemoReady = (theme: any): number => {
        let count = theme.datasets?.filter((d: any) => d.demoReady)?.length || 0
        if (theme.subThemes) {
            for (const st of theme.subThemes) {
                count += countDemoReady(st)
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
            setLogs(prev => [...prev, `Mode : ${isOpenDataMode ? 'Open Data' : 'Standard'}`])

            const result = isOpenDataMode
                ? await api.generateOpenData(datasetToGenerate!, queryYear)
                : await api.generateExcel(datasetToGenerate!, queryYear);

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
        <div className="max-w-[1600px] mx-auto py-8 px-4 pb-32">

            {/* Header Area */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-[#1a4b8c] mb-4 tracking-tight">
                    Assistant de Génération
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Créez vos fichiers de données en quelques clics.
                    <br />Simple, rapide et guidé étape par étape.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative pb-20">
                {/* Left Column: Wizard Steps */}
                <div className="lg:col-span-8 flex flex-col gap-10">

                    {/* Enhanced Steps Indicator */}
                    <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10" />
                        <div className="flex justify-between relative z-10 px-4">
                            {STEPS.map((step) => {
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;
                                return (
                                    <div
                                        key={step.id}
                                        onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-3 transition-all duration-300",
                                            step.id < currentStep ? "cursor-pointer" : "cursor-default"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-500 border-2",
                                            isActive ? "bg-[#1a4b8c] text-white border-[#1a4b8c] scale-110" :
                                                isCompleted ? "bg-[#4caf50] text-white border-[#4caf50]" :
                                                    "bg-white text-gray-300 border-gray-200"
                                        )}>
                                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                                        </div>
                                        <div className="hidden md:block text-center">
                                            <span className={cn(
                                                "block text-xs font-bold uppercase tracking-wider mb-0.5",
                                                isActive ? "text-[#1a4b8c]" : isCompleted ? "text-[#4caf50]" : "text-gray-400"
                                            )}>
                                                {step.label}
                                            </span>
                                            {isActive && (
                                                <span className="block text-[10px] text-gray-500 font-medium">
                                                    {step.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Global Mode Toggle */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                isOpenDataMode ? "bg-blue-600 text-white" : "bg-white text-gray-400 border border-gray-200"
                            )}>
                                <Database className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Mode Open Data (INSEE)</h4>
                                <p className="text-xs text-gray-500 max-w-md">
                                    Activez ce mode pour accéder uniquement aux données publiques de l'INSEE.
                                    Cela restreint les thématiques disponibles.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={cn("text-sm font-bold transition-colors", isOpenDataMode ? "text-blue-700" : "text-gray-400")}>
                                {isOpenDataMode ? "ACTIVÉ" : "DÉSACTIVÉ"}
                            </span>
                            <button
                                onClick={() => {
                                    setIsOpenDataMode(!isOpenDataMode);
                                    resetWizard(); // Reset wizard when mode changes to avoid inconsistencies
                                }}
                                className={cn(
                                    "w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                                    isOpenDataMode ? 'bg-blue-600' : 'bg-gray-300'
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out",
                                        isOpenDataMode ? 'translate-x-6' : 'translate-x-0'
                                    )}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8 min-h-[400px]">

                        {/* Step 1: Theme Selection - Reimagined */}
                        {currentStep === 1 && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-8 text-center md:text-left">
                                    <h3 className="text-2xl font-bold text-[#1a4b8c] mb-2 flex items-center gap-3">
                                        <span className="bg-[#1a4b8c] text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg">1</span>
                                        Explorez par Thématique
                                    </h3>
                                    <p className="text-gray-500 text-lg">Commencez par choisir le grand domaine d'étude qui vous intéresse.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {filteredThemes.map((theme) => {
                                        const isReady = countThemeDemoReady(theme) > 0;
                                        return (
                                            <div
                                                key={theme.id}
                                                onClick={() => isReady && handleThemeSelect(theme.id)}
                                                className={cn(
                                                    "group relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                                                    isReady
                                                        ? "cursor-pointer border-gray-100 bg-white hover:border-[#3bb3a9] hover:shadow-xl hover:-translate-y-1"
                                                        : "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60 grayscale"
                                                )}
                                            >
                                                {/* Background Decoration */}
                                                <div className={cn(
                                                    "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-bl-full transition-transform group-hover:scale-150 duration-700",
                                                    theme.color.replace('text-', 'from-').replace('bg-', 'to-') || "from-gray-200 to-gray-100"
                                                )} />

                                                <div className="relative z-10 flex flex-col h-full">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className={cn(
                                                            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300",
                                                            isReady
                                                                ? `bg-gray-50 ${theme.color} group-hover:bg-[#3bb3a9] group-hover:text-white`
                                                                : "bg-gray-200 text-gray-400"
                                                        )}>
                                                            <theme.icon className="w-8 h-8" />
                                                        </div>
                                                        {isReady ? (
                                                            <div className="flex items-center gap-2 bg-[#e8f5e9] px-3 py-1 rounded-full border border-[#c8e6c9]">
                                                                <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                                                                <span className="text-xs font-bold text-[#2e7d32]">{countThemeDemoReady(theme)} Dispo</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs bg-gray-200 text-gray-500 px-3 py-1 rounded-full font-bold">
                                                                Bientôt
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#1a4b8c] transition-colors">
                                                        {theme.shortTitle}
                                                    </h4>
                                                    <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">
                                                        {theme.description}
                                                    </p>

                                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2 text-gray-500">
                                                            <FolderOpen className="w-4 h-4" />
                                                            <span>{theme.subThemes?.length || 0} sujets</span>
                                                        </div>
                                                        {isReady && (
                                                            <span className="font-bold text-[#3bb3a9] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                                Choisir <ChevronRight className="w-4 h-4" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Sub-theme Selection */}
                        {/* Step 2: Sub-theme Selection - Reimagined */}
                        {currentStep === 2 && selectedTheme && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
                                        <button
                                            onClick={() => setCurrentStep(1)}
                                            className="text-[#3bb3a9] hover:underline flex items-center gap-1"
                                        >
                                            <selectedTheme.icon className="w-4 h-4" />
                                            {selectedTheme.shortTitle}
                                        </button>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                        <span className="text-gray-800">Choix du sujet</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1a4b8c] mb-2 flex items-center gap-3">
                                        <span className="bg-[#1a4b8c] text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg">2</span>
                                        Précisez votre besoin
                                    </h3>
                                    <p className="text-gray-500 text-lg">Sélectionnez un sujet spécifique parmi les catégories disponibles.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {filteredSubThemes.map((subTheme: any) => {
                                        const isReady = countDemoReady(subTheme) > 0;
                                        return (
                                            <div
                                                key={subTheme.id}
                                                onClick={() => isReady && handleSubThemeSelect(subTheme.id)}
                                                className={cn(
                                                    "group p-6 rounded-2xl border-2 transition-all duration-300",
                                                    isReady
                                                        ? "cursor-pointer border-gray-100 bg-white hover:border-[#3bb3a9] hover:shadow-xl hover:-translate-y-1"
                                                        : "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60 grayscale"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-xl font-bold text-gray-800 group-hover:text-[#1a4b8c] transition-colors mb-2">
                                                            {subTheme.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                                            <Database className="w-4 h-4" />
                                                            {countDatasets(subTheme)} indicateur{countDatasets(subTheme) > 1 ? 's' : ''}
                                                            {('subThemes' in subTheme) && (
                                                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded ml-2">
                                                                    + {(subTheme as any).subThemes.length} sous-catégories
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    {isReady ? (
                                                        <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center group-hover:bg-[#4caf50] group-hover:text-white transition-colors text-[#2e7d32]">
                                                            <ChevronRight className="w-6 h-6" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full font-bold">
                                                            Indisponible
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Aperçu des indicateurs :</p>
                                                    {subTheme.datasets.slice(0, 3).map((ds: any) => (
                                                        <div key={ds.id} className="flex items-center gap-2 text-sm text-gray-600">
                                                            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", ds.demoReady ? "bg-[#4caf50]" : "bg-gray-300")} />
                                                            <span className="truncate">{ds.label}</span>
                                                        </div>
                                                    ))}
                                                    {subTheme.datasets.length > 3 && (
                                                        <p className="text-xs text-[#3bb3a9] font-medium pl-3.5">
                                                            + {subTheme.datasets.length - 3} autres...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Sub-Sub-Theme Selection (when nested) */}
                        {currentStep === 3 && hasNestedSubThemes && !selectedSubSubThemeId && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
                                        <button onClick={() => setCurrentStep(1)} className="text-[#3bb3a9] hover:underline">{selectedTheme?.shortTitle}</button>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                        <button onClick={() => setCurrentStep(2)} className="text-[#3bb3a9] hover:underline">{selectedSubTheme?.title}</button>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                        <span className="text-gray-800">Catégorie</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1a4b8c] mb-2">3. Affinez la catégorie</h3>
                                    <p className="text-gray-500 text-lg">Ce sujet contient plusieurs catégories. Laquelle vous intéresse ?</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {filteredNestedSubThemes.map((nestedST: any) => (
                                        <div
                                            key={nestedST.id}
                                            onClick={() => handleSubSubThemeSelect(nestedST.id)}
                                            className="group p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-[#3bb3a9] hover:shadow-xl cursor-pointer transition-all duration-300"
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-lg font-bold text-gray-800 group-hover:text-[#1a4b8c]">{nestedST.title}</h4>
                                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#3bb3a9]" />
                                            </div>
                                            <div className="space-y-2">
                                                {nestedST.datasets?.map((ds: any) => (
                                                    <div key={ds.id} className="flex items-center gap-2 text-sm text-gray-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#3bb3a9]" />
                                                        <span className="truncate">{ds.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Dataset selection when multiple datasets at leaf level */}
                        {currentStep === 3 && ((!hasNestedSubThemes && leafNode) || selectedSubSubThemeId) && hasMultipleDatasets && !selectedDatasetId && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
                                        <button onClick={() => setCurrentStep(1)} className="text-[#3bb3a9] hover:underline">{selectedTheme?.shortTitle}</button>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                        <button onClick={() => setCurrentStep(2)} className="text-[#3bb3a9] hover:underline">{selectedSubTheme?.title}</button>
                                        {selectedNestedSubTheme && (
                                            <>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                                <button onClick={() => { setSelectedDatasetId(null) }} className="text-[#3bb3a9] hover:underline">{selectedNestedSubTheme.title}</button>
                                            </>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                        <span className="text-gray-800">Indicateur</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1a4b8c] mb-2 flex items-center gap-3">
                                        <span className="bg-[#1a4b8c] text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg">3</span>
                                        Choisissez l'Indicateur
                                    </h3>
                                    <p className="text-gray-500 text-lg">Plusieurs indicateurs sont disponibles. Lequel souhaitez-vous générer ?</p>
                                </div>

                                <div className="grid gap-4">
                                    {leafDatasets.map((ds: any) => (
                                        <div
                                            key={ds.id}
                                            onClick={() => ds.demoReady && handleDatasetSelect(ds.id)}
                                            className={cn(
                                                "p-6 rounded-xl border-2 transition-all group flex items-center gap-6",
                                                ds.demoReady
                                                    ? "cursor-pointer border-gray-100 bg-white hover:border-[#3bb3a9] hover:shadow-lg"
                                                    : "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60 grayscale"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors",
                                                ds.demoReady
                                                    ? "bg-[#e0f2f1] text-[#00695c] group-hover:bg-[#3bb3a9] group-hover:text-white"
                                                    : "bg-gray-200 text-gray-400"
                                            )}>
                                                {ds.demoReady ? <FileSpreadsheet className="w-7 h-7" /> : <Database className="w-7 h-7" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-lg font-bold text-gray-800 group-hover:text-[#1a4b8c] transition-colors">{ds.label}</h4>
                                                    {ds.demoReady ? (
                                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Disponible</span>
                                                    ) : (
                                                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-bold">Indisponible</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">Source : {ds.source}</p>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-[#3bb3a9]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Step 3: Parameters (Year & Format) - when dataset is resolved */}
                        {currentStep === 3 && canShowParams && (
                            <div className="animate-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-[#1a4b8c] mb-2 flex items-center gap-3">
                                        <span className="bg-[#1a4b8c] text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg">4</span>
                                        Configuration finale
                                    </h3>
                                    <p className="text-gray-500 text-lg">Derniers réglages avant la génération de votre fichier.</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Year Selection */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Calendar className="w-6 h-6 text-[#3bb3a9]" />
                                            <h4 className="text-lg font-bold text-gray-800">Année de référence</h4>
                                            {yearsLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {availableYears.map(y => (
                                                <button
                                                    key={y}
                                                    onClick={() => setYear(y)}
                                                    className={cn(
                                                        "px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5",
                                                        year === y
                                                            ? "bg-[#3bb3a9] text-white shadow-lg shadow-[#3bb3a9]/30 ring-2 ring-[#3bb3a9] ring-offset-2"
                                                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                                                    )}
                                                >
                                                    {y}
                                                </button>
                                            ))}
                                            {availableYears.length === 0 && (
                                                <span className="text-gray-400 italic">Aucune année disponible</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Format Selection */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <FileSpreadsheet className="w-6 h-6 text-[#3bb3a9]" />
                                            <h4 className="text-lg font-bold text-gray-800">Format de sortie</h4>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            {[
                                                { id: 'zip', label: 'Pack Complet (.zip)', desc: 'Tous les fichiers (Type A & B)', icon: FolderOpen },
                                                { id: 'consolidated', label: 'Fichier Consolidé', desc: 'Fichier unique tous niveaux', icon: Database },
                                                { id: 'selective', label: 'Par Niveau', desc: 'Sélection spécifique', icon: CheckCircle2 },
                                            ].map((fmt) => (
                                                <div
                                                    key={fmt.id}
                                                    onClick={() => setOutputFormat(fmt.id as any)}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-3 hover:shadow-md",
                                                        outputFormat === fmt.id
                                                            ? "border-[#3bb3a9] bg-[#3bb3a9]/5"
                                                            : "border-gray-100 bg-white hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                                        outputFormat === fmt.id ? "bg-[#3bb3a9] text-white" : "bg-gray-100 text-gray-400"
                                                    )}>
                                                        <fmt.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className={cn("font-bold", outputFormat === fmt.id ? "text-[#1a4b8c]" : "text-gray-700")}>{fmt.label}</div>
                                                        <div className="text-xs text-gray-400 mt-1">{fmt.desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {outputFormat === 'selective' && (
                                            <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2">
                                                <p className="text-sm font-bold text-gray-600 mb-3">Niveau géographique souhaité :</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {LEVELS.map(lvl => (
                                                        <button
                                                            key={lvl.id}
                                                            onClick={() => setSelectedLevel(lvl.id)}
                                                            className={cn(
                                                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                                                                selectedLevel === lvl.id
                                                                    ? "bg-[#1a4b8c] text-white border-[#1a4b8c]"
                                                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
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

                                {/* Infos Mode Open Data (Rappel) */}
                                {isOpenDataMode && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3 text-sm text-blue-800">
                                        <Info className="w-5 h-5 flex-shrink-0" />
                                        <span>Vous êtes en mode <strong>Open Data</strong>. Seuls les indicateurs publics INSEE sont utilisés.</span>
                                    </div>
                                )}

                                {/* Upload CSV Link */}
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4">
                                    <Info className="w-4 h-4" />
                                    <span>Des données manquantes ?</span>
                                    <button
                                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                                        className="text-[#3bb3a9] font-bold hover:underline"
                                    >
                                        Importer un CSV
                                    </button>
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

                    </div> {/* End of Step Content Wrapper */}

                    {/* Integrated Upload CSV Section - Always visible at bottom of left column */}
                    <div className="mt-12 pt-8 border-t border-gray-100" id="upload-csv-section">
                        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 hover:border-[#3bb3a9]/50 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
                                    <Database className="w-6 h-6 text-gray-400 group-hover:text-[#3bb3a9]" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-gray-800 mb-1">Base de données incomplète ?</h4>
                                    <p className="text-gray-500 text-sm mb-4">
                                        Si vous ne trouvez pas les données souhaitées, vous pouvez enrichir la base en important vos propres fichiers CSV.
                                    </p>
                                    <UploadCSV onUploadComplete={() => window.location.reload()} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div> {/* End of Left Column */}

                {/* Right Column: Preview Panel (Sticky) */}
                <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 sticky top-8 self-start z-30">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black/5 flex flex-col transition-all duration-300" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
                        <div className="bg-[#1a4b8c] p-5 text-white flex justify-between items-center z-10 rounded-t-2xl shrink-0">
                            <h3 className="font-bold flex items-center gap-2 text-lg">
                                <FileSpreadsheet className="w-5 h-5" /> Récapitulatif
                            </h3>
                            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                {new Date().getFullYear()}
                            </span>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Theme Step */}
                            <div className={cn(
                                "relative pl-6 border-l-2 transition-all duration-300",
                                selectedTheme ? "border-[#3bb3a9]" : "border-gray-200"
                            )}>
                                <span className={cn(
                                    "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white",
                                    selectedTheme ? "border-[#3bb3a9]" : "border-gray-300"
                                )} />
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Thématique</p>
                                {selectedTheme ? (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 font-bold text-[#1a4b8c]">
                                            <selectedTheme.icon className="w-4 h-4" />
                                            {selectedTheme.shortTitle}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-300 italic">En attente...</p>
                                )}
                            </div>

                            {/* SubTheme Step */}
                            <div className={cn(
                                "relative pl-6 border-l-2 transition-all duration-300",
                                selectedSubTheme ? "border-[#3bb3a9]" : "border-gray-200"
                            )}>
                                <span className={cn(
                                    "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white",
                                    selectedSubTheme ? "border-[#3bb3a9]" : "border-gray-300"
                                )} />
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Sujet</p>
                                {selectedSubTheme ? (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="font-bold text-gray-800">{selectedSubTheme.title}</div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-300 italic">--</p>
                                )}
                            </div>

                            {/* Indicator Step */}
                            <div className={cn(
                                "relative pl-6 border-l-2 transition-all duration-300",
                                selectedDatasetId || selectedNestedSubTheme ? "border-[#3bb3a9]" : "border-gray-200"
                            )}>
                                <span className={cn(
                                    "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white",
                                    selectedDatasetId || selectedNestedSubTheme ? "border-[#3bb3a9]" : "border-gray-300"
                                )} />
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Indicateur</p>
                                {(selectedDatasetId || selectedNestedSubTheme) ? (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="font-bold text-[#1a4b8c] text-sm">
                                            {selectedDatasetId
                                                ? leafDatasets.find((d: any) => d.id === selectedDatasetId)?.label
                                                : selectedNestedSubTheme?.title}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-300 italic">--</p>
                                )}
                            </div>

                            {/* Model Open Data Helper Text */}
                            {isOpenDataMode && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700 mt-2">
                                    <span className="font-bold block mb-1">ℹ️ Mode Open Data</span>
                                    Données issues des sources publiques (INSEE, CepiDc, etc.)
                                </div>
                            )}

                            {/* Configuration Step */}
                            {currentStep >= 3 && canShowParams && (
                                <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Année</span>
                                        <span className="font-bold text-[#1a4b8c]">{year}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Format</span>
                                        <span className="font-bold text-[#1a4b8c] uppercase">{outputFormat}</span>
                                    </div>
                                    <button
                                        disabled className="w-full mt-4 bg-gray-100 text-gray-400 rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <Info className="w-4 h-4" /> Prêt à générer
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Helper Box */}
                    <div className="bg-[#e8f5e9] rounded-xl p-5 border border-[#c8e6c9]">
                        <h4 className="flex items-center gap-2 font-bold text-[#2e7d32] mb-2 text-sm">
                            <Info className="w-4 h-4" /> Besoin d'aide ?
                        </h4>
                        <p className="text-xs text-[#1b5e20] leading-relaxed">
                            Si vous ne trouvez pas l'indicateur souhaité, vérifiez le mode Open Data ou importez vos propres fichiers CSV via l'outil d'import en bas de page.
                        </p>
                    </div>
                </div>
            </div > {/* End of Main Grid */}

            {/* Sticky Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-64 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40 transition-all">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center">
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

        </div >
    )
}
