# Email Naïssa — Compte rendu avant recette lundi 21 avril 2026

**À** : naissa.chateau@ors-guyane.org
**Objet** : Data Visus — Compte rendu week-end + point recette lundi

---

Bonjour Naïssa,

Comme convenu, je te fais un point avant notre recette de demain lundi. J'ai profité du week-end pour corriger plusieurs choses remontées cette semaine et fiabiliser la plateforme. Récap' ci-dessous.

## Plateforme

- **URL** : https://orsgdemo.console.cercleonline.com
- **Statut** : accessible, tests faits ce matin OK.
- **Ton accès** : naissa.chateau@ors-guyane.org → "Recevoir un code" → code 6 chiffres pré-rempli → "Se connecter".

## Correctifs déployés ce week-end

### 1. Accès tableau de bord rétabli
Après le dernier déploiement, certains utilisateurs étaient bloqués en boucle sur l'écran de connexion. Corrigé, plus un mécanisme d'auto-réparation de la base utilisateurs en cas de redéploiement (évite que ça revienne).

### 2. Qualité des données — onglet "France entière"
Avant : quand seule la Guyane était renseignée, les onglets DOM et France entière recopiaient les valeurs Guyane, ce qui était trompeur.
Après : si la couverture nationale est incomplète (moins de 50% des régions présentes), l'onglet affiche vide avec un avertissement explicite plutôt que des valeurs agrégées trompeuses.

### 3. Taux cohérents entre onglets
Avant : les taux variaient de 10 à 30 % d'un onglet à l'autre à cause d'une moyenne non pondérée sur les régions.
Après : on reprend directement le taux France source quand il existe, sinon on laisse vide. Plus de divergence d'onglet en onglet.

### 4. Rôles utilisateurs
Tous les comptes livrés sont désormais en rôle **administrateur** (plus aucun en "expert"). Tu auras accès à l'ensemble des écrans (gestion utilisateurs, tickets, profil, etc.).

### 5. UI/UX — menus indicateurs
Dans la page **Générateur** et dans **Docs (BDI)** :
- Bandeau stats en haut de page : nombre d'indicateurs disponibles / en Open Data / en MOCA-O.
- Badge sur chaque sous-thème : "{prêts}/{total} disponibles" avec code couleur.
- Tag source par indicateur (Open Data / MOCA-O / Import CSV requis).
Objectif : tu sais d'un coup d'œil où la donnée est prête et où il faut un import.

## Point méthodologique important — thème Comportements

Tu as remonté que la somme des communes ne correspondait pas à la valeur de la région Guyane sur les indicateurs Alcool / Tabac / Suicide. **Ce n'est pas un bug, c'est la nature des données.**

Les variables `m_alcool`, `m_tabac`, `m_suicide` issues de MOCA-O sont des **taux standardisés pour 100 000 habitants** (méthodologie INSERM-CépiDc). Par définition, un taux ne s'additionne pas entre territoires :

- Commune A : 23,4 pour 100 000
- Commune B : 15,1 pour 100 000
- → Région : ce n'est PAS 38,5. C'est une moyenne pondérée par la population de chaque commune.

C'est contre-intuitif au premier coup d'œil mais c'est la règle pour tout indicateur épidémiologique standardisé. Si tu veux que je l'explique noir sur blanc dans la doc ou dans un encart de la page Docs, je le fais. Dis-moi.

## Recette demain lundi 21 avril

Toujours bon de mon côté sur le scénario envoyé cette semaine :
1. Connexion → dashboard
2. Génération Comportements → m_suicide → 2022 → ZIP
3. Génération Noyades → nb_noyades → 2023 → ZIP
4. Génération Accidents route → nb_morts → 2023 → ZIP

Prévois 20 min, je reste dispo par mail / téléphone en parallèle si tu veux qu'on débrief en direct.

## Suite

Après ta validation de la recette, je finalise la facturation du solde (7 000 € HT).
Pour les fichiers MOCA-O restants (État de santé, Structures et activités de soins), on est sur le même process quand tu les auras côté ORS-G — 1 à 2 jours d'intégration par thème.

Bonne journée, à demain,
Cédric

---

## Notes internes (à retirer avant envoi)
- Auto-repair PB déployée dans `file_server.js` (getPbAdmin → POST /api/admins + setup auto) : si le volume saute à nouveau, la plateforme se répare seule au premier appel auth.
- Commits du week-end : coverage check `_aggregate_levels`, NaN DOM/FH sur CepiDc, `ensureUserRoles` idempotent, badges Step1 + DocsPage.
- À surveiller lundi post-recette : retour Naïssa sur l'UI badges (si trop de bruit visuel on allège), clarification Comportements (encart Docs ou pas).
- Prochain chantier si validé : fix SMTP Resend propre (retirer bypass 000000) + relecture données MOCA-O brutes avec Naïssa pour valider la chaîne d'import.
