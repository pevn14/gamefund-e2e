# GameFund E2E Tests - Architecture et Mise en Œuvre

**Version** : 2.0
**Date** : 19 janvier 2026
**Auteur** : Équipe GameFund

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Structure du projet](#2-structure-du-projet)
3. [Configuration](#3-configuration)
4. [Helpers et utilitaires](#4-helpers-et-utilitaires)
5. [Fixtures](#5-fixtures)
6. [Organisation des tests par famille](#6-organisation-des-tests-par-famille)
7. [Conventions et bonnes pratiques](#7-conventions-et-bonnes-pratiques)
8. [Exécution des tests](#8-exécution-des-tests)
9. [Maintenance](#9-maintenance)

---

## 1. Vue d'ensemble

### Objectif

Ce projet contient les tests End-to-End (E2E) pour l'application GameFund, une plateforme de crowdfunding pour jeux vidéo. Les tests sont organisés par **familles fonctionnelles** selon les directives du document `TESTING.md`.

### Stack technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Playwright** | 1.x | Framework de test E2E |
| **Node.js** | 18+ | Runtime JavaScript |
| **dotenv** | 16.x | Gestion des variables d'environnement |

### Philosophie de test

Les tests E2E couvrent les **parcours utilisateurs critiques** :

1. **Flux d'argent** : Donations, statistiques financières
2. **Authentification** : Inscription, connexion, session
3. **Gestion des projets** : CRUD complet
4. **Dashboards** : Accès aux informations personnalisées

---

## 2. Structure du projet

```
gamefund-e2e/
├── tests/                          # Tests E2E organisés par famille
│   ├── auth/                       # Authentification
│   │   ├── signup.spec.js          # Inscription
│   │   ├── login.spec.js           # Connexion
│   │   └── session.spec.js         # Gestion de session
│   │
│   ├── projects/                   # Gestion des projets
│   │   ├── gallery.spec.js         # Galerie publique
│   │   ├── detail.spec.js          # Détail projet
│   │   ├── create-edit.spec.js     # Création/édition
│   │   └── creator-list.spec.js    # Liste créateurs
│   │
│   ├── donations/                  # Système de dons
│   │   ├── donate.spec.js          # Faire un don
│   │   ├── my-donations.spec.js    # Mes donations
│   │   └── project-donations.spec.js # Vue créateur
│   │
│   ├── dashboards/                 # Dashboards
│   │   ├── creator.spec.js         # Dashboard créateur
│   │   ├── donor.spec.js           # Dashboard donateur
│   │   └── admin.spec.js           # Dashboard admin
│   │
│   ├── profiles/                   # Profils créateurs
│   │   ├── profile-editor.spec.js  # Éditeur de profil
│   │   └── creators-page.spec.js   # Page créateurs
│   │
│   └── navigation/                 # Navigation
│       ├── header.spec.js          # Header desktop/mobile
│       └── footer.spec.js          # Footer
│
├── helpers/                        # Utilitaires réutilisables
│   └── auth.js                     # Helpers d'authentification
│
├── fixtures/                       # Données de test
│   ├── users.json                  # Credentials utilisateurs
│   ├── test-users.js               # Export des utilisateurs
│   └── project-fixtures.js         # Données projets
│
├── docs/                           # Documentation
│   ├── TESTING.md                  # Guide de tests (référence)
│   ├── TESTS_PROGRESS.md           # Avancement
│   └── TESTS_ARCHITECTURE.md       # Ce fichier
│
├── playwright.config.js            # Configuration Playwright
├── package.json                    # Dépendances
└── .env                            # Variables d'environnement (non commité)
```

---

## 3. Configuration

### playwright.config.js

```javascript
import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    command: 'cd ../gamefund && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### Variables d'environnement (.env)

```env
# Utilisateur créateur (compte confirmé)
TEST_USER_EMAIL=creator@test.com
TEST_USER_PASSWORD=TestPass123!
TEST_USER_DISPLAY_NAME=Test Creator

# Utilisateur donateur
TEST_DONOR_EMAIL=donor@test.com
TEST_DONOR_PASSWORD=TestPass123!
TEST_DONOR_DISPLAY_NAME=Test Donor

# Utilisateur admin
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=AdminPass123!
TEST_ADMIN_DISPLAY_NAME=Test Admin

# Nouvel utilisateur (pour tests inscription)
TEST_NEW_USER_EMAIL=newuser@test.com
TEST_NEW_USER_PASSWORD=NewPass123!
TEST_NEW_USER_DISPLAY_NAME=New User
```

---

## 4. Helpers et utilitaires

### helpers/auth.js

Fonctions réutilisables pour l'authentification :

| Fonction | Description |
|----------|-------------|
| `login(page, email, password)` | Connexion générique |
| `loginAsCreator(page)` | Connexion en tant que créateur |
| `loginAsDonor(page)` | Connexion en tant que donateur |
| `loginAsAdmin(page)` | Connexion en tant qu'admin |
| `logout(page)` | Déconnexion |
| `expectLoggedIn(page, expect)` | Vérifie l'état connecté |
| `expectLoggedOut(page, expect)` | Vérifie l'état déconnecté |

**Exemple d'utilisation** :

```javascript
import { loginAsCreator, logout } from '../../helpers/auth.js';

test('mon test', async ({ page }) => {
  await loginAsCreator(page);
  // ... actions du test
  await logout(page);
});
```

---

## 5. Fixtures

### Utilisateurs (helpers/auth.js)

```javascript
export const users = {
  creator: {
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
    displayName: process.env.TEST_USER_DISPLAY_NAME
  },
  donor: { /* ... */ },
  admin: { /* ... */ },
  newUser: { /* ... */ }
};
```

### Projets (fixtures/project-fixtures.js)

- `PROJECT_TYPES` : Types de projets (draft, active, completed, failed)
- `TEST_PROJECTS` : Données de projets de test
- `INVALID_PROJECTS` : Données invalides pour tests de validation
- `ERROR_MESSAGES` : Messages d'erreur attendus
- `STATUS_LABELS` : Labels des statuts

---

## 6. Organisation des tests par famille

### 6.1 Authentification (auth/)

| Fichier | Scénarios couverts |
|---------|-------------------|
| `signup.spec.js` | A1: Inscription, validation formulaire |
| `login.spec.js` | A2: Connexion, erreurs, persistance |
| `session.spec.js` | A3: Déconnexion, protection routes |

### 6.2 Gestion des projets (projects/)

| Fichier | Scénarios couverts |
|---------|-------------------|
| `gallery.spec.js` | P1: Galerie, filtres, recherche |
| `detail.spec.js` | Détail projet, actions |
| `create-edit.spec.js` | P2: Création, édition, validation |
| `creator-list.spec.js` | P3: Filtrage par créateur |

### 6.3 Système de dons (donations/)

| Fichier | Scénarios couverts |
|---------|-------------------|
| `donate.spec.js` | D1: Faire un don, validation |
| `my-donations.spec.js` | D2: Historique personnel |
| `project-donations.spec.js` | D3: Vue créateur |

### 6.4 Dashboards (dashboards/)

| Fichier | Scénarios couverts |
|---------|-------------------|
| `creator.spec.js` | DB1: Dashboard créateur |
| `donor.spec.js` | DB2: Dashboard donateur |
| `admin.spec.js` | DB3: Dashboard admin |

### 6.5 Profils créateurs (profiles/)

| Fichier | Scénarios couverts |
|---------|-------------------|
| `profile-editor.spec.js` | PC1: Édition profil |
| `creators-page.spec.js` | PC2: Page créateurs |

### 6.6 Navigation (navigation/)

| Fichier | Scénarios couverts |
|---------|-------------------|
| `header.spec.js` | Header desktop/mobile |
| `footer.spec.js` | Footer, liens |

---

## 7. Conventions et bonnes pratiques

### Sélecteurs

**Toujours utiliser `data-testid`** :

```javascript
// ✅ Correct
await page.getByTestId('login-submit-button').click();

// ❌ Éviter
await page.locator('button[type="submit"]').click();
await page.getByText('Se connecter').click();
```

### Convention de nommage des data-testid

**Pattern** : `{page/composant}-{élément}-{action?}`

Exemples :
- `login-email-input`
- `project-card-title`
- `donation-form-submit-button`

### Attentes

**Utiliser les attentes explicites** :

```javascript
// ✅ Correct
await page.getByTestId('login-submit-button').click();
await page.waitForURL('/dashboard');
await expect(page.getByTestId('success-message')).toBeVisible();

// ❌ Éviter
await page.waitForTimeout(2000);
```

### Nommage des tests

**Noms descriptifs en français** :

```javascript
test.describe('Authentification', () => {
  test('devrait connecter un utilisateur avec credentials valides', async ({ page }) => {
    // ...
  });

  test('devrait afficher erreur si mot de passe incorrect', async ({ page }) => {
    // ...
  });
});
```

### Isolation

Chaque test doit être **indépendant** :
- Ne pas dépendre de l'ordre d'exécution
- Créer les données nécessaires en setup
- Nettoyer après si nécessaire

---

## 8. Exécution des tests

### Commandes disponibles

```bash
# Exécuter tous les tests
npm test

# Exécuter une famille spécifique
npm test tests/auth/

# Exécuter un fichier spécifique
npm test tests/auth/login.spec.js

# Mode UI (interactif)
npm run test:ui

# Mode debug
npm run test:debug

# Voir le rapport HTML
npx playwright show-report
```

### Prérequis

1. **Serveur GameFund** : Le serveur de développement doit être accessible sur `http://localhost:5173`
2. **Comptes de test** : Les comptes définis dans `.env` doivent exister dans Supabase
3. **Variables d'environnement** : Le fichier `.env` doit être configuré

---

## 9. Maintenance

### Ajout d'un nouveau test

1. Identifier la famille fonctionnelle
2. Créer ou modifier le fichier `.spec.js` approprié
3. Utiliser les helpers existants
4. Respecter les conventions de nommage
5. Mettre à jour `TESTS_PROGRESS.md`

### Ajout d'un nouveau data-testid

1. Ajouter l'attribut dans le composant React
2. Documenter dans `TESTING.md` (section 3)
3. Utiliser dans les tests

### Mise à jour des fixtures

1. Modifier `helpers/auth.js` ou `fixtures/`
2. Mettre à jour `.env.example` si nécessaire
3. Documenter les changements

---

## Ressources

- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [GameFund TESTING.md](./TESTING.md)
- [GameFund ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Dernière mise à jour** : 19 janvier 2026
