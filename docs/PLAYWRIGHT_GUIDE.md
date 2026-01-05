# Guide d'Apprentissage Playwright

**Pour**: Débutants Playwright
**Objectif**: Comprendre comment fonctionne Playwright à travers les tests du warmup
**Niveau**: Débutant → Intermédiaire

---

## Table des Matières

1. [Qu'est-ce que Playwright?](#1-quest-ce-que-playwright)
2. [Anatomie d'un Test](#2-anatomie-dun-test)
3. [Commandes pour Jouer les Tests](#3-commandes-pour-jouer-les-tests)
4. [Les Sélecteurs Playwright](#4-les-sélecteurs-playwright)
5. [Les Assertions](#5-les-assertions)
6. [Analyser les Échecs](#6-analyser-les-échecs)
7. [Mode Debug pas-à-pas](#7-mode-debug-pas-à-pas)
8. [Astuces et Bonnes Pratiques](#8-astuces-et-bonnes-pratiques)

---

## 1. Qu'est-ce que Playwright?

### Définition Simple

Playwright est un outil qui **pilote automatiquement un navigateur** (Chrome, Firefox, Safari) comme si un humain l'utilisait.

**Exemple concret**:
```javascript
// Au lieu de faire manuellement:
// 1. Ouvrir Chrome
// 2. Aller sur http://localhost:5173/supabase-test
// 3. Cliquer sur le champ Email
// 4. Taper "test@example.com"
// 5. Cliquer sur le bouton "S'inscrire"

// Playwright fait tout ça automatiquement:
await page.goto('/supabase-test')
await page.getByTestId('signup-email-input').fill('test@example.com')
await page.getByTestId('signup-submit-button').click()
```

### Pourquoi c'est utile?

- ✅ **Automatiser les tests** - Plus besoin de tester manuellement
- ✅ **Détecter les régressions** - Si vous cassez quelque chose, le test échoue
- ✅ **Documentation vivante** - Les tests montrent comment l'app fonctionne
- ✅ **Confiance** - Vous savez que votre code fonctionne

---

## 2. Anatomie d'un Test

Décortiquons un test simple pour comprendre chaque partie.

### Exemple: Test de Chargement de Page

```javascript
import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Chargement page', () => {
  test('devrait afficher la page de test', async ({ page }) => {
    await page.goto('/supabase-test')

    await expect(page.locator('h1')).toContainText('Test Supabase')
  })
})
```

### Décortication Ligne par Ligne

#### 1. Import
```javascript
import { test, expect } from '@playwright/test'
```
- `test` = Fonction pour créer un test
- `expect` = Fonction pour vérifier des choses (assertions)

#### 2. Groupe de Tests
```javascript
test.describe('SupabaseTest - Chargement page', () => {
  // Tous les tests liés au chargement de page
})
```
- `test.describe()` = Groupe plusieurs tests ensemble
- C'est comme un dossier pour organiser vos tests
- Optionnel mais recommandé pour l'organisation

#### 3. Un Test Individuel
```javascript
test('devrait afficher la page de test', async ({ page }) => {
  // Le code du test
})
```
- **`test(...)`** = Déclare un test
- **`'devrait afficher...'`** = Description du test (ce qu'on vérifie)
- **`async`** = Le test est asynchrone (il attend des choses)
- **`{ page }`** = Playwright nous donne un objet `page` (le navigateur)

#### 4. Navigation
```javascript
await page.goto('/supabase-test')
```
- **`page.goto()`** = Aller à une URL
- **`await`** = Attendre que la page soit chargée avant de continuer
- **`'/supabase-test'`** = URL relative (utilise `baseURL` du config)
- Équivalent à: `http://localhost:5173/supabase-test`

#### 5. Assertion (Vérification)
```javascript
await expect(page.locator('h1')).toContainText('Test Supabase')
```
- **`page.locator('h1')`** = Trouve l'élément `<h1>` sur la page
- **`expect(...)`** = Je m'attends à ce que...
- **`.toContainText('Test Supabase')`** = ...le texte contienne "Test Supabase"
- Si ça ne correspond pas → Le test échoue ❌

### Template Mental

Tous les tests suivent ce pattern:
```javascript
test('description de ce qu\'on teste', async ({ page }) => {
  // 1. ARRANGE: Préparer (naviguer, remplir des champs)
  await page.goto('/url')

  // 2. ACT: Agir (cliquer, taper du texte)
  await page.getByTestId('button').click()

  // 3. ASSERT: Vérifier (le résultat attendu)
  await expect(page.getByText('Succès')).toBeVisible()
})
```

---

## 3. Commandes pour Jouer les Tests

### 📋 Commandes de Base

#### Lancer TOUS les tests
```bash
npm test
```
**Utilisation**: Tests rapides, CI/CD
**Sortie**: Texte dans le terminal

---

#### Mode UI (RECOMMANDÉ pour apprendre)
```bash
npm run test:ui
```
**Utilisation**: Explorer, débugger, comprendre
**Avantages**:
- ✅ Interface graphique interactive
- ✅ Voir chaque test en temps réel
- ✅ Rejouable à l'infini
- ✅ Timeline des actions
- ✅ Screenshots automatiques

**Capture d'écran**:
```
┌─────────────────────────────────────────┐
│  Tests  │  Timeline  │  Source  │  Call │
├─────────────────────────────────────────┤
│ ✅ page-load.spec.js (4)                │
│ ✅ database-connection.spec.js (4)      │
│ ⚠️  signup.spec.js (1/4)                │
│   ✅ devrait valider le formulaire      │
│   ❌ devrait créer un compte            │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

#### Mode Headed (Voir le Navigateur)
```bash
npm run test:headed
```
**Utilisation**: Voir ce qui se passe dans le navigateur
**Avantages**:
- ✅ Fenêtre Chrome s'ouvre
- ✅ Voir les actions en direct
- ✅ Comprendre les interactions

**Différence avec test:ui**:
- `test:ui` = Interface Playwright + navigateur
- `test:headed` = Juste le navigateur qui s'exécute

---

#### Mode Debug (Pas-à-Pas)
```bash
npm run test:debug
```
**Utilisation**: Débugger un test qui échoue
**Avantages**:
- ✅ Pause à chaque étape
- ✅ Inspector Playwright s'ouvre
- ✅ Console pour tester des commandes
- ✅ Contrôles: Play, Pause, Step Over

**Capture d'écran**:
```
┌─────────────────────────────────────────┐
│ Playwright Inspector                    │
├─────────────────────────────────────────┤
│ ▶️ Step Over    ⏸️ Pause    ⏹️ Stop      │
│                                         │
│ Current Step:                           │
│ await page.getByTestId('email').fill()  │
│                                         │
│ Console:                                │
│ > page.locator('h1')                    │
└─────────────────────────────────────────┘
```

---

#### Voir le Rapport HTML
```bash
npm run test:report
```
**Utilisation**: Après avoir lancé les tests, voir un rapport détaillé
**Avantages**:
- ✅ Rapport visuel dans le navigateur
- ✅ Screenshots des échecs
- ✅ Traces des actions
- ✅ Statistiques

---

### 🎯 Commandes Avancées

#### Lancer UN SEUL fichier
```bash
npx playwright test tests/warmup/page-load.spec.js
```
**Utilisation**: Tester un fichier spécifique
**Exemple pratique**:
```bash
# Tester seulement les tests de signup
npx playwright test tests/warmup/signup.spec.js
```

---

#### Lancer UN SEUL test (par son nom)
```bash
npx playwright test -g "devrait afficher la page de test"
```
**Utilisation**: Tester un test spécifique
**`-g`** = "grep" (chercher par nom)
**Exemple pratique**:
```bash
# Tester seulement le test de création de compte
npx playwright test -g "devrait créer un nouveau compte"
```

---

#### Lancer avec un pattern
```bash
# Tous les tests qui contiennent "signup"
npx playwright test -g "signup"

# Tous les tests dans un dossier
npx playwright test tests/warmup/
```

---

#### Mode Debug sur UN test
```bash
npx playwright test -g "devrait créer un nouveau compte" --debug
```
**Utilisation**: Débugger un test spécifique en pas-à-pas

---

### 📊 Tableau Récapitulatif

| Commande | Quand l'utiliser | Sortie | Vitesse |
|----------|------------------|--------|---------|
| `npm test` | Vérifier que tout passe | Terminal | ⚡ Rapide |
| `npm run test:ui` | **Apprendre, explorer** | Interface graphique | 🐢 Lent |
| `npm run test:headed` | Voir le navigateur | Navigateur visible | ⚡ Rapide |
| `npm run test:debug` | Débugger un problème | Inspector + navigateur | 🐢 Manuel |
| `npm run test:report` | Voir les résultats détaillés | HTML dans navigateur | ⚡ Instantané |
| `npx playwright test fichier.spec.js` | Tester un fichier | Terminal | ⚡ Rapide |
| `npx playwright test -g "nom"` | Tester un test spécifique | Terminal | ⚡ Rapide |

---

### 🎓 Exercice Pratique

**Objectif**: Se familiariser avec les commandes

```bash
# 1. Lancer le mode UI pour explorer
npm run test:ui

# 2. Dans l'interface, cliquer sur "page-load.spec.js"
#    Observer les 4 tests qui passent ✅

# 3. Cliquer sur un test pour voir:
#    - La timeline (gauche)
#    - Les screenshots (centre)
#    - Le code source (droite)

# 4. Fermer l'interface UI

# 5. Lancer un seul fichier
npx playwright test tests/warmup/page-load.spec.js

# 6. Lancer un seul test
npx playwright test -g "devrait afficher la page de test"

# 7. Voir le rapport
npm run test:report
```

---

## 4. Les Sélecteurs Playwright

### Qu'est-ce qu'un Sélecteur?

Un **sélecteur** = Comment trouver un élément sur la page

**Analogie**: C'est comme donner une adresse
- "La maison bleue au 42 rue des Tests" → Adresse précise
- "Une maison bleue" → Trop vague
- "data-testid='maison-42'" → ID unique ✅

### Types de Sélecteurs

#### 1. Par data-testid (RECOMMANDÉ ⭐)
```javascript
page.getByTestId('signup-email-input')
```
**Pourquoi c'est le meilleur**:
- ✅ Stable (ne change pas si le design change)
- ✅ Explicite (fait pour les tests)
- ✅ Lisible

**HTML correspondant**:
```html
<input data-testid="signup-email-input" type="email" />
```

---

#### 2. Par texte visible
```javascript
page.getByText('Test Supabase')
page.getByText('✅ Connecté à Supabase')
```
**Utilisation**: Vérifier qu'un texte est affiché
**Attention**: Change si le texte change

---

#### 3. Par rôle + nom
```javascript
page.getByRole('button', { name: 'S\'inscrire' })
page.getByRole('heading', { name: 'Inscription' })
```
**Utilisation**: Sélection sémantique et accessible
**Avantages**: Teste aussi l'accessibilité

**Rôles courants**:
- `button` = Boutons
- `textbox` = Champs de texte
- `heading` = Titres (h1, h2, etc.)
- `link` = Liens
- `checkbox` = Cases à cocher

---

#### 4. Par sélecteur CSS
```javascript
page.locator('h1')
page.locator('.error-message')
page.locator('#user-profile')
```
**Utilisation**: Quand pas de testid disponible
**Attention**: Fragile si le CSS change

---

#### 5. Combinaisons
```javascript
// Premier élément avec ce testid
page.getByTestId('project-card').first()

// Dernier élément
page.getByTestId('project-card').last()

// Nième élément (index 0)
page.getByTestId('project-card').nth(0)

// Filtrer
page.getByTestId('user-card').filter({ hasText: 'Admin' })
```

---

### 🎯 Exemples Pratiques de nos Tests

```javascript
// Test: page-load.spec.js

// ✅ BON: Utilise data-testid
await page.getByTestId('signup-submit-button').click()

// ⚠️ MOYEN: Utilise le texte (peut changer)
await page.getByText('✅ Connecté à Supabase').isVisible()

// ❌ FRAGILE: Utilise la structure DOM
await page.locator('div.mb-6.p-4').click() // Si les classes Tailwind changent, ça casse
```

---

### 🔍 Comment Trouver le Bon Sélecteur?

#### Méthode 1: Playwright Inspector

```bash
npx playwright test --debug
```

Dans l'Inspector:
1. Cliquer sur l'icône "Pick Locator" 🎯
2. Survoler l'élément dans le navigateur
3. Playwright vous donne le meilleur sélecteur!

#### Méthode 2: Playwright Codegen

```bash
npx playwright codegen http://localhost:5173/supabase-test
```

1. Un navigateur s'ouvre
2. Faites vos actions (cliquer, taper)
3. Playwright **génère le code automatiquement**!

**Exemple de sortie**:
```javascript
// Vous cliquez sur le bouton "S'inscrire"
// Codegen génère:
await page.getByTestId('signup-submit-button').click()
```

**C'est PARFAIT pour apprendre!** 🎓

---

## 5. Les Assertions

### Qu'est-ce qu'une Assertion?

Une **assertion** = Vérifier que quelque chose est vrai

**Analogie**: Comme un contrôle qualité
- "Je m'attends à ce que cette porte soit bleue"
- Si elle est rouge → Échec ❌
- Si elle est bleue → Succès ✅

### Structure de Base

```javascript
await expect(QUOI).COMMENT()
```

- **QUOI** = L'élément à vérifier
- **COMMENT** = La condition attendue

---

### Assertions de Visibilité

#### Vérifier qu'un élément est visible
```javascript
await expect(page.getByTestId('success-message')).toBeVisible()
```
**Utilisation**: L'élément existe ET est affiché à l'écran

---

#### Vérifier qu'un élément n'est PAS visible
```javascript
await expect(page.getByTestId('signout-button')).not.toBeVisible()
```
**Utilisation**: L'élément n'est pas affiché (ou n'existe pas)

---

### Assertions de Texte

#### Contient du texte
```javascript
await expect(page.getByTestId('success-message')).toContainText('Inscription réussie')
```
**Utilisation**: Le texte contient la chaîne (pas besoin du texte complet)

---

#### Texte exact
```javascript
await expect(page.locator('h1')).toHaveText('Test Supabase - GameFund')
```
**Utilisation**: Le texte est exactement celui-là (sensible à la casse)

---

### Assertions de Valeur (Inputs)

#### Vérifier la valeur d'un champ
```javascript
await expect(page.getByTestId('email-input')).toHaveValue('test@example.com')
```
**Utilisation**: Vérifier qu'un input contient une valeur

---

### Assertions d'URL

#### Vérifier l'URL exacte
```javascript
await expect(page).toHaveURL('http://localhost:5173/dashboard')
```

#### Vérifier l'URL avec regex
```javascript
await expect(page).toHaveURL(/\/dashboard/)
```
**Utilisation**: Vérifier une redirection

---

### Assertions de Nombre

#### Compter les éléments
```javascript
await expect(page.getByTestId('project-card')).toHaveCount(5)
```
**Utilisation**: Vérifier qu'il y a exactement N éléments

---

### Assertions avec Timeout

```javascript
// Attendre jusqu'à 10 secondes
await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 10000 })
```
**Utilisation**: Pour les opérations lentes (appels API, etc.)

---

### 🎯 Exemples de nos Tests

```javascript
// Test: signup.spec.js

// 1. Remplir le formulaire
await page.getByTestId('signup-email-input').fill(email)

// 2. Soumettre
await page.getByTestId('signup-submit-button').click()

// 3. ASSERTION: Vérifier le message de succès
await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 10000 })
await expect(page.getByTestId('success-message')).toContainText('Inscription réussie')
```

---

### 📊 Tableau Récapitulatif des Assertions

| Assertion | Utilisation | Exemple |
|-----------|-------------|---------|
| `.toBeVisible()` | Élément visible | Message de succès affiché |
| `.not.toBeVisible()` | Élément caché | Bouton logout masqué |
| `.toContainText('...')` | Contient du texte | Erreur contient "invalide" |
| `.toHaveText('...')` | Texte exact | Titre exact |
| `.toHaveValue('...')` | Valeur d'input | Email rempli |
| `.toHaveURL('...')` | URL exacte | Redirection vers dashboard |
| `.toHaveCount(N)` | Nombre d'éléments | 5 projets affichés |

---

## 6. Analyser les Échecs

### Comprendre Pourquoi un Test Échoue

Quand un test échoue, Playwright vous donne plein d'informations!

### Étape 1: Lire le Message d'Erreur

**Exemple d'erreur**:
```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('success-message')
Expected: visible
Timeout: 10000ms
Error: element(s) not found
```

**Traduction**:
- "Je m'attendais à ce que l'élément avec `data-testid="success-message"` soit visible"
- "J'ai attendu 10 secondes"
- "Je ne l'ai pas trouvé"

---

### Étape 2: Regarder le Screenshot

Quand un test échoue, Playwright prend une **capture d'écran automatiquement**.

**Où les trouver?**
```
test-results/
└── warmup-signup-SupabaseTest-ec00e--nouveau-compte-avec-succès-chromium/
    └── test-failed-1.png  ← REGARDER CE FICHIER
```

**Commande rapide**:
```bash
# Ouvrir le dernier screenshot
ls -t test-results/*/*.png | head -1 | xargs xdg-open
```

---

### Étape 3: Lire le Error Context

Playwright génère aussi un fichier `error-context.md` avec:
- L'état de la page au moment de l'échec
- Tous les éléments présents
- Les erreurs JavaScript éventuelles

**Exemple**:
```bash
cat test-results/warmup-signup-*/error-context.md
```

---

### Étape 4: Rejouer le Test en Mode Debug

```bash
# Rejouer le test qui a échoué
npx playwright test -g "devrait créer un nouveau compte" --debug
```

**Dans le debug**:
1. Le test s'exécute pas-à-pas
2. Vous pouvez voir chaque action
3. Vous pouvez tester des commandes dans la console
4. Vous voyez EXACTEMENT où ça plante

---

### 🔍 Cas Pratique: Analyser un Échec Réel

**Test qui échoue**: `signup.spec.js` - "devrait créer un nouveau compte"

#### 1. Lancer le test
```bash
npx playwright test -g "devrait créer un nouveau compte"
```

#### 2. Voir l'erreur
```
❌ Error: expect(locator).toBeVisible() failed
   Locator: getByTestId('success-message')
   Expected: visible
   Timeout: 10000ms
```

#### 3. Regarder le screenshot
```bash
# Ouvrir le screenshot du dernier échec
ls -t test-results/warmup-signup-*/test-failed-1.png | head -1 | xargs xdg-open
```

**Ce qu'on voit**:
- Le formulaire est rempli ✅
- Le bouton "S'inscrire" a été cliqué ✅
- Mais un message d'erreur s'affiche: "Email address is invalid" ❌

#### 4. Comprendre le problème
```bash
cat test-results/warmup-signup-*/error-context.md | grep -A 2 "Email address"
```

**Résultat**:
```
- generic [ref=e18]: Email address "test1767633344853@example.com" is invalid
```

#### 5. Conclusion
**Problème**: Supabase rejette les emails `@example.com`
**Solution**: Utiliser `@test.com` à la place

---

### 🎯 Méthode Universelle de Débugging

```bash
# 1. Identifier le test qui échoue
npm test

# 2. Le rejouer en mode UI pour voir ce qui se passe
npm run test:ui
# → Cliquer sur le test rouge, observer la timeline

# 3. Le rejouer en mode debug pour contrôler
npx playwright test -g "nom du test" --debug
# → Avancer pas-à-pas avec le bouton "Step Over"

# 4. Regarder le screenshot
ls -t test-results/*/*.png | head -1 | xargs xdg-open

# 5. Lire le contexte d'erreur
cat test-results/*/error-context.md | less
```

---

## 7. Mode Debug Pas-à-Pas

### Lancer le Mode Debug

```bash
npx playwright test --debug
```

**Ce qui s'ouvre**:
1. **Playwright Inspector** (à gauche) - Contrôles et code
2. **Navigateur** (à droite) - Votre application

---

### Interface du Playwright Inspector

```
┌────────────────────────────────────────────────────┐
│ Playwright Inspector                               │
├────────────────────────────────────────────────────┤
│ ▶️ Resume (F8)   ⏭️ Step Over (F10)   ⏹️ Stop     │
├────────────────────────────────────────────────────┤
│ Source Code:                                       │
│                                                    │
│ 1  test('devrait créer un compte', async ({page})│
│ 2    await page.goto('/supabase-test')            │
│ 3 ▶️ await page.getByTestId('email').fill(...)   │ ← Ligne actuelle
│ 4    await page.getByTestId('button').click()     │
│                                                    │
├────────────────────────────────────────────────────┤
│ Console:                                           │
│ > page.locator('h1')                              │
│ Locator('h1')                                     │
│                                                    │
│ > await page.locator('h1').textContent()          │
│ "Test Supabase - GameFund"                        │
└────────────────────────────────────────────────────┘
```

---

### Contrôles Clavier

| Touche | Action | Description |
|--------|--------|-------------|
| **F8** | Resume | Continuer l'exécution jusqu'au prochain breakpoint |
| **F10** | Step Over | Exécuter la ligne actuelle et passer à la suivante |
| **F11** | Step Into | Entrer dans la fonction appelée |
| **Shift+F11** | Step Out | Sortir de la fonction actuelle |

---

### Utiliser la Console

Dans le Playwright Inspector, vous pouvez **tester des commandes** en direct!

**Exemples**:
```javascript
// Trouver un élément
> page.locator('h1')
Locator('h1')

// Voir son texte
> await page.locator('h1').textContent()
"Test Supabase - GameFund"

// Vérifier s'il est visible
> await page.getByTestId('success-message').isVisible()
false

// Compter les éléments
> await page.getByTestId('project-card').count()
0

// Cliquer sur un bouton
> await page.getByTestId('signup-submit-button').click()
undefined
```

**C'est comme une console JavaScript, mais pour Playwright!**

---

### 🎓 Exercice Pratique de Debug

**Objectif**: Débugger le test de signup qui échoue

```bash
# 1. Lancer le debug sur le test de signup
npx playwright test tests/warmup/signup.spec.js --debug
```

**Dans l'Inspector**:

```javascript
// 2. Le test s'arrête à la première ligne
// Appuyer sur F10 pour avancer pas-à-pas

// 3. Quand vous arrivez à la ligne:
await page.getByTestId('signup-submit-button').click()

// 4. Appuyer sur F10 pour cliquer

// 5. Dans la console, tester:
> await page.getByTestId('success-message').isVisible()
false  // ❌ Le message de succès n'est pas visible

// 6. Regarder dans le navigateur
// → Vous voyez le message d'erreur: "Email address is invalid"

// 7. Dans la console, lire l'erreur:
> await page.locator('text=Email address').textContent()
"Email address "test1767633344853@example.com" is invalid"

// 8. Conclusion: Le domaine @example.com est rejeté par Supabase!
```

---

### Ajouter des Breakpoints

Vous pouvez ajouter `await page.pause()` dans votre test:

```javascript
test('devrait créer un compte', async ({ page }) => {
  await page.goto('/supabase-test')

  // Le test s'arrêtera ICI
  await page.pause()

  await page.getByTestId('signup-submit-button').click()
})
```

**Utilisation**: S'arrêter à un endroit précis du test

---

## 8. Astuces et Bonnes Pratiques

### 🎯 Astuce 1: Augmenter les Timeouts

**Problème**: Les appels Supabase sont lents, les tests timeout

**Solution**:
```javascript
// ❌ AVANT (timeout par défaut 5000ms)
await expect(page.getByTestId('success-message')).toBeVisible()

// ✅ APRÈS (timeout 10000ms)
await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 10000 })
```

---

### 🎯 Astuce 2: Attendre le Réseau

**Problème**: Le test clique trop vite avant que l'API réponde

**Solution**:
```javascript
// Attendre que le réseau soit stable
await page.getByTestId('signup-submit-button').click()
await page.waitForLoadState('networkidle')  // ← Ajouter ceci
await expect(page.getByTestId('success-message')).toBeVisible()
```

---

### 🎯 Astuce 3: Vérifier Succès OU Erreur

**Problème**: On ne sait pas si le test va réussir ou échouer

**Solution**:
```javascript
// Attendre que SOIT le message de succès, SOIT le message d'erreur apparaisse
await page.waitForSelector('[data-testid="success-message"], [data-testid="error-message"]')

// Puis vérifier lequel est apparu
const success = await page.getByTestId('success-message').isVisible()
const error = await page.getByTestId('error-message').isVisible()

if (success) {
  console.log('✅ Succès!')
} else if (error) {
  const errorText = await page.getByTestId('error-message').textContent()
  console.log('❌ Erreur:', errorText)
}
```

---

### 🎯 Astuce 4: Utiliser .first() pour les Listes

**Problème**: Plusieurs éléments ont le même testid

**Solution**:
```javascript
// ❌ ERREUR: Playwright ne sait pas lequel choisir
await page.getByText('Connecté').click()

// ✅ SOLUTION: Prendre le premier
await page.getByText('Connecté').first().click()
```

---

### 🎯 Astuce 5: Générer du Code avec Codegen

**Problème**: Je ne sais pas comment écrire le sélecteur

**Solution**: Laisser Playwright le générer!

```bash
npx playwright codegen http://localhost:5173/supabase-test
```

1. Un navigateur s'ouvre
2. Faites vos actions manuellement
3. Playwright génère le code!
4. Copiez-collez dans votre test

---

### 🎯 Astuce 6: Créer des Helpers

**Problème**: On répète souvent le même code

**Solution**: Créer des fonctions helper

```javascript
// helpers/auth.js
export async function signup(page, email, password, displayName) {
  await page.goto('/supabase-test')
  await page.getByTestId('signup-display-name-input').fill(displayName)
  await page.getByTestId('signup-email-input').fill(email)
  await page.getByTestId('signup-password-input').fill(password)
  await page.getByTestId('signup-submit-button').click()
}

// Dans un test
import { signup } from './helpers/auth'

test('test avec signup', async ({ page }) => {
  await signup(page, 'test@example.com', 'pass123', 'Test User')
  // La suite du test...
})
```

---

### 🎯 Astuce 7: Utiliser des Fixtures

**Problème**: Besoin de données de test cohérentes

**Solution**: Créer un fichier de fixtures

```javascript
// fixtures/users.json
{
  "validUser": {
    "email": "valid@test.com",
    "password": "ValidPass123!",
    "displayName": "Valid User"
  },
  "invalidUser": {
    "email": "invalid@example.com",
    "password": "short"
  }
}

// Dans un test
import users from '../fixtures/users.json'

test('signup with valid user', async ({ page }) => {
  const user = users.validUser
  await page.getByTestId('signup-email-input').fill(user.email)
  // ...
})
```

---

### 📋 Checklist Avant de Lancer un Test

- [ ] Le serveur Vite tourne-t-il? (normalement auto, mais vérifier si erreur)
- [ ] La base de données Supabase est-elle accessible?
- [ ] Les données de test sont-elles valides? (email accepté, password assez fort)
- [ ] Les timeouts sont-ils suffisants? (10000ms pour Supabase)

---

## 🎓 Plan d'Apprentissage Recommandé

### Jour 1: Découverte (1-2h)
1. ✅ Lire ce guide jusqu'ici
2. ✅ Lancer `npm run test:ui`
3. ✅ Cliquer sur chaque test et observer
4. ✅ Identifier les tests qui passent vs ceux qui échouent

### Jour 2: Pratique (2-3h)
1. ✅ Lancer `npx playwright codegen http://localhost:5173/supabase-test`
2. ✅ Reproduire manuellement un test (signup, signin)
3. ✅ Comparer le code généré avec nos tests
4. ✅ Modifier un test simple (changer un texte à vérifier)

### Jour 3: Debug (1-2h)
1. ✅ Lancer un test qui échoue en mode debug
2. ✅ Avancer pas-à-pas avec F10
3. ✅ Tester des commandes dans la console
4. ✅ Regarder les screenshots d'échec

### Jour 4: Création (2-3h)
1. ✅ Créer un nouveau test simple (ex: vérifier un lien)
2. ✅ Le faire passer ✅
3. ✅ Le faire échouer volontairement ❌
4. ✅ Comprendre pourquoi

---

## 📚 Ressources Supplémentaires

### Documentation Officielle
- [Playwright Docs](https://playwright.dev/) - Documentation complète
- [Best Practices](https://playwright.dev/docs/best-practices) - Bonnes pratiques
- [Selectors](https://playwright.dev/docs/selectors) - Guide des sélecteurs

### Vidéos (en anglais)
- [Playwright Tutorial for Beginners](https://www.youtube.com/playlist?list=PLhW3qG5bs-L9sJKoT1LC5grGT77sfW0Z8)

### Dans Ce Projet
- [README.md](../README.md) - Vue d'ensemble
- [TESTING.md](TESTING.md) - Stratégie complète
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Résumé technique

---

## 🤔 FAQ

### Q: Pourquoi mes tests sont lents?
**R**: C'est normal! Les tests E2E lancent un vrai navigateur. Utilisez `workers: 1` dans le config pour tester un par un.

### Q: Comment voir ce qui se passe dans le navigateur?
**R**: Utilisez `npm run test:headed` ou `npm run test:ui`

### Q: Un test échoue de manière aléatoire (flaky). Pourquoi?
**R**: Souvent un problème de timing. Augmentez les timeouts ou ajoutez `waitForLoadState('networkidle')`

### Q: Comment tester UN SEUL test rapidement?
**R**: `npx playwright test -g "nom du test"`

### Q: Playwright ne trouve pas mon élément. Que faire?
**R**:
1. Lancer en mode headed: `npm run test:headed`
2. Vérifier que l'élément existe vraiment
3. Utiliser `npx playwright codegen` pour trouver le bon sélecteur

### Q: Puis-je tester sur plusieurs navigateurs?
**R**: Oui! Modifier `playwright.config.js` pour ajouter Firefox et Safari

---

**Bon apprentissage! N'hésitez pas à expérimenter avec le mode UI et Debug.** 🚀
