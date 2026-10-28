# VYBZ — Application Mobile Sociale & Messages Anonymes Sécurisés

**VYBZ** est une application mobile sociale moderne, originale et hautement sécurisée, combinant l'excitation des messages anonymes sincères avec un véritable système de chat privé en temps réel et un fil communautaire interactif.

---

## ⚡ 1. Aperçu & Identité Visuelle

- **Thème sombre épuré** : Fond `#0B0B10`, surfaces `#14141F`, élévations `#1B1B2A`
- **Couleur principale** : Violet électrique `#8B5CF6`
- **Couleur secondaire** : Rose néon `#EC4899` / `#F472B6`
- **Typographie** : `Outfit` (titres et logos) et `Plus Jakarta Sans` (corps fluide)
- **Ergonomie pouce** : Barre de navigation inférieure fixe respectant la zone de confort tactile (touch hitboxes $\ge 44\text{px}$)
- **Simulateur mobile intégré** : Cadre réaliste iPhone 16 Pro avec Dynamic Island et bascule plein écran réactif

---

## 🚀 2. Fonctionnalités Implémentées

### A. Écran de Bienvenue & Authentification
- Identité visuelle originale VYBZ, logo vectoriel et slogan percutant.
- Inscription et connexion par email/mot de passe.
- **Sélecteur de profil rapide pour tests multi-utilisateurs** : basculez en 1 clic entre **Maya (@maya_vibe)**, **Alexandre (@alex_k)**, **Sarah (@sarah_chen)** et **Liam (@liam_music)** pour tester le chat direct et l'envoi de messages anonymes en temps réel !

### B. Messages Anonymes Sécurisés (Type NGL réinventé)
- **Lien personnel unique** : `vybz.app/u/:username` avec copie en 1 clic et format story pour Instagram/Snapchat.
- **Cartes personnalisables** : 6 palettes vibrantes (*Electric Violet, Neon Blossom, Cyber Noir, Solar Flare, Aurora Mint, Digital Ocean*).
- **Inspirations thématiques** : Vérité, Compliment, Crush secret, Première impression, Question cash.
- **Indices facultatifs non-identifiants** : type d'appareil, ville, signe astrologique sans jamais révéler l'identité réelle.
- **Boîte de réception d'anonymes** : filtrage (Tous, Non lus, Répondus), révélation d'indice, suppression.
- **Réponses stories sur le fil** : répondez publiquement à un mot anonyme sous forme de vignette stylisée partagée avec toute la communauté.
- **Filtres anti-spam et modération** : détection automatique des spams publicitaires et propos inappropriés.

### C. Chat Privé en Temps Réel
- Liste des discussions avec horodatage dynamique et compteurs de messages non lus.
- Bulles de messages différenciées (dégradé violet à droite, ardoise foncée à gauche).
- **Accusés d'envoi et de lecture** : *Envoyé* (1 coche), *Distribué* (2 coches grises), *Lu* (2 coches cyan).
- **Indicateur de saisie en direct** : « écrit un message... ».
- **Simulateur de réponse instantanée** : testez la réactivité du chat sans avoir à ouvrir un second téléphone.
- Modération intégrée : possibilité de bloquer l'interlocuteur ou de signaler la conversation.

### D. Fil Communautaire & Questions Q&A
- Carrousel de stories / vibes des créateurs actifs.
- Publication de pensées courtes et partages.
- Posez des questions publiques à la communauté avec catégorisation (*Lifestyle, Confession, Tech & Créa, Pensées profondes*).
- Réactions j'aime et compteurs en temps réel.

### E. Découverte & Recherche
- Recherche de vybers par `@pseudo`, nom ou centres d'intérêt.
- Suggestions de créateurs et bouton « Suivre / Abonné ».
- Boutons d'action rapide : « Message anonyme » ou « Chatter en privé ».

### F. Centre de Notifications
- Alertes en direct pour les nouveaux messages privés, messages anonymes reçus et réactions.
- Bouton « Tout marquer comme lu ».

### G. Profil & Paramètres de Sécurité
- Modification de profil (nom, bio, photo/avatar).
- Gestion de la confidentialité :
  - *Autoriser ou couper les messages anonymes*
  - *Afficher ou masquer le statut en ligne*
  - *Filtre anti-spam strict*
  - *Notifications push*
- Gestion des utilisateurs bloqués avec déblocage en 1 clic.
- Conditions générales d'utilisation et politique de confidentialité intégrée.

---

## 🗄️ 3. Base de Données & Architecture Supabase

Le schéma PostgreSQL complet se trouve dans :
`supabase/migrations/20250101_initial_schema.sql`

Tables incluses :
1. `profiles` (clés auth, pseudo unique, avatar, statut en ligne, last_seen)
2. `user_preferences` (confidentialité, spam, permissions)
3. `anonymous_messages` (expéditeur haché en sens unique, contenu, thème de carte, indices, états)
4. `conversations` & `conversation_members` (gestion des salons privés)
5. `chat_messages` (messages avec statuts sent/delivered/read)
6. `questions` & `answers` (Q&A communautaire)
7. `posts` & `reactions` (publications et likes)
8. `notifications` (alertes push et in-app)
9. `blocks` (table de blocage anti-harcèlement)
10. `reports` (signalements transmis aux modérateurs)

### Politiques Row Level Security (RLS)
- Les utilisateurs ne peuvent lire **que leurs propres messages privés et conversations**.
- L'identité de l'auteur d'un message anonyme n'est **jamais stockée** dans un champ accessible au destinataire.
- N'importe qui disposant d'un lien public peut insérer un message anonyme si le destinataire l'autorise et ne l'a pas bloqué.
- Seul le titulaire du compte peut modifier son profil ou ses préférences.

### Connexion à votre Supabase (Production)
1. Créez un projet sur [Supabase](https://supabase.com).
2. Rendez-vous dans **SQL Editor** et exécutez le script contenu dans `supabase/migrations/20250101_initial_schema.sql`.
3. *(Optionnel)* Exécutez `supabase/seed.sql` pour injecter les profils démo initiaux.
4. Renseignez vos variables dans `.env` :
   ```env
   VITE_SUPABASE_URL="https://votreprjet.supabase.co"
   VITE_SUPABASE_ANON_KEY="votre-cle-publique-anon"
   ```
   *Ou entrez-les directement depuis l'écran **Paramètres > Supabase / Backend** dans l'application !*

---

## 📱 4. Lancement & Test sur Mobile (Expo / React Native)

Pour exécuter le projet en application native iOS / Android via Expo :

```bash
# 1. Initialiser une application Expo Router
npx create-expo-app@latest vybz-mobile --template tabs
cd vybz-mobile

# 2. Installer les dépendances
npx expo install @supabase/supabase-js nativewind react-native-reanimated react-native-gesture-handler expo-notifications

# 3. Lancer l'environnement de développement
npx expo start
```

- Scannez le QR Code avec **Expo Go** sur votre iPhone (Camera) ou Android (Expo App).
- Pour tester le build natif standalone :
  ```bash
  npx eas build --platform all
  ```

---

## 🛡️ 5. Mesures de Cybersécurité et Anti-Spam

1. **Validation Zod & Regex** : pseudonymes restreints aux caractères alphanumériques et tirets bas.
2. **Filtre Anti-Spam Heuristique** : blocage en amont des messages publicitaires, liens douteux et démarchage crypto/phishing.
3. **Limitation de débit (Rate Limiting)** : empreinte locale et hachage sens unique pour prévenir le spam répétitif sans tracer les utilisateurs bienveillants.
4. **Cloisonnement RLS PostgreSQL** : aucune fuite de données privées possible via requêtes directes à l'API client.
