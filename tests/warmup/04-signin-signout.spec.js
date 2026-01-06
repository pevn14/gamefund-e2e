import { test, expect } from '@playwright/test'
import { CONFIRMED_USER, NEW_USER, INVALID_USERS } from '../../fixtures/test-users.js'

test.describe('SupabaseTest - Connexion et Déconnexion', () => {

  test('devrait afficher erreur si compte inexistant', async ({ page }) => {
    // Test avec credentials invalides (compte qui n'existe pas)
    // Utilise le compte CONFIRMED_USER avec un mauvais mot de passe

    await page.goto('/supabase-test')

    const wrongUser = INVALID_USERS.wrongCredentials
    await page.getByTestId('signin-email-input').fill(wrongUser.email)
    await page.getByTestId('signin-password-input').fill(wrongUser.password)
    await page.getByTestId('signin-submit-button').click()

    // Attendre message d'erreur
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('error-message')).toContainText('Invalid login credentials')
  })

  test('devrait afficher erreur si email non confirmé', async ({ page }) => {
    // Test avec un compte existant mais non vérifié (NEW_USER)
    // Ce compte existe dans Supabase mais l'email n'a pas été confirmé

    await page.goto('/supabase-test')

    await page.getByTestId('signin-email-input').fill(NEW_USER.email)
    await page.getByTestId('signin-password-input').fill(NEW_USER.password)
    await page.getByTestId('signin-submit-button').click()

    // Attendre message d'erreur spécifique pour email non confirmé
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('error-message')).toContainText('Email not confirmed')
  })

  test('devrait se connecter avec un compte confirmé et se déconnecter', async ({ page }) => {
    // ⚠️ PRÉREQUIS:
    //    1. Fichier .env configuré avec TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_DISPLAY_NAME
    //    2. Compte créé MANUELLEMENT dans Supabase (via http://localhost:5173/supabase-test)
    //    3. Email confirmé (cliquer sur le lien reçu par email)

    await page.goto('/supabase-test')

    // Vérifier badge "Non connecté" avant connexion
    await expect(page.locator('text=NON CONNECTÉ').first()).toBeVisible()

    // Se connecter avec le compte confirmé
    await page.getByTestId('signin-email-input').fill(CONFIRMED_USER.email)
    await page.getByTestId('signin-password-input').fill(CONFIRMED_USER.password)
    await page.getByTestId('signin-submit-button').click()

    // Attendre message de succès de connexion
    await expect(page.getByTestId('success-message')).toContainText('Connexion réussie', { timeout: 10000 })

    // Vérifier badge "Connecté"
    await expect(page.locator('text=CONNECTÉ').first()).toBeVisible()

    // Vérifier que le bouton de déconnexion est visible
    await expect(page.getByTestId('signout-button')).toBeVisible()

    // Vérifier que l'email est affiché
    await expect(page.locator(`text=${CONFIRMED_USER.email}`)).toBeVisible()

    // Se déconnecter
    await page.getByTestId('signout-button').click()

    // Attendre message de succès de déconnexion
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion réussie', { timeout: 10000 })

    // Vérifier badge "Non connecté" après déconnexion
    await expect(page.locator('text=NON CONNECTÉ').first()).toBeVisible()

    // Vérifier que le bouton de déconnexion n'est plus visible
    await expect(page.getByTestId('signout-button')).not.toBeVisible()

    // Vérifier que les formulaires de connexion/inscription sont de nouveau visibles
    await expect(page.getByTestId('signin-submit-button')).toBeVisible()
    await expect(page.getByTestId('signup-submit-button')).toBeVisible()
  })

})
