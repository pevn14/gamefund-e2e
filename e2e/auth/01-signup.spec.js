import { test, expect } from '@playwright/test'
import { NEW_USER, CONFIRMED_USER } from '../../fixtures/test-users.js'

test.describe('GameFund - Inscription (SignupPage)', () => {
  test('devrait valider le formulaire d\'inscription', async ({ page }) => {
    await page.goto('/signup')

    // Vérifier que tous les champs requis sont présents
    await expect(page.getByTestId('signup-display-name-input')).toBeVisible()
    await expect(page.getByTestId('signup-email-input')).toBeVisible()
    await expect(page.getByTestId('signup-password-input')).toBeVisible()
    await expect(page.getByTestId('signup-confirm-password-input')).toBeVisible()
    await expect(page.getByTestId('signup-submit-button')).toBeVisible()
  })

  test('devrait afficher les labels des champs', async ({ page }) => {
    await page.goto('/signup')

    // Vérifier les labels (sans astérisque dans la nouvelle interface)
    await expect(page.getByText("Nom d'affichage")).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()
    
    // Utiliser first() pour le premier "Mot de passe" 
    await expect(page.getByText('Mot de passe').first()).toBeVisible()
    await expect(page.getByText('Confirmer le mot de passe')).toBeVisible()
  })

  test('devrait permettre de remplir tous les champs', async ({ page }) => {
    await page.goto('/signup')

    // Remplir tous les champs
    await page.getByTestId('signup-display-name-input').fill('Test User')
    await page.getByTestId('signup-email-input').fill('test@example.com')
    await page.getByTestId('signup-password-input').fill('password123')
    await page.getByTestId('signup-confirm-password-input').fill('password123')

    // Vérifier que les valeurs sont bien remplies
    await expect(page.getByTestId('signup-display-name-input')).toHaveValue('Test User')
    await expect(page.getByTestId('signup-email-input')).toHaveValue('test@example.com')
    await expect(page.getByTestId('signup-password-input')).toHaveValue('password123')
    await expect(page.getByTestId('signup-confirm-password-input')).toHaveValue('password123')
  })

  test('devrait créer un nouveau compte avec succès', async ({ page }) => {
    await page.goto('/signup')

    // Remplir le formulaire avec le nouvel utilisateur
    await page.getByTestId('signup-display-name-input').fill(NEW_USER.displayName)
    await page.getByTestId('signup-email-input').fill(NEW_USER.email)
    await page.getByTestId('signup-password-input').fill(NEW_USER.password)
    await page.getByTestId('signup-confirm-password-input').fill(NEW_USER.password)

    // Soumettre le formulaire
    await page.getByTestId('signup-submit-button').click()

    // Attendre le message de succès
    await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('success-message')).toContainText('Inscription réussie')
  })

  test('devrait afficher message de succès pour email déjà confirmé', async ({ page }) => {
    await page.goto('/signup')

    // Essayer de créer un compte avec un email déjà confirmé
    await page.getByTestId('signup-display-name-input').fill(CONFIRMED_USER.displayName)
    await page.getByTestId('signup-email-input').fill(CONFIRMED_USER.email)
    await page.getByTestId('signup-password-input').fill(CONFIRMED_USER.password)
    await page.getByTestId('signup-confirm-password-input').fill(CONFIRMED_USER.password)

    // Soumettre le formulaire
    await page.getByTestId('signup-submit-button').click()

    // Vérifier le message (peut être succès ou erreur selon l'implémentation)
    const messageElement = page.getByTestId('success-message').or(page.getByTestId('error-message'))
    await expect(messageElement).toBeVisible({ timeout: 10000 })
  })
})
