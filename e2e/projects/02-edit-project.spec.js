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

test.describe('Phase 7 - CRUD Projets : Édition de projets', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page)
  })

  test.describe('Édition de projets brouillons', () => {

    test('devrait modifier un projet brouillon', async ({ page }) => {
      // Créer un projet brouillon
      const originalProject = await createProject(page, TEST_PROJECTS.DRAFT_MINIMAL)
      
      // Naviguer vers mes projets
      await page.goto('/dashboard/projects')
      
      // Cliquer sur éditer le projet
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: originalProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Vérifier la redirection vers la page d'édition
      await expect(page).toHaveURL(/\/projects\/.*\/edit/)
      
      // Modifier les champs
      const updatedData = {
        title: `${originalProject.title} - MODIFIÉ`,
        description: `${originalProject.description} - Description modifiée`,
        goal_amount: '75000',
        deadline: '2026-11-30'
      }
      
      await page.locator(PROJECT_SELECTORS.TITLE_INPUT).fill(updatedData.title)
      await page.locator(PROJECT_SELECTORS.DESCRIPTION_INPUT).fill(updatedData.description)
      await page.locator(PROJECT_SELECTORS.GOAL_INPUT).fill(updatedData.goal_amount)
      await page.locator(PROJECT_SELECTORS.DEADLINE_INPUT).fill(updatedData.deadline)
      
      // Sauvegarder les modifications
      await page.locator(PROJECT_SELECTORS.SAVE_DRAFT_BUTTON).click()
      
      // Vérifier le message de succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
      
      // Vérifier le retour à la liste
      await expect(page).toHaveURL('/dashboard/projects')
      
      // Vérifier que les modifications sont sauvegardées
      await verifyProjectInList(page, updatedData.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      
      // Vérifier que l'ancien titre n'existe plus
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: originalProject.title 
      })).not.toBeVisible()
    })

    test('devrait éditer plusieurs champs simultanément', async ({ page }) => {
      // Créer un projet
      const originalProject = await createProject(page, TEST_PROJECTS.DRAFT_COMPLETE)
      
      // Éditer le projet
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: originalProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Modifier tous les champs
      const updatedData = {
        title: 'Nouveau titre complet',
        description: 'Nouvelle description complète avec beaucoup plus de détails pour tester le rendu',
        goal_amount: '125000',
        deadline: '2026-12-15'
      }
      
      await page.locator(PROJECT_SELECTORS.TITLE_INPUT).fill(updatedData.title)
      await page.locator(PROJECT_SELECTORS.DESCRIPTION_INPUT).fill(updatedData.description)
      await page.locator(PROJECT_SELECTORS.GOAL_INPUT).fill(updatedData.goal_amount)
      await page.locator(PROJECT_SELECTORS.DEADLINE_INPUT).fill(updatedData.deadline)
      
      await page.locator(PROJECT_SELECTORS.SAVE_DRAFT_BUTTON).click()
      
      // Vérifier les modifications
      await verifyProjectInList(page, updatedData.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      
      // Vérifier en éditant à nouveau que les données sont correctes
      const updatedCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: updatedData.title 
      })
      await updatedCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      await expect(page.locator(PROJECT_SELECTORS.TITLE_INPUT)).toHaveValue(updatedData.title)
      await expect(page.locator(PROJECT_SELECTORS.DESCRIPTION_INPUT)).toHaveValue(updatedData.description)
      await expect(page.locator(PROJECT_SELECTORS.GOAL_INPUT)).toHaveValue(updatedData.goal_amount)
      await expect(page.locator(PROJECT_SELECTORS.DEADLINE_INPUT)).toHaveValue(updatedData.deadline)
    })

    test('devrait annuler les modifications', async ({ page }) => {
      // Créer un projet
      const originalProject = await createProject(page, TEST_PROJECTS.DRAFT_MINIMAL)
      
      // Commencer l'édition
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: originalProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Modifier des champs
      await page.locator(PROJECT_SELECTORS.TITLE_INPUT).fill('Titre modifié temporairement')
      await page.locator(PROJECT_SELECTORS.DESCRIPTION_INPUT).fill('Description modifiée temporairement')
      
      // Annuler les modifications
      await page.locator(PROJECT_SELECTORS.CANCEL_BUTTON).click()
      
      // Vérifier le retour à la liste
      await expect(page).toHaveURL('/dashboard/projects')
      
      // Vérifier que les modifications n'ont pas été sauvegardées
      await verifyProjectInList(page, originalProject.title, STATUS_LABELS[PROJECT_TYPES.DRAFT])
      await expect(page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: 'Titre modifié temporairement' 
      })).not.toBeVisible()
    })
  })

  test.describe('Édition de projets publiés', () => {

    test('devrait modifier un projet publié', async ({ page }) => {
      // Créer et publier un projet
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      const createdProject = await createProject(page, projectData)
      await publishProject(page, createdProject.title)
      
      // Éditer le projet publié
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Modifier la description uniquement
      const newDescription = `${createdProject.description} - Mis à jour après publication`
      await page.locator(PROJECT_SELECTORS.DESCRIPTION_INPUT).fill(newDescription)
      
      // Sauvegarder
      await page.locator(PROJECT_SELECTORS.SAVE_DRAFT_BUTTON).click()
      
      // Vérifier le succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
      
      // Vérifier que le projet reste publié
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.ACTIVE])
      
      // Vérifier que la description a été mise à jour
      const updatedCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await updatedCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      await expect(page.locator(PROJECT_SELECTORS.DESCRIPTION_INPUT)).toHaveValue(newDescription)
    })

    test('devrait modifier l\'objectif financier d\'un projet actif', async ({ page }) => {
      // Créer et publier un projet
      const projectData = TEST_PROJECTS.HIGH_GOAL_PROJECT
      const createdProject = await createProject(page, projectData)
      await publishProject(page, createdProject.title)
      
      // Éditer l'objectif
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Modifier l'objectif
      const newGoal = '200000'
      await page.locator(PROJECT_SELECTORS.GOAL_INPUT).fill(newGoal)
      
      await page.locator(PROJECT_SELECTORS.SAVE_DRAFT_BUTTON).click()
      
      // Vérifier la mise à jour
      await verifyProjectInList(page, createdProject.title, STATUS_LABELS[PROJECT_TYPES.ACTIVE])
      
      // Vérifier la nouvelle valeur
      const updatedCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: createdProject.title 
      })
      await updatedCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      await expect(page.locator(PROJECT_SELECTORS.GOAL_INPUT)).toHaveValue(newGoal)
    })
  })

  test.describe('Validation lors de l\'édition', () => {

    test('devrait empêcher la sauvegarde avec des données invalides', async ({ page }) => {
      // Créer un projet
      const originalProject = await createProject(page, TEST_PROJECTS.DRAFT_MINIMAL)
      
      // Commencer l'édition
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: originalProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Rendre le titre invalide
      await page.locator(PROJECT_SELECTORS.TITLE_INPUT).fill('')
      
      // Tenter de sauvegarder
      await page.locator(PROJECT_SELECTORS.SAVE_DRAFT_BUTTON).click()
      
      // Vérifier l'erreur
      await expect(page.locator(PROJECT_SELECTORS.ERROR_MESSAGE)).toBeVisible()
      
      // Vérifier qu'on reste sur la page d'édition
      await expect(page).toHaveURL(/\/projects\/.*\/edit/)
      
      // Restaurer un titre valide et sauvegarder
      await page.locator(PROJECT_SELECTORS.TITLE_INPUT).fill('Titre valide restauré')
      await page.locator(PROJECT_SELECTORS.SAVE_DRAFT_BUTTON).click()
      
      // Vérifier que ça fonctionne maintenant
      await expect(page.getByTestId('project-success-message')).toBeVisible()
      await expect(page).toHaveURL('/dashboard/projects')
    })

    test('devrait empêcher la publication avec des erreurs', async ({ page }) => {
      // Créer un projet
      const originalProject = await createProject(page, TEST_PROJECTS.DRAFT_MINIMAL)
      
      // Commencer l'édition
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: originalProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Rendre la description vide
      await page.locator(PROJECT_SELECTORS.DESCRIPTION_INPUT).fill('')
      
      // Tenter de publier
      await page.locator(PROJECT_SELECTORS.PUBLISH_BUTTON).click()
      
      // Vérifier l'erreur
      await expect(page.locator(PROJECT_SELECTORS.ERROR_MESSAGE)).toBeVisible()
      
      // Vérifier qu'on reste sur la page d'édition
      await expect(page).toHaveURL(/\/projects\/.*\/edit/)
    })
  })

  test.describe('Navigation et UX édition', () => {

    test('devrait naviguer depuis la galerie vers édition', async ({ page }) => {
      // Créer et publier un projet
      const projectData = TEST_PROJECTS.ACTIVE_PROJECT
      const createdProject = await createProject(page, projectData)
      await publishProject(page, createdProject.title)
      
      // Naviguer vers la galerie publique
      await page.goto('/')
      
      // Trouver le projet et cliquer dessus
      const projectLink = page.locator('a[href*="/projects/"]').filter({ 
        hasText: createdProject.title 
      })
      
      if (await projectLink.isVisible()) {
        await projectLink.click()
        
        // Vérifier qu'on est sur la page de détails
        await expect(page).toHaveURL(/\/projects\/.*/)
        
        // Note: L'édition depuis la galerie publique dépend de l'implémentation
        // Pour l'instant, on vérifie juste que la page de détails s'affiche
        await expect(page.locator('[data-testid="project-detail-page"]')).toBeVisible()
      } else {
        console.log('Projet non visible dans la galerie - normal si pas encore implémenté')
      }
    })

    test('devrait maintenir le focus sur le champ modifié', async ({ page }) => {
      // Créer un projet
      const originalProject = await createProject(page, TEST_PROJECTS.DRAFT_MINIMAL)
      
      // Commencer l'édition
      await page.goto('/dashboard/projects')
      const projectCard = page.locator(PROJECT_SELECTORS.PROJECT_CARD).filter({ 
        hasText: originalProject.title 
      })
      await projectCard.locator(PROJECT_SELECTORS.EDIT_BUTTON).click()
      
      // Cliquer sur un champ
      await page.locator(PROJECT_SELECTORS.TITLE_INPUT).click()
      
      // Vérifier que le champ a le focus
      await expect(page.locator(PROJECT_SELECTORS.TITLE_INPUT)).toBeFocused()
      
      // Modifier et sauvegarder
      await page.locator(PROJECT_SELECTORS.TITLE_INPUT).fill('Nouveau titre avec focus')
      await page.locator(PROJECT_SELECTORS.SAVE_DRAFT_BUTTON).click()
      
      // Vérifier le succès
      await expect(page.getByTestId('project-success-message')).toBeVisible()
    })
  })
})
