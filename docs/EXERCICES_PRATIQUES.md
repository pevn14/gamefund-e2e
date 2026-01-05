# Exercices Pratiques Playwright

**Objectif**: Apprendre Playwright en pratiquant sur les tests existants
**Niveau**: Débutant → Intermédiaire
**Durée estimée**: 4-6 heures (à votre rythme)

---

## 📋 Avant de Commencer

### Vérifications

```bash
# 1. Vérifier que tout est installé
npm --version
npx playwright --version

# 2. Lancer le serveur Vite dans un terminal séparé (optionnel)
cd ../gamefund
npm run dev

# 3. Retourner dans le projet e2e
cd ../gamefund-e2e
```

### Documentation à Portée de Main

Gardez ces fichiers ouverts dans votre éditeur:
- [PLAYWRIGHT_GUIDE.md](PLAYWRIGHT_GUIDE.md) - Guide complet
- [CHEATSHEET.md](CHEATSHEET.md) - Référence rapide
- Ce fichier pour les exercices

---

## 🎓 Partie 1: Découverte et Observation (30-45 min)

### Exercice 1.1: Explorer l'Interface UI

**Objectif**: Se familiariser avec le mode UI de Playwright

```bash
npm run test:ui
```

**Tâches**:

1. ✅ **Explorer la liste des tests**
   - Regarder la colonne de gauche
   - Identifier les tests qui passent ✅ vs ceux qui échouent ❌
   - Compter combien il y a de tests au total

2. ✅ **Cliquer sur un test qui PASSE** (ex: "devrait afficher la page de test")
   - Observer la timeline en haut (les étapes du test)
   - Regarder le screenshot au centre
   - Lire le code source à droite
   - Cliquer sur chaque étape de la timeline pour voir ce qui se passe

3. ✅ **Cliquer sur un test qui ÉCHOUE** (ex: "devrait créer un nouveau compte")
   - Regarder où le test s'arrête (ligne rouge dans le code)
   - Observer le screenshot au moment de l'échec
   - Lire le message d'erreur en rouge

4. ✅ **Rejouer un test**
   - Cliquer sur le bouton "Run" (▶️) en haut à droite
   - Observer l'exécution en temps réel

**Questions à se poser**:
- Combien de temps prend un test en moyenne?
- À quelle étape échouent la plupart des tests?
- Quel est le message d'erreur le plus fréquent?

---

### Exercice 1.2: Lancer des Tests en Ligne de Commande

**Objectif**: Maîtriser les commandes de base

**Tâches**:

```bash
# 1. Lancer TOUS les tests
npm test

# Q: Combien de tests passent? Combien échouent?
# Réponse: ___ tests passent, ___ tests échouent

# 2. Lancer UN SEUL fichier (tests qui passent)
npx playwright test tests/warmup/page-load.spec.js

# Q: Combien de temps ça prend?
# Réponse: ___ secondes

# 3. Lancer UN SEUL fichier (tests qui échouent)
npx playwright test tests/warmup/signup.spec.js

# Q: Quel est le message d'erreur?
# Réponse: ___________________

# 4. Lancer un seul test spécifique
npx playwright test -g "devrait afficher la page de test"

# Q: Le test passe-t-il? ✅ ou ❌
# Réponse: ___

# 5. Lancer avec le navigateur visible
npx playwright test tests/warmup/page-load.spec.js --headed

# Observer le navigateur qui s'ouvre et se ferme
```

**Checkpoint**: Vous devez maintenant savoir lancer des tests de différentes manières.

---

## 🔍 Partie 2: Analyse et Compréhension (45-60 min)

### Exercice 2.1: Analyser un Test qui Passe

**Fichier**: `tests/warmup/page-load.spec.js`

**Tâches**:

1. ✅ **Ouvrir le fichier dans votre éditeur**
   ```bash
   # Si vous utilisez VS Code
   code tests/warmup/page-load.spec.js
   ```

2. ✅ **Lire le premier test ligne par ligne**
   ```javascript
   test('devrait afficher la page de test', async ({ page }) => {
     await page.goto('/supabase-test')
     await expect(page.locator('h1')).toContainText('Test Supabase')
   })
   ```

3. ✅ **Comprendre chaque ligne**
   - Ligne 1: Que fait `page.goto()`?
   - Ligne 2: Que fait `page.locator('h1')`?
   - Ligne 2: Que vérifie `.toContainText()`?

4. ✅ **Modifier le test pour le faire échouer**
   ```javascript
   // Changer "Test Supabase" en "Autre Chose"
   await expect(page.locator('h1')).toContainText('Autre Chose')
   ```

5. ✅ **Relancer le test**
   ```bash
   npx playwright test -g "devrait afficher la page de test"
   ```

6. ✅ **Observer l'erreur**
   - Lire le message d'erreur
   - Comprendre pourquoi le test échoue

7. ✅ **Remettre le bon texte et vérifier que ça passe**
   ```javascript
   await expect(page.locator('h1')).toContainText('Test Supabase')
   ```

**Checkpoint**: Vous comprenez maintenant comment un test vérifie le contenu de la page.

---

### Exercice 2.2: Analyser un Test qui Échoue

**Fichier**: `tests/warmup/signup.spec.js`

**Tâches**:

1. ✅ **Lancer le test en mode headed pour voir ce qui se passe**
   ```bash
   npx playwright test tests/warmup/signup.spec.js --headed
   ```

2. ✅ **Observer le navigateur**
   - Que voyez-vous?
   - Un formulaire est-il rempli?
   - Un bouton est-il cliqué?
   - Quel message apparaît?

3. ✅ **Regarder le screenshot de l'échec**
   ```bash
   # Trouver le dernier screenshot
   ls -t test-results/warmup-signup-*/test-failed-1.png | head -1

   # L'ouvrir (sur Linux)
   ls -t test-results/warmup-signup-*/test-failed-1.png | head -1 | xargs xdg-open

   # Ou le trouver manuellement dans test-results/
   ```

4. ✅ **Lire le contexte d'erreur**
   ```bash
   cat test-results/warmup-signup-*/error-context.md | grep -A 2 "Email"
   ```

5. ✅ **Identifier le problème**
   - Quel est le message d'erreur affiché sur la page?
   - Pourquoi le test échoue-t-il?

**Réponse attendue**: "Email address ... is invalid" - Supabase rejette les emails @example.com

**Checkpoint**: Vous savez maintenant analyser un échec de test.

---

### Exercice 2.3: Utiliser Codegen

**Objectif**: Laisser Playwright générer du code pour vous

**Tâches**:

1. ✅ **Lancer Codegen**
   ```bash
   npx playwright codegen http://localhost:5173/supabase-test
   ```

2. ✅ **Dans le navigateur qui s'ouvre, faire les actions suivantes**:
   - Cliquer sur le champ "Nom d'affichage" du formulaire d'inscription
   - Taper "Test User"
   - Cliquer sur le champ "Email"
   - Taper "test@example.com"
   - Cliquer sur le champ "Mot de passe"
   - Taper "password123"

3. ✅ **Observer le code généré dans la fenêtre Inspector**
   - Comparer avec le code dans `signup.spec.js`
   - Est-ce similaire?

4. ✅ **Copier le code généré** et le coller dans un fichier texte pour référence

**Checkpoint**: Vous savez générer du code automatiquement avec Codegen.

---

## 🐛 Partie 3: Debug et Inspection (60-90 min)

### Exercice 3.1: Mode Debug Pas-à-Pas

**Objectif**: Maîtriser le mode debug

**Tâches**:

1. ✅ **Lancer un test simple en mode debug**
   ```bash
   npx playwright test -g "devrait afficher la page de test" --debug
   ```

2. ✅ **Observer l'interface Playwright Inspector**
   - Fenêtre de gauche: l'Inspector avec les contrôles
   - Fenêtre de droite: le navigateur

3. ✅ **Utiliser les contrôles**
   - Appuyer sur **F10** (Step Over) pour avancer ligne par ligne
   - Observer ce qui se passe dans le navigateur à chaque étape
   - Appuyer sur **F8** (Resume) pour finir le test

4. ✅ **Tester des commandes dans la console** (en bas de l'Inspector)
   ```javascript
   // Trouver le titre
   > page.locator('h1')

   // Récupérer son texte
   > await page.locator('h1').textContent()

   // Vérifier qu'un élément est visible
   > await page.getByTestId('signup-submit-button').isVisible()
   ```

5. ✅ **Relancer avec un test plus complexe**
   ```bash
   npx playwright test -g "devrait valider le formulaire" --debug
   ```

6. ✅ **Tester plus de commandes**
   ```javascript
   // Compter les inputs
   > await page.locator('input').count()

   // Voir tous les data-testid
   > await page.locator('[data-testid]').count()

   // Lire un attribut
   > await page.getByTestId('signup-email-input').getAttribute('type')
   ```

**Checkpoint**: Vous maîtrisez le mode debug et la console.

---

### Exercice 3.2: Ajouter un Breakpoint

**Objectif**: Mettre en pause le test à un endroit précis

**Tâches**:

1. ✅ **Ouvrir `tests/warmup/page-load.spec.js`**

2. ✅ **Ajouter `await page.pause()` dans le test**
   ```javascript
   test('devrait afficher la page de test', async ({ page }) => {
     await page.goto('/supabase-test')

     await page.pause()  // ← AJOUTER CETTE LIGNE

     await expect(page.locator('h1')).toContainText('Test Supabase')
   })
   ```

3. ✅ **Lancer le test**
   ```bash
   npx playwright test -g "devrait afficher la page de test"
   ```

4. ✅ **Le test s'arrête automatiquement**
   - L'Inspector s'ouvre
   - Le test est en pause
   - Vous pouvez inspecter la page

5. ✅ **Tester des choses dans la console**
   ```javascript
   > await page.locator('h1').textContent()
   > await page.locator('button').count()
   ```

6. ✅ **Appuyer sur F8 pour continuer**

7. ✅ **Retirer le `page.pause()` du code**

**Checkpoint**: Vous savez mettre le test en pause où vous voulez.

---

### Exercice 3.3: Analyser un Échec Complexe

**Objectif**: Débugger un test qui échoue

**Tâches**:

1. ✅ **Lancer le test de signup en mode debug**
   ```bash
   npx playwright test -g "devrait créer un nouveau compte" --debug
   ```

2. ✅ **Avancer pas-à-pas avec F10**
   - Observer chaque ligne qui s'exécute
   - Voir le formulaire se remplir
   - Voir le bouton être cliqué

3. ✅ **Quand le test échoue, dans la console, taper**:
   ```javascript
   // Vérifier si le message de succès est visible
   > await page.getByTestId('success-message').isVisible()
   // Réponse: false

   // Vérifier si le message d'erreur est visible
   > await page.getByTestId('error-message').isVisible()
   // Réponse: true (peut-être)

   // Lire le message d'erreur
   > await page.getByTestId('error-message').textContent()
   // ou chercher dans la page
   > await page.locator('text=Email address').textContent()
   ```

4. ✅ **Identifier le problème**
   - Quel est le message d'erreur exact?
   - Pourquoi Supabase rejette-t-il l'email?

**Checkpoint**: Vous savez débugger un test qui échoue de manière méthodique.

---

## ✏️ Partie 4: Modification et Création (90-120 min)

### Exercice 4.1: Modifier un Test Existant

**Objectif**: Adapter un test à vos besoins

**Tâches**:

1. ✅ **Ouvrir `tests/warmup/page-load.spec.js`**

2. ✅ **Ajouter un nouveau test pour vérifier un autre élément**
   ```javascript
   test('devrait afficher la section Informations', async ({ page }) => {
     await page.goto('/supabase-test')

     // Vérifier que la section Informations est visible
     await expect(page.getByText('Informations')).toBeVisible()

     // Vérifier qu'elle contient le texte "Services disponibles:"
     await expect(page.getByText('Services disponibles:')).toBeVisible()
   })
   ```

3. ✅ **Lancer le nouveau test**
   ```bash
   npx playwright test -g "devrait afficher la section Informations"
   ```

4. ✅ **Vérifier qu'il passe** ✅

5. ✅ **Modifier le test pour vérifier un élément spécifique**
   ```javascript
   test('devrait afficher les services disponibles', async ({ page }) => {
     await page.goto('/supabase-test')

     // Vérifier chaque service listé
     await expect(page.getByText('✅ Client Supabase initialisé')).toBeVisible()
     await expect(page.getByText('✅ AuthService')).toBeVisible()
     await expect(page.getByText('✅ ProjectService')).toBeVisible()
   })
   ```

6. ✅ **Lancer et vérifier**
   ```bash
   npx playwright test -g "devrait afficher les services disponibles"
   ```

**Checkpoint**: Vous savez créer un nouveau test simple.

---

### Exercice 4.2: Créer un Test de A à Z

**Objectif**: Créer votre propre test

**Tâches**:

1. ✅ **Créer un nouveau fichier** `tests/warmup/my-first-test.spec.js`
   ```bash
   touch tests/warmup/my-first-test.spec.js
   ```

2. ✅ **Écrire la structure de base**
   ```javascript
   import { test, expect } from '@playwright/test'

   test.describe('Mon premier test', () => {
     test('devrait vérifier le titre de la page', async ({ page }) => {
       // TODO: Votre code ici
     })
   })
   ```

3. ✅ **Remplir le test**
   ```javascript
   test('devrait vérifier le titre de la page', async ({ page }) => {
     // 1. Aller sur la page
     await page.goto('/supabase-test')

     // 2. Vérifier le titre principal
     await expect(page.locator('h1')).toContainText('Test Supabase')

     // 3. Vérifier la description
     await expect(page.getByText('Page de test pour vérifier')).toBeVisible()
   })
   ```

4. ✅ **Lancer votre test**
   ```bash
   npx playwright test tests/warmup/my-first-test.spec.js
   ```

5. ✅ **Ajouter un deuxième test dans le même fichier**
   ```javascript
   test('devrait vérifier le bouton retester la connexion', async ({ page }) => {
     await page.goto('/supabase-test')

     // Attendre que le badge de connexion apparaisse
     await expect(page.getByText('✅ Connecté à Supabase')).toBeVisible({ timeout: 5000 })

     // Vérifier que le bouton est présent
     await expect(page.getByText('Retester la connexion')).toBeVisible()
   })
   ```

6. ✅ **Lancer les deux tests**
   ```bash
   npx playwright test tests/warmup/my-first-test.spec.js
   ```

**Checkpoint**: Vous avez créé votre premier fichier de tests Playwright!

---

### Exercice 4.3: Fixer un Test qui Échoue

**Objectif**: Corriger le problème d'email

**Tâches**:

1. ✅ **Ouvrir `tests/warmup/signup.spec.js`**

2. ✅ **Trouver la ligne qui génère l'email**
   ```javascript
   const email = `test${timestamp}@example.com`
   ```

3. ✅ **La modifier pour utiliser un domaine accepté**
   ```javascript
   const email = `test${timestamp}@test.com`  // Changer .example.com en .test.com
   ```

4. ✅ **Trouver TOUTES les occurrences de `@example.com` dans le fichier et les remplacer**
   - Utiliser la fonction "Rechercher et Remplacer" de votre éditeur
   - Chercher: `@example.com`
   - Remplacer par: `@test.com`

5. ✅ **Faire la même chose dans `signin.spec.js`**

6. ✅ **Faire la même chose dans `signout.spec.js`**

7. ✅ **Faire la même chose dans `complete-flow.spec.js`**

8. ✅ **Relancer tous les tests**
   ```bash
   npm test
   ```

9. ✅ **Compter combien de tests passent maintenant**
   - Avant: 13/25 tests passaient (52%)
   - Après: ___/25 tests passent (___%)

**Checkpoint**: Vous avez corrigé un problème réel dans les tests!

---

## 🎯 Partie 5: Patterns Avancés (60-90 min)

### Exercice 5.1: Utiliser beforeEach et afterEach

**Objectif**: Factoriser du code répétitif

**Tâches**:

1. ✅ **Créer un nouveau fichier** `tests/warmup/advanced-patterns.spec.js`

2. ✅ **Écrire un test avec beforeEach**
   ```javascript
   import { test, expect } from '@playwright/test'

   test.describe('Tests avec navigation automatique', () => {
     test.beforeEach(async ({ page }) => {
       // Exécuté AVANT chaque test
       await page.goto('/supabase-test')
     })

     test('test 1: vérifier titre', async ({ page }) => {
       // Pas besoin de goto, c'est déjà fait!
       await expect(page.locator('h1')).toContainText('Test Supabase')
     })

     test('test 2: vérifier badge', async ({ page }) => {
       // Pas besoin de goto, c'est déjà fait!
       await expect(page.getByText('✅ Connecté à Supabase')).toBeVisible({ timeout: 5000 })
     })
   })
   ```

3. ✅ **Lancer les tests**
   ```bash
   npx playwright test tests/warmup/advanced-patterns.spec.js
   ```

4. ✅ **Observer**: Chaque test navigue automatiquement vers la page

**Checkpoint**: Vous savez utiliser beforeEach pour du setup commun.

---

### Exercice 5.2: Créer une Fonction Helper

**Objectif**: Réutiliser du code entre tests

**Tâches**:

1. ✅ **Dans le même fichier, ajouter une fonction helper**
   ```javascript
   // Fonction helper pour remplir le formulaire de signup
   async function fillSignupForm(page, displayName, email, password) {
     await page.getByTestId('signup-display-name-input').fill(displayName)
     await page.getByTestId('signup-email-input').fill(email)
     await page.getByTestId('signup-password-input').fill(password)
   }

   test.describe('Tests avec helper', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/supabase-test')
     })

     test('devrait remplir le formulaire rapidement', async ({ page }) => {
       // Utiliser le helper
       await fillSignupForm(page, 'Test User', 'test@test.com', 'Pass123!')

       // Vérifier que les champs sont remplis
       await expect(page.getByTestId('signup-email-input')).toHaveValue('test@test.com')
     })
   })
   ```

2. ✅ **Lancer le test**
   ```bash
   npx playwright test -g "devrait remplir le formulaire rapidement"
   ```

**Checkpoint**: Vous savez créer des fonctions réutilisables.

---

### Exercice 5.3: Attendre des Éléments Dynamiques

**Objectif**: Gérer les chargements asynchrones

**Tâches**:

1. ✅ **Créer un test qui attend un élément**
   ```javascript
   test('devrait attendre le badge de connexion', async ({ page }) => {
     await page.goto('/supabase-test')

     // Attendre explicitement que le badge apparaisse (peut prendre du temps)
     await page.waitForSelector('text=✅ Connecté à Supabase', {
       timeout: 10000  // Attendre jusqu'à 10 secondes
     })

     // Puis vérifier
     await expect(page.getByText('✅ Connecté à Supabase')).toBeVisible()
   })
   ```

2. ✅ **Créer un test qui attend la fin des requêtes réseau**
   ```javascript
   test('devrait attendre la fin du chargement', async ({ page }) => {
     await page.goto('/supabase-test')

     // Attendre que toutes les requêtes réseau soient terminées
     await page.waitForLoadState('networkidle')

     // Maintenant on peut vérifier que tout est chargé
     await expect(page.getByText('✅ Connecté à Supabase')).toBeVisible()
   })
   ```

3. ✅ **Lancer les tests**
   ```bash
   npx playwright test -g "devrait attendre"
   ```

**Checkpoint**: Vous gérez maintenant les chargements asynchrones.

---

## 🏆 Partie 6: Projet Final (120-180 min)

### Exercice 6.1: Créer une Suite de Tests Complète

**Objectif**: Créer vos propres tests pour une nouvelle fonctionnalité

**Scénario**: Tester le bouton "Retester la connexion"

**Tâches**:

1. ✅ **Créer** `tests/warmup/retest-connection.spec.js`

2. ✅ **Écrire 4 tests**:
   - Test 1: Le bouton est visible
   - Test 2: Le bouton est cliquable
   - Test 3: Après un clic, le badge reste "Connecté"
   - Test 4: Le badge ne passe jamais en "Échec de connexion"

3. ✅ **Implémenter les tests**
   ```javascript
   import { test, expect } from '@playwright/test'

   test.describe('Bouton Retester la Connexion', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/supabase-test')
       await page.waitForSelector('text=✅ Connecté à Supabase', { timeout: 5000 })
     })

     test('devrait afficher le bouton retester', async ({ page }) => {
       // TODO: Votre code
     })

     test('devrait être cliquable', async ({ page }) => {
       // TODO: Votre code
     })

     test('devrait rester connecté après un clic', async ({ page }) => {
       // TODO: Votre code
       // Indice: cliquer, attendre, puis vérifier le badge
     })

     test('ne devrait jamais afficher échec de connexion', async ({ page }) => {
       // TODO: Votre code
       // Indice: cliquer 3 fois et vérifier à chaque fois
     })
   })
   ```

4. ✅ **Lancer vos tests**
   ```bash
   npx playwright test tests/warmup/retest-connection.spec.js
   ```

5. ✅ **Faire en sorte que tous les tests passent**

**Solution** (ne regarder qu'après avoir essayé!):

<details>
<summary>Voir la solution</summary>

```javascript
import { test, expect } from '@playwright/test'

test.describe('Bouton Retester la Connexion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/supabase-test')
    await page.waitForSelector('text=✅ Connecté à Supabase', { timeout: 5000 })
  })

  test('devrait afficher le bouton retester', async ({ page }) => {
    await expect(page.getByText('Retester la connexion')).toBeVisible()
  })

  test('devrait être cliquable', async ({ page }) => {
    const button = page.getByText('Retester la connexion')
    await expect(button).toBeEnabled()
    await button.click()
  })

  test('devrait rester connecté après un clic', async ({ page }) => {
    // Cliquer sur le bouton
    await page.getByText('Retester la connexion').click()

    // Attendre un peu
    await page.waitForTimeout(1000)

    // Vérifier que le badge est toujours "Connecté"
    await expect(page.getByText('✅ Connecté à Supabase')).toBeVisible()
  })

  test('ne devrait jamais afficher échec de connexion', async ({ page }) => {
    const button = page.getByText('Retester la connexion')

    // Cliquer 3 fois
    for (let i = 0; i < 3; i++) {
      await button.click()
      await page.waitForTimeout(500)

      // Vérifier qu'on est toujours connecté
      await expect(page.getByText('✅ Connecté à Supabase')).toBeVisible()
    }
  })
})
```
</details>

**Checkpoint**: Vous savez créer une suite de tests complète!

---

### Exercice 6.2: Documenter vos Tests

**Objectif**: Créer un README pour vos nouveaux tests

**Tâches**:

1. ✅ **Créer** `tests/warmup/MY_TESTS.md`

2. ✅ **Documenter vos tests**:
   - Quel fichier contient quels tests
   - Quels sont les objectifs de chaque test
   - Comment les lancer

3. ✅ **Exemple de structure**:
   ```markdown
   # Mes Tests Personnalisés

   ## Tests du Bouton Retester

   **Fichier**: `retest-connection.spec.js`

   ### Tests
   1. Le bouton est visible
   2. Le bouton est cliquable
   3. Après clic, reste connecté
   4. Jamais d'échec après multiples clics

   ### Lancer
   ```bash
   npx playwright test tests/warmup/retest-connection.spec.js
   ```
   ```

**Checkpoint**: Vous documentez vos tests comme un pro!

---

## 📊 Bilan Final

### Checklist de Compétences

Cochez ce que vous maîtrisez maintenant:

**Commandes**:
- [ ] Lancer tous les tests (`npm test`)
- [ ] Lancer en mode UI (`npm run test:ui`)
- [ ] Lancer un seul fichier
- [ ] Lancer un seul test par nom (`-g`)
- [ ] Mode debug (`--debug`)
- [ ] Mode headed (`--headed`)
- [ ] Générer du code (`codegen`)

**Lecture de Tests**:
- [ ] Comprendre la structure d'un test
- [ ] Identifier les sélecteurs
- [ ] Identifier les assertions
- [ ] Lire un message d'erreur

**Debug**:
- [ ] Utiliser le Playwright Inspector
- [ ] Avancer pas-à-pas (F10)
- [ ] Utiliser la console pour tester des commandes
- [ ] Ajouter `page.pause()`
- [ ] Regarder les screenshots d'échec

**Écriture de Tests**:
- [ ] Créer un nouveau fichier de test
- [ ] Écrire un test simple
- [ ] Utiliser beforeEach/afterEach
- [ ] Créer des fonctions helper
- [ ] Gérer les attentes asynchrones

**Patterns**:
- [ ] Générer des données uniques (email avec timestamp)
- [ ] Attendre des éléments dynamiques
- [ ] Vérifier succès OU erreur
- [ ] Factoriser du code répétitif

---

## 🎯 Prochaines Étapes

Une fois tous les exercices terminés:

1. ✅ **Corriger tous les tests qui échouent**
   - Remplacer `@example.com` par `@test.com` partout
   - Relancer `npm test`
   - Viser 100% de tests passants

2. ✅ **Expérimenter librement**
   - Créer de nouveaux tests
   - Tester d'autres pages de l'application
   - Essayer différents patterns

3. ✅ **Se préparer pour Phase 5**
   - Lire [TESTING.md](TESTING.md) section "Phase 5"
   - Identifier les pages à tester (`/signup`, `/login`)
   - Planifier les tests de production

---

## 🆘 Aide et Support

### Problèmes Courants

**"Le serveur n'est pas accessible"**
```bash
# Vérifier que Vite tourne
cd ../gamefund
npm run dev
```

**"Test timeout"**
```javascript
// Augmenter le timeout
await expect(element).toBeVisible({ timeout: 15000 })
```

**"Element not found"**
```bash
# Utiliser codegen pour trouver le bon sélecteur
npx playwright codegen http://localhost:5173/supabase-test
```

### Ressources

- [PLAYWRIGHT_GUIDE.md](PLAYWRIGHT_GUIDE.md) - Guide complet
- [CHEATSHEET.md](CHEATSHEET.md) - Référence rapide
- [Documentation Playwright](https://playwright.dev/)

---

**Bon courage et amusez-vous bien!** 🚀

N'oubliez pas: **L'erreur est votre meilleure prof. Faites échouer des tests exprès pour comprendre!**
