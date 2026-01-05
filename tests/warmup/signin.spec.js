import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Connexion', () => {
  test('devrait valider le formulaire de connexion', async ({ page }) => {
    await page.goto('/supabase-test')

    // Vérifier que tous les champs requis sont présents
    await expect(page.getByTestId('signin-email-input')).toBeVisible()
    await expect(page.getByTestId('signin-password-input')).toBeVisible()
    await expect(page.getByTestId('signin-submit-button')).toBeVisible()
  })

  test('devrait permettre de remplir les champs de connexion', async ({ page }) => {
    await page.goto('/supabase-test')

    const email = 'user@example.com'
    const password = 'password123'

    // Remplir les champs
    await page.getByTestId('signin-email-input').fill(email)
    await page.getByTestId('signin-password-input').fill(password)

    // Vérifier que les valeurs sont bien remplies
    await expect(page.getByTestId('signin-email-input')).toHaveValue(email)
    await expect(page.getByTestId('signin-password-input')).toHaveValue(password)
  })

  test('devrait afficher erreur si credentials invalides', async ({ page }) => {
    await page.goto('/supabase-test')

    // Utiliser des credentials invalides
    await page.getByTestId('signin-email-input').fill('wrong@example.com')
    await page.getByTestId('signin-password-input').fill('wrongpassword')
    await page.getByTestId('signin-submit-button').click()

    // Attendre message d'erreur
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 })
  })

  test('devrait se connecter après avoir créé un compte', async ({ page }) => {
    await page.goto('/supabase-test')

    // Générer email unique
    const timestamp = Date.now()
    const email = `signin${timestamp}@example.com`
    const password = 'TestPass123!'
    const displayName = 'Signin Test User'

    // 1. Créer un compte d'abord
    await page.getByTestId('signup-display-name-input').fill(displayName)
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()

    // Attendre message de succès d'inscription
    await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 10000 })

    // Attendre que l'utilisateur soit automatiquement connecté
    // (Supabase connecte automatiquement après signup)
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 5000 })

    // 2. Se déconnecter
    await page.getByTestId('signout-button').click()
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion', { timeout: 5000 })

    // 3. Se reconnecter avec les mêmes credentials
    await page.getByTestId('signin-email-input').fill(email)
    await page.getByTestId('signin-password-input').fill(password)
    await page.getByTestId('signin-submit-button').click()

    // Attendre message de succès de connexion
    await expect(page.getByTestId('success-message')).toContainText('Connexion réussie', { timeout: 10000 })

    // Vérifier que le bouton de déconnexion est visible
    await expect(page.getByTestId('signout-button')).toBeVisible()
  })

  test('devrait afficher les informations utilisateur après connexion', async ({ page }) => {
    await page.goto('/supabase-test')

    // Créer et se connecter
    const timestamp = Date.now()
    const email = `userinfo${timestamp}@example.com`
    const password = 'TestPass123!'
    const displayName = 'User Info Test'

    await page.getByTestId('signup-display-name-input').fill(displayName)
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()

    // Attendre connexion automatique
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 10000 })

    // Vérifier que l'email est affiché
    await expect(page.locator(`text=${email}`)).toBeVisible()

    // Vérifier badge "Connecté"
    await expect(page.locator('text=Connecté').first()).toBeVisible()
  })
})
