/**
 * Tests E2E - Authentification : Gestion de session
 * 
 * Scénario A3 : Déconnexion
 * Vérifie la déconnexion complète et la protection des routes
 */

import { test, expect } from '@playwright/test';
import { users, login, logout, expectLoggedIn, expectLoggedOut } from '../../helpers/auth.js';

test.describe('Authentification - Session', () => {

  test('devrait déconnecter l\'utilisateur (A3)', async ({ page }) => {
    // Se connecter d'abord
    await login(page, users.creator.email, users.creator.password);
    await expectLoggedIn(page, expect);
    
    // Se déconnecter
    await logout(page);
    
    // Vérifier la redirection vers la page d'accueil
    await expect(page).toHaveURL('/');
    
    // Vérifier que les liens authentifiés disparaissent
    await expectLoggedOut(page, expect);
  });

  test('devrait rediriger vers login si accès à une route protégée sans authentification', async ({ page }) => {
    // Tenter d'accéder au dashboard sans être connecté
    await page.goto('/dashboard');
    
    // Vérifier la redirection vers login
    await expect(page).toHaveURL('/login');
  });

  test('devrait rediriger vers login si accès à mes projets sans authentification', async ({ page }) => {
    // Tenter d'accéder à mes projets sans être connecté
    await page.goto('/dashboard/projects');
    
    // Vérifier la redirection vers login
    await expect(page).toHaveURL('/login');
  });

  test('devrait rediriger vers login si accès à création projet sans authentification', async ({ page }) => {
    // Tenter d'accéder à la création de projet sans être connecté
    await page.goto('/projects/create');
    
    // Vérifier la redirection vers login
    await expect(page).toHaveURL('/login');
  });

  test('devrait permettre l\'accès aux routes protégées après connexion', async ({ page }) => {
    // Se connecter
    await login(page, users.creator.email, users.creator.password);
    
    // Accéder au dashboard
    await page.goto('/dashboard');
    await expect(page.getByTestId('creator-dashboard-page')).toBeVisible();
    
    // Accéder à mes projets
    await page.goto('/dashboard/projects');
    await expect(page.getByTestId('my-projects-page')).toBeVisible();
  });

  test('devrait bloquer l\'accès aux routes protégées après déconnexion', async ({ page }) => {
    // Se connecter
    await login(page, users.creator.email, users.creator.password);
    
    // Vérifier l'accès au dashboard
    await page.goto('/dashboard');
    await expect(page.getByTestId('creator-dashboard-page')).toBeVisible();
    
    // Se déconnecter
    await logout(page);
    
    // Tenter d'accéder au dashboard
    await page.goto('/dashboard');
    
    // Vérifier la redirection vers login
    await expect(page).toHaveURL('/login');
  });
});
