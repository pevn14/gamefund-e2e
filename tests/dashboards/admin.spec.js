/**
 * Tests E2E - Dashboards : Dashboard Admin
 * 
 * Scénario DB3 : Dashboard Admin
 * Vérifier les fonctions admin
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin, users } from '../../helpers/auth.js';

test.describe('Dashboards - Admin', () => {

  // Note: Ces tests nécessitent un compte admin configuré
  // Si pas de compte admin, les tests seront skippés

  test('devrait rediriger un non-admin vers la page d\'accueil', async ({ page }) => {
    // Se connecter en tant que créateur (non admin)
    await page.goto('/login');
    await page.getByTestId('login-email-input').fill(users.creator.email);
    await page.getByTestId('login-password-input').fill(users.creator.password);
    await page.getByTestId('login-submit-button').click();
    await page.waitForURL('/');
    
    // Tenter d'accéder au dashboard admin
    await page.goto('/admin');
    
    // Devrait être redirigé (soit vers / soit vers /login)
    const url = page.url();
    expect(url).not.toContain('/admin');
  });

  test('devrait afficher le dashboard admin pour un admin (DB3)', async ({ page }) => {
    // Skip si pas de compte admin configuré
    if (!users.admin.email || !users.admin.password) {
      test.skip();
      return;
    }
    
    await loginAsAdmin(page);
    await page.goto('/admin');
    
    // Vérifier la page
    await expect(page.getByTestId('admin-dashboard-page')).toBeVisible();
  });

  test('devrait afficher les statistiques globales', async ({ page }) => {
    if (!users.admin.email || !users.admin.password) {
      test.skip();
      return;
    }
    
    await loginAsAdmin(page);
    await page.goto('/admin');
    
    // Vérifier les statistiques
    await expect(page.getByTestId('admin-dashboard-stats')).toBeVisible();
  });

  test('devrait afficher les liens de navigation admin', async ({ page }) => {
    if (!users.admin.email || !users.admin.password) {
      test.skip();
      return;
    }
    
    await loginAsAdmin(page);
    await page.goto('/admin');
    
    // Vérifier les liens
    await expect(page.getByTestId('admin-nav-projects')).toBeVisible();
    await expect(page.getByTestId('admin-nav-users')).toBeVisible();
  });

  test('devrait naviguer vers la gestion des projets', async ({ page }) => {
    if (!users.admin.email || !users.admin.password) {
      test.skip();
      return;
    }
    
    await loginAsAdmin(page);
    await page.goto('/admin');
    
    await page.getByTestId('admin-nav-projects').click();
    await expect(page).toHaveURL('/admin/projects');
    await expect(page.getByTestId('admin-projects-page')).toBeVisible();
  });

  test('devrait naviguer vers la gestion des utilisateurs', async ({ page }) => {
    if (!users.admin.email || !users.admin.password) {
      test.skip();
      return;
    }
    
    await loginAsAdmin(page);
    await page.goto('/admin');
    
    await page.getByTestId('admin-nav-users').click();
    await expect(page).toHaveURL('/admin/users');
    await expect(page.getByTestId('admin-users-page')).toBeVisible();
  });

  test('devrait afficher la table des projets dans la gestion', async ({ page }) => {
    if (!users.admin.email || !users.admin.password) {
      test.skip();
      return;
    }
    
    await loginAsAdmin(page);
    await page.goto('/admin/projects');
    
    // Vérifier les éléments
    await expect(page.getByTestId('admin-projects-page')).toBeVisible();
    await expect(page.getByTestId('admin-projects-search')).toBeVisible();
    await expect(page.getByTestId('admin-projects-filter')).toBeVisible();
    await expect(page.getByTestId('admin-projects-table')).toBeVisible();
  });

  test('devrait afficher la table des utilisateurs dans la gestion', async ({ page }) => {
    if (!users.admin.email || !users.admin.password) {
      test.skip();
      return;
    }
    
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    
    // Vérifier les éléments
    await expect(page.getByTestId('admin-users-page')).toBeVisible();
    await expect(page.getByTestId('admin-users-search')).toBeVisible();
    await expect(page.getByTestId('admin-users-table')).toBeVisible();
  });
});
