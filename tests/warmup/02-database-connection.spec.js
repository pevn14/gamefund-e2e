import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Connexion base de données', () => {
  test('devrait afficher le badge de connexion réussie', async ({ page }) => {
    await page.goto('/supabase-test')

    // Attendre que le test de connexion soit terminé
    await page.waitForSelector('text=✅ Connecté à Supabase', {
      timeout: 5000
    })

    // Vérifier le badge de succès
    const successBadge = page.locator('text=✅ Connecté à Supabase')
    await expect(successBadge).toBeVisible()
  })

  test('devrait afficher le bouton pour retester la connexion', async ({ page }) => {
    await page.goto('/supabase-test')

    // Attendre que la page soit chargée
    await page.waitForSelector('text=Retester la connexion', {
      timeout: 5000
    })

    // Vérifier présence du bouton
    const retestButton = page.locator('text=Retester la connexion')
    await expect(retestButton).toBeVisible()
  })

  test('le bouton de reconnexion devrait fonctionner', async ({ page }) => {
    await page.goto('/supabase-test')

    // Attendre le chargement initial
    await page.waitForSelector('text=✅ Connecté à Supabase', {
      timeout: 5000
    })

    // Cliquer sur le bouton retester
    await page.click('text=Retester la connexion')

    // Vérifier que le badge de connexion est toujours visible après le retest
    await page.waitForSelector('text=✅ Connecté à Supabase', {
      timeout: 5000
    })

    const successBadge = page.locator('text=✅ Connecté à Supabase')
    await expect(successBadge).toBeVisible()
  })

  test('devrait afficher la section état de connexion utilisateur', async ({ page }) => {
    await page.goto('/supabase-test')

    // Vérifier la présence de la carte "État de connexion utilisateur"
    await expect(page.getByText('État de connexion utilisateur')).toBeVisible()

    // Par défaut, l'utilisateur n'est pas connecté
    await expect(page.locator('text=Non connecté').first()).toBeVisible()
  })
})
