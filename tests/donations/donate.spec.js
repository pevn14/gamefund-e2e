/**
 * Tests E2E - Système de dons : Faire un don
 * 
 * Scénario D1 : Faire un don
 * Parcours complet de donation
 */

import { test, expect } from '@playwright/test';
import { loginAsCreator, loginAsDonor } from '../../helpers/auth.js';

test.describe('Donations - Faire un don', () => {

  test('devrait afficher le bouton de don sur un projet actif', async ({ page }) => {
    await loginAsCreator(page);
    
    // Aller sur la galerie
    await page.goto('/');
    
    // Trouver un projet actif
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      // Cliquer sur le premier projet
      await projectCards.first().getByTestId('project-card-link').click();
      
      // Vérifier le bouton de don
      await expect(page.getByTestId('project-detail-donate-button')).toBeVisible();
    }
  });

  test('devrait ouvrir le modal de don (D1)', async ({ page }) => {
    await loginAsCreator(page);
    
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      
      // Cliquer sur faire un don
      await page.getByTestId('project-detail-donate-button').click();
      
      // Vérifier le modal
      await expect(page.getByTestId('project-detail-donation-modal')).toBeVisible();
      await expect(page.getByTestId('donation-form')).toBeVisible();
    }
  });

  test('devrait afficher le formulaire de don', async ({ page }) => {
    await loginAsCreator(page);
    
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      await page.getByTestId('project-detail-donate-button').click();
      
      // Vérifier les champs du formulaire
      await expect(page.getByTestId('donation-form-amount-input')).toBeVisible();
      await expect(page.getByTestId('donation-form-message-input')).toBeVisible();
      await expect(page.getByTestId('donation-form-submit-button')).toBeVisible();
      await expect(page.getByTestId('donation-form-cancel-button')).toBeVisible();
    }
  });

  test('devrait valider le montant minimum', async ({ page }) => {
    await loginAsCreator(page);
    
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      await page.getByTestId('project-detail-donate-button').click();
      
      // Entrer un montant invalide
      await page.getByTestId('donation-form-amount-input').fill('0');
      await page.getByTestId('donation-form-submit-button').click();
      
      // Vérifier le message d'erreur
      await expect(page.getByTestId('donation-form-error')).toBeVisible();
    }
  });

  test('devrait afficher la prévisualisation du don', async ({ page }) => {
    await loginAsCreator(page);
    
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      await page.getByTestId('project-detail-donate-button').click();
      
      // Entrer un montant valide
      await page.getByTestId('donation-form-amount-input').fill('10');
      
      // Vérifier la prévisualisation
      await expect(page.getByTestId('donation-form-preview')).toBeVisible();
    }
  });

  test('devrait afficher le modal de confirmation', async ({ page }) => {
    await loginAsCreator(page);
    
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      await page.getByTestId('project-detail-donate-button').click();
      
      // Remplir le formulaire
      await page.getByTestId('donation-form-amount-input').fill('10');
      await page.getByTestId('donation-form-message-input').fill('Message de test');
      
      // Continuer
      await page.getByTestId('donation-form-submit-button').click();
      
      // Vérifier le modal de confirmation
      await expect(page.getByTestId('donation-confirm-modal')).toBeVisible();
      await expect(page.getByTestId('donation-confirm-amount')).toBeVisible();
      await expect(page.getByTestId('donation-confirm-button')).toBeVisible();
    }
  });

  test('devrait annuler le don', async ({ page }) => {
    await loginAsCreator(page);
    
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    const count = await projectCards.count();
    
    if (count > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      await page.getByTestId('project-detail-donate-button').click();
      
      // Annuler
      await page.getByTestId('donation-form-cancel-button').click();
      
      // Vérifier que le modal est fermé
      await expect(page.getByTestId('donation-form')).not.toBeVisible();
    }
  });

  // Note: Le test de don complet est commenté pour éviter de créer des données
  /*
  test('devrait effectuer un don complet', async ({ page }) => {
    await loginAsCreator(page);
    
    await page.goto('/');
    const projectCards = page.getByTestId('project-card');
    
    if (await projectCards.count() > 0) {
      await projectCards.first().getByTestId('project-card-link').click();
      await page.getByTestId('project-detail-donate-button').click();
      
      await page.getByTestId('donation-form-amount-input').fill('5');
      await page.getByTestId('donation-form-message-input').fill('Don de test E2E');
      await page.getByTestId('donation-form-submit-button').click();
      await page.getByTestId('donation-confirm-button').click();
      
      await expect(page.getByTestId('donation-success-message')).toBeVisible();
    }
  });
  */
});
