/**
 * Helpers d'authentification pour les tests E2E
 * 
 * Fonctions réutilisables pour gérer la connexion/déconnexion
 * dans les tests Playwright.
 */

import 'dotenv/config';

/**
 * Utilisateurs de test chargés depuis les variables d'environnement
 */
export const users = {
  creator: {
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
    displayName: process.env.TEST_USER_DISPLAY_NAME
  },
  donor: {
    email: process.env.TEST_DONOR_EMAIL || process.env.TEST_USER_EMAIL,
    password: process.env.TEST_DONOR_PASSWORD || process.env.TEST_USER_PASSWORD,
    displayName: process.env.TEST_DONOR_DISPLAY_NAME || 'Test Donor'
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL,
    password: process.env.TEST_ADMIN_PASSWORD,
    displayName: process.env.TEST_ADMIN_DISPLAY_NAME || 'Test Admin'
  },
  newUser: {
    email: process.env.TEST_NEW_USER_EMAIL,
    password: process.env.TEST_NEW_USER_PASSWORD,
    displayName: process.env.TEST_NEW_USER_DISPLAY_NAME
  }
};

/**
 * Connecte un utilisateur via la page de login
 * 
 * @param {import('@playwright/test').Page} page - Instance de page Playwright
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 */
export async function login(page, email, password) {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL('/');
}

/**
 * Connecte un utilisateur de type créateur
 * 
 * @param {import('@playwright/test').Page} page - Instance de page Playwright
 */
export async function loginAsCreator(page) {
  await login(page, users.creator.email, users.creator.password);
}

/**
 * Connecte un utilisateur de type donateur
 * 
 * @param {import('@playwright/test').Page} page - Instance de page Playwright
 */
export async function loginAsDonor(page) {
  await login(page, users.donor.email, users.donor.password);
}

/**
 * Connecte un utilisateur admin
 * 
 * @param {import('@playwright/test').Page} page - Instance de page Playwright
 */
export async function loginAsAdmin(page) {
  await login(page, users.admin.email, users.admin.password);
}

/**
 * Déconnecte l'utilisateur courant
 * 
 * @param {import('@playwright/test').Page} page - Instance de page Playwright
 */
export async function logout(page) {
  await page.getByTestId('header-logout-button').click();
  await page.waitForURL('/');
}

/**
 * Vérifie que l'utilisateur est connecté en vérifiant le header
 * 
 * @param {import('@playwright/test').Page} page - Instance de page Playwright
 * @param {import('@playwright/test').expect} expect - Fonction expect de Playwright
 */
export async function expectLoggedIn(page, expect) {
  await expect(page.getByTestId('header-user-info')).toBeVisible();
  await expect(page.getByTestId('header-logout-button')).toBeVisible();
}

/**
 * Vérifie que l'utilisateur n'est pas connecté
 * 
 * @param {import('@playwright/test').Page} page - Instance de page Playwright
 * @param {import('@playwright/test').expect} expect - Fonction expect de Playwright
 */
export async function expectLoggedOut(page, expect) {
  await expect(page.getByTestId('header-login-button')).toBeVisible();
  await expect(page.getByTestId('header-signup-button')).toBeVisible();
}
