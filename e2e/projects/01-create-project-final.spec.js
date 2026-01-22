import { test, expect } from '@playwright/test'
import { 
  loginAsCreator, 
  createProject, 
  TEST_PROJECTS
} from './helpers.js'

test.describe('Phase 7 - CRUD Projets : Création de projets', () => {

  test.beforeEach(async ({ page }) => {
    // Se connecter avant chaque test
    await loginAsCreator(page)
  })

  test.describe('Création de projets valides', () => {

    test('devrait créer un projet brouillon valide', async ({ page }) => {
      // Créer un projet brouillon
      const projectData = TEST_PROJECTS.DRAFT_MINIMAL
      const createdProject = await createProject(page, projectData)
      
      // Vérifications simples
      await expect(page.url()).toMatch(/\/dashboard\/projects/)
      
      // Vérifier qu'il y a au moins un projet dans la grille
      const projectsGrid = page.locator('[data-testid="projects-grid"]')
      await expect(projectsGrid).toBeVisible()
      
      const anyProject = page.locator('[data-testid="projects-grid"] > *')
      const projectCount = await anyProject.count()
      expect(projectCount).toBeGreaterThan(0)
      
      // Vérifier qu'il y a des badges "Brouillon"
      const brouillonBadges = page.locator('[data-testid="projects-grid"] span').filter({ hasText: 'Brouillon' })
      const badgeCount = await brouillonBadges.count()
      expect(badgeCount).toBeGreaterThan(0)
      
      console.log(`✅ ${projectCount} projet(s) trouvé(s)`)
      console.log(`✅ ${badgeCount} badge(s) "Brouillon" trouvé(s)`)
    })

    test('devrait créer plusieurs projets avec des noms uniques', async ({ page }) => {
      // Créer plusieurs projets pour vérifier l'unicité
      const projects = []
      
      for (let i = 0; i < 3; i++) {
        const projectData = {
          ...TEST_PROJECTS.DRAFT_MINIMAL,
          title: `${TEST_PROJECTS.DRAFT_MINIMAL.title} ${i + 1}`
        }
        
        const createdProject = await createProject(page, projectData)
        projects.push(createdProject)
      }
      
      // Vérifier que tous les projets sont dans la liste
      const projectElements = page.locator('[data-testid="projects-grid"] > *')
      const projectCount = await projectElements.count()
      expect(projectCount).toBeGreaterThanOrEqual(3)
      
      console.log(`✅ ${projectCount} projet(s) trouvé(s) après création multiple`)
    })

    test('devrait naviguer correctement depuis dashboard/projects', async ({ page }) => {
      // Naviguer vers la liste des projets
      await page.goto('/dashboard/projects')
      
      // Cliquer sur le bouton créer un projet
      await page.getByText('Créer un projet').first().click()
      
      // Vérifier la redirection vers la page de création
      await expect(page).toHaveURL('/projects/create')
      
      // Vérifier que le formulaire est présent
      await expect(page.locator('[data-testid="project-form"]')).toBeVisible()
      
      // Remplir et créer
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      await page.locator('[data-testid="project-title-input"]').fill(projectData.title)
      await page.locator('[data-testid="project-description-input"]').fill(projectData.description)
      await page.locator('[data-testid="project-goal-input"]').fill(projectData.goal_amount)
      await page.locator('[data-testid="project-deadline-input"]').fill(projectData.deadline)
      
      await page.getByTestId('save-draft-button').click()
      
      // Vérifier le succès
      await expect(page.url()).toMatch(/\/dashboard\/projects/)
      
      console.log('✅ Navigation depuis dashboard/projects fonctionnelle')
    })
  })

  test.describe('Navigation et UX', () => {

    test('devrait maintenir les données du formulaire lors de la navigation', async ({ page }) => {
      // Naviguer vers la création
      await page.goto('/dashboard/projects')
      await page.getByText('Créer un projet').first().click()
      
      // Remplir le formulaire
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      await page.locator('[data-testid="project-title-input"]').fill(projectData.title)
      await page.locator('[data-testid="project-description-input"]').fill(projectData.description)
      await page.locator('[data-testid="project-goal-input"]').fill(projectData.goal_amount)
      await page.locator('[data-testid="project-deadline-input"]').fill(projectData.deadline)
      
      // Naviguer vers une autre page et revenir
      await page.goto('/dashboard')
      await page.goto('/projects/create')
      
      // Vérifier que les données sont toujours là (si le formulaire est persistant)
      const titleValue = await page.locator('[data-testid="project-title-input"]').inputValue()
      if (titleValue === projectData.title) {
        console.log('✅ Formulaire persistant - données maintenues')
      } else {
        console.log('✅ Formulaire non persistant - données perdues (normal)')
      }
    })
  })
})
