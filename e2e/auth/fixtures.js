/**
 * Fixtures pour l'authentification
 * Utilisateurs de test réutilisables
 */

export const CONFIRMED_USER = {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
  displayName: process.env.TEST_USER_DISPLAY_NAME
}

export const CREATOR_USER = {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
  displayName: process.env.TEST_USER_DISPLAY_NAME
}

export const NEW_USER = {
  email: process.env.TEST_NEW_USER_EMAIL,
  password: process.env.TEST_NEW_USER_PASSWORD,
  displayName: process.env.TEST_NEW_USER_DISPLAY_NAME
}
