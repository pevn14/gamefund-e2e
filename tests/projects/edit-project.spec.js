/**
 * Tests E2E - Gestion des projets : Édition
 *
 * Scénarios :
 * - Édition d'un projet brouillon (sauvegarde)
 * - Édition d'un projet publié (restrictions + sauvegarde)
 */

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loginAsCreator } from '../../helpers/auth.js';

const DIALOG_TIMEOUT = 10000;
const PROJECT_LOAD_TIMEOUT = 30000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_IMAGE = path.resolve(__dirname, '../assets/images/Cordoue.png');

function buildFutureDate(monthsAhead = 3) {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return date.toISOString().split('T')[0];
}

async function saveAndAcceptDialog(page) {
  const dialogPromise = page.waitForEvent('dialog', { timeout: DIALOG_TIMEOUT });
  await page.getByTestId('project-form-save-button').click();
  const dialog = await dialogPromise;
  await dialog.accept();
}

async function fillProjectForm(page, { title, description, goal, deadline }) {
  await page.getByTestId('project-form-title-input').fill(title);
  await page.getByTestId('project-form-description-input').fill(description);
  await page.getByTestId('project-form-goal-input').fill(goal);
  await page.getByTestId('project-form-deadline-input').fill(deadline);
  await page.locator('input[type="file"]').setInputFiles(TEST_IMAGE);
}

async function createDraftProject(page) {
  const projectTitle = `Projet Brouillon ${Date.now()}`;
  await page.goto('/projects/create');
  await expect(page.getByTestId('create-project-page')).toBeVisible();

  await fillProjectForm(page, {
    title: projectTitle,
    description: 'Description générée automatiquement pour test brouillon.',
    goal: '18000',
    deadline: buildFutureDate(2)
  });

  const dialogPromise = page.waitForEvent('dialog', { timeout: DIALOG_TIMEOUT });
  await page.getByTestId('project-form-save-button').click();
  const dialog = await dialogPromise;
  await dialog.accept();
  await expect(page).toHaveURL('/dashboard/projects');

  return projectTitle;
}

async function publishCurrentProject(page) {
  const publishDialog = page.waitForEvent('dialog', { timeout: DIALOG_TIMEOUT });
  await page.getByTestId('project-form-publish-button').click();
  const publishAlert = await publishDialog;
  await publishAlert.accept();

  const confirmDialog = page.waitForEvent('dialog', { timeout: DIALOG_TIMEOUT });
  const confirmAlert = await confirmDialog;
  await confirmAlert.accept();
  await page.waitForURL(/\/projects\//);
}

async function createAndPublishProject(page) {
  const title = await createDraftProject(page);
  await openProjectForEditing(page, { title, filterLabelRegex: /Brouillons/i });
  await publishCurrentProject(page);
  await page.goto('/dashboard/projects');
  return title;
}

async function openProjectForEditing(page, { title, filterLabelRegex }) {
  await page.goto('/dashboard/projects');
  await expect(page.getByTestId('my-projects-page')).toBeVisible();

  const projectsGrid = page.getByTestId('my-projects-grid');
  await expect(projectsGrid).toBeVisible({ timeout: PROJECT_LOAD_TIMEOUT });

  if (filterLabelRegex) {
    await page.getByRole('button', { name: filterLabelRegex }).click();
    await expect(projectsGrid).toBeVisible({ timeout: PROJECT_LOAD_TIMEOUT });
  }

  const projectHeading = page.getByRole('heading', { level: 3, name: title });
  await expect(projectHeading).toBeVisible({ timeout: PROJECT_LOAD_TIMEOUT });

  const projectCard = projectHeading.locator('xpath=ancestor::*[@data-testid="my-project-card"]');
  await projectCard.getByTestId('my-project-card-edit-button').click();
  await expect(page.getByTestId('edit-project-page')).toBeVisible();
}

test.describe('Projets - Édition', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCreator(page);
    await page.goto('/dashboard/projects');
    await expect(page.getByTestId('my-projects-page')).toBeVisible();
  });

  test('devrait créer puis éditer un brouillon et sauvegarder', async ({ page }) => {
    const title = await createDraftProject(page);
    await openProjectForEditing(page, { title, filterLabelRegex: /Brouillons/i });

    const newDescription = `Description brouillon mise à jour ${Date.now()}`;
    await page.getByTestId('project-form-description-input').fill(newDescription);

    await saveAndAcceptDialog(page);

    await expect(page.getByTestId('project-form-description-input')).toHaveValue(newDescription);
  });

  test('devrait créer, publier puis éditer un projet actif avec restrictions', async ({ page }) => {
    const title = await createAndPublishProject(page);
    await openProjectForEditing(page, { title, filterLabelRegex: /Actifs/i });

    await expect(page.getByTestId('project-form-title-input')).toBeDisabled();
    await expect(page.getByTestId('project-form-goal-input')).toBeDisabled();
    await expect(page.getByTestId('project-form-deadline-input')).toBeDisabled();

    const newDescription = `Description active mise à jour ${Date.now()}`;
    const descriptionInput = page.getByTestId('project-form-description-input');
    await descriptionInput.fill(newDescription);

    await saveAndAcceptDialog(page);

    await expect(descriptionInput).toHaveValue(newDescription);
  });
});
