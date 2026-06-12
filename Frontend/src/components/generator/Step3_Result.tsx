import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Download, RefreshCw, FileSpreadsheet, AlertTriangle, ChevronDown } from "lucide-react";
import { ReportPreview } from "./ReportPreview";

/**
 * Humanise un avertissement technique remonté par le moteur.
 * Forme reçue typique : "pop_homme : données absentes au niveau Communes, DOM, ... — les colonnes seront vides. Vérifiez le fichier CSV source."
 * On remplace le nom de variable brut par son libellé métier (via la liste d'indicateurs)
 * et on retire la consigne technique « Vérifiez le fichier CSV source ».
 */
function humanizeWarning(
    raw: string,
    varToLabel: Record<string, string>
): string {
    let text = raw.trim();
    // Retire la consigne technique destinée à un informaticien.
    text = text.replace(/\s*Vérifiez le fichier CSV source\.?\s*$/i, "").trim();

    // Remplace le nom de variable (avant le " : ") par son libellé humain si connu.
    const sepIndex = text.indexOf(" : ");
    if (sepIndex > 0) {
        const varName = text.slice(0, sepIndex).trim();
        const human = varToLabel[varName];
        if (human) {
            text = `${human} (${varName})${text.slice(sepIndex)}`;
        }
    }
    return text;
}

interface Step3Props {
    generatedFiles: string[];
    warnings?: string[];
    onDownload: (filename: string) => void;
    onRestart: () => void;
    themeLabel: string;
    subjectLabel: string;
    indicators: Array<{ id: string; variable: string; label: string; source?: string; demoReady?: boolean }>;
    year: string;
    sourceMode: "opendata" | "moca";
    format: string;
}

export function Step3_Result({
    generatedFiles,
    warnings = [],
    onDownload,
    onRestart,
    themeLabel,
    subjectLabel,
    indicators,
    year,
    sourceMode,
    format
}: Step3Props) {

    const count = generatedFiles.length;
    const isMulti = count > 1;

    const [showWarningDetail, setShowWarningDetail] = useState(false);

    // Mapping nom de variable brut -> libellé métier, pour humaniser le détail.
    const varToLabel: Record<string, string> = {};
    for (const ind of indicators) {
        if (ind.variable && ind.label) varToLabel[ind.variable] = ind.label;
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">

            <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mb-8"
            >
                {/* Halo / glow pulsé autour de la coche */}
                <span className="absolute inset-0 rounded-full bg-[#4caf50]/30 blur-2xl animate-pulse" />
                <span className="absolute -inset-3 rounded-full bg-[#4caf50]/10 animate-ping" />
                <div className="relative w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-3xl font-extrabold text-[#1a4b8c] mb-4"
            >
                {isMulti
                    ? `${count} fichiers générés avec succès !`
                    : 'Fichier généré avec succès !'}
            </motion.h2>

            <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="text-gray-500 text-lg mb-8 max-w-lg mx-auto"
            >
                {isMulti
                    ? 'Chaque indicateur a produit son propre pack. Téléchargez-les ci-dessous.'
                    : 'Votre fichier de données est prêt. Vous pouvez le télécharger ci-dessous.'}
            </motion.p>

            {warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 max-w-lg w-full text-left">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-amber-800 text-sm mb-1">
                                Certaines données n'étaient pas disponibles
                            </p>
                            <p className="text-sm text-amber-700 leading-relaxed">
                                Certaines données ne sont pas disponibles pour tous les territoires :
                                les cellules concernées resteront vides dans le fichier Excel.
                                Votre fichier reste utilisable, ces zones pourront être complétées plus tard.
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowWarningDetail(v => !v)}
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
                                aria-expanded={showWarningDetail}
                            >
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-200 ${showWarningDetail ? "rotate-180" : ""}`}
                                />
                                {showWarningDetail ? "Masquer le détail" : `Voir le détail (${warnings.length})`}
                            </button>

                            {showWarningDetail && (
                                <ul className="mt-3 space-y-2 border-t border-amber-200 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {warnings.map((w, i) => (
                                        <li key={i} className="text-xs text-amber-700 leading-relaxed flex gap-2">
                                            <span className="text-amber-400 select-none">•</span>
                                            <span>{humanizeWarning(w, varToLabel)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md space-y-3 mb-6">
                {generatedFiles.map((file, i) => (
                    <motion.div
                        key={file}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#4caf50]/40"
                    >
                        <div className="bg-green-100 p-2 rounded-xl text-green-700 shrink-0">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div className="text-left overflow-hidden flex-1 min-w-0">
                            <p className="font-bold text-gray-800 truncate" title={file}>{file}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Excel / Zip</p>
                        </div>
                        <button
                            onClick={() => onDownload(file)}
                            className="shrink-0 bg-[#4caf50] hover:bg-[#43a047] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Télécharger
                        </button>
                    </motion.div>
                ))}
            </div>

            {isMulti && (
                <button
                    onClick={() => generatedFiles.forEach(f => onDownload(f))}
                    className="w-full max-w-md bg-[#4caf50] hover:bg-[#43a047] text-white text-lg font-bold py-4 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 mb-6"
                >
                    <Download className="w-6 h-6" />
                    TOUT TÉLÉCHARGER ({count})
                </button>
            )}

            <div className="w-full border-t border-gray-200 pt-10 mt-2 text-left bg-gray-50/50 -mx-6 px-6 pb-2 rounded-b-2xl">
                <ReportPreview
                    themeLabel={themeLabel}
                    subjectLabel={subjectLabel}
                    indicators={indicators}
                    year={year}
                    sourceMode={sourceMode}
                    format={format}
                    generatedFiles={generatedFiles}
                />
            </div>

            <button
                onClick={onRestart}
                className="text-gray-400 hover:text-[#1a4b8c] text-sm font-bold flex items-center gap-2 transition-colors py-2 px-4 rounded-lg hover:bg-gray-100 mt-8"
            >
                <RefreshCw className="w-4 h-4" />
                Nouvelle génération
            </button>

        </div>
    );
}
