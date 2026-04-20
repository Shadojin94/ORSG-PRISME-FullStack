import { CheckCircle2, Download, RefreshCw, FileSpreadsheet, AlertTriangle } from "lucide-react";

interface Step3Props {
    generatedFiles: string[];
    warnings?: string[];
    onDownload: (filename: string) => void;
    onRestart: () => void;
}

export function Step3_Result({
    generatedFiles,
    warnings = [],
    onDownload,
    onRestart
}: Step3Props) {

    const count = generatedFiles.length;
    const isMulti = count > 1;

    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 animate-in zoom-in-95 duration-500 text-center">

            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-xl animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-extrabold text-[#1a4b8c] mb-4">
                {isMulti
                    ? `${count} fichiers générés avec succès !`
                    : 'Fichier généré avec succès !'}
            </h2>

            <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
                {isMulti
                    ? 'Chaque indicateur a produit son propre pack. Téléchargez-les ci-dessous.'
                    : 'Votre fichier de données est prêt. Vous pouvez le télécharger ci-dessous.'}
            </p>

            {warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 max-w-lg w-full text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <p className="font-semibold text-amber-700 text-sm">
                            Avertissements sur les données sources
                        </p>
                    </div>
                    <ul className="space-y-1">
                        {warnings.map((w, i) => (
                            <li key={i} className="text-xs text-amber-600 pl-7">
                                {w}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-amber-500 mt-2 pl-7 italic">
                        Ces avertissements proviennent des fichiers sources, pas de l'application.
                    </p>
                </div>
            )}

            <div className="w-full max-w-md space-y-3 mb-6">
                {generatedFiles.map((file) => (
                    <div
                        key={file}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-3"
                    >
                        <div className="bg-green-100 p-2 rounded-lg text-green-700 shrink-0">
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
                    </div>
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

            <button
                onClick={onRestart}
                className="text-gray-400 hover:text-[#1a4b8c] text-sm font-bold flex items-center gap-2 transition-colors py-2 px-4 rounded-lg hover:bg-gray-100"
            >
                <RefreshCw className="w-4 h-4" />
                Nouvelle génération
            </button>

        </div>
    );
}
