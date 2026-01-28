# GameFund E2E Tests

Tests E2E avec Playwright pour le projet GameFund (plateforme de crowdfunding React + Supabase).

## Vue d'ensemble

Ce projet contient les tests end-to-end Playwright pour l'application GameFund. Les tests couvrent l'authentification et la vérification de l'infrastructure.

## Statut des Tests

**Dernière mise à jour**: 28 janvier 2026

- ✅ **129 tests passent** (126 passed + 3 flaky avec retries)
- ⏭️ **2 tests skipped** (test-orphan-cleanup, admin users management)
- 🧹 **Nettoyage automatique** des projets orphelins après chaque run

### Tests disponibles ✅

#### 1. Tests de santé (`tests/health/`)
- ✅ Badge de connexion Supabase visible
- ✅ Bouton "Retester la connexion" visible
- ✅ Fonctionnalité de reconnexion opérationnelle

#### 2. Tests d'authentification (`tests/auth/`)

**Inscription** (`01-signup.spec.js`):
- ✅ Validation du formulaire d'inscription
- ✅ Affichage des labels des champs
- ✅ Remplissage des champs
- ✅ Création d'un nouveau compte avec succès
- ✅ Message de succès pour email déjà confirmé (comportement de sécurité)

**Connexion/Déconnexion** (`02-signin-signout.spec.js`):
- ✅ Message d'erreur si compte inexistant
- ✅ Message d'erreur si email non confirmé
- ✅ Connexion avec compte confirmé et déconnexion complète

## Structure du Projet

```
gamefund-e2e/
├── tests/
│   ├── health/                         # Tests de santé de l'infrastructure
│   │   └── 01-database-connection.spec.js  # Vérification connexion Supabase ✅
│   └── auth/                           # Tests d'authentification
│       ├── 01-signup.spec.js           # Tests d'inscription ✅
│       └── 02-signin-signout.spec.js   # Tests de connexion/déconnexion ✅
├── fixtures/
│   └── test-users.js                   # Fixtures des utilisateurs de test
├── tmp-code-source-projet/             # Code source des composants React (référence)
├── docs/
│   ├── TESTING.md                      # Stratégie complète de tests
│   └── WARMUP_PLAN.md                  # Plan de travail Phase 4.5
├── playwright.config.js                # Configuration Playwright
├── .env                                # Variables d'environnement (non versionné)
├── .env.example                        # Template des variables d'environnement
└── package.json                        # Dépendances et scripts
```

## Installation

```bash
# Installer les dépendances
npm install

# Installer les navigateurs Playwright
npx playwright install
```

## Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine du projet (copier depuis `.env.example`):

```bash
# Nouvel utilisateur (pour les tests de signup)
# ⚠️ Ce compte NE DOIT PAS exister dans Supabase
# Utilisez une vraie adresse email pour éviter les bounces
NEW_USER_EMAIL=nouveau@example.com
NEW_USER_PASSWORD=MotDePasse123!
NEW_USER_DISPLAY_NAME=Nouveau Utilisateur

# Utilisateur confirmé (pour les tests de signin)
# ⚠️ Ce compte DOIT exister et être confirmé dans Supabase
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=MotDePasse123!
TEST_USER_DISPLAY_NAME=Test User
```

### Prérequis pour les tests

1. **Compte confirmé**: Créer manuellement un compte via `/signup` et confirmer l'email en cliquant sur le lien reçu
2. **Variables .env**: Configurer les variables d'environnement avec les bons emails
3. **Serveur de développement**: Le serveur démarre automatiquement (voir ci-dessous)

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

Pas besoin de démarrer manuellement le serveur !

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

### Lancer des tests spécifiques

```bash
# Tests de santé uniquement
npx playwright test tests/health/

# Tests d'authentification uniquement
npx playwright test tests/auth/

# Un seul fichier
npx playwright test tests/auth/01-signup.spec.js

# Un seul test
npx playwright test -g "devrait créer un nouveau compte"
```

### Générer du code automatiquement

```bash
# Pour la page de test
npx playwright codegen http://localhost:5173/

# Pour la page de connexion
npx playwright codegen http://localhost:5173/login

# Pour la page d'inscription
npx playwright codegen http://localhost:5173/signup
```

## Nettoyage automatique des projets orphelins

Le projet inclut un système de **nettoyage automatique** qui s'exécute après chaque suite de tests pour supprimer les projets de test orphelins.

### Comment ça fonctionne

1. **Global Teardown** (`global-teardown.js`):
   - S'exécute automatiquement après tous les tests
   - Recherche tous les projets dont le titre commence par "Projet"
   - Change leur statut à `cancelled` puis les supprime
   - Affiche un rapport de nettoyage dans la console

2. **Configuration** (`playwright.config.js`):
   ```javascript
   globalTeardown: './global-teardown.js'
   ```

3. **Processus de suppression**:
   - Étape 1: Statut → `cancelled` (requis par les RLS policies)
   - Étape 2: Suppression définitive

### Exemple de sortie

```
🧹 Global Teardown: Recherche de projets orphelins...
⚠️  2 projet(s) orphelin(s) détecté(s)
  → Nettoyage: Projet Test 1769590097097
  ✓ Supprimé
  → Nettoyage: Projet Publish 1769589957443
  ✓ Supprimé
✓ 2 projet(s) orphelin(s) nettoyé(s)
```

### Nettoyage manuel

Si besoin de nettoyer manuellement les projets orphelins:

```bash
# Démarrer le serveur de dev
cd ../gamefund && npm run dev

# Dans un autre terminal, exécuter le script
node scripts/cleanup-orphan-projects.js
```

**Note**: Le script `cleanup-orphan-projects.js` doit être mis à jour avec les IDs des projets à nettoyer.

## Problèmes connus et workarounds

### 1. React Query - Cache non invalidé après mutation

**Problème**: Le formulaire EditProjectPage ne refetch pas automatiquement après `updateProject`, même après 30s.

**Cause**: React Query ne invalide pas le cache après la mutation.

**Workaround E2E** (appliqué):
```javascript
// Après la sauvegarde, recharger la page pour forcer le refetch
await page.getByTestId('project-form-save-button').click();
await expect(page.getByTestId('project-form-save-button')).toBeEnabled();
await page.reload(); // Force refetch
await expect(page.getByTestId('edit-project-page')).toBeVisible();
```

**Fix permanent requis** (côté app):
```javascript
// Dans EditProjectPage.jsx
const mutation = useMutation({
  mutationFn: updateProject,
  onSuccess: () => {
    queryClient.invalidateQueries(['project', projectId]);
  }
});
```

**Fichiers concernés**: `tests/projects/crud.spec.js:77`

### 2. Tests flaky en exécution parallèle

**Problème**: Certains tests sont instables lors de l'exécution parallèle (crud, gallery).

**Workaround**: Configuration de retries automatiques
```javascript
// playwright.config.js
retries: process.env.CI ? 2 : 0,  // 2 retries en CI
```

**Tests concernés**:
- `tests/projects/crud.spec.js` (2 tests)
- `tests/projects/gallery.spec.js:52` (recherche textuelle)

**Status**: Passent avec 1 retry maximum

### 3. Race conditions résolues

**Problèmes résolus**:
- ✅ Dashboard tests: `.isVisible()` → `.or().toBeVisible()` avec auto-retry
- ✅ CRUD save: `waitForTimeout(500)` → `expect().toHaveValue()` avec timeout
- ✅ Donations modals: Rendu conditionnel corrigé (compact variant)

## Bonnes pratiques implémentées

### 1. Fixtures de données
- Utilisation de `fixtures/test-users.js` pour centraliser les données de test
- Chargement depuis variables d'environnement `.env`

### 2. Sélecteurs robustes
- Utilisation systématique de `data-testid` au lieu de sélecteurs CSS fragiles
- Meilleure maintenabilité et résistance aux changements

### 3. Timeouts adaptés
- Augmentation des timeouts pour les opérations Supabase (10s au lieu de 5s)
- Prise en compte de la latence réseau

### 4. Tests flexibles
- Acceptation de plusieurs messages d'erreur possibles selon l'état de la base
- Tests exécutables indépendamment ou en suite

### 5. Nettoyage automatique
- Global teardown qui supprime automatiquement les projets de test orphelins
- Garantit une base de données propre après chaque exécution
- Fonctionne même si les tests échouent

### 6. Auto-retry et gestion des race conditions
- Utilisation systématique d'assertions auto-retry au lieu de `waitForTimeout()`
- Pattern `.or()` pour gérer les états conditionnels (liste vide vs données)
- Exemple: `expect(list.or(emptyState)).toBeVisible()` au lieu de `isVisible()`
- Évite les race conditions lors des transitions d'état React

### 7. Retries automatiques en CI
- Configuration de retries pour gérer les tests flaky
- 2 retries en environnement CI, 0 en local
- Permet d'identifier rapidement les vrais problèmes vs instabilités réseau

### 8. Documentation dans le code
- Commentaires explicites sur les prérequis et workarounds
- Documentation des bugs applicatifs nécessitant un fix permanent
- TODOs pour les améliorations futures

## Points d'attention

### Comportements Supabase

1. **Email bounces**: Supabase peut bloquer les emails de domaines invalides (ex: `@example.com`). Utilisez de vraies adresses email.

2. **Messages de sécurité**: Supabase ne révèle pas si un email existe déjà lors de l'inscription (retourne toujours "Inscription réussie").

3. **Confirmation email**: Les comptes doivent être confirmés via email avant de pouvoir se connecter.

### Tests dépendants

Le test `02-signin-signout.spec.js` peut dépendre de l'exécution préalable de `01-signup.spec.js` pour créer le compte `NEW_USER`. Le test gère cette dépendance en acceptant deux messages d'erreur possibles.

## Environnement de test

- **URL cible**: `http://localhost:5173`
- **Navigateur**: Chromium (Chrome)
- **Timeout par défaut**: 30000ms (30s)
- **Screenshots**: En cas d'échec uniquement
- **Traces**: Sur première réessai
- **Workers**: 2 (tests parallélisés)

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

### Problème avec les variables d'environnement

Vérifier que le fichier `.env` existe et contient toutes les variables nécessaires:
```bash
cat .env
```

### Tests flaky ou instables

Si un test échoue de manière intermittente:

1. **Relancer avec retries**:
   ```bash
   npx playwright test --retries=2
   ```

2. **Tester en isolation**:
   ```bash
   npx playwright test tests/path/to/test.spec.js:line
   ```

3. **Vérifier les problèmes connus**:
   - React Query cache: tests CRUD nécessitent `page.reload()`
   - Race conditions: utiliser auto-retry patterns au lieu de `waitForTimeout()`
   - Tests parallèles: certains tests sont sensibles à l'exécution parallèle

4. **Nettoyage manuel**:
   ```bash
   # Si des projets orphelins causent des problèmes
   node scripts/cleanup-orphan-projects.js
   ```

### Projets orphelins après tests

Le global teardown nettoie automatiquement, mais si des projets persistent:
```bash
# 1. Identifier les projets (titre commence par "Projet")
# 2. Les supprimer via l'interface admin (/admin/projects)
# 3. Ou utiliser le script de nettoyage manuel
```

## Prochaines étapes

### Améliorations techniques

1. **Fix permanent React Query**:
   - Corriger l'invalidation du cache dans EditProjectPage
   - Remplacer le workaround `page.reload()` par une vraie solution
   - Fichier: `../gamefund/src/pages/creator/EditProjectPage.jsx`

2. **Stabilisation tests flaky**:
   - Investiguer les race conditions dans tests parallèles
   - Ajouter des attentes spécifiques au lieu de retries génériques
   - Tests concernés: `crud.spec.js`, `gallery.spec.js:52`

3. **Page Objects Pattern** (optionnel):
   ```
   page-objects/
   ├── LoginPage.js      # Helpers pour login/signup
   ├── ProjectPage.js    # Helpers pour CRUD projets
   ├── DonationPage.js   # Helpers pour donations
   └── BasePage.js       # Méthodes communes
   ```

4. **CI/CD**:
   - GitHub Actions workflow
   - Exécution automatique sur PR
   - Rapports de tests avec artefacts
   - Badge de statut dans le README

5. **Tests de performance**:
   - Mesurer les temps de chargement des pages critiques
   - Détecter les régressions de performance
   - Utiliser Lighthouse CI

6. **Tests d'accessibilité**:
   - Intégrer @axe-core/playwright
   - Vérifier WCAG 2.1 niveau AA
   - Tests sur navigation au clavier

## Ressources

- [Documentation Playwright](https://playwright.dev/)
- [TESTING.md](docs/TESTING.md) - Stratégie complète
- [WARMUP_PLAN.md](docs/WARMUP_PLAN.md) - Plan détaillé Phase 4.5
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

---

**Version**: 3.0
**Date**: 28 janvier 2026
**Status**: Suite complète E2E - 129 tests (auth, dashboards, projets, donations, profils, navigation) ✅

**Couverture**:
- Authentification (signup, login, session)
- Dashboards (créateur, donateur, admin)
- Projets (CRUD complet, galerie, filtrage, création)
- Donations (flux complet, mes donations, donations reçues)
- Profils (édition, page créateurs)
- Navigation (header, footer)

**Améliorations récentes**:
- ✅ Nettoyage automatique des projets orphelins (globalTeardown)
- ✅ Correction race conditions avec auto-retry patterns
- ✅ Workaround React Query cache issue
- ✅ Retries automatiques pour tests flaky
- ✅ Tests donations avec cleanup complet
