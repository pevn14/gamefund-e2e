/**
 * Tests E2E - Authentification : Connexion
 * 
 * Scénario A2 : Connexion réussie
 * Vérifie qu'un utilisateur peut se connecter
 */

import { test, expect } from '@playwright/test';
import { users, login, expectLoggedIn } from '../../helpers/auth.js';

test.describe('Authentification - Connexion', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('devrait afficher le formulaire de connexion', async ({ page }) => {
    // Vérifier la présence des champs
    await expect(page.getByTestId('login-email-input')).toBeVisible();
    await expect(page.getByTestId('login-password-input')).toBeVisible();
    await expect(page.getByTestId('login-submit-button')).toBeVisible();
    
    // Vérifier le lien vers inscription
    await expect(page.getByTestId('login-signup-link')).toBeVisible();
  });

  test('devrait connecter un utilisateur avec credentials valides (A2)', async ({ page }) => {
    // Remplir le formulaire
    await page.getByTestId('login-email-input').fill(users.creator.email);
    await page.getByTestId('login-password-input').fill(users.creator.password);
    
    // Soumettre
    await page.getByTestId('login-submit-button').click();
    
    // Vérifier la redirection vers la page d'accueil
    await page.waitForURL('/');
    
    // Vérifier que l'utilisateur est connecté (header mis à jour)
    await expectLoggedIn(page, expect);
  });

  test('devrait afficher une erreur avec un email invalide', async ({ page }) => {
    // Remplir avec un email inexistant
    await page.getByTestId('login-email-input').fill('nonexistent@example.com');
    await page.getByTestId('login-password-input').fill('Password123!');
    
    // Soumettre
    await page.getByTestId('login-submit-button').click();
    
    // Vérifier le message d'erreur
    await expect(page.getByTestId('login-error-message')).toBeVisible();
  });

  test('devrait afficher une erreur avec un mot de passe incorrect', async ({ page }) => {
    // Remplir avec un mauvais mot de passe
    await page.getByTestId('login-email-input').fill(users.creator.email);
    await page.getByTestId('login-password-input').fill('WrongPassword123!');
    
    // Soumettre
    await page.getByTestId('login-submit-button').click();
    
    // Vérifier le message d'erreur
    await expect(page.getByTestId('login-error-message')).toBeVisible();
  });

  test('devrait naviguer vers la page d\'inscription', async ({ page }) => {
    // Cliquer sur le lien d'inscription
    await page.getByTestId('login-signup-link').click();
    
    // Vérifier la redirection
    await expect(page).toHaveURL('/signup');
  });

  test('devrait persister la session après rafraîchissement', async ({ page }) => {
    // Se connecter
    await login(page, users.creator.email, users.creator.password);
    
    // Vérifier la connexion
    await expectLoggedIn(page, expect);
    
    // Rafraîchir la page
    await page.reload();
    
    // Vérifier que la session persiste
    await expectLoggedIn(page, expect);
  });
});
