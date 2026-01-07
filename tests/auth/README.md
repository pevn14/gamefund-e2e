# Tests d'Authentification - Phase 5 (GameFund)

Tests E2E pour les pages réelles d'authentification du projet GameFund.

## 📁 Structure

```
tests/auth/
├── signup.spec.js           # Tests de la page d'inscription (SignupPage.jsx)
└── signin-signout.spec.js   # Tests de connexion/déconnexion (LoginPage.jsx)
```

## 🎯 Pages testées

Ces tests ciblent les **vraies pages** du projet GameFund (Phase 5):

- **`/signup`** - Page d'inscription (SignupPage.jsx)
- **`/login`** - Page de connexion (LoginPage.jsx)

## 🔧 Différences avec les tests warmup

| Aspect | Tests Warmup | Tests Auth (Phase 5) |
|--------|--------------|---------------------|
| **Route** | `/supabase-test` | `/login` et `/signup` |
| **Objectif** | Apprentissage Playwright | Tests pages réelles |
| **Composants** | Page de test unique | LoginPage.jsx et SignupPage.jsx |
| **data-testid** | ✅ Identiques | ✅ Identiques |

## ✅ Prérequis

Les mêmes prérequis que les tests warmup s'appliquent:

1. **Fichier `.env` configuré** avec 6 variables:
   ```env
   TEST_USER_EMAIL=...
   TEST_USER_PASSWORD=...
   TEST_USER_DISPLAY_NAME=...
   TEST_NEW_USER_EMAIL=...
   TEST_NEW_USER_PASSWORD=...
   TEST_NEW_USER_DISPLAY_NAME=...
   ```

2. **Compte confirmé existant** (TEST_USER_EMAIL)
   - Créé manuellement via `/signup`
   - Email confirmé via le lien Supabase

3. **Nouveau compte** (TEST_NEW_USER_EMAIL)
   - Email réel qui n'existe PAS dans Supabase
   - Pour éviter les bounces

## 🚀 Lancer les tests

```bash
# Tous les tests d'authentification
npx playwright test tests/auth/

# Test d'inscription uniquement
npx playwright test tests/auth/signup.spec.js

# Test de connexion/déconnexion uniquement
npx playwright test tests/auth/signin-signout.spec.js

# Mode UI
npx playwright test tests/auth/ --ui

# Sur un navigateur spécifique
npx playwright test tests/auth/ --project=chromium
```

## 📝 Tests inclus

### signup.spec.js (5 tests)

1. ✅ Valider le formulaire d'inscription (présence des champs)
2. ✅ Afficher les labels des champs
3. ✅ Permettre de remplir tous les champs
4. ✅ Créer un nouveau compte avec succès (utilise NEW_USER)
5. ✅ Afficher message de succès pour email déjà confirmé (sécurité)

### signin-signout.spec.js (3 tests)

1. ✅ Afficher erreur si compte inexistant (INVALID_USERS)
2. ✅ Afficher erreur si email non confirmé (NEW_USER)
3. ✅ Se connecter et se déconnecter avec compte confirmé (CONFIRMED_USER)
   - Vérifie badges (CONNECTÉ/NON CONNECTÉ)
   - Vérifie visibilité des formulaires après déconnexion

## 🔑 data-testid utilisés

Ces attributs doivent être présents dans LoginPage.jsx et SignupPage.jsx:

**SignupPage.jsx:**
- `signup-display-name-input`
- `signup-email-input`
- `signup-password-input`
- `signup-submit-button`
- `success-message`

**LoginPage.jsx:**
- `signin-email-input`
- `signin-password-input`
- `signin-submit-button`
- `signout-button`
- `success-message`
- `error-message`

## ⚠️ Points d'attention

1. **NEW_USER ne doit être utilisé qu'une fois**
   - Après le test d'inscription, ce compte existe dans Supabase
   - Supprimer manuellement le compte pour relancer le test

2. **Messages d'erreur Supabase**
   - `Invalid login credentials` - Mauvais email/password
   - `Email not confirmed` - Email non vérifié

3. **Pas de bounces email**
   - Tous les tests utilisent uniquement les emails du `.env`
   - NEW_USER doit être une vraie adresse email

## 🔄 Migration depuis warmup

Les tests ont été migrés depuis `tests/warmup/` avec ces changements:

- ✅ Route `/supabase-test` → `/login` et `/signup`
- ✅ Titre "SupabaseTest" → "GameFund"
- ✅ data-testid identiques (aucun changement)
- ✅ Fixtures identiques (CONFIRMED_USER, NEW_USER, INVALID_USERS)

## 📚 Documentation complémentaire

- [fixtures/README.md](../../fixtures/README.md) - Documentation des fixtures
- [docs/FIXTURES_SETUP.md](../../docs/FIXTURES_SETUP.md) - Guide de configuration
- [.env.example](../../.env.example) - Template de configuration

---

**Phase 5 - Tests des vraies pages GameFund** 🚀
