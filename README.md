# GameFund E2E Tests - Phase 4.5 Warmup

Tests E2E avec Playwright pour le projet GameFund (plateforme de crowdfunding React + Supabase).

## Vue d'ensemble

Ce projet contient les tests de warmup Playwright pour la page `SupabaseTest` du projet GameFund. Ces tests servent à se familiariser avec Playwright avant d'implémenter les tests de production (Phase 5+).

## Statut des Tests

**Dernière exécution**: 5 janvier 2026

- ✅ **13 tests passent** (52%)
- ❌ **12 tests échouent** (48%)

### Tests qui passent ✅

1. **Chargement de page**:
   - ✅ Affichage du titre "Test Supabase"
   - ✅ Affichage des informations de configuration

2. **Connexion base de données**:
   - ✅ Badge de connexion Supabase visible
   - ✅ Bouton "Retester la connexion" fonctionne
   - ✅ Section "État de connexion utilisateur" visible

3. **Validation des formulaires**:
   - ✅ Tous les champs de signup sont visibles
   - ✅ Tous les champs de signin sont visibles
   - ✅ Labels affichés correctement
   - ✅ Champs peuvent être remplis

4. **Erreurs de connexion**:
   - ✅ Message d'erreur affiché avec credentials invalides

### Tests qui échouent ❌

**Raison principale**: Les inscriptions échouent avec l'erreur `"Email address is invalid"` car Supabase rejette les emails de test `@example.com`.

Tests concernés:
- ❌ Création de nouveau compte (signup)
- ❌ Connexion après création de compte
- ❌ Déconnexion après connexion
- ❌ Flux complets signup → signin → signout
- ❌ Affichage des informations utilisateur
- ❌ Conservation des données entre connexions

## Problème Identifié

### L'erreur "Email address is invalid"

Supabase **rejette les emails avec le domaine `@example.com`** car il les considère comme invalides ou de test. Cela empêche tous les tests d'inscription de fonctionner.

**Solution recommandée**: Utiliser un vrai domaine d'email de test comme:
- `@test.com`
- `@mailinator.com`
- `@10minutemail.com`
- Ou configurer un domaine de test valide dans Supabase

## Structure du Projet

```
gamefund-e2e/
├── tests/
│   └── warmup/
│       ├── page-load.spec.js           # Tests de chargement de page ✅
│       ├── database-connection.spec.js # Tests de connexion DB ✅
│       ├── signup.spec.js              # Tests d'inscription ❌
│       ├── signin.spec.js              # Tests de connexion ❌
│       ├── signout.spec.js             # Tests de déconnexion ❌
│       └── complete-flow.spec.js       # Tests de flux complet ❌
├── docs/
│   ├── TESTING.md                      # Stratégie complète de tests
│   └── WARMUP_PLAN.md                  # Plan de travail Phase 4.5
├── playwright.config.js                # Configuration Playwright
└── package.json                        # Dépendances et scripts
```

## Installation

```bash
# Installer les dépendances
npm install

# Installer les navigateurs Playwright
npx playwright install
```

## Utilisation

### Commandes principales

```bash
# Lancer tous les tests
npm test

# Mode UI (interface graphique - recommandé pour debug)
npm run test:ui

# Mode debug (pas à pas)
npm run test:debug

# Mode headed (voir le navigateur)
npm run test:headed

# Voir le rapport HTML
npm run test:report
```

### Lancer un test spécifique

```bash
# Un seul fichier
npx playwright test tests/warmup/page-load.spec.js

# Un seul test
npx playwright test -g "devrait afficher la page de test"
```

### Générer du code automatiquement

```bash
npx playwright codegen http://localhost:5173/supabase-test
```

## Configuration

### Serveur de développement

Le serveur Vite du projet principal démarre **automatiquement** lors de l'exécution des tests grâce à la configuration `webServer` dans `playwright.config.js`:

```javascript
webServer: {
  command: 'cd ../gamefund && npm run dev',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
  timeout: 120000,
}
```

Pas besoin de démarrer manuellement le serveur!

### Environnement

- **URL cible**: `http://localhost:5173/supabase-test`
- **Navigateur**: Chromium (Chrome)
- **Timeout par défaut**: 30000ms (30s)
- **Screenshots**: En cas d'échec uniquement
- **Traces**: Sur première réessai

## Recommandations

### 1. Résoudre le problème d'email ⚠️

**Action immédiate**: Modifier les tests pour utiliser un domaine d'email valide accepté par Supabase.

**Option A** - Modifier les tests:
```javascript
// Avant
const email = `test${timestamp}@example.com`

// Après
const email = `test${timestamp}@test.com`
```

**Option B** - Configurer Supabase:
- Désactiver la validation stricte des emails en développement
- Ou ajouter `@example.com` à la liste blanche

### 2. Améliorer la robustesse des tests

**Ajouter des attentes explicites**:
```javascript
// Au lieu de juste cliquer et attendre
await page.getByTestId('signup-submit-button').click()
await page.waitForLoadState('networkidle') // Attendre que le réseau se stabilise

// Ou attendre un changement d'état spécifique
await page.waitForFunction(() => {
  return document.querySelector('[data-testid="success-message"]') !== null ||
         document.querySelector('[data-testid="error-message"]') !== null
})
```

### 3. Tests isolés et cleanup

Pour les tests qui créent des comptes, envisager:
- Utiliser un compte de test réutilisable
- Ou nettoyer la base de données après les tests
- Ou utiliser un environnement de test dédié

### 4. Créer des fixtures

Créer `fixtures/test-users.json` avec des utilisateurs pré-créés:
```json
{
  "validUser": {
    "email": "testuser@test.com",
    "password": "TestPass123!",
    "displayName": "Test User"
  }
}
```

### 5. Patterns réutilisables pour Phase 5

Les patterns qui fonctionnent bien:
- ✅ Utilisation cohérente des `data-testid`
- ✅ Timeouts augmentés pour les opérations Supabase
- ✅ Vérifications multiples (message + état UI)
- ✅ Tests de validation des formulaires

## Prochaines étapes

### Phase 5 - Tests d'authentification de production

Une fois le problème d'email résolu:

1. **Adapter ces tests pour les vraies pages**:
   - `/signup` au lieu de `/supabase-test`
   - `/login` au lieu de `/supabase-test`

2. **Ajouter des Page Objects**:
   ```
   page-objects/
   ├── LoginPage.js
   ├── SignupPage.js
   └── BasePage.js
   ```

3. **Ajouter des fixtures de données**:
   ```
   fixtures/
   ├── test-users.json
   └── test-projects.json
   ```

4. **Configurer CI/CD**:
   - GitHub Actions
   - Exécution automatique sur PR
   - Rapports de tests

## Ressources

- [Documentation Playwright](https://playwright.dev/)
- [TESTING.md](docs/TESTING.md) - Stratégie complète
- [WARMUP_PLAN.md](docs/WARMUP_PLAN.md) - Plan détaillé Phase 4.5

## Dépannage

### Le serveur ne démarre pas

Vérifier que le projet principal peut démarrer:
```bash
cd ../gamefund
npm run dev
```

### Tests trop lents

Utiliser un seul navigateur et désactiver le parallélisme:
```javascript
// playwright.config.js
workers: 1,
fullyParallel: false,
```

### Voir ce qui se passe

Utiliser le mode headed:
```bash
npm run test:headed
```

Ou le mode UI pour un debug interactif:
```bash
npm run test:ui
```

---

**Version**: 1.0
**Date**: 5 janvier 2026
**Status**: Phase 4.5 (Warmup) - En cours
