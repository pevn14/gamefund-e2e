import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Chargement page', () => {
  test('devrait afficher la page de test', async ({ page }) => {
    await page.goto('/supabase-test')

    // Vérifier titre principal
    await expect(page.locator('h1')).toContainText('Test Supabase')

    // Vérifier que la page contient les sections attendues
    await expect(page.getByText('Test de connexion Supabase')).toBeVisible()
    await expect(page.getByText('État de connexion utilisateur')).toBeVisible()
  })

  test('devrait afficher badge de connexion Supabase', async ({ page }) => {
    await page.goto('/supabase-test')

    // Attendre que le test de connexion soit terminé
    await page.waitForSelector('text=✅ Connecté à Supabase', {
      timeout: 5000
    })

    // Vérifier le badge vert
    const badge = page.locator('text=✅ Connecté à Supabase')
    await expect(badge).toBeVisible()
  })

  test('devrait afficher les informations de configuration', async ({ page }) => {
    await page.goto('/supabase-test')

    // Vérifier section Informations
    await expect(page.getByText('Services disponibles:')).toBeVisible()
    await expect(page.getByText('✅ Client Supabase initialisé')).toBeVisible()
    await expect(page.getByText('✅ AuthService (signup, signin, signout)')).toBeVisible()
  })

  test('devrait afficher les formulaires quand non connecté', async ({ page }) => {
    await page.goto('/supabase-test')

    // Vérifier présence des formulaires d'inscription et connexion
    await expect(page.getByText('Inscription')).toBeVisible()
    await expect(page.getByText('Connexion')).toBeVisible()

    // Vérifier présence des boutons
    await expect(page.getByTestId('signup-submit-button')).toBeVisible()
    await expect(page.getByTestId('signin-submit-button')).toBeVisible()
  })
})
