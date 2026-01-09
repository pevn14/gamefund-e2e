import { test, expect } from '@playwright/test'
import { CONFIRMED_USER } from '../../fixtures/test-users.js'

test.describe('GameFund - Navigation Header', () => {

  test.describe('Header non authentifié - Desktop', () => {
    
    test('devrait afficher les boutons connexion et inscription', async ({ page }) => {
      await page.goto('/')

      // Vérifier que les boutons Login et Signup sont visibles
      await expect(page.getByTestId('header-login-button')).toBeVisible()
      await expect(page.getByTestId('header-signup-button')).toBeVisible()
      
      // Vérifier que les liens authentifiés ne sont PAS visibles
      await expect(page.getByTestId('header-dashboard-link')).not.toBeVisible()
      await expect(page.getByTestId('header-projects-link')).not.toBeVisible()
      await expect(page.getByTestId('header-user-info')).not.toBeVisible()
      await expect(page.getByTestId('header-logout-button')).not.toBeVisible()
    })

    test('devrait naviguer vers la page de connexion', async ({ page }) => {
      await page.goto('/')

      // Cliquer sur le bouton connexion
      await page.getByTestId('header-login-button').click()
      
      // Vérifier la redirection
      await expect(page).toHaveURL('/login')
      await expect(page.getByText('Connexion')).toBeVisible()
    })

    test('devrait naviguer vers la page d\'inscription', async ({ page }) => {
      await page.goto('/')

      // Cliquer sur le bouton inscription
      await page.getByTestId('header-signup-button').click()
      
      // Vérifier la redirection
      await expect(page).toHaveURL('/signup')
      await expect(page.getByText('Inscription')).toBeVisible()
    })
  })

  test.describe('Header authentifié - Desktop', () => {
    
    test.use({ storageState: { cookies: [], origins: [] } }) // Reset state
    
    test('devrait afficher les liens authentifiés après connexion', async ({ page }) => {
      // Se connecter d'abord
      await page.goto('/login')
      await page.getByTestId('login-email-input').fill(CONFIRMED_USER.email)
      await page.getByTestId('login-password-input').fill(CONFIRMED_USER.password)
      await page.getByTestId('login-submit-button').click()
      
      // Attendre la redirection vers la page d'accueil
      await page.waitForURL('/', { timeout: 10000 })

      // Vérifier que les liens authentifiés sont visibles
      await expect(page.getByTestId('header-dashboard-link')).toBeVisible()
      await expect(page.getByTestId('header-projects-link')).toBeVisible()
      await expect(page.getByTestId('header-user-info')).toBeVisible()
      await expect(page.getByTestId('header-logout-button')).toBeVisible()
      
      // Vérifier que les boutons Login/Signup ne sont PAS visibles
      await expect(page.getByTestId('header-login-button')).not.toBeVisible()
      await expect(page.getByTestId('header-signup-button')).not.toBeVisible()
    })

    test('devrait naviguer vers le dashboard', async ({ page }) => {
      // Se connecter
      await page.goto('/login')
      await page.getByTestId('login-email-input').fill(CONFIRMED_USER.email)
      await page.getByTestId('login-password-input').fill(CONFIRMED_USER.password)
      await page.getByTestId('login-submit-button').click()
      await page.waitForURL('/', { timeout: 10000 })

      // Cliquer sur le lien Dashboard
      await page.getByTestId('header-dashboard-link').click()
      
      // Vérifier la navigation (peut rediriger vers /projects/create si pas de projets)
      await expect(page.url()).toMatch(/\/dashboard(\/projects)?/)
      
      // Vérifier qu'on est sur une page de dashboard ou création
      // Accepter plusieurs possibilités : Dashboard, Créer un projet, ou les data-testid
      const dashboardHeading = page.getByRole('heading', { name: /Dashboard/i })
      const createProjectButton = page.getByRole('button', { name: 'Créer un projet' }).first()
      
      await expect(dashboardHeading.or(createProjectButton)).toBeVisible()
    })

    test('devrait naviguer vers Mes Projets', async ({ page }) => {
      // Se connecter
      await page.goto('/login')
      await page.getByTestId('login-email-input').fill(CONFIRMED_USER.email)
      await page.getByTestId('login-password-input').fill(CONFIRMED_USER.password)
      await page.getByTestId('login-submit-button').click()
      await page.waitForURL('/', { timeout: 10000 })

      // Cliquer sur le lien Mes Projets
      await page.getByTestId('header-projects-link').click()
      
      // Vérifier la navigation
      await expect(page).toHaveURL('/dashboard/projects')
    })

    test('devrait afficher les informations utilisateur', async ({ page }) => {
      // Se connecter
      await page.goto('/login')
      await page.getByTestId('login-email-input').fill(CONFIRMED_USER.email)
      await page.getByTestId('login-password-input').fill(CONFIRMED_USER.password)
      await page.getByTestId('login-submit-button').click()
      await page.waitForURL('/', { timeout: 10000 })

      // Vérifier les infos utilisateur
      const userInfo = page.getByTestId('header-user-info')
      await expect(userInfo).toBeVisible()
      await expect(userInfo).toContainText(CONFIRMED_USER.displayName)
    })

    test('devrait se déconnecter correctement', async ({ page }) => {
      // Se connecter
      await page.goto('/login')
      await page.getByTestId('login-email-input').fill(CONFIRMED_USER.email)
      await page.getByTestId('login-password-input').fill(CONFIRMED_USER.password)
      await page.getByTestId('login-submit-button').click()
      await page.waitForURL('/', { timeout: 10000 })

      // Cliquer sur déconnexion
      await page.getByTestId('header-logout-button').click()
      
      // Vérifier retour à l'état non connecté
      await expect(page).toHaveURL('/')
      await expect(page.getByTestId('header-login-button')).toBeVisible()
      await expect(page.getByTestId('header-signup-button')).toBeVisible()
      await expect(page.getByTestId('header-dashboard-link')).not.toBeVisible()
    })
  })


  test.describe('Persistance de la navigation', () => {
    
    test('devrait rester connecté après refresh', async ({ page }) => {
      // Se connecter
      await page.goto('/login')
      await page.getByTestId('login-email-input').fill(CONFIRMED_USER.email)
      await page.getByTestId('login-password-input').fill(CONFIRMED_USER.password)
      await page.getByTestId('login-submit-button').click()
      await page.waitForURL('/', { timeout: 10000 })

      // Vérifier état connecté
      await expect(page.getByTestId('header-dashboard-link')).toBeVisible()

      // Refresh la page
      await page.reload()

      // Vérifier que l'utilisateur est toujours connecté
      await expect(page.getByTestId('header-dashboard-link')).toBeVisible()
      await expect(page.getByTestId('header-projects-link')).toBeVisible()
      await expect(page.getByTestId('header-user-info')).toBeVisible()
      await expect(page.getByTestId('header-login-button')).not.toBeVisible()
    })
  })
})
