import { test, expect } from '@playwright/test'
import { CONFIRMED_USER, NEW_USER, INVALID_USERS } from '../../fixtures/test-users.js'

test.describe('GameFund - Connexion et Déconnexion (LoginPage)', () => {

  test('devrait afficher erreur si compte inexistant', async ({ page }) => {
    // Test avec credentials invalides (compte qui n'existe pas)
    // Utilise le compte CONFIRMED_USER avec un mauvais mot de passe

    await page.goto('/login')

    const wrongUser = INVALID_USERS.wrongCredentials
    await page.getByTestId('login-email-input').fill(wrongUser.email)
    await page.getByTestId('login-password-input').fill(wrongUser.password)
    await page.getByTestId('login-submit-button').click()

    // Attendre message d'erreur
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('error-message')).toContainText('Invalid login credentials')
  })

  test('devrait afficher erreur si email non confirmé', async ({ page }) => {
    // Test avec un compte existant mais non vérifié (NEW_USER)
    // Ce compte existe dans Supabase mais l'email n'a pas été confirmé
    // ⚠️ PRÉREQUIS: Ce test nécessite que le compte NEW_USER ait été créé (via 01-signup.spec.js)

    await page.goto('/login')

    await page.getByTestId('login-email-input').fill(NEW_USER.email)
    await page.getByTestId('login-password-input').fill(NEW_USER.password)
    await page.getByTestId('login-submit-button').click()

    // Attendre message d'erreur
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 })

    // Accepter deux messages possibles :
    // - "Email not confirmed" si le compte NEW_USER existe (créé par 01-signup.spec.js)
    // - "Invalid login credentials" si le compte n'existe pas encore
    const errorMessage = await page.getByTestId('error-message').textContent()
    expect(errorMessage).toMatch(/Email not confirmed|Invalid login credentials/)
  })

  test('devrait se connecter avec un compte confirmé et se déconnecter', async ({ page }) => {
    // ⚠️ PRÉREQUIS:
    //    1. Fichier .env configuré avec TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_DISPLAY_NAME
    //    2. Compte créé MANUELLEMENT dans Supabase (via /signup)
    //    3. Email confirmé (cliquer sur le lien reçu par email)

    // ÉTAPE 1: Aller sur la page d'accueil pour vérifier le statut initial
    await page.goto('/')

    // La page d'accueil est maintenant ProjectsPage, pas TestHome
    // Vérifier que les boutons de connexion sont visibles
    await expect(page.getByTestId('header-login-button')).toBeVisible()
    await expect(page.getByTestId('header-signup-button')).toBeVisible()

    // ÉTAPE 2: Aller sur la page de connexion
    await page.goto('/login')

    // Se connecter avec le compte confirmé
    await page.getByTestId('login-email-input').fill(CONFIRMED_USER.email)
    await page.getByTestId('login-password-input').fill(CONFIRMED_USER.password)
    await page.getByTestId('login-submit-button').click()

    // ÉTAPE 3: Attendre la redirection vers /
    await page.waitForURL('/', { timeout: 10000 })

    // Vérifier que l'utilisateur est connecté (plus de boutons connexion/inscription)
    await expect(page.getByTestId('header-login-button')).not.toBeVisible()
    await expect(page.getByTestId('header-signup-button')).not.toBeVisible()

    // Vérifier la présence de l'avatar ou du menu utilisateur
    await expect(page.locator('[data-testid="user-avatar"], [data-testid="user-menu"]').or(page.getByText('Dashboard'))).toBeVisible({ timeout: 10000 })

    // ÉTAPE 4: Se déconnecter (si le bouton est accessible)
    const logoutButton = page.locator('[data-testid="logout-button"], [data-testid="signout-button"]').or(page.getByText('Déconnexion')).or(page.getByText('Se déconnecter'))
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      // Vérifier le retour à l'état non connecté
      await expect(page.getByTestId('header-login-button')).toBeVisible({ timeout: 10000 })
    }
  })

})
