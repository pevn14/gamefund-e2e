/**
 * Fixtures - Utilisateurs de test pour E2E
 *
 * ⚠️ SÉCURITÉ:
 * - NE JAMAIS commiter de vrais mots de passe dans ce fichier
 * - Utiliser des variables d'environnement pour les informations sensibles
 * - Le fichier .env est dans .gitignore et ne sera pas commité
 */

/**
 * Utilisateur avec compte confirmé (email vérifié)
 * Utilisé pour tester les flux de connexion/déconnexion
 *
 * ⚠️ Ce compte doit être créé manuellement dans Supabase et l'email confirmé
 * ⚠️ OBLIGATOIRE: Définir TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_DISPLAY_NAME dans .env
 *
 * Pour créer ce compte:
 * 1. Aller sur http://localhost:5173/supabase-test
 * 2. S'inscrire avec l'email spécifié
 * 3. Confirmer l'email via le lien reçu
 * 4. Le compte est maintenant prêt pour les tests
 */
if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD || !process.env.TEST_USER_DISPLAY_NAME) {
  throw new Error(`
⚠️ Configuration OBLIGATOIRE manquante dans .env

Les variables suivantes DOIVENT être définies:
- TEST_USER_EMAIL
- TEST_USER_PASSWORD
- TEST_USER_DISPLAY_NAME

Créez un fichier .env à la racine du projet avec ces variables.
Voir .env.example pour un modèle.
  `.trim())
}

export const CONFIRMED_USER = {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
  displayName: process.env.TEST_USER_DISPLAY_NAME
}

/**
 * Nouveau compte de test (n'existe PAS dans Supabase)
 * Utilisé pour tester la création de nouveaux comptes (signup)
 *
 * ⚠️ IMPORTANT: Ce compte NE DOIT PAS exister dans Supabase
 * ⚠️ Utiliser une VRAIE adresse email pour éviter les bounces
 * ⚠️ OBLIGATOIRE: Définir TEST_NEW_USER_EMAIL, TEST_NEW_USER_PASSWORD, TEST_NEW_USER_DISPLAY_NAME dans .env
 */
if (!process.env.TEST_NEW_USER_EMAIL || !process.env.TEST_NEW_USER_PASSWORD || !process.env.TEST_NEW_USER_DISPLAY_NAME) {
  throw new Error(`
⚠️ Configuration OBLIGATOIRE manquante dans .env

Les variables suivantes DOIVENT être définies:
- TEST_NEW_USER_EMAIL
- TEST_NEW_USER_PASSWORD
- TEST_NEW_USER_DISPLAY_NAME

Créez un fichier .env à la racine du projet avec ces variables.
Voir .env.example pour un modèle.
  `.trim())
}

export const NEW_USER = {
  email: process.env.TEST_NEW_USER_EMAIL,
  password: process.env.TEST_NEW_USER_PASSWORD,
  displayName: process.env.TEST_NEW_USER_DISPLAY_NAME
}

/**
 * Utilisateurs de test avec données invalides
 * Pour tester les validations et messages d'erreur
 *
 * ⚠️ IMPORTANT: Pour éviter les bounces, on utilise:
 * - Le compte CONFIRMED_USER existant avec un mauvais mot de passe (pas d'email envoyé)
 * - Le compte NEW_USER pour les formats invalides (Supabase ne valide que côté serveur)
 */
export const INVALID_USERS = {
  // Format invalide - Supabase va quand même tenter l'authentification
  // On utilise NEW_USER avec un format légèrement modifié
  invalidEmailFormat: {
    email: process.env.TEST_NEW_USER_EMAIL?.replace('@', 'AT'),
    password: 'Passxxxx!',
    displayName: 'Invalid Email User'
  },
  // Credentials invalides - utilise le compte confirmé avec mauvais password
  // Pas d'email envoyé car c'est juste une tentative de connexion échouée
  wrongCredentials: {
    email: process.env.TEST_USER_EMAIL,
    password: 'WrongPassword123!',
    displayName: 'Wrong Credentials User'
  }
}

