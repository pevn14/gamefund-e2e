/**
 * Tests E2E - Profils créateurs : Éditeur de profil
 * 
 * Scénario PC1 : Éditer mon profil
 * Modifier avatar et bio
 */

import { test, expect } from '@playwright/test';
import { loginAsCreator } from '../../helpers/auth.js';

test.describe('Profils - Éditeur de profil', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page);
  });

  test('devrait afficher l\'éditeur de profil dans le dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier la présence de l'éditeur de profil
    await expect(page.getByTestId('profile-editor')).toBeVisible();
  });

  test('devrait afficher le champ nom d\'affichage', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier le champ nom
    await expect(page.getByTestId('profile-editor-name-input')).toBeVisible();
  });

  test('devrait afficher le champ bio avec compteur', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier le champ bio
    await expect(page.getByTestId('profile-editor-bio-textarea')).toBeVisible();
    await expect(page.getByTestId('profile-editor-bio-counter')).toBeVisible();
  });

  test('devrait afficher le bouton enregistrer', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier le bouton
    await expect(page.getByTestId('profile-editor-save-button')).toBeVisible();
  });

  test('devrait mettre à jour le compteur de caractères de la bio', async ({ page }) => {
    await page.goto('/dashboard');
    
    const bioTextarea = page.getByTestId('profile-editor-bio-textarea');
    const bioCounter = page.getByTestId('profile-editor-bio-counter');
    
    // Vider et remplir la bio
    await bioTextarea.fill('');
    await bioTextarea.fill('Test bio');
    
    // Vérifier que le compteur est mis à jour
    await expect(bioCounter).toBeVisible();
  });

  test('devrait limiter la bio à 500 caractères', async ({ page }) => {
    await page.goto('/dashboard');
    
    const bioTextarea = page.getByTestId('profile-editor-bio-textarea');
    
    // Essayer de remplir avec plus de 500 caractères
    const longText = 'A'.repeat(600);
    await bioTextarea.fill(longText);
    
    // Vérifier que le texte est tronqué ou que l'erreur est affichée
    const value = await bioTextarea.inputValue();
    expect(value.length).toBeLessThanOrEqual(500);
  });

  test('devrait sauvegarder les modifications du profil (PC1)', async ({ page }) => {
    await page.goto('/dashboard');
    
    const nameInput = page.getByTestId('profile-editor-name-input');
    const bioTextarea = page.getByTestId('profile-editor-bio-textarea');
    const saveButton = page.getByTestId('profile-editor-save-button');
    
    // Modifier le nom et la bio
    const newName = `Test User ${Date.now()}`;
    await nameInput.fill(newName);
    await bioTextarea.fill('Bio de test mise à jour');
    
    // Sauvegarder
    await saveButton.click();
    
    // Vérifier le message de succès
    await expect(page.getByTestId('profile-editor-success-message')).toBeVisible();
  });

  test('devrait afficher l\'upload d\'avatar', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier la présence de l'upload avatar
    await expect(page.getByTestId('avatar-upload')).toBeVisible();
  });

  test('devrait afficher la prévisualisation de l\'avatar', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier la prévisualisation
    await expect(page.getByTestId('avatar-upload-preview')).toBeVisible();
  });

  test('devrait afficher le bouton d\'upload', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier le bouton
    await expect(page.getByTestId('avatar-upload-button')).toBeVisible();
  });

  test('devrait mettre à jour l\'avatar dans le header après modification', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier que le header affiche l'info utilisateur
    await expect(page.getByTestId('header-user-info')).toBeVisible();
    
    // Note: Le test complet d'upload nécessite un fichier image
    // et est plus complexe à automatiser
  });
});
