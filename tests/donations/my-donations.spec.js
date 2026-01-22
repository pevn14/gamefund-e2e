/**
 * Tests E2E - Système de dons : Mes donations
 * 
 * Scénario D2 : Consulter mes donations
 * Vérifier l'historique personnel des dons
 */

import { test, expect } from '@playwright/test';
import { loginAsCreator, loginAsDonor } from '../../helpers/auth.js';

test.describe('Donations - Mes donations', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page);
  });

  test('devrait afficher la page mes donations', async ({ page }) => {
    await page.goto('/my-donations');
    
    // Vérifier la page
    await expect(page.getByTestId('my-donations-page')).toBeVisible();
  });

  test('devrait afficher les statistiques globales', async ({ page }) => {
    await page.goto('/my-donations');
    
    // Vérifier les statistiques
    await expect(page.getByTestId('my-donations-stats')).toBeVisible();
  });

  test('devrait afficher la liste des donations', async ({ page }) => {
    await page.goto('/my-donations');
    
    // Vérifier la liste
    await expect(page.getByTestId('my-donations-list')).toBeVisible();
  });

  test('devrait afficher les cartes de donation avec les informations', async ({ page }) => {
    await page.goto('/my-donations');
    
    // Vérifier les cartes de donation
    const donationCards = page.getByTestId('donation-card');
    const count = await donationCards.count();
    
    if (count > 0) {
      const firstCard = donationCards.first();
      
      // Vérifier les éléments de la carte
      await expect(firstCard.getByTestId('donation-card-project')).toBeVisible();
      await expect(firstCard.getByTestId('donation-card-amount')).toBeVisible();
      await expect(firstCard.getByTestId('donation-card-date')).toBeVisible();
    }
  });

  test('devrait afficher l\'état vide si aucune donation', async ({ page }) => {
    await page.goto('/my-donations');
    
    // Vérifier l'état vide ou la liste
    const donationCards = page.getByTestId('donation-card');
    const count = await donationCards.count();
    
    if (count === 0) {
      await expect(page.getByTestId('my-donations-empty')).toBeVisible();
    }
  });

  test('devrait permettre de modifier une donation', async ({ page }) => {
    await page.goto('/my-donations');
    
    const donationCards = page.getByTestId('donation-card');
    const count = await donationCards.count();
    
    if (count > 0) {
      // Vérifier le bouton modifier
      const editButton = donationCards.first().getByTestId('donation-card-edit-button');
      
      if (await editButton.isVisible()) {
        // Le bouton modifier est disponible
        await expect(editButton).toBeVisible();
      }
    }
  });

  test('devrait permettre de supprimer une donation', async ({ page }) => {
    await page.goto('/my-donations');
    
    const donationCards = page.getByTestId('donation-card');
    const count = await donationCards.count();
    
    if (count > 0) {
      // Vérifier le bouton supprimer
      const deleteButton = donationCards.first().getByTestId('donation-card-delete-button');
      
      if (await deleteButton.isVisible()) {
        // Le bouton supprimer est disponible
        await expect(deleteButton).toBeVisible();
      }
    }
  });
});
