/**
 * Tests E2E - Flux complet de donation
 *
 * Test le parcours : créer un don, le vérifier dans "Mes donations",
 * puis le supprimer. Utilise 2 comptes (admin crée le projet, creator donne)
 * car un utilisateur ne peut pas donner à son propre projet.
 */

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loginAsAdmin, loginAsCreator, logout } from '../../helpers/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_IMAGE = path.resolve(__dirname, '../assets/images/Cordoue.png');
const TIMEOUT = 30000;

test.setTimeout(90000);

test.describe('Donations - Flux complet', () => {

  test('devrait effectuer un don, le vérifier et le supprimer', async ({ page }) => {
    // Auto-accept native dialogs (alert, confirm)
    page.on('dialog', dialog => {
      console.log(`Dialog [${dialog.type()}]: ${dialog.message()}`);
      dialog.accept();
    });

    const projectTitle = `Projet Donation ${Date.now()}`;
    const donationAmount = '10';
    const donationMessage = 'Don de test E2E';

    // ── 1. SETUP : Admin crée et publie un projet ──
    await loginAsAdmin(page);

    await page.goto('/projects/create');
    await expect(page.getByTestId('create-project-page')).toBeVisible();

    await page.getByTestId('project-form-title-input').fill(projectTitle);
    await page.getByTestId('project-form-description-input').fill('Projet créé pour tester le flux de donation E2E.');
    await page.getByTestId('project-form-goal-input').fill('10000');
    await page.getByTestId('project-form-deadline-input').fill(
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    await page.locator('input[type="file"]').setInputFiles(TEST_IMAGE);

    await page.getByTestId('project-form-save-button').click();
    await expect(page).toHaveURL('/dashboard/projects');

    // Trouver le brouillon et le publier
    await page.getByRole('button', { name: /Brouillons/ }).click();
    const grid = page.getByTestId('my-projects-grid');
    await expect(grid).toBeVisible({ timeout: TIMEOUT });

    const heading = page.getByRole('heading', { level: 3, name: projectTitle });
    await expect(heading).toBeVisible({ timeout: TIMEOUT });
    const card = heading.locator('xpath=ancestor::*[@data-testid="my-project-card"]');
    await card.getByTestId('my-project-card-edit-button').click();
    await expect(page.getByTestId('edit-project-page')).toBeVisible();

    await page.getByTestId('project-form-publish-button').click();
    await page.waitForURL(/\/projects\//, { timeout: TIMEOUT });
    await expect(page.getByTestId('project-detail-page')).toBeVisible();

    // Mémoriser l'URL du projet
    const projectUrl = page.url();

    // ── 2. DONATION : Creator fait un don ──
    await logout(page);
    await loginAsCreator(page);
    await page.goto(projectUrl);
    await expect(page.getByTestId('project-detail-page')).toBeVisible();

    // Ouvrir le modal de don
    await page.getByTestId('project-detail-donate-button').click();
    await expect(page.getByTestId('project-detail-donation-modal')).toBeVisible();

    // Remplir le formulaire
    await page.getByTestId('donation-form-amount-input').fill(donationAmount);
    await page.getByTestId('donation-form-message-input').fill(donationMessage);
    await page.getByTestId('donation-form-submit-button').click();

    // Confirmer
    await expect(page.getByTestId('donation-confirm-modal')).toBeVisible();
    await page.getByTestId('donation-confirm-button').click();

    // ── 3. VÉRIFIER SUCCÈS ──
    await expect(page.getByTestId('donation-success-message')).toBeVisible({ timeout: TIMEOUT });

    // ── 4. VÉRIFIER DANS "MES DONATIONS" ──
    await page.goto('/my-donations');
    await expect(page.getByTestId('my-donations-page')).toBeVisible();
    await expect(page.getByTestId('my-donations-list')).toBeVisible({ timeout: TIMEOUT });

    // Trouver la carte correspondant à NOTRE projet
    const donationCard = page.getByTestId('donation-card-compact').filter({
      has: page.getByTestId('donation-card-project').getByText(projectTitle)
    });
    await expect(donationCard).toBeVisible();
    await expect(donationCard.getByTestId('donation-card-amount')).toContainText(`${donationAmount}`);

    // ── 5. SUPPRIMER LE DON ──
    await donationCard.getByTestId('donation-card-delete-button').click();
    await expect(page.getByTestId('donation-delete-modal')).toBeVisible();
    await page.getByTestId('donation-delete-confirm-button').click();

    // Attendre que le modal se ferme
    await expect(page.getByTestId('donation-delete-modal')).not.toBeVisible({ timeout: TIMEOUT });

    // Vérifier que notre donation a disparu
    await page.goto('/my-donations');
    await expect(page.getByTestId('my-donations-page')).toBeVisible();
    await expect(donationCard).not.toBeVisible({ timeout: TIMEOUT });

    // ── 6. CLEANUP : Admin supprime le projet ──
    await logout(page);
    await page.waitForTimeout(1000); // Pause anti rate-limit
    await loginAsAdmin(page);
    const projectId = projectUrl.match(/\/projects\/([^/]+)/)?.[1];
    await page.goto(`/projects/${projectId}/edit`);
    await expect(page.getByTestId('edit-project-page')).toBeVisible({ timeout: TIMEOUT });
    await page.getByTestId('project-form-delete-button').click();
    await page.waitForURL('/dashboard/projects', { timeout: TIMEOUT });
  });
});
