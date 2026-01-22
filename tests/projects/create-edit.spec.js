/**
 * Tests E2E - Gestion des projets : Création et édition
 * 
 * Scénario P2 : Créer et publier un projet
 * Parcours complet de création de projet
 */

import { test, expect } from '@playwright/test';
import { loginAsCreator } from '../../helpers/auth.js';

test.describe('Projets - Création et édition', () => {

  test.beforeEach(async ({ page }) => {
    // Se connecter avant chaque test
    await loginAsCreator(page);
  });

  test('devrait afficher le formulaire de création', async ({ page }) => {
    await page.goto('/projects/create');
    
    // Vérifier la présence du formulaire
    await expect(page.getByTestId('create-project-page')).toBeVisible();
    await expect(page.getByTestId('project-form')).toBeVisible();
    
    // Vérifier les champs
    await expect(page.getByTestId('project-form-title-input')).toBeVisible();
    await expect(page.getByTestId('project-form-description-input')).toBeVisible();
    await expect(page.getByTestId('project-form-goal-input')).toBeVisible();
    await expect(page.getByTestId('project-form-deadline-input')).toBeVisible();
    
    // Vérifier les boutons
    await expect(page.getByTestId('project-form-publish-button')).toBeVisible();
    await expect(page.getByTestId('project-form-save-button')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retour' })).toBeVisible();
  });

  test('devrait créer un projet en brouillon (P2)', async ({ page }) => {
    await page.goto('/projects/create');
    
    // Remplir le formulaire
    const uniqueTitle = `Projet Test ${Date.now()}`;
    await page.getByTestId('project-form-title-input').fill(uniqueTitle);
    await page.getByTestId('project-form-description-input').fill('Description détaillée du projet de test pour les tests E2E.');
    await page.getByTestId('project-form-goal-input').fill('10000');
    
    // Date dans le futur
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const dateStr = futureDate.toISOString().split('T')[0];
    await page.getByTestId('project-form-deadline-input').fill(dateStr);
    
    // Sauvegarder en brouillon et capturer l'alert JS utilisée par l'app
    const dialogPromise = page.waitForEvent('dialog');
    await page.getByTestId('project-form-save-button').click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Brouillon sauvegardé');
    await dialog.accept();
    await expect(page).toHaveURL('/dashboard/projects');
  });

  test('devrait valider les champs obligatoires', async ({ page }) => {
    await page.goto('/projects/create');
    
    // Tenter de publier sans remplir (les champs sont obligatoires pour la publication)
    await page.getByTestId('project-form-publish-button').click();
    
    // Vérifier les messages inline (titres et description)
    await expect(page.getByText('Le titre est requis')).toBeVisible();
    await expect(page.getByText('La description est requise')).toBeVisible();
    await expect(page.getByText('Le montant cible est requis')).toBeVisible();
    await expect(page.getByText('La date d\'échéance est requise')).toBeVisible();
    await expect(page.getByText('Une image est requise')).toBeVisible();
  });

  test('devrait valider le titre minimum', async ({ page }) => {
    await page.goto('/projects/create');
    
    // Remplir avec un titre trop court
    await page.getByTestId('project-form-title-input').fill('AB');
    await page.getByTestId('project-form-description-input').fill('Description valide pour le test');
    await page.getByTestId('project-form-goal-input').fill('10000');
    
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    await page.getByTestId('project-form-deadline-input').fill(futureDate.toISOString().split('T')[0]);
    
    // Tenter de publier avec un titre invalide
    await page.getByTestId('project-form-publish-button').click();
    
    // Vérifier le message d'erreur inline sur le titre
    await expect(page.getByText('Le titre doit contenir au moins 3 caractères')).toBeVisible();
  });

  test('devrait valider l\'objectif positif', async ({ page }) => {
    await page.goto('/projects/create');
    
    // Remplir avec un objectif invalide
    await page.getByTestId('project-form-title-input').fill('Projet Test Objectif');
    await page.getByTestId('project-form-description-input').fill('Description valide pour le test');
    await page.getByTestId('project-form-goal-input').fill('0');
    
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    await page.getByTestId('project-form-deadline-input').fill(futureDate.toISOString().split('T')[0]);
    
    // Tenter de publier avec un objectif invalide
    await page.getByTestId('project-form-publish-button').click();
    
    // Vérifier le message d'erreur inline sur l'objectif
    await expect(page.getByText('Le montant doit être supérieur à 0')).toBeVisible();
  });

  test('devrait annuler la création et retourner', async ({ page }) => {
    await page.goto('/projects/create');
    
    // Remplir partiellement
    await page.getByTestId('project-form-title-input').fill('Projet à annuler');
    
    // Utiliser le bouton "Retour" présent dans l'UI
    await page.getByRole('button', { name: 'Retour' }).click();

    // Vérifier la redirection
    await expect(page).not.toHaveURL('/projects/create');
  });

  test('devrait accéder à la liste de mes projets', async ({ page }) => {
    await page.goto('/dashboard/projects');
    
    // Vérifier la page
    await expect(page.getByTestId('my-projects-page')).toBeVisible();
    
    // Vérifier le bouton de création
    await expect(page.getByTestId('my-projects-create-button')).toBeVisible();
  });

  test('devrait naviguer vers la création depuis mes projets', async ({ page }) => {
    await page.goto('/dashboard/projects');
    
    // Cliquer sur créer
    await page.getByTestId('my-projects-create-button').click();
    
    // Vérifier la redirection
    await expect(page).toHaveURL('/projects/create');
  });

  test('devrait afficher les onglets de filtres', async ({ page }) => {
    await page.goto('/dashboard/projects');
    
    // Vérifier les onglets
    await expect(page.getByTestId('my-projects-filter-tabs')).toBeVisible();
  });
});
