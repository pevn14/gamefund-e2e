/**
 * Script de nettoyage des projets orphelins
 *
 * Processus en 2 étapes via AdminProjectsPage (requis même pour admin):
 * 1. Mettre le projet en statut "cancelled" via le dropdown
 * 2. Supprimer le projet via le bouton delete (actif uniquement si cancelled)
 */

import { chromium } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth.js';

const ORPHAN_PROJECTS = [
  { id: '5539ebb0-7ee9-44dd-b1e6-e7083097e39b', status: 'draft', title: 'Projet Test 1769590097097' },
  { id: 'c2466988-ef62-4544-878d-4e95a105a106', status: 'active', title: 'Projet Publish 1769589957443' },
  { id: 'ad158b6d-de78-4f17-8148-b4130b6af090', status: 'active', title: 'Projet Publish 1769590118011' }
];

async function cleanupOrphanProjects() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: 'http://localhost:5173'
  });
  const page = await context.newPage();

  // Auto-accept all dialogs (confirmations)
  page.on('dialog', dialog => {
    console.log(`  Dialog [${dialog.type()}]: ${dialog.message()}`);
    dialog.accept();
  });

  try {
    await loginAsAdmin(page);
    console.log('✓ Connecté en tant qu\'admin');

    // Aller sur la page de gestion admin
    await page.goto('/admin/projects');
    await page.waitForSelector('[data-testid="admin-projects-page"]', { timeout: 10000 });
    console.log('✓ Page admin chargée');

    for (const project of ORPHAN_PROJECTS) {
      console.log(`\n→ Traitement du projet: ${project.title}`);

      // Chercher la ligne du projet dans le tableau
      const searchInput = page.getByTestId('admin-projects-search');
      await searchInput.fill(project.title);
      await page.waitForTimeout(500); // Attendre le filtrage

      const projectRow = page.getByTestId('admin-project-row').filter({
        has: page.getByText(project.title)
      });

      const rowCount = await projectRow.count();
      if (rowCount === 0) {
        console.log(`  ✗ Projet déjà supprimé ou introuvable`);
        await searchInput.clear();
        continue;
      }

      // Étape 1: Changer le statut à "cancelled" si nécessaire
      if (project.status !== 'cancelled') {
        console.log(`  → Changement de statut vers "cancelled"...`);
        const statusSelect = projectRow.getByTestId('admin-project-status-select');
        await statusSelect.selectOption('cancelled');
        await page.waitForTimeout(1000); // Attendre la confirmation et le reload
        console.log(`  ✓ Statut changé vers "cancelled"`);
      }

      // Étape 2: Supprimer le projet (maintenant que status = cancelled)
      console.log(`  → Suppression du projet...`);
      const deleteButton = projectRow.getByTestId('admin-project-delete-button');
      await deleteButton.click();
      await page.waitForTimeout(1000); // Attendre la suppression et le reload
      console.log(`  ✓ Projet supprimé avec succès`);

      // Réinitialiser la recherche
      await searchInput.clear();
    }

    console.log('\n✓ Nettoyage terminé - vérification finale...');
    await page.goto('/admin/projects');
    await page.waitForSelector('[data-testid="admin-projects-page"]');
    await page.waitForTimeout(1000);

  } catch (error) {
    console.error('✗ Erreur:', error);
  } finally {
    await browser.close();
  }
}

cleanupOrphanProjects();
