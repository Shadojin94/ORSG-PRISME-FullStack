import {
    Users,
    HeartPulse,
    Stethoscope,
    Activity,
    AlertTriangle,
    Car
} from "lucide-react"

// BDI Themes - Dictionnaire complet des indicateurs ORSG
// Source: BDI_Dictionnaire_Indicateurs.xlsx (6 onglets)
// Aligné sur themes_config.json (datasets backend)

export const BDI_THEMES = [
    {
        id: "pop_cond_vie",
        title: "Population et Conditions de Vie",
        shortTitle: "Population & Conditions de Vie",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-600",
        description: "Démographie, Naissances, Petite enfance, Personnes âgées, Éducation, Emploi, Revenu, Prestations sociales, Conditions de vie",
        available: true,
        subThemes: [
            {
                id: "structure_pop",
                title: "Structure de la population",
                datasets: [
                    { id: "densite", label: "Densité de population", variable: "densite_pop", source: "INSEE", tool: "Calcul", demoReady: true },
                    { id: "structure_quinq", label: "Répartition de la population par sexe (hommes, femmes)", variable: "rep_fh, pop_femme, pop_homme", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "structure_grp", label: "Structure de la population par âge", variable: "pop_age", source: "INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "naissance_fecondite",
                title: "Naissances, fécondité",
                datasets: [
                    { id: "indice_fecondite", label: "Indice de fécondité (ICF)", variable: "icf", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "fecondite", label: "Nombre de naissances vivantes", variable: "nb_naiss_vivante", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "fecondite", label: "Taux de fécondité", variable: "tx_fecondite", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "indice_fecondite", label: "Taux de natalité", variable: "tx_natalite", source: "INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "petite_enfance",
                title: "Petite enfance",
                datasets: [
                    { id: "pop_inf3ans", label: "Part des enfants de moins de 3 ans dans la population", variable: "tx_inf3ans", source: "INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "personnes_agees",
                title: "Personnes âgées",
                datasets: [
                    { id: "pers_sup65ans_seules", label: "Nombre de personnes de 65 ans et plus", variable: "nb_pop_65ans", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "accroiss_sup65ans", label: "Taux d'accroissement de la population des plus de 65 ans", variable: "tx_accroiss", source: "INSEE" },
                ]
            },
            {
                id: "education",
                title: "Éducation",
                datasets: [
                    { id: "educ", label: "Nombre de jeunes de 6-16 ans non scolarisés", variable: "nb_non_sco", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "educ", label: "Part des jeunes de 6-16 ans non scolarisés", variable: "tx_non_sco", source: "INSEE", tool: "Calcul" },
                    { id: "educ", label: "Nombre de personnes de 15 ans et plus peu ou pas diplômées", variable: "nb_peu_dipl", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "educ", label: "Part des personnes de 15 ans et plus peu ou pas diplômées", variable: "tx_peu_dipl", source: "INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "emploi",
                title: "Emploi",
                datasets: [
                    { id: "emplois", label: "Nombre d'actifs de plus de 15 ans", variable: "nb_actifs", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "emplois", label: "Taux d'activité des 15 ans et plus", variable: "tx_actifs", source: "INSEE", tool: "Calcul" },
                    { id: "emplois", label: "Nombre de cadres", variable: "nb_cadres", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "emplois", label: "Nombre d'ouvriers", variable: "nb_ouvriers", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "emplois", label: "Population de plus de 15 ans", variable: "nb_pop", source: "INSEE", tool: "MOCA-O" },
                    { id: "emplois", label: "Rapport ouvriers/cadres", variable: "rapp_ouvriers_cadres", source: "INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "revenu",
                title: "Revenu",
                datasets: [
                    { id: "revenu", label: "Nombre de foyers fiscaux imposables", variable: "nb_foyers_imposes", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "revenu", label: "Nombre de foyers fiscaux non imposables", variable: "nb_foyers_non_impos", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "revenu", label: "Part des foyers fiscaux non imposables", variable: "tx_foyers_non_impo", source: "INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "prestations_sociales",
                title: "Prestations sociales - Allocataires",
                datasets: [
                    { id: "alloc", label: "Nombre de personnes couvertes par au moins une prestation CNAF", variable: "nb_alloc", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "alloc", label: "Part des ménages couverts par au moins une prestation CNAF", variable: "tx_presta_sociales", source: "INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "cond_vie_generales",
                title: "Conditions de vie - Caractéristiques générales",
                datasets: [
                    { id: "alloc", label: "Nombre de ménages", variable: "nb_menages", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "pers_menages", label: "Nombre de ménages selon le nombre de personnes", variable: "nb_menages", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "types_menages", label: "Part des ménages selon leur type", variable: "part_types_menages", source: "INSEE", tool: "Calcul", demoReady: true },
                    { id: "types_menages", label: "Nombre de ménages selon le type", variable: "tot_menages", source: "INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "cond_vie_enfants",
                title: "Conditions de vie des enfants",
                datasets: [
                    { id: "accueil_pop_inf3ans", label: "Nombre total d'établissements d'accueil collectif", variable: "nb_etab_co", source: "DREES", tool: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre de halte-garderies", variable: "nb_etab_hg", source: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre de jardins d'enfants", variable: "nb_etab_je", source: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre de crèches collectives", variable: "nb_etab_mono", source: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre d'établissements multi-accueil", variable: "nb_etab_multi", source: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre de Maisons d'Assistantes Maternelles", variable: "nb_mam", source: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre total de places d'accueil collectif", variable: "nb_places_acceuil_co", source: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre de places d'accueil familial", variable: "nb_places_familial", source: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre de places en halte-garderies", variable: "nb_places_hg", source: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre de places en crèches collectives (mono-accueil)", variable: "nb_places_mono", source: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre de places en structures multi-accueil", variable: "nb_places_multi", source: "DREES" },
                    { id: "accueil_pop_inf3ans", label: "Nombre de services d'accueil familial", variable: "nb_services_familial", source: "DREES" },
                    { id: "familles_mono", label: "Nombre de familles avec au moins un enfant de moins de 25 ans", variable: "nb_familles_enf", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "familles_mono", label: "Nombre de familles monoparentales avec enfant(s) de moins de 25 ans", variable: "nb_familles_mono_enf", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "familles_mono", label: "Part des familles monoparentales", variable: "tx_familles_mono", source: "INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "cond_vie_anciens",
                title: "Conditions de vie des personnes âgées",
                datasets: [
                    { id: "pers_sup65ans_seules", label: "Nombre de personnes de 65 ans et plus vivant seules", variable: "nb_pop_65ans_seule", source: "INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "pers_sup65ans_seules", label: "Part des personnes de 65 ans ou plus vivant seules", variable: "tx_pop_65ans_seule", source: "INSEE", tool: "Calcul" },
                ]
            }
        ],
        datasets: []
    },
    {
        id: "etat_sante",
        title: "État de Santé",
        shortTitle: "État de Santé",
        icon: HeartPulse,
        color: "text-green-600",
        bgColor: "bg-green-600",
        description: "Espérance de vie, Mortalité générale et prématurée, Mortalité infantile et néonatale",
        available: true,
        subThemes: [
            {
                id: "esperance_vie",
                title: "Espérance de vie",
                datasets: [
                    { id: "esp_vie", label: "Espérance de vie à 65 ans", variable: "esp_65", source: "INSEE", tool: "MOCA-O" },
                    { id: "esp_vie", label: "Espérance de vie à la naissance", variable: "esp_naiss", source: "INSEE", tool: "MOCA-O" },
                ]
            },
            {
                id: "mortalite_generale",
                title: "Mortalité générale et prématurée",
                datasets: [
                    { id: "dc_gene_prema", label: "Mortalité générale (taux standardisé)", variable: "m_gene", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O" },
                    { id: "dc_gene_prema", label: "Mortalité prématurée (avant 65 ans)", variable: "m_prema", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O" },
                    { id: "dc_gene_prema", label: "Nombre de décès généraux", variable: "nb_gene", source: "INSERM-CépiDc", tool: "MOCA-O" },
                    { id: "dc_gene_prema", label: "Nombre de décès prématurés", variable: "nb_prema", source: "INSERM-CépiDc", tool: "MOCA-O" },
                    { id: "mortalite_gen", label: "Mortalité toutes causes (Open Data)", variable: "effectifs, taux", source: "INSERM-CépiDc Open Data", demoReady: true },
                    { id: "mortalite_covid", label: "Mortalité Covid-19 (Open Data)", variable: "effectifs, taux", source: "INSERM-CépiDc Open Data", demoReady: true },
                ]
            },
            {
                id: "mortalite_infantile",
                title: "Mortalité infantile et néonatale",
                datasets: [
                    { id: "dc_infantil_neonat", label: "Mortalité infantile (taux)", variable: "m_infantile", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O" },
                    { id: "dc_infantil_neonat", label: "Nombre de décès infantiles", variable: "nb_infantile", source: "INSERM-CépiDc", tool: "MOCA-O" },
                    { id: "dc_infantil_neonat", label: "Mortalité néonatale (0-27 jours)", variable: "m_neonat", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O" },
                    { id: "dc_infantil_neonat", label: "Nombre de décès néonataux", variable: "nb_neonat", source: "INSERM-CépiDc", tool: "MOCA-O" },
                ]
            }
        ],
        datasets: []
    },
    {
        id: "struct_acti_soins",
        title: "Structures et Activités de Soins",
        shortTitle: "Offre de Soins",
        icon: Stethoscope,
        color: "text-cyan-600",
        bgColor: "bg-cyan-600",
        description: "Équipements hospitaliers (lits et places), Activités (recours et occupation), Professionnels de santé",
        available: true,
        subThemes: [
            {
                id: "equip_medecine",
                title: "Équipements - Médecine",
                datasets: [
                    { id: "equipements_acti", label: "Nb Lits Médecine Hospi Complète", variable: "lit_med", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Lits Médecine Hospi Complète (pour 1 000 hab.)", variable: "tx_lit_med", source: "DREES, SAE, INSEE", tool: "Calcul" },
                    { id: "equipements_acti", label: "Nb Places Médecine Hospi Partielle", variable: "pla_med", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Places Médecine Hospi Partielle", variable: "tx_pla_med", source: "DREES, SAE, INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "equip_chirurgie",
                title: "Équipements - Chirurgie",
                datasets: [
                    { id: "equipements_acti", label: "Nb Lits Chirurgie Hospi Complète", variable: "lit_chir", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Lits Chirurgie Hospi Complète", variable: "tx_lit_chir", source: "DREES, SAE, INSEE", tool: "Calcul" },
                    { id: "equipements_acti", label: "Nb Places Chirurgie Hospi Partielle", variable: "pla_chir", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Places Chirurgie Hospi Partielle", variable: "tx_pla_chir", source: "DREES, SAE, INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "equip_obstetrique",
                title: "Équipements - Gynécologie-Obstétrique",
                datasets: [
                    { id: "equipements_acti", label: "Nb Lits Obstétrique Hospi Complète", variable: "lit_obs", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Lits Obstétrique (pour 1 000 femmes 15+)", variable: "tx_lit_obs", source: "DREES, SAE, INSEE", tool: "Calcul" },
                    { id: "equipements_acti", label: "Nb Places Obstétrique Hospi Partielle", variable: "pla_obs", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Places Obstétrique", variable: "tx_pla_obs", source: "DREES, SAE, INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "equip_psychiatrie",
                title: "Équipements - Psychiatrie",
                datasets: [
                    { id: "equipements_acti", label: "Nb Lits Psy Générale Hospi Complète", variable: "lit_psy_gen", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Lits Psy Générale (pour 1 000 hab. 17+)", variable: "tx_lits_psygen", source: "DREES, SAE, INSEE", tool: "Calcul" },
                    { id: "equipements_acti", label: "Nb Places Psy Générale Hospi Partielle", variable: "pla_psy_gen", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Places Psy Générale", variable: "tx_pla_psygen", source: "DREES, SAE, INSEE", tool: "Calcul" },
                    { id: "equipements_acti", label: "Nb Lits Psy Juvénile Hospi Complète", variable: "lit_psy_inf", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Lits Psy Juvénile (pour 1 000 hab. 16-)", variable: "tx_lit_psyinf", source: "DREES, SAE, INSEE", tool: "Calcul" },
                    { id: "equipements_acti", label: "Nb Places Psy Juvénile Hospi Partielle", variable: "pla_psy_inf", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Places Psy Juvénile", variable: "tx_pla_psyinf", source: "DREES, SAE, INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "equip_ssr_had_usld",
                title: "Équipements - SSR, HAD, USLD",
                datasets: [
                    { id: "equipements_acti", label: "Nb Lits SSR Hospi Complète", variable: "lit_ssr", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Lits SSR", variable: "tx_lit_ssr", source: "DREES, SAE, INSEE", tool: "Calcul" },
                    { id: "equipements_acti", label: "Capacité HAD", variable: "capacite_had", source: "DREES, SAE, INSEE", tool: "Calcul" },
                    { id: "equipements_acti", label: "Nb Capacités HAD", variable: "capa_had", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Nb Lits USLD Hospi Complète", variable: "lit_usld", source: "DREES, SAE, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Taux Lits USLD (pour 1 000 hab. 60+)", variable: "tx_lits_usld", source: "DREES, SAE, INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "acti_medecine_chirurgie",
                title: "Activités - Médecine, Chirurgie, Obstétrique",
                datasets: [
                    { id: "equipements_acti", label: "Recours Médecine Hospi Complète", variable: "rec_med", source: "ATIH, INSEE", tool: "MOCA-O" },
                    { id: "equipements_acti", label: "Occupation Médecine Hospi Complète", variable: "tx_occup_med", source: "DREES, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Recours Chirurgie Hospi Complète", variable: "rec_chir", source: "ATIH, INSEE", tool: "MOCA-O" },
                    { id: "equipements_acti", label: "Occupation Chirurgie Hospi Complète", variable: "occup_chir", source: "DREES, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Recours Obstétrique Hospi Complète (femmes 15+)", variable: "rec_obs", source: "ATIH, INSEE", tool: "MOCA-O" },
                    { id: "equipements_acti", label: "Occupation Obstétrique Hospi Complète", variable: "occup_obs", source: "DREES, INSEE", tool: "Enquête SAE" },
                ]
            },
            {
                id: "acti_psy_ssr_had",
                title: "Activités - SSR, Psychiatrie, HAD",
                datasets: [
                    { id: "equipements_acti", label: "Recours SSR Hospi Complète", variable: "rec_ssr", source: "ATIH, INSEE", tool: "MOCA-O" },
                    { id: "equipements_acti", label: "Occupation SSR Hospi Complète", variable: "occup_ssr", source: "DREES, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Recours Psy Générale Hospi Complète (17+)", variable: "rec_psy_g", source: "ATIH, INSEE", tool: "MOCA-O" },
                    { id: "equipements_acti", label: "Occupation Psy Générale Hospi Complète", variable: "occup_psygen", source: "DREES, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Recours Psy Juvénile Hospi Complète (16-)", variable: "rec_psy_juv", source: "ATIH, INSEE", tool: "MOCA-O" },
                    { id: "equipements_acti", label: "Occupation Psy Juvénile Hospi Complète", variable: "occup_psyinf", source: "DREES, INSEE", tool: "Enquête SAE" },
                    { id: "equipements_acti", label: "Recours HAD Hospi Complète", variable: "rec_had", source: "ATIH, INSEE", tool: "MOCA-O" },
                    { id: "equipements_acti", label: "Recours USLD", variable: "rec_usld", source: "ATIH, INSEE", tool: "MOCA-O" },
                ]
            },
            {
                id: "prof_medecins_ensemble",
                title: "Professionnels - Ensemble des médecins",
                datasets: [
                    { id: "ds_med", label: "Densité en médecins, tous modes d'exercice", variable: "medecins_densite", source: "RPPS, INSEE", tool: "MOCA-O" },
                    { id: "nb_med", label: "Nombre de médecins, tous modes d'exercice", variable: "nb_med", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_med_inf62a", label: "Part des médecins âgés de plus de 62 ans", variable: "pt_med_inf62a", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_med_inf62a", label: "Nombre de médecins âgés de moins de 62 ans", variable: "nb_med_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "dens_med_gdesspe", label: "Densité en médecins selon les grandes catégories de spécialités", variable: "gdsecateg_spe", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_medecins_gdesspe", label: "Nombre de médecins selon les grandes catégories de spécialités", variable: "gdsecateg_spe", source: "RPPS", tool: "MOCA-O" },
                    { id: "dens_medecins_spemed", label: "Densité en médecins selon les spécialités médicales", variable: "spemed", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_medecins_spemed", label: "Nombre de médecins selon les spécialités médicales", variable: "spemed", source: "RPPS", tool: "MOCA-O" },
                    { id: "dens_med_spechir", label: "Densité en médecins selon les spécialités chirurgicales", variable: "spechir", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_medecins_spechir", label: "Nombre de médecins selon les spécialités chirurgicales", variable: "spechir", source: "RPPS", tool: "MOCA-O" },
                ]
            },
            {
                id: "prof_medecins_generalistes",
                title: "Professionnels - Médecine générale",
                datasets: [
                    { id: "ds_gene_tousmode", label: "Densité en médecins généralistes tous modes d'exercice", variable: "medecins_densite", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_gene_tousmode", label: "Nombre de médecins généralistes tous modes d'exercice", variable: "nb_gene_tousmode", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_genetsmodinf62", label: "Part des médecins généralistes âgés de plus de 62 ans", variable: "pt_genetsmodinf62", source: "RPPS", tool: "Calcul" },
                    { id: "ds_gene_lib", label: "Densité en médecins généralistes libéraux", variable: "ds_gene_lib", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_gene_lib", label: "Nombre de médecins généralistes libéraux", variable: "nb_gene_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_gene_lib_sup62a", label: "Nombre de médecins généralistes libéraux âgés de plus de 62 ans", variable: "nb_gene_lib_sup62a", source: "RPPS", tool: "Calcul" },
                    { id: "pt_gene_lib_inf62a", label: "Part des médecins généralistes libéraux âgés de plus de 62 ans", variable: "pt_gene_lib_inf62a", source: "RPPS", tool: "Calcul" },
                    { id: "apl_medgene", label: "APL médecin généraliste", variable: "apl_med_gen", source: "SNIIR-AM, DREES", tool: "DREES / Finess" },
                    { id: "apl_medgene_inf62ans", label: "APL médecin généraliste de moins de 62 ans", variable: "apl_medgene_inf62ans", source: "DREES" },
                    { id: "apl_medgene_inf65ans", label: "APL médecin généraliste de moins de 65 ans", variable: "apl_medgene_inf65ans", source: "DREES" },
                ]
            },
            {
                id: "prof_medecins_specialistes",
                title: "Professionnels - Médecine spécialisée",
                datasets: [
                    { id: "ds_medspe", label: "Densité en médecins spécialistes tous modes d'exercice", variable: "medecins_densite", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_medspe", label: "Nombre de médecins spécialistes tous modes d'exercice", variable: "nb_medspe", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_medspe_inf62a", label: "Part des spécialistes âgés de moins de 62 ans", variable: "nb_medspe_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "ds_medspelib", label: "Densité en médecins spécialistes libéraux", variable: "ds_medspelib", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_medspe_lib", label: "Nombre de médecins spécialistes libéraux", variable: "nb_medspe_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_medspe_inf62a", label: "Part des spécialistes âgés de plus de 62 ans", variable: "pt_medspe_inf62a", source: "RPPS", tool: "Calcul" },
                    { id: "nb_medspe_lib_inf62a", label: "Nombre de spécialistes libéraux âgés de moins de 62 ans", variable: "nb_medspe_lib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_medspelibinf62a", label: "Part des spécialistes libéraux âgés de plus de 62 ans", variable: "pt_medspelibinf62a", source: "RPPS", tool: "Calcul" },
                ]
            },
            {
                id: "prof_cardiologie",
                title: "Professionnels - Cardiologie",
                datasets: [
                    { id: "ds_cardiolib", label: "Densité en cardiologues libéraux", variable: "medecins_densite", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_cardio_lib", label: "Nombre de cardiologues libéraux", variable: "nb_cardio_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_cardio_lib_inf62a", label: "Nombre de cardiologues libéraux de moins de 62 ans", variable: "nb_cardio_lib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_cardiolibinf62a", label: "Part des cardiologues libéraux âgés de plus de 62 ans", variable: "pt_cardiolibinf62a", source: "RPPS", tool: "Calcul" },
                ]
            },
            {
                id: "prof_psychiatrie",
                title: "Professionnels - Psychiatrie",
                datasets: [
                    { id: "ds_psylib", label: "Densité en psychiatres libéraux", variable: "medecins_densite", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_psy_lib", label: "Nombre de psychiatres libéraux", variable: "nb_psy_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_psy_lib_inf62a", label: "Nombre de psychiatres libéraux de moins de 62 ans", variable: "nb_psy_lib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_psylib_inf62a", label: "Part des psychiatres libéraux âgés de plus de 62 ans", variable: "pt_psylib_inf62a", source: "RPPS", tool: "Calcul" },
                ]
            },
            {
                id: "prof_gynecologie",
                title: "Professionnels - Gynécologie",
                datasets: [
                    { id: "ds_gyneco_lib", label: "Densité en gynécologues libéraux (pour 100 000 femmes 15+)", variable: "medecins_densite", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_gyneco_lib", label: "Nombre de gynécologues libéraux", variable: "nb_gyneco_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_gyneco_lib_inf62a", label: "Nombre de gynécologues libéraux de moins de 62 ans", variable: "nb_gyneco_lib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_gynecolibinf62a", label: "Part des gynécologues libéraux âgés de plus de 62 ans", variable: "pt_gynecolibinf62a", source: "RPPS", tool: "Calcul" },
                ]
            },
            {
                id: "prof_pediatrie",
                title: "Professionnels - Pédiatrie",
                datasets: [
                    { id: "dens_pediatres_lib", label: "Densité en pédiatres libéraux (pour 100 000 enfants -19 ans)", variable: "medecins_densite", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_pediatres_lib", label: "Nombre de pédiatres libéraux", variable: "nb_pediatres_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_pediatres_lib_inf62a", label: "Nombre de pédiatres libéraux de moins de 62 ans", variable: "nb_pediatres_lib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_pediat_libinf62", label: "Part des pédiatres libéraux âgés de plus de 62 ans", variable: "pt_pediat_libinf62", source: "RPPS", tool: "Calcul" },
                ]
            },
            {
                id: "prof_ophtalmologie",
                title: "Professionnels - Ophtalmologie",
                datasets: [
                    { id: "ds_ophtalmo_lib", label: "Densité en ophtalmologues libéraux", variable: "autres_prof_med_pha", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_ophtalmo_lib", label: "Nombre d'ophtalmologues libéraux", variable: "nb_ophtalmo_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_ophtalmo_lib_inf62a", label: "Nombre d'ophtalmologues libéraux de moins de 62 ans", variable: "nb_ophtalmo_lib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_ophtallibinf62a", label: "Part des ophtalmologues libéraux âgés de plus de 62 ans", variable: "pt_ophtallibinf62a", source: "RPPS", tool: "Calcul" },
                ]
            },
            {
                id: "prof_dentistes",
                title: "Professionnels - Chirurgie-dentaire",
                datasets: [
                    { id: "ds_dent_lib", label: "Densité en chirurgiens-dentistes libéraux", variable: "autres_prof_med_pha", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_dent_lib", label: "Nombre de chirurgiens-dentistes libéraux", variable: "nb_dent_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_dent_lib_inf62a", label: "Nombre de chirurgiens-dentistes libéraux de moins de 62 ans", variable: "nb_dent_lib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_dent_lib_inf62a", label: "Part des chirurgiens-dentistes libéraux âgés de plus de 62 ans", variable: "pt_dent_lib_inf62a", source: "RPPS", tool: "Calcul" },
                ]
            },
            {
                id: "prof_pharmaciens",
                title: "Professionnels - Pharmacies d'officine",
                datasets: [
                    { id: "dens_pharma_lib", label: "Densité en pharmaciens libéraux d'officine", variable: "autres_prof_med_pha", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_pharma_lib", label: "Nombre de pharmaciens libéraux d'officine", variable: "nb_pharma_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_pharma_lib_inf62a", label: "Nombre de pharmaciens libéraux de moins de 62 ans", variable: "nb_pharma_lib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_pharmalibinf62a", label: "Part des pharmaciens libéraux âgés de plus de 62 ans", variable: "pt_pharmalibinf62a", source: "RPPS", tool: "Calcul" },
                    { id: "dens_pharma", label: "Nombre d'habitants par pharmacie d'officine", variable: "dens_pharma", source: "RPPS", tool: "Calcul" },
                    { id: "nb_pharma", label: "Nombre de pharmacies d'officine", variable: "nb_pharma", source: "RPPS", tool: "MOCA-O / Finess" },
                ]
            },
            {
                id: "prof_sagesfemmes",
                title: "Professionnels - Sages-femmes",
                datasets: [
                    { id: "ds_sagesfem_lib", label: "Densité en sages-femmes libérales (pour 100 000 femmes 15+)", variable: "autres_prof_med_pha", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_agesfem_lib", label: "Nombre de sages-femmes libérales", variable: "nb_agesfem_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_sagesfemlib_inf62a", label: "Nombre de sages-femmes libérales de moins de 62 ans", variable: "nb_sagesfemlib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "pt_sagfemlibinf62a", label: "Part des sages-femmes libérales âgées de plus de 62 ans", variable: "pt_sagfemlibinf62a", source: "RPPS", tool: "Calcul" },
                ]
            },
            {
                id: "prof_infirmiers",
                title: "Professionnels - Infirmiers",
                datasets: [
                    { id: "dens_infirmiers_lib", label: "Densité en infirmiers libéraux", variable: "autres_prof_med_pha", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_infirm_lib", label: "Nombre d'infirmiers libéraux", variable: "nb_infirm_lib", source: "RPPS", tool: "MOCA-O / ADELI" },
                    { id: "nb_infirm_lib_inf62a", label: "Nombre d'infirmiers libéraux de moins de 62 ans", variable: "nb_infirm_lib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "part_infirmlibinf62a", label: "Part d'infirmiers libéraux âgés de plus de 62 ans", variable: "part_infirmlibinf62a", source: "RPPS", tool: "Calcul" },
                ]
            },
            {
                id: "prof_kinesitherapeutes",
                title: "Professionnels - Masseurs-kinésithérapeutes",
                datasets: [
                    { id: "dens_kine_lib", label: "Densité en masseurs-kinésithérapeutes libéraux", variable: "autres_prof_med_pha", source: "RPPS, INSEE", tool: "Calcul" },
                    { id: "nb_kine_lib", label: "Nombre de masseurs-kinésithérapeutes libéraux", variable: "nb_kine_lib", source: "RPPS", tool: "MOCA-O" },
                    { id: "nb_kine_lib_inf62a", label: "Nombre de masseurs-kinésithérapeutes libéraux de moins de 62 ans", variable: "nb_kine_lib_inf62a", source: "RPPS", tool: "MOCA-O" },
                    { id: "part_kine_lib_inf62a", label: "Part de masseurs-kinésithérapeutes libéraux âgés de plus de 62 ans", variable: "part_kine_lib_inf62a", source: "RPPS", tool: "Calcul" },
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
        description: "Cardiovasculaire, Respiratoire, Neurologique, Digestif, Métabolique, Infectieux, Troubles mentaux, Cancers, Handicap",
        available: true,
        subThemes: [
            {
                id: "cardio_hta",
                title: "Hypertension artérielle",
                datasets: [
                    { id: "prevalence_cardio", label: "Prévalence des traitements hypertenseurs", variable: "p_hta", source: "SNDS" },
                    { id: "mortalite_cardio", label: "Mortalité par maladies hypertensives", variable: "m_hta", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O" },
                ]
            },
            {
                id: "cardio_avc",
                title: "Maladies vasculaires cérébrales (AVC)",
                datasets: [
                    { id: "prevalence_cardio", label: "Prévalence de l'accident vasculaire cérébral aigu", variable: "p_avc", source: "SNDS" },
                    { id: "mortalite_cardio", label: "Mortalité par maladies vasculaires cérébrales", variable: "m_avc", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "cardio_ischemique",
                title: "Cardiopathies ischémiques",
                datasets: [
                    { id: "mortalite_cardio", label: "Mortalité par cardiopathies ischémiques", variable: "M_Cardiopath_isch", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "cardio_insuff",
                title: "Insuffisance cardiaque",
                datasets: [
                    { id: "prevalence_cardio", label: "Prévalence de l'insuffisance cardiaque", variable: "p_insuff_card", source: "SNDS" },
                    { id: "mortalite_cardio", label: "Mortalité par insuffisance cardiaque", variable: "M_Insuff_Cardiaque", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "cardio_coronarien",
                title: "Syndrome coronarien chronique",
                datasets: [
                    { id: "prevalence_cardio", label: "Prévalence des maladies coronaires chroniques", variable: "p_coronaire", source: "SNDS" },
                ]
            },
            {
                id: "respiratoire",
                title: "Maladies de l'appareil respiratoire",
                datasets: [
                    { id: "prevalence_respi", label: "Prévalence des maladies respiratoires chroniques", variable: "p_respi", source: "SNDS" },
                    { id: "mortalite_respi", label: "Mortalité par maladies respiratoires", variable: "M_Maladies_Respi", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "mortalite_respi", label: "Mortalité par Asthme", variable: "m_asthme", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "mortalite_respi", label: "Mortalité par BPCO", variable: "m_bpco", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "neurologique",
                title: "Maladies du système nerveux",
                datasets: [
                    { id: "prevalence_neuro", label: "Prévalence de l'épilepsie", variable: "p_epilepsie", source: "SNDS" },
                    { id: "prevalence_neuro", label: "Prévalence des démences dont Alzheimer", variable: "p_alzheimer", source: "SNDS" },
                    { id: "mortalite_neuro", label: "Mortalité Alzheimer", variable: "m_alzheimer", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "prevalence_neuro", label: "Prévalence de la maladie de Parkinson", variable: "p_parkinson", source: "SNDS" },
                    { id: "mortalite_neuro", label: "Mortalité par la maladie de Parkinson", variable: "m_parkinson", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "digestif",
                title: "Maladies de l'appareil digestif",
                datasets: [
                    { id: "prevalence_digestif", label: "Prévalence des maladies du foie ou du pancréas", variable: "p_foie", source: "SNDS" },
                    { id: "mortalite_digestif", label: "Mortalité par maladies du foie ou du pancréas", variable: "m_foie", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O" },
                ]
            },
            {
                id: "metabolique",
                title: "Maladies endocriniennes, nutritionnelles et métaboliques",
                datasets: [
                    { id: "prevalence_diabete", label: "Prévalence du diabète", variable: "p_diabete", source: "SNDS" },
                    { id: "mortalite_diabete", label: "Mortalité par diabète", variable: "m_diabete", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "infectieuses",
                title: "Maladies infectieuses - VIH/SIDA",
                datasets: [
                    { id: "prevalence_vih", label: "Prévalence du VIH ou du SIDA", variable: "p_vih", source: "SNDS" },
                    { id: "mortalite_vih", label: "Mortalité par SIDA", variable: "m_sida", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O" },
                ]
            },
            {
                id: "troubles_mentaux",
                title: "Troubles mentaux et du comportement",
                datasets: [
                    { id: "prevalence_psy", label: "Prévalence de la déficience mentale", variable: "p_deficience", source: "SNDS" },
                    { id: "mortalite_psy", label: "Mortalité liée aux troubles mentaux et du comportement", variable: "M_Trouble_Ment", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O" },
                    { id: "prevalence_psy", label: "Prévalence des traitements neuroleptiques (troubles psychotiques)", variable: "p_neuroleptiques", source: "SNDS" },
                    { id: "prevalence_psy", label: "Prévalence des traitements antidépresseurs (troubles de l'humeur)", variable: "p_antidepresseurs", source: "SNDS" },
                    { id: "prevalence_psy", label: "Prévalence des traitements anxiolytiques (troubles de l'anxiété)", variable: "p_anxiolytiques", source: "SNDS" },
                ]
            },
            {
                id: "cancers",
                title: "Cancers",
                datasets: [
                    { id: "mortalite_tumeurs", label: "Mortalité par cancer du poumon (trachée, bronches)", variable: "m_kc_poumon", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "prevalence_cancer", label: "Prévalence du cancer du poumon", variable: "p_kc_poumon", source: "SNDS" },
                    { id: "mortalite_tumeurs", label: "Mortalité par cancer du sein (femmes)", variable: "m_kc_sein", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "prevalence_cancer", label: "Prévalence du cancer du sein chez la femme", variable: "p_kc_sein", source: "SNDS" },
                    { id: "mortalite_tumeurs", label: "Mortalité par cancer colorectal", variable: "m_kc_colon", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "prevalence_cancer", label: "Prévalence du cancer colorectal", variable: "p_kc_colon", source: "SNDS" },
                    { id: "mortalite_tumeurs", label: "Mortalité par cancer de la prostate", variable: "m_kc_prostate", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                    { id: "prevalence_cancer", label: "Prévalence du cancer de la prostate", variable: "p_kc_prostate", source: "SNDS" },
                ]
            },
            {
                id: "handicap",
                title: "Handicap",
                datasets: [
                    { id: "prevalence_handicap", label: "Prévalence de la paraplégie", variable: "p_paraplegie", source: "SNDS" },
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
                id: "addictions_ensemble",
                title: "Ensemble des addictions",
                datasets: [
                    { id: "prevalence_addictions", label: "Prévalence des addictions", variable: "p_add", source: "SNDS" },
                ]
            },
            {
                id: "addictions_alcool",
                title: "Alcool",
                datasets: [
                    { id: "comp_mortalite", label: "Mortalité liée à l'alcool", variable: "m_alcool", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "addictions_tabac",
                title: "Tabac",
                datasets: [
                    { id: "comp_mortalite", label: "Mortalité liée au tabac", variable: "m_tabac", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
                ]
            },
            {
                id: "suicide",
                title: "Suicide",
                datasets: [
                    { id: "comp_mortalite", label: "Mortalité par suicide", variable: "m_suicide", source: "INSERM-CépiDc, INSEE", tool: "MOCA-O", demoReady: true },
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
        description: "Accidents de la circulation, Noyades",
        available: true,
        subThemes: [
            {
                id: "accidents_route",
                title: "Accidents de la circulation",
                datasets: [
                    { id: "route", label: "Nombre d'accidents de la circulation", variable: "nb_acci", source: "Min. Intérieur, INSEE", tool: "ONISR / BAAC", demoReady: true },
                    { id: "route", label: "Taux d'accidents de la route pour 1 000 habitants", variable: "tx_acci", source: "Min. Intérieur, INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "blesses_route",
                title: "Blessés dans les accidents de la circulation",
                datasets: [
                    { id: "route", label: "Nombre de blessés par accidents de la circulation", variable: "nb_blesses", source: "Min. Intérieur, INSEE", tool: "ONISR / BAAC", demoReady: true },
                    { id: "route", label: "Taux de blessés pour 1 000 habitants", variable: "tx_blesses", source: "Min. Intérieur, INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "deces_route",
                title: "Décès dans les accidents de la circulation",
                datasets: [
                    { id: "route", label: "Nombre de morts par accidents de la circulation", variable: "nb_morts", source: "Min. Intérieur, INSEE", tool: "ONISR / BAAC", demoReady: true },
                    { id: "route", label: "Taux de mortalité par accidents de la route pour 1 000 habitants", variable: "tx_morts", source: "Min. Intérieur, INSEE", tool: "Calcul" },
                ]
            },
            {
                id: "noyades",
                title: "Noyades (accidents de la vie courante)",
                datasets: [
                    { id: "noyades", label: "Nombre de noyades", variable: "nb_noyades", source: "DREES, INSEE", tool: "Enquête Noyades, SPF - GEODES", demoReady: true },
                    { id: "noyades", label: "Taux d'incidence des noyades (pour 1 000 000 hab.)", variable: "tx_noyades", source: "DREES, INSEE", tool: "Calcul" },
                    { id: "noyades", label: "Nombre de noyades suivies de décès", variable: "nb_noyades_deces", source: "DREES, INSEE", tool: "Enquête Noyades, SPF - GEODES", demoReady: true },
                    { id: "noyades", label: "Taux d'incidence des noyades suivies de décès", variable: "tx_noyades_deces", source: "DREES, INSEE", tool: "Calcul" },
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
