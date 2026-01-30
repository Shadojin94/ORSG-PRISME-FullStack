import {
    Users,
    HeartPulse,
    Stethoscope,
    Activity,
    AlertTriangle,
    Car
} from "lucide-react"

// BDI Themes - Arborescence exacte du client ORSG
// Alignee sur themes_config.json (themeTree)

export const BDI_THEMES = [
    {
        id: "pop_cond_vie",
        title: "Population et Conditions de Vie",
        shortTitle: "Population & Conditions de Vie",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-600",
        description: "Demographie, Education, Emploi, Revenus, Conditions de vie",
        available: true,
        subThemes: [
            {
                id: "population",
                title: "Population",
                datasets: [],
                subThemes: [
                    {
                        id: "structure_pop",
                        title: "Structure de la population - Recensement",
                        datasets: [
                            { id: "densite", label: "Densite de population", source: "INSEE" },
                            { id: "structure_quinq", label: "Structure quinquennale de la population", source: "INSEE / MOCA-O", demoReady: true, availableYears: [2020, 2021, 2022] },
                            { id: "structure_grp", label: "Structure par groupe d'age", source: "MOCA-O", demoReady: true, availableYears: [2020, 2021, 2022] },
                        ]
                    },
                    {
                        id: "naissance_fecondite",
                        title: "Naissance, fecondite",
                        datasets: [
                            { id: "indice_fecondite", label: "Indice de fecondite", source: "INSEE / MOCA-O", demoReady: true, availableYears: [2022, 2023] },
                            { id: "fecondite", label: "Naissances et fecondite", source: "MOCA-O", demoReady: true, availableYears: [2022, 2023] },
                        ]
                    },
                    {
                        id: "petite_enfance",
                        title: "Petite enfance",
                        datasets: [
                            { id: "pop_inf3ans", label: "Population < 3 ans", source: "INSEE / MOCA-O", demoReady: true, availableYears: [2020, 2021, 2022, 2023] },
                        ]
                    },
                    {
                        id: "personnes_agees",
                        title: "Personnes agees",
                        datasets: [
                            { id: "accroiss_sup65ans", label: "Accroissement population 65+", source: "INSEE" },
                        ]
                    }
                ]
            },
            {
                id: "education",
                title: "Education",
                datasets: [
                    { id: "educ", label: "Scolarisation et diplomes (population 6-16 et 15-64 ans)", source: "INSEE / MOCA-O", demoReady: true, availableYears: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022] },
                ]
            },
            {
                id: "emploi_revenu",
                title: "Emploi et revenu",
                datasets: [],
                subThemes: [
                    {
                        id: "emploi",
                        title: "Emploi",
                        datasets: [
                            { id: "emplois", label: "Emploi et activite", source: "INSEE / MOCA-O", demoReady: true, availableYears: [2020, 2021, 2022] },
                        ]
                    },
                    {
                        id: "revenu",
                        title: "Revenu",
                        datasets: [
                            { id: "revenu", label: "Revenus et fiscalite", source: "INSEE / MOCA-O", demoReady: true, availableYears: [2021, 2022, 2023] },
                        ]
                    }
                ]
            },
            {
                id: "prestations_sociales",
                title: "Prestations sociales",
                datasets: [
                    { id: "alloc", label: "Allocataires prestations sociales", source: "INSEE / MOCA-O", demoReady: true, availableYears: [2020, 2021, 2022, 2023] },
                ]
            },
            {
                id: "conditions_vie",
                title: "Conditions de vie",
                datasets: [],
                subThemes: [
                    {
                        id: "cond_vie_anciens",
                        title: "Conditions de vie anciens",
                        datasets: [
                            { id: "pers_sup65ans_seules", label: "Personnes 65+ seules", source: "INSEE / MOCA-O", demoReady: true, availableYears: [2020, 2021, 2022] },
                        ]
                    },
                    {
                        id: "cond_vie_enfants",
                        title: "Conditions de vie enfants",
                        datasets: [
                            { id: "familles_mono", label: "Familles monoparentales", source: "INSEE / MOCA-O", demoReady: true, availableYears: [2020, 2021, 2022] },
                            { id: "accueil_pop_inf3ans", label: "Accueil petite enfance", source: "DREES" },
                        ]
                    },
                    {
                        id: "cond_vie_generales",
                        title: "Conditions de vie generales",
                        datasets: [
                            { id: "pers_menages", label: "Menages", source: "INSEE / MOCA-O" },
                            { id: "types_menages", label: "Types de menages", source: "INSEE / MOCA-O", demoReady: true, availableYears: [2020, 2021] },
                        ]
                    }
                ]
            }
        ],
        datasets: []
    },
    {
        id: "etat_sante",
        title: "Etat de Sante",
        shortTitle: "Etat de Sante",
        icon: HeartPulse,
        color: "text-green-600",
        bgColor: "bg-green-600",
        description: "Esperance de vie, Mortalite generale et prematuree, Mortalite infantile",
        available: true,
        subThemes: [
            {
                id: "esperance_vie",
                title: "Esperance de Vie",
                datasets: [
                    { id: "esp_vie", label: "Esperance de vie a 65 ans et a la naissance", source: "INSEE / MOCA-O" },
                ]
            },
            {
                id: "mortalite",
                title: "Mortalite",
                datasets: [
                    { id: "dc_gene_prema", label: "Mortalite generale et prematuree", source: "INSERM-CepiDc / MOCA-O" },
                    { id: "dc_infantil_neonat", label: "Mortalite infantile et neonatale", source: "INSERM-CepiDc / MOCA-O" },
                ]
            }
        ],
        datasets: []
    },
    {
        id: "struct_acti_soins",
        title: "Structures et Activites de Soins",
        shortTitle: "Offre de Soins",
        icon: Stethoscope,
        color: "text-cyan-600",
        bgColor: "bg-cyan-600",
        description: "Equipements hospitaliers, Activites, Professionnels de sante",
        available: true,
        subThemes: [
            {
                id: "equipements",
                title: "Equipements",
                datasets: [
                    { id: "equipements_acti", label: "Lits et places (Medecine, Chirurgie, Obstetrique, Psy, SSR, HAD, USLD)", source: "DREES SAE" },
                ]
            },
            {
                id: "activites",
                title: "Activites",
                datasets: [
                    { id: "recours_hospi", label: "Recours et occupation hospitaliere", source: "ATIH / MOCA-O" },
                ]
            },
            {
                id: "professionnels",
                title: "Professionnels de Sante",
                datasets: [
                    { id: "ds_med", label: "Densite medecins", source: "RPPS / MOCA-O" },
                    { id: "ds_gene_tousmode", label: "Medecins generalistes", source: "RPPS / MOCA-O" },
                    { id: "ds_medspe", label: "Medecins specialistes", source: "RPPS / MOCA-O" },
                    { id: "apl_medgene", label: "APL Medecin generaliste", source: "DREES" },
                    { id: "autres_prof_med_pha", label: "Autres professionnels (Dentistes, Pharmaciens, Sages-femmes, Infirmiers, Kines)", source: "RPPS / ADELI / MOCA-O" },
                ]
            }
        ],
        datasets: []
    },
    {
        id: "pathologies",
        title: "Pathologies",
        shortTitle: "Pathologies",
        icon: Activity,
        color: "text-red-600",
        bgColor: "bg-red-600",
        description: "Maladies cardiovasculaires, respiratoires, neurologiques, cancers, diabete, VIH, troubles mentaux",
        available: true,
        subThemes: [
            {
                id: "cardiovasculaire",
                title: "Maladies Cardiovasculaires",
                datasets: [
                    { id: "mortalite_cardio", label: "Mortalite AVC, Cardiopathies, Insuffisance cardiaque", source: "INSERM-CepiDc / MOCA-O" },
                    { id: "prevalence_cardio", label: "Prevalence HTA, AVC, Insuffisance cardiaque", source: "SNDS" },
                ]
            },
            {
                id: "respiratoire",
                title: "Maladies Respiratoires",
                datasets: [
                    { id: "mortalite_respi", label: "Mortalite respiratoire, Asthme, BPCO", source: "INSERM-CepiDc / MOCA-O" },
                ]
            },
            {
                id: "neurologique",
                title: "Maladies Neurologiques",
                datasets: [
                    { id: "mortalite_neuro", label: "Mortalite Alzheimer, Parkinson", source: "INSERM-CepiDc / MOCA-O" },
                ]
            },
            {
                id: "cancers",
                title: "Cancers",
                datasets: [
                    { id: "mortalite_cancer", label: "Mortalite cancers (poumon, sein, colorectal, prostate)", source: "INSERM-CepiDc / MOCA-O" },
                ]
            },
            {
                id: "metabolique",
                title: "Maladies Metaboliques",
                datasets: [
                    { id: "mortalite_diabete", label: "Mortalite diabete, maladies foie/pancreas", source: "INSERM-CepiDc / MOCA-O" },
                ]
            },
            {
                id: "infectieuses",
                title: "Maladies Infectieuses",
                datasets: [
                    { id: "mortalite_vih", label: "Mortalite VIH/SIDA", source: "INSERM-CepiDc / MOCA-O" },
                ]
            },
            {
                id: "troubles_mentaux",
                title: "Troubles Mentaux",
                datasets: [
                    { id: "mortalite_psy", label: "Mortalite troubles mentaux", source: "INSERM-CepiDc / MOCA-O" },
                ]
            }
        ],
        datasets: []
    },
    {
        id: "comportements",
        title: "Comportements",
        shortTitle: "Comportements",
        icon: AlertTriangle,
        color: "text-amber-600",
        bgColor: "bg-amber-600",
        description: "Addictions (Alcool, Tabac), Suicide",
        available: true,
        subThemes: [
            {
                id: "addictions",
                title: "Addictions",
                datasets: [
                    { id: "comp_mortalite_alcool", label: "Mortalite liee a l'alcool", source: "INSERM-CepiDc / MOCA-O" },
                    { id: "comp_mortalite_tabac", label: "Mortalite liee au tabac", source: "INSERM-CepiDc / MOCA-O" },
                ]
            },
            {
                id: "suicide",
                title: "Suicide",
                datasets: [
                    { id: "comp_mortalite_suicide", label: "Mortalite par suicide", source: "INSERM-CepiDc / MOCA-O" },
                ]
            }
        ],
        datasets: []
    },
    {
        id: "traumatismes",
        title: "Traumatismes",
        shortTitle: "Traumatismes",
        icon: Car,
        color: "text-orange-600",
        bgColor: "bg-orange-600",
        description: "Accidents de la route, Noyades",
        available: true,
        subThemes: [
            {
                id: "accidents_route",
                title: "Accidents de la Route",
                datasets: [
                    { id: "route", label: "Accidents, blesses, deces", source: "ONISR / Barometre Accidents" },
                ]
            },
            {
                id: "noyades",
                title: "Noyades",
                datasets: [
                    { id: "noyades", label: "Noyades et deces par noyade", source: "SPF / GEODES" },
                ]
            }
        ],
        datasets: []
    }
]

// Helper function to get flat list of all themes for simple selection
export function getFlatThemes() {
    return BDI_THEMES.map(theme => ({
        id: theme.id,
        title: theme.title,
        shortTitle: theme.shortTitle,
        icon: theme.icon,
        color: theme.color,
        bgColor: theme.bgColor,
        description: theme.description,
        available: theme.available
    }))
}

// Helper to get all datasets for a theme (flat)
export function getThemeDatasets(themeId: string) {
    const theme = BDI_THEMES.find(t => t.id === themeId)
    if (!theme) return []

    const allDatasets: any[] = []
    const collectDatasets = (subThemes: any[]) => {
        for (const st of subThemes) {
            if (st.datasets) allDatasets.push(...st.datasets)
            if (st.subThemes) collectDatasets(st.subThemes)
        }
    }
    collectDatasets(theme.subThemes || [])
    if (theme.datasets) allDatasets.push(...theme.datasets)
    return allDatasets
}

// Helper to get sub-themes for a theme
export function getSubThemes(themeId: string) {
    const theme = BDI_THEMES.find(t => t.id === themeId)
    return theme?.subThemes || []
}
