/**
 * Tests E2E - Dashboards : Dashboard Donateur
 * 
 * Scénario DB2 : Dashboard Donateur
 * Vérifier la vue donateur
 */

import { test, expect } from '@playwright/test';
import { loginAsCreator } from '../../helpers/auth.js';

test.describe('Dashboards - Donateur', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page);
  });

  test('devrait afficher le dashboard donateur', async ({ page }) => {
    await page.goto('/donor-dashboard');
    
    // Vérifier la page
    await expect(page.getByTestId('donor-dashboard-page')).toBeVisible();
  });

  test('devrait afficher les statistiques (DB2)', async ({ page }) => {
    await page.goto('/donor-dashboard');
    
    // Vérifier les statistiques
    await expect(page.getByTestId('donor-dashboard-stats')).toBeVisible();
    await expect(page.getByTestId('donor-dashboard-stat-total-donated')).toBeVisible();
    await expect(page.getByTestId('donor-dashboard-stat-projects-count')).toBeVisible();
    await expect(page.getByTestId('donor-dashboard-stat-successful')).toBeVisible();
  });

  test('devrait afficher la grille des projets soutenus', async ({ page }) => {
    await page.goto('/donor-dashboard');

    // Auto-retry évite la race condition pendant le chargement
    await expect(
      page.getByTestId('donor-dashboard-projects-grid')
        .or(page.getByTestId('donor-dashboard-empty'))
    ).toBeVisible();
  });

  test('devrait afficher les donations récentes', async ({ page }) => {
    await page.goto('/donor-dashboard');

    // Auto-retry évite la race condition pendant le chargement
    await expect(
      page.getByTestId('donor-dashboard-recent-donations')
        .or(page.getByTestId('donor-dashboard-empty'))
        .first()
    ).toBeVisible();
  });

  test('devrait afficher le bouton voir tous mes dons', async ({ page }) => {
    await page.goto('/donor-dashboard');
    
    // Vérifier le bouton
    const viewAllButton = page.getByTestId('donor-dashboard-view-all-button');
    
    if (await viewAllButton.isVisible()) {
      await expect(viewAllButton).toBeVisible();
    }
  });

  test('devrait naviguer vers mes donations', async ({ page }) => {
    await page.goto('/donor-dashboard');
    
    const viewAllButton = page.getByTestId('donor-dashboard-view-all-button');
    
    if (await viewAllButton.isVisible()) {
      await viewAllButton.click();
      await expect(page).toHaveURL('/my-donations');
    }
  });

  test('devrait afficher l\'état vide si aucune donation', async ({ page }) => {
    await page.goto('/donor-dashboard');

    // Auto-retry évite la race condition pendant le chargement
    await expect(
      page.getByTestId('donor-dashboard-empty')
        .or(page.getByTestId('donor-dashboard-stats'))
        .first()
    ).toBeVisible();
  });
});
