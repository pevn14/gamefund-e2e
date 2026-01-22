# GameFund - Guide de Tests E2E

**Version** : 2.0
**Dernière mise à jour** : 19 janvier 2026
**Statut** : MVP complet - Organisation par familles fonctionnelles

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Organisation des tests](#2-organisation-des-tests)
3. [Référentiel data-testid](#3-référentiel-data-testid)
4. [Scénarios par famille fonctionnelle](#4-scénarios-par-famille-fonctionnelle)
5. [Configuration recommandée](#5-configuration-recommandée)
6. [Bonnes pratiques](#6-bonnes-pratiques)

---

## 1. Vue d'ensemble

### Philosophie de test

GameFund est un MVP de plateforme de crowdfunding pour jeux vidéo. Les tests E2E doivent couvrir les **parcours utilisateurs critiques** plutôt que les fonctionnalités isolées.

**Priorités** :
1. **Flux d'argent** : Donations, affichage des statistiques financières
2. **Authentification** : Inscription, connexion, gestion de session
3. **Gestion des projets** : Création, publication, modification
4. **Dashboards** : Accès aux informations personnalisées

### Rôles utilisateurs

| Rôle | Description | Accès |
|------|-------------|-------|
| **Visiteur** | Non authentifié | Galerie publique, détails projets (limités) |
| **Utilisateur** | Authentifié (user/creator) | Création projets, donations, dashboards |
| **Admin** | Rôle admin | Dashboard admin, gestion globale |

---

## 2. Organisation des tests

### Structure recommandée du projet E2E

```
gamefund-e2e/
├── tests/
│   ├── auth/                    # Famille : Authentification
│   │   ├── signup.spec.js
│   │   ├── login.spec.js
│   │   └── session.spec.js
│   ├── projects/                # Famille : Gestion des projets
│   │   ├── gallery.spec.js
│   │   ├── detail.spec.js
│   │   ├── create-edit.spec.js
│   │   └── creator-list.spec.js
│   ├── donations/               # Famille : Système de dons
│   │   ├── donate.spec.js
│   │   ├── my-donations.spec.js
│   │   └── project-donations.spec.js
│   ├── dashboards/              # Famille : Dashboards
│   │   ├── creator.spec.js
│   │   ├── donor.spec.js
│   │   └── admin.spec.js
│   ├── profiles/                # Famille : Profils créateurs
│   │   ├── profile-editor.spec.js
│   │   └── creators-page.spec.js
│   └── navigation/              # Famille : Navigation globale
│       ├── header.spec.js
│       └── footer.spec.js
├── fixtures/
│   └── users.json               # Credentials de test
├── helpers/
│   └── auth.js                  # Helpers d'authentification
└── playwright.config.js
```

### Familles fonctionnelles

| Famille | Priorité | Fichiers de test | Complexité |
|---------|----------|------------------|------------|
| Authentification | Haute | 3 fichiers | Moyenne |
| Gestion des projets | Haute | 4 fichiers | Haute |
| Système de dons | Critique | 3 fichiers | Haute |
| Dashboards | Moyenne | 3 fichiers | Moyenne |
| Profils créateurs | Moyenne | 2 fichiers | Faible |
| Navigation | Faible | 2 fichiers | Faible |

---

## 3. Référentiel data-testid

### Convention de nommage

**Pattern** : `{page/composant}-{élément}-{action?}`

Exemples :
- `login-email-input` - Champ email sur la page login
- `project-card` - Carte projet (élément répétable)
- `donation-form-submit-button` - Bouton soumettre du formulaire de don

### 3.1 Authentification

#### Page Login (`/login`)
| data-testid | Élément | Type |
|-------------|---------|------|
| `login-email-input` | Champ email | input |
| `login-password-input` | Champ mot de passe | input |
| `login-submit-button` | Bouton connexion | button |
| `login-error-message` | Message d'erreur | div |
| `login-signup-link` | Lien vers inscription | link |

#### Page Signup (`/signup`)
| data-testid | Élément | Type |
|-------------|---------|------|
| `signup-displayname-input` | Champ nom d'affichage | input |
| `signup-email-input` | Champ email | input |
| `signup-password-input` | Champ mot de passe | input |
| `signup-confirm-password-input` | Confirmation mot de passe | input |
| `signup-submit-button` | Bouton inscription | button |
| `signup-error-message` | Message d'erreur | div |
| `signup-success-message` | Message succès | div |
| `signup-login-link` | Lien vers connexion | link |

### 3.2 Navigation Header

#### Desktop (authentifié)
| data-testid | Élément | Visible si |
|-------------|---------|-----------|
| `header-projects-link` | Lien "Mes Projets" | Connecté, non admin |
| `header-dashboard-link` | Lien "Dashboard Créateur" | Connecté, non admin |
| `header-donor-dashboard-link` | Lien "Dashboard Donateur" | Connecté, non admin |
| `header-admin-link` | Lien "Dashboard Admin" | Admin uniquement |
| `header-user-info` | Affichage avatar + nom | Connecté |
| `header-logout-button` | Bouton déconnexion | Connecté |

#### Desktop (non authentifié)
| data-testid | Élément |
|-------------|---------|
| `header-login-button` | Bouton "Connexion" |
| `header-signup-button` | Bouton "Inscription" |

#### Mobile
| data-testid | Élément |
|-------------|---------|
| `header-mobile-menu-button` | Bouton burger |
| `header-mobile-menu` | Menu déplié |
| `header-mobile-dashboard-link` | Lien Dashboard (mobile) |
| `header-mobile-projects-link` | Lien Mes Projets (mobile) |
| `header-mobile-donor-dashboard-link` | Lien Dashboard Donateur (mobile) |
| `header-mobile-user-info` | Info utilisateur (mobile) |
| `header-mobile-login-button` | Bouton connexion (mobile) |
| `header-mobile-signup-button` | Bouton inscription (mobile) |
| `header-mobile-logout-button` | Bouton déconnexion (mobile) |

### 3.3 Galerie de projets (`/`)

#### Filtres
| data-testid | Élément |
|-------------|---------|
| `projects-page` | Container page |
| `projects-page-title` | Titre principal |
| `projects-page-subtitle` | Sous-titre |
| `projects-search-input` | Champ recherche |
| `projects-status-filter` | Select filtre statut |
| `projects-sort-filter` | Select tri |
| `projects-page-creator-filter` | Bandeau filtrage créateur |
| `projects-page-clear-creator-filter` | Bouton effacer filtre créateur |

#### Grille et cartes
| data-testid | Élément |
|-------------|---------|
| `projects-grid` | Container grille |
| `project-card` | Carte projet (multiple) |
| `project-card-image` | Image du projet |
| `project-card-title` | Titre |
| `project-card-tagline` | Tagline |
| `project-card-badge` | Badge statut |
| `project-card-progress` | Barre de progression |
| `project-card-stats` | Statistiques (montant, donateurs) |
| `project-card-creator` | Info créateur (avatar + nom) |
| `project-card-link` | Lien vers détail |
| `projects-grid-empty` | État vide |
| `projects-grid-loading` | État chargement |
| `projects-grid-error` | État erreur |

### 3.4 Détail projet (`/projects/:id`)

| data-testid | Élément |
|-------------|---------|
| `project-detail-page` | Container page |
| `project-detail-loading` | État chargement |
| `project-detail-error` | État erreur |
| `project-detail-back-button` | Bouton retour |
| `project-detail-title` | Titre projet |
| `project-detail-tagline` | Tagline |
| `project-detail-image` | Image principale |
| `project-detail-description` | Section description |
| `project-detail-creator` | Section créateur (avatar, nom, bio) |
| `project-detail-stats` | Section statistiques |
| `project-detail-donations` | Section donations récentes |
| `project-detail-share-button` | Bouton partager |
| `project-detail-donate-button` | Bouton faire un don |
| `project-detail-donation-modal` | Modal de don |
| `project-detail-login-button` | Bouton connexion (si non connecté) |
| `project-detail-manage-button` | Bouton gérer (si créateur) |
| `project-detail-view-donations-button` | Bouton voir donations (si créateur) |

### 3.5 CRUD Projets

#### Création/Édition (`/projects/create`, `/projects/:id/edit`)
| data-testid | Élément |
|-------------|---------|
| `create-project-page` | Container page création |
| `edit-project-page` | Container page édition |
| `project-form` | Formulaire |
| `project-form-title-input` | Champ titre |
| `project-form-tagline-input` | Champ tagline |
| `project-form-description-input` | Champ description |
| `project-form-goal-input` | Champ objectif |
| `project-form-deadline-input` | Champ deadline |
| `project-form-image-upload` | Upload image |
| `project-form-image-preview` | Prévisualisation image |
| `project-form-save-button` | Bouton sauvegarder (brouillon) |
| `project-form-publish-button` | Bouton publier |
| `project-form-cancel-button` | Bouton annuler |
| `project-form-delete-button` | Bouton supprimer |
| `project-form-error` | Message erreur |
| `project-form-success` | Message succès |

#### Liste mes projets (`/dashboard/projects`)
| data-testid | Élément |
|-------------|---------|
| `my-projects-page` | Container page |
| `my-projects-create-button` | Bouton créer projet |
| `my-projects-filter-tabs` | Onglets filtres (Tous, Brouillons, Actifs...) |
| `my-projects-grid` | Grille de projets |
| `my-project-card` | Carte projet (multiple) |
| `my-project-card-title` | Titre |
| `my-project-card-status` | Badge statut |
| `my-project-card-stats` | Statistiques |
| `my-project-card-edit-button` | Bouton éditer |
| `my-project-card-view-button` | Bouton voir |
| `my-projects-empty` | État vide |

### 3.6 Système de dons

#### Formulaire de don (dans modal)
| data-testid | Élément |
|-------------|---------|
| `donation-form` | Formulaire |
| `donation-form-amount-input` | Champ montant |
| `donation-form-message-input` | Champ message |
| `donation-form-preview` | Prévisualisation impact |
| `donation-form-submit-button` | Bouton continuer |
| `donation-form-cancel-button` | Bouton annuler |
| `donation-form-error` | Message erreur |
| `donation-confirm-modal` | Modal confirmation |
| `donation-confirm-amount` | Montant affiché |
| `donation-confirm-button` | Bouton confirmer |
| `donation-success-message` | Message succès |

#### Mes donations (`/my-donations`)
| data-testid | Élément |
|-------------|---------|
| `my-donations-page` | Container page |
| `my-donations-stats` | Statistiques globales |
| `my-donations-list` | Liste des donations |
| `donation-card` | Carte donation (multiple) |
| `donation-card-project` | Nom projet |
| `donation-card-amount` | Montant |
| `donation-card-date` | Date |
| `donation-card-edit-button` | Bouton modifier |
| `donation-card-delete-button` | Bouton supprimer |
| `my-donations-empty` | État vide |

#### Donations reçues - Vue créateur (`/my-projects/:id/donations`)
| data-testid | Élément |
|-------------|---------|
| `project-donations-page` | Container page |
| `project-donations-stats` | Statistiques (total, moyenne, nb) |
| `project-donations-export-button` | Bouton export CSV |
| `project-donations-list` | Liste des donations |
| `project-donations-empty` | État vide |

### 3.7 Dashboards

#### Dashboard Créateur (`/dashboard`)
| data-testid | Élément |
|-------------|---------|
| `creator-dashboard-page` | Container page |
| `creator-dashboard-welcome` | Message bienvenue |
| `creator-dashboard-stats` | Grille statistiques (4 cartes) |
| `creator-dashboard-stat-total` | Stat total projets |
| `creator-dashboard-stat-active` | Stat projets actifs |
| `creator-dashboard-stat-collected` | Stat fonds collectés |
| `creator-dashboard-stat-donors` | Stat donateurs |
| `creator-dashboard-recent-projects` | Section projets récents |
| `creator-dashboard-quick-actions` | Section actions rapides |
| `creator-dashboard-drafts-alert` | Alerte brouillons |
| `creator-dashboard-empty` | État vide (nouveau créateur) |

#### Dashboard Donateur (`/donor-dashboard`)
| data-testid | Élément |
|-------------|---------|
| `donor-dashboard-page` | Container page |
| `donor-dashboard-stats` | Grille statistiques |
| `donor-dashboard-stat-total-donated` | Total donné |
| `donor-dashboard-stat-projects-count` | Projets soutenus |
| `donor-dashboard-stat-successful` | Projets réussis |
| `donor-dashboard-projects-grid` | Grille projets soutenus |
| `donor-dashboard-recent-donations` | Donations récentes |
| `donor-dashboard-view-all-button` | Bouton voir tous mes dons |
| `donor-dashboard-empty` | État vide |

#### Dashboard Admin (`/admin`)
| data-testid | Élément |
|-------------|---------|
| `admin-dashboard-page` | Container page |
| `admin-dashboard-stats` | Grille statistiques globales |
| `admin-nav-projects` | Lien gestion projets |
| `admin-nav-users` | Lien gestion utilisateurs |

#### Admin - Gestion projets (`/admin/projects`)
| data-testid | Élément |
|-------------|---------|
| `admin-projects-page` | Container page |
| `admin-projects-search` | Recherche |
| `admin-projects-filter` | Filtre statut |
| `admin-projects-table` | Table des projets |
| `admin-project-row` | Ligne projet (multiple) |
| `admin-project-status-select` | Select changement statut |
| `admin-project-delete-button` | Bouton supprimer |

#### Admin - Gestion utilisateurs (`/admin/users`)
| data-testid | Élément |
|-------------|---------|
| `admin-users-page` | Container page |
| `admin-users-search` | Recherche |
| `admin-users-table` | Table des utilisateurs |
| `admin-user-row` | Ligne utilisateur (multiple) |
| `admin-user-role-select` | Select changement rôle |
| `admin-user-status-toggle` | Toggle actif/suspendu |

### 3.8 Profils Créateurs

#### ProfileEditor (dans Dashboard Créateur)
| data-testid | Élément |
|-------------|---------|
| `profile-editor` | Container éditeur |
| `profile-editor-name-input` | Champ nom d'affichage |
| `profile-editor-bio-textarea` | Champ bio |
| `profile-editor-bio-counter` | Compteur caractères |
| `profile-editor-save-button` | Bouton enregistrer |
| `profile-editor-success-message` | Message succès |
| `profile-editor-error-message` | Message erreur |

#### AvatarUpload
| data-testid | Élément |
|-------------|---------|
| `avatar-upload` | Container upload |
| `avatar-upload-preview` | Prévisualisation |
| `avatar-upload-input` | Input file (hidden) |
| `avatar-upload-button` | Bouton upload |
| `avatar-delete-button` | Bouton supprimer |

#### Page Créateurs (`/creators`)
| data-testid | Élément |
|-------------|---------|
| `creators-page` | Container page |
| `creators-page-title` | Titre |
| `creators-page-grid` | Grille créateurs |
| `creators-page-login-message` | Message si non connecté |
| `creators-page-login-button` | Bouton connexion |
| `creators-page-signup-link` | Lien inscription |

#### CreatorCard
| data-testid | Élément |
|-------------|---------|
| `creator-card` | Carte créateur (multiple) |
| `creator-card-avatar` | Avatar |
| `creator-card-name` | Nom |
| `creator-card-bio` | Bio |
| `creator-card-projects-count` | Nombre de projets |
| `creator-card-view-button` | Bouton voir projets |

---

## 4. Scénarios par famille fonctionnelle

### 4.1 Famille : Authentification

#### Scénario A1 : Inscription réussie
**Objectif** : Vérifier qu'un nouveau visiteur peut créer un compte

**Prérequis** : Aucun compte existant avec l'email de test

**Parcours** :
1. Accéder à `/signup`
2. Remplir tous les champs (nom, email, password, confirmation)
3. Soumettre le formulaire
4. Vérifier le message de succès
5. Vérifier la redirection vers login

**Points de vérification** :
- Validation des champs (email format, password min length, confirmation match)
- Messages d'erreur explicites
- Message de succès affiché

#### Scénario A2 : Connexion réussie
**Objectif** : Vérifier qu'un utilisateur peut se connecter

**Prérequis** : Compte existant

**Parcours** :
1. Accéder à `/login`
2. Entrer email et password valides
3. Soumettre
4. Vérifier redirection vers `/`
5. Vérifier que le header affiche l'utilisateur connecté

**Points de vérification** :
- Header mis à jour (avatar + nom visible)
- Liens authentifiés visibles
- Session persistante après refresh

#### Scénario A3 : Déconnexion
**Objectif** : Vérifier la déconnexion complète

**Prérequis** : Utilisateur connecté

**Parcours** :
1. Cliquer sur déconnexion dans le header
2. Vérifier redirection vers `/`
3. Vérifier que les liens authentifiés disparaissent
4. Tenter d'accéder à `/dashboard`
5. Vérifier redirection vers `/login`

---

### 4.2 Famille : Gestion des projets

#### Scénario P1 : Parcours galerie publique
**Objectif** : Navigation et filtrage dans la galerie

**Parcours** :
1. Accéder à `/` (galerie)
2. Vérifier l'affichage des cartes projets
3. Utiliser la recherche textuelle
4. Filtrer par statut
5. Changer le tri
6. Cliquer sur un projet pour voir le détail

**Points de vérification** :
- Cartes affichent : image, titre, badge, progression, créateur
- Filtres appliqués correctement
- Recherche avec debounce
- Navigation vers détail fonctionne

#### Scénario P2 : Créer et publier un projet
**Objectif** : Parcours complet de création

**Prérequis** : Utilisateur connecté (non admin)

**Parcours** :
1. Naviguer vers `/projects/create`
2. Remplir le formulaire complet
3. Uploader une image
4. Sauvegarder en brouillon
5. Vérifier dans `/dashboard/projects` (filtre brouillons)
6. Éditer le projet
7. Publier le projet
8. Vérifier dans la galerie publique

**Points de vérification** :
- Validation des champs obligatoires
- Upload image fonctionne
- Brouillon visible uniquement par le créateur
- Publication rend le projet public
- Badge passe de "draft" à "active"

#### Scénario P3 : Filtrage par créateur
**Objectif** : Voir les projets d'un créateur spécifique

**Prérequis** : Utilisateur connecté, créateur avec plusieurs projets

**Parcours** :
1. Accéder à `/creators`
2. Cliquer sur "Voir les projets" d'un créateur
3. Vérifier l'affichage du bandeau de filtrage
4. Vérifier que seuls les projets du créateur sont affichés
5. Cliquer sur "Effacer" pour retirer le filtre

**Points de vérification** :
- Bandeau affiche avatar et nom du créateur
- Filtrage appliqué correctement
- Bouton effacer fonctionne

---

### 4.3 Famille : Système de dons

#### Scénario D1 : Faire un don
**Objectif** : Parcours complet de donation

**Prérequis** : Utilisateur connecté, projet actif existant

**Parcours** :
1. Accéder à la page détail d'un projet actif
2. Cliquer sur "Faire un don"
3. Entrer un montant (>= 1€)
4. Entrer un message (optionnel)
5. Cliquer sur "Continuer"
6. Vérifier la prévisualisation dans la modal
7. Confirmer le don
8. Vérifier le message de succès
9. Vérifier que les stats du projet sont mises à jour

**Points de vérification** :
- Validation montant minimum (1€)
- Modal affiche le bon montant et le nouveau total
- Statistiques mises à jour après confirmation
- Don visible dans la liste des donations du projet

#### Scénario D2 : Consulter mes donations
**Objectif** : Vérifier l'historique personnel

**Prérequis** : Utilisateur avec au moins un don

**Parcours** :
1. Accéder à `/my-donations`
2. Vérifier les statistiques globales
3. Parcourir la liste des donations
4. Modifier une donation (si projet encore actif)
5. Vérifier les changements

**Points de vérification** :
- Statistiques correctes (total, nb projets)
- Donations triées par date
- Modification possible si projet actif
- Suppression avec confirmation

#### Scénario D3 : Vue créateur des donations
**Objectif** : Créateur consulte les dons reçus

**Prérequis** : Créateur avec projet ayant reçu des dons

**Parcours** :
1. Accéder à `/dashboard/projects`
2. Cliquer sur "Voir les donations" d'un projet
3. Vérifier les statistiques
4. Consulter la liste des donateurs
5. Exporter en CSV

**Points de vérification** :
- Statistiques : total, nb donations, nb donateurs, moyenne
- Liste affiche info donateur + montant + date
- Export CSV contient toutes les données

---

### 4.4 Famille : Dashboards

#### Scénario DB1 : Dashboard Créateur
**Objectif** : Vérifier l'affichage et les actions

**Prérequis** : Utilisateur avec plusieurs projets

**Parcours** :
1. Accéder à `/dashboard`
2. Vérifier les 4 statistiques
3. Consulter les projets récents (max 5)
4. Utiliser les actions rapides
5. Vérifier l'alerte brouillons (si applicable)

**Points de vérification** :
- Stats calculées correctement
- Projets récents triés par date
- Liens de navigation fonctionnent
- Alerte brouillons avec compteur

#### Scénario DB2 : Dashboard Donateur
**Objectif** : Vérifier la vue donateur

**Prérequis** : Utilisateur avec donations

**Parcours** :
1. Accéder à `/donor-dashboard`
2. Vérifier les statistiques
3. Consulter les projets soutenus (max 6 actifs)
4. Voir les 5 dernières donations
5. Cliquer sur "Voir tous mes dons"

**Points de vérification** :
- Stats correctes
- Seuls projets actifs affichés dans la grille
- Navigation vers `/my-donations` fonctionne

#### Scénario DB3 : Dashboard Admin
**Objectif** : Vérifier les fonctions admin

**Prérequis** : Compte admin

**Parcours** :
1. Accéder à `/admin`
2. Vérifier les statistiques globales
3. Accéder à la gestion des projets
4. Changer le statut d'un projet
5. Accéder à la gestion des utilisateurs
6. Changer le rôle d'un utilisateur

**Points de vérification** :
- Accès restreint aux admins uniquement
- Actions de modération fonctionnent
- Changements de statut/rôle persistés

---

### 4.5 Famille : Profils Créateurs

#### Scénario PC1 : Éditer mon profil
**Objectif** : Modifier avatar et bio

**Prérequis** : Utilisateur connecté

**Parcours** :
1. Accéder à `/dashboard`
2. Localiser le ProfileEditor
3. Modifier le nom d'affichage
4. Ajouter/modifier la bio
5. Uploader un avatar
6. Sauvegarder
7. Vérifier que le header affiche le nouvel avatar

**Points de vérification** :
- Bio limitée à 500 caractères (compteur visible)
- Upload image valide (JPG/PNG/WEBP, max 2MB)
- Avatar mis à jour dans le header
- Message de succès affiché

#### Scénario PC2 : Page Créateurs
**Objectif** : Découvrir les créateurs

**Prérequis non connecté** :
1. Accéder à `/creators`
2. Vérifier le message de connexion
3. Cliquer sur connexion

**Prérequis connecté** :
1. Accéder à `/creators`
2. Voir la grille des créateurs
3. Chaque carte affiche : avatar, nom, bio, nb projets
4. Cliquer sur "Voir les projets"
5. Vérifier redirection avec filtre créateur

---

## 5. Configuration recommandée

### Playwright config

```javascript
// playwright.config.js
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
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],

  webServer: {
    command: 'cd ../gamefund && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Helpers d'authentification

Créer un helper pour éviter de répéter le code de connexion :

```javascript
// helpers/auth.js
export async function login(page, email, password) {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-password-input').fill(password)
  await page.getByTestId('login-submit-button').click()
  await page.waitForURL('/')
}

export async function logout(page) {
  await page.getByTestId('header-logout-button').click()
  await page.waitForURL('/')
}
```

### Fixtures utilisateurs

```json
// fixtures/users.json
{
  "creator": {
    "email": "creator@test.com",
    "password": "TestPass123!",
    "displayName": "Test Creator"
  },
  "donor": {
    "email": "donor@test.com",
    "password": "TestPass123!",
    "displayName": "Test Donor"
  },
  "admin": {
    "email": "admin@test.com",
    "password": "AdminPass123!",
    "displayName": "Test Admin"
  }
}
```

---

## 6. Bonnes pratiques

### Sélecteurs

**Toujours utiliser data-testid** :
```javascript
// Bon
await page.getByTestId('login-submit-button').click()

// Éviter
await page.locator('button[type="submit"]').click()
await page.getByText('Se connecter').click()
```

### Attentes

**Utiliser les attentes explicites** :
```javascript
// Bon - attendre la navigation
await page.getByTestId('login-submit-button').click()
await page.waitForURL('/dashboard')

// Bon - attendre un élément
await expect(page.getByTestId('success-message')).toBeVisible()

// Éviter - timeouts fixes
await page.waitForTimeout(2000)
```

### Isolation

**Chaque test doit être indépendant** :
- Ne pas dépendre de l'ordre d'exécution
- Créer les données nécessaires en setup
- Nettoyer après si nécessaire

### Nommage

**Noms descriptifs en français** :
```javascript
test.describe('Authentification', () => {
  test('devrait connecter un utilisateur avec credentials valides', async ({ page }) => {
    // ...
  })

  test('devrait afficher erreur si mot de passe incorrect', async ({ page }) => {
    // ...
  })
})
```

### Couverture

**Prioriser les parcours critiques** :
1. Flux impliquant de l'argent (donations)
2. Authentification et sécurité
3. Actions de création/modification
4. Affichage et navigation

---

## Ressources

- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)

---

## Changelog data-testid

### 21 janvier 2026 - Synchronisation code/documentation

**Note pour l'équipe de test** : Les data-testid suivants ont été ajoutés ou modifiés dans le code pour correspondre à cette documentation.

#### Corrections effectuées

| Fichier | Ancien data-testid | Nouveau data-testid |
|---------|-------------------|---------------------|
| ProjectFilters.jsx | `search-input` | `projects-search-input` |
| ProjectFilters.jsx | `status-filter` | `projects-status-filter` |
| ProjectFilters.jsx | `sort-select` | `projects-sort-filter` |
| ProjectGrid.jsx | `project-grid-skeleton` | `projects-grid-loading` |
| ProjectGrid.jsx | `project-grid-error` | `projects-grid-error` |
| ProjectGrid.jsx | `project-grid-empty` | `projects-grid-empty` |
| ProjectGrid.jsx | `project-grid` | `projects-grid` |
| ProjectCard.jsx | `project-card-status-badge` | `project-card-badge` |
| ProjectCard.jsx | `project-card-description` | `project-card-tagline` |
| SignupPage.jsx | `signup-display-name-input` | `signup-displayname-input` |
| MyProjectsPage.jsx | `filter-*-button` | `my-projects-filter-tabs` (wrapper) |
| MyProjectsPage.jsx | `projects-grid` | `my-projects-grid` |
| MyProjectsPage.jsx | `project-card` | `my-project-card` |
| MyProjectsPage.jsx | `edit-project-button` | `my-project-card-edit-button` |
| MyProjectsPage.jsx | `view-project-button` | `my-project-card-view-button` |
| CreatorDashboardPage.jsx | `dashboard-stats-grid` | `creator-dashboard-stats` |
| CreatorDashboardPage.jsx | `stat-total-projects` | `creator-dashboard-stat-total` |
| CreatorDashboardPage.jsx | `stat-active-projects` | `creator-dashboard-stat-active` |
| CreatorDashboardPage.jsx | `stat-total-collected` | `creator-dashboard-stat-collected` |
| CreatorDashboardPage.jsx | `stat-total-donors` | `creator-dashboard-stat-donors` |
| CreatorDashboardPage.jsx | `drafts-alert` | `creator-dashboard-drafts-alert` |

#### Ajouts effectués

| Fichier | data-testid ajouté |
|---------|-------------------|
| ProjectCard.jsx | `project-card-stats` |
| ProjectCard.jsx | `project-card-creator` |
| MyProjectsPage.jsx | `my-projects-page` |
| MyProjectsPage.jsx | `my-projects-create-button` |
| MyProjectsPage.jsx | `my-projects-empty` |
| CreatorDashboardPage.jsx | `creator-dashboard-page` |
| CreatorDashboardPage.jsx | `creator-dashboard-welcome` |
| AdminDashboardPage.jsx | `admin-dashboard-page` |
| AdminDashboardPage.jsx | `admin-dashboard-stats` |
| AdminProjectsPage.jsx | `admin-projects-page` |
| AdminProjectsPage.jsx | `admin-projects-search` |
| AdminProjectsPage.jsx | `admin-projects-filter` |
| AdminProjectsPage.jsx | `admin-project-row` |
| AdminProjectsPage.jsx | `admin-project-status-select` |
| AdminProjectsPage.jsx | `admin-project-delete-button` |
| AdminUsersPage.jsx | `admin-users-page` |
| AdminUsersPage.jsx | `admin-user-row` |
| AdminUsersPage.jsx | `admin-user-role-select` |
| AdminUsersPage.jsx | `admin-user-status-toggle` |

#### Note importante

Le data-testid `admin-users-search` est documenté dans ce guide mais **la fonctionnalité de recherche n'existe pas** dans AdminUsersPage. Si nécessaire, cette fonctionnalité devra être implémentée dans une future version.

---

**Dernière mise à jour** : 21 janvier 2026
