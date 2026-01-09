# Tests de Navigation - GameFund

Tests E2E pour la navigation globale de l'application GameFund, incluant le header et la galerie de projets.

## 📁 Structure

```
e2e/navigation/
├── 01-header-navigation.spec.js    # Tests du header (desktop/mobile)
├── 02-projects-navigation.spec.js  # Tests de la galerie de projets
└── README.md                       # Documentation
```

## 🎯 Pages et composants testés

### Header Navigation
- **Composant** : `Header.jsx`
- **Routes** : Toutes les pages (header global)
- **Fonctionnalités** : Navigation authentifiée/non-authentifiée, responsive

### Projects Navigation  
- **Pages** : `ProjectsPage.jsx`, `ProjectDetailPage.jsx`
- **Routes** : `/`, `/projects`, `/projects/:id`
- **Fonctionnalités** : Galerie, détails, filtres, responsive

## 🚀 Lancer les tests

```bash
# Tous les tests de navigation
npm test e2e/navigation/

# Tests du header uniquement
npm test e2e/navigation/01-header-navigation.spec.js

# Tests de la galerie uniquement
npm test e2e/navigation/02-projects-navigation.spec.js

# Mode UI pour développement
npm run test:ui e2e/navigation/
```

## 📝 Tests inclus

### 01-header-navigation.spec.js (15 tests)

#### Header non authentifié - Desktop
- ✅ Affichage boutons connexion/inscription
- ✅ Navigation vers page de connexion
- ✅ Navigation vers page d'inscription

#### Header authentifié - Desktop
- ✅ Affichage liens authentifiés après connexion
- ✅ Navigation vers dashboard
- ✅ Navigation vers "Mes Projets"
- ✅ Affichage informations utilisateur
- ✅ Déconnexion correcte

#### Navigation mobile
- ✅ Affichage bouton menu burger
- ✅ Ouverture/fermeture menu mobile
- ✅ Liens connexion/inscription dans menu mobile
- ✅ Navigation et fermeture automatique
- ✅ Liens authentifiés dans menu mobile
- ✅ Navigation dashboard depuis menu mobile

#### Persistance
- ✅ Maintien de connexion après refresh

### 02-projects-navigation.spec.js (12 tests)

#### Navigation depuis l'accueil
- ✅ Affichage grille de projets
- ✅ Navigation vers détails projet
- ✅ Navigation via bouton "Soutenir"

#### Navigation depuis /projects
- ✅ Affichage galerie complète
- ✅ Navigation vers détails
- ✅ Navigation via titre projet

#### Navigation depuis détails
- ✅ Navigation retour vers galerie
- ✅ Navigation via logo GameFund

#### Navigation avancée
- ✅ Maintien des filtres lors navigation retour
- ✅ Navigation responsive (mobile/tablette)
- ✅ Gestion erreurs URLs invalides
- ✅ Gestion projets supprimés
- ✅ État de chargement lors navigation

## 🔑 data-testid utilisés

### Header
```javascript
// Desktop non authentifié
header-login-button
header-signup-button

// Desktop authentifié  
header-dashboard-link
header-projects-link
header-user-info
header-logout-button

// Mobile
header-mobile-menu-button
header-mobile-menu
header-mobile-dashboard-link
header-mobile-projects-link
header-mobile-user-info
header-mobile-login-button
header-mobile-signup-button
header-mobile-logout-button
```

### Projets
```javascript
// Grille et cartes
projects-grid
project-card-{id}
project-card-title-{id}
project-donate-{id}

// Page de détails
project-detail-container
donation-form
back-to-projects
back-button

// Filtres
project-filters
filter-status
filter-search
filter-sort

// Chargement et erreurs
loading-spinner
skeleton-loader
error-message
```

## ⚠️ Points d'attention

1. **Responsive** : Tests couvrent desktop, mobile et tablette
2. **État authentifié** : Tests avec connexion/déconnexion réelles
3. **Gestion erreurs** : URLs invalides et projets supprimés
4. **Performance** : Tests avec états de chargement
5. **Filtres** : Maintien de l'état lors navigation

## 🔧 Prérequis

- **Utilisateur de test** : `CONFIRMED_USER` pour les tests authentifiés
- **Projets de test** : Au moins un projet actif dans la base de données
- **Data-testid** : Tous les sélecteurs doivent être présents dans les composants

---

**Phase 6-7 - Tests de Navigation GameFund** 🚀
