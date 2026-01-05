# Playwright Cheatsheet - Référence Rapide

Guide de référence rapide pour les commandes et patterns Playwright les plus utilisés.

---

## 🚀 Commandes NPM

```bash
# Lancer tous les tests
npm test

# Mode UI (interface graphique - RECOMMANDÉ pour apprendre)
npm run test:ui

# Voir le navigateur en action
npm run test:headed

# Mode debug pas-à-pas
npm run test:debug

# Voir le rapport HTML
npm run test:report
```

---

## 🎯 Commandes Avancées

```bash
# Lancer UN SEUL fichier
npx playwright test tests/warmup/page-load.spec.js

# Lancer UN SEUL test par son nom
npx playwright test -g "devrait afficher la page de test"

# Lancer avec pattern (tous les tests contenant "signup")
npx playwright test -g "signup"

# Mode debug sur un test spécifique
npx playwright test -g "devrait créer un compte" --debug

# Générer du code automatiquement
npx playwright codegen http://localhost:5173/supabase-test

# Ouvrir le dernier screenshot d'échec
ls -t test-results/*/*.png | head -1 | xargs xdg-open

# Lire le contexte d'erreur du dernier échec
cat test-results/*/error-context.md | less
```

---

## 📝 Structure d'un Test

```javascript
import { test, expect } from '@playwright/test'

test.describe('Groupe de tests', () => {
  test('description du test', async ({ page }) => {
    // 1. ARRANGE: Préparer
    await page.goto('/url')

    // 2. ACT: Agir
    await page.getByTestId('button').click()

    // 3. ASSERT: Vérifier
    await expect(page.getByText('Succès')).toBeVisible()
  })
})
```

---

## 🔍 Sélecteurs (Comment Trouver des Éléments)

```javascript
// ⭐ Par data-testid (RECOMMANDÉ)
page.getByTestId('signup-email-input')

// Par texte visible
page.getByText('Test Supabase')
page.getByText('✅ Connecté')

// Par rôle + nom
page.getByRole('button', { name: 'S\'inscrire' })
page.getByRole('heading', { name: 'Inscription' })

// Par sélecteur CSS
page.locator('h1')
page.locator('.error-message')
page.locator('#user-id')

// Combinaisons
page.getByTestId('card').first()           // Premier élément
page.getByTestId('card').last()            // Dernier élément
page.getByTestId('card').nth(2)            // 3ème élément (index 0)
page.getByTestId('card').filter({ hasText: 'Admin' }) // Filtrer
```

---

## 🎬 Actions (Ce qu'on peut Faire)

```javascript
// Navigation
await page.goto('/supabase-test')
await page.goBack()
await page.reload()

// Remplir un champ
await page.getByTestId('email-input').fill('test@example.com')

// Cliquer
await page.getByTestId('submit-button').click()

// Double-cliquer
await page.getByTestId('element').dblclick()

// Hover (survoler)
await page.getByTestId('menu').hover()

// Presser une touche
await page.keyboard.press('Enter')
await page.keyboard.press('Escape')

// Cocher/décocher une checkbox
await page.getByTestId('accept-terms').check()
await page.getByTestId('accept-terms').uncheck()

// Sélectionner dans un dropdown
await page.getByTestId('country').selectOption('France')

// Upload un fichier
await page.getByTestId('upload').setInputFiles('path/to/file.jpg')

// Attendre
await page.waitForTimeout(1000)              // Attendre 1 seconde (éviter!)
await page.waitForLoadState('networkidle')    // Attendre la fin du réseau
await page.waitForSelector('[data-testid="element"]') // Attendre un élément
```

---

## ✅ Assertions (Vérifier des Choses)

### Visibilité

```javascript
// Est visible
await expect(page.getByTestId('success-message')).toBeVisible()

// N'est PAS visible
await expect(page.getByTestId('error-message')).not.toBeVisible()

// Est caché
await expect(page.getByTestId('modal')).toBeHidden()
```

### Texte

```javascript
// Contient du texte
await expect(page.getByTestId('message')).toContainText('Succès')

// Texte exact
await expect(page.locator('h1')).toHaveText('Test Supabase')
```

### Valeur (Inputs)

```javascript
// A la valeur
await expect(page.getByTestId('email')).toHaveValue('test@example.com')

// Est vide
await expect(page.getByTestId('email')).toBeEmpty()
```

### URL

```javascript
// URL exacte
await expect(page).toHaveURL('http://localhost:5173/dashboard')

// URL avec regex
await expect(page).toHaveURL(/\/dashboard/)
```

### Nombre

```javascript
// Compte exact
await expect(page.getByTestId('project-card')).toHaveCount(5)
```

### État

```javascript
// Est enabled
await expect(page.getByTestId('button')).toBeEnabled()

// Est disabled
await expect(page.getByTestId('button')).toBeDisabled()

// Est checked (checkbox)
await expect(page.getByTestId('checkbox')).toBeChecked()
```

### Avec Timeout

```javascript
// Attendre jusqu'à 10 secondes
await expect(page.getByTestId('success')).toBeVisible({ timeout: 10000 })
```

---

## ⏱️ Attentes et Timeouts

```javascript
// Attendre un élément
await page.waitForSelector('[data-testid="element"]')

// Attendre que le réseau soit stable
await page.waitForLoadState('networkidle')

// Attendre une navigation
await page.waitForURL('/dashboard')

// Attendre une fonction
await page.waitForFunction(() => document.querySelector('h1').textContent === 'Test')

// Timeout personnalisé dans une assertion
await expect(page.getByTestId('slow-element')).toBeVisible({ timeout: 15000 })
```

---

## 🐛 Debug et Console

```javascript
// Pause le test (ouvre l'inspector)
await page.pause()

// Screenshot
await page.screenshot({ path: 'screenshot.png' })

// Logs console
page.on('console', msg => console.log('PAGE LOG:', msg.text()))

// Récupérer du texte
const text = await page.getByTestId('element').textContent()
console.log(text)

// Vérifier si un élément est visible
const isVisible = await page.getByTestId('element').isVisible()
console.log(isVisible) // true ou false

// Compter les éléments
const count = await page.getByTestId('card').count()
console.log(count) // Nombre
```

---

## 🔧 Patterns Utiles

### Pattern 1: Attendre Succès OU Erreur

```javascript
// Attendre que l'un ou l'autre apparaisse
await page.waitForSelector('[data-testid="success-message"], [data-testid="error-message"]', {
  timeout: 10000
})

// Vérifier lequel est apparu
const success = await page.getByTestId('success-message').isVisible()
if (success) {
  console.log('✅ Succès!')
} else {
  const errorText = await page.getByTestId('error-message').textContent()
  console.log('❌ Erreur:', errorText)
}
```

### Pattern 2: Générer Email Unique

```javascript
const timestamp = Date.now()
const email = `test${timestamp}@test.com`
```

### Pattern 3: Remplir un Formulaire Complet

```javascript
async function fillSignupForm(page, { displayName, email, password }) {
  await page.getByTestId('signup-display-name-input').fill(displayName)
  await page.getByTestId('signup-email-input').fill(email)
  await page.getByTestId('signup-password-input').fill(password)
  await page.getByTestId('signup-submit-button').click()
}

// Utilisation
await fillSignupForm(page, {
  displayName: 'Test User',
  email: 'test@test.com',
  password: 'Pass123!'
})
```

### Pattern 4: Vérifier une Redirection

```javascript
await page.getByTestId('login-button').click()
await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
```

### Pattern 5: Test avec Setup/Teardown

```javascript
test.describe('Tests nécessitant connexion', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Se connecter avant chaque test
    await page.goto('/login')
    await page.getByTestId('email').fill('user@test.com')
    await page.getByTestId('password').fill('password')
    await page.getByTestId('submit').click()
  })

  test.afterEach(async ({ page }) => {
    // Teardown: Se déconnecter après chaque test
    if (await page.getByTestId('logout').isVisible()) {
      await page.getByTestId('logout').click()
    }
  })

  test('test 1', async ({ page }) => {
    // Le test commence déjà connecté
  })
})
```

---

## ⌨️ Raccourcis Clavier (Mode Debug)

| Touche | Action |
|--------|--------|
| **F8** | Resume (continuer) |
| **F10** | Step Over (ligne suivante) |
| **F11** | Step Into (entrer dans fonction) |
| **Shift+F11** | Step Out (sortir de fonction) |

---

## 📁 Structure des Fichiers

```
gamefund-e2e/
├── playwright.config.js        # Configuration
├── package.json                # Dépendances et scripts
├── tests/
│   └── warmup/
│       ├── page-load.spec.js
│       ├── signup.spec.js
│       └── ...
├── test-results/               # Résultats, screenshots
└── docs/
    ├── PLAYWRIGHT_GUIDE.md     # Guide complet
    └── CHEATSHEET.md           # Ce fichier
```

---

## 🎯 Workflow Typique

```bash
# 1. Lancer le mode UI pour explorer
npm run test:ui

# 2. Identifier un test qui échoue
# (cliquer dessus dans l'interface)

# 3. Le rejouer en mode debug
npx playwright test -g "nom du test" --debug

# 4. Avancer pas-à-pas avec F10
# et tester des commandes dans la console

# 5. Regarder le screenshot de l'échec
ls -t test-results/*/*.png | head -1 | xargs xdg-open

# 6. Corriger le test

# 7. Relancer pour vérifier
npx playwright test -g "nom du test"
```

---

## 💡 Astuces Rapides

```javascript
// Augmenter le timeout pour Supabase
await expect(element).toBeVisible({ timeout: 10000 })

// Attendre la fin des requêtes réseau
await page.waitForLoadState('networkidle')

// Prendre le premier élément d'une liste
await page.getByText('Connecté').first().click()

// Vérifier si un élément existe avant d'agir
if (await page.getByTestId('modal').isVisible()) {
  await page.getByTestId('close-modal').click()
}

// Logger pour débugger
console.log(await page.getByTestId('element').textContent())
```

---

## 🔗 Liens Rapides

- **Guide complet**: [PLAYWRIGHT_GUIDE.md](PLAYWRIGHT_GUIDE.md)
- **Documentation Playwright**: https://playwright.dev/
- **Nos tests**: [tests/warmup/](../tests/warmup/)
- **Config**: [playwright.config.js](../playwright.config.js)

---

**Imprimez cette page et gardez-la à portée de main!** 📄
