/**
 * Tests E2E - Gestion des projets : Galerie publique
 * 
 * Scénario P1 : Parcours galerie publique
 * Navigation et filtrage dans la galerie
 */

import { test, expect } from '@playwright/test';

test.describe('Projets - Galerie publique', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('devrait afficher la page de galerie', async ({ page }) => {
    // Vérifier la présence des éléments principaux
    await expect(page.getByTestId('projects-page')).toBeVisible();
    await expect(page.getByTestId('projects-page-title')).toBeVisible();
  });

  test('devrait afficher les filtres de recherche', async ({ page }) => {
    // Vérifier la présence des filtres
    await expect(page.getByTestId('projects-search-input')).toBeVisible();
    await expect(page.getByTestId('projects-status-filter')).toBeVisible();
    await expect(page.getByTestId('projects-sort-filter')).toBeVisible();
  });

  test('devrait afficher la grille de projets', async ({ page }) => {
    // Vérifier la présence de la grille
    await expect(page.getByTestId('projects-grid')).toBeVisible();
  });

  test('devrait afficher les cartes de projets avec les informations requises', async ({ page }) => {
    // Attendre que les projets soient chargés
    const projectCards = page.getByTestId('project-card');
    
    // S'il y a des projets, vérifier leur structure
    const count = await projectCards.count();
    if (count > 0) {
      const firstCard = projectCards.first();
      
      // Vérifier les éléments de la carte
      await expect(firstCard.getByTestId('project-card-title')).toBeVisible();
      await expect(firstCard.getByTestId('project-card-badge')).toBeVisible();
      await expect(firstCard.getByTestId('project-card-progress')).toBeVisible();
      await expect(firstCard.getByTestId('project-card-stats')).toBeVisible();
      await expect(firstCard.getByTestId('project-card-creator')).toBeVisible();
    }
  });

  test('devrait filtrer les projets par recherche textuelle (P1)', async ({ page }) => {
    // Entrer un terme de recherche
    const searchInput = page.getByTestId('projects-search-input');
    await searchInput.fill('test');
    
    // Attendre le debounce et le chargement
    await page.waitForTimeout(500);
    
    // Vérifier que la grille est toujours visible
    await expect(page.getByTestId('projects-grid')).toBeVisible();
  });

  test('devrait filtrer les projets par statut', async ({ page }) => {
    // Sélectionner un statut
    const statusFilter = page.getByTestId('projects-status-filter');
    await statusFilter.selectOption('active');
    
    // Attendre le chargement
    await page.waitForTimeout(300);
    
    // Vérifier que la grille est toujours visible
    await expect(page.getByTestId('projects-grid')).toBeVisible();
  });

  test('devrait changer le tri des projets', async ({ page }) => {
    // Sélectionner un tri
    const sortFilter = page.getByTestId('projects-sort-filter');
    await sortFilter.selectOption('most-funded');
    
    // Attendre le chargement
    await page.waitForTimeout(300);
    
    // Vérifier que la grille est toujours visible
    await expect(page.getByTestId('projects-grid')).toBeVisible();
  });

  test('devrait naviguer vers le détail d\'un projet', async ({ page }) => {
    // Attendre que les projets soient chargés
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      // Cliquer sur le premier projet
      await projectCards.first().getByTestId('project-card-link').click();
      
      // Vérifier la navigation vers la page de détail
      await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+/);
      await expect(page.getByTestId('project-detail-page')).toBeVisible();
    }
  });

  test('devrait afficher l\'état vide si aucun projet', async ({ page }) => {
    // Rechercher quelque chose qui n'existe pas
    const searchInput = page.getByTestId('projects-search-input');
    await searchInput.fill('xyznonexistentproject123456');
    
    // Attendre le debounce
    await page.waitForTimeout(500);
    
    // Vérifier l'état vide ou la grille vide
    const emptyState = page.getByTestId('projects-grid-empty');
    const grid = page.getByTestId('projects-grid');
    
    // L'un ou l'autre devrait être visible
    const isEmpty = await emptyState.isVisible() || (await grid.locator('[data-testid="project-card"]').count()) === 0;
    expect(isEmpty).toBeTruthy();
  });
});
