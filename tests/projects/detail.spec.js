/**
 * Tests E2E - Gestion des projets : Détail projet
 * 
 * Vérifie l'affichage et les actions sur la page de détail d'un projet
 */

import { test, expect } from '@playwright/test';
import { users, login, loginAsCreator } from '../../helpers/auth.js';

test.describe('Projets - Détail projet', () => {

  test('devrait afficher la page de détail d\'un projet', async ({ page }) => {
    // Aller sur la galerie
    await page.goto('/');
    
    // Attendre que les projets soient chargés
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      // Cliquer sur le premier projet
      await projectCards.first().getByTestId('project-card-link').click();
      
      // Vérifier les éléments de la page de détail
      await expect(page.getByTestId('project-detail-page')).toBeVisible();
      await expect(page.getByTestId('project-detail-title')).toBeVisible();
      await expect(page.getByTestId('project-detail-description')).toBeVisible();
      await expect(page.getByTestId('project-detail-stats')).toBeVisible();
      await expect(page.getByTestId('project-detail-creator')).toBeVisible();
    }
  });

  test('devrait afficher le bouton retour', async ({ page }) => {
    // Aller sur la galerie et naviguer vers un projet
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      
      // Vérifier le bouton retour
      await expect(page.getByTestId('project-detail-back-button')).toBeVisible();
      
      // Cliquer sur retour
      await page.getByTestId('project-detail-back-button').click();
      
      // Vérifier le retour à la galerie
      await expect(page).toHaveURL('/');
    }
  });

  test('devrait afficher le bouton de connexion pour un visiteur non connecté', async ({ page }) => {
    // Aller sur la galerie
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      
      // Vérifier le bouton de connexion (pour faire un don)
      await expect(page.getByTestId('project-detail-login-button')).toBeVisible();
    }
  });

  test('devrait afficher le bouton de don pour un utilisateur connecté', async ({ page }) => {
    // Se connecter
    await loginAsCreator(page);
    
    // Aller sur la galerie
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      
      // Vérifier le bouton de don
      await expect(page.getByTestId('project-detail-donate-button')).toBeVisible();
    }
  });

  test('devrait afficher les statistiques du projet', async ({ page }) => {
    // Aller sur la galerie
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      
      // Vérifier la section statistiques
      const stats = page.getByTestId('project-detail-stats');
      await expect(stats).toBeVisible();
    }
  });

  test('devrait afficher les informations du créateur', async ({ page }) => {
    // Aller sur la galerie
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      
      // Vérifier la section créateur
      const creator = page.getByTestId('project-detail-creator');
      await expect(creator).toBeVisible();
    }
  });

  test('devrait afficher le bouton partager', async ({ page }) => {
    // Aller sur la galerie
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      
      // Vérifier le bouton partager
      await expect(page.getByTestId('project-detail-share-button')).toBeVisible();
    }
  });
});
