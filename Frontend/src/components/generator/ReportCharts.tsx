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
 *  - plusieurs annees  -> evolution temporelle (AreaChart)
 *  - plusieurs territoires -> comparaison (BarChart horizontal, top 10)
 *  - chiffres cles : region, min, max
 */

const COLORS = {
    blue: "#1a4b8c",
    teal: "#3bb3a9",
    green: "#4caf50",
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
    "03": "Guyane",
    "04": "La Reunion",
    "01": "Guadeloupe",
    "02": "Martinique",
    "06": "Mayotte",
};

interface ReportChartsProps {
    sheets: ReportSheet[];
}

type Row = Record<string, string | number | null>;

function isNumeric(v: unknown): v is number {
    return typeof v === "number" && Number.isFinite(v);
}

// Detecte la colonne libelle geo (1ere), la colonne annee, et les variables numeriques.
function analyzeSheet(sheet: ReportSheet) {
    const cols = sheet.columns;
    const geoCol = cols[0];
    const yearCol = cols.find((c) => c.toLowerCase() === "annee");
    const valueCols = cols.filter((c) => c !== geoCol && c !== yearCol);
    return { geoCol, yearCol, valueCols };
}

function labelForGeo(code: string, sheetName: string): string {
    const c = String(code);
    if (COMMUNE_LABELS[c]) return COMMUNE_LABELS[c];
    if (REGION_LABELS[c]) return REGION_LABELS[c];
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

export function ReportCharts({ sheets }: ReportChartsProps) {
    const model = useMemo(() => {
        if (!sheets || sheets.length === 0) return null;

        // Feuille communes en priorite (detail territorial), sinon la 1ere.
        const comSheet = sheets.find((s) => s.name === "com") || sheets[0];
        const { geoCol, yearCol, valueCols } = analyzeSheet(comSheet);
        if (valueCols.length === 0) return null;

        const valueCol = valueCols[0];
        const rows = comSheet.rows.filter((r) => isNumeric(r[valueCol]));

        // Annees distinctes (pour decider temporel vs territorial)
        const years = yearCol
            ? Array.from(new Set(rows.map((r) => r[yearCol]).filter((y) => y != null))).sort()
            : [];

        // Serie temporelle : agregation par annee (somme des communes)
        let temporal: Array<{ year: string; value: number }> = [];
        if (yearCol && years.length > 1) {
            const byYear = new Map<string, number>();
            for (const r of rows) {
                const y = String(r[yearCol]);
                const v = r[valueCol] as number;
                byYear.set(y, (byYear.get(y) || 0) + v);
            }
            temporal = Array.from(byYear.entries())
                .map(([year, value]) => ({ year, value }))
                .sort((a, b) => a.year.localeCompare(b.year));
        }

        // Comparaison territoriale : top 10 communes sur la derniere annee dispo
        const lastYear = years.length ? String(years[years.length - 1]) : null;
        const territoryRows = lastYear && yearCol ? rows.filter((r) => String(r[yearCol]) === lastYear) : rows;
        const territorial = territoryRows
            .map((r: Row) => ({
                name: labelForGeo(String(r[geoCol]), comSheet.name),
                value: r[valueCol] as number,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        // Chiffres cles
        const regSheet = sheets.find((s) => s.name === "reg");
        let regionValue: number | null = null;
        if (regSheet) {
            const ana = analyzeSheet(regSheet);
            const target = lastYear && ana.yearCol
                ? regSheet.rows.filter((r) => String(r[ana.yearCol!]) === lastYear)
                : regSheet.rows;
            const guyane = target.find((r) => String(r[ana.geoCol]) === "03");
            const pick = guyane || target[0];
            if (pick && isNumeric(pick[valueCol])) regionValue = pick[valueCol] as number;
        }

        const allValues = territoryRows.map((r) => r[valueCol] as number).filter(isNumeric);
        const maxRow = territorial[0] || null;
        const minRow = territorial.length ? territorial[territorial.length - 1] : null;
        const minVal = allValues.length ? Math.min(...allValues) : null;
        const minName =
            minVal != null
                ? labelForGeo(String(territoryRows.find((r) => r[valueCol] === minVal)?.[geoCol] ?? ""), comSheet.name)
                : null;

        return {
            valueLabel: humanizeVar(valueCol),
            year: lastYear,
            temporal,
            territorial,
            regionValue,
            maxRow,
            minRow: minVal != null ? { name: minName || (minRow && minRow.name) || "—", value: minVal } : null,
        };
    }, [sheets]);

    if (!model) return null;

    const hasTemporal = model.temporal.length > 1;
    const hasTerritorial = model.territorial.length > 1;
    const barHeight = Math.max(220, model.territorial.length * 34);

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
            <div style={{ display: "flex", gap: "14px", marginBottom: "24px" }}>
                {model.regionValue != null && (
                    <KeyCard label="Total Guyane" value={fmt(model.regionValue)} accent={COLORS.blue} />
                )}
                {model.maxRow && (
                    <KeyCard label={`Maximum · ${model.maxRow.name}`} value={fmt(model.maxRow.value)} accent={COLORS.teal} />
                )}
                {model.minRow && (
                    <KeyCard label={`Minimum · ${model.minRow.name}`} value={fmt(model.minRow.value)} accent={COLORS.green} />
                )}
            </div>

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

            {/* Comparaison territoriale */}
            {hasTerritorial && (
                <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.ink, marginBottom: "8px" }}>
                        Comparaison par commune (top {model.territorial.length})
                    </div>
                    <div style={{ backgroundColor: COLORS.light, border: `1px solid ${COLORS.line}`, borderRadius: "10px", padding: "12px 8px" }}>
                        <ResponsiveContainer width="100%" height={barHeight}>
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
