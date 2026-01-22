/**
 * Tests E2E - Navigation : Header
 * 
 * Navigation header desktop et mobile
 */

import { test, expect } from '@playwright/test';
import { loginAsCreator, logout, expectLoggedIn, expectLoggedOut } from '../../helpers/auth.js';

test.describe('Navigation - Header', () => {

  test.describe('Header non authentifié', () => {

    test('devrait afficher les boutons connexion et inscription', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByTestId('header-login-button')).toBeVisible();
      await expect(page.getByTestId('header-signup-button')).toBeVisible();
    });

    test('devrait naviguer vers la page de connexion', async ({ page }) => {
      await page.goto('/');
      
      await page.getByTestId('header-login-button').click();
      await expect(page).toHaveURL('/login');
    });

    test('devrait naviguer vers la page d\'inscription', async ({ page }) => {
      await page.goto('/');
      
      await page.getByTestId('header-signup-button').click();
      await expect(page).toHaveURL('/signup');
    });
  });

  test.describe('Header authentifié (desktop)', () => {

    test.beforeEach(async ({ page }) => {
      await loginAsCreator(page);
    });

    test('devrait afficher les informations utilisateur', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByTestId('header-user-info')).toBeVisible();
    });

    test('devrait afficher le lien Dashboard', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByTestId('header-dashboard-link')).toBeVisible();
    });

    test('devrait afficher le lien Mes Projets', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByTestId('header-projects-link')).toBeVisible();
    });

    test('devrait afficher le lien Dashboard Donateur', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByTestId('header-donor-dashboard-link')).toBeVisible();
    });

    test('devrait afficher le bouton déconnexion', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByTestId('header-logout-button')).toBeVisible();
    });

    test('devrait naviguer vers le dashboard créateur', async ({ page }) => {
      await page.goto('/');
      
      await page.getByTestId('header-dashboard-link').click();
      await expect(page).toHaveURL('/dashboard');
    });

    test('devrait naviguer vers mes projets', async ({ page }) => {
      await page.goto('/');
      
      await page.getByTestId('header-projects-link').click();
      await expect(page).toHaveURL('/dashboard/projects');
    });

    test('devrait naviguer vers le dashboard donateur', async ({ page }) => {
      await page.goto('/');
      
      await page.getByTestId('header-donor-dashboard-link').click();
      await expect(page).toHaveURL('/donor-dashboard');
    });

    test('devrait déconnecter l\'utilisateur', async ({ page }) => {
      await page.goto('/');
      
      await page.getByTestId('header-logout-button').click();
      await page.waitForURL('/');
      
      await expectLoggedOut(page, expect);
    });
  });

});
