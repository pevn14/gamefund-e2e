# GameFund - Documentation d'Architecture

**Version** : 0.4.0
**Dernière mise à jour** : 05 janvier 2026
**Phase actuelle** : Phase 4 - Configuration Supabase complète

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Structure des dossiers](#3-structure-des-dossiers)
4. [Services Frontend](#4-services-frontend)
5. [Hooks React](#5-hooks-react)
6. [Composants UI](#6-composants-ui)
7. [Architecture Supabase](#7-architecture-supabase)
8. [Flux d'authentification](#8-flux-dauthentification)
9. [Routes et navigation](#9-routes-et-navigation)
10. [Patterns et conventions](#10-patterns-et-conventions)
11. [Variables d'environnement](#11-variables-denvironnement)
12. [Décisions architecturales](#12-décisions-architecturales)
13. [Points d'attention](#13-points-dattention)

---

## 1. Vue d'ensemble

GameFund est une plateforme de crowdfunding dédiée aux créateurs de jeux vidéo indépendants. L'application permet aux développeurs de créer des campagnes de financement et aux donateurs de soutenir les projets qui les passionnent.

### Objectif du projet

Projet expérimental développé entièrement avec **Claude Code** pour démontrer l'intégration React + Supabase et servir de base réutilisable pour des projets similaires.

### Architecture globale

```
┌─────────────────────────────────────────────────┐
│              Frontend (React)                   │
│  ┌─────────────┐  ┌──────────────┐            │
│  │  Components │  │  Pages       │            │
│  └─────────────┘  └──────────────┘            │
│  ┌─────────────┐  ┌──────────────┐            │
│  │  Services   │  │  Hooks       │            │
│  └─────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
                      ↓ ↑
                 Supabase SDK
                      ↓ ↑
┌─────────────────────────────────────────────────┐
│           Backend (Supabase)                    │
│  ┌─────────────┐  ┌──────────────┐            │
│  │  PostgreSQL │  │  Auth        │            │
│  └─────────────┘  └──────────────┘            │
│  ┌─────────────┐  ┌──────────────┐            │
│  │  Storage    │  │  RLS         │            │
│  └─────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

---

## 2. Stack technique

### Frontend

| Technologie | Version | Usage |
|------------|---------|-------|
| **React** | 19.2.0 | Framework UI |
| **Vite** | 7.2.4 | Build tool & dev server |
| **Tailwind CSS** | 4.1.18 | Framework CSS (CSS-first config) |
| **React Router** | 7.11.0 | Routing SPA |
| **Lucide React** | 0.562.0 | Bibliothèque d'icônes |
| **Supabase JS** | 2.89.0 | Client SDK pour Supabase |

### Backend (Supabase)

| Service | Usage |
|---------|-------|
| **PostgreSQL** | Base de données relationnelle |
| **Auth** | Authentification JWT + gestion sessions |
| **Storage** | Stockage d'images de projets |
| **Row Level Security (RLS)** | Sécurité au niveau des lignes |

### Outils de développement

- **ESLint** : Linting JavaScript/React
- **Git** : Contrôle de version
- **Claude Code** : Assistant de développement IA

---

## 3. Structure des dossiers

```
gamefund/
├── docs/                          # Documentation du projet
│   ├── ARCHITECTURE.md            # 👈 Ce fichier
│   ├── PRD_GameFund.md           # Product Requirements Document
│   ├── DESIGN_GUIDE.md           # Guide de design (Tailwind v4)
│   ├── ACTION_PLAN.md            # Plan d'action détaillé
│   ├── PROGRESS.md               # Suivi de progression
│   ├── SUPABASE_SETUP.md         # Guide de configuration Supabase
│   ├── TESTS.md                  # Journal des tests
│   ├── CHANGELOG.md              # Historique des changements
│   └── HOWTO.md                  # Guides pratiques
│
├── src/
│   ├── components/
│   │   ├── ui/                   # Composants UI réutilisables (11 composants)
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Select.jsx
│   │   │   └── FilePicker.jsx
│   │   │
│   │   └── layout/               # Composants de layout
│   │       ├── Container.jsx
│   │       ├── Header.jsx
│   │       └── Footer.jsx
│   │
│   ├── pages/                    # Pages de l'application
│   │   ├── TestHome.jsx         # Page d'accueil tests (dev)
│   │   ├── ComponentsDemo.jsx   # Démo composants UI
│   │   └── SupabaseTest.jsx     # Tests Supabase
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── useAuth.jsx          # Hook d'authentification global
│   │
│   ├── services/                 # Services de communication avec Supabase
│   │   ├── supabase.js          # Client Supabase
│   │   ├── authService.js       # Service d'authentification
│   │   ├── projectService.js    # Service projets (CRUD)
│   │   └── donationService.js   # Service donations (CRUD)
│   │
│   ├── App.jsx                   # Composant racine + routing
│   ├── main.jsx                  # Point d'entrée React
│   └── index.css                 # Styles globaux + config Tailwind v4
│
├── .env                          # Variables d'environnement (non versionné)
├── .env.example                  # Template de variables d'environnement
├── .gitignore                    # Fichiers ignorés par Git
├── package.json                  # Dépendances npm
├── vite.config.js                # Configuration Vite + plugin Tailwind
└── README.md                     # Documentation principale
```

### Organisation par fonctionnalité

À venir dans les prochaines phases :

```
src/
├── components/
│   ├── projects/        # Composants spécifiques aux projets
│   └── donations/       # Composants spécifiques aux donations
├── pages/
│   ├── public/          # Pages publiques (accueil, galerie)
│   ├── creator/         # Pages créateur (dashboard, CRUD projets)
│   ├── donor/           # Pages donateur (historique dons)
│   └── admin/           # Pages admin
└── utils/               # Fonctions utilitaires
```

---

## 4. Services Frontend

Les services encapsulent toute la logique de communication avec Supabase.

### 4.1 `supabase.js` - Client Supabase

**Responsabilité** : Initialiser et exporter le client Supabase configuré.

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,      // Rafraîchissement auto du token
    persistSession: true,         // Persistance dans localStorage
    detectSessionInUrl: true,     // Détection magic links
  },
})
```

**Configuration importante :**
- Utilise la **Publishable Key** (format `sb_publishable_...`) - nouvelle nomenclature Supabase
- Session persistée dans `localStorage` pour survivre aux rafraîchissements de page
- Auto-refresh du token JWT avant expiration

### 4.2 `authService.js` - Service d'authentification

**Responsabilité** : Toutes les opérations d'authentification.

**Fonctions disponibles :**

| Fonction | Description | Statut |
|----------|-------------|--------|
| `signUp(email, password, displayName)` | Inscription utilisateur + création profil | ✅ Testé |
| `signIn(email, password)` | Connexion utilisateur | ✅ Testé |
| `signOut()` | Déconnexion | ✅ Testé |
| `getUserProfile(userId)` | Récupération profil depuis DB | ✅ Testé |
| `getSession()` | Récupération session active | ❌ Non testé |
| `getUser()` | Récupération utilisateur actuel | ❌ Non testé |
| `updateUserProfile(userId, updates)` | Mise à jour profil | ❌ Non testé |
| `resetPassword(email)` | Réinitialisation mot de passe | ❌ Non testé |
| `updatePassword(newPassword)` | Changement mot de passe | ❌ Non testé |

**Pattern de retour :**
```javascript
// Toutes les fonctions retournent { data, error }
const { user, error } = await signUp(email, password, displayName)
```

**Point d'attention :** Les métadonnées utilisateur (`display_name`) sont stockées dans `raw_user_meta_data` et récupérées par le trigger PostgreSQL `handle_new_user()`.

### 4.3 `projectService.js` - Service Projets

**Responsabilité** : CRUD projets + statistiques.

**Fonctions disponibles :**

| Fonction | Description | Statut |
|----------|-------------|--------|
| `getProjects(filters)` | Récupération projets avec filtres/tri | ❌ Non testé |
| `getProjectById(projectId)` | Récupération projet par ID | ❌ Non testé |
| `getProjectsByCreator(creatorId)` | Projets d'un créateur | ❌ Non testé |
| `createProject(projectData)` | Création projet | ❌ Non testé |
| `updateProject(projectId, updates)` | Mise à jour projet | ❌ Non testé |
| `deleteProject(projectId)` | Suppression projet | ❌ Non testé |
| `publishProject(projectId)` | Publication projet (draft → active) | ❌ Non testé |
| `uploadProjectImage(file, projectId)` | Upload image vers Storage | ❌ Non testé |
| `getProjectStats(projectId)` | Statistiques projet | ❌ Non testé |

**Filtres supportés :**
- `status` : Filtrer par statut (draft, active, completed, etc.)
- `search` : Recherche par titre/description
- `sortBy` : Tri (newest, oldest, most-funded, ending-soon, popular)

### 4.4 `donationService.js` - Service Donations

**Responsabilité** : CRUD donations + vérifications.

**Fonctions disponibles :**

| Fonction | Description | Statut |
|----------|-------------|--------|
| `getDonationsByProject(projectId)` | Dons d'un projet | ❌ Non testé |
| `getDonationsByDonor(donorId)` | Dons d'un donateur | ❌ Non testé |
| `getDonationById(donationId)` | Don par ID | ❌ Non testé |
| `createDonation(donationData)` | Créer un don | ❌ Non testé |
| `updateDonation(donationId, updates)` | Modifier un don | ❌ Non testé |
| `cancelDonation(donationId)` | Annuler un don | ❌ Non testé |
| `deleteDonation(donationId)` | Supprimer un don | ❌ Non testé |
| `getDonorStats(donorId)` | Statistiques donateur | ❌ Non testé |
| `hasUserDonatedToProject(projectId, donorId)` | Vérifier si déjà donné | ❌ Non testé |

---

## 5. Hooks React

### 5.1 `useAuth` - Hook d'authentification global

**Localisation** : `src/hooks/useAuth.jsx`

**Responsabilité** : Fournir l'état d'authentification global à toute l'application via React Context.

**Architecture :**

```
AuthProvider (Context Provider)
    ↓
  useAuth() (Hook custom)
    ↓
Composants (accès à user, profile, loading, signOut)
```

**États gérés :**

| État | Type | Description |
|------|------|-------------|
| `user` | `Object \| null` | Données utilisateur de Supabase Auth (id, email, metadata) |
| `profile` | `Object \| null` | Profil utilisateur de la table `profiles` (display_name, role, avatar_url, etc.) |
| `loading` | `boolean` | Indique si les données sont en cours de chargement |
| `signOut` | `function` | Fonction de déconnexion |

**Fonctionnement :**

1. **Au montage** (`useEffect`) :
   - Récupère la session initiale via `supabase.auth.getSession()`
   - Si session existante, charge le profil depuis la DB
   - Configure un listener `onAuthStateChange` pour écouter les changements d'authentification

2. **Lors d'un changement d'état auth** :
   - Connexion → Charge le profil utilisateur
   - Déconnexion → Réinitialise `user` et `profile` à `null`

3. **Nettoyage** :
   - Se désabonne du listener au démontage

**Utilisation dans un composant :**

```javascript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, profile, loading, signOut } = useAuth()

  if (loading) return <div>Chargement...</div>

  if (!user) return <div>Non connecté</div>

  return (
    <div>
      <p>Bonjour {profile?.display_name}</p>
      <p>Rôle : {profile?.role}</p>
      <button onClick={signOut}>Se déconnecter</button>
    </div>
  )
}
```

**Points importants :**
- Le hook doit être utilisé **uniquement dans des composants enfants de `<AuthProvider>`**
- La session est **persistée automatiquement** dans `localStorage` par Supabase
- Le profil est rechargé à chaque connexion pour garantir la fraîcheur des données

---

## 6. Composants UI

### 6.1 Bibliothèque de composants réutilisables

**Localisation** : `src/components/ui/`

**Philosophie** : Composants headless personnalisés, stylisés avec Tailwind CSS v4, sans dépendance à des bibliothèques tierces (sauf Lucide React pour les icônes).

| Composant | Variants | Tailles | États spéciaux |
|-----------|----------|---------|----------------|
| **Button** | primary, secondary, outline, ghost, danger, success | sm, md, lg | loading, disabled |
| **Card** | default | - | hover (avec animation) |
| **Badge** | default, primary, success, warning, error, info, draft, active, completed, failed, cancelled, suspended | sm, md, lg | - |
| **Input** | - | - | error, disabled, avec icône |
| **Textarea** | - | - | compteur de caractères, maxLength |
| **ProgressBar** | primary, success, warning, error | sm, md, lg | animated (shimmer) |
| **Avatar** | - | xs, sm, md, lg, xl, 2xl | fallback (icône ou initiales) |
| **Skeleton** | default, circle, text | - | animation loading |
| **Modal** | - | sm, md, lg, xl, full | fermeture Escape/backdrop |
| **Select** | - | - | error, disabled, icône chevron |
| **FilePicker** | - | - | drag & drop, preview |

### 6.2 Composants de layout

**Localisation** : `src/components/layout/`

| Composant | Responsabilité |
|-----------|---------------|
| **Container** | Wrapper responsive avec max-width et padding horizontal |
| **Header** | Barre de navigation sticky avec logo, menu, boutons auth |
| **Footer** | Pied de page avec liens et réseaux sociaux |

### 6.3 Patterns de conception

**Composition de composants :**

```javascript
// Pattern Card composable
<Card hover>
  <CardImage src="..." alt="..." />
  <CardContent>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardContent>
  <CardFooter>
    Contenu du footer
  </CardFooter>
</Card>
```

**forwardRef pour les inputs** (compatibilité React Hook Form) :

```javascript
export const Input = forwardRef(({ label, error, ...props }, ref) => {
  return <input ref={ref} {...props} />
})
```

**Conditional styling avec template literals :**

```javascript
<button className={`
  base-classes
  ${variant === 'primary' ? 'bg-primary-600' : 'bg-gray-600'}
  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
`}>
```

---

## 7. Architecture Supabase

### 7.1 Schéma de base de données

**3 tables principales :**

#### Table `profiles`

Profils utilisateurs liés à `auth.users` via foreign key.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, FK → `auth.users(id)` | ID utilisateur |
| `email` | TEXT | UNIQUE, NOT NULL | Email |
| `display_name` | TEXT | - | Nom affiché |
| `avatar_url` | TEXT | - | URL avatar |
| `bio` | TEXT | - | Biographie |
| `role` | `user_role` | NOT NULL, DEFAULT 'user' | Rôle (user, admin) |
| `is_active` | BOOLEAN | DEFAULT true | Compte actif |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Dernière mise à jour |

**Trigger** : `handle_new_user()` - Crée automatiquement le profil lors de l'inscription.

#### Table `projects`

Projets de crowdfunding.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT `uuid_generate_v4()` | ID projet |
| `creator_id` | UUID | FK → `profiles(id)`, NOT NULL | Créateur du projet |
| `title` | TEXT | NOT NULL, CHECK (3-200 chars) | Titre |
| `description` | TEXT | NOT NULL, CHECK (≥10 chars) | Description |
| `image_url` | TEXT | NOT NULL | Image principale |
| `goal_amount` | NUMERIC(10,2) | NOT NULL, CHECK (>0) | Objectif de financement |
| `deadline` | TIMESTAMPTZ | NOT NULL | Date limite |
| `status` | `project_status` | DEFAULT 'draft' | Statut (draft, active, completed, failed, cancelled, suspended) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Dernière mise à jour |

**Index** :
- `idx_projects_creator` sur `creator_id`
- `idx_projects_status` sur `status`
- `idx_projects_deadline` sur `deadline`
- `idx_projects_status_deadline` sur `(status, deadline)`

#### Table `donations`

Dons des utilisateurs vers les projets.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT `uuid_generate_v4()` | ID don |
| `project_id` | UUID | FK → `projects(id)`, NOT NULL | Projet financé |
| `donor_id` | UUID | FK → `profiles(id)`, NOT NULL | Donateur |
| `amount` | NUMERIC(10,2) | NOT NULL, CHECK (>0) | Montant du don |
| `message` | TEXT | CHECK (≤500 chars) | Message optionnel |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Date du don |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Dernière mise à jour |

**Index** :
- `idx_donations_project` sur `project_id`
- `idx_donations_donor` sur `donor_id`
- `idx_donations_project_amount` sur `(project_id, amount)`

### 7.2 Fonctions PostgreSQL

| Fonction | Retour | Description |
|----------|--------|-------------|
| `get_project_total_collected(project_uuid)` | NUMERIC | Montant total collecté pour un projet |
| `get_project_donors_count(project_uuid)` | BIGINT | Nombre de donateurs uniques |
| `get_project_completion_percentage(project_uuid)` | NUMERIC | Pourcentage de complétion (0-100+) |
| `auto_complete_projects()` | BIGINT | Complète les projets échus (active → completed/failed) |
| `update_updated_at()` | TRIGGER | Met à jour `updated_at` lors d'un UPDATE |
| `handle_new_user()` | TRIGGER | Crée le profil lors de l'inscription |

### 7.3 Row Level Security (RLS)

**RLS activé sur les 3 tables.**

#### Politiques `profiles`

| Politique | Type | Condition |
|-----------|------|-----------|
| Users can view own profile | SELECT | `auth.uid() = id` |
| Users can update own profile | UPDATE | `auth.uid() = id` |
| Enable insert for authenticated users | INSERT | `true` (trigger handle_new_user) |
| Active profiles viewable by authenticated users | SELECT | `is_active = true AND auth.role() = 'authenticated'` |

#### Politiques `projects`

| Politique | Type | Condition |
|-----------|------|-----------|
| Active projects viewable by everyone | SELECT | `status = 'active'` |
| Users can view own projects | SELECT | `auth.uid() = creator_id` |
| Authenticated users can create projects | INSERT | `auth.uid() = creator_id` |
| Creators can update own projects | UPDATE | `auth.uid() = creator_id` |
| Creators can delete own draft projects without donations | DELETE | `auth.uid() = creator_id AND status = 'draft' AND NOT EXISTS (donations)` |
| Admin can view all projects | SELECT | `role = 'admin'` |
| Admin can update all projects | UPDATE | `role = 'admin'` |
| Admin can delete all projects | DELETE | `role = 'admin'` |

#### Politiques `donations`

| Politique | Type | Condition |
|-----------|------|-----------|
| Donations viewable by everyone | SELECT | `true` |
| Authenticated users can donate | INSERT | `auth.uid() = donor_id AND project.status = 'active'` |
| Donors can update own donations | UPDATE | `auth.uid() = donor_id AND project.status = 'active'` |
| Donors can delete own donations | DELETE | `auth.uid() = donor_id AND project.status = 'active'` |
| Admin can manage all donations | ALL | `role = 'admin'` |

**Points d'attention RLS :**
- Politiques simplifiées pour éviter les dépendances circulaires
- Utilisation de `auth.uid()` et `auth.role()` plutôt que des sous-requêtes sur `profiles`
- Les politiques admin utilisent `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`

**Vérification rapide RLS :**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- Résultat attendu : rowsecurity = true pour profiles, projects, donations
```

### 7.4 Storage (Supabase Storage)

**Bucket** : `project-images` (public)

**Politiques Storage :**

| Politique | Type | Condition |
|-----------|------|-----------|
| Public read access | SELECT | `bucket_id = 'project-images'` |
| Authenticated users can upload | INSERT | `bucket_id = 'project-images' AND authenticated` |
| Users can delete own images | DELETE | `bucket_id = 'project-images' AND uid = foldername[1]` |
| Admin can delete all images | DELETE | `bucket_id = 'project-images' AND role = 'admin'` |

**Organisation des fichiers :**
```
project-images/
  ├── {project_id}/
  │   ├── {project_id}-{timestamp}.jpg
  │   └── {project_id}-{timestamp}.png
```

**URL publique** :
```
https://{project_url}.supabase.co/storage/v1/object/public/project-images/{project_id}/{filename}
```

### 7.5 Edge Functions (à venir)

Actuellement non utilisées. Potentiellement utiles pour :
- Webhook de paiement (Stripe)
- Envoi d'emails (notifications)
- Génération de rapports

---

## 8. Flux d'authentification

### 8.1 Inscription (Sign Up)

```
User → Frontend (SignupPage)
  ↓
  signUp(email, password, displayName)
  ↓
  Supabase Auth.signUp()
  ↓
  [Trigger] handle_new_user()
  ↓
  Création profil dans table profiles
  ↓
  [Frontend] AuthProvider détecte changement
  ↓
  Chargement profil via getUserProfile()
  ↓
  État global mis à jour (user + profile)
  ↓
  Redirection vers Dashboard
```

**Points clés :**
- `display_name` stocké dans `raw_user_meta_data` lors de l'inscription
- Trigger PostgreSQL crée automatiquement le profil
- Email de confirmation envoyé par défaut (configurable dans Supabase Auth)

### 8.2 Connexion (Sign In)

```
User → Frontend (LoginPage)
  ↓
  signIn(email, password)
  ↓
  Supabase Auth.signInWithPassword()
  ↓
  Session créée et stockée dans localStorage
  ↓
  [Frontend] AuthProvider détecte changement
  ↓
  Chargement profil via getUserProfile()
  ↓
  État global mis à jour (user + profile)
  ↓
  Redirection selon rôle (user → Dashboard, admin → Admin Panel)
```

**Persistance de session :**
- Token JWT + refresh token stockés dans `localStorage`
- Session survit au rafraîchissement de page
- Auto-refresh du token avant expiration (configuré dans `supabase.js`)

### 8.3 Déconnexion (Sign Out)

```
User → Frontend (Header/Dashboard)
  ↓
  signOut() depuis useAuth
  ↓
  Supabase Auth.signOut()
  ↓
  Suppression session localStorage
  ↓
  [Frontend] AuthProvider détecte changement
  ↓
  user et profile = null
  ↓
  Redirection vers HomePage
```

### 8.4 Protection des routes (à venir Phase 5+)

```javascript
// Exemple de ProtectedRoute
function ProtectedRoute({ children, requiredRole = 'user' }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <Skeleton />

  if (!user) return <Navigate to="/login" />

  if (profile.role !== requiredRole && requiredRole !== 'user') {
    return <Navigate to="/unauthorized" />
  }

  return children
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

<Route path="/admin" element={
  <ProtectedRoute requiredRole="admin">
    <AdminPanel />
  </ProtectedRoute>
} />
```

---

## 9. Routes et navigation

### 9.1 Routes actuelles (Phase 4)

| Route | Composant | Description | Protection |
|-------|-----------|-------------|-----------|
| `/` | TestHome | Page d'accueil tests (dev) | Public |
| `/components` | ComponentsDemo | Démo composants UI | Public |
| `/supabase-test` | SupabaseTest | Tests Supabase & Auth | Public |

### 9.2 Routes prévues (Phases suivantes)

#### Routes publiques
- `/` - HomePage (galerie publique de projets)
- `/projects` - ProjectsPage (liste filtrée)
- `/projects/:id` - ProjectDetailPage (détails + donations)
- `/login` - LoginPage
- `/signup` - SignupPage
- `/reset-password` - ResetPasswordPage

#### Routes protégées (authentification requise)
- `/dashboard` - Dashboard (user/creator)
- `/profile` - ProfilePage (édition profil)
- `/projects/new` - CreateProjectPage (créateur)
- `/projects/:id/edit` - EditProjectPage (créateur)
- `/donations` - DonationsHistoryPage (donateur)

#### Routes admin (role = 'admin')
- `/admin` - AdminDashboard
- `/admin/users` - UsersManagement
- `/admin/projects` - ProjectsManagement
- `/admin/stats` - Statistics

### 9.3 Configuration React Router

**Localisation** : `src/App.jsx`

```javascript
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Routes protégées */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      {/* Routes admin */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminRoutes />
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

---

## 10. Patterns et conventions

### 10.1 Nommage

**Composants** : PascalCase
```javascript
export function Button() {}
export function ProjectCard() {}
```

**Fichiers** : PascalCase pour composants, camelCase pour services/hooks
```
Button.jsx
ProjectCard.jsx
authService.js
useAuth.jsx
```

**Variables** : camelCase
```javascript
const userName = 'Alice'
const isLoading = false
```

**Constantes** : SCREAMING_SNAKE_CASE
```javascript
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const API_BASE_URL = 'https://api.example.com'
```

### 10.2 Organisation des imports

```javascript
// 1. Imports React
import { useState, useEffect } from 'react'

// 2. Imports bibliothèques tierces
import { Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'

// 3. Imports composants
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

// 4. Imports services/hooks
import { useAuth } from '@/hooks/useAuth'
import * as authService from '@/services/authService'

// 5. Imports styles (si nécessaire)
import './styles.css'
```

### 10.3 Gestion d'état

**État local** (useState) pour :
- Formulaires
- UI temporaire (modales ouvertes/fermées, etc.)
- États spécifiques au composant

**Context API** (useAuth) pour :
- Authentification globale
- Préférences utilisateur (à venir : thème, langue)

**Props drilling limité** :
- Utiliser Context pour les données partagées
- Maximum 2-3 niveaux de props

### 10.4 Gestion des erreurs

**Pattern standard :**
```javascript
async function handleSubmit() {
  setError('')
  setLoading(true)

  try {
    const { data, error } = await someService.doSomething()

    if (error) {
      setError(error.message)
      return
    }

    // Succès
    setMessage('Opération réussie')
  } catch (err) {
    setError('Une erreur inattendue est survenue')
    console.error(err)
  } finally {
    setLoading(false)
  }
}
```

### 10.5 Tailwind CSS

**Mobile-first** :
```javascript
// Classes sans breakpoint = mobile
// Ajouter breakpoints pour tailles supérieures
<div className="
  grid grid-cols-1       /* Mobile */
  md:grid-cols-2         /* Tablet */
  lg:grid-cols-3         /* Desktop */
">
```

**Organisation des classes** :
```javascript
// Grouper logiquement
<button className="
  px-6 py-3                          /* Spacing */
  text-white font-medium             /* Typography */
  bg-primary-600 hover:bg-primary-700 /* Colors */
  rounded-lg shadow-sm               /* Visual */
  transition-all duration-200        /* Animation */
">
```

---

## 11. Variables d'environnement

**Fichier** : `.env` (non versionné, utiliser `.env.example` comme template)

### Variables Supabase

| Variable | Format | Exemple | Description |
|----------|--------|---------|-------------|
| `VITE_SUPABASE_URL` | URL | `https://xxxxx.supabase.co` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique | `sb_publishable_...` | Publishable Key (nouvelle nomenclature) |

**Note importante** : Utiliser la **Publishable Key** (format `sb_publishable_...`) au lieu de l'ancienne "anon key" (format JWT `eyJ...`). Les clés legacy seront dépréciées en novembre 2025.

### Variables App

| Variable | Valeur | Description |
|----------|--------|-------------|
| `VITE_APP_ENV` | `development` / `production` | Environnement |
| `VITE_APP_NAME` | `GameFund` | Nom de l'application |

### Utilisation dans le code

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const appName = import.meta.env.VITE_APP_NAME
```

**Préfixe obligatoire** : `VITE_` pour que les variables soient exposées au client par Vite.

---

## 12. Décisions architecturales

### 12.1 Pourquoi Tailwind CSS v4 ?

**Avantages :**
- Configuration CSS-first (plus besoin de `tailwind.config.js`)
- Autoprefixer intégré
- Performance améliorée
- Thème personnalisable via `@theme` dans CSS

**Migration v3 → v4 :**
- `@import "tailwindcss"` au lieu de `@tailwind base/components/utilities`
- Plugin Vite : `@tailwindcss/vite`
- Noms de radius modifiés (`rounded` → `rounded-sm`, `rounded-sm` → `rounded-xs`)

### 12.2 Pourquoi React Context pour l'auth ?

**Avantages :**
- Simple pour un projet de cette taille
- Pas de dépendance externe (Redux, Zustand)
- Supabase gère déjà la persistance de session
- Réactivité native avec `onAuthStateChange`

**Alternative non retenue** : Redux Toolkit
- Trop complexe pour un seul state global (auth)
- Supabase SDK suffit pour la gestion de session

### 12.3 Pourquoi Supabase ?

**Avantages :**
- Backend complet (DB + Auth + Storage) en un service
- PostgreSQL (robuste, relationnel)
- RLS intégré (sécurité au niveau des lignes)
- SDK JavaScript officiel
- Gratuit pour MVP (plan Free généreux)

**Alternative non retenue** : Firebase
- Firestore (NoSQL) moins adapté aux relations complexes (projets ↔ donations)
- Pas de RLS natif

### 12.4 Pourquoi des composants personnalisés plutôt qu'une UI library ?

**Avantages :**
- Contrôle total sur le design
- Pas de dépendance lourde (Material-UI, Ant Design)
- Apprentissage React/Tailwind
- Composants légers et optimisés

**Alternative non retenue** : Headless UI / Radix UI
- Prévues pour Phase 12 (accessibilité avancée)
- Pour le MVP, composants maison suffisants

---

## 13. Points d'attention

### 13.1 Sécurité

**RLS (Row Level Security)** :
- ✅ Activé sur toutes les tables
- ⚠️ Politiques simplifiées pour éviter les dépendances circulaires
- ⚠️ Tester les politiques avant déploiement en production

**Validation des données** :
- ✅ Contraintes PostgreSQL (CHECK, NOT NULL, FK)
- ❌ Validation frontend à ajouter (React Hook Form + Zod)
- ❌ Validation backend via Edge Functions (à venir)

**Secrets** :
- ✅ `.env` dans `.gitignore`
- ⚠️ Ne JAMAIS exposer `service_role` key côté client
- ✅ Utiliser Publishable Key pour le client

### 13.2 Performance

**Optimisations actuelles** :
- Index sur colonnes fréquemment requêtées (`creator_id`, `status`, `deadline`)
- Fonctions PostgreSQL pour calculs agrégés (évite N+1 queries)
- Images lazy-loading (`loading="lazy"`)
- Skeleton loading pour meilleure UX

**Optimisations à prévoir** :
- Pagination des projets (Phase 6)
- Cache avec React Query (Phase 10)
- Optimisation images (compression, formats WebP)
- Code splitting (React.lazy)

### 13.3 Accessibilité

**Bonnes pratiques appliquées** :
- Labels pour tous les inputs
- Alt text pour images
- Focus states visibles (`focus:ring-2`)
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)

**À améliorer (Phase 12)** :
- ARIA attributes complets
- Navigation au clavier
- Lecteur d'écran
- Tests avec axe DevTools

### 13.4 Testing (à venir Phase 12)

**Tests prévus** :
- **Unit tests** : Services (Jest + @testing-library/react)
- **Integration tests** : Hooks, composants complexes
- **E2E tests** : Flux critiques (Playwright ou Cypress)

### 13.5 Limitations connues

**Phase 4 (actuelle)** :
- Pas de gestion d'erreur globale (ErrorBoundary à ajouter)
- Pas de validation de formulaires (React Hook Form à intégrer)
- Pas de système de notifications (toast/snackbar)
- Storage policies non testées (upload d'images à tester en Phase 7)

**Base de données** :
- Pas de soft delete (suppression définitive)
- Pas de versioning des projets
- Pas d'audit log

---

## Annexes

### A. Commandes utiles

**Développement** :
```bash
npm run dev          # Démarrer serveur dev (http://localhost:5173)
npm run build        # Build de production
npm run preview      # Prévisualiser build
npm run lint         # Linter ESLint
```

**Git** :
```bash
git status           # Voir modifications
git add .            # Ajouter tous les fichiers
git commit -m "..."  # Créer commit
git push             # Pousser vers remote
```

**Supabase (SQL Editor)** :
```sql
-- Vérifier RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Stats projets
SELECT status, COUNT(*) FROM projects GROUP BY status;

-- Montant total collecté
SELECT SUM(amount) FROM donations;
```

### B. Ressources

**Documentation officielle :**
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)
- [Supabase](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/)

**Guides internes :**
- [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) - Guide de design Tailwind v4
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Configuration Supabase
- [TESTS.md](./TESTS.md) - Journal des tests
- [PROGRESS.md](./PROGRESS.md) - Suivi de progression

---

**Dernière mise à jour** : 05 janvier 2026
**Version** : 0.4.0
**Phase complétée** : Phase 4 - Configuration Supabase

Ce document doit être mis à jour à chaque phase importante du projet.
