# Guide de Configuration des Fixtures

Guide pas-à-pas pour configurer le système de fixtures pour les tests E2E.

---

## 🎯 Objectif

Mettre en place un système de **comptes de test obligatoires et contrôlés** pour:
- Éliminer les emails générés aléatoirement (qui causent des bounces Supabase)
- Utiliser uniquement des emails réels définis dans `.env`
- Forcer la configuration complète avant de lancer les tests

## 📦 Ce qui a été créé

```
gamefund-e2e/
├── fixtures/
│   ├── test-users.js      # Définitions des utilisateurs (validation stricte)
│   └── README.md          # Documentation des fixtures
├── .env.example           # Template de configuration
├── .env                   # Votre configuration (⚠️ OBLIGATOIRE, ne sera pas commité)
└── tests/
    └── warmup/
        ├── 01-page-load.spec.js
        ├── 02-database-connection.spec.js
        ├── 03-signup.spec.js
        └── 04-signin-signout.spec.js
```

## 🚀 Configuration en 3 Étapes

### Étape 1: Créer le fichier .env avec TOUS les comptes requis

Le fichier `.env` doit contenir **deux comptes obligatoires**:

```bash
# Créer le fichier .env à la racine du projet
nano .env
```

Ajouter **TOUTES** les variables suivantes:

```env
# ====================================
# COMPTE CONFIRMÉ (doit exister dans Supabase)
# ====================================
TEST_USER_EMAIL=votre-email-confirme@gmail.com
TEST_USER_PASSWORD=VotreMotDePasseConfirmé
TEST_USER_DISPLAY_NAME=Votre Nom

# ====================================
# NOUVEAU COMPTE (NE DOIT PAS exister dans Supabase)
# ====================================
TEST_NEW_USER_EMAIL=votre-second-email@gmail.com
TEST_NEW_USER_PASSWORD=TestPass123!
TEST_NEW_USER_DISPLAY_NAME=New Test User
```

**⚠️ IMPORTANT**:
- Utilisez des **vraies adresses email que vous possédez** (pour éviter les bounces)
- `TEST_USER_EMAIL` doit être un compte existant et confirmé dans Supabase
- `TEST_NEW_USER_EMAIL` doit être un compte qui n'existe PAS encore dans Supabase

### Étape 2: Créer le compte confirmé dans Supabase

Le compte `TEST_USER_EMAIL` doit être créé manuellement et confirmé:

1. **Créer le compte**:
   ```bash
   # Aller sur la page de test
   http://localhost:5173/supabase-test

   # S'inscrire avec:
   # - Email: (votre TEST_USER_EMAIL)
   # - Password: (votre TEST_USER_PASSWORD)
   # - Display Name: (votre TEST_USER_DISPLAY_NAME)
   ```

2. **Confirmer l'email**:
   - Ouvrir votre boîte email
   - Cliquer sur le lien de confirmation Supabase
   - ✅ Le compte est maintenant confirmé

3. **Vérifier la connexion**:
   ```bash
   # Retourner sur http://localhost:5173/supabase-test
   # Essayer de se connecter avec vos credentials

   # Si ça fonctionne → tout est bon ✅
   # Si erreur "Email not confirmed" → cliquer à nouveau sur le lien
   # Si erreur "Invalid credentials" → vérifier le mot de passe dans .env
   ```

### Étape 3: Tester que tout fonctionne

```bash
# Lancer tous les tests warmup
npx playwright test tests/warmup/

# Ou en mode UI pour voir ce qui se passe
npm run test:ui
```

**⚠️ Si les variables .env sont manquantes**, les tests s'arrêteront immédiatement avec:
```
⚠️ Configuration OBLIGATOIRE manquante dans .env

Les variables suivantes DOIVENT être définies:
- TEST_USER_EMAIL
- TEST_USER_PASSWORD
- TEST_USER_DISPLAY_NAME
```

**Ordre d'exécution des tests** (numérotés pour s'exécuter dans l'ordre):
- ✅ 01-page-load.spec.js - Tests de chargement de page
- ✅ 02-database-connection.spec.js - Tests de connexion BDD
- ✅ 03-signup.spec.js - Tests d'inscription (utilise NEW_USER)
- ✅ 04-signin-signout.spec.js - Tests de connexion/déconnexion (utilise CONFIRMED_USER)

---

## 📝 Comment ça marche

### Structure des fixtures (avec validation stricte)

Le fichier [fixtures/test-users.js](../fixtures/test-users.js) valide et exporte les utilisateurs:

```javascript
// ⚠️ VALIDATION STRICTE: Les tests s'arrêtent si .env incomplet
if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD || !process.env.TEST_USER_DISPLAY_NAME) {
  throw new Error('Configuration OBLIGATOIRE manquante dans .env')
}

// 1. Compte confirmé (pour tests de connexion)
export const CONFIRMED_USER = {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,
  displayName: process.env.TEST_USER_DISPLAY_NAME
}

// 2. Nouveau compte (pour tests d'inscription)
export const NEW_USER = {
  email: process.env.TEST_NEW_USER_EMAIL,
  password: process.env.TEST_NEW_USER_PASSWORD,
  displayName: process.env.TEST_NEW_USER_DISPLAY_NAME
}

// 3. Utilisateurs invalides (basés sur les comptes .env)
export const INVALID_USERS = {
  wrongCredentials: {
    email: process.env.TEST_USER_EMAIL,
    password: 'WrongPassword123!',  // ← Mauvais mot de passe
    displayName: 'Wrong Credentials User'
  },
  invalidEmailFormat: {
    email: process.env.TEST_NEW_USER_EMAIL?.replace('@', 'AT'),
    password: 'Passxxxx!',
    displayName: 'Invalid Email User'
  }
}
```

**🚫 Plus de génération aléatoire d'emails** - Tous les emails proviennent du `.env`

### Utilisation dans les tests

```javascript
import { CONFIRMED_USER, NEW_USER, INVALID_USERS } from '../../fixtures/test-users.js'

// Test de connexion avec compte confirmé
test('devrait se connecter avec un compte confirmé', async ({ page }) => {
  await page.getByTestId('signin-email-input').fill(CONFIRMED_USER.email)
  await page.getByTestId('signin-password-input').fill(CONFIRMED_USER.password)
  await page.getByTestId('signin-submit-button').click()
  // ✅ Connexion réussie
})

// Test d'inscription avec nouveau compte
test('devrait créer un nouveau compte', async ({ page }) => {
  await page.getByTestId('signup-email-input').fill(NEW_USER.email)
  await page.getByTestId('signup-password-input').fill(NEW_USER.password)
  await page.getByTestId('signup-display-name-input').fill(NEW_USER.displayName)
  await page.getByTestId('signup-submit-button').click()
  // ✅ Inscription réussie (email de confirmation envoyé à NEW_USER.email)
})

// Test avec credentials invalides
test('devrait afficher erreur si credentials invalides', async ({ page }) => {
  const wrongUser = INVALID_USERS.wrongCredentials
  await page.getByTestId('signin-email-input').fill(wrongUser.email)
  await page.getByTestId('signin-password-input').fill(wrongUser.password)
  await page.getByTestId('signin-submit-button').click()
  // ✅ Erreur "Invalid login credentials"
})
```

---

## 🔐 Sécurité

### ✅ Ce qui est protégé

1. **Le fichier `.env`** est dans `.gitignore` → ne sera JAMAIS commité
2. **Les mots de passe** sont uniquement dans `.env`, jamais dans le code
3. **Le template `.env.example`** ne contient pas de vrais mots de passe

### ❌ Ne JAMAIS faire

```javascript
// ❌ NE JAMAIS mettre des valeurs par défaut en dur
export const CONFIRMED_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@gmail.com',  // ← DANGEREUX!
  password: process.env.TEST_USER_PASSWORD || 'password123'
}

// ✅ TOUJOURS forcer la configuration .env
if (!process.env.TEST_USER_EMAIL) {
  throw new Error('TEST_USER_EMAIL obligatoire')  // ← SÉCURISÉ
}
export const CONFIRMED_USER = {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD
}
```

---

## 🆘 Dépannage

### Erreur: "Configuration OBLIGATOIRE manquante dans .env"

**Cause**: Le fichier `.env` n'existe pas ou des variables sont manquantes.

**Solution**:
1. Créer le fichier `.env` à la racine du projet
2. Copier le contenu de `.env.example`
3. Remplir **toutes** les variables requises:
   - TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_DISPLAY_NAME
   - TEST_NEW_USER_EMAIL, TEST_NEW_USER_PASSWORD, TEST_NEW_USER_DISPLAY_NAME

### Les tests ne voient pas les variables .env

**Cause**: `dotenv` n'est pas configuré.

**Solution**: Vérifier que `playwright.config.js` contient:
```javascript
import 'dotenv/config'  // ← En haut du fichier
```

### Les tests passent localement mais échouent en CI

**Cause**: Le fichier `.env` n'existe pas en CI (c'est normal, il n'est pas commité).

**Solution**: Configurer les variables d'environnement dans votre CI:

**GitHub Actions** (`.github/workflows/test.yml`):
```yaml
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

Puis ajouter les secrets dans GitHub:
- Settings > Secrets and variables > Actions > New repository secret

### Le compte de test est verrouillé

**Cause**: Trop de tentatives de connexion échouées.

**Solution**:
1. Aller dans Supabase Dashboard > Authentication > Users
2. Chercher votre TEST_USER_EMAIL
3. Débloquer le compte ou réinitialiser le mot de passe
4. Mettre à jour `.env` si vous avez changé le mot de passe

### Supabase envoie des warnings de bounce

**Cause**: Des emails sont envoyés à des adresses invalides.

**Solution**:
- ✅ Vérifier que TEST_NEW_USER_EMAIL est une **vraie adresse que vous possédez**
- ✅ Ne PAS utiliser d'emails `@example.com` ou générés aléatoirement
- ✅ Tous les tests utilisent maintenant uniquement les emails du `.env`

---

## 🎓 Bonnes Pratiques

### 1. Réutiliser CONFIRMED_USER pour tous les tests de connexion

```javascript
// ✅ BON: Même compte confirmé réutilisé
test('connexion simple', async ({ page }) => {
  await login(page, CONFIRMED_USER)
})

test('connexion puis déconnexion', async ({ page }) => {
  await login(page, CONFIRMED_USER)  // ← Même compte
  await logout(page)
})
```

### 2. Utiliser NEW_USER pour les tests d'inscription

```javascript
// ✅ BON: NEW_USER depuis .env (une seule fois)
test('inscription nouveau compte', async ({ page }) => {
  await signup(page, NEW_USER)
  // ⚠️ Après ce test, NEW_USER existe dans Supabase
  // Il faut le supprimer manuellement pour relancer ce test
})

// ❌ ÉVITER: Tester l'inscription plusieurs fois avec NEW_USER
// Le deuxième test échouera car le compte existe déjà
```

### 3. Utiliser INVALID_USERS pour les cas d'erreur

```javascript
// ✅ BON: Données invalides qui ne créent pas de bounce
test('erreur credentials invalides', async ({ page }) => {
  const wrongUser = INVALID_USERS.wrongCredentials
  await page.getByTestId('signin-email-input').fill(wrongUser.email)
  await page.getByTestId('signin-password-input').fill(wrongUser.password)
  // ✅ Utilise TEST_USER_EMAIL avec mauvais password (pas d'email envoyé)
})
```

### 4. Ordre d'exécution des tests

```bash
# Les fichiers sont numérotés pour s'exécuter dans l'ordre
01-page-load.spec.js          # Pas de Supabase
02-database-connection.spec.js # Pas d'email
03-signup.spec.js             # Crée NEW_USER
04-signin-signout.spec.js     # Utilise CONFIRMED_USER et NEW_USER
```

---

## 🚀 Évolution Future (Phase 5+)

Quand vous passerez aux tests de production, vous pourrez:

1. **Ajouter plus de fixtures**:
   ```javascript
   // fixtures/test-projects.js
   export const TEST_PROJECTS = [...]

   // fixtures/test-backers.js
   export const TEST_BACKERS = [...]
   ```

2. **Créer des helpers de test**:
   ```javascript
   // fixtures/helpers.js
   export async function createAuthenticatedUser(page) {
     // Créer un utilisateur + confirmer email automatiquement
   }
   ```

3. **Utiliser un environnement Supabase de test dédié**:
   - Désactiver la confirmation email
   - Ou auto-confirmer via l'API Admin
   - Base de données réinitialisée régulièrement

---

## 📚 Ressources

- [fixtures/README.md](../fixtures/README.md) - Documentation technique des fixtures
- [fixtures/test-users.js](../fixtures/test-users.js) - Code source des fixtures
- [tests/warmup/03-signup.spec.js](../tests/warmup/03-signup.spec.js) - Tests d'inscription
- [tests/warmup/04-signin-signout.spec.js](../tests/warmup/04-signin-signout.spec.js) - Tests de connexion
- [.env.example](../.env.example) - Template de configuration

---

## ✅ Checklist de Configuration

- [ ] Fichier `.env` créé à la racine
- [ ] TEST_USER_EMAIL défini
- [ ] TEST_USER_PASSWORD défini
- [ ] TEST_USER_DISPLAY_NAME défini
- [ ] TEST_NEW_USER_EMAIL défini (email réel différent)
- [ ] TEST_NEW_USER_PASSWORD défini
- [ ] TEST_NEW_USER_DISPLAY_NAME défini
- [ ] Compte TEST_USER_EMAIL créé dans Supabase
- [ ] Email confirmé pour TEST_USER_EMAIL
- [ ] Tests lancés avec `npx playwright test tests/warmup/`
- [ ] Tous les tests passent ✅

---

**Fait avec ❤️ pour faciliter les tests E2E sans email bounces**
