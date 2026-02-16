import { CheckCircle2, Play, Settings2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2Props {
    year: string;
    availableYears: string[];
    onYearChange: (year: string) => void;

    format: string;
    onFormatChange: (format: string) => void;

    onGenerate: () => void;
    isProcessing: boolean;
}

export function Step2_Config({
    year,
    availableYears,
    onYearChange,
    format,
    onFormatChange,
    onGenerate,
    isProcessing
}: Step2Props) {

    // Helper to sort years descending
    const sortedYears = [...availableYears].sort((a, b) => parseInt(b) - parseInt(a));

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#1a4b8c] mb-6 flex items-center gap-3">
                <Settings2 className="w-8 h-8" />
                2. Configuration
            </h2>

            {/* Year Selection */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#3bb3a9]" />
                    Année des données
                </h3>

                {availableYears.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {sortedYears.map((y) => {
                            const isSelected = year === y;
                            return (
                                <button
                                    key={y}
                                    onClick={() => onYearChange(y)}
                                    className={cn(
                                        "px-4 py-2 rounded-full font-bold text-sm transition-all border-2",
                                        isSelected
                                            ? "bg-[#1a4b8c] text-white border-[#1a4b8c] shadow-lg scale-105"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-[#3bb3a9] hover:text-[#3bb3a9]"
                                    )}
                                >
                                    {y}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-400 italic">Aucune année disponible pour ce jeu de données.</p>
                )}
            </div>

            {/* Format Selection */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-[#3bb3a9]" />
                    Format de sortie
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pack Complet */}
                    <button
                        onClick={() => onFormatChange('zip')}
                        className={cn(
                            "relative p-4 rounded-xl border-2 text-left transition-all",
                            format === 'zip'
                                ? "border-[#3bb3a9] bg-[#3bb3a9]/5 ring-1 ring-[#3bb3a9]"
                                : "border-gray-200 hover:border-gray-300"
                        )}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-800">Pack Complet (.zip)</span>
                            {format === 'zip' && <CheckCircle2 className="w-5 h-5 text-[#3bb3a9]" />}
                        </div>
                        <p className="text-sm text-gray-500">
                            Contient tous les niveaux géographiques (Communes, EPCI, Départements, etc.)
                        </p>
                    </button>

                    {/* Fichier Consolidé */}
                    <button
                        onClick={() => onFormatChange('consolidated')}
                        className={cn(
                            "relative p-4 rounded-xl border-2 text-left transition-all opacity-60 cursor-not-allowed",
                            format === 'consolidated'
                                ? "border-[#3bb3a9] bg-[#3bb3a9]/5"
                                : "border-gray-200"
                        )}
                        disabled
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-800">Fichier Unique Consolidé</span>
                            <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold">BIENTÔT</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Un seul fichier Excel avec tous les onglets.
                        </p>
                    </button>
                </div>
            </div>

            {/* Main Action Button */}
            <button
                onClick={onGenerate}
                disabled={isProcessing || !year}
                className={cn(
                    "w-full py-4 text-xl font-bold rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3",
                    isProcessing || !year
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#1a4b8c] to-[#3bb3a9] text-white hover:shadow-2xl hover:scale-[1.01]"
                )}
            >
                {isProcessing ? "Génération en cours..." : "GÉNÉRER MON FICHIER"}
                {!isProcessing && <Play className="w-6 h-6 fill-current" />}
            </button>

            {!year && (
                <p className="text-center text-red-500 text-sm font-medium animate-pulse">
                    Veuillez sélectionner une année pour continuer.
                </p>
            )}
        </div>
    );
}
