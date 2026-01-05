import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Flux complet', () => {
  test('devrait gérer le cycle complet : signup → signin → signout', async ({ page }) => {
    await page.goto('/supabase-test')

    const timestamp = Date.now()
    const email = `flow${timestamp}@example.com`
    const password = 'FlowTest123!'
    const displayName = 'Complete Flow User'

    // 1. INSCRIPTION
    await page.getByTestId('signup-display-name-input').fill(displayName)
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()

    // Attendre message de succès d'inscription
    await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('success-message')).toContainText('Inscription réussie')

    // Vérifier que l'utilisateur est automatiquement connecté
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 5000 })

    // Vérifier que les informations utilisateur sont affichées
    await expect(page.locator(`text=${email}`)).toBeVisible()
    await expect(page.locator('text=Connecté').first()).toBeVisible()

    // 2. DÉCONNEXION
    await page.getByTestId('signout-button').click()

    // Attendre message de déconnexion
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion', { timeout: 5000 })

    // Vérifier que les formulaires sont de nouveau visibles
    await expect(page.getByTestId('signup-submit-button')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('signin-submit-button')).toBeVisible()

    // Vérifier badge "Non connecté"
    await expect(page.locator('text=Non connecté').first()).toBeVisible()

    // 3. RECONNEXION (avec le compte fraîchement créé)
    await page.getByTestId('signin-email-input').fill(email)
    await page.getByTestId('signin-password-input').fill(password)
    await page.getByTestId('signin-submit-button').click()

    // Attendre message de connexion
    await expect(page.getByTestId('success-message')).toContainText('Connexion réussie', { timeout: 10000 })

    // Vérifier que le bouton de déconnexion est visible
    await expect(page.getByTestId('signout-button')).toBeVisible()

    // Vérifier badge "Connecté"
    await expect(page.locator('text=Connecté').first()).toBeVisible()

    // 4. DÉCONNEXION FINALE
    await page.getByTestId('signout-button').click()
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion', { timeout: 5000 })
  })

  test('devrait conserver les données utilisateur entre connexions', async ({ page }) => {
    await page.goto('/supabase-test')

    const timestamp = Date.now()
    const email = `persist${timestamp}@example.com`
    const password = 'PersistTest123!'
    const displayName = 'Persist Test User'

    // 1. Créer un compte
    await page.getByTestId('signup-display-name-input').fill(displayName)
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()

    // Attendre connexion automatique
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 10000 })

    // Vérifier affichage du display name dans le profil
    await expect(page.locator(`text=${displayName}`)).toBeVisible()

    // 2. Se déconnecter
    await page.getByTestId('signout-button').click()
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion', { timeout: 5000 })

    // 3. Se reconnecter
    await page.getByTestId('signin-email-input').fill(email)
    await page.getByTestId('signin-password-input').fill(password)
    await page.getByTestId('signin-submit-button').click()

    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 10000 })

    // 4. Vérifier que le display name est toujours présent
    await expect(page.locator(`text=${displayName}`)).toBeVisible()
  })

  test('devrait gérer plusieurs cycles signup/signin/signout consécutifs', async ({ page }) => {
    await page.goto('/supabase-test')

    const timestamp = Date.now()
    const email = `multi${timestamp}@example.com`
    const password = 'MultiTest123!'

    // Cycle 1: Signup
    await page.getByTestId('signup-display-name-input').fill('Multi User 1')
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 10000 })

    // Cycle 1: Signout
    await page.getByTestId('signout-button').click()
    await expect(page.getByTestId('signin-submit-button')).toBeVisible({ timeout: 5000 })

    // Cycle 2: Signin
    await page.getByTestId('signin-email-input').fill(email)
    await page.getByTestId('signin-password-input').fill(password)
    await page.getByTestId('signin-submit-button').click()
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 10000 })

    // Cycle 2: Signout
    await page.getByTestId('signout-button').click()
    await expect(page.getByTestId('signin-submit-button')).toBeVisible({ timeout: 5000 })

    // Cycle 3: Signin
    await page.getByTestId('signin-email-input').fill(email)
    await page.getByTestId('signin-password-input').fill(password)
    await page.getByTestId('signin-submit-button').click()
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 10000 })

    // Vérification finale
    await expect(page.locator('text=Connecté').first()).toBeVisible()
  })

  test('devrait vérifier la connexion Supabase durant tout le flux', async ({ page }) => {
    await page.goto('/supabase-test')

    // Vérifier connexion Supabase au début
    await expect(page.locator('text=✅ Connecté à Supabase')).toBeVisible({ timeout: 5000 })

    const timestamp = Date.now()
    const email = `dbcheck${timestamp}@example.com`
    const password = 'DBCheckTest123!'

    // Créer un compte
    await page.getByTestId('signup-display-name-input').fill('DB Check User')
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 10000 })

    // Vérifier que la connexion Supabase est toujours active
    await expect(page.locator('text=✅ Connecté à Supabase')).toBeVisible()

    // Se déconnecter
    await page.getByTestId('signout-button').click()
    await expect(page.getByTestId('signin-submit-button')).toBeVisible({ timeout: 5000 })

    // Vérifier que la connexion Supabase est toujours active après déconnexion
    await expect(page.locator('text=✅ Connecté à Supabase')).toBeVisible()
  })
})
