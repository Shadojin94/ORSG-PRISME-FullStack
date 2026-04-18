# Email Naïssa — Recette lundi 21 avril 2026

**À** : naissa.chateau@ors-guyane.org
**Cc** : (optionnel : Dr Castor)
**Objet** : Data Visus — Recette lundi 21 avril : 3 thèmes prioritaires livrés + accès plateforme

---

Bonjour Naïssa,

Suite à ton envoi du 17 avril, j'ai intégré les 3 thèmes prioritaires demandés pour la recette de lundi. Tout est en ligne sur la plateforme — tu peux tester dès maintenant.

## Accès plateforme

- **URL** : https://orsgdemo.console.cercleonline.com
- **Ton identifiant** : naissa.chateau@ors-guyane.org
- **Méthode** : saisis ton email, clique "Recevoir un code". Un code à 6 chiffres apparaît automatiquement pré-rempli, clique "Se connecter". Tu entres directement.

*(Un système SMTP plus robuste sera branché après la recette — le mode actuel est volontairement simplifié pour éviter tout blocage lundi.)*

## Thèmes livrés

### 1. Comportements à risque (Alcool / Tabac / Suicide) — source MOCA-O 2018-2023
- Données intégrées : 22 communes Guyane + DOM + France entière
- Variables : `m_alcool`, `m_tabac`, `m_suicide` (mortalité par cause, pour 100 000 hab.)
- Année disponible par défaut : **2022**
- Exemple de contrôle : Cayenne 2022 → alcool 23,4 / tabac 99,3 / suicide 12,5

### 2. Noyades — source Santé Publique France 2022-2024
- Données : 101 départements × 2 ans (2023, 2024)
- Variables : `nb_noyades`, `nb_noyades_deces`
- Exemple : Guyane 2023 → 6 noyades / 4 décès ; 2024 → 4 / 1
- À noter : 2022 n'a pas été publié par SPF (transition méthodologique enquête triennale → surveillance estivale), donc on démarre à 2023

### 3. Accidents de la route — source BAAC ONISR 2023-2024
- Données existantes déjà conformes au bilan que tu m'as envoyé
- Variables : `nb_acci`, `nb_morts`, `nb_blesses_h` (hospitalisés), `nb_blesses_l` (légers)
- 2023 : 600 accidents, 34 décès, 811 blessés
- 2024 : 631 accidents, 34 décès, 845 blessés

## Scénario de recette recommandé (15-20 min)

1. **Connexion** → ouvre la page d'accueil (tableau de bord, KPI, carte)
2. **Génération comportements** : Menu → Générer → Comportements mortalité → m_suicide → 2022 → Télécharger ZIP, ouvrir l'Excel Cayenne
3. **Génération noyades** : Menu → Générer → Noyades → nb_noyades → 2023 → Télécharger ZIP
4. **Génération accidents** : Menu → Générer → Accidents route → nb_morts → 2023 → Télécharger ZIP

## Documentation jointe

- `DEPLOY_UBUNTU.md` : guide complet pour ton équipe IT, si vous voulez héberger la plateforme sur votre propre serveur Ubuntu (git clone + docker compose up — 15 minutes d'install).
- `BILAN_PROJET_PRISME.md` : bilan du projet livré le 2-3 avril (à relire pour la facturation finale).

## Suite

Merci de me faire un retour après ton test (points OK, points à ajuster). Dès ta validation, je finalise la facturation du solde (7 000 € HT).

Les fichiers MOCA-O restants (État de santé, Structures et activités de soins) peuvent être intégrés selon le même process quand tu les auras — prévois 1-2 jours par thème.

Bonne recette,
Cédric

---

## Pièces jointes suggérées
- `DEPLOY_UBUNTU.md` (racine du repo)
- `BILAN_PROJET_PRISME.md` (si présent — sinon mettre le dernier bilan v5.0)

## Notes internes Cédric (à retirer avant envoi)
- Mode bypass `000000` : acceptable pour la démo, mais le fix SMTP réel est à faire en semaine 17 (clé Resend à regénérer + SMTP_PASS dans Coolify env).
- PocketBase admin cassé en prod (`pb_admin_ready: false`) : les tickets support et profil éditable ne persistent pas en mode fallback. À réparer post-recette : SSH dans conteneur Coolify et relancer `pocketbase admin update` OU recréer un admin propre.
- Commits livrés : `4abd06c` (fix admin upsert), `9d85a3d` (bypass cohérence), `cb54eef` (polish UI).
