# GameFund - Documentation d'Architecture

**Version** : 1.0.0 (MVP)
**Dernière mise à jour** : 19 janvier 2026
**Statut** : MVP complet (Phases 1-11b terminées)

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Structure des dossiers](#3-structure-des-dossiers)
4. [Services Frontend](#4-services-frontend)
5. [Hooks React](#5-hooks-react)
6. [Composants](#6-composants)
7. [Pages](#7-pages)
8. [Architecture Supabase](#8-architecture-supabase)
9. [Flux d'authentification](#9-flux-dauthentification)
10. [Routes et navigation](#10-routes-et-navigation)
11. [Patterns et conventions](#11-patterns-et-conventions)
12. [Variables d'environnement](#12-variables-denvironnement)

---

## 1. Vue d'ensemble

GameFund est une plateforme de crowdfunding dédiée aux créateurs de jeux vidéo indépendants. L'application permet aux développeurs de créer des campagnes de financement et aux donateurs de soutenir les projets qui les passionnent.

### Objectif du projet

Projet expérimental développé entièrement avec **Claude Code** pour démontrer l'intégration React + Supabase et servir de base réutilisable pour des projets similaires.

### Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Pages      │  │  Components  │  │   Hooks      │       │
│  │  (15 pages)  │  │ (37 composants)│ │  (3 hooks)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐                                           │
│  │  Services    │ ← Communication avec Supabase             │
│  │ (6 services) │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓ ↑
                      Supabase SDK
                           ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Supabase)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │       │
│  │  (3 tables)  │  │  (JWT/Email) │  │ (2 buckets)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐                                           │
│  │     RLS      │ ← Row Level Security                      │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Fonctionnalités MVP

| Fonctionnalité | Description |
|----------------|-------------|
| **Authentification** | Inscription, connexion, déconnexion, gestion de session |
| **Galerie publique** | Liste des projets actifs avec filtres et recherche |
| **CRUD Projets** | Création, édition, publication, suppression de projets |
| **Système de dons** | Faire des dons avec messages optionnels |
| **Dashboard Créateur** | Gestion des projets, statistiques, profil |
| **Dashboard Donateur** | Historique des dons, projets soutenus |
| **Dashboard Admin** | Gestion utilisateurs et projets |
| **Profils Créateurs** | Avatar, bio, page créateurs publique |

---

## 2. Stack technique

### Frontend

| Technologie | Version | Usage |
|------------|---------|-------|
| **React** | 19.x | Framework UI |
| **Vite** | 7.x | Build tool & dev server |
| **Tailwind CSS** | 4.x | Framework CSS (CSS-first config) |
| **React Router** | 7.x | Routing SPA |
| **Lucide React** | 0.562+ | Bibliothèque d'icônes |
| **Supabase JS** | 2.89+ | Client SDK pour Supabase |

### Backend (Supabase)

| Service | Usage |
|---------|-------|
| **PostgreSQL** | Base de données relationnelle |
| **Auth** | Authentification JWT + gestion sessions |
| **Storage** | Stockage d'images (projets + avatars) |
| **Row Level Security** | Sécurité au niveau des lignes |

---

## 3. Structure des dossiers

```
gamefund/
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md                # Ce fichier
│   ├── PRD_GameFund.md               # Product Requirements Document
│   ├── DESIGN_GUIDE.md               # Guide de design Tailwind v4
│   ├── ACTION_PLAN.md                # Plan d'action détaillé
│   ├── PROGRESS.md                   # Suivi de progression
│   ├── SUPABASE_SETUP.md             # Guide de configuration Supabase
│   ├── TESTING.md                    # Guide de tests E2E
│   └── HOWTO.md                      # Guides pratiques
│
├── supabase/                          # Scripts SQL
│   ├── schema.sql                    # Schéma de base de données
│   └── add_avatar_storage.sql        # Bucket avatars
│
├── src/
│   ├── components/
│   │   ├── ui/                       # Composants UI réutilisables (12)
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── FilePicker.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   └── Textarea.jsx
│   │   │
│   │   ├── layout/                   # Composants de layout (4)
│   │   │   ├── Container.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── projects/                 # Composants projets (5)
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProjectFilters.jsx
│   │   │   ├── ProjectGrid.jsx
│   │   │   ├── ProjectStats.jsx
│   │   │   └── SupportedProjectCard.jsx
│   │   │
│   │   ├── donations/                # Composants donations (4)
│   │   │   ├── DonationCard.jsx
│   │   │   ├── DonationForm.jsx
│   │   │   ├── DonationsList.jsx
│   │   │   └── RecentDonationsList.jsx
│   │   │
│   │   ├── dashboard/                # Composants dashboard (3)
│   │   │   ├── QuickActions.jsx
│   │   │   ├── RecentProjectsList.jsx
│   │   │   └── StatsCard.jsx
│   │   │
│   │   ├── profile/                  # Composants profil (2)
│   │   │   ├── AvatarUpload.jsx
│   │   │   └── ProfileEditor.jsx
│   │   │
│   │   ├── creators/                 # Composants créateurs (2)
│   │   │   ├── CreatorCard.jsx
│   │   │   └── CreatorsGrid.jsx
│   │   │
│   │   ├── admin/                    # Composants admin (1)
│   │   │   └── StatsGrid.jsx
│   │   │
│   │   ├── auth/                     # Composants auth (1)
│   │   │   └── AdminRoute.jsx
│   │   │
│   │   └── ProtectedRoute.jsx        # HOC protection routes
│   │
│   ├── pages/
│   │   ├── public/                   # Pages publiques (5)
│   │   │   ├── ProjectsPage.jsx      # Galerie (homepage)
│   │   │   ├── ProjectDetailPage.jsx # Détail projet
│   │   │   ├── CreatorsPage.jsx      # Liste créateurs
│   │   │   ├── AboutPage.jsx         # À propos
│   │   │   └── FaqPage.jsx           # FAQ
│   │   │
│   │   ├── creator/                  # Pages créateur (4)
│   │   │   ├── CreatorDashboardPage.jsx
│   │   │   ├── MyProjectsPage.jsx
│   │   │   ├── CreateProjectPage.jsx
│   │   │   └── EditProjectPage.jsx
│   │   │
│   │   ├── LoginPage.jsx             # Connexion
│   │   ├── SignupPage.jsx            # Inscription
│   │   ├── DonorDashboardPage.jsx    # Dashboard donateur
│   │   ├── MyDonationsPage.jsx       # Mes dons
│   │   ├── ProjectDonationsPage.jsx  # Dons d'un projet
│   │   ├── AdminDashboardPage.jsx    # Dashboard admin
│   │   ├── AdminProjectsPage.jsx     # Gestion projets admin
│   │   ├── AdminUsersPage.jsx        # Gestion utilisateurs admin
│   │   ├── ComponentsDemo.jsx        # Démo composants (dev)
│   │   └── TestHome.jsx              # Page test (dev)
│   │
│   ├── hooks/                        # Custom React hooks (3)
│   │   ├── useAuth.jsx               # Authentification globale
│   │   ├── useProfile.js             # Gestion profil utilisateur
│   │   └── useAdmin.js               # Fonctions admin
│   │
│   ├── services/                     # Services Supabase (6)
│   │   ├── supabase.js               # Client Supabase
│   │   ├── authService.js            # Service authentification
│   │   ├── projectService.js         # Service projets
│   │   ├── donationService.js        # Service donations
│   │   ├── profileService.js         # Service profils
│   │   └── adminService.js           # Service admin
│   │
│   ├── App.jsx                       # Composant racine + routing
│   ├── main.jsx                      # Point d'entrée React
│   └── index.css                     # Styles globaux + Tailwind v4
│
├── .env                              # Variables d'environnement
├── .env.example                      # Template
├── package.json                      # Dépendances npm
└── vite.config.js                    # Configuration Vite
```

---

## 4. Services Frontend

Les services encapsulent toute la logique de communication avec Supabase.

### 4.1 `supabase.js` - Client Supabase

Initialise et exporte le client Supabase configuré.

**Configuration :**
- `autoRefreshToken: true` - Rafraîchissement auto du token
- `persistSession: true` - Persistance dans localStorage
- `detectSessionInUrl: true` - Détection magic links

### 4.2 `authService.js` - Authentification

| Fonction | Description |
|----------|-------------|
| `signUp(email, password, displayName)` | Inscription + création profil |
| `signIn(email, password)` | Connexion |
| `signOut()` | Déconnexion |
| `getUserProfile(userId)` | Récupération profil |
| `getSession()` | Session active |
| `getUser()` | Utilisateur actuel |
| `updateUserProfile(userId, updates)` | Mise à jour profil |
| `resetPassword(email)` | Réinitialisation mot de passe |
| `updatePassword(newPassword)` | Changement mot de passe |

### 4.3 `projectService.js` - Projets

| Fonction | Description |
|----------|-------------|
| `getProjects(filters)` | Liste avec filtres/tri |
| `getProjectById(projectId)` | Projet par ID |
| `getProjectsByCreator(creatorId)` | Projets d'un créateur |
| `createProject(projectData)` | Création |
| `updateProject(projectId, updates)` | Mise à jour |
| `deleteProject(projectId)` | Suppression |
| `publishProject(projectId)` | Publication (draft → active) |
| `uploadProjectImage(file, projectId)` | Upload image |
| `getProjectStats(projectId)` | Statistiques |

**Filtres supportés :**
- `status` : draft, active, completed, failed, cancelled, suspended
- `search` : Recherche par titre/description
- `sortBy` : newest, oldest, most-funded, ending-soon, popular
- `creator_id` : Filtrer par créateur

### 4.4 `donationService.js` - Donations

| Fonction | Description |
|----------|-------------|
| `getDonationsByProject(projectId)` | Dons d'un projet |
| `getDonationsByDonor(donorId)` | Dons d'un donateur |
| `getDonationById(donationId)` | Don par ID |
| `createDonation(donationData)` | Créer un don |
| `updateDonation(donationId, updates)` | Modifier un don |
| `cancelDonation(donationId)` | Annuler un don |
| `deleteDonation(donationId)` | Supprimer un don |
| `getDonorStats(donorId)` | Statistiques donateur |
| `hasUserDonatedToProject(projectId, donorId)` | Vérifier si déjà donné |

### 4.5 `profileService.js` - Profils

| Fonction | Description |
|----------|-------------|
| `getProfile(userId)` | Récupérer un profil |
| `updateProfile(userId, data)` | Mise à jour display_name et bio |
| `uploadAvatar(userId, file)` | Upload avatar |
| `deleteAvatar(userId, avatarUrl)` | Suppression avatar |
| `getCreatorsWithProjects()` | Créateurs avec compteur projets |

### 4.6 `adminService.js` - Administration

| Fonction | Description |
|----------|-------------|
| `getAllUsers()` | Liste tous les utilisateurs |
| `getAllProjects()` | Liste tous les projets |
| `updateUserRole(userId, role)` | Modifier rôle utilisateur |
| `updateUserStatus(userId, isActive)` | Activer/désactiver compte |
| `updateProjectStatus(projectId, status)` | Modifier statut projet |
| `getAdminStats()` | Statistiques globales |

---

## 5. Hooks React

### 5.1 `useAuth` - Authentification globale

**Localisation** : `src/hooks/useAuth.jsx`

Fournit l'état d'authentification global via React Context.

**États et fonctions :**

| Élément | Type | Description |
|---------|------|-------------|
| `user` | `Object \| null` | Données utilisateur Supabase Auth |
| `profile` | `Object \| null` | Profil depuis table `profiles` |
| `loading` | `boolean` | Chargement en cours |
| `refreshProfile` | `function` | Rafraîchir le profil (ex: après update avatar) |
| `signOut` | `function` | Déconnexion |

**Utilisation :**
```javascript
const { user, profile, loading, refreshProfile, signOut } = useAuth()
```

### 5.2 `useProfile` - Gestion profil

**Localisation** : `src/hooks/useProfile.js`

Hook pour la gestion du profil utilisateur courant.

| Élément | Type | Description |
|---------|------|-------------|
| `profile` | `Object \| null` | Profil utilisateur |
| `loading` | `boolean` | Chargement en cours |
| `error` | `string \| null` | Message d'erreur |
| `updateProfile` | `function` | Mise à jour profil |
| `uploadAvatar` | `function` | Upload avatar |
| `deleteAvatar` | `function` | Supprimer avatar |
| `refresh` | `function` | Recharger profil |

**Synchronisation Header :** Appelle automatiquement `refreshAuthProfile()` après modification pour mettre à jour l'avatar dans le Header.

### 5.3 `useAdmin` - Fonctions admin

**Localisation** : `src/hooks/useAdmin.js`

Hook pour les opérations d'administration.

| Élément | Type | Description |
|---------|------|-------------|
| `users` | `Array` | Liste utilisateurs |
| `projects` | `Array` | Liste projets |
| `stats` | `Object` | Statistiques globales |
| `loading` | `boolean` | Chargement en cours |
| `updateUserRole` | `function` | Modifier rôle |
| `updateUserStatus` | `function` | Activer/désactiver |
| `updateProjectStatus` | `function` | Modifier statut projet |

---

## 6. Composants

### 6.1 Composants UI (`src/components/ui/`)

| Composant | Variants | Tailles | États spéciaux |
|-----------|----------|---------|----------------|
| **Avatar** | - | xs, sm, md, lg, xl, 2xl | fallback (icône/initiales) |
| **Badge** | default, primary, success, warning, error, info, draft, active, completed, failed, cancelled, suspended | sm, md, lg | - |
| **Button** | primary, secondary, outline, ghost, danger, success | sm, md, lg | loading, disabled |
| **Card** | default | - | hover (animation) |
| **FilePicker** | - | - | drag & drop, preview |
| **ImageUpload** | - | - | drag & drop, validation |
| **Input** | - | - | error, disabled, icône |
| **Modal** | - | sm, md, lg, xl, full | fermeture Escape/backdrop |
| **ProgressBar** | primary, success, warning, error | sm, md, lg | animated (shimmer) |
| **Select** | - | - | error, disabled |
| **Skeleton** | default, circle, text | - | animation loading |
| **Textarea** | - | - | compteur caractères |

### 6.2 Composants métier

#### Projets (`src/components/projects/`)
- **ProjectCard** : Carte projet avec image, titre, progression, créateur
- **ProjectFilters** : Barre de filtres (statut, tri, recherche)
- **ProjectGrid** : Grille responsive de ProjectCards
- **ProjectStats** : Statistiques d'un projet (collecté, donateurs, jours restants)
- **SupportedProjectCard** : Carte projet soutenu (dashboard donateur)

#### Donations (`src/components/donations/`)
- **DonationCard** : Carte don avec montant, date, message
- **DonationForm** : Formulaire de don (montant, message)
- **DonationsList** : Liste de donations avec pagination
- **RecentDonationsList** : Liste des derniers dons

#### Dashboard (`src/components/dashboard/`)
- **QuickActions** : Boutons d'actions rapides
- **RecentProjectsList** : Liste projets récents
- **StatsCard** : Carte statistique avec icône

#### Profile (`src/components/profile/`)
- **AvatarUpload** : Upload avatar avec drag & drop
- **ProfileEditor** : Formulaire édition profil (avatar + nom + bio)

#### Creators (`src/components/creators/`)
- **CreatorCard** : Carte créateur avec avatar, bio, nombre projets
- **CreatorsGrid** : Grille responsive de CreatorCards

### 6.3 Composants de protection

- **ProtectedRoute** : HOC redirigeant vers `/login` si non authentifié
- **AdminRoute** : HOC vérifiant le rôle `admin`

---

## 7. Pages

### 7.1 Pages publiques

| Page | Route | Description |
|------|-------|-------------|
| **ProjectsPage** | `/` | Galerie projets (homepage) |
| **ProjectDetailPage** | `/projects/:id` | Détail projet + don |
| **CreatorsPage** | `/creators` | Liste créateurs |
| **AboutPage** | `/about` | À propos |
| **FaqPage** | `/faq` | FAQ |

### 7.2 Pages authentification

| Page | Route | Description |
|------|-------|-------------|
| **LoginPage** | `/login` | Connexion |
| **SignupPage** | `/signup` | Inscription |

### 7.3 Pages créateur (protégées)

| Page | Route | Description |
|------|-------|-------------|
| **CreatorDashboardPage** | `/dashboard` | Dashboard créateur |
| **MyProjectsPage** | `/dashboard/projects` | Mes projets |
| **CreateProjectPage** | `/projects/create` | Créer projet |
| **EditProjectPage** | `/projects/:id/edit` | Éditer projet |

### 7.4 Pages donateur (protégées)

| Page | Route | Description |
|------|-------|-------------|
| **DonorDashboardPage** | `/donor-dashboard` | Dashboard donateur |
| **MyDonationsPage** | `/my-donations` | Historique dons |
| **ProjectDonationsPage** | `/my-projects/:projectId/donations` | Dons d'un projet |

### 7.5 Pages admin (protégées + admin)

| Page | Route | Description |
|------|-------|-------------|
| **AdminDashboardPage** | `/admin` | Dashboard admin |
| **AdminProjectsPage** | `/admin/projects` | Gestion projets |
| **AdminUsersPage** | `/admin/users` | Gestion utilisateurs |

---

## 8. Architecture Supabase

### 8.1 Schéma de base de données

#### Table `profiles`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | PK, FK → auth.users(id) |
| `email` | TEXT | Email (unique) |
| `display_name` | TEXT | Nom affiché |
| `avatar_url` | TEXT | URL avatar |
| `bio` | TEXT | Biographie |
| `role` | user_role | user \| admin |
| `is_active` | BOOLEAN | Compte actif |
| `created_at` | TIMESTAMPTZ | Date création |
| `updated_at` | TIMESTAMPTZ | Dernière MAJ |

#### Table `projects`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | PK |
| `creator_id` | UUID | FK → profiles(id) |
| `title` | TEXT | Titre (3-200 chars) |
| `description` | TEXT | Description (≥10 chars) |
| `image_url` | TEXT | Image principale |
| `goal_amount` | NUMERIC(10,2) | Objectif |
| `deadline` | TIMESTAMPTZ | Date limite |
| `status` | project_status | draft \| active \| completed \| failed \| cancelled \| suspended |
| `created_at` | TIMESTAMPTZ | Date création |
| `updated_at` | TIMESTAMPTZ | Dernière MAJ |

#### Table `donations`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | PK |
| `project_id` | UUID | FK → projects(id) |
| `donor_id` | UUID | FK → profiles(id) |
| `amount` | NUMERIC(10,2) | Montant (>0) |
| `message` | TEXT | Message (≤500 chars) |
| `created_at` | TIMESTAMPTZ | Date don |
| `updated_at` | TIMESTAMPTZ | Dernière MAJ |

### 8.2 Fonctions PostgreSQL

| Fonction | Retour | Description |
|----------|--------|-------------|
| `get_project_total_collected(uuid)` | NUMERIC | Total collecté |
| `get_project_donors_count(uuid)` | BIGINT | Nombre donateurs |
| `get_project_completion_percentage(uuid)` | NUMERIC | % complétion |
| `auto_complete_projects()` | BIGINT | Complète projets échus |
| `handle_new_user()` | TRIGGER | Crée profil à l'inscription |

### 8.3 Row Level Security (RLS)

RLS activé sur les 3 tables avec politiques pour :
- Lecture publique des projets actifs
- Lecture/écriture par propriétaire
- Accès admin complet

### 8.4 Storage

| Bucket | Usage | Accès |
|--------|-------|-------|
| `project-images` | Images des projets | Public read, auth write |
| `avatars` | Avatars utilisateurs | Public read, auth write |

**Structure fichiers :**
```
project-images/{project_id}/{project_id}-{timestamp}.jpg
avatars/{user_id}/{user_id}-{timestamp}.jpg
```

---

## 9. Flux d'authentification

### Inscription

```
SignupPage → authService.signUp()
    → Supabase Auth.signUp()
    → Trigger handle_new_user() → Crée profil
    → AuthProvider détecte changement
    → Chargement profil
    → Redirection /dashboard
```

### Connexion

```
LoginPage → authService.signIn()
    → Supabase Auth.signInWithPassword()
    → Session stockée localStorage
    → AuthProvider détecte changement
    → Chargement profil
    → Redirection selon rôle
```

### Persistance

- Token JWT + refresh token dans localStorage
- Auto-refresh avant expiration
- Session survit au rafraîchissement de page

---

## 10. Routes et navigation

### Routes publiques

| Route | Page | Description |
|-------|------|-------------|
| `/` | ProjectsPage | Galerie (homepage) |
| `/projects/:id` | ProjectDetailPage | Détail projet |
| `/creators` | CreatorsPage | Liste créateurs |
| `/about` | AboutPage | À propos |
| `/faq` | FaqPage | FAQ |
| `/login` | LoginPage | Connexion |
| `/signup` | SignupPage | Inscription |

### Routes protégées (authentification)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | CreatorDashboardPage | Dashboard créateur |
| `/dashboard/projects` | MyProjectsPage | Mes projets |
| `/projects/create` | CreateProjectPage | Créer projet |
| `/projects/:id/edit` | EditProjectPage | Éditer projet |
| `/donor-dashboard` | DonorDashboardPage | Dashboard donateur |
| `/my-donations` | MyDonationsPage | Historique dons |
| `/my-projects/:projectId/donations` | ProjectDonationsPage | Dons d'un projet |

### Routes admin (authentification + rôle admin)

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | AdminDashboardPage | Dashboard admin |
| `/admin/projects` | AdminProjectsPage | Gestion projets |
| `/admin/users` | AdminUsersPage | Gestion utilisateurs |

### Routes développement

| Route | Page | Description |
|-------|------|-------------|
| `/test` | TestHome | Page test |
| `/components` | ComponentsDemo | Démo composants UI |

---

## 11. Patterns et conventions

### Nommage

- **Composants** : PascalCase (`ProjectCard.jsx`)
- **Services/hooks** : camelCase (`projectService.js`, `useAuth.jsx`)
- **Variables** : camelCase (`userName`, `isLoading`)
- **Constantes** : SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`)

### Organisation des imports

```javascript
// 1. React
import { useState, useEffect } from 'react'

// 2. Bibliothèques tierces
import { Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'

// 3. Composants
import { Button } from '@/components/ui/Button'

// 4. Services/hooks
import { useAuth } from '@/hooks/useAuth'
```

### Pattern de retour des services

```javascript
// Toutes les fonctions retournent { data, error }
const { data, error } = await projectService.getProjects()
```

### Gestion d'erreurs

```javascript
setLoading(true)
setError('')

const { data, error } = await service.doSomething()

if (error) {
  setError(error.message)
  setLoading(false)
  return
}

// Succès
setLoading(false)
```

### Tailwind CSS

- **Mobile-first** : Classes sans breakpoint = mobile
- **Breakpoints** : `md:` (tablet), `lg:` (desktop)

---

## 12. Variables d'environnement

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Publishable Key |

**Utilisation :**
```javascript
const url = import.meta.env.VITE_SUPABASE_URL
```

**Note** : Préfixe `VITE_` obligatoire pour exposition au client.

---

**Dernière mise à jour** : 19 janvier 2026
**Version** : 1.0.0 (MVP)
