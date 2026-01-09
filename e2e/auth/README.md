# Tests d'Authentification - GameFund

Tests E2E pour les pages d'authentification du projet GameFund.

## 📁 Structure

```
e2e/auth/
├── 01-signup.spec.js           # Tests de la page d'inscription
└── 02-signin-signout.spec.js   # Tests de connexion/déconnexion
```

## 🎯 Pages testées

Ces tests ciblent les pages du projet GameFund:

- **`/signup`** - Page d'inscription
- **`/login`** - Page de connexion

## ✅ Prérequis

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
npm test e2e/auth/

# Test d'inscription uniquement
npm test e2e/auth/01-signup.spec.js

# Test de connexion/déconnexion uniquement
npm test e2e/auth/02-signin-signout.spec.js

# Mode UI
npm run test:ui e2e/auth/
```

## 📝 Tests inclus

### 01-signup.spec.js (5 tests)

1. ✅ Valider le formulaire d'inscription (présence des champs)
2. ✅ Afficher les labels des champs
3. ✅ Permettre de remplir tous les champs
4. ✅ Créer un nouveau compte avec succès (utilise NEW_USER)
5. ✅ Afficher message de succès pour email déjà confirmé (sécurité)

### 02-signin-signout.spec.js (3 tests)

1. ✅ Afficher erreur si compte inexistant (INVALID_USERS)
2. ✅ Afficher erreur si email non confirmé (NEW_USER)
3. ✅ Se connecter et se déconnecter avec compte confirmé (CONFIRMED_USER)

## 🔑 data-testid utilisés

**Page d'inscription:**
- `signup-display-name-input`
- `signup-email-input`
- `signup-password-input`
- `signup-confirm-password-input`
- `signup-submit-button`
- `success-message`

**Page de connexion:**
- `signin-email-input`
- `signin-password-input`
- `signin-submit-button`
- `signout-button`
- `success-message`
- `error-message`

**Page d'accueil:**
- `user-status-loading`
- `user-display-name`
- `user-email`
- `signout-button`

---

**Tests E2E GameFund** 🚀
