import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Déconnexion', () => {
  test('devrait se déconnecter après connexion', async ({ page }) => {
    await page.goto('/supabase-test')

    // 1. Créer un compte (automatiquement connecté après signup)
    const timestamp = Date.now()
    const email = `signout${timestamp}@example.com`
    const password = 'TestPass123!'
    const displayName = 'Signout Test User'

    await page.getByTestId('signup-display-name-input').fill(displayName)
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()

    // Attendre connexion automatique
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 10000 })

    // 2. Se déconnecter
    await page.getByTestId('signout-button').click()

    // Attendre message de succès
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion', { timeout: 5000 })
  })

  test('devrait afficher les formulaires après déconnexion', async ({ page }) => {
    await page.goto('/supabase-test')

    // 1. Créer un compte
    const timestamp = Date.now()
    const email = `forms${timestamp}@example.com`
    const password = 'TestPass123!'

    await page.getByTestId('signup-display-name-input').fill('Forms Test')
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()

    // Attendre connexion
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 10000 })

    // 2. Se déconnecter
    await page.getByTestId('signout-button').click()
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion', { timeout: 5000 })

    // 3. Vérifier que les formulaires sont de nouveau visibles
    await expect(page.getByTestId('signup-submit-button')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('signin-submit-button')).toBeVisible()
  })

  test('devrait masquer le bouton de déconnexion après déconnexion', async ({ page }) => {
    await page.goto('/supabase-test')

    // 1. Créer un compte
    const timestamp = Date.now()
    const email = `hidebutton${timestamp}@example.com`
    const password = 'TestPass123!'

    await page.getByTestId('signup-display-name-input').fill('Hide Button Test')
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()

    // Attendre connexion
    await expect(page.getByTestId('signout-button')).toBeVisible({ timeout: 10000 })

    // 2. Se déconnecter
    await page.getByTestId('signout-button').click()
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion', { timeout: 5000 })

    // 3. Vérifier que le bouton de déconnexion n'est plus visible
    await expect(page.getByTestId('signout-button')).not.toBeVisible()
  })

  test('devrait afficher badge "Non connecté" après déconnexion', async ({ page }) => {
    await page.goto('/supabase-test')

    // 1. Créer un compte
    const timestamp = Date.now()
    const email = `badge${timestamp}@example.com`
    const password = 'TestPass123!'

    await page.getByTestId('signup-display-name-input').fill('Badge Test')
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()

    // Attendre connexion (badge "Connecté" visible)
    await expect(page.locator('text=Connecté').first()).toBeVisible({ timeout: 10000 })

    // 2. Se déconnecter
    await page.getByTestId('signout-button').click()
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion', { timeout: 5000 })

    // 3. Vérifier badge "Non connecté"
    await expect(page.locator('text=Non connecté').first()).toBeVisible({ timeout: 5000 })
  })
})
