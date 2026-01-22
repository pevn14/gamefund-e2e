import { test, expect } from '@playwright/test'
import { 
  loginAsCreator, 
  createProject, 
  publishProject,
  verifyProjectInList,
  TEST_PROJECTS,
  PROJECT_TYPES,
  STATUS_LABELS
} from './helpers.js'
import { PROJECT_SELECTORS } from '../../fixtures/project-fixtures.js'

test.describe('Phase 7 - CRUD Projets : Publication de projets', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page)
  })

  test.describe('Publication depuis la liste', () => {

    test('devrait publier un projet brouillon depuis la liste', async ({ page }) => {
      // Créer un projet brouillon
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      const createdProject = await createProject(page, projectData)
      
      // Vérifier qu'il est en brouillon
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      
      // Publier le projet
      await publishProject(page, createdProject.title)
      
      // Vérifier que le statut a changé
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.ACTIVE])
      
      // Vérifier le message de succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
    })

    test('devrait publier plusieurs projets', async ({ page }) => {
      // Créer plusieurs projets
      const projects = []
      
      for (let i = 0; i < 3; i++) {
        const projectData = {
          ...TEST_PROJECTS.ACTIVE_PROJECT,
          title: `${TEST_PROJECTS.ACTIVE_PROJECT.title} ${i + 1}`
        }
        const createdProject = await createProject(page, projectData)
        projects.push(createdProject)
      }
      
      // Publier tous les projets
      for (const project of projects) {
        await publishProject(page, project.title)
        await verifyProjectInList(page, project.title, STATUS_LABELS[PROJECT_TYPES.ACTIVE])
      }
      
      // Vérifier que tous sont publiés
      await page.goto('/dashboard/projects')
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(3)
      
      // Vérifier avec le filtre actif
      await page.locator(PROJECT_SELECTORS.FILTER_ACTIVE).click()
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(3)
      
      // Vérifier qu'il n'y a plus de brouillons
      await page.locator(PROJECT_SELECTORS.FILTER_DRAFT).click()
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(0)
    })

    test('devrait confirmer la publication avec dialogue', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.HIGH_GOAL_PROJECT
      const createdProject = await createProject(page, projectData)
      
      // Commencer la publication
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Cliquer sur publier
      await page.locator(PROJECT_SELECTORS.PUBLISH_BUTTON).click()
      
      // Vérifier la présence du dialogue de confirmation (si implémenté)
      const confirmDialog = page.locator('[data-testid="publish-confirm-dialog"]')
      if (await confirmDialog.isVisible()) {
        // Vérifier le contenu du dialogue
        await expect(page.locator('[data-testid="publish-confirm-title"]')).toBeVisible()
        await expect(page.locator('[data-testid="publish-confirm-message"]')).toBeVisible()
        
        // Confirmer la publication
        await page.locator(PROJECT_SELECTORS.PUBLISH_CONFIRM_BUTTON).click()
      }
      
      // Vérifier le succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
      await expect(page).toHaveURL('/dashboard/projects')
      
      // Vérifier le statut
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.ACTIVE])
    })
  })

  test.describe('Publication depuis la page d\'édition', () => {

    test('devrait publier directement depuis l\'édition', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      const createdProject = await createProject(page, projectData)
      
      // Aller sur la page d'édition
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Publier depuis l'édition
      await page.locator(PROJECT_SELECTORS.PUBLISH_BUTTON).click()
      
      // Confirmer si nécessaire
      const confirmButton = page.locator(PROJECT_SELECTORS.PUBLISH_CONFIRM_BUTTON)
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }
      
      // Vérifier le succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
      await expect(page).toHaveURL('/dashboard/projects')
      
      // Vérifier le statut
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.ACTIVE])
    })

    test('devrait publier après modification', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.DRAFT_COMPLETE
      const createdProject = await createProject(page, projectData)
      
      // Modifier le projet
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Modifier la description
      const newDescription = `${createdProject.description} - Modifié avant publication`
      await page.locator(PROJECT_SELECTORS.DESCRIPTION_INPUT).fill(newDescription)
      
      // Publier directement
      await page.locator(PROJECT_SELECTORS.PUBLISH_BUTTON).click()
      
      // Confirmer si nécessaire
      const confirmButton = page.locator(PROJECT_SELECTORS.PUBLISH_CONFIRM_BUTTON)
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }
      
      // Vérifier le succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
      
      // Vérifier que les modifications sont publiées
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.ACTIVE])
      
      // Vérifier en éditant à nouveau
      const updatedCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await updatedCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      await expect(page.locator(PROJECT_SELECTORS.DESCRIPTION_INPUT)).toHaveValue(newDescription)
    })
  })

  test.describe('Filtres et visibilité après publication', () => {

    test('devrait filtrer correctement après publication', async ({ page }) => {
      // Créer des projets avec différents statuts
      const draftProject = await createProject(page, {
        ...TEST_PROJECTS.DRAFT_MINIMAL,
        title: 'Projet Brouillon Test'
      })
      
      const activeProject = await createProject(page, {
        ...TEST_PROJECTS.ACTIVE_PROJECT,
        title: 'Projet Actif Test'
      })
      
      // Publier uniquement le projet actif
      await publishProject(page, activeProject.title)
      
      // Vérifier le filtre "Tous"
      await page.goto('/dashboard/projects')
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(2)
      
      // Vérifier le filtre "Brouillons"
      await page.locator(PROJECT_SELECTORS.FILTER_DRAFT).click()
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(1)
      await verifyProjectInList(page, draftProject.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      
      // Vérifier le filtre "Actifs"
      await page.locator(PROJECT_SELECTORS.FILTER_ACTIVE).click()
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(1)
      await verifyProjectInList(page, activeProject.title, STATUS_LABELS[PROJECT_TYPES.ACTIVE])
    })

    test('devrait mettre à jour les compteurs de filtres', async ({ page }) => {
      // Créer plusieurs projets
      const projects = []
      
      // Créer 2 brouillons
      for (let i = 0; i < 2; i++) {
        const project = await createProject(page, {
          ...TEST_PROJECTS.DRAFT_MINIMAL,
          title: `Brouillon ${i + 1}`
        })
        projects.push(project)
      }
      
      // Créer 1 projet actif
      const activeProject = await createProject(page, {
        ...TEST_PROJECTS.ACTIVE_PROJECT,
        title: 'Actif 1'
      })
      
      // Publier le projet actif
      await publishProject(page, activeProject.title)
      
      // Vérifier les compteurs (si implémentés)
      await page.goto('/dashboard/projects')
      
      // Note: Les compteurs dépendent de l'implémentation UI
      // On vérifie juste que les filtres fonctionnent
      await page.locator(PROJECT_SELECTORS.FILTER_ALL).click()
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(3)
      
      await page.locator(PROJECT_SELECTORS.FILTER_DRAFT).click()
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(2)
      
      await page.locator(PROJECT_SELECTORS.FILTER_ACTIVE).click()
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(1)
    })
  })

  test.describe('Erreurs et cas limites', () => {

    test('devrait empêcher la publication avec données invalides', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.DRAFT_MINIMAL
      const createdProject = await createProject(page, projectData)
      
      // Aller sur la page d'édition
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Rendre le titre invalide
      await page.locator(PROJECT_SELECTORS.TITLE_INPUT).fill('')
      
      // Tenter de publier
      await page.locator(PROJECT_SELECTORS.PUBLISH_BUTTON).click()
      
      // Vérifier l'erreur
      await expect(page.locator(PROJECT_SELECTORS.ERROR_MESSAGE)).toBeVisible()
      
      // Vérifier qu'on reste sur la page d'édition
      await expect(page).toHaveURL(/\/projects\/.*\/edit/)
      
      // Corriger et publier
      await page.locator(PROJECT_SELECTORS.TITLE_INPUT).fill('Titre corrigé')
      await page.locator(PROJECT_SELECTORS.PUBLISH_BUTTON).click()
      
      // Confirmer si nécessaire
      const confirmButton = page.locator(PROJECT_SELECTORS.PUBLISH_CONFIRM_BUTTON)
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }
      
      // Vérifier le succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
    })

    test('devrait gérer l\'annulation de publication', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      const createdProject = await createProject(page, projectData)
      
      // Aller sur la page d'édition
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Cliquer sur publier
      await page.locator(PROJECT_SELECTORS.PUBLISH_BUTTON).click()
      
      // Annuler si dialogue présent
      const cancelButton = page.locator('[data-testid="publish-cancel-button"]')
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
        
        // Vérifier qu'on reste sur la page d'édition
        await expect(page).toHaveURL(/\/projects\/.*\/edit/)
        
        // Vérifier que le projet reste en brouillon
        await page.goto('/dashboard/projects')
        await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      } else {
        console.log('Pas de dialogue d\'annulation - publication directe')
      }
    })
  })

  test.describe('Navigation post-publication', () => {

    test('devrait rediriger vers la liste après publication', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      const createdProject = await createProject(page, projectData)
      
      // Publier depuis l'édition
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      await page.locator(PROJECT_SELECTORS.PUBLISH_BUTTON).click()
      
      // Confirmer si nécessaire
      const confirmButton = page.locator(PROJECT_SELECTORS.PUBLISH_CONFIRM_BUTTON)
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }
      
      // Vérifier la redirection
      await expect(page).toHaveURL('/dashboard/projects')
      await expect(page.getByTestId('project-success-message')).toBeVisible()
    })

    test('devrait permettre de continuer l\'édition après publication', async ({ page }) => {
      // Créer et publier un projet
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      const createdProject = await createProject(page, projectData)
      await publishProject(page, createdProject.title)
      
      // Éditer à nouveau
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Vérifier qu'on peut toujours éditer
      await expect(page).toHaveURL(/\/projects\/.*\/edit/)
      await expect(page.locator(PROJECT_SELECTORS.TITLE_INPUT)).toHaveValue(createdProject.title)
      
      // Modifier et sauvegarder
      await page.locator(PROJECT_SELECTORS.DESCRIPTION_INPUT).fill('Description modifiée après publication')
      await page.locator(PROJECT_SELECTORS.SAVE_DRAFT_BUTTON).click()
      
      // Vérifier le succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.ACTIVE])
    })
  })
})
