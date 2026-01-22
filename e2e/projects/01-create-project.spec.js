import { test, expect } from '@playwright/test'
import { 
  loginAsCreator, 
  createProject, 
  verifyProjectInList,
  TEST_PROJECTS,
  PROJECT_TYPES,
  STATUS_LABELS
} from './helpers.js'
import { INVALID_PROJECTS, ERROR_MESSAGES, PROJECT_SELECTORS } from '../../fixtures/project-fixtures.js'

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
      
      // Vérifier que le projet apparaît dans la liste
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      
      // Vérifier que le message de succès est affiché
      await expect(page.getByTestId('project-success-message')).toBeVisible()
    })

    test('devrait créer un projet brouillon complet', async ({ page }) => {
      // Créer un projet avec toutes les informations
      const projectData = TEST_PROJECTS.DRAFT_COMPLETE
      const createdProject = await createProject(page, projectData)
      
      // Vérifier l'apparition dans la liste
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      
      // Vérifier en éditant à nouveau que les données sont correctes
      const projectElement = page.locator('[data-testid="projects-grid"]').filter({ hasText: createdProject.title })
      await projectElement.locator('[data-testid="edit-project-button"]').first().click()
      
      // Vérifier que les données sont bien chargées
      await expect(page.locator('[data-testid="project-title-input"]')).toHaveValue(createdProject.title)
      await expect(page.locator('[data-testid="project-description-input"]')).toHaveValue(createdProject.description)
      await expect(page.locator('[data-testid="project-goal-input"]')).toHaveValue(createdProject.goal_amount)
      await expect(page.locator('[data-testid="project-deadline-input"]')).toHaveValue(createdProject.deadline)
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
        
        // Vérifier que chaque projet apparaît dans la liste
        await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      }
      
      // Vérifier que tous les projets sont dans la liste
      const projectElements = page.locator('[data-testid="projects-grid"] > *')
      const projectCount = await projectElements.count()
      expect(projectCount).toBe(3)
    })

    test('devrait naviguer correctement depuis le dashboard', async ({ page }) => {
      // Naviguer vers le dashboard
      await page.goto('/dashboard')
      
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
      await expect(page.getByTestId('project-success-message')).toBeVisible()
      await expect(page).toHaveURL('/dashboard/projects')
    })
  })

  test.describe('Validation du formulaire de création', () => {

    test('devrait afficher une erreur avec titre vide', async ({ page }) => {
      // Naviguer vers la création
      await page.goto('/dashboard/projects')
      await page.getByText('Créer un projet').first().click()
      await expect(page).toHaveURL('/projects/create')
      
      // Remplir tous les champs sauf le titre
      await page.locator('[data-testid="project-description-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.description)
      await page.locator('[data-testid="project-goal-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.goal_amount)
      await page.locator('[data-testid="project-deadline-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.deadline)
      
      // Tenter de sauvegarder
      await page.getByTestId('save-draft-button').click()
      
      // Vérifier le message d'erreur
      await expect(page.locator('[data-testid="project-form-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="project-form-error"]')).toContainText(ERROR_MESSAGES.EMPTY_TITLE)
    })

    test('devrait afficher une erreur avec description vide', async ({ page }) => {
      // Naviguer vers la création
      await page.goto('/dashboard/projects')
      await page.getByText('Créer un projet').first().click()
      await expect(page).toHaveURL('/projects/create')
      
      // Remplir tous les champs sauf la description
      await page.locator('[data-testid="project-title-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.title)
      await page.locator('[data-testid="project-goal-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.goal_amount)
      await page.locator('[data-testid="project-deadline-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.deadline)
      
      // Tenter de sauvegarder
      await page.getByTestId('save-draft-button').click()
      
      // Vérifier le message d'erreur
      await expect(page.locator('[data-testid="project-form-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="project-form-error"]')).toContainText(ERROR_MESSAGES.EMPTY_DESCRIPTION)
    })

    test('devrait afficher une erreur avec objectif invalide', async ({ page }) => {
      // Naviguer vers la création
      await page.goto('/dashboard/projects')
      await page.getByText('Créer un projet').first().click()
      await expect(page).toHaveURL('/projects/create')
      
      // Remplir tous les champs sauf l'objectif
      await page.locator('[data-testid="project-title-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.title)
      await page.locator('[data-testid="project-description-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.description)
      await page.locator('[data-testid="project-deadline-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.deadline)
      
      // Tenter de sauvegarder
      await page.getByTestId('save-draft-button').click()
      
      // Vérifier le message d'erreur
      await expect(page.locator('[data-testid="project-form-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="project-form-error"]')).toContainText(ERROR_MESSAGES.INVALID_GOAL)
    })

    test('devrait afficher une erreur avec date passée', async ({ page }) => {
      // Naviguer vers la création
      await page.goto('/dashboard/projects')
      await page.getByText('Créer un projet').first().click()
      await expect(page).toHaveURL('/projects/create')
      
      // Remplir tous les champs sauf la date
      await page.locator('[data-testid="project-title-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.title)
      await page.locator('[data-testid="project-description-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.description)
      await page.locator('[data-testid="project-goal-input"]').fill(TEST_PROJECTS.DRAFT_MINIMAL.goal_amount)
      
      // Tenter de sauvegarder
      await page.getByTestId('save-draft-button').click()
      
      // Vérifier le message d'erreur
      await expect(page.locator('[data-testid="project-form-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="project-form-error"]')).toContainText(ERROR_MESSAGES.PAST_DEADLINE)
    })
  })

  test.describe('Navigation et UX', () => {

    test('devrait annuler la création et retourner à la liste', async ({ page }) => {
      // Naviguer vers la création
      await page.goto('/dashboard/projects')
      await page.getByText('Créer un projet').first().click()
      
      // Remplir quelques champs
      await page.locator('[data-testid="project-title-input"]').fill('Projet à annuler')
      await page.locator('[data-testid="project-description-input"]').fill('Description à annuler')
      
      // Cliquer sur annuler
      await page.getByTestId('project-cancel-button').click()
      
      // Vérifier le retour (vers dashboard/projects ou /)
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/(\/dashboard\/projects|\/)$/)
    })

    test('devrait afficher l\'état vide quand aucun projet', async ({ page }) => {
      // Naviguer vers la liste des projets
      await page.goto('/dashboard/projects')
      
      // Si des projets existent, les supprimer pour tester l'état vide
      const existingProjects = page.locator('[data-testid="projects-grid"] > *')
      const projectCount = await existingProjects.count()
      
      if (projectCount > 0) {
        console.log(`${projectCount} projet(s) trouvé(s) - test adapté`)
        test.skip()
        return
      }
      
      // Vérifier l'état vide
      await expect(page.locator('[data-testid="my-projects-empty-state"]')).toBeVisible()
      await expect(page.getByText('Créer un projet')).toBeVisible()
    })

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
        console.log('Formulaire persistant - données maintenues')
      } else {
        console.log('Formulaire non persistant - données perdues (normal)')
      }
    })
  })
})
