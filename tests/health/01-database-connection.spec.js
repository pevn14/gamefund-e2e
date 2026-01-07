import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Connexion base de données', () => {
  test('devrait afficher le badge de connexion réussie', async ({ page }) => {
    await page.goto('/')

    // Attendre que le test de connexion soit terminé
    await page.waitForSelector('text=✅ Connecté', {
      timeout: 5000
    })

    // Vérifier le badge de succès
    const successBadge = page.locator('text=✅ Connecté')
    await expect(successBadge).toBeVisible()
  })

  test('devrait afficher le bouton pour retester la connexion', async ({ page }) => {
    await page.goto('/')

    // Attendre que la page soit chargée
    await page.waitForSelector('text=Retester', {
      timeout: 5000
    })

    // Vérifier présence du bouton
    const retestButton = page.locator('text=Retester')
    await expect(retestButton).toBeVisible()
  })

  test('le bouton de reconnexion devrait fonctionner', async ({ page }) => {
    await page.goto('/')

    // Attendre le chargement initial
    await page.waitForSelector('text=✅ Connecté', {
      timeout: 5000
    })

    // Cliquer sur le bouton retester
    await page.click('text=Retester')

    // Vérifier que le badge de connexion est toujours visible après le retest
    await page.waitForSelector('text=✅ Connecté', {
      timeout: 5000
    })

    const successBadge = page.locator('text=✅ Connecté')
    await expect(successBadge).toBeVisible()
  })
})
