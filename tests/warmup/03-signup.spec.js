import { test, expect } from '@playwright/test'
import { NEW_USER, CONFIRMED_USER } from '../../fixtures/test-users.js'

test.describe('SupabaseTest - Inscription', () => {
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
  
  test('devrait créer un nouveau compte avec succès', async ({ page }) => {
        // ⚠️ IMPORTANT: Ce test utilise NEW_USER depuis .env
            // Ce compte NE DOIT PAS exister dans Supabase
                // Utilisez une vraie adresse email pour éviter les bounces

                    await page.goto('/supabase-test')
                    
    // Remplir formulaire d'inscription avec NEW_USER depuis .env
    await page.getByTestId('signup-display-name-input').fill(NEW_USER.displayName)
    await page.getByTestId('signup-email-input').fill(NEW_USER.email)
    await page.getByTestId('signup-password-input').fill(NEW_USER.password)

    // Soumettre
    await page.getByTestId('signup-submit-button').click()

    // Attendre message de succès (augmenter le timeout car Supabase peut être lent)
    await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('success-message')).toContainText('Inscription réussie')
  })

  test('devrait afficher message de succès pour un email déjà confirmé', async ({ page }) => {
    // ⚠️ Comportement de sécurité: Supabase ne révèle pas si un email existe déjà
    // Le message est le même que pour une nouvelle inscription

    await page.goto('/supabase-test')

    // Tenter de créer un compte avec l'email du compte confirmé (qui existe déjà)
    await page.getByTestId('signup-display-name-input').fill('Autre nom')
    await page.getByTestId('signup-email-input').fill(CONFIRMED_USER.email)
    await page.getByTestId('signup-password-input').fill('AutreMotDePasse123!')
    await page.getByTestId('signup-submit-button').click()

    // Supabase retourne le même message pour ne pas révéler que l'email existe
    await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('success-message')).toContainText('Inscription réussie')
  })
})
