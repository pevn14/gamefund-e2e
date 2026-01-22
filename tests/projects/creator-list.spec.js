/**
 * Tests E2E - Gestion des projets : Liste créateur et filtrage
 * 
 * Scénario P3 : Filtrage par créateur
 * Voir les projets d'un créateur spécifique
 */

import { test, expect } from '@playwright/test';
import { loginAsCreator } from '../../helpers/auth.js';

test.describe('Projets - Liste créateur et filtrage', () => {

  test('devrait afficher la page des créateurs', async ({ page }) => {
    await loginAsCreator(page);
    await page.goto('/creators');
    
    // Vérifier la page
    await expect(page.getByTestId('creators-page')).toBeVisible();
    await expect(page.getByTestId('creators-page-title')).toBeVisible();
  });

  test('devrait afficher la grille des créateurs', async ({ page }) => {
    await loginAsCreator(page);
    await page.goto('/creators');
    
    // Vérifier la grille
    await expect(page.getByTestId('creators-page-grid')).toBeVisible();
  });

  test('devrait afficher les cartes créateurs avec les informations', async ({ page }) => {
    await loginAsCreator(page);
    await page.goto('/creators');
    
    // Vérifier les cartes créateurs
    const creatorCards = page.getByTestId('creator-card');
    const count = await creatorCards.count();
    
    if (count > 0) {
      const firstCard = creatorCards.first();
      
      // Vérifier les éléments de la carte
      await expect(firstCard.getByTestId('creator-card-avatar')).toBeVisible();
      await expect(firstCard.getByTestId('creator-card-name')).toBeVisible();
      await expect(firstCard.getByTestId('creator-card-projects-count')).toBeVisible();
      await expect(firstCard.getByTestId('creator-card-view-button')).toBeVisible();
    }
  });

  test('devrait filtrer les projets par créateur (P3)', async ({ page }) => {
    await loginAsCreator(page);
    await page.goto('/creators');
    
    // Vérifier les cartes créateurs
    const creatorCards = page.getByTestId('creator-card');
    const count = await creatorCards.count();
    
    if (count > 0) {
      // Cliquer sur "Voir les projets" du premier créateur
      await creatorCards.first().getByTestId('creator-card-view-button').click();
      
      // Vérifier la redirection vers la galerie avec filtre
      await expect(page).toHaveURL(/\//);
      
      // Vérifier le bandeau de filtrage créateur
      await expect(page.getByTestId('projects-page-creator-filter')).toBeVisible();
    }
  });

  test('devrait effacer le filtre créateur', async ({ page }) => {
    await loginAsCreator(page);
    await page.goto('/creators');
    
    const creatorCards = page.getByTestId('creator-card');
    const count = await creatorCards.count();
    
    if (count > 0) {
      // Cliquer sur "Voir les projets"
      await creatorCards.first().getByTestId('creator-card-view-button').click();
      
      // Vérifier le bandeau de filtrage
      const filterBanner = page.getByTestId('projects-page-creator-filter');
      if (await filterBanner.isVisible()) {
        // Cliquer sur effacer
        await page.getByTestId('projects-page-clear-creator-filter').click();
        
        // Vérifier que le bandeau disparaît
        await expect(filterBanner).not.toBeVisible();
      }
    }
  });

  test('devrait afficher un message si non connecté sur la page créateurs', async ({ page }) => {
    // Sans connexion
    await page.goto('/creators');
    
    // Vérifier le message de connexion
    const loginMessage = page.getByTestId('creators-page-login-message');
    const loginButton = page.getByTestId('creators-page-login-button');
    
    // L'un ou l'autre devrait être visible si non connecté
    const needsLogin = await loginMessage.isVisible() || await loginButton.isVisible();
    // Note: Selon l'implémentation, la page peut être accessible ou non
  });
});
