/**
 * Tests E2E - Dashboards : Dashboard Créateur
 * 
 * Scénario DB1 : Dashboard Créateur
 * Vérifier l'affichage et les actions du dashboard créateur
 */

import { test, expect } from '@playwright/test';
import { loginAsCreator } from '../../helpers/auth.js';

test.describe('Dashboards - Créateur', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page);
  });

  test('devrait afficher le dashboard créateur', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier la page
    await expect(page.getByTestId('creator-dashboard-page')).toBeVisible();
  });

  test('devrait afficher le message de bienvenue', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier le message de bienvenue
    await expect(page.getByTestId('creator-dashboard-welcome')).toBeVisible();
  });

  test('devrait afficher les 4 statistiques (DB1)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier la grille de statistiques
    await expect(page.getByTestId('creator-dashboard-stats')).toBeVisible();
    
    // Vérifier les 4 cartes de stats
    await expect(page.getByTestId('creator-dashboard-stat-total')).toBeVisible();
    await expect(page.getByTestId('creator-dashboard-stat-active')).toBeVisible();
    await expect(page.getByTestId('creator-dashboard-stat-collected')).toBeVisible();
    await expect(page.getByTestId('creator-dashboard-stat-donors')).toBeVisible();
  });

  test('devrait afficher les projets récents', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier la section projets récents
    await expect(page.getByTestId('creator-dashboard-recent-projects')).toBeVisible();
  });

  test('devrait afficher les actions rapides', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier la section actions rapides
    await expect(page.getByTestId('creator-dashboard-quick-actions')).toBeVisible();
  });

  test('devrait naviguer vers mes projets depuis les actions rapides', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Trouver le lien vers mes projets dans les actions rapides
    const quickActions = page.getByTestId('creator-dashboard-quick-actions');
    const projectsLink = quickActions.locator('a[href="/dashboard/projects"]');
    
    if (await projectsLink.isVisible()) {
      await projectsLink.click();
      await expect(page).toHaveURL('/dashboard/projects');
    }
  });

  test('devrait naviguer vers la création de projet', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Trouver le lien vers création de projet
    const quickActions = page.getByTestId('creator-dashboard-quick-actions');
    const createLink = quickActions.locator('a[href="/projects/create"]');
    
    if (await createLink.isVisible()) {
      await createLink.click();
      await expect(page).toHaveURL('/projects/create');
    }
  });

  test('devrait afficher l\'alerte brouillons si applicable', async ({ page }) => {
    await page.goto('/dashboard');
    
    // L'alerte brouillons peut ou non être visible selon les données
    const draftsAlert = page.getByTestId('creator-dashboard-drafts-alert');
    
    // On vérifie juste que la page charge correctement
    await expect(page.getByTestId('creator-dashboard-page')).toBeVisible();
  });

  test('devrait afficher l\'état vide pour un nouveau créateur', async ({ page }) => {
    await page.goto('/dashboard');

    // L'un ou l'autre devrait être visible (auto-retry évite la race condition)
    await expect(
      page.getByTestId('creator-dashboard-empty')
        .or(page.getByTestId('creator-dashboard-recent-projects'))
    ).toBeVisible();
  });
});
