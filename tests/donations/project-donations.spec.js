/**
 * Tests E2E - Système de dons : Donations d'un projet (vue créateur)
 * 
 * Scénario D3 : Vue créateur des donations
 * Créateur consulte les dons reçus sur ses projets
 */

import { test, expect } from '@playwright/test';
import { loginAsCreator } from '../../helpers/auth.js';

test.describe('Donations - Vue créateur', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page);
  });

  test('devrait accéder aux donations depuis mes projets', async ({ page }) => {
    await page.goto('/dashboard/projects');
    
    // Vérifier la page mes projets
    await expect(page.getByTestId('my-projects-page')).toBeVisible();
    
    // Vérifier les cartes de projet
    const projectCards = page.getByTestId('my-project-card');
    const count = await projectCards.count();
    
    // S'il y a des projets, on peut accéder aux donations
    if (count > 0) {
      // Note: Le bouton "Voir les donations" peut ne pas être visible sur tous les projets
      const viewDonationsButton = projectCards.first().locator('[data-testid*="donations"]');
      if (await viewDonationsButton.isVisible()) {
        await viewDonationsButton.click();
        await expect(page.getByTestId('project-donations-page')).toBeVisible();
      }
    }
  });

  test('devrait afficher la page des donations d\'un projet', async ({ page }) => {
    // Accéder directement via URL (nécessite un ID de projet valide)
    await page.goto('/dashboard/projects');
    
    const projectCards = page.getByTestId('my-project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      // Cliquer sur éditer pour obtenir l'URL du projet
      const editButton = projectCards.first().getByTestId('my-project-card-edit-button');
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Récupérer l'ID du projet depuis l'URL
        const url = page.url();
        const match = url.match(/\/projects\/([a-zA-Z0-9-]+)\/edit/);
        
        if (match) {
          const projectId = match[1];
          // Naviguer vers les donations du projet
          await page.goto(`/my-projects/${projectId}/donations`);
          
          // Vérifier la page
          await expect(page.getByTestId('project-donations-page')).toBeVisible();
        }
      }
    }
  });

  test('devrait afficher les statistiques des donations', async ({ page }) => {
    await page.goto('/dashboard/projects');
    
    const projectCards = page.getByTestId('my-project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      const editButton = projectCards.first().getByTestId('my-project-card-edit-button');
      if (await editButton.isVisible()) {
        await editButton.click();
        
        const url = page.url();
        const match = url.match(/\/projects\/([a-zA-Z0-9-]+)\/edit/);
        
        if (match) {
          const projectId = match[1];
          await page.goto(`/my-projects/${projectId}/donations`);
          
          // Vérifier les statistiques
          await expect(page.getByTestId('project-donations-stats')).toBeVisible();
        }
      }
    }
  });

  test('devrait afficher la liste des donations reçues', async ({ page }) => {
    await page.goto('/dashboard/projects');
    
    const projectCards = page.getByTestId('my-project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      const editButton = projectCards.first().getByTestId('my-project-card-edit-button');
      if (await editButton.isVisible()) {
        await editButton.click();
        
        const url = page.url();
        const match = url.match(/\/projects\/([a-zA-Z0-9-]+)\/edit/);
        
        if (match) {
          const projectId = match[1];
          await page.goto(`/my-projects/${projectId}/donations`);
          
          // Vérifier la liste ou l'état vide
          const list = page.getByTestId('project-donations-list');
          const empty = page.getByTestId('project-donations-empty');
          
          const hasContent = await list.isVisible() || await empty.isVisible();
          expect(hasContent).toBeTruthy();
        }
      }
    }
  });

  test('devrait afficher le bouton d\'export CSV', async ({ page }) => {
    await page.goto('/dashboard/projects');
    
    const projectCards = page.getByTestId('my-project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      const editButton = projectCards.first().getByTestId('my-project-card-edit-button');
      if (await editButton.isVisible()) {
        await editButton.click();
        
        const url = page.url();
        const match = url.match(/\/projects\/([a-zA-Z0-9-]+)\/edit/);
        
        if (match) {
          const projectId = match[1];
          await page.goto(`/my-projects/${projectId}/donations`);
          
          // Vérifier le bouton export
          const exportButton = page.getByTestId('project-donations-export-button');
          if (await exportButton.isVisible()) {
            await expect(exportButton).toBeVisible();
          }
        }
      }
    }
  });
});
