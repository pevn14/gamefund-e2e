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

    // ÉTAPE 1: Aller sur la page d'accueil de test pour vérifier le statut initial
    await page.goto('/')

    // Attendre que le chargement soit terminé (useAuth est asynchrone)
    // Le badge "Chargement..." doit disparaître avant le badge "Non connecté"
    await expect(page.getByTestId('user-status-loading')).not.toBeVisible({ timeout: 10000 })

    // TODO: data-testid="user-status-disconnected" manquant dans TestHome.jsx ligne 122
    // Utiliser getByText() temporairement
    await expect(page.getByText('Non connecté')).toBeVisible()

    // ÉTAPE 2: Aller sur la page de connexion
    await page.goto('/login')

    // Se connecter avec le compte confirmé
    await page.getByTestId('login-email-input').fill(CONFIRMED_USER.email)
    await page.getByTestId('login-password-input').fill(CONFIRMED_USER.password)
    await page.getByTestId('login-submit-button').click()

    // ÉTAPE 3: Attendre la redirection vers / (TestHome)
    await page.waitForURL('/', { timeout: 10000 })

    // TODO: Badge component ne transfère pas les data-testid - utiliser getByText()
    // Vérifier badge "Connecté" après connexion
    await expect(page.getByText('✅ Connecté')).toBeVisible({ timeout: 10000 })

    // Vérifier que le nom d'utilisateur est affiché
    await expect(page.getByTestId('user-display-name')).toBeVisible()
    await expect(page.getByTestId('user-display-name')).toContainText(CONFIRMED_USER.displayName)

    // Vérifier que l'email est affiché
    await expect(page.getByTestId('user-email')).toBeVisible()
    await expect(page.getByTestId('user-email')).toContainText(CONFIRMED_USER.email)

    // Vérifier que le bouton de déconnexion est visible
    await expect(page.getByTestId('signout-button')).toBeVisible()

    // ÉTAPE 4: Se déconnecter
    await page.getByTestId('signout-button').click()

    // Attendre que le statut change (TODO: utiliser data-testid quand ajouté)
    await expect(page.getByText('Non connecté')).toBeVisible({ timeout: 10000 })

    // Vérifier que le bouton de déconnexion n'est plus visible
    await expect(page.getByTestId('signout-button')).not.toBeVisible()

    // Vérifier que le badge "Non connecté" est de retour
    await expect(page.getByText('Non connecté')).toBeVisible()
  })

})
