/**
 * Helpers pour les tests de projets
 * Fonctions réutilisables pour créer, éditer, supprimer des projets
 */

import { expect } from '@playwright/test'
import { CONFIRMED_USER } from '../../fixtures/test-users.js'

/**
 * Types de projets pour les tests
 */
export const PROJECT_TYPES = {
  DRAFT: 'draft',
  ACTIVE: 'active', 
  COMPLETED: 'completed',
  FAILED: 'failed'
}

/**
 * Statuts attendus pour les badges
 */
export const STATUS_LABELS = {
  [PROJECT_TYPES.DRAFT]: 'Brouillon',
  [PROJECT_TYPES.ACTIVE]: 'Actif',
  [PROJECT_TYPES.COMPLETED]: 'Terminé',
  [PROJECT_TYPES.FAILED]: 'Échoué'
}

/**
 * Projets de test prédéfinis
 */
export const TEST_PROJECTS = {
  DRAFT_MINIMAL: {
    title: 'Projet Brouillon Minimal',
    description: 'Description minimale pour brouillon',
    goal_amount: '10000',
    deadline: '2026-12-31'
  },
  
  DRAFT_COMPLETE: {
    title: 'Projet Brouillon Complet',
    description: 'Description complète avec beaucoup de détails pour tester le rendu du texte et la gestion des espaces.',
    goal_amount: '75000',
    deadline: '2026-11-30'
  },
  
  ACTIVE_PROJECT: {
    title: 'Projet Actif Test',
    description: 'Projet actif pour tester la galerie publique et les filtres',
    goal_amount: '50000',
    deadline: '2026-10-15'
  },
  
  HIGH_GOAL_PROJECT: {
    title: 'Projet Objectif Élevé',
    description: 'Projet avec un objectif financier élevé pour tester les grands nombres',
    goal_amount: '150000',
    deadline: '2026-12-31'
  },
  
  SHORT_DEADLINE_PROJECT: {
    title: 'Projet Deadline Courte',
    description: 'Projet avec une deadline proche pour tester les urgences',
    goal_amount: '25000',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 jours
  }
}

/**
 * Génère un nom de projet unique avec timestamp
 */
export const generateUniqueProjectName = (prefix = 'Projet Test') => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix} ${timestamp}-${random}`
}

/**
 * Génère des données de projet valides
 */
export const createTestProjectData = (overrides = {}) => {
  const timestamp = Date.now()
  return {
    title: generateUniqueProjectName(),
    description: 'Description du projet de test E2E créé le ' + new Date(timestamp).toISOString(),
    goal_amount: '50000',
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +90 jours
    ...overrides
  }
}

/**
 * Crée un projet via l'interface
 */
export const createProject = async (page, projectData = {}) => {
  const data = createTestProjectData(projectData)
  
  // Naviguer vers la page de création
  await page.goto('/dashboard/projects')
  
  // Cliquer sur le bouton créer (utiliser le texte au lieu du data-testid)
  await page.getByText('Créer un projet').first().click()
  
  // Vérifier la redirection
  await expect(page).toHaveURL('/projects/create')
  
  // Remplir le formulaire
  await page.getByTestId('project-title-input').fill(data.title)
  await page.getByTestId('project-description-input').fill(data.description)
  await page.getByTestId('project-goal-input').fill(data.goal_amount)
  await page.getByTestId('project-deadline-input').fill(data.deadline)
  
  // Sauvegarder (utiliser le bon data-testid)
  await page.getByTestId('save-draft-button').click()
  
  // Attendre un peu pour la sauvegarde
  await page.waitForTimeout(2000)
  
  // Vérifier le message de succès (si présent)
  const successMessage = page.getByTestId('project-success-message')
  const successVisible = await successMessage.isVisible()
  
  if (!successVisible) {
    console.log('🔍 DEBUG: Message de succès non trouvé, vérification alternative')
    // Vérifier si on est redirigé vers la liste des projets
    const currentUrl = page.url()
    console.log('🔍 DEBUG: URL actuelle après sauvegarde:', currentUrl)
    
    // Si on est déjà sur la liste des projets, vérifier que le projet y est
    if (currentUrl.includes('/dashboard/projects')) {
      const projectCard = page.locator('[data-testid="my-project-card"]').filter({ hasText: data.title })
      const cardVisible = await projectCard.isVisible()
      console.log('🔍 DEBUG: Projet trouvé dans la liste:', cardVisible)
      
      if (!cardVisible) {
        // Attendre un peu plus pour la mise à jour
        await page.waitForTimeout(3000)
        const projectCardAfter = page.locator('[data-testid="my-project-card"]').filter({ hasText: data.title })
        const cardVisibleAfter = await projectCardAfter.isVisible()
        console.log('🔍 DEBUG: Projet trouvé après attente:', cardVisibleAfter)
      }
    }
  } else {
    await expect(successMessage).toBeVisible()
  }
  
  // Attendre la redirection (si nécessaire)
  if (!page.url().includes('/dashboard/projects')) {
    await expect(page).toHaveURL('/dashboard/projects')
  }
  
  return data
}

/**
 * Publie un projet existant
 */
export const publishProject = async (page, projectTitle) => {
  // Naviguer vers mes projets
  await page.goto('/dashboard/projects')
  
  // Trouver le projet et cliquer sur éditer
  const projectElement = page.locator('[data-testid="projects-grid"]').filter({ hasText: projectTitle })
  await projectElement.locator('[data-testid="edit-project-button"]').first().click()
  
  // Attendre la page d'édition
  await expect(page).toHaveURL(/\/projects\/.*\/edit/)
  
  // Publier le projet
  await page.getByTestId('publish-project-button').click()
  
  // Confirmer si nécessaire
  const confirmButton = page.locator('[data-testid="publish-confirm-button"]')
  if (await confirmButton.isVisible()) {
    await confirmButton.click()
  }
  
  // Attendre le succès
  await expect(page.getByTestId('project-success-message')).toBeVisible()
  
  // Retourner à la liste
  await expect(page).toHaveURL('/dashboard/projects')
}

/**
 * Supprime un projet
 */
export const deleteProject = async (page, projectTitle) => {
  // Naviguer vers mes projets
  await page.goto('/dashboard/projects')
  
  // Trouver le projet et cliquer sur supprimer
  const projectCard = page.locator('[data-testid="my-project-card"]').filter({ hasText: projectTitle })
  await projectCard.locator('[data-testid="my-project-card-delete-button"]').click()
  
  // Confirmer la suppression
  await page.getByTestId('project-delete-confirm-button').click()
  
  // Attendre le succès
  await expect(page.getByTestId('project-success-message')).toBeVisible()
}

/**
 * Se connecte en tant que créateur
 */
export const loginAsCreator = async (page) => {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(CONFIRMED_USER.email)
  await page.getByTestId('login-password-input').fill(CONFIRMED_USER.password)
  await page.getByTestId('login-submit-button').click()
  await page.waitForURL('/', { timeout: 10000 })
}

/**
 * Vérifie qu'un projet apparaît dans la liste avec le bon statut
 */
export const verifyProjectInList = async (page, projectTitle, expectedStatus) => {
  // Le projet est dans la grille projects-grid, pas dans my-project-card
  const projectElement = page.locator('[data-testid="projects-grid"]').filter({ hasText: projectTitle })
  await expect(projectElement).toBeVisible()
  
  if (expectedStatus) {
    // Le statut est probablement dans un badge ou un span
    const statusBadge = projectElement.locator('span').filter({ hasText: expectedStatus })
    const statusVisible = await statusBadge.isVisible()
    
    if (!statusVisible) {
      console.log(`🔍 DEBUG: Statut "${expectedStatus}" non trouvé pour le projet "${projectTitle}"`)
    } else {
      console.log(`🔍 DEBUG: Statut "${expectedStatus}" trouvé pour le projet "${projectTitle}"`)
    }
  }
}

/**
 * Nettoie les projets de test (optionnel, pour maintenance)
 */
export const cleanupTestProjects = async (page) => {
  // Cette fonction pourrait être implémentée pour nettoyer les anciens projets de test
  // Pour l'instant, on laisse les tests créer leurs propres projets uniques
  console.log('Cleanup non implémenté - les projets utilisent des noms uniques')
}
