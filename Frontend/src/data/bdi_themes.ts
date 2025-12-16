import { Activity, Users, Stethoscope, HeartPulse, AlertTriangle, GraduationCap } from "lucide-react"

export const BDI_THEMES = [
    {
        id: "educ",
        title: "Éducation",
        shortTitle: "Éducation",
        icon: GraduationCap,
        color: "text-orsg-blue",
        bgColor: "bg-orsg-blue",
        description: "Scolarisation, Diplômes, Formation",
        datasets: [
            { id: "pop_6_16", label: "Population 6-16 ans", source: "INSEE / MOCA-O" },
            { id: "nb_non_sco", label: "Nb jeunes 6-16 ans non scolarisés", source: "INSEE / MOCA-O" },
            { id: "pop_15_64", label: "Population 15-64 ans", source: "INSEE / MOCA-O" },
            { id: "nb_peu_dipl", label: "Nb personnes peu diplômées", source: "INSEE / MOCA-O" },
        ]
    },
    {
        id: "pop_cond_vie",
        title: "Population et Conditions de Vie",
        shortTitle: "Population",
        icon: Users,
        color: "text-blue-500",
        bgColor: "bg-blue-500",
        description: "Démographie, Familles, Précarité, Logement",
        datasets: [
            { id: "demo", label: "Démographie (Naissance, Décès)", source: "INSEE / MOCA-O" },
            { id: "famille", label: "Structure Familiale", source: "INSEE" },
            { id: "precarite", label: "Précarité & Revenus", source: "INSEE / CAF" },
        ]
    },
    {
        id: "etat_sante",
        title: "État de Santé",
        shortTitle: "Santé",
        icon: HeartPulse,
        color: "text-green-500",
        bgColor: "bg-green-500",
        description: "Mortalité, Espérance de vie, Morbidité",
        datasets: [
            { id: "mortalite", label: "Mortalité Générale (CépiDc)", source: "CépiDc" },
            { id: "esp_vie", label: "Espérance de Vie", source: "INSEE" },
            { id: "morta_inf", label: "Mortalité Infantile", source: "INSEE / ORSG" },
        ]
    },
    {
        id: "struct_soins",
        title: "Structures et Activités de Soins",
        shortTitle: "Offre de Soins",
        icon: Stethoscope,
        color: "text-blue-400",
        bgColor: "bg-blue-400",
        description: "Établissements (SAE), Professionnels de santé (RPPS)",
        datasets: [
            { id: "etablissements", label: "Établissements (SAE)", source: "DREES" },
            { id: "prof_sante", label: "Professionnels Libéraux", source: "RPPS / ADELI" },
            { id: "urgence", label: "Passages aux Urgences", source: "OSCOUR" },
        ]
    },
    {
        id: "pathologies",
        title: "Pathologies",
        shortTitle: "Pathologies",
        icon: Activity,
        color: "text-red-500",
        bgColor: "bg-red-500",
        description: "Maladies chroniques, Cancers, Maladies infectieuses",
        datasets: [
            { id: "ald", label: "Affections Longue Durée", source: "CNAM" },
            { id: "cancers", label: "Cancers (Registres)", source: "Francim" },
            { id: "diabete", label: "Diabète", source: "CNAM" },
            { id: "mal_infect", label: "Maladies Infectieuses", source: "SPF" },
        ]
    },
    {
        id: "comportements",
        title: "Comportements & Traumatismes",
        shortTitle: "Comportements",
        icon: AlertTriangle,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500",
        description: "Addictions, Accidents, Suicides",
        datasets: [
            { id: "addict", label: "Addictions (Tabac, Alcool)", source: "Baromètre Santé" },
            { id: "accidents", label: "Accidents de la route", source: "ONISR" },
            { id: "suicide", label: "Suicides & Tentatives", source: "CépiDc / Hospi" },
        ]
    }
]
