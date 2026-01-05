# Plan de Travail - Tests Warmup Playwright (Phase 4.5)

**Date**: 05 janvier 2026
**Objectif**: Implémenter les tests E2E de warmup sur la page SupabaseTest
**Durée estimée**: 3-4 heures

---

## Contexte

- **Projet principal**: `/home/patrick/working/supabase/gamefund/`
- **Projet tests E2E**: `/home/patrick/working/supabase/gamefund-e2e/`
- **Page cible**: `http://localhost:5173/supabase-test`
- **Status Playwright**: ✅ Installé (@playwright/test v1.57.0)

---

## Étapes à Réaliser

### 1. Configuration ✅

- [ ] Créer `playwright.config.js`
  - Configuration du `testDir` vers `./tests`
  - Configuration `baseURL` vers `http://localhost:5173`
  - Configuration `webServer` pour démarrer Vite automatiquement
  - Configuration projet Chromium

### 2. Création des Tests (6 fichiers)

#### 2.1 Test de chargement de page
- [ ] Créer `tests/warmup/page-load.spec.js`
  - Test: Affichage du titre "Test Supabase"
  - Test: Affichage du badge de connexion Supabase
  - Test: Vérification des sections principales

#### 2.2 Test de connexion à la base de données
- [ ] Créer `tests/warmup/database-connection.spec.js`
  - Test: Badge "✅ Connecté à Supabase" visible
  - Test: Bouton "Retester la connexion" fonctionne

#### 2.3 Test d'inscription
- [ ] Créer `tests/warmup/signup.spec.js`
  - Test: Inscription avec succès (email unique généré)
  - Test: Affichage message de succès
  - Test: Vérification des data-testid:
    - `signup-display-name-input`
    - `signup-email-input`
    - `signup-password-input`
    - `signup-submit-button`
    - `success-message`

#### 2.4 Test de connexion
- [ ] Créer `tests/warmup/signin.spec.js`
  - Test: Connexion avec compte existant
  - Test: Affichage message de succès
  - Test: Bouton de déconnexion visible
  - Test: Erreur si credentials invalides
  - Test: Vérification des data-testid:
    - `signin-email-input`
    - `signin-password-input`
    - `signin-submit-button`
    - `signout-button`
    - `error-message`

#### 2.5 Test de déconnexion
- [ ] Créer `tests/warmup/signout.spec.js`
  - Test: Déconnexion après connexion
  - Test: Affichage message de succès
  - Test: Formulaires de signup/signin visibles après déconnexion

#### 2.6 Test de flux complet
- [ ] Créer `tests/warmup/complete-flow.spec.js`
  - Test: Signup → Signin → Signout
  - Scénario complet avec email unique
  - Vérification de chaque étape

### 3. Configuration NPM

- [ ] Mettre à jour `package.json`
  - Ajouter script `test`: `playwright test`
  - Ajouter script `test:ui`: `playwright test --ui`
  - Ajouter script `test:debug`: `playwright test --debug`
  - Ajouter script `test:headed`: `playwright test --headed`
  - Ajouter script `test:report`: `playwright show-report`

### 4. Vérification

- [ ] Lancer les tests: `npm test`
- [ ] Vérifier que tous les tests passent
- [ ] Vérifier le rapport HTML

---

## Data-testid Disponibles

D'après [SupabaseTest.jsx](../gamefund/src/pages/SupabaseTest.jsx:179-261):

**Inscription**:
- `signup-display-name-input` (ligne 199)
- `signup-email-input` (ligne 207)
- `signup-password-input` (ligne 215)
- `signup-submit-button` (ligne 222)

**Connexion**:
- `signin-email-input` (ligne 234)
- `signin-password-input` (ligne 243)
- `signin-submit-button` (ligne 250)

**Déconnexion**:
- `signout-button` (ligne 261)

**Messages**:
- `success-message` (ligne 179)
- `error-message` (ligne 185)

---

## Commandes Utiles

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

# Voir le rapport
npm run test:report

# Générer code automatiquement
npx playwright codegen http://localhost:5173/supabase-test
```

---

## Notes Importantes

1. **Emails uniques**: Utiliser `Date.now()` pour générer des emails uniques dans les tests
2. **Timeouts**: Augmenter le timeout pour l'attente des messages de succès (5000ms)
3. **Isolation**: Chaque test doit être indépendant
4. **Credentials**: Ne pas commiter de credentials réels
5. **Cleanup**: Pas besoin de cleanup DB pour ces tests de warmup

---

## Résultats Attendus

À la fin de cette phase:

- ✅ 6 fichiers de tests fonctionnels
- ✅ Configuration Playwright opérationnelle
- ✅ Serveur Vite démarre automatiquement
- ✅ Tous les tests passent en vert
- ✅ Rapport HTML généré
- ✅ Patterns réutilisables pour Phase 5

---

**Status**: 🚀 Prêt à démarrer
