import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, Loader2, AlertTriangle, CheckCircle2, Download, X, Calendar, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import * as api from "@/services/api";

const YEARS: number[] = Array.from({ length: 31 }, (_, i) => 2000 + i);
const DEFAULT_YEAR = "2018";

function isAcceptedFile(file: File): boolean {
    return file.name.toLowerCase().endsWith(".xls");
}

/**
 * Mode « Réagencement MOCA-O » du thème Pathologies :
 * on dépose l'extraction brute MOCA-O (.xls), on choisit l'année,
 * le serveur renvoie un classeur Excel à 5 onglets prêt à l'emploi.
 */
export function PathoReorganize() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [year, setYear] = useState<string>(DEFAULT_YEAR);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultFile, setResultFile] = useState<string | null>(null);

    const selectFile = useCallback((files: FileList | File[]) => {
        const picked = Array.from(files)[0];
        if (!picked) return;
        if (!isAcceptedFile(picked)) {
            setError("Format non reconnu. Déposez le fichier d'extraction MOCA-O d'origine au format .xls (les .xlsx ne sont pas acceptés).");
            return;
        }
        setError(null);
        setResultFile(null);
        setFile(picked);
    }, []);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            selectFile(e.dataTransfer.files);
        }
    }, [selectFile]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            selectFile(e.target.files);
        }
        // Permet de re-sélectionner le même fichier après une erreur.
        e.target.value = "";
    }, [selectFile]);

    const handleGenerate = useCallback(async () => {
        if (!file || loading) return;
        setLoading(true);
        setError(null);
        setResultFile(null);
        try {
            const result = await api.reorganizePatho(file, parseInt(year, 10));
            if (result.success && result.filename) {
                setResultFile(result.filename);
            } else {
                setError(result.error || "La génération a échoué. Vérifiez le fichier déposé et l'année choisie.");
            }
        } catch (err: any) {
            setError(`Erreur système : ${err?.message || "connexion impossible"}`);
        } finally {
            setLoading(false);
        }
    }, [file, year, loading]);

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#3bb3a9]/10 text-[#3bb3a9]">
                    <FileSpreadsheet className="w-5 h-5" />
                </span>
                Réagencement d'une extraction MOCA-O
            </h3>

            <p className="text-sm text-gray-600">
                Déposez votre extraction MOCA-O (.xls), choisissez l'année, téléchargez le classeur
                réagencé : un fichier Excel à 5 onglets (communes, DROM, France entière,
                France hexagonale, régions).
            </p>

            {/* Zone de dépôt */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !loading && document.getElementById("patho-reorg-input")?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
                    loading
                        ? "border-[#1a4b8c]/30 bg-[#1a4b8c]/5 pointer-events-none opacity-60"
                        : dragActive
                            ? "border-[#1a4b8c] bg-[#1a4b8c]/5 scale-[1.01]"
                            : "border-gray-300 hover:border-[#3bb3a9] hover:bg-gray-50"
                )}
            >
                <input
                    id="patho-reorg-input"
                    type="file"
                    accept=".xls"
                    onChange={handleFileInput}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-2">
                    <Upload className={cn("w-8 h-8", dragActive ? "text-[#1a4b8c]" : "text-gray-400")} />
                    <p className="text-sm font-medium text-gray-600">
                        Déposez votre extraction MOCA-O (.xls)
                    </p>
                    <p className="text-xs text-gray-400">
                        Format accepté : <strong>.xls</strong> (export MOCA-O d'origine) — un seul fichier
                    </p>
                </div>
            </div>

            {/* Fichier sélectionné */}
            {file && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-green-200 bg-green-50 text-sm text-green-700">
                    <FileSpreadsheet className="w-4 h-4 shrink-0" />
                    <span className="flex-1 truncate font-medium">{file.name}</span>
                    <span className="text-xs text-green-600 shrink-0">
                        {file.size >= 1024 * 1024
                            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                            : `${(file.size / 1024).toFixed(0)} KB`}
                    </span>
                    {!loading && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); setResultFile(null); }}
                            className="p-1 rounded hover:bg-green-100 text-green-600 shrink-0"
                            title="Retirer le fichier"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Année */}
            <div className="flex items-center gap-3">
                <label htmlFor="patho-reorg-year" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#3bb3a9]" />
                    Année à générer
                </label>
                <select
                    id="patho-reorg-year"
                    value={year}
                    onChange={(e) => { setYear(e.target.value); setResultFile(null); }}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold focus:border-[#1a4b8c] focus:outline-none disabled:opacity-60"
                >
                    {YEARS.map((y) => (
                        <option key={y} value={String(y)}>{y}</option>
                    ))}
                </select>
            </div>

            {/* Erreur */}
            {error && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 font-bold text-red-700 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Erreur
                    </div>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
            )}

            {/* Résultat */}
            {resultFile && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 font-bold text-green-700 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Fichier généré
                    </div>
                    <p className="text-sm text-green-600 mt-1 break-all">{resultFile}</p>
                    <a
                        href={api.getDownloadUrl(resultFile)}
                        className="mt-3 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#3bb3a9] to-[#2f9a91] shadow-md hover:shadow-xl hover:shadow-[#3bb3a9]/30 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <Download className="w-4 h-4" />
                        Télécharger le fichier Excel
                    </a>
                </div>
            )}

            {/* Bouton Générer */}
            <button
                onClick={handleGenerate}
                disabled={!file || loading}
                className={cn(
                    "w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md",
                    file && !loading
                        ? "bg-gradient-to-r from-[#3bb3a9] to-[#2f9a91] text-white hover:shadow-xl hover:shadow-[#3bb3a9]/30 hover:-translate-y-0.5"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Génération en cours...
                    </>
                ) : (
                    <>
                        <Play className="w-5 h-5 fill-current" />
                        Générer le fichier
                    </>
                )}
            </button>
            {!file && !loading && (
                <p className="text-[11px] text-gray-500 text-center">
                    Déposez d'abord votre extraction MOCA-O pour lancer la génération.
                </p>
            )}
        </div>
    );
}
