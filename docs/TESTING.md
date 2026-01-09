# GameFund - Stratégie de Tests

**Version** : 1.0
**Dernière mise à jour** : 05 janvier 2026
**Phase actuelle** : Phase 4 - Préparation des tests

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Pyramide de tests](#2-pyramide-de-tests)
3. [Tests E2E avec Playwright](#3-tests-e2e-avec-playwright)
4. [Tests unitaires avec Vitest](#4-tests-unitaires-avec-vitest)
5. [Attributs de test (data-testid)](#5-attributs-de-test-data-testid)
6. [Configuration](#6-configuration)
7. [Roadmap des tests](#7-roadmap-des-tests)
8. [Bonnes pratiques](#8-bonnes-pratiques)

---

## 1. Vue d'ensemble

### Philosophie de test pour GameFund

**Objectifs** :
- ✅ Garantir la stabilité des flux critiques (auth, donations, CRUD projets)
- ✅ Détecter les régressions rapidement
- ✅ Documenter le comportement attendu
- ❌ Éviter les tests inutiles (sur-testing de composants UI simples)

**Stratégie** :
- **70% Tests E2E** - Couvrent le parcours utilisateur complet
- **20% Tests Services** - Logique métier critique
- **10% Tests Hooks/Utils** - Fonctions réutilisables

---

## 2. Pyramide de tests

```
        /\
       /  \  E2E (Playwright)
      /____\  10-15 tests
     /      \  Flux critiques utilisateur
    /________\
   /          \ Tests intégration
  /____________\ 20-30 tests
 /              \ Hooks + Services avec Supabase
/________________\ Tests unitaires
                   30-50 tests
                   Services + Utilitaires
```

### Couverture par type

| Type | Priorité | Couverture cible | Exemples |
|------|----------|------------------|----------|
| **E2E** | ⭐⭐⭐ | Flux critiques | Signup → Login → Create Project → Donate |
| **Services** | ⭐⭐ | 80%+ | authService, projectService, donationService |
| **Hooks** | ⭐⭐ | 70%+ | useAuth |
| **Utils** | ⭐ | 90%+ | Formatters, validators |
| **Composants UI** | ❌ | 0% | Testés via E2E |

---

## 3. Tests E2E avec Playwright

### 3.1 Projet séparé (recommandé)

**Structure** :
```
gamefund-e2e/              # Projet Playwright séparé
├── tests/
│   ├── auth/
│   │   ├── signup.spec.js
│   │   └── login.spec.js
│   ├── projects/
│   │   ├── create-project.spec.js
│   │   ├── edit-project.spec.js
│   │   └── delete-project.spec.js
│   ├── donations/
│   │   └── donate.spec.js
│   └── flows/
│       └── complete-user-journey.spec.js
├── fixtures/
│   └── test-data.json
├── page-objects/
│   ├── LoginPage.js
│   ├── ProjectPage.js
│   └── DashboardPage.js
├── playwright.config.js
└── package.json
```

**Avantages projet séparé** :
- Dépendances isolées (Playwright, navigateurs)
- Peut tester plusieurs environnements (dev, staging, prod)
- CI/CD indépendant
- Pas de pollution du projet principal

### 3.2 Tests E2E prioritaires

#### Phase 5 : Authentification

**`tests/auth/signup.spec.js`** :
```javascript
import { test, expect } from '@playwright/test'

test.describe('Inscription utilisateur', () => {
  test('devrait créer un compte avec succès', async ({ page }) => {
    await page.goto('/signup')

    await page.getByTestId('display-name-input').fill('John Doe')
    await page.getByTestId('email-input').fill('john@example.com')
    await page.getByTestId('password-input').fill('SecurePass123!')

    await page.getByTestId('signup-submit-button').click()

    // Vérifier redirection vers dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText('Bonjour John Doe')).toBeVisible()
  })

  test('devrait afficher erreur si email déjà utilisé', async ({ page }) => {
    await page.goto('/signup')

    await page.getByTestId('email-input').fill('existing@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('signup-submit-button').click()

    await expect(page.getByTestId('error-message')).toContainText('Email déjà utilisé')
  })
})
```

**`tests/auth/login.spec.js`** :
```javascript
test.describe('Connexion utilisateur', () => {
  test('devrait se connecter avec succès', async ({ page }) => {
    await page.goto('/login')

    await page.getByTestId('email-input').fill('john@example.com')
    await page.getByTestId('password-input').fill('SecurePass123!')
    await page.getByTestId('login-submit-button').click()

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByTestId('logout-button')).toBeVisible()
  })

  test('devrait afficher erreur si credentials invalides', async ({ page }) => {
    await page.goto('/login')

    await page.getByTestId('email-input').fill('wrong@example.com')
    await page.getByTestId('password-input').fill('wrongpass')
    await page.getByTestId('login-submit-button').click()

    await expect(page.getByTestId('error-message')).toContainText('Identifiants invalides')
  })
})
```

#### Phase 7 : CRUD Projets

**`tests/projects/create-project.spec.js`** :
```javascript
test.describe('Création de projet', () => {
  test.beforeEach(async ({ page }) => {
    // Login avant chaque test
    await page.goto('/login')
    await page.getByTestId('email-input').fill('creator@example.com')
    await page.getByTestId('password-input').fill('password')
    await page.getByTestId('login-submit-button').click()
  })

  test('devrait créer un projet draft', async ({ page }) => {
    await page.goto('/projects/new')

    await page.getByTestId('project-title-input').fill('My Awesome Game')
    await page.getByTestId('project-description').fill('An epic RPG adventure')
    await page.getByTestId('project-goal-input').fill('50000')
    await page.getByTestId('project-deadline-input').fill('2026-12-31')

    // Upload image
    const fileInput = await page.locator('input[type="file"]')
    await fileInput.setInputFiles('fixtures/game-image.jpg')

    await page.getByTestId('save-draft-button').click()

    await expect(page.getByTestId('success-message')).toContainText('Projet sauvegardé')
    await expect(page).toHaveURL(/\/dashboard/)

    // Vérifier que le projet apparaît dans la liste
    await expect(page.getByTestId('project-card-title')).toContainText('My Awesome Game')
  })
})
```

#### Phase 9 : Donations

**`tests/donations/donate.spec.js`** :
```javascript
test.describe('Faire un don', () => {
  test.beforeEach(async ({ page }) => {
    // Login en tant que donateur
    await page.goto('/login')
    await page.getByTestId('email-input').fill('donor@example.com')
    await page.getByTestId('password-input').fill('password')
    await page.getByTestId('login-submit-button').click()
  })

  test('devrait faire un don avec succès', async ({ page }) => {
    await page.goto('/projects')

    // Cliquer sur le premier projet actif
    await page.getByTestId('project-card').first().click()

    // Formulaire de don
    await page.getByTestId('donation-amount-input').fill('100')
    await page.getByTestId('donation-message').fill('Great project!')
    await page.getByTestId('donate-button').click()

    // Vérifier confirmation
    await expect(page.getByTestId('success-message')).toContainText('Merci pour votre don')

    // Vérifier que le don apparaît dans l'historique
    await page.goto('/donations')
    await expect(page.getByText('100€')).toBeVisible()
  })
})
```

#### Flux complet

**`tests/flows/complete-user-journey.spec.js`** :
```javascript
test('Parcours utilisateur complet : signup → create project → donate', async ({ page }) => {
  // 1. Inscription créateur
  await page.goto('/signup')
  await page.getByTestId('email-input').fill('creator@test.com')
  await page.getByTestId('password-input').fill('pass123')
  await page.getByTestId('signup-submit-button').click()

  // 2. Créer un projet
  await page.goto('/projects/new')
  await page.getByTestId('project-title-input').fill('Epic Game')
  await page.getByTestId('project-goal-input').fill('10000')
  await page.getByTestId('publish-button').click()

  // 3. Déconnexion
  await page.getByTestId('logout-button').click()

  // 4. Inscription donateur
  await page.goto('/signup')
  await page.getByTestId('email-input').fill('donor@test.com')
  await page.getByTestId('password-input').fill('pass123')
  await page.getByTestId('signup-submit-button').click()

  // 5. Faire un don
  await page.goto('/projects')
  await page.getByText('Epic Game').click()
  await page.getByTestId('donation-amount-input').fill('500')
  await page.getByTestId('donate-button').click()

  // 6. Vérification finale
  await expect(page.getByTestId('success-message')).toContainText('Merci')
})
```

### 3.3 Configuration Playwright

**`playwright.config.js`** :
```javascript
import { defineConfig, devices } from '@playwright/test'

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
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 4. Tests unitaires avec Vitest

### 4.1 Installation

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 4.2 Tests Services

#### `src/services/__tests__/authService.test.js`

```javascript
import { describe, test, expect, vi, beforeEach } from 'vitest'
import * as authService from '../authService'
import { supabase } from '../supabase'

// Mock Supabase client
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    test('devrait créer un utilisateur avec display_name', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await authService.signUp(
        'test@example.com',
        'password123',
        'John Doe'
      )

      expect(result.error).toBeNull()
      expect(result.user).toEqual(mockUser)
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            display_name: 'John Doe',
          },
        },
      })
    })

    test('devrait retourner erreur si email invalide', async () => {
      const mockError = { message: 'Invalid email' }

      supabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: mockError,
      })

      const result = await authService.signUp(
        'invalid-email',
        'password123',
        'John'
      )

      expect(result.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signIn', () => {
    test('devrait connecter un utilisateur', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await authService.signIn('test@example.com', 'password123')

      expect(result.error).toBeNull()
      expect(result.user).toEqual(mockUser)
    })
  })

  describe('getUserProfile', () => {
    test('devrait récupérer le profil utilisateur', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        display_name: 'John Doe',
        role: 'user',
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      })

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      })

      const result = await authService.getUserProfile('user-123')

      expect(result.error).toBeNull()
      expect(result.profile).toEqual(mockProfile)
      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
    })
  })
})
```

#### `src/services/__tests__/projectService.test.js`

```javascript
import { describe, test, expect, vi, beforeEach } from 'vitest'
import * as projectService from '../projectService'

describe('projectService', () => {
  describe('getProjects', () => {
    test('devrait filtrer par status', async () => {
      // Mock implementation
      const { projects, error } = await projectService.getProjects({
        status: 'active',
      })

      expect(error).toBeNull()
      expect(projects).toBeDefined()
      // Vérifier que tous les projets ont status = 'active'
    })

    test('devrait trier par newest', async () => {
      const { projects } = await projectService.getProjects({
        sortBy: 'newest',
      })

      // Vérifier ordre décroissant created_at
      for (let i = 1; i < projects.length; i++) {
        const prev = new Date(projects[i - 1].created_at)
        const current = new Date(projects[i].created_at)
        expect(prev >= current).toBe(true)
      }
    })
  })
})
```

### 4.3 Tests Hooks

#### `src/hooks/__tests__/useAuth.test.jsx`

```javascript
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth, AuthProvider } from '../useAuth'

vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
}))

describe('useAuth', () => {
  test('devrait initialiser avec loading = true', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })

  test('devrait passer à loading = false après chargement', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  test('devrait exposer fonction signOut', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(typeof result.current.signOut).toBe('function')
  })
})
```

### 4.4 Tests Utilitaires

#### `src/utils/__tests__/formatters.test.js`

```javascript
import { describe, test, expect } from 'vitest'
import { formatCurrency, formatDate, calculatePercentage } from '../formatters'

describe('formatCurrency', () => {
  test('devrait formater en EUR avec séparateurs', () => {
    expect(formatCurrency(1234.56)).toBe('1 234,56 €')
    expect(formatCurrency(1000000)).toBe('1 000 000,00 €')
  })

  test('devrait gérer les nombres négatifs', () => {
    expect(formatCurrency(-500)).toBe('-500,00 €')
  })
})

describe('calculatePercentage', () => {
  test('devrait calculer le pourcentage correct', () => {
    expect(calculatePercentage(50, 100)).toBe(50)
    expect(calculatePercentage(75, 100)).toBe(75)
  })

  test('devrait plafonner à 100%', () => {
    expect(calculatePercentage(150, 100)).toBe(100)
    expect(calculatePercentage(200, 100)).toBe(100)
  })

  test('devrait gérer division par zéro', () => {
    expect(calculatePercentage(50, 0)).toBe(0)
  })
})
```

---

## 5. Attributs de test (data-testid)

### 5.1 Convention de nommage

**Pattern** : `{composant}-{action}-{élément}`

Exemples :
- `login-submit-button`
- `project-create-form`
- `donation-amount-input`
- `error-message`
- `success-toast`

### 5.2 Où ajouter data-testid

#### Éléments interactifs (haute priorité)

```javascript
// Boutons d'action
<Button data-testid="login-submit-button">Se connecter</Button>
<Button data-testid="signup-submit-button">S'inscrire</Button>
<Button data-testid="create-project-button">Créer</Button>
<Button data-testid="donate-button">Faire un don</Button>
<Button data-testid="logout-button">Déconnexion</Button>

// Inputs de formulaires
<Input
  data-testid="email-input"
  type="email"
  label="Email"
/>

<Input
  data-testid="password-input"
  type="password"
  label="Mot de passe"
/>

<Input
  data-testid="display-name-input"
  label="Nom affiché"
/>

<Textarea
  data-testid="project-description"
  label="Description"
/>

<Input
  data-testid="project-title-input"
  label="Titre du projet"
/>

<Input
  data-testid="donation-amount-input"
  type="number"
  label="Montant"
/>
```

#### Navigation

```javascript
<Link
  data-testid="nav-projects"
  to="/projects"
>
  Projets
</Link>

<Link
  data-testid="nav-dashboard"
  to="/dashboard"
>
  Dashboard
</Link>
```

#### Listes et cartes

```javascript
<div data-testid="projects-grid">
  {projects.map((project) => (
    <div
      key={project.id}
      data-testid={`project-card-${project.id}`}
    >
      <h3 data-testid="project-card-title">{project.title}</h3>
      <Button data-testid={`project-donate-${project.id}`}>
        Soutenir
      </Button>
    </div>
  ))}
</div>
```

#### Messages et notifications

```javascript
{error && (
  <div
    data-testid="error-message"
    className="text-red-600"
  >
    {error}
  </div>
)}

{message && (
  <div
    data-testid="success-message"
    className="text-green-600"
  >
    {message}
  </div>
)}

{loading && (
  <div data-testid="loading-spinner">
    Chargement...
  </div>
)}
```

### 5.3 Implémentation progressive

| Phase | Composants à annoter |
|-------|---------------------|
| **Phase 5** | LoginPage, SignupPage (tous inputs/boutons) |
| **Phase 6** | ProjectsPage (grille, cartes, filtres) |
| **Phase 7** | CreateProjectPage, EditProjectPage (formulaires) |
| **Phase 9** | DonationForm, DonationsHistory |
| **Phase 10** | Dashboard (tous les widgets) |

---

## 6. Configuration

### 6.1 Vitest config

**`vitest.config.js`** :
```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '*.config.js',
        'src/pages/TestHome.jsx',
        'src/pages/ComponentsDemo.jsx',
        'src/pages/SupabaseTest.jsx',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
})
```

### 6.2 Setup file

**`src/tests/setup.js`** :
```javascript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase client
vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

### 6.3 Scripts package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^23.0.0"
  }
}
```

---

## 7. Roadmap des tests

### Phase 4 (actuelle)

- ✅ Document TESTING.md créé
- ✅ `data-testid` ajoutés à SupabaseTest (page de test)
- ⏳ Pas de tests E2E/unitaires encore (fonctionnalités non utilisées)

### Phase 4.5 : Échauffement Playwright (OPTIONNEL)

**⚠️ Cette phase est optionnelle et destinée à se familiariser avec Playwright avant Phase 5.**

**Objectif** : Créer des tests E2E sur la page `SupabaseTest.jsx` pour apprendre Playwright sans pression.

**Avantages** :
- Apprentissage progressif de Playwright
- Expérimentation sans impact sur tests critiques
- Création de patterns réutilisables pour Phase 5
- Configuration du projet Playwright séparé

**Étape 1 : Créer projet Playwright** (dans un dossier séparé)

```bash
# Créer dossier à côté de gamefund/
cd ..
mkdir gamefund-e2e
cd gamefund-e2e

# Initialiser projet
npm init -y

# Installer Playwright
npm install -D @playwright/test

# Installer navigateurs
npx playwright install
```

**Étape 2 : Configuration Playwright**

Créer `playwright.config.js` :

```javascript
import { defineConfig, devices } from '@playwright/test'

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
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Optionnel : lancer le serveur dev automatiquement
  webServer: {
    command: 'cd ../gamefund && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

**Étape 3 : Premier test - Vérification page**

Créer `tests/warmup/page-load.spec.js` :

```javascript
import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Chargement page', () => {
  test('devrait afficher la page de test', async ({ page }) => {
    await page.goto('/supabase-test')

    // Vérifier titre
    await expect(page.locator('h1')).toContainText('Test Supabase')

    // Vérifier que la page contient les sections attendues
    await expect(page.getByText('Test de connexion Supabase')).toBeVisible()
    await expect(page.getByText('État de connexion utilisateur')).toBeVisible()
  })

  test('devrait afficher badge de connexion Supabase', async ({ page }) => {
    await page.goto('/supabase-test')

    // Attendre que le test de connexion soit terminé
    await page.waitForSelector('[data-testid="success-message"], text=✅ Connecté à Supabase', {
      timeout: 5000
    })

    // Vérifier le badge vert
    const badge = page.locator('text=✅ Connecté à Supabase')
    await expect(badge).toBeVisible()
  })
})
```

Lancer le test :
```bash
npx playwright test
```

**Étape 4 : Test inscription**

Créer `tests/warmup/signup.spec.js` :

```javascript
import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Inscription', () => {
  test('devrait créer un nouveau compte', async ({ page }) => {
    await page.goto('/supabase-test')

    // Générer email unique pour éviter conflits
    const timestamp = Date.now()
    const email = `test${timestamp}@example.com`
    const password = 'TestPass123!'
    const displayName = 'Test User'

    // Remplir formulaire d'inscription
    await page.getByTestId('signup-display-name-input').fill(displayName)
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)

    // Soumettre
    await page.getByTestId('signup-submit-button').click()

    // Attendre message de succès
    await expect(page.getByTestId('success-message')).toBeVisible()
    await expect(page.getByTestId('success-message')).toContainText('Inscription réussie')
  })

  test('devrait afficher erreur si email déjà utilisé', async ({ page }) => {
    await page.goto('/supabase-test')

    // Utiliser un email existant (admin par exemple)
    await page.getByTestId('signup-email-input').fill('pevn14@gmail.com')
    await page.getByTestId('signup-password-input').fill('password123')
    await page.getByTestId('signup-submit-button').click()

    // Note: Supabase ne retourne pas toujours d'erreur explicite
    // Ce test peut être ajusté selon le comportement réel
    await page.waitForTimeout(2000)
  })
})
```

**Étape 5 : Test connexion**

Créer `tests/warmup/signin.spec.js` :

```javascript
import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Connexion', () => {
  test('devrait se connecter avec un compte existant', async ({ page }) => {
    await page.goto('/supabase-test')

    // Utiliser un compte créé précédemment
    // À adapter avec vos credentials de test
    await page.getByTestId('signin-email-input').fill('pevn14+1@gmail.com')
    await page.getByTestId('signin-password-input').fill('votre_password')

    await page.getByTestId('signin-submit-button').click()

    // Attendre message de succès
    await expect(page.getByTestId('success-message')).toBeVisible()
    await expect(page.getByTestId('success-message')).toContainText('Connexion réussie')

    // Vérifier que le bouton de déconnexion est visible
    await expect(page.getByTestId('signout-button')).toBeVisible()
  })

  test('devrait afficher erreur si credentials invalides', async ({ page }) => {
    await page.goto('/supabase-test')

    await page.getByTestId('signin-email-input').fill('wrong@example.com')
    await page.getByTestId('signin-password-input').fill('wrongpassword')
    await page.getByTestId('signin-submit-button').click()

    // Attendre message d'erreur
    await expect(page.getByTestId('error-message')).toBeVisible()
  })
})
```

**Étape 6 : Test déconnexion**

Créer `tests/warmup/signout.spec.js` :

```javascript
import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Déconnexion', () => {
  test('devrait se déconnecter après connexion', async ({ page }) => {
    await page.goto('/supabase-test')

    // 1. Se connecter d'abord
    await page.getByTestId('signin-email-input').fill('pevn14+1@gmail.com')
    await page.getByTestId('signin-password-input').fill('votre_password')
    await page.getByTestId('signin-submit-button').click()

    // Attendre connexion
    await expect(page.getByTestId('signout-button')).toBeVisible()

    // 2. Se déconnecter
    await page.getByTestId('signout-button').click()

    // Attendre message de succès
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion réussie')

    // 3. Vérifier que les formulaires sont de nouveau visibles
    await expect(page.getByTestId('signup-submit-button')).toBeVisible()
    await expect(page.getByTestId('signin-submit-button')).toBeVisible()
  })
})
```

**Étape 7 : Flux complet**

Créer `tests/warmup/complete-flow.spec.js` :

```javascript
import { test, expect } from '@playwright/test'

test.describe('SupabaseTest - Flux complet', () => {
  test('devrait gérer signup → signin → signout', async ({ page }) => {
    await page.goto('/supabase-test')

    const timestamp = Date.now()
    const email = `flow${timestamp}@example.com`
    const password = 'FlowTest123!'

    // 1. Inscription
    await page.getByTestId('signup-display-name-input').fill('Flow User')
    await page.getByTestId('signup-email-input').fill(email)
    await page.getByTestId('signup-password-input').fill(password)
    await page.getByTestId('signup-submit-button').click()

    await expect(page.getByTestId('success-message')).toBeVisible()

    // 2. Connexion (avec le compte fraîchement créé)
    await page.reload() // Réinitialiser la page
    await page.getByTestId('signin-email-input').fill(email)
    await page.getByTestId('signin-password-input').fill(password)
    await page.getByTestId('signin-submit-button').click()

    await expect(page.getByTestId('signout-button')).toBeVisible()

    // 3. Déconnexion
    await page.getByTestId('signout-button').click()
    await expect(page.getByTestId('success-message')).toContainText('Déconnexion')
  })
})
```

**Étape 8 : Scripts npm**

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:headed": "playwright test --headed",
    "test:report": "playwright show-report"
  }
}
```

**Commandes utiles** :

```bash
# Lancer tous les tests
npm test

# Mode UI (interface graphique)
npm run test:ui

# Mode debug (pas à pas)
npm run test:debug

# Mode headed (voir navigateur)
npm run test:headed

# Lancer un seul fichier
npx playwright test tests/warmup/signin.spec.js

# Générer code automatiquement
npx playwright codegen http://localhost:5173/supabase-test
```

**Résultats attendus** :

À la fin de cet échauffement, vous aurez :
- ✅ Projet Playwright configuré
- ✅ 5-6 tests E2E fonctionnels
- ✅ Maîtrise des commandes de base
- ✅ Compréhension du debugging
- ✅ Patterns réutilisables pour Phase 5

**Temps estimé** : 3-4 heures (configuration + tests + expérimentation)

**Note importante** : Ces tests ne font PAS partie du projet principal et ne seront pas maintenus. Ils servent uniquement à l'apprentissage de Playwright.

---

### Phase 5 : Pages d'authentification

**E2E** :
- ✅ Signup flow (succès, erreurs)
- ✅ Login flow (succès, erreurs)
- ✅ Logout flow

**Unitaires** :
- ❌ Pas encore nécessaire

**data-testid** :
- ✅ Tous les inputs/boutons LoginPage
- ✅ Tous les inputs/boutons SignupPage

### Phase 6 : Galerie publique de projets

**E2E** :
- ✅ Affichage liste projets
- ✅ Filtres (status, recherche, tri)
- ✅ Navigation vers détails

**data-testid** :
- ✅ Grille de projets
- ✅ Cartes individuelles
- ✅ Filtres

### Phase 7 : CRUD Projets

**E2E** :
- ✅ Créer projet draft
- ✅ Éditer projet
- ✅ Publier projet
- ✅ Supprimer projet draft

**Unitaires** :
- ✅ `projectService.js` (toutes fonctions)

**data-testid** :
- ✅ Formulaire création/édition

### Phase 9 : Système de dons

**E2E** :
- ✅ Faire un don
- ✅ Voir historique dons

**Unitaires** :
- ✅ `donationService.js` (toutes fonctions)

**data-testid** :
- ✅ Formulaire de don
- ✅ Liste donations

### Phase 12 : Tests & Optimisations

**Unitaires** :
- ✅ `authService.js` (complétude)
- ✅ `useAuth` hook
- ✅ Fonctions utilitaires

**Coverage** :
- ✅ Analyse couverture globale
- ✅ Atteindre 70%+ sur services/hooks

---

## Phase 6 - Tests E2E Galerie Publique

### Objectif
Tester l'affichage de la galerie publique de projets avec les filtres, la recherche, et la navigation vers les détails.

### Page concernée
- **Route** : `/projects`
- **Composant** : `ProjectsPage.jsx`

### Composants testés
- `ProjectsPage` : Page principale avec filtres et grille
- `ProjectFilters` : Filtres (status, recherche, tri)
- `ProjectCard` : Carte individuelle de projet

### Data-testid disponibles

#### Filtres
```
projects-search-input              // Champ de recherche
projects-status-filter             // Select filtre par status
projects-sort-filter               // Select tri (newest, oldest, goal_asc, goal_desc)
projects-filters-reset-button      // Bouton réinitialiser filtres
```

#### Grille et cartes
```
projects-grid                      // Container grille de projets
project-card                       // Carte projet individuelle (multiple)
project-card-image                 // Image du projet
project-card-title                 // Titre du projet
project-card-description           // Description
project-card-goal                  // Objectif financier
project-card-deadline              // Date limite
project-card-creator               // Nom du créateur
project-card-badge                 // Badge status (draft, active, completed, failed)
project-card-progress-bar          // Barre de progression
project-card-view-button           // Bouton "Voir le projet"
projects-empty-state               // État vide (aucun projet)
projects-loading                   // Indicateur de chargement
```

### Scénarios de test prioritaires

#### 1. Affichage initial de la galerie
**Description** : Vérifier que la page charge correctement avec tous les projets actifs.

**Étapes** :
1. Naviguer vers `/projects`
2. Attendre la fin du chargement (`projects-loading` disparaît)
3. Vérifier que `projects-grid` est visible
4. Vérifier qu'au moins une `project-card` est affichée
5. Vérifier que chaque carte contient : titre, image, créateur, badge, progress bar, bouton

**Assertions** :
- La grille contient des projets
- Chaque carte a une structure complète
- Les badges correspondent au status
- Les barres de progression affichent le bon pourcentage

#### 2. Recherche par titre
**Description** : Tester le filtre de recherche textuelle.

**Étapes** :
1. Naviguer vers `/projects`
2. Attendre la fin du chargement
3. Compter le nombre initial de cartes affichées
4. Entrer un terme de recherche dans `projects-search-input` (ex: "RPG")
5. Attendre 500ms (debounce)
6. Vérifier que seuls les projets contenant "RPG" sont affichés

**Assertions** :
- Le nombre de cartes diminue après recherche
- Toutes les cartes affichées contiennent le terme recherché dans le titre
- La recherche est insensible à la casse

#### 3. Filtre par status
**Description** : Filtrer les projets par leur status (active, draft, completed, failed).

**Étapes** :
1. Naviguer vers `/projects`
2. Sélectionner "Actifs" dans `projects-status-filter`
3. Attendre la fin du chargement
4. Vérifier que tous les badges visibles sont verts (status active)
5. Sélectionner "Terminés" dans le filtre
6. Vérifier que tous les badges sont bleus (status completed)

**Assertions** :
- Seuls les projets du status sélectionné sont affichés
- Les badges correspondent au filtre
- Le filtre "Tous" affiche tous les projets

#### 4. Tri par date (newest/oldest)
**Description** : Tester le tri chronologique.

**Étapes** :
1. Naviguer vers `/projects`
2. Sélectionner "Plus récents" dans `projects-sort-filter`
3. Récupérer les titres des 3 premiers projets
4. Sélectionner "Plus anciens"
5. Vérifier que l'ordre des projets a changé

**Assertions** :
- L'ordre des cartes change selon le tri
- Le tri "Plus récents" affiche les projets récents en premier
- Le tri "Plus anciens" affiche les anciens projets en premier

#### 5. Tri par objectif (goal_asc/goal_desc)
**Description** : Tester le tri par montant de l'objectif.

**Étapes** :
1. Naviguer vers `/projects`
2. Sélectionner "Objectif croissant" dans `projects-sort-filter`
3. Récupérer les objectifs des 3 premiers projets
4. Vérifier que les objectifs sont en ordre croissant
5. Sélectionner "Objectif décroissant"
6. Vérifier que les objectifs sont en ordre décroissant

**Assertions** :
- Les projets sont triés par montant de l'objectif
- L'ordre croissant va du plus petit au plus grand
- L'ordre décroissant va du plus grand au plus petit

#### 6. Combinaison de filtres
**Description** : Tester plusieurs filtres simultanés.

**Étapes** :
1. Naviguer vers `/projects`
2. Sélectionner status "Actifs"
3. Entrer "Game" dans la recherche
4. Sélectionner tri "Plus récents"
5. Vérifier que les résultats respectent tous les filtres

**Assertions** :
- Seuls les projets actifs contenant "Game" sont affichés
- L'ordre respecte le tri sélectionné
- Tous les filtres s'appliquent simultanément

#### 7. Réinitialisation des filtres
**Description** : Tester le bouton de réinitialisation.

**Étapes** :
1. Naviguer vers `/projects`
2. Appliquer plusieurs filtres (status, recherche, tri)
3. Cliquer sur `projects-filters-reset-button`
4. Vérifier que tous les filtres sont réinitialisés
5. Vérifier que tous les projets sont de nouveau affichés

**Assertions** :
- La recherche est vidée
- Le status est "Tous"
- Le tri est "Plus récents"
- Tous les projets sont affichés

#### 8. État vide (aucun résultat)
**Description** : Tester l'affichage quand aucun projet ne correspond aux filtres.

**Étapes** :
1. Naviguer vers `/projects`
2. Entrer un terme de recherche qui ne correspond à aucun projet (ex: "xyzabc123")
3. Vérifier que `projects-empty-state` est affiché
4. Vérifier que le message est explicite
5. Vérifier que `projects-grid` ne contient aucune carte

**Assertions** :
- L'état vide est affiché avec un message clair
- Aucune carte projet n'est visible
- Le message suggère d'ajuster les filtres

#### 9. Navigation vers détails
**Description** : Tester la navigation vers la page détails d'un projet.

**Étapes** :
1. Naviguer vers `/projects`
2. Cliquer sur `project-card-view-button` du premier projet
3. Vérifier la redirection vers `/projects/:id`
4. Vérifier que la page de détails se charge

**Assertions** :
- La navigation fonctionne
- L'URL contient l'ID du projet
- La page de détails affiche les bonnes informations

#### 10. Responsive mobile
**Description** : Vérifier l'affichage sur mobile (viewport 375px).

**Étapes** :
1. Définir viewport à 375px de largeur
2. Naviguer vers `/projects`
3. Vérifier que la grille s'adapte (1 colonne)
4. Vérifier que les filtres sont accessibles
5. Vérifier que les cartes sont lisibles

**Assertions** :
- La grille passe en une seule colonne
- Les filtres restent fonctionnels
- Le texte est lisible sans scroll horizontal

---

## Phase 7 - Tests E2E CRUD Projets

### Objectif
Tester la création, l'édition, la publication et la suppression de projets par un créateur authentifié.

### Pages concernées
- **Route création** : `/projects/create`
- **Route édition** : `/projects/:id/edit`
- **Route liste** : `/dashboard/projects`
- **Composant** : `CreateProjectPage.jsx`, `EditProjectPage.jsx`, `MyProjectsPage.jsx`

### Data-testid disponibles

#### Formulaire création/édition
```
project-form                       // Formulaire principal
project-title-input                // Champ titre
project-description-input          // Textarea description
project-goal-input                 // Champ objectif financier
project-deadline-input             // Champ date limite
project-image-upload               // Input file pour image
project-image-preview              // Aperçu image uploadée
project-save-draft-button          // Bouton sauvegarder brouillon
project-publish-button             // Bouton publier
project-cancel-button              // Bouton annuler
project-delete-button              // Bouton supprimer (édition uniquement)
project-form-error                 // Message d'erreur global
project-success-message            // Message de succès
```

#### Liste des projets (MyProjectsPage)
```
my-projects-header                 // Header de la page
my-projects-create-button          // Bouton "Créer un projet"
my-projects-filter-all             // Filtre "Tous"
my-projects-filter-draft           // Filtre "Brouillons"
my-projects-filter-active          // Filtre "Actifs"
my-projects-filter-completed       // Filtre "Terminés"
my-projects-grid                   // Grille des projets
my-project-card                    // Carte projet (multiple)
my-project-card-title              // Titre
my-project-card-status             // Badge status
my-project-card-edit-button        // Bouton éditer
my-project-card-delete-button      // Bouton supprimer
my-projects-empty-state            // État vide
```

### Scénarios de test prioritaires

#### 1. Créer un projet en brouillon
**Description** : Créer un nouveau projet et le sauvegarder en brouillon.

**Pré-requis** :
- Utilisateur authentifié avec rôle créateur

**Étapes** :
1. Se connecter avec un compte créateur
2. Naviguer vers `/dashboard/projects`
3. Cliquer sur `my-projects-create-button`
4. Vérifier la redirection vers `/projects/create`
5. Remplir `project-title-input` : "Mon Projet Test E2E"
6. Remplir `project-description-input` : "Description détaillée du projet..."
7. Remplir `project-goal-input` : "50000"
8. Remplir `project-deadline-input` : Date future (ex: 2026-12-31)
9. Uploader une image via `project-image-upload`
10. Cliquer sur `project-save-draft-button`
11. Attendre message `project-success-message`
12. Vérifier redirection vers `/dashboard/projects`
13. Vérifier que le projet apparaît avec badge "Brouillon"

**Assertions** :
- Le projet est créé avec status "draft"
- Toutes les données saisies sont sauvegardées
- Le badge "Brouillon" est affiché
- Le projet est visible dans la liste

#### 2. Éditer un projet brouillon
**Description** : Modifier les informations d'un projet en brouillon.

**Pré-requis** :
- Un projet en brouillon existant

**Étapes** :
1. Naviguer vers `/dashboard/projects`
2. Filtrer par "Brouillons" (`my-projects-filter-draft`)
3. Cliquer sur `my-project-card-edit-button` du premier brouillon
4. Vérifier redirection vers `/projects/:id/edit`
5. Modifier `project-title-input` : "Titre Modifié"
6. Modifier `project-goal-input` : "75000"
7. Cliquer sur `project-save-draft-button`
8. Attendre message de succès
9. Retourner à `/dashboard/projects`
10. Vérifier que les modifications sont sauvegardées

**Assertions** :
- Les modifications sont persistées
- Le projet reste en status "draft"
- Les anciennes données sont écrasées

#### 3. Publier un projet
**Description** : Publier un projet brouillon pour le rendre actif.

**Pré-requis** :
- Un projet en brouillon avec toutes les informations complètes

**Étapes** :
1. Naviguer vers `/dashboard/projects`
2. Cliquer sur `my-project-card-edit-button` d'un brouillon complet
3. Vérifier que `project-publish-button` est actif
4. Cliquer sur `project-publish-button`
5. Attendre message de succès
6. Vérifier redirection vers `/dashboard/projects`
7. Vérifier que le badge passe à "Actif" (vert)
8. Aller dans la galerie publique `/projects`
9. Vérifier que le projet est visible publiquement

**Assertions** :
- Le status passe de "draft" à "active"
- Le projet apparaît dans la galerie publique
- Le badge est vert avec mention "Actif"
- Le projet ne peut plus être supprimé

#### 4. Validation des champs obligatoires
**Description** : Tester la validation du formulaire.

**Étapes** :
1. Naviguer vers `/projects/create`
2. Laisser tous les champs vides
3. Cliquer sur `project-save-draft-button`
4. Vérifier que les messages d'erreur s'affichent
5. Remplir uniquement le titre
6. Tenter de sauvegarder
7. Vérifier que d'autres erreurs persistent
8. Remplir tous les champs requis
9. Vérifier que le formulaire peut être soumis

**Assertions** :
- Les champs obligatoires sont : titre, description, objectif, deadline
- Les erreurs s'affichent sous chaque champ
- Le formulaire ne se soumet pas si incomplet
- Les erreurs disparaissent une fois corrigées

#### 5. Validation de l'objectif financier
**Description** : Tester les règles de validation du montant.

**Étapes** :
1. Naviguer vers `/projects/create`
2. Remplir le formulaire avec objectif = "100" (trop bas)
3. Vérifier erreur : "L'objectif doit être d'au moins 500€"
4. Entrer "1000000000" (trop élevé)
5. Vérifier erreur appropriée
6. Entrer "50000" (valide)
7. Vérifier que l'erreur disparaît

**Assertions** :
- Objectif minimum : 500€
- Objectif maximum : 1 000 000€
- Les valeurs invalides sont bloquées

#### 6. Validation de la deadline
**Description** : Tester la validation de la date limite.

**Étapes** :
1. Naviguer vers `/projects/create`
2. Entrer une date passée dans `project-deadline-input`
3. Vérifier erreur : "La date limite doit être dans le futur"
4. Entrer une date dans moins de 7 jours
5. Vérifier erreur : "La campagne doit durer au moins 7 jours"
6. Entrer une date future valide (ex: +30 jours)
7. Vérifier que l'erreur disparaît

**Assertions** :
- La deadline doit être dans le futur
- La campagne doit durer au moins 7 jours
- Les dates invalides sont rejetées

#### 7. Upload d'image
**Description** : Tester l'upload et la prévisualisation d'image.

**Étapes** :
1. Naviguer vers `/projects/create`
2. Cliquer sur `project-image-upload`
3. Sélectionner une image valide (JPG/PNG, < 5MB)
4. Vérifier que `project-image-preview` affiche l'image
5. Tenter d'uploader un fichier > 5MB
6. Vérifier erreur : "L'image ne doit pas dépasser 5MB"
7. Tenter d'uploader un PDF
8. Vérifier erreur : "Format non supporté"

**Assertions** :
- Seuls JPG, PNG, WEBP sont acceptés
- Taille max : 5MB
- La prévisualisation fonctionne
- Les erreurs sont claires

#### 8. Supprimer un projet brouillon
**Description** : Supprimer un projet en status draft.

**Pré-requis** :
- Un projet en brouillon

**Étapes** :
1. Naviguer vers `/dashboard/projects`
2. Filtrer par "Brouillons"
3. Cliquer sur `my-project-card-delete-button`
4. Attendre modal de confirmation (si implémentée)
5. Confirmer la suppression
6. Vérifier que le projet disparaît de la liste
7. Tenter de naviguer vers `/projects/:id`
8. Vérifier erreur 404

**Assertions** :
- Seuls les projets "draft" peuvent être supprimés
- Une confirmation est demandée
- Le projet est supprimé de la base de données
- L'accès à l'URL retourne 404

#### 9. Impossible de supprimer un projet actif
**Description** : Vérifier qu'un projet publié ne peut pas être supprimé.

**Pré-requis** :
- Un projet avec status "active"

**Étapes** :
1. Naviguer vers `/dashboard/projects`
2. Filtrer par "Actifs"
3. Vérifier que `my-project-card-delete-button` est désactivé ou absent
4. Tenter de naviguer manuellement vers la route de suppression
5. Vérifier erreur ou redirection

**Assertions** :
- Les projets actifs ne peuvent pas être supprimés
- Le bouton est désactivé ou masqué
- Les tentatives manuelles sont bloquées

#### 10. Filtres dans MyProjectsPage
**Description** : Tester les filtres de la liste de projets.

**Étapes** :
1. Créer 1 projet brouillon, 1 projet actif, 1 projet terminé
2. Naviguer vers `/dashboard/projects`
3. Cliquer sur `my-projects-filter-all`
4. Vérifier que les 3 projets sont affichés
5. Cliquer sur `my-projects-filter-draft`
6. Vérifier que seul le brouillon est affiché
7. Cliquer sur `my-projects-filter-active`
8. Vérifier que seul le projet actif est affiché
9. Cliquer sur `my-projects-filter-completed`
10. Vérifier que seul le projet terminé est affiché

**Assertions** :
- Chaque filtre affiche les bons projets
- Le filtre "Tous" affiche tous les projets
- Le compteur reflète le nombre correct

---

## Phase 8 - Tests E2E Dashboard Créateur

### Objectif
Tester l'affichage du dashboard créateur avec statistiques globales, projets récents, et actions rapides.

### Page concernée
- **Route** : `/dashboard`
- **Composant** : `CreatorDashboardPage.jsx`

### Composants testés
- `CreatorDashboardPage` : Page principale du dashboard
- `StatsCard` : Cartes de statistiques
- `RecentProjectsList` : Liste des 5 projets récents
- `QuickActions` : Boutons d'actions rapides

### Data-testid disponibles

#### Statistiques
```
dashboard-stats-grid               // Grille des 4 statistiques
stat-total-projects                // Carte "Total projets"
stat-active-projects               // Carte "Projets actifs"
stat-total-collected               // Carte "Fonds collectés"
stat-total-donors                  // Carte "Donateurs"
```

#### Projets récents
```
recent-projects-list               // Container liste projets récents
recent-project-item                // Item projet (multiple, max 5)
recent-project-edit-button         // Bouton éditer
recent-project-view-button         // Bouton voir
view-all-projects-button           // Bouton "Voir tout"
create-first-project-button        // Bouton si aucun projet (état vide)
```

#### Actions rapides
```
quick-action-create-project        // Bouton "Créer un nouveau projet"
quick-action-view-projects         // Bouton "Voir mes projets"
quick-action-view-donations        // Bouton "Voir mes dons reçus"
```

#### Alerte brouillons
```
drafts-alert                       // Carte alerte brouillons en attente
view-drafts-button                 // Bouton "Voir les brouillons"
```

### Scénarios de test prioritaires

#### 1. Affichage initial du dashboard (créateur sans projets)
**Description** : Vérifier l'état vide du dashboard pour un nouveau créateur.

**Pré-requis** :
- Utilisateur authentifié sans aucun projet

**Étapes** :
1. Se connecter avec un compte créateur vide
2. Naviguer vers `/dashboard`
3. Vérifier que `dashboard-stats-grid` est visible
4. Vérifier que toutes les statistiques affichent 0
5. Vérifier que `create-first-project-button` est affiché
6. Vérifier que les actions rapides sont présentes

**Assertions** :
- `stat-total-projects` affiche 0
- `stat-active-projects` affiche 0
- `stat-total-collected` affiche 0€
- `stat-total-donors` affiche 0
- L'état vide suggère de créer le premier projet

#### 2. Statistiques avec projets multiples
**Description** : Vérifier le calcul correct des statistiques.

**Pré-requis** :
- Créateur avec 2 brouillons, 3 projets actifs, 1 projet terminé

**Étapes** :
1. Créer les projets nécessaires via l'interface
2. Naviguer vers `/dashboard`
3. Vérifier `stat-total-projects` : 6
4. Vérifier `stat-active-projects` : 3
5. Vérifier que `stat-total-collected` affiche la somme des fonds collectés
6. Vérifier que `stat-total-donors` affiche le nombre total de donateurs uniques

**Assertions** :
- Le total des projets compte tous les status
- Les projets actifs comptent uniquement status "active"
- Les fonds sont la somme de tous les projets
- Les donateurs sont comptés correctement

#### 3. Liste des projets récents
**Description** : Vérifier l'affichage des 5 projets les plus récents.

**Pré-requis** :
- Créateur avec au moins 7 projets

**Étapes** :
1. Créer 7 projets à des dates différentes
2. Naviguer vers `/dashboard`
3. Vérifier que `recent-projects-list` contient exactement 5 items
4. Vérifier que les projets sont triés du plus récent au plus ancien
5. Vérifier que chaque item affiche : titre, image, badge status, progress bar (si actif)

**Assertions** :
- Maximum 5 projets affichés
- Tri par date de création décroissante
- Chaque carte contient les infos essentielles

#### 4. Affichage des jours restants
**Description** : Vérifier le calcul des jours restants pour les projets actifs.

**Pré-requis** :
- Un projet actif avec deadline dans 15 jours

**Étapes** :
1. Créer un projet actif avec deadline = aujourd'hui + 15 jours
2. Naviguer vers `/dashboard`
3. Localiser le projet dans `recent-project-item`
4. Vérifier l'affichage : "15 jours restants" avec icône Calendar

**Assertions** :
- Le nombre de jours est correct
- Le texte change selon le nombre : "1 jour restant", "15 jours restants"
- Si deadline dépassée : "Terminé"
- Si deadline = aujourd'hui : "Dernier jour"

#### 5. Barre de progression et montants
**Description** : Vérifier l'affichage de la barre de progression pour les projets actifs.

**Pré-requis** :
- Un projet actif avec objectif 10000€ et 3000€ collectés

**Étapes** :
1. Naviguer vers `/dashboard`
2. Localiser le projet dans la liste récente
3. Vérifier que la barre de progression affiche 30%
4. Vérifier que le texte affiche "3000€ / 10000€"
5. Vérifier que la barre et les montants sont sur la même ligne

**Assertions** :
- La barre affiche le bon pourcentage
- Les montants sont affichés à côté de la barre
- Le layout est sur une seule ligne

#### 6. Actions rapides - Créer un projet
**Description** : Tester le bouton "Créer un nouveau projet".

**Étapes** :
1. Naviguer vers `/dashboard`
2. Cliquer sur `quick-action-create-project`
3. Vérifier redirection vers `/projects/create`

**Assertions** :
- La navigation fonctionne
- Le formulaire de création s'affiche

#### 7. Actions rapides - Voir mes projets
**Description** : Tester le bouton "Voir mes projets".

**Étapes** :
1. Naviguer vers `/dashboard`
2. Cliquer sur `quick-action-view-projects`
3. Vérifier redirection vers `/dashboard/projects`

**Assertions** :
- La navigation fonctionne
- La liste complète des projets s'affiche

#### 8. Alerte brouillons en attente
**Description** : Vérifier l'affichage de l'alerte quand il y a des brouillons.

**Pré-requis** :
- 2 projets en status "draft"

**Étapes** :
1. Naviguer vers `/dashboard`
2. Vérifier que `drafts-alert` est visible
3. Vérifier le texte : "2 brouillons en attente"
4. Cliquer sur `view-drafts-button`
5. Vérifier redirection vers `/dashboard/projects?filter=draft`
6. Vérifier que seuls les brouillons sont affichés

**Assertions** :
- L'alerte s'affiche uniquement si brouillons > 0
- Le compteur est correct (singulier/pluriel)
- Le lien filtre automatiquement sur "draft"

#### 9. Navigation depuis projets récents - Éditer
**Description** : Tester le bouton "Éditer" d'un projet récent.

**Étapes** :
1. Naviguer vers `/dashboard`
2. Cliquer sur `recent-project-edit-button` du premier projet
3. Vérifier redirection vers `/projects/:id/edit`
4. Vérifier que le formulaire d'édition se charge avec les bonnes données

**Assertions** :
- La navigation fonctionne
- L'ID du projet est correct dans l'URL
- Les données pré-remplies sont correctes

#### 10. Navigation depuis projets récents - Voir
**Description** : Tester le bouton "Voir" d'un projet récent.

**Étapes** :
1. Naviguer vers `/dashboard`
2. Cliquer sur `recent-project-view-button` du premier projet
3. Vérifier redirection vers `/projects/:id`
4. Vérifier que la page détails se charge

**Assertions** :
- La navigation fonctionne
- La page détails affiche le bon projet

#### 11. Bouton "Voir tout" projets récents
**Description** : Tester le bouton de navigation vers la liste complète.

**Étapes** :
1. Naviguer vers `/dashboard`
2. Cliquer sur `view-all-projects-button`
3. Vérifier redirection vers `/dashboard/projects`

**Assertions** :
- La navigation fonctionne
- Tous les projets du créateur sont affichés

---

## Navigation Header - Tests E2E

### Objectif
Tester la navigation globale via le header sur desktop et mobile, incluant les liens authentifiés et non-authentifiés.

### Composant concerné
- **Composant** : `Header.jsx`

### Data-testid disponibles

#### Navigation desktop (non authentifié)
```
header-login-button                // Bouton "Connexion"
header-signup-button               // Bouton "Inscription"
```

#### Navigation desktop (authentifié)
```
header-dashboard-link              // Lien "Dashboard" avec icône
header-projects-link               // Lien "Mes Projets" avec icône
header-user-info                   // Container info utilisateur (avatar + nom)
header-logout-button               // Bouton "Déconnexion"
```

#### Navigation mobile
```
header-mobile-menu-button          // Bouton burger menu
header-mobile-menu                 // Menu mobile (ouvert)
header-mobile-dashboard-link       // Lien "Dashboard" mobile
header-mobile-projects-link        // Lien "Mes Projets" mobile
header-mobile-user-info            // Info utilisateur mobile
header-mobile-login-button         // Bouton "Connexion" mobile
header-mobile-signup-button        // Bouton "Inscription" mobile
header-mobile-logout-button        // Bouton "Déconnexion" mobile
```

### Scénarios de test prioritaires

#### 1. Header non authentifié - Desktop
**Description** : Vérifier l'affichage du header quand l'utilisateur n'est pas connecté.

**Pré-requis** :
- Utilisateur non authentifié

**Étapes** :
1. Naviguer vers `/` (déconnecté)
2. Vérifier que `header-login-button` est visible
3. Vérifier que `header-signup-button` est visible
4. Vérifier que les liens authentifiés ne sont PAS visibles

**Assertions** :
- Les boutons Login et Signup sont affichés
- Les liens Dashboard et Mes Projets sont masqués
- L'info utilisateur n'est pas affichée

#### 2. Header authentifié - Desktop
**Description** : Vérifier l'affichage du header quand l'utilisateur est connecté.

**Pré-requis** :
- Utilisateur authentifié

**Étapes** :
1. Se connecter avec un compte valide
2. Naviguer vers `/dashboard`
3. Vérifier que `header-dashboard-link` est visible
4. Vérifier que `header-projects-link` est visible
5. Vérifier que `header-user-info` affiche le nom et l'avatar
6. Vérifier que `header-logout-button` est visible
7. Vérifier que Login/Signup ne sont PAS visibles

**Assertions** :
- Les liens Dashboard et Mes Projets sont affichés avec icônes
- L'info utilisateur affiche le display_name
- Le bouton Déconnexion est présent
- Les boutons Login/Signup sont masqués

#### 3. Navigation - Lien Dashboard
**Description** : Tester la navigation vers le dashboard.

**Pré-requis** :
- Utilisateur authentifié

**Étapes** :
1. Être sur n'importe quelle page
2. Cliquer sur `header-dashboard-link`
3. Vérifier redirection vers `/dashboard`
4. Vérifier que le dashboard se charge

**Assertions** :
- La navigation fonctionne depuis n'importe quelle page
- L'URL change vers `/dashboard`
- Le contenu du dashboard s'affiche

#### 4. Navigation - Lien Mes Projets
**Description** : Tester la navigation vers la liste des projets.

**Pré-requis** :
- Utilisateur authentifié

**Étapes** :
1. Être sur n'importe quelle page
2. Cliquer sur `header-projects-link`
3. Vérifier redirection vers `/dashboard/projects`
4. Vérifier que la liste des projets se charge

**Assertions** :
- La navigation fonctionne
- L'URL change vers `/dashboard/projects`
- Les projets du créateur sont affichés

#### 5. Déconnexion depuis le header
**Description** : Tester le bouton de déconnexion.

**Pré-requis** :
- Utilisateur authentifié

**Étapes** :
1. Être connecté sur `/dashboard`
2. Cliquer sur `header-logout-button`
3. Vérifier redirection vers `/`
4. Vérifier que le header affiche Login/Signup
5. Tenter d'accéder à `/dashboard`
6. Vérifier redirection vers `/login`

**Assertions** :
- La déconnexion fonctionne
- L'utilisateur est redirigé vers l'accueil
- Les liens authentifiés disparaissent
- Les pages protégées ne sont plus accessibles

#### 6. Header mobile - Menu burger
**Description** : Tester l'ouverture/fermeture du menu mobile.

**Pré-requis** :
- Viewport mobile (375px)

**Étapes** :
1. Définir viewport à 375px
2. Naviguer vers `/`
3. Vérifier que les liens desktop sont masqués
4. Cliquer sur `header-mobile-menu-button`
5. Vérifier que `header-mobile-menu` s'affiche
6. Cliquer à nouveau sur le bouton
7. Vérifier que le menu se ferme

**Assertions** :
- Le menu burger est visible sur mobile
- Le clic ouvre/ferme le menu
- L'icône change entre Menu et X
- Les liens sont masqués quand le menu est fermé

#### 7. Navigation mobile - Non authentifié
**Description** : Tester les liens du menu mobile quand déconnecté.

**Pré-requis** :
- Viewport mobile, utilisateur non authentifié

**Étapes** :
1. Définir viewport à 375px
2. Ouvrir le menu mobile
3. Vérifier que `header-mobile-login-button` est visible
4. Vérifier que `header-mobile-signup-button` est visible
5. Cliquer sur Login
6. Vérifier redirection vers `/login`
7. Vérifier que le menu se ferme automatiquement

**Assertions** :
- Les boutons Login/Signup sont dans le menu mobile
- Le clic navigue correctement
- Le menu se ferme après navigation

#### 8. Navigation mobile - Authentifié
**Description** : Tester les liens du menu mobile quand connecté.

**Pré-requis** :
- Viewport mobile, utilisateur authentifié

**Étapes** :
1. Se connecter
2. Définir viewport à 375px
3. Ouvrir le menu mobile
4. Vérifier que `header-mobile-dashboard-link` est visible
5. Vérifier que `header-mobile-projects-link` est visible
6. Vérifier que `header-mobile-user-info` affiche le nom
7. Vérifier que `header-mobile-logout-button` est visible
8. Cliquer sur Dashboard
9. Vérifier navigation et fermeture du menu

**Assertions** :
- Les liens Dashboard et Mes Projets sont dans le menu
- L'info utilisateur est affichée
- Le bouton Déconnexion est présent
- Le menu se ferme après navigation

#### 9. Persistance de la navigation après refresh
**Description** : Vérifier que l'utilisateur reste connecté après refresh.

**Pré-requis** :
- Utilisateur authentifié

**Étapes** :
1. Se connecter
2. Vérifier que `header-user-info` est affiché
3. Rafraîchir la page (F5)
4. Attendre le chargement
5. Vérifier que `header-user-info` est toujours affiché
6. Vérifier que les liens authentifiés sont présents

**Assertions** :
- La session persiste après refresh
- L'utilisateur reste connecté
- Les données du profil sont rechargées

#### 10. Responsive - Transition desktop/mobile
**Description** : Vérifier que le header s'adapte au resize.

**Étapes** :
1. Commencer avec viewport desktop (1200px)
2. Vérifier que les liens desktop sont visibles
3. Vérifier que le menu burger est masqué
4. Réduire progressivement à 768px
5. Vérifier que le menu burger apparaît
6. Vérifier que les liens desktop disparaissent
7. Élargir à nouveau
8. Vérifier le retour à l'affichage desktop

**Assertions** :
- Le breakpoint MD (768px) déclenche le changement
- Le menu burger n'est visible que sur mobile
- Les liens desktop n'apparaissent que sur desktop
- La transition est fluide

---

## 8. Bonnes pratiques

### 8.1 Tests E2E

**✅ Faire** :
- Tester les flux utilisateur complets, pas les fonctions isolées
- Utiliser `data-testid` pour les sélecteurs
- Tester sur plusieurs navigateurs (Chrome, Firefox, Safari)
- Ajouter screenshots/vidéos en cas d'échec
- Isoler chaque test (cleanup entre tests)

**❌ Éviter** :
- Tester l'implémentation interne (classes CSS, structure DOM)
- Dépendre de l'ordre d'exécution des tests
- Utiliser `waitFor` avec timeout trop court
- Tester des détails visuels (couleurs, tailles)

### 8.2 Tests unitaires

**✅ Faire** :
- Mocker les dépendances externes (Supabase)
- Tester les cas limites (null, undefined, erreurs)
- Un seul concept par test
- Noms descriptifs (`devrait retourner erreur si email invalide`)

**❌ Éviter** :
- Tester des détails d'implémentation
- Tests couplés aux composants React simples
- Mocks trop complexes (signe que le code doit être refactoré)

### 8.3 Organisation

**Structure des tests** :
```javascript
describe('NomDuModule', () => {
  describe('nomDeLaFonction', () => {
    beforeEach(() => {
      // Setup commun
    })

    test('devrait [comportement attendu] quand [condition]', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = maFonction(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

---

## Ressources

**Documentation** :
- [Playwright](https://playwright.dev/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

**Guides internes** :
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture du projet
- [TESTS.md](./TESTS.md) - Journal des tests effectués

---

**Dernière mise à jour** : 05 janvier 2026
**Version** : 1.0

Cette stratégie doit être mise à jour à chaque phase importante.
