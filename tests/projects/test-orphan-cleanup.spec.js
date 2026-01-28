/**
 * Test temporaire pour vérifier le nettoyage automatique des projets orphelins
 * Ce test crée un projet puis échoue volontairement pour vérifier que
 * le globalTeardown le nettoie quand même.
 */

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loginAsCreator } from '../../helpers/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_IMAGE = path.resolve(__dirname, '../assets/images/Cordoue.png');

test.skip('Test orphelin - devrait être nettoyé par globalTeardown', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());

  await loginAsCreator(page);

  const projectTitle = `Projet Orphelin Test ${Date.now()}`;

  // Créer un projet
  await page.goto('/projects/create');
  await expect(page.getByTestId('create-project-page')).toBeVisible();

  await page.getByTestId('project-form-title-input').fill(projectTitle);
  await page.getByTestId('project-form-description-input').fill('Projet qui sera orphelin');
  await page.getByTestId('project-form-goal-input').fill('5000');
  await page.getByTestId('project-form-deadline-input').fill(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  await page.locator('input[type="file"]').setInputFiles(TEST_IMAGE);

  await page.getByTestId('project-form-save-button').click();
  await expect(page).toHaveURL('/dashboard/projects');

  console.log(`✓ Projet créé: ${projectTitle}`);
  console.log('⚠️  Le test échoue volontairement - le globalTeardown devrait nettoyer ce projet');

  // Échouer volontairement SANS nettoyer
  throw new Error('Test échoué volontairement pour vérifier le cleanup automatique');
});
