/**
 * Tests E2E - Dashboards : Dashboard Admin
 *
 * Scénario DB3 : Dashboard Admin
 * Vérifier les fonctions admin
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsCreator, users } from '../../helpers/auth.js';

test.describe('Dashboards - Admin', () => {

  test('devrait rediriger un non-admin vers la page d\'accueil', async ({ page }) => {
    await loginAsCreator(page);

    // Tenter d'accéder au dashboard admin
    await page.goto('/admin');

    // Devrait être redirigé (auto-retry attend la redirection async)
    await expect(page).not.toHaveURL(/\/admin/);
  });

  test('devrait afficher le dashboard admin pour un admin (DB3)', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    await expect(page.getByTestId('admin-dashboard-page')).toBeVisible();
  });

  test('devrait afficher les statistiques globales', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    await expect(page.getByTestId('admin-dashboard-stats')).toBeVisible();
  });

  test('devrait afficher les liens de navigation admin', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    await expect(page.getByTestId('admin-nav-projects')).toBeVisible();
    await expect(page.getByTestId('admin-nav-users')).toBeVisible();
  });

  test('devrait naviguer vers la gestion des projets', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    await page.getByTestId('admin-nav-projects').click();
    await expect(page).toHaveURL('/admin/projects');
    await expect(page.getByTestId('admin-projects-page')).toBeVisible();
  });

  test('devrait naviguer vers la gestion des utilisateurs', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    await page.getByTestId('admin-nav-users').click();
    await expect(page).toHaveURL('/admin/users');
    await expect(page.getByTestId('admin-users-page')).toBeVisible();
  });

  test('devrait afficher la table des projets dans la gestion', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/projects');

    await expect(page.getByTestId('admin-projects-page')).toBeVisible();
    await expect(page.getByTestId('admin-projects-search')).toBeVisible();
    await expect(page.getByTestId('admin-projects-filter')).toBeVisible();
    await expect(page.getByTestId('admin-projects-table')).toBeVisible();
  });

  test('devrait afficher la table des utilisateurs dans la gestion', async ({ page }) => {
    test.skip(true, 'Bloqué: `admin-users-search` non implémenté dans l\'application');
  });
});
