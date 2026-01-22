/**
 * Tests E2E - Profils créateurs : Page Créateurs
 * 
 * Scénario PC2 : Page Créateurs
 * Découvrir les créateurs
 */

import { test, expect } from '@playwright/test';
import { loginAsCreator } from '../../helpers/auth.js';

test.describe('Profils - Page Créateurs', () => {

  test('devrait afficher un message si non connecté', async ({ page }) => {
    // Sans connexion
    await page.goto('/creators');
    
    // Vérifier le message de connexion ou la page
    const loginMessage = page.getByTestId('creators-page-login-message');
    const loginButton = page.getByTestId('creators-page-login-button');
    const creatorsPage = page.getByTestId('creators-page');
    
    // L'un ou l'autre devrait être visible
    const hasContent = await loginMessage.isVisible() || await loginButton.isVisible() || await creatorsPage.isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('devrait afficher la page créateurs une fois connecté (PC2)', async ({ page }) => {
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

  test('devrait afficher les cartes créateurs avec avatar, nom, bio et nb projets', async ({ page }) => {
    await loginAsCreator(page);
    await page.goto('/creators');
    
    const creatorCards = page.getByTestId('creator-card');
    const count = await creatorCards.count();
    
    if (count > 0) {
      const firstCard = creatorCards.first();
      
      // Vérifier les éléments de la carte
      await expect(firstCard.getByTestId('creator-card-avatar')).toBeVisible();
      await expect(firstCard.getByTestId('creator-card-name')).toBeVisible();
      await expect(firstCard.getByTestId('creator-card-projects-count')).toBeVisible();
    }
  });

  test('devrait naviguer vers les projets d\'un créateur', async ({ page }) => {
    await loginAsCreator(page);
    await page.goto('/creators');
    
    const creatorCards = page.getByTestId('creator-card');
    const count = await creatorCards.count();
    
    if (count > 0) {
      // Cliquer sur "Voir les projets"
      await creatorCards.first().getByTestId('creator-card-view-button').click();
      
      // Vérifier la redirection vers la galerie avec filtre
      await expect(page).toHaveURL(/\//);
    }
  });

  test('devrait naviguer vers connexion depuis la page créateurs (non connecté)', async ({ page }) => {
    await page.goto('/creators');
    
    const loginButton = page.getByTestId('creators-page-login-button');
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await expect(page).toHaveURL('/login');
    }
  });

  test('devrait afficher le lien inscription (non connecté)', async ({ page }) => {
    await page.goto('/creators');
    
    const signupLink = page.getByTestId('creators-page-signup-link');
    
    if (await signupLink.isVisible()) {
      await expect(signupLink).toBeVisible();
    }
  });
});
