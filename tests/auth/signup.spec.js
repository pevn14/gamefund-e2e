/**
 * Tests E2E - Authentification : Inscription
 * 
 * Scénario A1 : Inscription réussie
 * Vérifie qu'un nouveau visiteur peut créer un compte
 */

import { test, expect } from '@playwright/test';
import { users } from '../../helpers/auth.js';

test.describe('Authentification - Inscription', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('devrait afficher le formulaire d\'inscription', async ({ page }) => {
    // Vérifier la présence des champs
    await expect(page.getByTestId('signup-displayname-input')).toBeVisible();
    await expect(page.getByTestId('signup-email-input')).toBeVisible();
    await expect(page.getByTestId('signup-password-input')).toBeVisible();
    await expect(page.getByTestId('signup-confirm-password-input')).toBeVisible();
    await expect(page.getByTestId('signup-submit-button')).toBeVisible();
    
    // Vérifier le lien vers connexion
    await expect(page.getByTestId('signup-login-link')).toBeVisible();
  });

  test('devrait valider le format email', async ({ page }) => {
    // Remplir avec un email invalide
    await page.getByTestId('signup-displayname-input').fill('Test User');
    const emailInput = page.getByTestId('signup-email-input');
    await emailInput.fill('invalid-email');
    await page.getByTestId('signup-password-input').fill('Password123!');
    await page.getByTestId('signup-confirm-password-input').fill('Password123!');
    
    // Soumettre
    await page.getByTestId('signup-submit-button').click();
    
    // Vérifier que la validation native bloque la soumission
    const validationMessage = await emailInput.evaluate((el) => el.validationMessage);
    expect(validationMessage).not.toBe('');
    await expect(page).toHaveURL('/signup');
  });

  test('devrait valider la correspondance des mots de passe', async ({ page }) => {
    // Remplir avec des mots de passe différents
    await page.getByTestId('signup-displayname-input').fill('Test User');
    await page.getByTestId('signup-email-input').fill('test@example.com');
    await page.getByTestId('signup-password-input').fill('Password123!');
    await page.getByTestId('signup-confirm-password-input').fill('DifferentPassword!');
    
    // Soumettre
    await page.getByTestId('signup-submit-button').click();
    
    // Vérifier le message d'erreur
    await expect(page.getByTestId('signup-error-message')).toBeVisible();
  });

  test('devrait valider la longueur minimale du mot de passe', async ({ page }) => {
    // Remplir avec un mot de passe trop court
    await page.getByTestId('signup-displayname-input').fill('Test User');
    await page.getByTestId('signup-email-input').fill('test@example.com');
    await page.getByTestId('signup-password-input').fill('short');
    await page.getByTestId('signup-confirm-password-input').fill('short');
    
    // Soumettre
    await page.getByTestId('signup-submit-button').click();
    
    // Vérifier le message d'erreur
    await expect(page.getByTestId('signup-error-message')).toBeVisible();
  });

  test('devrait naviguer vers la page de connexion', async ({ page }) => {
    // Cliquer sur le lien de connexion
    await page.getByTestId('signup-login-link').click();
    
    // Vérifier la redirection
    await expect(page).toHaveURL('/login');
  });

  // Note: Le test d'inscription réussie nécessite un email unique à chaque exécution
  // et une confirmation d'email. Il est commenté pour éviter la création de comptes multiples.
  /*
  test('devrait créer un compte avec succès (A1)', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    
    await page.getByTestId('signup-displayname-input').fill('New Test User');
    await page.getByTestId('signup-email-input').fill(uniqueEmail);
    await page.getByTestId('signup-password-input').fill('Password123!');
    await page.getByTestId('signup-confirm-password-input').fill('Password123!');
    
    await page.getByTestId('signup-submit-button').click();
    
    // Vérifier le message de succès
    await expect(page.getByTestId('signup-success-message')).toBeVisible();
  });
  */
});
