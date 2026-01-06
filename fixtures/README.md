# Fixtures E2E - Utilisateurs de Test

Ce dossier contient les fixtures (données de test) pour les tests E2E Playwright.

## 📋 Fichiers

- **test-users.js** : Définitions des utilisateurs de test avec validation stricte

## 🔧 Configuration Initiale

### 1. Créer le fichier .env

À la racine du projet (`gamefund-e2e/`), créez un fichier `.env` avec **deux comptes obligatoires**:

```bash
# Créer le fichier .env
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
- Utilisez des **vraies adresses email que vous possédez** (pour éviter les bounces Supabase)
- `TEST_USER_EMAIL` doit être un compte existant et confirmé dans Supabase
- `TEST_NEW_USER_EMAIL` doit être un compte qui n'existe PAS encore dans Supabase

### 2. Créer le compte confirmé dans Supabase

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

## ✅ Vérifier que tout fonctionne

Lancez les tests warmup:

```bash
# Lancer tous les tests
npx playwright test tests/warmup/

# Ou en mode UI
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

## 🔐 Sécurité

**RÈGLES IMPORTANTES**:

1. ❌ **JAMAIS** commiter le fichier `.env` dans Git
2. ❌ **JAMAIS** mettre de valeurs par défaut en dur dans `test-users.js`
3. ✅ Toujours forcer la validation des variables .env
4. ✅ Le fichier `.env` est déjà dans `.gitignore`
5. ✅ Utiliser uniquement des emails réels pour éviter les bounces Supabase

## 📚 Utilisation dans les Tests

### Importer les fixtures

```javascript
import { CONFIRMED_USER, NEW_USER, INVALID_USERS } from '../../fixtures/test-users.js'
```

### Utiliser le compte confirmé

```javascript
test('connexion réussie', async ({ page }) => {
  await page.goto('/supabase-test')
  await page.getByTestId('signin-email-input').fill(CONFIRMED_USER.email)
  await page.getByTestId('signin-password-input').fill(CONFIRMED_USER.password)
  await page.getByTestId('signin-submit-button').click()

  await expect(page.getByTestId('success-message')).toContainText('Connexion réussie')
})
```

### Utiliser le nouveau compte pour inscription

```javascript
test('inscription nouveau compte', async ({ page }) => {
  await page.goto('/supabase-test')
  await page.getByTestId('signup-display-name-input').fill(NEW_USER.displayName)
  await page.getByTestId('signup-email-input').fill(NEW_USER.email)
  await page.getByTestId('signup-password-input').fill(NEW_USER.password)
  await page.getByTestId('signup-submit-button').click()

  // ⚠️ Après ce test, NEW_USER existe dans Supabase
  // Il faut le supprimer manuellement pour relancer ce test
})
```

### Utiliser des données invalides

```javascript
test('erreur credentials invalides', async ({ page }) => {
  const wrongUser = INVALID_USERS.wrongCredentials

  await page.goto('/supabase-test')
  await page.getByTestId('signin-email-input').fill(wrongUser.email)
  await page.getByTestId('signin-password-input').fill(wrongUser.password)
  await page.getByTestId('signin-submit-button').click()

  await expect(page.getByTestId('error-message')).toContainText('Invalid login credentials')
})
```

## 🆘 Dépannage

### Erreur: "Configuration OBLIGATOIRE manquante dans .env"

**Cause**: Le fichier `.env` n'existe pas ou des variables sont manquantes.

**Solution**:
1. Créer le fichier `.env` à la racine du projet
2. Copier le contenu de `.env.example`
3. Remplir **toutes** les variables requises:
   - TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_DISPLAY_NAME
   - TEST_NEW_USER_EMAIL, TEST_NEW_USER_PASSWORD, TEST_NEW_USER_DISPLAY_NAME

### Les tests échouent avec "Invalid login credentials"

**Cause**: Le mot de passe dans `.env` ne correspond pas au compte Supabase.

**Solution**:
1. Vérifier que le mot de passe dans `.env` est correct
2. Si besoin, réinitialiser le mot de passe du compte de test dans Supabase
3. Mettre à jour `.env` avec le nouveau mot de passe

### Les tests échouent avec "Email not confirmed"

**Cause**: L'email du compte TEST_USER_EMAIL n'a pas été confirmé.

**Solution**:
1. Aller dans votre boîte email
2. Chercher l'email de confirmation de Supabase
3. Cliquer sur le lien de confirmation
4. Relancer les tests

### Supabase envoie des warnings de bounce

**Cause**: Des emails sont envoyés à des adresses invalides.

**Solution**:
- ✅ Vérifier que TEST_NEW_USER_EMAIL est une **vraie adresse que vous possédez**
- ✅ Ne PAS utiliser d'emails `@example.com` ou générés aléatoirement
- ✅ Tous les tests utilisent maintenant uniquement les emails du `.env`

## 🎯 Bonnes Pratiques

1. **Un seul compte confirmé** : Réutilisez CONFIRMED_USER pour tous les tests de connexion
2. **NEW_USER pour inscription** : Utilisez NEW_USER une seule fois (il sera créé dans Supabase)
3. **INVALID_USERS pour erreurs** : Utilisez INVALID_USERS pour tester les cas d'erreur (pas de bounce)
4. **Ordre d'exécution** : Les fichiers sont numérotés (01-, 02-, 03-, 04-) pour s'exécuter dans l'ordre
5. **Documentation** : Toujours commenter pourquoi vous utilisez tel ou tel fixture

## 🚀 Prochaines Étapes (Phase 5)

Quand vous passerez aux tests de production:

1. Créer un environnement Supabase dédié aux tests
2. Peut-être désactiver la confirmation email sur cet environnement de test
3. Créer plusieurs comptes de test avec différents rôles/permissions
4. Ajouter plus de fixtures (projets, transactions, etc.)

---

**Fait avec ❤️ pour faciliter les tests E2E sans email bounces**
