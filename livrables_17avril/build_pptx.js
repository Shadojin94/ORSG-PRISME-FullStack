// Build PRISME / ORSG - Point projet 17 avril 2026 (v2 - 11 slides, tarifs N.O.V.I. Connected)
const path = require("path");
const pptxgen = require(path.join("C:", "Users", "chad9", "AppData", "Roaming", "npm", "node_modules", "pptxgenjs"));

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "N.O.V.I. Connected - Cedric Atticot";
pres.company = "N.O.V.I. Connected";
pres.title = "PRISME - Point projet ORSG - 17 avril 2026";
pres.subject = "Plateforme Sante ORSG";

// Charte ORSG
const C = {
  navy: "1A4B8C",
  teal: "3BB3A9",
  green: "4CAF50",
  amber: "D97706",
  textGray: "374151",
  bg: "F8FAFC",
  white: "FFFFFF",
  mutedBorder: "E2E8F0",
  softNavy: "2E5FA6",
  subtle: "64748B",
  cardBg: "FFFFFF",
  softTeal: "E6F6F4",
  softNavyBg: "EFF6FF",
  softAmber: "FEF3C7",
  softGreen: "E8F5E9",
};

const SW = 13.3; // slide width
const SH = 7.5;  // slide height
const TOTAL = 11;

const F = {
  head: "Georgia",
  body: "Calibri",
};

// ---------- helpers ----------
function headerBar(slide) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: SW, h: 0.12, fill: { color: C.teal }, line: { color: C.teal, width: 0 },
  });
  slide.addText(
    [
      { text: "ORSG", options: { bold: true, color: C.navy } },
      { text: "   |   ", options: { color: C.subtle } },
      { text: "Observatoire Regional de la Sante de Guyane", options: { color: C.subtle } },
    ],
    { x: 0.5, y: 0.2, w: 9, h: 0.35, fontFace: F.body, fontSize: 11, margin: 0 }
  );
  slide.addText("PRISME - Plateforme Sante", {
    x: 8.0, y: 0.2, w: 4.8, h: 0.35, align: "right",
    fontFace: F.body, fontSize: 10, color: C.teal, italic: true, margin: 0,
  });
}

function footerBar(slide, pageNum) {
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: SH - 0.45, w: SW - 1.0, h: 0,
    line: { color: C.mutedBorder, width: 0.75 },
  });
  slide.addText("PRISME / ORSG - Point projet - 17 avril 2026", {
    x: 0.5, y: SH - 0.4, w: 8, h: 0.3,
    fontFace: F.body, fontSize: 9, color: C.subtle, margin: 0,
  });
  slide.addText(`${pageNum} / ${TOTAL}`, {
    x: SW - 1.5, y: SH - 0.4, w: 1.0, h: 0.3, align: "right",
    fontFace: F.body, fontSize: 9, color: C.subtle, margin: 0,
  });
  slide.addText("N.O.V.I. Connected", {
    x: SW - 3.3, y: SH - 0.4, w: 1.7, h: 0.3, align: "right",
    fontFace: F.body, fontSize: 9, color: C.navy, bold: true, margin: 0,
  });
}

function slideTitle(slide, titleText, eyebrowText) {
  if (eyebrowText) {
    slide.addText(eyebrowText.toUpperCase(), {
      x: 0.6, y: 0.65, w: 10, h: 0.3,
      fontFace: F.body, fontSize: 11, color: C.teal, bold: true, charSpacing: 4, margin: 0,
    });
  }
  slide.addText(titleText, {
    x: 0.6, y: eyebrowText ? 0.95 : 0.7, w: SW - 1.2, h: 0.8,
    fontFace: F.head, fontSize: 28, color: C.navy, bold: true, margin: 0,
  });
}

// ============================================================
// SLIDE 1 - Couverture
// ============================================================
const s1 = pres.addSlide();
s1.background = { color: C.navy };

s1.addShape(pres.shapes.RECTANGLE, {
  x: 10.2, y: 0, w: 3.1, h: SH,
  fill: { color: C.teal, transparency: 82 }, line: { color: C.teal, width: 0 },
});
s1.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 1.4, w: 0.1, h: 4.6,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});

s1.addText("PRISME", {
  x: 0.9, y: 1.3, w: 11, h: 1.3,
  fontFace: F.head, fontSize: 84, color: C.white, bold: true, charSpacing: 8, margin: 0,
});

s1.addText("Plateforme Sante ORSG", {
  x: 0.9, y: 2.6, w: 11, h: 0.6,
  fontFace: F.body, fontSize: 22, color: C.teal, italic: true, margin: 0,
});

s1.addText("Observatoire Regional de la Sante de Guyane", {
  x: 0.9, y: 3.1, w: 11, h: 0.5,
  fontFace: F.body, fontSize: 14, color: "CBD5E1", margin: 0,
});

s1.addShape(pres.shapes.LINE, {
  x: 0.9, y: 4.1, w: 4.5, h: 0, line: { color: C.teal, width: 1.2 },
});

s1.addText("Point projet client", {
  x: 0.9, y: 4.3, w: 11, h: 0.5,
  fontFace: F.body, fontSize: 18, color: C.white, bold: true, margin: 0,
});

s1.addText("Vendredi 17 avril 2026", {
  x: 0.9, y: 4.85, w: 11, h: 0.5,
  fontFace: F.body, fontSize: 16, color: "CBD5E1", margin: 0,
});

s1.addText(
  [
    { text: "Client : ", options: { color: "94A3B8" } },
    { text: "ORSG-CTPS - Cayenne (Guyane)", options: { color: C.white, bold: true } },
  ],
  { x: 0.9, y: 6.0, w: 8, h: 0.35, fontFace: F.body, fontSize: 12, margin: 0 }
);
s1.addText(
  [
    { text: "Interlocutrice : ", options: { color: "94A3B8" } },
    { text: "Naissa Chateau Remy", options: { color: C.white, bold: true } },
  ],
  { x: 0.9, y: 6.35, w: 8, h: 0.35, fontFace: F.body, fontSize: 12, margin: 0 }
);
s1.addText(
  [
    { text: "Prestataire : ", options: { color: "94A3B8" } },
    { text: "N.O.V.I. Connected - Cedric Atticot", options: { color: C.white, bold: true } },
  ],
  { x: 0.9, y: 6.7, w: 8, h: 0.35, fontFace: F.body, fontSize: 12, margin: 0 }
);

s1.addShape(pres.shapes.RECTANGLE, {
  x: 10.55, y: 6.0, w: 2.35, h: 1.05,
  fill: { color: C.white, transparency: 88 }, line: { color: C.teal, width: 1 },
});
s1.addText("V1.0 - MVP livre", {
  x: 10.55, y: 6.05, w: 2.35, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 10, color: C.teal, bold: true, margin: 0,
});
s1.addText("Production", {
  x: 10.55, y: 6.35, w: 2.35, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 16, color: C.white, bold: true, margin: 0,
});
s1.addText("orsgdemo.console.cercleonline.com", {
  x: 10.55, y: 6.7, w: 2.35, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 8.5, color: "CBD5E1", margin: 0,
});

// ============================================================
// SLIDE 2 - Chiffres cles (5 stats)
// ============================================================
const s2 = pres.addSlide();
s2.background = { color: C.bg };
headerBar(s2);
slideTitle(s2, "Le projet PRISME en cinq chiffres", "Rappel volumetrie");

s2.addText("Plateforme web qui automatise la generation des fichiers Excel Geoclip et des exports Open Data sante sur l'ensemble du territoire guyanais.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.6,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

const stats = [
  { num: "219", label: "indicateurs BDI", sub: "6 domaines - referentiel complet", color: C.navy },
  { num: "14", label: "themes Open Data", sub: "INSEE, CAF, IRCOM, BAAC, CepiDc", color: C.teal },
  { num: "5", label: "niveaux geographiques", sub: "Communes, Region, DOM, France hex, France entiere", color: C.amber },
  { num: "101", label: "exports Excel pre-generes", sub: "disponibilite immediate", color: C.green },
  { num: "928 Mo", label: "donnees sources Open Data", sub: "300+ fichiers collectes et normalises", color: C.softNavy },
];

const cardW = 2.38;
const cardH = 3.5;
const cardY = 2.65;
const gapC = 0.15;
let cxPos = 0.6;

stats.forEach((c) => {
  s2.addShape(pres.shapes.RECTANGLE, {
    x: cxPos, y: cardY, w: cardW, h: cardH,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
  });
  s2.addShape(pres.shapes.RECTANGLE, {
    x: cxPos, y: cardY, w: cardW, h: 0.12,
    fill: { color: c.color }, line: { color: c.color, width: 0 },
  });
  s2.addText(c.num, {
    x: cxPos + 0.1, y: cardY + 0.3, w: cardW - 0.2, h: 1.5, align: "center",
    fontFace: F.head, fontSize: 54, color: c.color, bold: true, margin: 0,
  });
  s2.addText(c.label, {
    x: cxPos + 0.15, y: cardY + 1.85, w: cardW - 0.3, h: 0.5, align: "center",
    fontFace: F.body, fontSize: 13, color: C.navy, bold: true, margin: 0,
  });
  s2.addShape(pres.shapes.LINE, {
    x: cxPos + cardW / 2 - 0.4, y: cardY + 2.4, w: 0.8, h: 0, line: { color: c.color, width: 1.2 },
  });
  s2.addText(c.sub, {
    x: cxPos + 0.15, y: cardY + 2.5, w: cardW - 0.3, h: 0.9, align: "center",
    fontFace: F.body, fontSize: 10.5, color: C.textGray, margin: 0,
  });
  cxPos += cardW + gapC;
});

s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.3, w: SW - 1.2, h: 0.55,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s2.addText(
  [
    { text: "Backend : ", options: { color: C.teal, bold: true } },
    { text: "3 151 lignes Python + Node.js    ", options: { color: C.white } },
    { text: "Frontend : ", options: { color: C.teal, bold: true } },
    { text: "5 799 lignes React/TypeScript    ", options: { color: C.white } },
    { text: "API : ", options: { color: C.teal, bold: true } },
    { text: "18 endpoints REST", options: { color: C.white } },
  ],
  { x: 0.8, y: 6.33, w: SW - 1.6, h: 0.5, fontFace: F.body, fontSize: 11.5, valign: "middle", margin: 0 }
);

footerBar(s2, 2);

// ============================================================
// SLIDE 3 - Architecture technique
// ============================================================
const s3 = pres.addSlide();
s3.background = { color: C.bg };
headerBar(s3);
slideTitle(s3, "Architecture technique : un systeme, cinq briques", "Vue technique");

s3.addText("Stack moderne, open-source, deploiement continu depuis GitHub. Aucune dependance a un editeur proprietaire.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.5,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

const bricks = [
  { t: "Frontend", tech: "React / TypeScript", role: "Interface, selection des indicateurs, assistant en 3 etapes", color: C.teal },
  { t: "Backend", tech: "Node.js", role: "API REST 18 endpoints, gestion des jobs, service fichiers", color: C.navy },
  { t: "Moteur", tech: "Python", role: "Generation Excel, Open Data, 3 151 lignes metier", color: C.amber },
  { t: "Auth & BDD", tech: "PocketBase", role: "Authentification OTP/password, utilisateurs, tickets", color: C.green },
  { t: "Deploiement", tech: "Coolify / Docker", role: "Auto-deploy sur push GitHub, VPS cercleonline", color: C.softNavy },
];

const boxW = 2.32;
const boxH = 3.1;
const boxY = 2.7;
const gapX = 0.15;
let xPos = 0.6;

bricks.forEach((b, i) => {
  s3.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: boxY, w: boxW, h: boxH,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.08 },
  });
  s3.addShape(pres.shapes.RECTANGLE, {
    x: xPos, y: boxY, w: boxW, h: 0.55,
    fill: { color: b.color }, line: { color: b.color, width: 0 },
  });
  s3.addText(b.t, {
    x: xPos + 0.15, y: boxY + 0.05, w: boxW - 0.3, h: 0.45,
    fontFace: F.body, fontSize: 13, color: C.white, bold: true, charSpacing: 2, margin: 0,
  });
  s3.addText(b.tech, {
    x: xPos + 0.15, y: boxY + 0.75, w: boxW - 0.3, h: 0.5,
    fontFace: F.head, fontSize: 16, color: C.navy, bold: true, margin: 0,
  });
  s3.addText(b.role, {
    x: xPos + 0.15, y: boxY + 1.35, w: boxW - 0.3, h: boxH - 1.5,
    fontFace: F.body, fontSize: 11, color: C.textGray, margin: 0,
  });

  if (i < bricks.length - 1) {
    const ax = xPos + boxW + 0.005;
    const ay = boxY + boxH / 2 - 0.01;
    s3.addShape(pres.shapes.LINE, {
      x: ax, y: ay, w: gapX - 0.01, h: 0,
      line: { color: C.subtle, width: 1.5, endArrowType: "triangle" },
    });
  }
  xPos += boxW + gapX;
});

s3.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.1, w: SW - 1.2, h: 0.7,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s3.addText(
  [
    { text: "Hebergement : ", options: { color: C.teal, bold: true } },
    { text: "VPS prive cercleonline    ", options: { color: C.white } },
    { text: "Reverse proxy : ", options: { color: C.teal, bold: true } },
    { text: "Caddy + TLS auto    ", options: { color: C.white } },
    { text: "CI/CD : ", options: { color: C.teal, bold: true } },
    { text: "GitHub -> Coolify en 3 min", options: { color: C.white } },
  ],
  { x: 0.8, y: 6.18, w: SW - 1.6, h: 0.55, fontFace: F.body, fontSize: 11.5, valign: "middle", margin: 0 }
);

footerBar(s3, 3);

// ============================================================
// SLIDE 4 - Livrables MVP (avec details sources Open Data)
// ============================================================
const s4 = pres.addSlide();
s4.background = { color: C.bg };
headerBar(s4);
slideTitle(s4, "Livrables MVP en production", "Ce qui tourne");

s4.addText("Version 1.0 mise en ligne, testee, accessible aux equipes ORSG. Couvre l'integralite du perimetre contractuel hors deploiement site client.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.55,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

// Left card - Applicatif
s4.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.5, w: 5.9, h: 4.35,
  fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
  shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
});
s4.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.5, w: 5.9, h: 0.5,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s4.addText("Applicatif", {
  x: 0.8, y: 2.55, w: 5.5, h: 0.4,
  fontFace: F.body, fontSize: 13, color: C.white, bold: true, charSpacing: 3, margin: 0,
});
s4.addText(
  [
    { text: "8 pages fonctionnelles", options: { bullet: true, bold: true, breakLine: true, color: C.navy } },
    { text: "dashboard, generateur, historique, docs, admin, support, profil, login", options: { bullet: true, indentLevel: 1, breakLine: true, fontSize: 11, color: C.textGray } },
    { text: "Assistant de generation en 3 etapes", options: { bullet: true, bold: true, breakLine: true, color: C.navy } },
    { text: "indicateur -> configuration -> telechargement", options: { bullet: true, indentLevel: 1, breakLine: true, fontSize: 11, color: C.textGray } },
    { text: "Double authentification : OTP ou mot de passe", options: { bullet: true, bold: true, breakLine: true, color: C.navy } },
    { text: "SMTP Resend, forgot-password, 6 utilisateurs", options: { bullet: true, indentLevel: 1, breakLine: true, fontSize: 11, color: C.textGray } },
    { text: "Tickets support integres + administration users", options: { bullet: true, bold: true, color: C.navy } },
  ],
  { x: 0.8, y: 3.15, w: 5.55, h: 3.5, fontFace: F.body, fontSize: 12, paraSpaceAfter: 2, margin: 0 }
);

// Right card - Donnees & Sources (table-like)
s4.addShape(pres.shapes.RECTANGLE, {
  x: 6.7, y: 2.5, w: 6.0, h: 4.35,
  fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
  shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
});
s4.addShape(pres.shapes.RECTANGLE, {
  x: 6.7, y: 2.5, w: 6.0, h: 0.5,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s4.addText("Sources Open Data par theme", {
  x: 6.9, y: 2.55, w: 5.6, h: 0.4,
  fontFace: F.body, fontSize: 13, color: C.white, bold: true, charSpacing: 3, margin: 0,
});

const sources = [
  ["INSEE Diplomes-Formation", "educ", "2017-2022"],
  ["INSEE Couples-Familles", "pop_inf3, sup65, menages...", "2017-2022"],
  ["CAF Allocataires", "alloc", "2020-2023"],
  ["IRCOM Revenus", "revenu", "2019-2023"],
  ["INSEE Pop. legales", "densite", "2021-2023"],
  ["ONISR / BAAC", "route (accidents)", "2019-2023"],
  ["CepiDc", "mortalite (7 causes)", "2015-2023"],
];

// header row
const tblX = 6.9, tblY = 3.15, tblW = 5.6;
const colW = [2.25, 2.15, 1.2];
s4.addText("Source", { x: tblX, y: tblY, w: colW[0], h: 0.3, fontFace: F.body, fontSize: 10, color: C.subtle, bold: true, charSpacing: 2, margin: 0 });
s4.addText("Themes", { x: tblX + colW[0], y: tblY, w: colW[1], h: 0.3, fontFace: F.body, fontSize: 10, color: C.subtle, bold: true, charSpacing: 2, margin: 0 });
s4.addText("Annees", { x: tblX + colW[0] + colW[1], y: tblY, w: colW[2], h: 0.3, fontFace: F.body, fontSize: 10, color: C.subtle, bold: true, charSpacing: 2, margin: 0 });

s4.addShape(pres.shapes.LINE, { x: tblX, y: tblY + 0.3, w: tblW, h: 0, line: { color: C.mutedBorder, width: 0.5 } });

sources.forEach((row, i) => {
  const ry = tblY + 0.4 + i * 0.44;
  if (i % 2 === 0) {
    s4.addShape(pres.shapes.RECTANGLE, {
      x: tblX - 0.05, y: ry - 0.03, w: tblW + 0.1, h: 0.4,
      fill: { color: C.softTeal }, line: { color: C.softTeal, width: 0 },
    });
  }
  s4.addText(row[0], { x: tblX, y: ry, w: colW[0], h: 0.35, fontFace: F.body, fontSize: 10.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
  s4.addText(row[1], { x: tblX + colW[0], y: ry, w: colW[1], h: 0.35, fontFace: F.body, fontSize: 10.5, color: C.textGray, margin: 0, valign: "middle" });
  s4.addText(row[2], { x: tblX + colW[0] + colW[1], y: ry, w: colW[2], h: 0.35, fontFace: F.body, fontSize: 10.5, color: C.amber, bold: true, margin: 0, valign: "middle" });
});

footerBar(s4, 4);

// ============================================================
// SLIDE 5 - Retours reunion du 2 avril
// ============================================================
const s5 = pres.addSlide();
s5.background = { color: C.bg };
headerBar(s5);
slideTitle(s5, "Retours de la reunion du 2 avril", "Vos demandes");

s5.addText("Six points souleves par Naissa et l'equipe lors de la demo. Chacun priorise et traite en moins de 15 jours.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.4,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

const feedbacks = [
  { n: "1", t: "Breadcrumb \"Suicide\" incorrect", desc: "Le fil d'Ariane affichait \"Mortalite alcool\" sur la page suicide.", severity: "Bloquant usage" },
  { n: "2", t: "Taux tx_* encombrants", desc: "Ratios calcules polluaient le parcours sans valeur ajoutee a l'export.", severity: "UX" },
  { n: "3", t: "Thematiques BDI non cliquables", desc: "Plusieurs entrees desactivees bloquaient l'exploration du referentiel.", severity: "Fonctionnel" },
  { n: "4", t: "Datasets manquants", desc: "Accidents route, noyades et comportements sante attendus par l'equipe.", severity: "Perimetre" },
  { n: "5", t: "Import CSV/Excel hors-MOCA", desc: "Besoin d'accepter des jeux de donnees externes sans passer par MOCA-O.", severity: "Flexibilite" },
  { n: "6", t: "Acces admin a generaliser", desc: "Marie-Josiane, Manuela, Jessie doivent administrer les utilisateurs.", severity: "Organisation" },
];

feedbacks.forEach((f, i) => {
  const ry = 2.4 + i * 0.7;
  s5.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: ry, w: SW - 1.2, h: 0.6,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.5 },
  });
  s5.addShape(pres.shapes.OVAL, {
    x: 0.8, y: ry + 0.1, w: 0.4, h: 0.4,
    fill: { color: C.amber }, line: { color: C.amber, width: 0 },
  });
  s5.addText(f.n, {
    x: 0.8, y: ry + 0.1, w: 0.4, h: 0.4,
    fontFace: F.body, fontSize: 13, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
  });
  s5.addText(f.t, {
    x: 1.4, y: ry + 0.05, w: 6.0, h: 0.28,
    fontFace: F.body, fontSize: 13, color: C.navy, bold: true, margin: 0,
  });
  s5.addText(f.desc, {
    x: 1.4, y: ry + 0.32, w: 8.8, h: 0.28,
    fontFace: F.body, fontSize: 10.5, color: C.textGray, margin: 0,
  });
  s5.addShape(pres.shapes.RECTANGLE, {
    x: 10.5, y: ry + 0.15, w: 2.3, h: 0.32,
    fill: { color: C.softAmber }, line: { color: C.amber, width: 0.5 },
  });
  s5.addText(f.severity, {
    x: 10.5, y: ry + 0.15, w: 2.3, h: 0.32, align: "center", valign: "middle",
    fontFace: F.body, fontSize: 9.5, color: C.amber, bold: true, margin: 0,
  });
});

footerBar(s5, 5);

// ============================================================
// SLIDE 6 - Corrections livrees aujourd'hui
// ============================================================
const s6 = pres.addSlide();
s6.background = { color: C.bg };
headerBar(s6);
slideTitle(s6, "Corrections livrees aujourd'hui - 17 avril", "Reponse");

s6.addText("Six interventions, zero regression, build TypeScript valide, deploiement Coolify automatique en cours.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.4,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

const fixes = [
  { t: "Breadcrumb Suicide corrige", desc: "Le libelle affiche correspond desormais a la page active. Verifie sur les 4 pages de mortalite." },
  { t: "Taux tx_* retires du parcours", desc: "Les ratios tx_* n'apparaissent plus a la generation. Ils restent au referentiel BDI (PRISME les recalcule)." },
  { t: "219 indicateurs cliquables", desc: "Toutes les thematiques BDI ouvertes a la selection. Import CSV/Excel libre active." },
  { t: "3 nouveaux datasets", desc: "Route (BAAC/ONISR), noyades (SPF/GEODES), comportements (CepiDc) - operationnels." },
  { t: "Import CSV/Excel hors-MOCA", desc: "L'outil accepte desormais les jeux de donnees externes sans passage par MOCA-O." },
  { t: "Utilisateurs ORSG en admin", desc: "Naissa, Marie-Josiane, Manuela, Jessie : tous roles administrateur actives." },
];

fixes.forEach((f, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const fx = 0.6 + col * 4.13;
  const fy = 2.4 + row * 2.1;
  s6.addShape(pres.shapes.RECTANGLE, {
    x: fx, y: fy, w: 3.9, h: 1.9,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.5 },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.08 },
  });
  s6.addShape(pres.shapes.RECTANGLE, {
    x: fx, y: fy, w: 0.1, h: 1.9,
    fill: { color: C.green }, line: { color: C.green, width: 0 },
  });
  s6.addText("LIVRE", {
    x: fx + 0.3, y: fy + 0.15, w: 1.5, h: 0.28, align: "left",
    fontFace: F.body, fontSize: 9, color: C.green, bold: true, charSpacing: 3, margin: 0,
  });
  s6.addText(f.t, {
    x: fx + 0.3, y: fy + 0.45, w: 3.5, h: 0.5,
    fontFace: F.body, fontSize: 13.5, color: C.navy, bold: true, margin: 0,
  });
  s6.addText(f.desc, {
    x: fx + 0.3, y: fy + 1.0, w: 3.5, h: 0.85,
    fontFace: F.body, fontSize: 10.5, color: C.textGray, margin: 0,
  });
});

s6.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.7, w: SW - 1.2, h: 0.2,
  fill: { color: C.softGreen }, line: { color: C.green, width: 0.5 },
});
s6.addText("47 commits phase MVP + 20 commits maintenance mars - build OK - deploy Coolify auto", {
  x: 0.6, y: 6.7, w: SW - 1.2, h: 0.2, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 9.5, color: C.green, bold: true, margin: 0,
});

footerBar(s6, 6);

// ============================================================
// SLIDE 7 - Cap prioritaire TRAUMATISMES
// ============================================================
const s7 = pres.addSlide();
s7.background = { color: C.bg };
headerBar(s7);
slideTitle(s7, "Cap prioritaire : rapport fin mai - Traumatismes", "Priorite client");

s7.addText("Les trois blocs d'indicateurs prioritaires pour le rapport ORSG fin mai sont desormais operationnels suite aux corrections livrees ce matin.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.55,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

const trauma = [
  {
    t: "Accidents de la route",
    source: "BAAC / ONISR",
    years: "2019-2023",
    indics: ["nb_acci", "nb_blesses", "nb_morts"],
    color: C.amber,
  },
  {
    t: "Noyades",
    source: "SPF / GEODES",
    years: "dataset livre 17/04",
    indics: ["nb_noyades", "nb_noyades_deces"],
    color: C.teal,
  },
  {
    t: "Suicide",
    source: "CepiDc",
    years: "2015-2023",
    indics: ["nb_suicides"],
    color: C.navy,
  },
];

trauma.forEach((b, i) => {
  const bx = 0.6 + i * 4.15;
  s7.addShape(pres.shapes.RECTANGLE, {
    x: bx, y: 2.55, w: 3.95, h: 3.85,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
  });
  s7.addShape(pres.shapes.RECTANGLE, {
    x: bx, y: 2.55, w: 3.95, h: 0.7,
    fill: { color: b.color }, line: { color: b.color, width: 0 },
  });
  s7.addText(b.t, {
    x: bx + 0.2, y: 2.6, w: 3.55, h: 0.6, valign: "middle",
    fontFace: F.head, fontSize: 18, color: C.white, bold: true, margin: 0,
  });
  s7.addText("SOURCE", {
    x: bx + 0.25, y: 3.4, w: 3.5, h: 0.25,
    fontFace: F.body, fontSize: 9, color: C.subtle, bold: true, charSpacing: 3, margin: 0,
  });
  s7.addText(b.source, {
    x: bx + 0.25, y: 3.6, w: 3.5, h: 0.35,
    fontFace: F.body, fontSize: 14, color: C.navy, bold: true, margin: 0,
  });
  s7.addText("ANNEES", {
    x: bx + 0.25, y: 4.0, w: 3.5, h: 0.25,
    fontFace: F.body, fontSize: 9, color: C.subtle, bold: true, charSpacing: 3, margin: 0,
  });
  s7.addText(b.years, {
    x: bx + 0.25, y: 4.2, w: 3.5, h: 0.3,
    fontFace: F.body, fontSize: 12, color: C.textGray, margin: 0,
  });
  s7.addText("INDICATEURS CLES", {
    x: bx + 0.25, y: 4.65, w: 3.5, h: 0.25,
    fontFace: F.body, fontSize: 9, color: C.subtle, bold: true, charSpacing: 3, margin: 0,
  });
  b.indics.forEach((ind, j) => {
    s7.addShape(pres.shapes.RECTANGLE, {
      x: bx + 0.25, y: 4.9 + j * 0.4, w: 3.45, h: 0.32,
      fill: { color: C.softTeal }, line: { color: C.teal, width: 0.5 },
    });
    s7.addText(ind, {
      x: bx + 0.35, y: 4.9 + j * 0.4, w: 3.35, h: 0.32, valign: "middle",
      fontFace: "Consolas", fontSize: 11, color: C.navy, bold: true, margin: 0,
    });
  });
});

s7.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.55, w: SW - 1.2, h: 0.35,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s7.addText("Les 3 blocs sont desormais traites - l'equipe ORSG peut produire le rapport fin mai sur jeu de donnees complet.", {
  x: 0.6, y: 6.55, w: SW - 1.2, h: 0.35, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 11, color: C.white, bold: true, italic: true, margin: 0,
});

footerBar(s7, 7);

// ============================================================
// SLIDE 8 - NOUVEAU - Deploiement infrastructure ORSG
// ============================================================
const s8 = pres.addSlide();
s8.background = { color: C.bg };
headerBar(s8);
slideTitle(s8, "Deploiement sur infrastructure ORSG", "Phase 3 - Forfait");

s8.addText("Installation de PRISME sur un serveur proprietaire ORSG, hors perimetre MVP actuel. Forfait unique, livraison cle en main.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.5,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

// Big price callout (left)
s8.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.55, w: 4.3, h: 4.3,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
  shadow: { type: "outer", color: "000000", blur: 12, offset: 3, angle: 135, opacity: 0.15 },
});
s8.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.55, w: 4.3, h: 0.15,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s8.addText("FORFAIT DEPLOIEMENT", {
  x: 0.6, y: 2.85, w: 4.3, h: 0.4, align: "center",
  fontFace: F.body, fontSize: 12, color: C.teal, bold: true, charSpacing: 5, margin: 0,
});
s8.addText("3 500", {
  x: 0.6, y: 3.35, w: 4.3, h: 1.6, align: "center",
  fontFace: F.head, fontSize: 110, color: C.white, bold: true, margin: 0,
});
s8.addText("EUR HT", {
  x: 0.6, y: 4.95, w: 4.3, h: 0.5, align: "center",
  fontFace: F.body, fontSize: 20, color: C.teal, bold: true, charSpacing: 3, margin: 0,
});
s8.addShape(pres.shapes.LINE, {
  x: 1.6, y: 5.55, w: 2.3, h: 0, line: { color: C.teal, width: 1.2 },
});
s8.addText("Paiement a la livraison", {
  x: 0.6, y: 5.7, w: 4.3, h: 0.35, align: "center",
  fontFace: F.body, fontSize: 12, color: "CBD5E1", margin: 0,
});
s8.addText("Duree : 3 a 5 jours ouvres", {
  x: 0.6, y: 6.1, w: 4.3, h: 0.35, align: "center",
  fontFace: F.body, fontSize: 12, color: "CBD5E1", italic: true, margin: 0,
});

// Right - what's included
s8.addShape(pres.shapes.RECTANGLE, {
  x: 5.1, y: 2.55, w: 7.6, h: 4.3,
  fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
  shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
});
s8.addShape(pres.shapes.RECTANGLE, {
  x: 5.1, y: 2.55, w: 7.6, h: 0.5,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s8.addText("Inclus dans le forfait", {
  x: 5.3, y: 2.6, w: 7.2, h: 0.4,
  fontFace: F.body, fontSize: 13, color: C.white, bold: true, charSpacing: 3, margin: 0,
});

const included = [
  { t: "Installation serveur ORSG", d: "Ubuntu / Debian ou cloud ORSG dedie" },
  { t: "Configuration reverse proxy", d: "Caddy / nginx + SSL Let's Encrypt automatique" },
  { t: "Sauvegardes quotidiennes", d: "pb_data et output/ - retention configurable" },
  { t: "Transfert complet", d: "Code source, documentation, identifiants d'administration" },
  { t: "Formation administrateurs", d: "Session 1 h a distance sur l'environnement cible" },
  { t: "Garantie 30 jours", d: "Correctifs inclus post-deploiement" },
];

included.forEach((it, i) => {
  const iy = 3.2 + i * 0.58;
  s8.addShape(pres.shapes.OVAL, {
    x: 5.3, y: iy + 0.05, w: 0.28, h: 0.28,
    fill: { color: C.green }, line: { color: C.green, width: 0 },
  });
  s8.addText("OK", {
    x: 5.3, y: iy + 0.05, w: 0.28, h: 0.28, align: "center", valign: "middle",
    fontFace: F.body, fontSize: 7, color: C.white, bold: true, margin: 0,
  });
  s8.addText(it.t, {
    x: 5.7, y: iy, w: 6.9, h: 0.28,
    fontFace: F.body, fontSize: 12.5, color: C.navy, bold: true, margin: 0,
  });
  s8.addText(it.d, {
    x: 5.7, y: iy + 0.28, w: 6.9, h: 0.28,
    fontFace: F.body, fontSize: 10.5, color: C.textGray, margin: 0,
  });
});

footerBar(s8, 8);

// ============================================================
// SLIDE 9 - NOUVEAU - Maintenance annuelle (2 formules)
// ============================================================
const s9 = pres.addSlide();
s9.background = { color: C.bg };
headerBar(s9);
slideTitle(s9, "Maintenance annuelle - deux formules au choix", "Contrat 12 mois reconductible");

s9.addText("Contractualisation sur 12 mois, reconduction tacite. Intervention evolutive incluse, priorites modulables selon la formule retenue.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.5,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

// Formule Essentielle (left)
s9.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.55, w: 6.0, h: 4.15,
  fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
  shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
});
s9.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.55, w: 6.0, h: 0.6,
  fill: { color: C.softNavy }, line: { color: C.softNavy, width: 0 },
});
s9.addText("ESSENTIELLE", {
  x: 0.8, y: 2.6, w: 5.6, h: 0.5, valign: "middle",
  fontFace: F.body, fontSize: 14, color: C.white, bold: true, charSpacing: 5, margin: 0,
});
s9.addText("2 400", {
  x: 0.6, y: 3.3, w: 6.0, h: 1.0, align: "center",
  fontFace: F.head, fontSize: 62, color: C.navy, bold: true, margin: 0,
});
s9.addText("EUR HT / an", {
  x: 0.6, y: 4.25, w: 6.0, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 14, color: C.navy, bold: true, margin: 0,
});
s9.addText("(soit 200 EUR HT / mois)", {
  x: 0.6, y: 4.55, w: 6.0, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 11, color: C.subtle, italic: true, margin: 0,
});

const essInclus = [
  "Maintien en condition operationnelle",
  "Correctifs bugs + mises a jour de securite",
  "Support email sous 48 h ouvrees",
  "Sauvegardes quotidiennes supervisees",
  "4 h / mois d'evolutif inclus (non cumulables)",
];
essInclus.forEach((t, i) => {
  const iy = 4.95 + i * 0.34;
  s9.addShape(pres.shapes.OVAL, {
    x: 0.85, y: iy + 0.05, w: 0.18, h: 0.18,
    fill: { color: C.softNavy }, line: { color: C.softNavy, width: 0 },
  });
  s9.addText(t, {
    x: 1.15, y: iy, w: 5.3, h: 0.3,
    fontFace: F.body, fontSize: 11, color: C.textGray, margin: 0,
  });
});

// Formule Etendue (right) - recommended
s9.addShape(pres.shapes.RECTANGLE, {
  x: 6.8, y: 2.55, w: 6.0, h: 4.15,
  fill: { color: C.white }, line: { color: C.teal, width: 2 },
  shadow: { type: "outer", color: "000000", blur: 12, offset: 3, angle: 135, opacity: 0.12 },
});
s9.addShape(pres.shapes.RECTANGLE, {
  x: 6.8, y: 2.55, w: 6.0, h: 0.6,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s9.addText("ETENDUE", {
  x: 7.0, y: 2.6, w: 3.6, h: 0.5, valign: "middle",
  fontFace: F.body, fontSize: 14, color: C.white, bold: true, charSpacing: 5, margin: 0,
});
s9.addShape(pres.shapes.RECTANGLE, {
  x: 11.1, y: 2.7, w: 1.55, h: 0.3,
  fill: { color: C.amber }, line: { color: C.amber, width: 0 },
});
s9.addText("RECOMMANDEE", {
  x: 11.1, y: 2.7, w: 1.55, h: 0.3, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 8.5, color: C.white, bold: true, charSpacing: 2, margin: 0,
});
s9.addText("4 800", {
  x: 6.8, y: 3.3, w: 6.0, h: 1.0, align: "center",
  fontFace: F.head, fontSize: 62, color: C.teal, bold: true, margin: 0,
});
s9.addText("EUR HT / an", {
  x: 6.8, y: 4.25, w: 6.0, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 14, color: C.teal, bold: true, margin: 0,
});
s9.addText("(soit 400 EUR HT / mois)", {
  x: 6.8, y: 4.55, w: 6.0, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 11, color: C.subtle, italic: true, margin: 0,
});

const etInclus = [
  "Tout l'Essentielle",
  "Support email 24 h + telephone prioritaire",
  "10 h / mois evolutif (cumulables sur trimestre)",
  "1 revue trimestrielle avec recommandations",
  "Integration nouvelles sources Open Data a la demande",
];
etInclus.forEach((t, i) => {
  const iy = 4.95 + i * 0.34;
  s9.addShape(pres.shapes.OVAL, {
    x: 7.05, y: iy + 0.05, w: 0.18, h: 0.18,
    fill: { color: C.teal }, line: { color: C.teal, width: 0 },
  });
  s9.addText(t, {
    x: 7.35, y: iy, w: 5.3, h: 0.3,
    fontFace: F.body, fontSize: 11, color: C.textGray, margin: 0,
  });
});

// Hors forfait note
s9.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.8, w: SW - 1.2, h: 0.25,
  fill: { color: C.softAmber }, line: { color: C.amber, width: 0.5 },
});
s9.addText("Hors forfait : refonte majeure, integration tierce lourde, migration infra -> devis dedie.", {
  x: 0.6, y: 6.8, w: SW - 1.2, h: 0.25, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 10, color: C.amber, bold: true, italic: true, margin: 0,
});

footerBar(s9, 9);

// ============================================================
// SLIDE 10 - Prochaines etapes
// ============================================================
const s10 = pres.addSlide();
s10.background = { color: C.bg };
headerBar(s10);
slideTitle(s10, "Prochaines etapes", "Feuille de route");

s10.addText("Quatre jalons pour cloturer la phase 2, preparer la phase 3 et contractualiser la maintenance.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.5,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

const steps = [
  {
    title: "Recette cote ORSG",
    when: "Semaine du 21 avril",
    desc: "Naissa et l'equipe testent les scenarios cles sur leurs jeux de donnees. Retours consolides dans un document.",
    owner: "ORSG",
    color: C.navy,
  },
  {
    title: "Formation utilisateurs",
    when: "Semaine du 28 avril",
    desc: "1 heure en visio : tour plateforme, gestion utilisateurs, generation exports, lecture warnings, ouverture ticket.",
    owner: "N.O.V.I.",
    color: C.teal,
  },
  {
    title: "Cloture phase MVP",
    when: "Signature de la recette",
    desc: "Livraison solde (7 000 EUR HT), transfert comptes admin, remise codes sources et BILAN_PROJET_PRISME.md.",
    owner: "Cloture",
    color: C.green,
  },
  {
    title: "Contractualisation maintenance",
    when: "Mai 2026",
    desc: "Choix formule (Essentielle / Etendue), bon de commande, demarrage contrat 12 mois reconductible.",
    owner: "Decision",
    color: C.amber,
  },
];

steps.forEach((st, i) => {
  const sy = 2.45 + i * 1.05;
  s10.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: sy, w: SW - 1.2, h: 0.95,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.5 },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.08 },
  });
  s10.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: sy, w: 1.7, h: 0.95,
    fill: { color: st.color }, line: { color: st.color, width: 0 },
  });
  s10.addText(`Etape ${i + 1}`, {
    x: 0.6, y: sy + 0.1, w: 1.7, h: 0.3, align: "center",
    fontFace: F.body, fontSize: 10.5, color: C.white, charSpacing: 3, margin: 0,
  });
  s10.addText(st.when, {
    x: 0.6, y: sy + 0.4, w: 1.7, h: 0.5, align: "center",
    fontFace: F.head, fontSize: 13, color: C.white, bold: true, margin: 0,
  });
  s10.addText(st.title, {
    x: 2.5, y: sy + 0.12, w: 8.5, h: 0.4,
    fontFace: F.body, fontSize: 15, color: C.navy, bold: true, margin: 0,
  });
  s10.addText(st.desc, {
    x: 2.5, y: sy + 0.5, w: 8.5, h: 0.45,
    fontFace: F.body, fontSize: 11, color: C.textGray, margin: 0,
  });
  s10.addShape(pres.shapes.RECTANGLE, {
    x: 11.2, y: sy + 0.32, w: 1.5, h: 0.4,
    fill: { color: C.softNavyBg }, line: { color: C.softNavy, width: 0.5 },
  });
  s10.addText(st.owner, {
    x: 11.2, y: sy + 0.32, w: 1.5, h: 0.4, align: "center", valign: "middle",
    fontFace: F.body, fontSize: 10, color: C.navy, bold: true, charSpacing: 2, margin: 0,
  });
});

footerBar(s10, 10);

// ============================================================
// SLIDE 11 - Contacts N.O.V.I. Connected + remerciements
// ============================================================
const s11 = pres.addSlide();
s11.background = { color: C.navy };

s11.addText("Merci.", {
  x: 0.9, y: 1.0, w: 11, h: 1.5,
  fontFace: F.head, fontSize: 80, color: C.white, bold: true, margin: 0,
});

s11.addShape(pres.shapes.LINE, {
  x: 0.9, y: 2.55, w: 3.5, h: 0, line: { color: C.teal, width: 1.5 },
});

s11.addText("Le code tourne, la donnee suit, on boucle la recette ensemble.", {
  x: 0.9, y: 2.7, w: 11, h: 0.6,
  fontFace: F.body, fontSize: 20, color: C.teal, italic: true, margin: 0,
});

// Client card (left)
s11.addShape(pres.shapes.RECTANGLE, {
  x: 0.9, y: 3.85, w: 5.7, h: 2.7,
  fill: { color: C.white, transparency: 92 }, line: { color: C.teal, width: 1 },
});
s11.addText("COTE ORSG", {
  x: 1.1, y: 4.0, w: 5.3, h: 0.3,
  fontFace: F.body, fontSize: 11, color: C.teal, bold: true, charSpacing: 4, margin: 0,
});
s11.addText("Naissa Chateau Remy", {
  x: 1.1, y: 4.35, w: 5.3, h: 0.5,
  fontFace: F.head, fontSize: 20, color: C.white, bold: true, margin: 0,
});
s11.addText("Charge de mission - ORSG-CTPS", {
  x: 1.1, y: 4.85, w: 5.3, h: 0.35,
  fontFace: F.body, fontSize: 12, color: "CBD5E1", margin: 0,
});
s11.addText("naissa.chateau@ors-guyane.org", {
  x: 1.1, y: 5.25, w: 5.3, h: 0.35,
  fontFace: "Consolas", fontSize: 12, color: C.white, margin: 0,
});
s11.addText("Observatoire Regional de la Sante de Guyane", {
  x: 1.1, y: 5.7, w: 5.3, h: 0.35,
  fontFace: F.body, fontSize: 10, color: "94A3B8", italic: true, margin: 0,
});
s11.addText("Admin equipe : M.-Josiane Castor, Manuela, Jessie", {
  x: 1.1, y: 6.05, w: 5.3, h: 0.35,
  fontFace: F.body, fontSize: 10, color: "94A3B8", italic: true, margin: 0,
});

// N.O.V.I. Connected card (right)
s11.addShape(pres.shapes.RECTANGLE, {
  x: 6.8, y: 3.85, w: 5.7, h: 2.7,
  fill: { color: C.white, transparency: 92 }, line: { color: C.teal, width: 1 },
});
s11.addText("N.O.V.I. CONNECTED", {
  x: 7.0, y: 4.0, w: 5.3, h: 0.3,
  fontFace: F.body, fontSize: 11, color: C.teal, bold: true, charSpacing: 4, margin: 0,
});
s11.addText("Cedric Atticot", {
  x: 7.0, y: 4.35, w: 5.3, h: 0.5,
  fontFace: F.head, fontSize: 20, color: C.white, bold: true, margin: 0,
});
s11.addText("Architecte digital - Fondateur", {
  x: 7.0, y: 4.85, w: 5.3, h: 0.35,
  fontFace: F.body, fontSize: 12, color: "CBD5E1", margin: 0,
});
s11.addText("cedric@noviconnected.com", {
  x: 7.0, y: 5.25, w: 5.3, h: 0.35,
  fontFace: "Consolas", fontSize: 12, color: C.white, margin: 0,
});
s11.addText("github.com/Shadojin94/ORSG-PRISME-FullStack", {
  x: 7.0, y: 5.7, w: 5.3, h: 0.35,
  fontFace: "Consolas", fontSize: 10, color: "94A3B8", margin: 0,
});
s11.addText("Deploiement, maintenance, evolutions - devis sur demande", {
  x: 7.0, y: 6.05, w: 5.3, h: 0.35,
  fontFace: F.body, fontSize: 10, color: "94A3B8", italic: true, margin: 0,
});

// footer band
s11.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: SH - 0.35, w: SW, h: 0.35,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s11.addText("N.O.V.I. Connected - PRISME / ORSG - Point projet 17 avril 2026", {
  x: 0.6, y: SH - 0.35, w: SW - 1.2, h: 0.35, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 10, color: C.white, bold: true, charSpacing: 3, margin: 0,
});

// ---------- write ----------
const outPath = "C:/Users/chad9/Documents/003.ORSG/Livraison_Client/Version_FullStack/livrables_17avril/PRISME_ORSG_Point_17avril2026.pptx";
pres.writeFile({ fileName: outPath }).then((f) => {
  console.log("WROTE:", f);
}).catch((e) => {
  console.error("ERR:", e);
  process.exit(1);
});
