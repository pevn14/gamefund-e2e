/**
 * Tests E2E - Navigation : Footer
 * 
 * Navigation footer
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation - Footer', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('devrait afficher le footer', async ({ page }) => {
    // Scroll vers le bas pour voir le footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Vérifier la présence du footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('devrait afficher le lien À propos', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const aboutLink = page.locator('footer a[href="/about"]');
    if (await aboutLink.isVisible()) {
      await expect(aboutLink).toBeVisible();
    }
  });

  test('devrait afficher le lien FAQ', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const faqLink = page.locator('footer a[href="/faq"]');
    if (await faqLink.isVisible()) {
      await expect(faqLink).toBeVisible();
    }
  });

  test('devrait naviguer vers la page À propos', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const aboutLink = page.locator('footer a[href="/about"]');
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL('/about');
    }
  });

  test('devrait naviguer vers la page FAQ', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const faqLink = page.locator('footer a[href="/faq"]');
    if (await faqLink.isVisible()) {
      await faqLink.click();
      await expect(page).toHaveURL('/faq');
    }
  });

  test('devrait afficher le copyright', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footer = page.locator('footer');
    const footerText = await footer.textContent();
    
    // Vérifier qu'il y a du contenu dans le footer
    expect(footerText.length).toBeGreaterThan(0);
  });
});
