/**
 * Fixtures pour les tests de projets
 * Données de test réutilisables et constantes
 */

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
 * Données invalides pour les tests de validation
 */
export const INVALID_PROJECTS = {
  EMPTY_TITLE: {
    title: '',
    description: 'Description valide',
    goal_amount: '50000',
    deadline: '2026-12-31'
  },
  
  SHORT_TITLE: {
    title: 'A',
    description: 'Description valide',
    goal_amount: '50000',
    deadline: '2026-12-31'
  },
  
  EMPTY_DESCRIPTION: {
    title: 'Titre valide',
    description: '',
    goal_amount: '50000',
    deadline: '2026-12-31'
  },
  
  INVALID_GOAL: {
    title: 'Titre valide',
    description: 'Description valide',
    goal_amount: '0',
    deadline: '2026-12-31'
  },
  
  PAST_DEADLINE: {
    title: 'Titre valide',
    description: 'Description valide',
    goal_amount: '50000',
    deadline: '2020-01-01'
  },
  
  NEGATIVE_GOAL: {
    title: 'Titre valide',
    description: 'Description valide',
    goal_amount: '-1000',
    deadline: '2026-12-31'
  }
}

/**
 * Messages d'erreur attendus
 */
export const ERROR_MESSAGES = {
  EMPTY_TITLE: 'Le titre est requis',
  SHORT_TITLE: 'Le titre doit contenir au moins 3 caractères',
  EMPTY_DESCRIPTION: 'La description est requise',
  INVALID_GOAL: 'L\'objectif doit être supérieur à 0',
  PAST_DEADLINE: 'La date limite doit être dans le futur',
  NEGATIVE_GOAL: 'L\'objectif ne peut pas être négatif'
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
 * Sélecteurs CSS pour les éléments de projet
 */
export const PROJECT_SELECTORS = {
  // Formulaire
  FORM: '[data-testid="project-form"]',
  TITLE_INPUT: '[data-testid="project-title-input"]',
  DESCRIPTION_INPUT: '[data-testid="project-description-input"]',
  GOAL_INPUT: '[data-testid="project-goal-input"]',
  DEADLINE_INPUT: '[data-testid="project-deadline-input"]',
  IMAGE_UPLOAD: '[data-testid="project-image-upload"]',
  IMAGE_PREVIEW: '[data-testid="project-image-preview"]',
  
  // Boutons
  SAVE_DRAFT_BUTTON: '[data-testid="project-save-draft-button"]',
  PUBLISH_BUTTON: '[data-testid="project-publish-button"]',
  CANCEL_BUTTON: '[data-testid="project-cancel-button"]',
  DELETE_BUTTON: '[data-testid="project-delete-button"]',
  PUBLISH_CONFIRM_BUTTON: '[data-testid="project-publish-confirm-button"]',
  DELETE_CONFIRM_BUTTON: '[data-testid="project-delete-confirm-button"]',
  
  // Messages
  SUCCESS_MESSAGE: '[data-testid="project-success-message"]',
  ERROR_MESSAGE: '[data-testid="project-form-error"]',
  
  // Liste projets
  PROJECTS_GRID: '[data-testid="my-projects-grid"]',
  PROJECT_CARD: '[data-testid="my-project-card"]',
  PROJECT_TITLE: '[data-testid="my-project-card-title"]',
  PROJECT_STATUS: '[data-testid="my-project-card-status"]',
  EDIT_BUTTON: '[data-testid="my-project-card-edit-button"]',
  DELETE_BUTTON_CARD: '[data-testid="my-project-card-delete-button"]',
  VIEW_BUTTON: '[data-testid="my-project-card-view-button"]',
  
  // Filtres
  FILTER_ALL: '[data-testid="my-projects-filter-all"]',
  FILTER_DRAFT: '[data-testid="my-projects-filter-draft"]',
  FILTER_ACTIVE: '[data-testid="my-projects-filter-active"]',
  FILTER_COMPLETED: '[data-testid="my-projects-filter-completed"]',
  
  // Actions
  CREATE_BUTTON: '[data-testid="my-projects-create-button"]',
  EMPTY_STATE: '[data-testid="my-projects-empty-state"]'
}
