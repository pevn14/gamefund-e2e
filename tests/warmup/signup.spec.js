import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Inscription', () => {
  test('devrait créer un nouveau compte avec succès', async ({ page }) => {
    await page.goto('/supabase-test')

    // Générer email unique pour éviter conflits
    const timestamp = Date.now()
    const email = `test${timestamp}@example.com`
    const password = 'TestPass123!'
    const displayName = 'Test User'

    // Remplir formulaire d'inscription
    await page.getByTestId('signup-display-name-input').fill(displayName)
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)

    // Soumettre
    await page.getByTestId('signup-submit-button').click()

    // Attendre message de succès (augmenter le timeout car Supabase peut être lent)
    await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('success-message')).toContainText('Inscription réussie')
  })

  test('devrait valider le formulaire d\'inscription', async ({ page }) => {
    await page.goto('/supabase-test')

    // Vérifier que tous les champs requis sont présents
    await expect(page.getByTestId('signup-display-name-input')).toBeVisible()
    await expect(page.getByTestId('signup-email-input')).toBeVisible()
    await expect(page.getByTestId('signup-password-input')).toBeVisible()
    await expect(page.getByTestId('signup-submit-button')).toBeVisible()
  })

  test('devrait afficher les labels des champs', async ({ page }) => {
    await page.goto('/supabase-test')

    // Vérifier les labels
    await expect(page.locator('label:has-text("Nom d\'affichage")')).toBeVisible()
    await expect(page.locator('label:has-text("Email")').first()).toBeVisible()
    await expect(page.locator('label:has-text("Mot de passe")').first()).toBeVisible()
  })

  test('devrait permettre de remplir tous les champs', async ({ page }) => {
    await page.goto('/supabase-test')

    const displayName = 'John Doe'
    const email = 'john@example.com'
    const password = 'SecurePass123!'

    // Remplir les champs
    await page.getByTestId('signup-display-name-input').fill(displayName)
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)

    // Vérifier que les valeurs sont bien remplies
    await expect(page.getByTestId('signup-display-name-input')).toHaveValue(displayName)
    await expect(page.getByTestId('signup-email-input')).toHaveValue(email)
    await expect(page.getByTestId('signup-password-input')).toHaveValue(password)
  })
})
