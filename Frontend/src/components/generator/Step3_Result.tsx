import { CheckCircle2, Download, RefreshCw, FileSpreadsheet } from "lucide-react";

interface Step3Props {
    generatedFile: string | null;
    onDownload: (filename: string) => void;
    onRestart: () => void;
}

export function Step3_Result({
    generatedFile,
    onDownload,
    onRestart
}: Step3Props) {

    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 animate-in zoom-in-95 duration-500 text-center">

            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-xl animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-extrabold text-[#1a4b8c] mb-4">
                Fichier généré avec succès !
            </h2>

            <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
                Votre fichier de données est prêt. Vous pouvez le télécharger ci-dessous.
            </p>

            {generatedFile && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 flex items-center gap-3 max-w-md w-full">
                    <div className="bg-green-100 p-2 rounded-lg text-green-700">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="text-left overflow-hidden flex-1">
                        <p className="font-bold text-gray-800 truncate">{generatedFile}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Excel / Zip</p>
                    </div>
                </div>
            )}

            <button
                onClick={() => generatedFile && onDownload(generatedFile)}
                className="w-full max-w-md bg-[#4caf50] hover:bg-[#43a047] text-white text-xl font-bold py-5 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 mb-6"
            >
                <Download className="w-7 h-7" />
                TÉLÉCHARGER
            </button>

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
