import { useEffect, useRef, useState } from "react";
import { FileImage, FileDown, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getReportData, type ReportSheet } from "../../services/api";
import { ReportCharts } from "./ReportCharts";

/**
 * Rapport de synthèse téléchargeable (PDF / PNG).
 *
 * Rendu 100% frontend, stylé en inline-styles (hex/rgb) pour garantir une
 * capture html2canvas fidèle : Tailwind v4 génère des couleurs `oklch` que
 * html2canvas ne sait pas parser. On reproduit ici la charte de l'app
 * (bleu #1a4b8c, teal #3bb3a9, vert #4caf50) sans dépendre de Tailwind.
 */

interface ReportIndicator {
    id: string;
    variable: string;
    label: string;
    source?: string;
    demoReady?: boolean;
}

interface ReportPreviewProps {
    themeLabel: string;
    subjectLabel: string;
    indicators: ReportIndicator[];
    year: string;
    sourceMode: "opendata" | "moca";
    format: string;
    generatedFiles: string[];
}

const COLORS = {
    blue: "#1a4b8c",
    teal: "#3bb3a9",
    green: "#4caf50",
    ink: "#1f2937",
    sub: "#6b7280",
    line: "#e5e7eb",
    light: "#f8fafc",
};

function cleanSource(source?: string): string {
    if (!source) return "—";
    return source.split(",")[0].split("/")[0].trim() || "—";
}

export function ReportPreview({
    themeLabel,
    subjectLabel,
    indicators,
    year,
    sourceMode,
    format,
    generatedFiles,
}: ReportPreviewProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState<"png" | "pdf" | null>(null);
    const [sheets, setSheets] = useState<ReportSheet[] | null>(null);

    // Charge les donnees du 1er fichier genere pour la dataviz.
    useEffect(() => {
        const file = generatedFiles[0];
        if (!file) return;
        let cancelled = false;
        getReportData(file)
            .then((res) => {
                if (!cancelled && res.success && res.sheets) setSheets(res.sheets);
            })
            .catch(() => {
                /* dataviz optionnelle : on garde le rapport metadonnees seul */
            });
        return () => {
            cancelled = true;
        };
    }, [generatedFiles]);

    const today = new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const sourceLabel = sourceMode === "opendata" ? "Open Data (sources publiques)" : "MOCA-O (fichiers internes)";
    const formatLabel = format === "consolidated" ? "MOCA-O Consolidé (.xlsx)" : "Pack Complet (.zip)";

    const safeName = `Rapport_${subjectLabel || "synthese"}_${year || ""}`
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .replace(/_+/g, "_");

    async function capture(): Promise<HTMLCanvasElement | null> {
        if (!reportRef.current) return null;
        return html2canvas(reportRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
        });
    }

    async function handlePng() {
        setBusy("png");
        try {
            const canvas = await capture();
            if (!canvas) return;
            const link = document.createElement("a");
            link.download = `${safeName}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } finally {
            setBusy(null);
        }
    }

    async function handlePdf() {
        setBusy("pdf");
        try {
            const canvas = await capture();
            if (!canvas) return;
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const imgH = (canvas.height * pageW) / canvas.width;
            // Une seule page A4 : si trop haut, on contraint à la hauteur de page.
            const finalH = Math.min(imgH, pageH);
            const finalW = (canvas.width * finalH) / canvas.height;
            const x = (pageW - finalW) / 2;
            pdf.addImage(imgData, "PNG", x, 0, finalW, finalH);
            pdf.save(`${safeName}.pdf`);
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="w-full">
            {/* Action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-[#1a4b8c]">Rapport de synthèse</h3>
                    <p className="text-sm text-gray-500">
                        Pour insertion dans un PowerPoint ou un Word.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePng}
                        disabled={busy !== null}
                        className="flex items-center gap-2 bg-white border-2 border-[#3bb3a9] text-[#2f9a91] hover:bg-[#3bb3a9]/5 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {busy === "png" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileImage className="w-4 h-4" />}
                        Télécharger PNG
                    </button>
                    <button
                        onClick={handlePdf}
                        disabled={busy !== null}
                        className="flex items-center gap-2 bg-[#1a4b8c] hover:bg-[#15396b] text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {busy === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                        Télécharger PDF
                    </button>
                </div>
            </div>

            {/* A4 report — inline styles for faithful html2canvas capture */}
            <div className="overflow-x-auto pb-2">
                <div
                    ref={reportRef}
                    style={{
                        width: "794px", // A4 @96dpi
                        minHeight: "1123px",
                        backgroundColor: "#ffffff",
                        color: COLORS.ink,
                        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                        margin: "0 auto",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header band */}
                    <div
                        style={{
                            background: `linear-gradient(135deg, ${COLORS.blue} 0%, #14365f 100%)`,
                            color: "#ffffff",
                            padding: "40px 48px 32px",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
                                    Data Visus · ORSG-CTPS
                                </div>
                                <div style={{ fontSize: "13px", marginTop: "2px", color: "rgba(255,255,255,0.55)" }}>
                                    Observatoire Régional de la Santé de Guyane
                                </div>
                            </div>
                            <div style={{ textAlign: "right", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                                Édité le {today}
                            </div>
                        </div>

                        <div style={{ marginTop: "28px" }}>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: COLORS.teal, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                {themeLabel || "Indicateur de santé"}
                            </div>
                            <h1 style={{ fontSize: "34px", fontWeight: 800, margin: "6px 0 0", lineHeight: 1.15 }}>
                                {subjectLabel || "Rapport de données"}
                            </h1>
                        </div>
                    </div>

                    {/* Key facts strip */}
                    <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.line}` }}>
                        {[
                            { label: "Année de référence", value: year || "—" },
                            { label: "Indicateurs", value: String(indicators.length) },
                            { label: "Fichiers générés", value: String(generatedFiles.length) },
                        ].map((kf, i) => (
                            <div
                                key={kf.label}
                                style={{
                                    flex: 1,
                                    padding: "24px 32px",
                                    borderRight: i < 2 ? `1px solid ${COLORS.line}` : "none",
                                }}
                            >
                                <div style={{ fontSize: "32px", fontWeight: 800, color: COLORS.blue, lineHeight: 1 }}>
                                    {kf.value}
                                </div>
                                <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.sub, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "6px" }}>
                                    {kf.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Body */}
                    <div style={{ padding: "32px 48px", flex: 1 }}>
                        {/* Config summary */}
                        <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                            <div style={{ flex: 1, backgroundColor: COLORS.light, borderRadius: "10px", padding: "16px 18px", border: `1px solid ${COLORS.line}` }}>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>Source des données</div>
                                <div style={{ fontSize: "15px", fontWeight: 700, color: COLORS.ink, marginTop: "4px" }}>{sourceLabel}</div>
                            </div>
                            <div style={{ flex: 1, backgroundColor: COLORS.light, borderRadius: "10px", padding: "16px 18px", border: `1px solid ${COLORS.line}` }}>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>Format de sortie</div>
                                <div style={{ fontSize: "15px", fontWeight: 700, color: COLORS.ink, marginTop: "4px" }}>{formatLabel}</div>
                            </div>
                        </div>

                        {/* Indicators table */}
                        <div style={{ fontSize: "16px", fontWeight: 800, color: COLORS.blue, marginBottom: "12px" }}>
                            Indicateurs inclus
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ backgroundColor: COLORS.blue, color: "#ffffff" }}>
                                    <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, borderTopLeftRadius: "8px" }}>Indicateur</th>
                                    <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700 }}>Source</th>
                                    <th style={{ textAlign: "center", padding: "10px 14px", fontWeight: 700, borderTopRightRadius: "8px" }}>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {indicators.map((d, i) => (
                                    <tr key={`${d.id}-${d.variable}-${i}`} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : COLORS.light }}>
                                        <td style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.line}`, color: COLORS.ink, fontWeight: 600 }}>
                                            {d.label}
                                        </td>
                                        <td style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.line}`, color: COLORS.sub }}>
                                            {cleanSource(d.source)}
                                        </td>
                                        <td style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.line}`, textAlign: "center" }}>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    fontSize: "11px",
                                                    fontWeight: 700,
                                                    padding: "3px 10px",
                                                    borderRadius: "999px",
                                                    color: d.demoReady ? "#1b5e20" : "#92400e",
                                                    backgroundColor: d.demoReady ? "#e8f5e9" : "#fef3c7",
                                                }}
                                            >
                                                {d.demoReady ? "Données prêtes" : "À alimenter"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {indicators.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: "16px 14px", color: COLORS.sub, textAlign: "center", borderBottom: `1px solid ${COLORS.line}` }}>
                                            Aucun indicateur.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Generated files */}
                        {generatedFiles.length > 0 && (
                            <div style={{ marginTop: "32px" }}>
                                <div style={{ fontSize: "16px", fontWeight: 800, color: COLORS.blue, marginBottom: "12px" }}>
                                    Fichiers Excel générés
                                </div>
                                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                                    {generatedFiles.map((f) => (
                                        <li
                                            key={f}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                fontSize: "13px",
                                                color: COLORS.ink,
                                                padding: "8px 0",
                                                borderBottom: `1px solid ${COLORS.line}`,
                                            }}
                                        >
                                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: COLORS.green, flexShrink: 0 }} />
                                            <span style={{ wordBreak: "break-all" }}>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Visualisation des donnees (graphiques recharts) */}
                    {sheets && sheets.length > 0 && (
                        <div style={{ borderTop: `1px solid ${COLORS.line}` }}>
                            <ReportCharts sheets={sheets} />
                        </div>
                    )}

                    {/* Footer */}
                    <div
                        style={{
                            borderTop: `2px solid ${COLORS.teal}`,
                            padding: "18px 48px 28px",
                            fontSize: "11px",
                            color: COLORS.sub,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span>
                            Source : {sourceLabel} · Année {year || "—"}
                        </span>
                        <span style={{ fontWeight: 700, color: COLORS.blue }}>Data Visus · ORSG-CTPS</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
