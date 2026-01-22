/**
 * Tests E2E - Gestion des projets : CRUD complet
 *
 * Ce fichier couvre un flux complet : création (brouillon), publication,
 * édition et suppression d'un projet depuis l'espace créateur.
 */

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loginAsCreator } from '../../helpers/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_IMAGE = path.resolve(__dirname, '../assets/images/Cordoue.png');
const PROJECT_LOAD_TIMEOUT = 30000;

async function fillProjectForm(page, { title, description, goal, deadline }) {
  await page.getByTestId('project-form-title-input').fill(title);
  await page.getByTestId('project-form-description-input').fill(description);
  await page.getByTestId('project-form-goal-input').fill(goal);
  await page.getByTestId('project-form-deadline-input').fill(deadline);
  await page.locator('input[type="file"]').setInputFiles(TEST_IMAGE);
}

async function waitForProjectCard(page, title) {
  const grid = page.getByTestId('my-projects-grid');
  await expect(grid).toBeVisible({ timeout: PROJECT_LOAD_TIMEOUT });

  const heading = page.getByRole('heading', { level: 3, name: title });
  await expect(heading).toBeVisible({ timeout: PROJECT_LOAD_TIMEOUT });

  const card = heading.locator('xpath=ancestor::*[@data-testid="my-project-card"]');
  const editButton = card.getByTestId('my-project-card-edit-button');
  await expect(editButton).toBeVisible({ timeout: PROJECT_LOAD_TIMEOUT });
  return { card, editButton };
}

test.describe('Projets - CRUD complet', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page);
  });

  test('devrait créer, publier, éditer et supprimer un projet', async ({ page }) => {
    const projectTitle = `Projet CRUD ${Date.now()}`;
    const description = 'Description complète pour le flux CRUD E2E.';
    const goal = '12000';
    const deadline = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await page.goto('/projects/create');
    await expect(page.getByTestId('create-project-page')).toBeVisible();

    await fillProjectForm(page, { title: projectTitle, description, goal, deadline });

    const saveDialog = page.waitForEvent('dialog');
    await page.getByTestId('project-form-save-button').click();
    const saveAlert = await saveDialog;
    await saveAlert.accept();
    await expect(page).toHaveURL('/dashboard/projects');

    await page.getByRole('button', { name: /Brouillons/ }).click();
    const { editButton: draftEditButton } = await waitForProjectCard(page, projectTitle);

    await draftEditButton.click();
    await expect(page.getByTestId('edit-project-page')).toBeVisible();

    await page.getByTestId('project-form-title-input').fill(`${projectTitle} (mis à jour)`);

    const publishDialog = page.waitForEvent('dialog');
    await page.getByTestId('project-form-publish-button').click();
    const publishAlert = await publishDialog;
    await publishAlert.accept();
    const confirmDialog = page.waitForEvent('dialog');
    const confirmAlert = await confirmDialog;
    await confirmAlert.accept();

    await page.waitForURL(/\/projects\/.*$/);
    await expect(page.getByTestId('project-detail-page')).toBeVisible();

    await page.goto('/dashboard/projects');
    await page.getByRole('button', { name: /Actifs/ }).click();
    const { editButton: activeEditButton } = await waitForProjectCard(page, projectTitle);

    await activeEditButton.click();
    await expect(page.getByTestId('edit-project-page')).toBeVisible();
    await page.getByTestId('project-form-description-input').fill('Description modifiée après publication.');

    const saveDialog2 = page.waitForEvent('dialog');
    await page.getByTestId('project-form-save-button').click();
    const saveAlert2 = await saveDialog2;
    await saveAlert2.accept();

    await page.getByTestId('project-form-delete-button').click();
    const deleteDialog1 = await page.waitForEvent('dialog');
    await deleteDialog1.accept();
    const deleteDialog2 = await page.waitForEvent('dialog');
    await deleteDialog2.accept();

    await page.waitForURL('/dashboard/projects');
    await page.getByRole('button', { name: /Tous/ }).click();
    await expect(page.getByTestId('my-project-card').filter({ hasText: projectTitle })).toHaveCount(0);
  });
});
