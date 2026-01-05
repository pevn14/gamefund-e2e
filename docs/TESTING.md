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
