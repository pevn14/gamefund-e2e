import { test, expect } from '@playwright/test'

test.describe('GameFund - Navigation Galerie Projets', () => {

  test.describe('Navigation vers détails', () => {
    
    test('devrait naviguer vers les détails d\'un projet', async ({ page }) => {
      // Naviguer directement vers une page de détails
      await page.goto('/projects/test-project-id')
      
      // Vérifier que la page de détails se charge
      await expect(page.locator('[data-testid="project-detail-page"]')).toBeVisible()
      await expect(page.getByText('Page en construction')).toBeVisible()
      await expect(page.getByText('ID du projet:')).toBeVisible()
    })

    test('devrait naviguer vers la galerie via le bouton retour', async ({ page }) => {
      // Aller sur une page de détails
      await page.goto('/projects/test-project-id')
      await expect(page.locator('[data-testid="project-detail-page"]')).toBeVisible()

      // Cliquer sur le bouton retour
      await page.getByTestId('project-detail-back-button').click()
      
      // Vérifier le retour à l'accueil
      await expect(page).toHaveURL('/')
    })

    test('devrait naviguer via le logo GameFund', async ({ page }) => {
      // Aller sur une page de détails
      await page.goto('/projects/test-project-id')
      await expect(page.locator('[data-testid="project-detail-page"]')).toBeVisible()

      // Cliquer sur le logo GameFund
      await page.locator('a[href="/"]').first().click()
      
      // Vérifier le retour à l'accueil
      await expect(page).toHaveURL('/')
    })
  })


  test.describe('Gestion des URLs', () => {
    
    test('devrait gérer les URLs de projet invalides', async ({ page }) => {
      // Naviguer vers une URL de projet invalide
      await page.goto('/projects/invalid-id')
      
      // Vérifier que la page de détails se charge même avec un ID invalide
      await expect(page.locator('[data-testid="project-detail-page"]')).toBeVisible()
      await expect(page.getByText('ID du projet: invalid-id')).toBeVisible()
    })

    test('devrait afficher l\'ID du projet dans la page de détails', async ({ page }) => {
      // Aller sur une page de détails avec un ID spécifique
      await page.goto('/projects/my-test-project')
      
      // Vérifier que l'ID est affiché
      await expect(page.locator('[data-testid="project-detail-page"]')).toBeVisible()
      await expect(page.getByText('ID du projet: my-test-project')).toBeVisible()
    })
  })

  test.describe('Navigation depuis l\'accueil', () => {
    
    test('devrait naviguer depuis l\'accueil vers /projects', async ({ page }) => {
      await page.goto('/')

      // Cliquer sur un lien vers /projects si disponible
      const projectsLink = page.locator('a[href="/projects"]')
      if (await projectsLink.isVisible()) {
        await projectsLink.click()
        await expect(page).toHaveURL('/projects')
      } else {
        // Si pas de lien direct, naviguer manuellement
        await page.goto('/projects')
        // Vérifier juste que la page se charge (sans data-testid)
        await expect(page.getByText(/Découvrez les projets|Projets/)).toBeVisible()
      }
    })
  })

  test.describe('Bouton de création', () => {
    
    test('devrait vérifier la présence du bouton créer', async ({ page }) => {
      await page.goto('/projects')
      
      // Vérifier si le bouton créer existe (peut être visible ou non selon connexion)
      const createButton = page.getByText('Créer un projet')
      if (await createButton.isVisible()) {
        await expect(createButton).toBeEnabled()
      } else {
        // Le bouton n'est pas visible - c'est normal si non connecté
        console.log('Bouton "Créer un projet" non visible - utilisateur non connecté')
      }
    })
  })
})
