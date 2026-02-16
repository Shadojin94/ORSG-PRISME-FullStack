import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, FileCheck, FileMinus, Loader2, CheckCircle2, AlertTriangle, RefreshCw, Clock, FileSpreadsheet, ChevronDown, Eye, Trash2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import * as api from "@/services/api";

interface MocaUploadProps {
    datasetId: string | null;
    onUploadComplete: () => void; // Called after successful upload to refresh years
}

interface CsvStatus {
    variable: string;
    pattern: string;
    label?: string;
    found: boolean;
    fileName?: string;
}

export function MocaUpload({ datasetId, onUploadComplete }: MocaUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<api.UploadResult | null>(null);
    const [csvStatus, setCsvStatus] = useState<CsvStatus[]>([]);
    const [statusLoading, setStatusLoading] = useState(false);

    // Post-upload sync phase: idle -> syncing -> done
    const [syncPhase, setSyncPhase] = useState<'idle' | 'syncing' | 'done'>('idle');
    const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Import history
    const [importHistory, setImportHistory] = useState<api.ImportHistoryEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Validation
    const [validatingFile, setValidatingFile] = useState<string | null>(null);
    const [validationResult, setValidationResult] = useState<{ file: string; validation: api.CsvValidation } | null>(null);

    // Load CSV availability for this dataset
    const loadCsvStatus = useCallback(async () => {
        if (!datasetId) { setCsvStatus([]); return; }
        setStatusLoading(true);
        try {
            const info = await api.getDatasetInfo(datasetId);
            const ds = info.dataset;
            const avail = ds.csvAvailability;

            const statuses: CsvStatus[] = [];
            for (const f of avail.found) {
                statuses.push({ variable: f.variable, pattern: f.pattern, found: true, fileName: f.file });
            }
            for (const m of avail.missing) {
                statuses.push({ variable: m.variable, pattern: m.pattern, found: false });
            }
            setCsvStatus(statuses);
        } catch (err) {
            console.error('Failed to load CSV status:', err);
            setCsvStatus([]);
        } finally {
            setStatusLoading(false);
        }
    }, [datasetId]);

    // Load import history
    const loadHistory = useCallback(async () => {
        try {
            const history = await api.getImportHistory();
            setImportHistory(history);
        } catch (err) {
            console.error('Failed to load import history:', err);
        }
    }, []);

    useEffect(() => {
        loadCsvStatus();
        loadHistory();
    }, [loadCsvStatus, loadHistory]);

    // Cleanup sync timer on unmount
    useEffect(() => {
        return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
    }, []);

    const totalRequired = csvStatus.length;
    const totalFound = csvStatus.filter(s => s.found).length;
    const allPresent = totalRequired > 0 && totalFound === totalRequired;

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const validFiles = Array.from(files).filter(f => {
            const ext = f.name.toLowerCase();
            return ext.endsWith('.csv') || ext.endsWith('.xlsx') || ext.endsWith('.xls');
        });
        if (validFiles.length === 0) {
            setUploadResult({ success: false, error: "Formats acceptés : .csv, .xlsx, .xls" });
            return;
        }

        setUploading(true);
        setUploadResult(null);
        setSyncPhase('idle');
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

        try {
            const result = await api.uploadCsvFiles(validFiles);
            setUploadResult(result);
            if (result.success) {
                // Phase 2: Synchronisation - re-index files
                setUploading(false);
                setSyncPhase('syncing');
                await loadCsvStatus();
                await loadHistory();
                onUploadComplete();
                // Phase 3: Confirmation
                setSyncPhase('done');
                // Auto-dismiss after 8 seconds
                syncTimerRef.current = setTimeout(() => setSyncPhase('idle'), 8000);
            }
        } catch (err: any) {
            setUploadResult({ success: false, error: `Erreur: ${err.message}` });
        } finally {
            setUploading(false);
            setDragActive(false);
        }
    }, [loadCsvStatus, loadHistory, onUploadComplete]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    }, [handleFiles]);

    // Validate a specific CSV
    const handleValidate = useCallback(async (filename: string) => {
        setValidatingFile(filename);
        setValidationResult(null);
        try {
            const result = await api.validateCsvFile(filename);
            if (result.success && result.validation) {
                setValidationResult({ file: filename, validation: result.validation });
            }
        } catch (err) {
            console.error('Validation failed:', err);
        } finally {
            setValidatingFile(null);
        }
    }, []);

    // Delete a CSV file
    const handleDelete = useCallback(async (filename: string) => {
        try {
            await api.deleteCsvSource(filename);
            await loadCsvStatus();
            onUploadComplete();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    }, [loadCsvStatus, onUploadComplete]);

    if (!datasetId) return null;

    return (
        <div className="space-y-4">
            {/* Data Presence Indicator */}
            {!statusLoading && totalFound > 0 && (
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm",
                    allPresent
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-blue-50 border-blue-200 text-blue-700"
                )}>
                    {allPresent ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                        <FileSpreadsheet className="w-4 h-4 shrink-0" />
                    )}
                    <span>
                        {allPresent
                            ? `Données MOCA-O complètes (${totalFound}/${totalRequired} fichiers présents)`
                            : `Données MOCA-O partielles : ${totalFound}/${totalRequired} fichiers présents`
                        }
                    </span>
                    {allPresent && (
                        <span className="ml-auto text-xs text-green-500 font-medium">Prêt pour la génération</span>
                    )}
                </div>
            )}

            {/* CSV Status Table */}
            {statusLoading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Vérification des fichiers CSV...
                </div>
            ) : csvStatus.length > 0 ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-700">
                            Fichiers requis ({totalFound}/{totalRequired})
                        </h4>
                        <button
                            onClick={loadCsvStatus}
                            className="text-xs text-gray-400 hover:text-[#1a4b8c] flex items-center gap-1 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" /> Actualiser
                        </button>
                    </div>

                    <div className="space-y-1">
                        {csvStatus.map((s) => (
                            <div
                                key={s.variable}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                    s.found ? "bg-green-50/50" : "bg-amber-50/50"
                                )}
                            >
                                {s.found ? (
                                    <FileCheck className="w-4 h-4 text-green-500 shrink-0" />
                                ) : (
                                    <FileMinus className="w-4 h-4 text-amber-500 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <span className="font-medium text-gray-700">{s.variable}</span>
                                    <span className="text-gray-400 mx-1.5">-</span>
                                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{s.pattern}*.csv</code>
                                </div>
                                {s.found && s.fileName && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-green-600 truncate max-w-[150px]">{s.fileName}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleValidate(s.fileName!); }}
                                            className="p-1 rounded hover:bg-green-100 text-green-500 hover:text-green-700 transition-colors"
                                            title="Inspecter le fichier"
                                        >
                                            {validatingFile === s.fileName ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Eye className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(s.fileName!); }}
                                            className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                {!s.found && (
                                    <span className="text-xs text-amber-600 font-medium">Manquant</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Validation Result Panel */}
            {validationResult && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-[#1a4b8c]" />
                            Inspection : {validationResult.file}
                        </h4>
                        <button
                            onClick={() => setValidationResult(null)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            Fermer
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-gray-50 rounded p-2">
                            <span className="text-gray-500">Lignes</span>
                            <div className="font-bold text-gray-800">{validationResult.validation.rowCount.toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                            <span className="text-gray-500">Colonnes</span>
                            <div className="font-bold text-gray-800">{validationResult.validation.columns.length}</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                            <span className="text-gray-500">Séparateur</span>
                            <div className="font-bold text-gray-800">{validationResult.validation.separator === ';' ? 'Point-virgule (;)' : 'Virgule (,)'}</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                            <span className="text-gray-500">Taille</span>
                            <div className="font-bold text-gray-800">
                                {validationResult.validation.fileSize >= 1024 * 1024
                                    ? `${(validationResult.validation.fileSize / (1024 * 1024)).toFixed(1)} MB`
                                    : `${(validationResult.validation.fileSize / 1024).toFixed(0)} KB`
                                }
                            </div>
                        </div>
                    </div>

                    {/* Structure check indicators */}
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className={cn(
                            "px-2 py-1 rounded-full font-medium",
                            validationResult.validation.hasGeoColumn ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        )}>
                            {validationResult.validation.hasGeoColumn ? "Colonne géo" : "Pas de colonne géo"}
                        </span>
                        <span className={cn(
                            "px-2 py-1 rounded-full font-medium",
                            validationResult.validation.hasYearColumn ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        )}>
                            {validationResult.validation.hasYearColumn ? "Colonne année" : "Pas de colonne année"}
                        </span>
                        <span className={cn(
                            "px-2 py-1 rounded-full font-medium",
                            validationResult.validation.hasValueColumn ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        )}>
                            {validationResult.validation.hasValueColumn ? "Colonne valeur" : "Pas de colonne valeur"}
                        </span>
                    </div>

                    {/* Column names */}
                    <div>
                        <span className="text-xs text-gray-500 font-medium">Colonnes :</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {validationResult.validation.columns.map((col, i) => (
                                <code key={i} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{col}</code>
                            ))}
                        </div>
                    </div>

                    {/* Sample rows */}
                    {validationResult.validation.sampleRows.length > 0 && (
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Aperçu (5 premières lignes) :</span>
                            <div className="mt-1 overflow-x-auto">
                                <table className="text-[10px] border-collapse w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            {validationResult.validation.columns.slice(0, 8).map((col, i) => (
                                                <th key={i} className="px-2 py-1 text-left border border-gray-200 font-medium text-gray-600 whitespace-nowrap">{col}</th>
                                            ))}
                                            {validationResult.validation.columns.length > 8 && (
                                                <th className="px-2 py-1 text-left border border-gray-200 text-gray-400">+{validationResult.validation.columns.length - 8}...</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {validationResult.validation.sampleRows.map((row, rowIdx) => (
                                            <tr key={rowIdx}>
                                                {validationResult.validation.columns.slice(0, 8).map((col, colIdx) => (
                                                    <td key={colIdx} className="px-2 py-1 border border-gray-200 text-gray-700 whitespace-nowrap max-w-[120px] truncate">
                                                        {String(row[col] ?? '')}
                                                    </td>
                                                ))}
                                                {validationResult.validation.columns.length > 8 && (
                                                    <td className="px-2 py-1 border border-gray-200 text-gray-400">...</td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sync Phase Banner */}
            {syncPhase === 'syncing' && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#1a4b8c]/30 bg-[#1a4b8c]/5 animate-in fade-in duration-200">
                    <Loader2 className="w-5 h-5 text-[#1a4b8c] animate-spin shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-[#1a4b8c]">Synchronisation des données...</p>
                        <p className="text-xs text-[#1a4b8c]/70">Indexation des fichiers et mise à jour des années disponibles</p>
                    </div>
                </div>
            )}

            {syncPhase === 'done' && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-green-300 bg-green-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-green-700">Fichiers intégrés avec succès</p>
                        <p className="text-xs text-green-600">Les données sont prêtes pour la génération. Sélectionnez une année et lancez.</p>
                    </div>
                    <button onClick={() => setSyncPhase('idle')} className="text-xs text-green-500 hover:text-green-700 shrink-0">Fermer</button>
                </div>
            )}

            {/* Drop Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
                    syncPhase === 'syncing'
                        ? "border-[#1a4b8c]/30 bg-[#1a4b8c]/5 pointer-events-none opacity-60"
                        : dragActive
                            ? "border-[#1a4b8c] bg-[#1a4b8c]/5 scale-[1.01]"
                            : "border-gray-300 hover:border-[#3bb3a9] hover:bg-gray-50"
                )}
                onClick={() => syncPhase !== 'syncing' && document.getElementById('csv-file-input')?.click()}
            >
                <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-[#1a4b8c] animate-spin" />
                        <p className="text-sm font-medium text-[#1a4b8c]">Import en cours...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className={cn("w-8 h-8", dragActive ? "text-[#1a4b8c]" : "text-gray-400")} />
                        <p className="text-sm font-medium text-gray-600">
                            Glissez-déposez vos fichiers ici
                        </p>
                        <p className="text-xs text-gray-400">
                            Formats acceptés : <strong>.csv</strong>, <strong>.xlsx</strong>, <strong>.xls</strong> — Import multiple possible
                        </p>
                        {allPresent && (
                            <p className="text-xs text-blue-500 mt-1">
                                Vous pouvez ré-importer des fichiers pour mettre à jour les données existantes.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Result */}
            {uploadResult && (
                <div className={cn(
                    "px-3 py-2 rounded-lg text-sm animate-in fade-in slide-in-from-bottom-1",
                    uploadResult.success
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                )}>
                    <div className="flex items-center gap-2">
                        {uploadResult.success ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                        )}
                        <span className="font-medium">{uploadResult.message || uploadResult.error}</span>
                    </div>
                    {/* Show converted files */}
                    {uploadResult.converted && uploadResult.converted.length > 0 && (
                        <div className="mt-1.5 ml-6 text-xs space-y-0.5">
                            {uploadResult.converted.map((c, i) => (
                                <div key={i} className="text-green-600">
                                    <FileSpreadsheet className="w-3 h-3 inline mr-1" />
                                    {c.original} → {c.csv}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Show skipped files */}
                    {uploadResult.skipped && uploadResult.skipped.length > 0 && (
                        <div className="mt-1.5 ml-6 text-xs space-y-0.5">
                            {uploadResult.skipped.map((s, i) => (
                                <div key={i} className="text-amber-600">
                                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                                    {s.file} : {s.reason}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Import History */}
            {importHistory.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1a4b8c] transition-colors"
                    >
                        <Clock className="w-3.5 h-3.5" />
                        Historique des imports ({importHistory.length})
                        <ChevronDown className={cn("w-3 h-3 transition-transform", showHistory && "rotate-180")} />
                    </button>

                    {showHistory && (
                        <div className="mt-2 space-y-1.5 max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                            {importHistory.slice(0, 20).map((entry) => (
                                <div key={entry.id} className="flex items-start gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs">
                                    <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">
                                                {new Date(entry.timestamp).toLocaleDateString('fr-FR', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="text-gray-400">par</span>
                                            <span className="font-medium text-[#1a4b8c]">{entry.user || 'anonyme'}</span>
                                        </div>
                                        <div className="text-gray-500 truncate">
                                            {entry.count} fichier(s) : {entry.files.slice(0, 3).join(', ')}
                                            {entry.files.length > 3 && ` +${entry.files.length - 3} autre(s)`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
