/**
 * Global Teardown - Nettoyage automatique après tous les tests
 *
 * Ce script s'exécute automatiquement après la suite de tests complète.
 * Il détecte et nettoie tous les projets de test orphelins.
 */

import { chromium } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth.js';

async function globalTeardown() {
  console.log('\n🧹 Global Teardown: Recherche de projets orphelins...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: 'http://localhost:5173'
  });
  const page = await context.newPage();

  // Auto-accept all dialogs
  page.on('dialog', dialog => dialog.accept());

  try {
    await loginAsAdmin(page);

    // Aller sur la page de gestion admin
    await page.goto('/admin/projects');
    await page.waitForSelector('[data-testid="admin-projects-page"]', { timeout: 10000 });

    // Rechercher tous les projets de test (titre commence par "Projet")
    const searchInput = page.getByTestId('admin-projects-search');
    await searchInput.fill('Projet');
    await page.waitForTimeout(1000);

    // Compter les projets trouvés
    const projectRows = page.getByTestId('admin-project-row');
    const count = await projectRows.count();

    if (count === 0) {
      console.log('✓ Aucun projet orphelin détecté');
      await browser.close();
      return;
    }

    console.log(`⚠️  ${count} projet(s) orphelin(s) détecté(s)`);

    // Nettoyer chaque projet
    for (let i = 0; i < count; i++) {
      // Toujours cibler le premier projet car la liste se rafraîchit après chaque suppression
      await searchInput.fill('Projet');
      await page.waitForTimeout(500);

      const firstRow = projectRows.first();

      // Récupérer le titre pour le log
      const titleElement = firstRow.locator('a').first();
      const title = await titleElement.textContent();

      console.log(`  → Nettoyage: ${title}`);

      // Changer le statut à "cancelled"
      const statusSelect = firstRow.getByTestId('admin-project-status-select');
      const currentStatus = await statusSelect.inputValue();

      if (currentStatus !== 'cancelled') {
        await statusSelect.selectOption('cancelled');
        await page.waitForTimeout(1000);
      }

      // Supprimer le projet
      const deleteButton = firstRow.getByTestId('admin-project-delete-button');
      await deleteButton.click();
      await page.waitForTimeout(1000);

      console.log(`  ✓ Supprimé`);
    }

    console.log(`✓ ${count} projet(s) orphelin(s) nettoyé(s)`);

  } catch (error) {
    console.error('✗ Erreur lors du nettoyage:', error.message);
    // Ne pas faire échouer le teardown
  } finally {
    await browser.close();
  }
}

export default globalTeardown;
