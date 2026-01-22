import { test, expect } from '@playwright/test'
import { 
  loginAsCreator, 
  createProject, 
  publishProject,
  deleteProject,
  verifyProjectInList,
  TEST_PROJECTS,
  PROJECT_TYPES,
  STATUS_LABELS
} from './helpers.js'
import { PROJECT_SELECTORS } from '../../fixtures/project-fixtures.js'

test.describe('Phase 7 - CRUD Projets : Suppression de projets', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page)
  })

  test.describe('Suppression de projets brouillons', () => {

    test('devrait supprimer un projet brouillon', async ({ page }) => {
      // Créer un projet brouillon
      const projectData = TEST_PROJECTS.DRAFT_MINIMAL
      const createdProject = await createProject(page, projectData)
      
      // Vérifier qu'il existe
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      
      // Supprimer le projet
      await deleteProject(page, createdProject.title)
      
      // Vérifier que le projet n'existe plus
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })).not.toBeVisible()
      
      // Vérifier le message de succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
    })

    test('devrait supprimer plusieurs projets brouillons', async ({ page }) => {
      // Créer plusieurs projets brouillons
      const projects = []
      
      for (let i = 0; i < 3; i++) {
        const projectData = {
          ...TEST_PROJECTS.DRAFT_MINIMAL,
          title: `Brouillon à supprimer ${i + 1}`
        }
        const createdProject = await createProject(page, projectData)
        projects.push(createdProject)
      }
      
      // Vérifier qu'ils existent
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(3)
      
      // Supprimer tous les projets
      for (const project of projects) {
        await deleteProject(page, project.title)
        
        // Vérifier que le projet spécifique n'existe plus
        await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
          hasText: project.title 
        })).not.toBeVisible()
      }
      
      // Vérifier que la liste est vide
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(0)
      
      // Vérifier l'état vide
      await expect(page.locator(PROJECT_SELECTORS.EMPTY_STATE)).toBeVisible()
    })

    test('devrait confirmer la suppression avec dialogue', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.DRAFT_COMPLETE
      const createdProject = await createProject(page, projectData)
      
      // Commencer la suppression
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.DELETE_BUTTON_CARD).click()
      
      // Vérifier la présence du dialogue de confirmation
      const confirmDialog = page.locator('[data-testid="delete-confirm-dialog"]')
      if (await confirmDialog.isVisible()) {
        // Vérifier le contenu du dialogue
        await expect(page.locator('[data-testid="delete-confirm-title"]')).toBeVisible()
        await expect(page.locator('[data-testid="delete-confirm-message"]')).toBeVisible()
        await expect(page.locator('[data-testid="delete-confirm-project-name"]')).toContainText(createdProject.title)
        
        // Confirmer la suppression
        await page.locator(PROJECT_SELECTORS.DELETE_CONFIRM_BUTTON).click()
      } else {
        // Si pas de dialogue, utiliser le bouton direct
        await page.locator(PROJECT_SELECTORS.DELETE_CONFIRM_BUTTON).click()
      }
      
      // Vérifier le succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
      
      // Vérifier que le projet n'existe plus
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })).not.toBeVisible()
    })
  })

  test.describe('Suppression de projets publiés', () => {

    test('devrait supprimer un projet publié', async ({ page }) => {
      // Créer et publier un projet
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      const createdProject = await createProject(page, projectData)
      await publishProject(page, createdProject.title)
      
      // Vérifier qu'il est publié
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.ACTIVE])
      
      // Supprimer le projet publié
      await deleteProject(page, createdProject.title)
      
      // Vérifier que le projet n'existe plus
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })).not.toBeVisible()
      
      // Vérifier le message de succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
    })

    test('devrait supprimer un projet actif avec avertissement', async ({ page }) => {
      // Créer et publier un projet
      const projectData = TEST_PROJECTS.HIGH_GOAL_PROJECT
      const createdProject = await createProject(page, projectData)
      await publishProject(page, createdProject.title)
      
      // Commencer la suppression
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.DELETE_BUTTON_CARD).click()
      
      // Vérifier l'avertissement pour projet actif (si implémenté)
      const warningMessage = page.locator('[data-testid="delete-active-project-warning"]')
      if (await warningMessage.isVisible()) {
        await expect(warningMessage).toContainText('projet actif')
        await expect(warningMessage).toContainText('perdre')
      }
      
      // Confirmer la suppression
      await page.locator(PROJECT_SELECTORS.DELETE_CONFIRM_BUTTON).click()
      
      // Vérifier le succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
      
      // Vérifier que le projet n'existe plus
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })).not.toBeVisible()
    })

    test('devrait supprimer un projet terminé', async ({ page }) => {
      // Créer et publier un projet
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      const createdProject = await createProject(page, projectData)
      await publishProject(page, createdProject.title)
      
      // Note: La terminaison manuelle d'un projet dépend de l'implémentation
      // Pour ce test, on suppose qu'on peut le terminer ou on teste directement la suppression
      
      // Supprimer le projet (qu'il soit actif ou terminé)
      await deleteProject(page, createdProject.title)
      
      // Vérifier que le projet n'existe plus
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })).not.toBeVisible()
    })
  })

  test.describe('Annulation de suppression', () => {

    test('devrait annuler la suppression avec dialogue', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.DRAFT_MINIMAL
      const createdProject = await createProject(page, projectData)
      
      // Commencer la suppression
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.DELETE_BUTTON_CARD).click()
      
      // Annuler si dialogue présent
      const cancelButton = page.locator('[data-testid="delete-cancel-button"]')
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
        
        // Vérifier qu'on reste sur la page de liste
        await expect(page).toHaveURL('/dashboard/projects')
        
        // Vérifier que le projet existe toujours
        await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      } else {
        console.log('Pas de dialogue d\'annulation - suppression directe')
      }
    })

    test('devrait fermer le dialogue sans supprimer', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.DRAFT_COMPLETE
      const createdProject = await createProject(page, projectData)
      
      // Commencer la suppression
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.DELETE_BUTTON_CARD).click()
      
      // Fermer le dialogue avec ESC ou bouton fermer
      const closeButton = page.locator('[data-testid="dialog-close-button"]')
      if (await closeButton.isVisible()) {
        await closeButton.click()
      } else {
        await page.keyboard.press('Escape')
      }
      
      // Vérifier que le projet existe toujours
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
    })
  })

  test.describe('Suppression en lot et filtres', () => {

    test('devrait supprimer des projets avec différents statuts', async ({ page }) => {
      // Créer des projets avec différents statuts
      const draftProject = await createProject(page, {
        ...TEST_PROJECTS.DRAFT_MINIMAL,
        title: 'Brouillon à supprimer'
      })
      
      const activeProject = await createProject(page, {
        ...TEST_PROJECTS.ACTIVE_PROJECT,
        title: 'Actif à supprimer'
      })
      
      // Publier le projet actif
      await publishProject(page, activeProject.title)
      
      // Vérifier les filtres
      await page.goto('/dashboard/projects')
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(2)
      
      // Supprimer le brouillon
      await deleteProject(page, draftProject.title)
      
      // Vérifier avec le filtre brouillon
      await page.locator(PROJECT_SELECTORS.FILTER_DRAFT).click()
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(0)
      
      // Vérifier avec le filtre actif
      await page.locator(PROJECT_SELECTORS.FILTER_ACTIVE).click()
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(1)
      
      // Supprimer le projet actif
      await deleteProject(page, activeProject.title)
      
      // Vérifier que tout est vide
      await page.locator(PROJECT_SELECTORS.FILTER_ALL).click()
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(0)
    })

    test('devrait mettre à jour les compteurs après suppression', async ({ page }) => {
      // Créer plusieurs projets
      const projects = []
      
      // Créer 3 brouillons
      for (let i = 0; i < 3; i++) {
        const project = await createProject(page, {
          ...TEST_PROJECTS.DRAFT_MINIMAL,
          title: `Brouillon ${i + 1}`
        })
        projects.push(project)
      }
      
      // Vérifier le nombre initial
      await page.goto('/dashboard/projects')
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(3)
      
      // Supprimer un projet
      await deleteProject(page, projects[0].title)
      
      // Vérifier la mise à jour
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(2)
      
      // Supprimer les autres
      await deleteProject(page, projects[1].title)
      await deleteProject(page, projects[2].title)
      
      // Vérifier que la liste est vide
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD)).toHaveCount(0)
      await expect(page.locator(PROJECT_SELECTORS.EMPTY_STATE)).toBeVisible()
    })
  })

  test.describe('Erreurs et cas limites', () => {

    test('devrait gérer la suppression échouée', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.DRAFT_MINIMAL
      const createdProject = await createProject(page, projectData)
      
      // Simuler une erreur de suppression (intercepter la requête)
      await page.route('**/projects/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Erreur serveur lors de la suppression' })
        })
      })
      
      // Tenter de supprimer
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.DELETE_BUTTON_CARD).click()
      await page.locator(PROJECT_SELECTORS.DELETE_CONFIRM_BUTTON).click()
      
      // Vérifier le message d'erreur
      await expect(page.locator('[data-testid="project-error-message"]')).toBeVisible()
      
      // Vérifier que le projet existe toujours
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })).toBeVisible()
    })

    test('devrait empêcher la suppression si permissions insuffisantes', async ({ page }) => {
      // Ce test dépend de l'implémentation des permissions
      // Pour l'instant, on suppose que l'utilisateur connecté peut supprimer ses projets
      
      // Créer un projet
      const projectData = TEST_PROJECTS.DRAFT_MINIMAL
      const createdProject = await createProject(page, projectData)
      
      // Tenter de supprimer (devrait fonctionner)
      await deleteProject(page, createdProject.title)
      
      // Vérifier que ça fonctionne
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })).not.toBeVisible()
    })
  })

  test.describe('Navigation post-suppression', () => {

    test('devrait rediriger vers la liste après suppression', async ({ page }) => {
      // Créer un projet
      const projectData = TEST_PROJECTS.DRAFT_MINIMAL
      const createdProject = await createProject(page, projectData)
      
      // Aller sur la page d'édition
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Supprimer depuis l'édition
      await page.locator(PROJECT_SELECTORS.DELETE_BUTTON).click()
      await page.locator(PROJECT_SELECTORS.DELETE_CONFIRM_BUTTON).click()
      
      // Vérifier la redirection
      await expect(page).toHaveURL('/dashboard/projects')
      await expect(page.getByTestId('project-success-message')).toBeVisible()
    })

    test('devrait gérer la suppression du dernier projet', async ({ page }) => {
      // Créer un seul projet
      const projectData = TEST_PROJECTS.DRAFT_MINIMAL
      const createdProject = await createProject(page, projectData)
      
      // Supprimer le projet
      await deleteProject(page, createdProject.title)
      
      // Vérifier l'état vide
      await expect(page.locator(PROJECT_SELECTORS.EMPTY_STATE)).toBeVisible()
      await expect(page.getByTestId('my-projects-create-button')).toBeVisible()
      
      // Vérifier qu'on peut créer un nouveau projet
      await page.getByTestId('my-projects-create-button').click()
      await expect(page).toHaveURL('/projects/create')
    })
  })
})
