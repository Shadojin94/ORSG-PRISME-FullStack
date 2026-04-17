// Build PRISME / ORSG - Point projet et dernieres phases - 17 avril 2026 (v3 - 14 slides)
// Auditoire non-technicien : zero jargon. Focus metier, benefices, clarte.
const path = require("path");
const pptxgen = require(path.join("C:", "Users", "chad9", "AppData", "Roaming", "npm", "node_modules", "pptxgenjs"));

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "Cedric Atticot dit Ravino - N.O.V.I. Connected";
pres.company = "N.O.V.I. Connected";
pres.title = "PRISME / Data Visus - Point projet et dernieres phases - 17 avril 2026";
pres.subject = "Plateforme ORSG-CTPS";

// Charte ORSG stricte
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

const SW = 13.3;
const SH = 7.5;
const TOTAL = 14;

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
      { text: "ORSG-CTPS", options: { bold: true, color: C.navy } },
      { text: "   |   ", options: { color: C.subtle } },
      { text: "Observatoire Regional de la Sante de Guyane", options: { color: C.subtle } },
    ],
    { x: 0.5, y: 0.2, w: 9, h: 0.35, fontFace: F.body, fontSize: 11, margin: 0 }
  );
  slide.addText("PRISME / Data Visus", {
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
  slide.addText("C. Atticot dit Ravino", {
    x: SW - 4.2, y: SH - 0.4, w: 2.6, h: 0.3, align: "right",
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
    x: 0.6, y: eyebrowText ? 0.95 : 0.7, w: SW - 1.2, h: 0.85,
    fontFace: F.head, fontSize: 26, color: C.navy, bold: true, margin: 0,
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
  x: 0.9, y: 1.25, w: 11, h: 1.2,
  fontFace: F.head, fontSize: 78, color: C.white, bold: true, charSpacing: 8, margin: 0,
});

s1.addText("Data Visus", {
  x: 0.9, y: 2.55, w: 11, h: 0.6,
  fontFace: F.body, fontSize: 22, color: C.teal, italic: true, margin: 0,
});

s1.addText("Point projet et dernieres phases", {
  x: 0.9, y: 3.2, w: 11, h: 0.55,
  fontFace: F.body, fontSize: 18, color: "CBD5E1", margin: 0,
});

s1.addShape(pres.shapes.LINE, {
  x: 0.9, y: 4.1, w: 4.5, h: 0, line: { color: C.teal, width: 1.2 },
});

s1.addText("Vendredi 17 avril 2026", {
  x: 0.9, y: 4.3, w: 11, h: 0.5,
  fontFace: F.body, fontSize: 18, color: C.white, bold: true, margin: 0,
});

s1.addText("Reunion de cloture", {
  x: 0.9, y: 4.85, w: 11, h: 0.5,
  fontFace: F.body, fontSize: 15, color: "CBD5E1", margin: 0,
});

s1.addText(
  [
    { text: "ORSG-CTPS  et  ", options: { color: "94A3B8" } },
    { text: "Cedric ATTICOT DIT RAVINO", options: { color: C.white, bold: true } },
  ],
  { x: 0.9, y: 5.95, w: 10, h: 0.4, fontFace: F.body, fontSize: 14, margin: 0 }
);
s1.addText("Architecte Digital - Consultant partenaire N.O.V.I. Connected", {
  x: 0.9, y: 6.4, w: 10, h: 0.4,
  fontFace: F.body, fontSize: 12, color: "94A3B8", italic: true, margin: 0,
});

s1.addShape(pres.shapes.RECTANGLE, {
  x: 10.55, y: 6.0, w: 2.35, h: 1.05,
  fill: { color: C.white, transparency: 88 }, line: { color: C.teal, width: 1 },
});
s1.addText("MVP LIVRE", {
  x: 10.55, y: 6.1, w: 2.35, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 11, color: C.teal, bold: true, charSpacing: 3, margin: 0,
});
s1.addText("Cloture", {
  x: 10.55, y: 6.4, w: 2.35, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 15, color: C.white, bold: true, margin: 0,
});
s1.addText("30 avril 2026", {
  x: 10.55, y: 6.7, w: 2.35, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 10, color: "CBD5E1", margin: 0,
});

// ============================================================
// SLIDE 2 - Les interlocuteurs du jour
// ============================================================
const s2 = pres.addSlide();
s2.background = { color: C.bg };
headerBar(s2);
slideTitle(s2, "Les interlocuteurs du jour", "Equipe reunie");

s2.addText("Nous nous retrouvons pour faire le point, valider les corrections livrees et preparer la derniere ligne droite ensemble.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.55,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

// Dr Castor - grande carte en haut, mise en avant
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.55, w: SW - 1.2, h: 1.3,
  fill: { color: C.white }, line: { color: C.navy, width: 2 },
  shadow: { type: "outer", color: "000000", blur: 12, offset: 3, angle: 135, opacity: 0.12 },
});
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.55, w: 0.18, h: 1.3,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s2.addShape(pres.shapes.OVAL, {
  x: 0.95, y: 2.85, w: 0.9, h: 0.9,
  fill: { color: C.softNavyBg }, line: { color: C.navy, width: 1.5 },
});
s2.addText("MJC", {
  x: 0.95, y: 2.85, w: 0.9, h: 0.9, align: "center", valign: "middle",
  fontFace: F.head, fontSize: 20, color: C.navy, bold: true, margin: 0,
});
s2.addText("Dr. Marie-Josiane CASTOR", {
  x: 2.1, y: 2.75, w: 8, h: 0.45,
  fontFace: F.head, fontSize: 22, color: C.navy, bold: true, margin: 0,
});
s2.addText("Directrice ORSG-CTPS", {
  x: 2.1, y: 3.2, w: 8, h: 0.35,
  fontFace: F.body, fontSize: 14, color: C.teal, bold: true, italic: true, margin: 0,
});
s2.addText("m-j.castor@ors-guyane.org", {
  x: 2.1, y: 3.5, w: 8, h: 0.3,
  fontFace: F.body, fontSize: 11, color: C.textGray, margin: 0,
});
s2.addShape(pres.shapes.RECTANGLE, {
  x: 10.4, y: 2.95, w: 2.3, h: 0.5,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s2.addText("DECISIONNAIRE", {
  x: 10.4, y: 2.95, w: 2.3, h: 0.5, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 10.5, color: C.white, bold: true, charSpacing: 3, margin: 0,
});

// 4 autres interlocuteurs en grille 2x2
const others = [
  {
    ini: "NCR",
    nom: "Naissa CHATEAU REMY",
    role: "Chargee d'etudes sante publique & epidemiologie",
    email: "naissa.chateau@ors-guyane.org",
    color: C.teal,
  },
  {
    ini: "JP",
    nom: "Jessy PAJOT",
    role: "Equipe ORSG",
    email: "ors-guyane.org",
    color: C.teal,
  },
  {
    ini: "MID",
    nom: "Manuella IMOUNGA-DESROZIERS",
    role: "Equipe ORSG",
    email: "ors-guyane.org",
    color: C.teal,
  },
  {
    ini: "MTD",
    nom: "Marie-Therese DANIEL",
    role: "Equipe ORSG - en copie",
    email: "ors-guyane.org",
    color: C.subtle,
  },
];

others.forEach((p, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const px = 0.6 + col * 6.25;
  const py = 4.05 + row * 1.35;
  s2.addShape(pres.shapes.RECTANGLE, {
    x: px, y: py, w: 6.05, h: 1.2,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.08 },
  });
  s2.addShape(pres.shapes.OVAL, {
    x: px + 0.2, y: py + 0.25, w: 0.7, h: 0.7,
    fill: { color: C.softTeal }, line: { color: p.color, width: 1.2 },
  });
  s2.addText(p.ini, {
    x: px + 0.2, y: py + 0.25, w: 0.7, h: 0.7, align: "center", valign: "middle",
    fontFace: F.head, fontSize: 14, color: p.color, bold: true, margin: 0,
  });
  s2.addText(p.nom, {
    x: px + 1.05, y: py + 0.2, w: 4.8, h: 0.38,
    fontFace: F.body, fontSize: 13.5, color: C.navy, bold: true, margin: 0,
  });
  s2.addText(p.role, {
    x: px + 1.05, y: py + 0.55, w: 4.8, h: 0.3,
    fontFace: F.body, fontSize: 10.5, color: C.textGray, italic: true, margin: 0,
  });
  s2.addText(p.email, {
    x: px + 1.05, y: py + 0.83, w: 4.8, h: 0.3,
    fontFace: F.body, fontSize: 10, color: C.subtle, margin: 0,
  });
});

footerBar(s2, 2);

// ============================================================
// SLIDE 3 - Chronologie depuis novembre 2025
// ============================================================
const s3 = pres.addSlide();
s3.background = { color: C.bg };
headerBar(s3);
slideTitle(s3, "Ce qu'on a fait ensemble depuis novembre 2025", "Chronologie du projet");

s3.addText("Cinq jalons pour raconter un projet livre en temps et en heure, du cadrage a la reunion de cloture d'aujourd'hui.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.55,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

// Timeline horizontale
const milestones = [
  { date: "25 nov. 2025", titre: "Cadrage du projet", desc: "Bon de commande N250219 signe. Definition du perimetre MVP.", color: C.navy },
  { date: "Fev. 2026", titre: "MVP complet", desc: "Plateforme assemblee : 219 indicateurs, 14 thematiques, 8 ecrans.", color: C.teal },
  { date: "2 avril 2026", titre: "Atelier de livraison", desc: "Presentation live aupres de l'equipe ORSG. Retours collectes.", color: C.amber },
  { date: "7 avril 2026", titre: "Emails retours", desc: "Consolidation ecrite des 4 demandes d'amelioration.", color: C.softNavy },
  { date: "17 avril 2026", titre: "Corrections livrees + cloture", desc: "Toutes les demandes integrees. Reunion de cloture aujourd'hui.", color: C.green },
];

const tlY = 3.3;
const tlLineY = tlY + 0.7;
// ligne de vie
s3.addShape(pres.shapes.LINE, {
  x: 1.0, y: tlLineY, w: SW - 2.0, h: 0,
  line: { color: C.mutedBorder, width: 2 },
});

const stepW = (SW - 2.0) / (milestones.length - 1);
milestones.forEach((m, i) => {
  const cx = 1.0 + i * stepW;
  // grosse pastille
  s3.addShape(pres.shapes.OVAL, {
    x: cx - 0.3, y: tlLineY - 0.3, w: 0.6, h: 0.6,
    fill: { color: m.color }, line: { color: C.white, width: 3 },
  });
  s3.addText(`${i + 1}`, {
    x: cx - 0.3, y: tlLineY - 0.3, w: 0.6, h: 0.6, align: "center", valign: "middle",
    fontFace: F.head, fontSize: 16, color: C.white, bold: true, margin: 0,
  });

  // carte au-dessus ou en-dessous
  const above = i % 2 === 0;
  const cardY = above ? tlLineY - 2.1 : tlLineY + 0.4;
  const cardH = 1.7;
  s3.addShape(pres.shapes.RECTANGLE, {
    x: cx - 1.1, y: cardY, w: 2.2, h: cardH,
    fill: { color: C.white }, line: { color: m.color, width: 1 },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.08 },
  });
  s3.addShape(pres.shapes.RECTANGLE, {
    x: cx - 1.1, y: cardY, w: 2.2, h: 0.1,
    fill: { color: m.color }, line: { color: m.color, width: 0 },
  });
  s3.addText(m.date, {
    x: cx - 1.05, y: cardY + 0.15, w: 2.1, h: 0.3, align: "center",
    fontFace: F.body, fontSize: 10.5, color: m.color, bold: true, charSpacing: 2, margin: 0,
  });
  s3.addText(m.titre, {
    x: cx - 1.05, y: cardY + 0.45, w: 2.1, h: 0.4, align: "center",
    fontFace: F.body, fontSize: 12, color: C.navy, bold: true, margin: 0,
  });
  s3.addText(m.desc, {
    x: cx - 1.05, y: cardY + 0.88, w: 2.1, h: 0.75, align: "center",
    fontFace: F.body, fontSize: 9.5, color: C.textGray, margin: 0,
  });
});

footerBar(s3, 3);

// ============================================================
// SLIDE 4 - 4 chiffres qui comptent
// ============================================================
const s4 = pres.addSlide();
s4.background = { color: C.bg };
headerBar(s4);
slideTitle(s4, "La plateforme en 4 chiffres qui comptent pour vous", "Volumetrie metier");

s4.addText("Une plateforme pensee pour votre metier : chaque chiffre se traduit par un gain concret pour l'equipe ORSG.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.55,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

const bigStats = [
  { num: "219", label: "indicateurs de sante publique", sub: "disponibles en un clic", color: C.navy },
  { num: "14", label: "thematiques couvertes", sub: "demographie, education, sante, pathologies, traumatismes, comportements", color: C.teal },
  { num: "5", label: "niveaux geographiques", sub: "commune, region, DOM, France hexagonale, France entiere", color: C.amber },
  { num: "101", label: "fichiers Excel deja generes", sub: "prets a importer dans Geoclip", color: C.green },
];

const bcardW = 2.95;
const bcardH = 3.95;
const bcardY = 2.65;
const bgapC = 0.15;
let bxPos = 0.6;

bigStats.forEach((c) => {
  s4.addShape(pres.shapes.RECTANGLE, {
    x: bxPos, y: bcardY, w: bcardW, h: bcardH,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
  });
  s4.addShape(pres.shapes.RECTANGLE, {
    x: bxPos, y: bcardY, w: bcardW, h: 0.14,
    fill: { color: c.color }, line: { color: c.color, width: 0 },
  });
  s4.addText(c.num, {
    x: bxPos + 0.1, y: bcardY + 0.4, w: bcardW - 0.2, h: 1.6, align: "center",
    fontFace: F.head, fontSize: 72, color: c.color, bold: true, margin: 0,
  });
  s4.addText(c.label, {
    x: bxPos + 0.2, y: bcardY + 2.1, w: bcardW - 0.4, h: 0.8, align: "center",
    fontFace: F.body, fontSize: 14, color: C.navy, bold: true, margin: 0,
  });
  s4.addShape(pres.shapes.LINE, {
    x: bxPos + bcardW / 2 - 0.4, y: bcardY + 2.95, w: 0.8, h: 0,
    line: { color: c.color, width: 1.2 },
  });
  s4.addText(c.sub, {
    x: bxPos + 0.2, y: bcardY + 3.05, w: bcardW - 0.4, h: 0.85, align: "center",
    fontFace: F.body, fontSize: 11, color: C.textGray, italic: true, margin: 0,
  });
  bxPos += bcardW + bgapC;
});

s4.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.75, w: SW - 1.2, h: 0.35,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s4.addText("Concretement : un rapport qui prenait plusieurs jours se prepare maintenant en quelques minutes.", {
  x: 0.6, y: 6.75, w: SW - 1.2, h: 0.35, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 11.5, color: C.white, bold: true, italic: true, margin: 0,
});

footerBar(s4, 4);

// ============================================================
// SLIDE 5 - Installation chez vous
// ============================================================
const s5 = pres.addSlide();
s5.background = { color: C.bg };
headerBar(s5);
slideTitle(s5, "Comment la plateforme va etre installee chez vous", "Schema simple");

s5.addText("Une installation sobre, sur votre infrastructure, accessible uniquement par vos equipes via votre reseau prive.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.55,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

// Schema : 3 blocs + 2 fleches
const diagY = 3.2;
const diagH = 2.4;

// Bloc 1 : Equipe ORSG
s5.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: diagY, w: 3.5, h: diagH,
  fill: { color: C.white }, line: { color: C.navy, width: 1.5 },
  shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.1 },
});
s5.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: diagY, w: 3.5, h: 0.55,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s5.addText("ETAPE 1", {
  x: 0.8, y: diagY + 0.1, w: 3.5, h: 0.35, align: "center",
  fontFace: F.body, fontSize: 10, color: C.white, bold: true, charSpacing: 3, margin: 0,
});
s5.addText("Equipe ORSG", {
  x: 0.8, y: diagY + 0.75, w: 3.5, h: 0.6, align: "center",
  fontFace: F.head, fontSize: 22, color: C.navy, bold: true, margin: 0,
});
s5.addText("Les utilisateurs autorises ouvrent la plateforme depuis leur poste de travail.", {
  x: 1.0, y: diagY + 1.4, w: 3.1, h: 0.9, align: "center",
  fontFace: F.body, fontSize: 11, color: C.textGray, margin: 0,
});

// Fleche 1->2
s5.addShape(pres.shapes.RIGHT_TRIANGLE, {
  x: 4.45, y: diagY + diagH / 2 - 0.18, w: 0.4, h: 0.36,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 }, rotate: 90,
});
s5.addShape(pres.shapes.LINE, {
  x: 4.35, y: diagY + diagH / 2, w: 0.2, h: 0,
  line: { color: C.teal, width: 2 },
});

// Bloc 2 : VPN ORSG
s5.addShape(pres.shapes.RECTANGLE, {
  x: 4.95, y: diagY, w: 3.5, h: diagH,
  fill: { color: C.white }, line: { color: C.teal, width: 1.5 },
  shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.1 },
});
s5.addShape(pres.shapes.RECTANGLE, {
  x: 4.95, y: diagY, w: 3.5, h: 0.55,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s5.addText("ETAPE 2", {
  x: 4.95, y: diagY + 0.1, w: 3.5, h: 0.35, align: "center",
  fontFace: F.body, fontSize: 10, color: C.white, bold: true, charSpacing: 3, margin: 0,
});
s5.addText("Reseau prive ORSG", {
  x: 4.95, y: diagY + 0.75, w: 3.5, h: 0.6, align: "center",
  fontFace: F.head, fontSize: 20, color: C.teal, bold: true, margin: 0,
});
s5.addText("Acces securise via le VPN ORSG. La plateforme n'est jamais exposee a internet.", {
  x: 5.15, y: diagY + 1.4, w: 3.1, h: 0.9, align: "center",
  fontFace: F.body, fontSize: 11, color: C.textGray, margin: 0,
});

// Fleche 2->3
s5.addShape(pres.shapes.RIGHT_TRIANGLE, {
  x: 8.6, y: diagY + diagH / 2 - 0.18, w: 0.4, h: 0.36,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 }, rotate: 90,
});
s5.addShape(pres.shapes.LINE, {
  x: 8.5, y: diagY + diagH / 2, w: 0.2, h: 0,
  line: { color: C.teal, width: 2 },
});

// Bloc 3 : VM ORSG avec PRISME
s5.addShape(pres.shapes.RECTANGLE, {
  x: 9.1, y: diagY, w: 3.5, h: diagH,
  fill: { color: C.white }, line: { color: C.amber, width: 1.5 },
  shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.1 },
});
s5.addShape(pres.shapes.RECTANGLE, {
  x: 9.1, y: diagY, w: 3.5, h: 0.55,
  fill: { color: C.amber }, line: { color: C.amber, width: 0 },
});
s5.addText("ETAPE 3", {
  x: 9.1, y: diagY + 0.1, w: 3.5, h: 0.35, align: "center",
  fontFace: F.body, fontSize: 10, color: C.white, bold: true, charSpacing: 3, margin: 0,
});
s5.addText("Machine dediee ORSG", {
  x: 9.1, y: diagY + 0.75, w: 3.5, h: 0.6, align: "center",
  fontFace: F.head, fontSize: 19, color: C.amber, bold: true, margin: 0,
});
s5.addText("La plateforme PRISME est installee sur une machine virtuelle dans votre infrastructure.", {
  x: 9.3, y: diagY + 1.4, w: 3.1, h: 0.9, align: "center",
  fontFace: F.body, fontSize: 11, color: C.textGray, margin: 0,
});

// Bandeau rassurant
s5.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.15, w: SW - 1.2, h: 0.75,
  fill: { color: C.softGreen }, line: { color: C.green, width: 1 },
});
s5.addText("Vos donnees ne sortent jamais de votre infrastructure.", {
  x: 0.6, y: 6.15, w: SW - 1.2, h: 0.4, align: "center",
  fontFace: F.head, fontSize: 16, color: C.green, bold: true, margin: 0,
});
s5.addText("Aucune transmission externe, aucun tiers heberge vos indicateurs. Maitrise complete cote ORSG.", {
  x: 0.6, y: 6.55, w: SW - 1.2, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 11, color: C.textGray, italic: true, margin: 0,
});

footerBar(s5, 5);

// ============================================================
// SLIDE 6 - Les retours du 2 avril - statut
// ============================================================
const s6 = pres.addSlide();
s6.background = { color: C.bg };
headerBar(s6);
slideTitle(s6, "Les retours de la reunion du 2 avril - statut", "Toutes les demandes livrees");

s6.addText("Cinq demandes formulees le 2 avril, confirmees par emails les 7 et 17 avril. Toutes integrees, testees, livrees.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.55,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

// Tableau 2 colonnes
const retours = [
  {
    demande: "Retirer les taux des fichiers generes",
    details: "PRISME les recalcule, seules les donnees brutes sortent.",
  },
  {
    demande: "Corriger l'intitule Suicide",
    details: "Le libelle est desormais coherent sur toutes les pages.",
  },
  {
    demande: "Permettre l'import de fichiers hors MOCA",
    details: "Vos jeux de donnees externes sont acceptes directement.",
  },
  {
    demande: "Rendre toutes les thematiques accessibles",
    details: "Les 219 indicateurs du referentiel sont selectionnables.",
  },
  {
    demande: "Passer les comptes en administrateur",
    details: "4 comptes : Dr. Castor, Naissa, Jessy, Manuella.",
  },
];

// En-tetes
const thY = 2.55;
s6.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: thY, w: SW - 1.2, h: 0.45,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s6.addText("RETOUR DU 2 AVRIL", {
  x: 0.8, y: thY, w: 8, h: 0.45, valign: "middle",
  fontFace: F.body, fontSize: 11, color: C.white, bold: true, charSpacing: 3, margin: 0,
});
s6.addText("STATUT", {
  x: 10.7, y: thY, w: 2.4, h: 0.45, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 11, color: C.white, bold: true, charSpacing: 3, margin: 0,
});

retours.forEach((r, i) => {
  const ry = 3.05 + i * 0.72;
  const bg = i % 2 === 0 ? C.white : C.softGreen;
  s6.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: ry, w: SW - 1.2, h: 0.65,
    fill: { color: bg }, line: { color: C.mutedBorder, width: 0.5 },
  });
  s6.addText(r.demande, {
    x: 0.8, y: ry + 0.05, w: 9.7, h: 0.3,
    fontFace: F.body, fontSize: 13, color: C.navy, bold: true, margin: 0,
  });
  s6.addText(r.details, {
    x: 0.8, y: ry + 0.35, w: 9.7, h: 0.28,
    fontFace: F.body, fontSize: 10.5, color: C.textGray, italic: true, margin: 0,
  });
  // badge Livre
  s6.addShape(pres.shapes.RECTANGLE, {
    x: 10.8, y: ry + 0.15, w: 2.2, h: 0.35,
    fill: { color: C.green }, line: { color: C.green, width: 0 },
  });
  s6.addText("LIVRE", {
    x: 10.8, y: ry + 0.15, w: 2.2, h: 0.35, align: "center", valign: "middle",
    fontFace: F.body, fontSize: 11, color: C.white, bold: true, charSpacing: 4, margin: 0,
  });
});

footerBar(s6, 6);

// ============================================================
// SLIDE 7 - Cap prioritaire : rapport Traumatismes fin mai
// ============================================================
const s7 = pres.addSlide();
s7.background = { color: C.bg };
headerBar(s7);
slideTitle(s7, "Le cap prioritaire : le rapport Traumatismes de fin mai", "Priorite metier");

s7.addText("Trois familles de donnees pour un rapport que vous generez en quelques clics.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.55,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

const trauma = [
  {
    t: "Accidents de la route",
    source: "Base officielle du Ministere de l'Interieur",
    years: "2019 a 2024",
    statut: "Recupere automatiquement",
    color: C.amber,
    statutColor: C.green,
  },
  {
    t: "Noyades",
    source: "Sante Publique France",
    years: "2003 a 2021 integres",
    statut: "2022-2024 a fournir par l'ORSG",
    color: C.teal,
    statutColor: C.amber,
  },
  {
    t: "Suicide",
    source: "INSERM",
    years: "2019 a 2023",
    statut: "Deja integre",
    color: C.navy,
    statutColor: C.green,
  },
];

trauma.forEach((b, i) => {
  const bx = 0.6 + i * 4.15;
  s7.addShape(pres.shapes.RECTANGLE, {
    x: bx, y: 2.55, w: 3.95, h: 3.8,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
  });
  s7.addShape(pres.shapes.RECTANGLE, {
    x: bx, y: 2.55, w: 3.95, h: 0.75,
    fill: { color: b.color }, line: { color: b.color, width: 0 },
  });
  s7.addText(b.t, {
    x: bx + 0.2, y: 2.6, w: 3.55, h: 0.65, valign: "middle",
    fontFace: F.head, fontSize: 17, color: C.white, bold: true, margin: 0,
  });
  s7.addText("SOURCE", {
    x: bx + 0.25, y: 3.5, w: 3.5, h: 0.25,
    fontFace: F.body, fontSize: 9, color: C.subtle, bold: true, charSpacing: 3, margin: 0,
  });
  s7.addText(b.source, {
    x: bx + 0.25, y: 3.75, w: 3.5, h: 0.6,
    fontFace: F.body, fontSize: 13, color: C.navy, bold: true, margin: 0,
  });
  s7.addText("ANNEES COUVERTES", {
    x: bx + 0.25, y: 4.55, w: 3.5, h: 0.25,
    fontFace: F.body, fontSize: 9, color: C.subtle, bold: true, charSpacing: 3, margin: 0,
  });
  s7.addText(b.years, {
    x: bx + 0.25, y: 4.8, w: 3.5, h: 0.35,
    fontFace: F.body, fontSize: 12, color: C.textGray, margin: 0,
  });
  s7.addShape(pres.shapes.RECTANGLE, {
    x: bx + 0.25, y: 5.4, w: 3.45, h: 0.8,
    fill: { color: C.softGreen }, line: { color: b.statutColor, width: 1 },
  });
  s7.addText(b.statut, {
    x: bx + 0.3, y: 5.4, w: 3.35, h: 0.8, align: "center", valign: "middle",
    fontFace: F.body, fontSize: 11.5, color: b.statutColor, bold: true, margin: 0,
  });
});

s7.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.5, w: SW - 1.2, h: 0.4,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s7.addText("Vous generez le rapport Traumatismes en quelques clics.", {
  x: 0.6, y: 6.5, w: SW - 1.2, h: 0.4, align: "center", valign: "middle",
  fontFace: F.head, fontSize: 14, color: C.white, bold: true, italic: true, margin: 0,
});

footerBar(s7, 7);

// ============================================================
// SLIDE 8 - Ce qui a ete livre gratuitement
// ============================================================
const s8 = pres.addSlide();
s8.background = { color: C.bg };
headerBar(s8);
slideTitle(s8, "Ce que nous avons livre en plus, gratuitement", "Hors contrat initial");

s8.addText("Fonctionnalites non prevues au bon de commande, ajoutees pour livrer une plateforme a la hauteur de vos ambitions.", {
  x: 0.6, y: 1.75, w: SW - 1.2, h: 0.5,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

// Tableau
const bonus = [
  { f: "Application web complete (8 pages, interface moderne)", v: "12 000 EUR" },
  { f: "Authentification a double facteur (code email)", v: "2 500 EUR" },
  { f: "Gestion des utilisateurs avec roles", v: "2 000 EUR" },
  { f: "Systeme de tickets / support integre", v: "1 500 EUR" },
  { f: "Pipeline Open Data automatise (INSEE, CAF, IRCOM, Min. Interieur, INSERM-CepiDc)", v: "5 500 EUR" },
  { f: "Documentation complete (utilisateur, administrateur, technique)", v: "1 500 EUR" },
];

// Header
const bhY = 2.35;
s8.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: bhY, w: SW - 1.2, h: 0.42,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s8.addText("FONCTIONNALITE", {
  x: 0.8, y: bhY, w: 8.4, h: 0.42, valign: "middle",
  fontFace: F.body, fontSize: 11, color: C.white, bold: true, charSpacing: 3, margin: 0,
});
s8.addText("VALEUR ESTIMEE", {
  x: 9.3, y: bhY, w: 2.2, h: 0.42, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 11, color: C.white, bold: true, charSpacing: 3, margin: 0,
});
s8.addText("STATUT", {
  x: 11.5, y: bhY, w: 1.5, h: 0.42, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 11, color: C.white, bold: true, charSpacing: 3, margin: 0,
});

bonus.forEach((b, i) => {
  const ry = 2.83 + i * 0.5;
  const bg = i % 2 === 0 ? C.white : C.softTeal;
  s8.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: ry, w: SW - 1.2, h: 0.45,
    fill: { color: bg }, line: { color: C.mutedBorder, width: 0.4 },
  });
  s8.addText(b.f, {
    x: 0.8, y: ry, w: 8.4, h: 0.45, valign: "middle",
    fontFace: F.body, fontSize: 11.5, color: C.navy, margin: 0,
  });
  s8.addText(b.v, {
    x: 9.3, y: ry, w: 2.2, h: 0.45, align: "center", valign: "middle",
    fontFace: F.body, fontSize: 12, color: C.textGray, bold: true, margin: 0,
  });
  s8.addShape(pres.shapes.RECTANGLE, {
    x: 11.6, y: ry + 0.08, w: 1.3, h: 0.28,
    fill: { color: C.softGreen }, line: { color: C.green, width: 0.5 },
  });
  s8.addText("OFFERT", {
    x: 11.6, y: ry + 0.08, w: 1.3, h: 0.28, align: "center", valign: "middle",
    fontFace: F.body, fontSize: 9.5, color: C.green, bold: true, charSpacing: 2, margin: 0,
  });
});

// Total
const totalY = 2.83 + bonus.length * 0.5;
s8.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: totalY, w: SW - 1.2, h: 0.55,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s8.addText("Total valeur offerte : environ 25 000 EUR HT", {
  x: 0.8, y: totalY, w: 9, h: 0.55, valign: "middle",
  fontFace: F.head, fontSize: 15, color: C.white, bold: true, margin: 0,
});
s8.addText("GESTE VOLONTAIRE", {
  x: 10.2, y: totalY, w: 2.9, h: 0.55, align: "right", valign: "middle",
  fontFace: F.body, fontSize: 11, color: C.white, bold: true, charSpacing: 3, margin: 0,
});

s8.addText("Geste volontaire de N.O.V.I. Connected pour la qualite du livrable.", {
  x: 0.6, y: totalY + 0.65, w: SW - 1.2, h: 0.35, align: "center",
  fontFace: F.body, fontSize: 11, color: C.subtle, italic: true, margin: 0,
});

footerBar(s8, 8);

// ============================================================
// SLIDE 9 - Roadmap fin de projet - fin avril
// ============================================================
const s9 = pres.addSlide();
s9.background = { color: C.bg };
headerBar(s9);
slideTitle(s9, "Roadmap fin de projet - d'ici fin avril 2026", "Derniere ligne droite");

s9.addText("Quatre jalons tres resserres pour fermer proprement le MVP et remettre la plateforme.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.55,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

const roadmap = [
  {
    when: "Semaine du 21 avril",
    titre: "Recette fonctionnelle conjointe",
    desc: "Avec Dr. Castor, Naissa et Cedric : validation des corrections livrees sur vos jeux de donnees reels.",
    color: C.navy,
  },
  {
    when: "Semaine du 28 avril",
    titre: "Mise a disposition de la machine ORSG",
    desc: "Votre prestataire technique prepare la machine dediee sur laquelle la plateforme sera installee.",
    color: C.teal,
  },
  {
    when: "29-30 avril",
    titre: "Installation et connexion VPN",
    desc: "Installation de la plateforme sur la machine ORSG, raccordement au reseau prive de l'observatoire.",
    color: C.amber,
  },
  {
    when: "Vendredi 30 avril",
    titre: "Remise officielle et cloture",
    desc: "Transfert complet, acces admins remis, cloture administrative du MVP.",
    color: C.green,
  },
];

roadmap.forEach((st, i) => {
  const sy = 2.5 + i * 1.05;
  s9.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: sy, w: SW - 1.2, h: 0.95,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.5 },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.08 },
  });
  s9.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: sy, w: 2.7, h: 0.95,
    fill: { color: st.color }, line: { color: st.color, width: 0 },
  });
  s9.addText(`Jalon ${i + 1}`, {
    x: 0.6, y: sy + 0.1, w: 2.7, h: 0.3, align: "center",
    fontFace: F.body, fontSize: 10.5, color: C.white, charSpacing: 3, margin: 0,
  });
  s9.addText(st.when, {
    x: 0.6, y: sy + 0.4, w: 2.7, h: 0.5, align: "center",
    fontFace: F.head, fontSize: 14, color: C.white, bold: true, margin: 0,
  });
  s9.addText(st.titre, {
    x: 3.5, y: sy + 0.12, w: 9.5, h: 0.4,
    fontFace: F.body, fontSize: 15, color: C.navy, bold: true, margin: 0,
  });
  s9.addText(st.desc, {
    x: 3.5, y: sy + 0.5, w: 9.5, h: 0.45,
    fontFace: F.body, fontSize: 11, color: C.textGray, margin: 0,
  });
});

footerBar(s9, 9);

// ============================================================
// SLIDE 10 - Formation utilisateurs
// ============================================================
const s10 = pres.addSlide();
s10.background = { color: C.bg };
headerBar(s10);
slideTitle(s10, "Formation utilisateurs - planning propose", "Prise en main");

s10.addText("Une session de prise en main, collective, a distance, pour demarrer en confiance.", {
  x: 0.6, y: 1.85, w: SW - 1.2, h: 0.55,
  fontFace: F.body, fontSize: 13, color: C.textGray, italic: true, margin: 0,
});

// Bloc infos a gauche
s10.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.55, w: 5.3, h: 4.3,
  fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
  shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
});
s10.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.55, w: 5.3, h: 0.55,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s10.addText("LA SESSION", {
  x: 0.8, y: 2.6, w: 5.0, h: 0.45, valign: "middle",
  fontFace: F.body, fontSize: 12, color: C.white, bold: true, charSpacing: 3, margin: 0,
});

const infos = [
  { label: "Intervenant", val: "Cedric ATTICOT DIT RAVINO" },
  { label: "Format", val: "A distance (visio)" },
  { label: "Duree", val: "Environ 2 heures" },
  { label: "Public", val: "L'ensemble de l'equipe ORSG" },
];

infos.forEach((it, i) => {
  const iy = 3.3 + i * 0.6;
  s10.addText(it.label.toUpperCase(), {
    x: 0.9, y: iy, w: 4.8, h: 0.25,
    fontFace: F.body, fontSize: 9.5, color: C.teal, bold: true, charSpacing: 3, margin: 0,
  });
  s10.addText(it.val, {
    x: 0.9, y: iy + 0.25, w: 4.8, h: 0.3,
    fontFace: F.body, fontSize: 13, color: C.navy, bold: true, margin: 0,
  });
});

s10.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 6.05, w: 4.9, h: 0.7,
  fill: { color: C.softAmber }, line: { color: C.amber, width: 1 },
});
s10.addText("Disponible a partir du lundi 4 mai 2026", {
  x: 0.8, y: 6.05, w: 4.9, h: 0.35, align: "center",
  fontFace: F.body, fontSize: 11, color: C.amber, bold: true, margin: 0,
});
s10.addText("Tous les jours ouvres SAUF les mercredis", {
  x: 0.8, y: 6.38, w: 4.9, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 10.5, color: C.amber, italic: true, margin: 0,
});

// 3 creneaux a droite
s10.addShape(pres.shapes.RECTANGLE, {
  x: 6.2, y: 2.55, w: 6.5, h: 4.3,
  fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
  shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
});
s10.addShape(pres.shapes.RECTANGLE, {
  x: 6.2, y: 2.55, w: 6.5, h: 0.55,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s10.addText("3 CRENEAUX PROPOSES AU CHOIX", {
  x: 6.4, y: 2.6, w: 6.1, h: 0.45, valign: "middle",
  fontFace: F.body, fontSize: 12, color: C.white, bold: true, charSpacing: 3, margin: 0,
});

const creneaux = [
  { jour: "Lundi 4 mai", heure: "14h00", num: "1" },
  { jour: "Jeudi 7 mai", heure: "10h00", num: "2" },
  { jour: "Mardi 12 mai", heure: "14h00", num: "3" },
];

creneaux.forEach((c, i) => {
  const cy = 3.35 + i * 1.1;
  s10.addShape(pres.shapes.RECTANGLE, {
    x: 6.4, y: cy, w: 6.1, h: 0.95,
    fill: { color: C.softTeal }, line: { color: C.teal, width: 1 },
  });
  s10.addShape(pres.shapes.OVAL, {
    x: 6.6, y: cy + 0.2, w: 0.55, h: 0.55,
    fill: { color: C.teal }, line: { color: C.teal, width: 0 },
  });
  s10.addText(c.num, {
    x: 6.6, y: cy + 0.2, w: 0.55, h: 0.55, align: "center", valign: "middle",
    fontFace: F.head, fontSize: 18, color: C.white, bold: true, margin: 0,
  });
  s10.addText(c.jour, {
    x: 7.4, y: cy + 0.15, w: 3.5, h: 0.35,
    fontFace: F.body, fontSize: 14, color: C.navy, bold: true, margin: 0,
  });
  s10.addText("Heure de Paris", {
    x: 7.4, y: cy + 0.5, w: 3.5, h: 0.3,
    fontFace: F.body, fontSize: 10, color: C.subtle, italic: true, margin: 0,
  });
  s10.addText(c.heure, {
    x: 10.8, y: cy + 0.2, w: 1.6, h: 0.55, align: "right", valign: "middle",
    fontFace: F.head, fontSize: 22, color: C.teal, bold: true, margin: 0,
  });
});

footerBar(s10, 10);

// ============================================================
// SLIDE 11 - Deploiement infrastructure ORSG - 6 500 EUR
// ============================================================
const s11 = pres.addSlide();
s11.background = { color: C.bg };
headerBar(s11);
slideTitle(s11, "Pour aller plus loin : deploiement sur infrastructure ORSG", "Prestation en direct");

s11.addText("Installation de la plateforme sur votre machine, cle en main. Prestation realisee par Cedric ATTICOT DIT RAVINO en direct (hors perimetre N.O.V.I. Connected).", {
  x: 0.6, y: 1.8, w: SW - 1.2, h: 0.65,
  fontFace: F.body, fontSize: 12, color: C.textGray, italic: true, margin: 0,
});

// Big price callout (left)
s11.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.55, w: 4.3, h: 4.0,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
  shadow: { type: "outer", color: "000000", blur: 12, offset: 3, angle: 135, opacity: 0.15 },
});
s11.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 2.55, w: 4.3, h: 0.15,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s11.addText("FORFAIT DEPLOIEMENT", {
  x: 0.6, y: 2.85, w: 4.3, h: 0.4, align: "center",
  fontFace: F.body, fontSize: 12, color: C.teal, bold: true, charSpacing: 5, margin: 0,
});
s11.addText("6 500", {
  x: 0.6, y: 3.3, w: 4.3, h: 1.6, align: "center",
  fontFace: F.head, fontSize: 100, color: C.white, bold: true, margin: 0,
});
s11.addText("EUR HT", {
  x: 0.6, y: 4.85, w: 4.3, h: 0.5, align: "center",
  fontFace: F.body, fontSize: 20, color: C.teal, bold: true, charSpacing: 3, margin: 0,
});
s11.addShape(pres.shapes.LINE, {
  x: 1.6, y: 5.45, w: 2.3, h: 0, line: { color: C.teal, width: 1.2 },
});
s11.addText("5 jours ouvres", {
  x: 0.6, y: 5.6, w: 4.3, h: 0.35, align: "center",
  fontFace: F.body, fontSize: 13, color: "CBD5E1", margin: 0,
});
s11.addText("Facture par Cedric ATTICOT DIT RAVINO", {
  x: 0.6, y: 5.95, w: 4.3, h: 0.35, align: "center",
  fontFace: F.body, fontSize: 10.5, color: "CBD5E1", italic: true, margin: 0,
});
s11.addText("Tarif indicatif - negociable", {
  x: 0.6, y: 6.25, w: 4.3, h: 0.3, align: "center",
  fontFace: F.body, fontSize: 10, color: C.amber, bold: true, italic: true, margin: 0,
});

// Right - what's included
s11.addShape(pres.shapes.RECTANGLE, {
  x: 5.1, y: 2.55, w: 7.6, h: 4.0,
  fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
  shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
});
s11.addShape(pres.shapes.RECTANGLE, {
  x: 5.1, y: 2.55, w: 7.6, h: 0.5,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s11.addText("Inclus dans le forfait", {
  x: 5.3, y: 2.6, w: 7.2, h: 0.4,
  fontFace: F.body, fontSize: 13, color: C.white, bold: true, charSpacing: 3, margin: 0,
});

const included = [
  { t: "Audit de la machine fournie par ORSG", d: "Verification de la conformite avant installation" },
  { t: "Installation de la plateforme", d: "Configuration complete sur votre machine" },
  { t: "Configuration VPN et certificat de securite", d: "Acces securise depuis vos postes" },
  { t: "Sauvegardes quotidiennes automatiques", d: "Protection des donnees, restauration testee" },
  { t: "Transfert complet de la documentation", d: "Utilisateur, administrateur, technique" },
  { t: "Formation de l'administrateur ORSG", d: "3h en visio sur l'environnement cible" },
  { t: "Garantie 60 jours", d: "Correctifs inclus post-deploiement" },
];

included.forEach((it, i) => {
  const iy = 3.2 + i * 0.45;
  s11.addShape(pres.shapes.OVAL, {
    x: 5.3, y: iy + 0.05, w: 0.25, h: 0.25,
    fill: { color: C.green }, line: { color: C.green, width: 0 },
  });
  s11.addText("OK", {
    x: 5.3, y: iy + 0.05, w: 0.25, h: 0.25, align: "center", valign: "middle",
    fontFace: F.body, fontSize: 7, color: C.white, bold: true, margin: 0,
  });
  s11.addText(it.t, {
    x: 5.7, y: iy, w: 6.9, h: 0.25,
    fontFace: F.body, fontSize: 12, color: C.navy, bold: true, margin: 0,
  });
  s11.addText(it.d, {
    x: 5.7, y: iy + 0.22, w: 6.9, h: 0.22,
    fontFace: F.body, fontSize: 10, color: C.textGray, margin: 0,
  });
});

// Pied de carte
s11.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.7, w: SW - 1.2, h: 0.2,
  fill: { color: C.softAmber }, line: { color: C.amber, width: 0.5 },
});
s11.addText("Tarif a negocier en fonction du perimetre final et des contraintes infrastructure ORSG.", {
  x: 0.6, y: 6.7, w: SW - 1.2, h: 0.2, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 10, color: C.amber, bold: true, italic: true, margin: 0,
});

footerBar(s11, 11);

// ============================================================
// SLIDE 12 - Maintenance annuelle - 3 formules
// ============================================================
const s12 = pres.addSlide();
s12.background = { color: C.bg };
headerBar(s12);
slideTitle(s12, "Maintenance annuelle - 3 formules au choix", "Continuite de service");

s12.addText("Toutes les formules sont facturees par Cedric ATTICOT DIT RAVINO en direct. Tarifs indicatifs, negociables dans le cadre d'un engagement pluriannuel.", {
  x: 0.6, y: 1.8, w: SW - 1.2, h: 0.6,
  fontFace: F.body, fontSize: 12, color: C.textGray, italic: true, margin: 0,
});

// 3 cartes en ligne
const formulas = [
  {
    nom: "ESSENTIELLE",
    prix: "3 600",
    suffix: "EUR HT / an",
    mensuel: "soit 300 EUR HT / mois",
    reco: false,
    color: C.softNavy,
    avantages: [
      "Maintien en condition operationnelle",
      "Correctifs et mises a jour de securite",
      "Sauvegardes supervisees",
      "3 h d'evolutif par mois",
      "Support email sous 72 h ouvrees",
    ],
  },
  {
    nom: "STANDARD",
    prix: "7 200",
    suffix: "EUR HT / an",
    mensuel: "soit 600 EUR HT / mois",
    reco: true,
    color: C.teal,
    avantages: [
      "Tout l'Essentielle",
      "8 h / mois (cumulables sur trimestre)",
      "Revue trimestrielle",
      "Support email sous 48 h",
      "Integration de nouvelles sources Open Data",
    ],
  },
  {
    nom: "ETENDUE",
    prix: "14 400",
    suffix: "EUR HT / an",
    mensuel: "soit 1 200 EUR HT / mois",
    reco: false,
    color: C.navy,
    avantages: [
      "Tout la Standard",
      "18 h / mois",
      "Support telephonique + SLA 24 h ouvrees",
      "Revue mensuelle",
      "1 journee sur site par an",
    ],
  },
];

formulas.forEach((f, i) => {
  const fx = 0.6 + i * 4.15;
  const fy = 2.5;
  const fw = 3.95;
  const fh = 4.1;

  s12.addShape(pres.shapes.RECTANGLE, {
    x: fx, y: fy, w: fw, h: fh,
    fill: { color: C.white },
    line: { color: f.reco ? C.teal : C.mutedBorder, width: f.reco ? 2.5 : 0.75 },
    shadow: { type: "outer", color: "000000", blur: f.reco ? 14 : 10, offset: 3, angle: 135, opacity: f.reco ? 0.15 : 0.08 },
  });
  s12.addShape(pres.shapes.RECTANGLE, {
    x: fx, y: fy, w: fw, h: 0.5,
    fill: { color: f.color }, line: { color: f.color, width: 0 },
  });
  s12.addText(f.nom, {
    x: fx, y: fy, w: fw, h: 0.5, align: "center", valign: "middle",
    fontFace: F.body, fontSize: 13, color: C.white, bold: true, charSpacing: 5, margin: 0,
  });

  if (f.reco) {
    s12.addShape(pres.shapes.RECTANGLE, {
      x: fx + fw - 1.5, y: fy + 0.58, w: 1.4, h: 0.3,
      fill: { color: C.amber }, line: { color: C.amber, width: 0 },
    });
    s12.addText("RECOMMANDEE", {
      x: fx + fw - 1.5, y: fy + 0.58, w: 1.4, h: 0.3, align: "center", valign: "middle",
      fontFace: F.body, fontSize: 8.5, color: C.white, bold: true, charSpacing: 2, margin: 0,
    });
  }

  s12.addText(f.prix, {
    x: fx, y: fy + 0.95, w: fw, h: 1.05, align: "center",
    fontFace: F.head, fontSize: 52, color: f.color, bold: true, margin: 0,
  });
  s12.addText(f.suffix, {
    x: fx, y: fy + 2.0, w: fw, h: 0.3, align: "center",
    fontFace: F.body, fontSize: 12, color: f.color, bold: true, margin: 0,
  });
  s12.addText(f.mensuel, {
    x: fx, y: fy + 2.3, w: fw, h: 0.3, align: "center",
    fontFace: F.body, fontSize: 10, color: C.subtle, italic: true, margin: 0,
  });
  s12.addShape(pres.shapes.LINE, {
    x: fx + 0.7, y: fy + 2.7, w: fw - 1.4, h: 0,
    line: { color: C.mutedBorder, width: 0.75 },
  });

  f.avantages.forEach((a, j) => {
    const ay = fy + 2.85 + j * 0.25;
    s12.addShape(pres.shapes.OVAL, {
      x: fx + 0.25, y: ay + 0.06, w: 0.14, h: 0.14,
      fill: { color: f.color }, line: { color: f.color, width: 0 },
    });
    s12.addText(a, {
      x: fx + 0.5, y: ay, w: fw - 0.6, h: 0.25,
      fontFace: F.body, fontSize: 10, color: C.textGray, margin: 0,
    });
  });
});

// Pied
s12.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.75, w: SW - 1.2, h: 0.22,
  fill: { color: C.softAmber }, line: { color: C.amber, width: 0.5 },
});
s12.addText("Toutes les formules sont reconductibles tacitement, resiliables a 90 jours.", {
  x: 0.6, y: 6.75, w: SW - 1.2, h: 0.22, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 10, color: C.amber, bold: true, italic: true, margin: 0,
});

footerBar(s12, 12);

// ============================================================
// SLIDE 13 - Support a la carte
// ============================================================
const s13 = pres.addSlide();
s13.background = { color: C.bg };
headerBar(s13);
slideTitle(s13, "Support a la carte", "Si pas d'engagement annuel");

s13.addText("Pour une utilisation occasionnelle, sans souscrire a une formule annuelle : trois options flexibles, facturees par Cedric ATTICOT DIT RAVINO.", {
  x: 0.6, y: 1.8, w: SW - 1.2, h: 0.65,
  fontFace: F.body, fontSize: 12, color: C.textGray, italic: true, margin: 0,
});

const aLaCarte = [
  {
    titre: "TJM Architecte Digital",
    prix: "950",
    suffix: "EUR HT / jour",
    detail: "Intervention minimum 4 heures (475 EUR HT)",
    color: C.navy,
  },
  {
    titre: "Pack 10 heures prepaye",
    prix: "1 100",
    suffix: "EUR HT",
    detail: "Valable 12 mois a compter de l'achat",
    color: C.teal,
  },
  {
    titre: "Delai d'intervention",
    prix: "5",
    suffix: "jours ouvres",
    detail: "En best-effort selon disponibilite",
    color: C.amber,
  },
];

aLaCarte.forEach((a, i) => {
  const ax = 0.6 + i * 4.15;
  const ay = 2.7;
  const aw = 3.95;
  const ah = 3.7;

  s13.addShape(pres.shapes.RECTANGLE, {
    x: ax, y: ay, w: aw, h: ah,
    fill: { color: C.white }, line: { color: C.mutedBorder, width: 0.75 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 135, opacity: 0.08 },
  });
  s13.addShape(pres.shapes.RECTANGLE, {
    x: ax, y: ay, w: aw, h: 0.14,
    fill: { color: a.color }, line: { color: a.color, width: 0 },
  });
  s13.addText(a.titre, {
    x: ax + 0.2, y: ay + 0.35, w: aw - 0.4, h: 0.5, align: "center",
    fontFace: F.body, fontSize: 13, color: a.color, bold: true, charSpacing: 2, margin: 0,
  });
  s13.addText(a.prix, {
    x: ax, y: ay + 1.0, w: aw, h: 1.4, align: "center",
    fontFace: F.head, fontSize: 68, color: a.color, bold: true, margin: 0,
  });
  s13.addText(a.suffix, {
    x: ax, y: ay + 2.4, w: aw, h: 0.4, align: "center",
    fontFace: F.body, fontSize: 14, color: a.color, bold: true, margin: 0,
  });
  s13.addShape(pres.shapes.LINE, {
    x: ax + aw / 2 - 0.6, y: ay + 2.9, w: 1.2, h: 0,
    line: { color: a.color, width: 1 },
  });
  s13.addText(a.detail, {
    x: ax + 0.25, y: ay + 3.05, w: aw - 0.5, h: 0.55, align: "center",
    fontFace: F.body, fontSize: 11, color: C.textGray, italic: true, margin: 0,
  });
});

s13.addShape(pres.shapes.RECTANGLE, {
  x: 0.6, y: 6.55, w: SW - 1.2, h: 0.4,
  fill: { color: C.navy }, line: { color: C.navy, width: 0 },
});
s13.addText("Tarifs indicatifs HT - negociables selon volume et engagement.", {
  x: 0.6, y: 6.55, w: SW - 1.2, h: 0.4, align: "center", valign: "middle",
  fontFace: F.body, fontSize: 11, color: C.white, bold: true, italic: true, margin: 0,
});

footerBar(s13, 13);

// ============================================================
// SLIDE 14 - Contacts et cloture
// ============================================================
const s14 = pres.addSlide();
s14.background = { color: C.navy };

s14.addText("Merci pour votre confiance.", {
  x: 0.9, y: 0.8, w: 11.5, h: 1.1,
  fontFace: F.head, fontSize: 48, color: C.white, bold: true, margin: 0,
});

s14.addShape(pres.shapes.LINE, {
  x: 0.9, y: 1.95, w: 3.5, h: 0, line: { color: C.teal, width: 1.5 },
});

s14.addText("Rendez-vous le 30 avril pour la livraison finale.", {
  x: 0.9, y: 2.1, w: 11.5, h: 0.55,
  fontFace: F.body, fontSize: 20, color: C.teal, italic: true, margin: 0,
});

// ORSG-CTPS (gauche)
s14.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 3.1, w: 5.8, h: 3.7,
  fill: { color: C.white, transparency: 92 }, line: { color: C.teal, width: 1 },
});
s14.addText("ORSG-CTPS", {
  x: 1.0, y: 3.25, w: 5.4, h: 0.35,
  fontFace: F.body, fontSize: 11, color: C.teal, bold: true, charSpacing: 4, margin: 0,
});
s14.addText("Dr. Marie-Josiane CASTOR", {
  x: 1.0, y: 3.65, w: 5.4, h: 0.4,
  fontFace: F.head, fontSize: 17, color: C.white, bold: true, margin: 0,
});
s14.addText("Directrice ORSG-CTPS", {
  x: 1.0, y: 4.05, w: 5.4, h: 0.3,
  fontFace: F.body, fontSize: 11, color: "CBD5E1", italic: true, margin: 0,
});
s14.addText("m-j.castor@ors-guyane.org", {
  x: 1.0, y: 4.35, w: 5.4, h: 0.3,
  fontFace: F.body, fontSize: 11, color: C.white, margin: 0,
});

s14.addShape(pres.shapes.LINE, {
  x: 1.0, y: 4.85, w: 5.4, h: 0, line: { color: C.teal, width: 0.5, transparency: 50 },
});

s14.addText("Naissa CHATEAU REMY", {
  x: 1.0, y: 5.0, w: 5.4, h: 0.4,
  fontFace: F.head, fontSize: 15, color: C.white, bold: true, margin: 0,
});
s14.addText("Chargee d'etudes sante publique & epidemiologie", {
  x: 1.0, y: 5.4, w: 5.4, h: 0.3,
  fontFace: F.body, fontSize: 10.5, color: "CBD5E1", italic: true, margin: 0,
});
s14.addText("naissa.chateau@ors-guyane.org", {
  x: 1.0, y: 5.7, w: 5.4, h: 0.3,
  fontFace: F.body, fontSize: 11, color: C.white, margin: 0,
});
s14.addText("Observatoire Regional de la Sante de Guyane", {
  x: 1.0, y: 6.35, w: 5.4, h: 0.3,
  fontFace: F.body, fontSize: 10, color: "94A3B8", italic: true, margin: 0,
});

// Prestataires (droite)
s14.addShape(pres.shapes.RECTANGLE, {
  x: 6.8, y: 3.1, w: 5.7, h: 3.7,
  fill: { color: C.white, transparency: 92 }, line: { color: C.teal, width: 1 },
});
s14.addText("PRESTATAIRES", {
  x: 7.0, y: 3.25, w: 5.3, h: 0.35,
  fontFace: F.body, fontSize: 11, color: C.teal, bold: true, charSpacing: 4, margin: 0,
});

s14.addText("N.O.V.I. Connected", {
  x: 7.0, y: 3.65, w: 5.3, h: 0.4,
  fontFace: F.head, fontSize: 16, color: C.white, bold: true, margin: 0,
});
s14.addText("Prestataire du MVP (BDC N250219)", {
  x: 7.0, y: 4.05, w: 5.3, h: 0.3,
  fontFace: F.body, fontSize: 10.5, color: "CBD5E1", italic: true, margin: 0,
});
s14.addText("contact@novi-connected.fr", {
  x: 7.0, y: 4.35, w: 5.3, h: 0.3,
  fontFace: F.body, fontSize: 11, color: C.white, margin: 0,
});

s14.addShape(pres.shapes.LINE, {
  x: 7.0, y: 4.85, w: 5.3, h: 0, line: { color: C.teal, width: 0.5, transparency: 50 },
});

s14.addText("Cedric ATTICOT DIT RAVINO", {
  x: 7.0, y: 5.0, w: 5.3, h: 0.4,
  fontFace: F.head, fontSize: 15, color: C.white, bold: true, margin: 0,
});
s14.addText("Architecte Digital - Consultant partenaire N.O.V.I.", {
  x: 7.0, y: 5.4, w: 5.3, h: 0.3,
  fontFace: F.body, fontSize: 10.5, color: "CBD5E1", italic: true, margin: 0,
});
s14.addText("cedric.atticot@live.fr", {
  x: 7.0, y: 5.7, w: 5.3, h: 0.3,
  fontFace: F.body, fontSize: 11, color: C.white, margin: 0,
});
s14.addText("+33 6 50 75 43 89", {
  x: 7.0, y: 6.0, w: 5.3, h: 0.3,
  fontFace: F.body, fontSize: 11, color: C.white, margin: 0,
});
s14.addText("Deploiement, maintenance, support : facturation directe", {
  x: 7.0, y: 6.35, w: 5.3, h: 0.3,
  fontFace: F.body, fontSize: 10, color: "94A3B8", italic: true, margin: 0,
});

// Bandeau final
s14.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: SH - 0.35, w: SW, h: 0.35,
  fill: { color: C.teal }, line: { color: C.teal, width: 0 },
});
s14.addText("PRISME / Data Visus - Point projet et dernieres phases - 17 avril 2026", {
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
