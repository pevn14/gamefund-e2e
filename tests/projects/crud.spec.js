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

  test('devrait créer, éditer et supprimer un brouillon', async ({ page }) => {
    // Auto-accept all native dialogs (alert, confirm) and log for debug
    page.on('dialog', dialog => {
      console.log(`Dialog [${dialog.type()}]: ${dialog.message()}`);
      dialog.accept();
    });

    const projectTitle = `Projet CRUD ${Date.now()}`;
    const description = 'Description complète pour le flux CRUD E2E.';
    const goal = '12000';
    const deadline = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Create project as draft
    await page.goto('/projects/create');
    await expect(page.getByTestId('create-project-page')).toBeVisible();

    await fillProjectForm(page, { title: projectTitle, description, goal, deadline });
    await page.getByTestId('project-form-save-button').click();
    await expect(page).toHaveURL('/dashboard/projects');

    // 2. Find the draft and edit it
    await page.getByRole('button', { name: /Brouillons/ }).click();
    const { editButton: draftEditButton } = await waitForProjectCard(page, projectTitle);

    await draftEditButton.click();
    await expect(page.getByTestId('edit-project-page')).toBeVisible();

    // 3. Update title and save (draft remains draft)
    const updatedTitle = `${projectTitle} (mis à jour)`;
    await page.getByTestId('project-form-title-input').fill(updatedTitle);
    await page.getByTestId('project-form-save-button').click();
    // Wait for save to complete
    await expect(page.getByTestId('project-form-save-button')).toBeEnabled({ timeout: PROJECT_LOAD_TIMEOUT });
    // Verify title was saved
    await expect(page.getByTestId('project-form-title-input')).toHaveValue(updatedTitle);

    // 4. Delete the draft project (RLS only allows deleting drafts)
    await page.getByTestId('project-form-delete-button').click();
    await page.waitForURL('/dashboard/projects', { timeout: PROJECT_LOAD_TIMEOUT });

    // 5. Verify deletion
    await page.getByRole('button', { name: /Tous/ }).click();
    await expect(page.getByTestId('my-project-card').filter({ hasText: updatedTitle })).toHaveCount(0);
  });

  test('devrait créer un brouillon, le publier et vérifier les restrictions d\'édition', async ({ page }) => {
    // Auto-accept all native dialogs (alert, confirm)
    page.on('dialog', dialog => {
      console.log(`Dialog [${dialog.type()}]: ${dialog.message()}`);
      dialog.accept();
    });

    const projectTitle = `Projet Publish ${Date.now()}`;
    const description = 'Description pour test de publication.';
    const goal = '15000';
    const deadline = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Create project as draft
    await page.goto('/projects/create');
    await expect(page.getByTestId('create-project-page')).toBeVisible();

    await fillProjectForm(page, { title: projectTitle, description, goal, deadline });
    await page.getByTestId('project-form-save-button').click();
    await expect(page).toHaveURL('/dashboard/projects');

    // 2. Find the draft and publish it
    await page.getByRole('button', { name: /Brouillons/ }).click();
    const { editButton: draftEditButton } = await waitForProjectCard(page, projectTitle);

    await draftEditButton.click();
    await expect(page.getByTestId('edit-project-page')).toBeVisible();

    // 3. Publish the project
    await page.getByTestId('project-form-publish-button').click();
    await page.waitForURL(/\/projects\/.*$/);
    await expect(page.getByTestId('project-detail-page')).toBeVisible();
    await expect(page.getByTestId('project-detail-title')).toHaveText(projectTitle);

    // 4. Edit the published project - verify restrictions
    await page.goto('/dashboard/projects');
    await page.getByRole('button', { name: /Actifs/ }).click();
    const { editButton: activeEditButton } = await waitForProjectCard(page, projectTitle);

    await activeEditButton.click();
    await expect(page.getByTestId('edit-project-page')).toBeVisible();

    // Verify title, goal and deadline are disabled for active projects
    await expect(page.getByTestId('project-form-title-input')).toBeDisabled();
    await expect(page.getByTestId('project-form-goal-input')).toBeDisabled();
    await expect(page.getByTestId('project-form-deadline-input')).toBeDisabled();

    // 5. Update description (allowed for active projects)
    const newDescription = 'Description modifiée après publication.';
    await page.getByTestId('project-form-description-input').fill(newDescription);
    await page.getByTestId('project-form-save-button').click();
    await expect(page.getByTestId('project-form-save-button')).toBeEnabled({ timeout: PROJECT_LOAD_TIMEOUT });
    await expect(page.getByTestId('project-form-description-input')).toHaveValue(newDescription);
  });
});
