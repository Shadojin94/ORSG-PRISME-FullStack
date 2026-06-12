import { useMemo } from "react";
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import type { ReportSheet } from "../../services/api";

/**
 * Visualisation des donnees du fichier genere, pour le rapport de synthese.
 *
 * Styles 100% inline (hex) : la zone est capturee par html2canvas qui ne sait
 * pas parser les couleurs `oklch` de Tailwind v4. Recharts rend du SVG inline,
 * capture par html2canvas sans conversion supplementaire.
 *
 * Choix automatique :
 *  - feuille `com` exploitable -> detail communal (top 10, evolution, chiffres cles Guyane)
 *  - sinon donnees reg/fra/fh -> vue regionale/nationale (France entiere, comparatif regions)
 *  - section masquee si aucune donnee exploitable (cf. hasContent plus bas)
 */

const COLORS = {
    blue: "#1a4b8c",
    teal: "#3bb3a9",
    green: "#4caf50",
    grey: "#cbd5e1",
    ink: "#1f2937",
    sub: "#6b7280",
    line: "#e5e7eb",
    light: "#f8fafc",
};

// Libelles des communes de Guyane (codes INSEE 973xx) pour un rendu lisible.
const COMMUNE_LABELS: Record<string, string> = {
    "97301": "Regina",
    "97302": "Cayenne",
    "97303": "Iracoubo",
    "97304": "Kourou",
    "97305": "Macouria",
    "97306": "Mana",
    "97307": "Matoury",
    "97308": "Saint-Georges",
    "97309": "Remire-Montjoly",
    "97310": "Roura",
    "97311": "Saint-Laurent-du-Maroni",
    "97312": "Sinnamary",
    "97313": "Montsinery-Tonnegrande",
    "97314": "Ouanary",
    "97352": "Saul",
    "97353": "Maripasoula",
    "97356": "Grand-Santi",
    "97357": "Saint-Elie",
    "97358": "Apatou",
    "97360": "Awala-Yalimapo",
    "97361": "Camopi",
    "97362": "Papaichton",
};

const REGION_LABELS: Record<string, string> = {
    "01": "Guadeloupe",
    "02": "Martinique",
    "03": "Guyane",
    "04": "La Reunion",
    "06": "Mayotte",
};

// Codes reg pouvant designer la Guyane selon les fichiers (3 / 03 / 973).
const GUYANE_CODES = new Set(["3", "03", "973"]);

interface ReportChartsProps {
    sheets: ReportSheet[];
}

type Row = Record<string, string | number | null>;

// Parse robuste : nombre direct, ou string avec virgule decimale / espaces / vide.
function toNum(v: unknown): number | null {
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string") {
        const s = v.trim().replace(/\s/g, "").replace(",", ".");
        if (s === "") return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
    }
    return null;
}

// Detecte la colonne libelle geo (1ere), la colonne annee, et les variables numeriques.
function analyzeSheet(sheet: ReportSheet) {
    const cols = sheet.columns;
    const geoCol = cols[0];
    const yearCol = cols.find((c) => c.toLowerCase() === "annee");
    const valueCols = cols.filter((c) => c !== geoCol && c !== yearCol);
    return { geoCol, yearCol, valueCols };
}

// Trouve la 1ere colonne valeur qui contient au moins une valeur numerique exploitable.
function pickValueCol(sheet: ReportSheet, valueCols: string[]): string | null {
    for (const c of valueCols) {
        if (sheet.rows.some((r) => toNum(r[c]) != null)) return c;
    }
    return null;
}

function normRegCode(code: string): string {
    const c = String(code).trim();
    return GUYANE_CODES.has(c) ? "03" : c.padStart(2, "0");
}

function labelForGeo(code: string, sheetName: string): string {
    const c = String(code);
    if (COMMUNE_LABELS[c]) return COMMUNE_LABELS[c];
    const reg = normRegCode(c);
    if (REGION_LABELS[reg]) return REGION_LABELS[reg];
    if (sheetName === "dom") return "DOM";
    if (sheetName === "fh") return "France hexagonale";
    if (sheetName === "fra") return "France entiere";
    return c;
}

// Format compact lisible (12 345, 1,2 M...)
function fmt(input: number | string | undefined): string {
    const n = typeof input === "number" ? input : Number(input);
    if (!Number.isFinite(n)) return "—";
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + " M";
    if (abs >= 1000) return Math.round(n).toLocaleString("fr-FR");
    if (Number.isInteger(n)) return n.toLocaleString("fr-FR");
    return n.toFixed(2).replace(".", ",");
}

// Humanise un nom de variable technique (nb_alloc -> "Nb alloc").
function humanizeVar(v: string): string {
    const s = v.replace(/_/g, " ").trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Recupere la valeur Guyane (ou 1ere ligne) d'une feuille reg, sur la derniere annee si dispo.
function regionPick(
    sheet: ReportSheet,
    lastYear: string | null,
): { valueLabel: string; value: number } | null {
    const { geoCol, yearCol, valueCols } = analyzeSheet(sheet);
    const valueCol = pickValueCol(sheet, valueCols);
    if (!valueCol) return null;
    const target =
        lastYear && yearCol ? sheet.rows.filter((r) => String(r[yearCol]) === lastYear) : sheet.rows;
    const guyane = target.find((r) => normRegCode(String(r[geoCol])) === "03");
    const pick = guyane || target.find((r) => toNum(r[valueCol]) != null);
    const v = pick ? toNum(pick[valueCol]) : null;
    return v != null ? { valueLabel: humanizeVar(valueCol), value: v } : null;
}

export function ReportCharts({ sheets }: ReportChartsProps) {
    const model = useMemo(() => {
        if (!sheets || sheets.length === 0) return null;

        const comSheet = sheets.find((s) => s.name === "com");
        const regSheet = sheets.find((s) => s.name === "reg");
        const fraSheet = sheets.find((s) => s.name === "fra");
        const fhSheet = sheets.find((s) => s.name === "fh");

        // ---------- Mode communal ----------
        let temporal: Array<{ year: string; value: number }> = [];
        let territorial: Array<{ name: string; value: number }> = [];
        let valueLabel = "";
        let lastYear: string | null = null;
        let guyaneTotal: number | null = null;
        let maxRow: { name: string; value: number } | null = null;
        let minRow: { name: string; value: number } | null = null;

        if (comSheet) {
            const { geoCol, yearCol, valueCols } = analyzeSheet(comSheet);
            const valueCol = pickValueCol(comSheet, valueCols);
            if (valueCol) {
                valueLabel = humanizeVar(valueCol);
                const rows = comSheet.rows.filter((r) => toNum(r[valueCol]) != null);

                const years = yearCol
                    ? Array.from(new Set(rows.map((r) => r[yearCol]).filter((y) => y != null)))
                          .map(String)
                          .sort()
                    : [];
                lastYear = years.length ? years[years.length - 1] : null;

                if (yearCol && years.length > 1) {
                    const byYear = new Map<string, number>();
                    for (const r of rows) {
                        const y = String(r[yearCol]);
                        byYear.set(y, (byYear.get(y) || 0) + (toNum(r[valueCol]) as number));
                    }
                    temporal = Array.from(byYear.entries())
                        .map(([year, value]) => ({ year, value }))
                        .sort((a, b) => a.year.localeCompare(b.year));
                }

                const territoryRows =
                    lastYear && yearCol ? rows.filter((r) => String(r[yearCol]) === lastYear) : rows;
                const ranked = territoryRows
                    .map((r: Row) => ({
                        name: labelForGeo(String(r[geoCol]), comSheet.name),
                        value: toNum(r[valueCol]) as number,
                    }))
                    .sort((a, b) => b.value - a.value);
                territorial = ranked.slice(0, 10);
                maxRow = ranked[0] || null;
                minRow = ranked.length ? ranked[ranked.length - 1] : null;

                // Total Guyane via feuille reg si presente, sinon somme des communes.
                if (regSheet) {
                    const rp = regionPick(regSheet, lastYear);
                    if (rp) guyaneTotal = rp.value;
                }
                if (guyaneTotal == null) {
                    const sum = territoryRows.reduce((acc, r) => acc + (toNum(r[valueCol]) as number), 0);
                    guyaneTotal = territoryRows.length ? sum : null;
                }
            }
        }

        // ---------- Vue France entiere + comparatif regions ----------
        let franceTotal: number | null = null;
        let regional: Array<{ name: string; value: number; isGuyane: boolean }> = [];

        // Annee de reference : celle du communal, sinon derniere annee dispo en reg.
        let refYear = lastYear;
        if (!refYear && regSheet) {
            const ana = analyzeSheet(regSheet);
            if (ana.yearCol) {
                const ys = Array.from(
                    new Set(regSheet.rows.map((r) => r[ana.yearCol!]).filter((y) => y != null)),
                )
                    .map(String)
                    .sort();
                refYear = ys.length ? ys[ys.length - 1] : null;
            }
        }

        // France entiere : feuille fra en priorite, sinon fh.
        const franceSheet = fraSheet || fhSheet;
        if (franceSheet) {
            const rp = regionPick(franceSheet, refYear);
            if (rp) {
                franceTotal = rp.value;
                if (!valueLabel) valueLabel = rp.valueLabel;
            }
        }

        // Comparatif des regions (si la feuille reg a plusieurs regions remplies).
        if (regSheet) {
            const { geoCol, yearCol, valueCols } = analyzeSheet(regSheet);
            const valueCol = pickValueCol(regSheet, valueCols);
            if (valueCol) {
                if (!valueLabel) valueLabel = humanizeVar(valueCol);
                const target =
                    refYear && yearCol
                        ? regSheet.rows.filter((r) => String(r[yearCol]) === refYear)
                        : regSheet.rows;
                regional = target
                    .map((r: Row) => {
                        const v = toNum(r[valueCol]);
                        const reg = normRegCode(String(r[geoCol]));
                        return v != null
                            ? { name: labelForGeo(String(r[geoCol]), "reg"), value: v, isGuyane: reg === "03" }
                            : null;
                    })
                    .filter((x): x is { name: string; value: number; isGuyane: boolean } => x != null)
                    .sort((a, b) => b.value - a.value);

                // Total Guyane : si on n'avait pas de communal, recupere ici.
                if (guyaneTotal == null) {
                    const g = regional.find((r) => r.isGuyane);
                    if (g) guyaneTotal = g.value;
                }
            }
        }

        return {
            valueLabel: valueLabel || "Donnees",
            year: refYear,
            temporal,
            territorial,
            regional,
            guyaneTotal,
            franceTotal,
            maxRow,
            minRow,
        };
    }, [sheets]);

    if (!model) return null;

    const hasTemporal = model.temporal.length > 1;
    const hasTerritorial = model.territorial.length > 1;
    const hasRegional = model.regional.length > 1;
    const hasKeyCard =
        model.guyaneTotal != null ||
        model.franceTotal != null ||
        model.maxRow != null ||
        model.minRow != null;

    // Masquage : section affichee seulement s'il existe au moins une carte chiffre cle
    // OU un graphe avec >=2 points de donnees.
    const hasContent = hasKeyCard || hasTemporal || hasTerritorial || hasRegional;
    if (!hasContent) return null;

    const territoryBarHeight = Math.max(220, model.territorial.length * 34);
    const regionalBarHeight = Math.max(200, model.regional.length * 34);

    return (
        <div style={{ padding: "28px 48px 8px" }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: COLORS.blue, marginBottom: "4px" }}>
                Visualisation des donnees
            </div>
            <div style={{ fontSize: "12px", color: COLORS.sub, marginBottom: "20px" }}>
                {model.valueLabel}
                {model.year ? ` · annee ${model.year}` : ""}
            </div>

            {/* Cartes de chiffres cles */}
            {hasKeyCard && (
                <div style={{ display: "flex", gap: "14px", marginBottom: "24px" }}>
                    {model.guyaneTotal != null && (
                        <KeyCard label="Total Guyane" value={fmt(model.guyaneTotal)} accent={COLORS.blue} />
                    )}
                    {model.franceTotal != null && (
                        <KeyCard label="France entiere" value={fmt(model.franceTotal)} accent={COLORS.teal} />
                    )}
                    {model.maxRow && (
                        <KeyCard label={`Maximum · ${model.maxRow.name}`} value={fmt(model.maxRow.value)} accent={COLORS.teal} />
                    )}
                    {model.minRow && (
                        <KeyCard label={`Minimum · ${model.minRow.name}`} value={fmt(model.minRow.value)} accent={COLORS.green} />
                    )}
                </div>
            )}

            {/* Evolution temporelle */}
            {hasTemporal && (
                <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.ink, marginBottom: "8px" }}>
                        Evolution dans le temps
                    </div>
                    <div style={{ backgroundColor: COLORS.light, border: `1px solid ${COLORS.line}`, borderRadius: "10px", padding: "12px 8px 4px" }}>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={model.temporal} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="repArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.85} />
                                        <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.08} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} />
                                <XAxis dataKey="year" tick={{ fontSize: 12, fill: COLORS.sub }} />
                                <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: COLORS.sub }} width={56} />
                                <Tooltip formatter={(v) => fmt(v as number)} labelFormatter={(l) => `Annee ${l}`} />
                                <Area type="monotone" dataKey="value" stroke={COLORS.blue} strokeWidth={2} fill="url(#repArea)" isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Comparaison territoriale (communes) */}
            {hasTerritorial && (
                <div style={{ marginBottom: hasRegional ? "24px" : 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.ink, marginBottom: "8px" }}>
                        Comparaison par commune (top {model.territorial.length})
                    </div>
                    <div style={{ backgroundColor: COLORS.light, border: `1px solid ${COLORS.line}`, borderRadius: "10px", padding: "12px 8px" }}>
                        <ResponsiveContainer width="100%" height={territoryBarHeight}>
                            <BarChart data={model.territorial} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} horizontal={false} />
                                <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 11, fill: COLORS.sub }} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={150}
                                    tick={{ fontSize: 12, fill: COLORS.ink }}
                                />
                                <Tooltip formatter={(v) => fmt(v as number)} cursor={{ fill: "rgba(26,75,140,0.06)" }} />
                                <Bar dataKey="value" radius={[0, 5, 5, 0]} isAnimationActive={false} label={{ position: "right", fontSize: 11, fill: COLORS.sub, formatter: ((v: unknown) => fmt(v as number)) as never }}>
                                    {model.territorial.map((_, i) => (
                                        <Cell key={i} fill={i === 0 ? COLORS.blue : COLORS.teal} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Comparaison regionale (Guyane mise en avant) */}
            {hasRegional && (
                <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.ink, marginBottom: "8px" }}>
                        Comparaison par region
                    </div>
                    <div style={{ backgroundColor: COLORS.light, border: `1px solid ${COLORS.line}`, borderRadius: "10px", padding: "12px 8px" }}>
                        <ResponsiveContainer width="100%" height={regionalBarHeight}>
                            <BarChart data={model.regional} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} horizontal={false} />
                                <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 11, fill: COLORS.sub }} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={150}
                                    tick={{ fontSize: 12, fill: COLORS.ink }}
                                />
                                <Tooltip formatter={(v) => fmt(v as number)} cursor={{ fill: "rgba(26,75,140,0.06)" }} />
                                <Bar dataKey="value" radius={[0, 5, 5, 0]} isAnimationActive={false} label={{ position: "right", fontSize: 11, fill: COLORS.sub, formatter: ((v: unknown) => fmt(v as number)) as never }}>
                                    {model.regional.map((r, i) => (
                                        <Cell key={i} fill={r.isGuyane ? COLORS.blue : COLORS.grey} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

function KeyCard({ label, value, accent }: { label: string; value: string; accent: string }) {
    return (
        <div
            style={{
                flex: 1,
                backgroundColor: "#ffffff",
                border: `1px solid ${COLORS.line}`,
                borderLeft: `4px solid ${accent}`,
                borderRadius: "10px",
                padding: "16px 18px",
            }}
        >
            <div style={{ fontSize: "24px", fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
            <div
                style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: COLORS.sub,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginTop: "6px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {label}
            </div>
        </div>
    );
}
