# Phase 7 - CRUD Projets

Tests complets pour la création, édition, publication et suppression de projets par les créateurs.

## 📁 Structure

```
e2e/projects/
├── helpers.js              # Fonctions utilitaires réutilisables
├── fixtures.js             # Données de test et constantes
├── 01-create-project.spec.js    # Tests de création de projets
├── 02-edit-project.spec.js      # Tests d'édition de projets
├── 03-publish-project.spec.js   # Tests de publication de projets
├── 04-delete-project.spec.js    # Tests de suppression de projets
└── README.md               # Documentation (ce fichier)
```

## 🎯 Objectifs

- **Création** : Valider le formulaire de création et la sauvegarde en brouillon
- **Édition** : Tester la modification des informations des projets
- **Publication** : Vérifier le passage de brouillon à projet actif
- **Suppression** : Valider la suppression avec confirmation

## 🚀 Fonctionnalités testées

### ✅ Création de projets
- Formulaire complet avec validation
- Création de brouillons
- Gestion des erreurs de validation
- Navigation depuis dashboard
- État vide quand aucun projet

### ✅ Édition de projets
- Modification de tous les champs
- Édition de brouillons et projets publiés
- Validation lors de l'édition
- Annulation des modifications
- Navigation et UX

### ✅ Publication de projets
- Publication depuis la liste
- Publication depuis l'édition
- Confirmation de publication
- Filtres après publication
- Gestion des erreurs

### ✅ Suppression de projets
- Suppression de brouillons
- Suppression de projets publiés
- Dialogue de confirmation
- Annulation de suppression
- Mise à jour des filtres

## 📊 Données de test

### 🎭 Projets de test
- **BROUILLON_MINIMAL** : Projet brouillon simple
- **BROUILLON_COMPLET** : Projet brouillon avec toutes les informations
- **PROJET_ACTIF** : Projet destiné à être publié
- **OBJECTIF_ÉLEVÉ** : Projet avec objectif financier élevé
- **DEADLINE_COURTE** : Projet avec deadline proche

### ❌ Données invalides
- Titre vide, trop court
- Description vide
- Objectif invalide (0, négatif)
- Date passée

## 🔧 Utilisation

### Lancer tous les tests CRUD
```bash
npm test e2e/projects/
```

### Lancer un fichier spécifique
```bash
npm test e2e/projects/01-create-project.spec.js
npm test e2e/projects/02-edit-project.spec.js
npm test e2e/projects/03-publish-project.spec.js
npm test e2e/projects/04-delete-project.spec.js
```

### Lancer avec rapport détaillé
```bash
npm test e2e/projects/ --reporter=list
```

## 🎯 Data-testid utilisés

### Formulaire
- `project-form` : Formulaire principal
- `project-title-input` : Champ titre
- `project-description-input` : Champ description
- `project-goal-input` : Champ objectif financier
- `project-deadline-input` : Champ date limite
- `project-save-draft-button` : Bouton sauvegarder brouillon
- `project-publish-button` : Bouton publier
- `project-cancel-button` : Bouton annuler
- `project-delete-button` : Bouton supprimer

### Messages
- `project-success-message` : Message de succès
- `project-form-error` : Message d'erreur
- `project-error-message` : Message d'erreur serveur

### Liste projets
- `my-projects-grid` : Grille des projets
- `my-project-card` : Carte projet
- `my-project-card-title` : Titre du projet
- `my-project-card-status` : Badge de statut
- `my-project-card-edit-button` : Bouton éditer
- `my-project-card-delete-button` : Bouton supprimer

### Filtres
- `my-projects-filter-all` : Filtre "Tous"
- `my-projects-filter-draft` : Filtre "Brouillons"
- `my-projects-filter-active` : Filtre "Actifs"
- `my-projects-filter-completed` : Filtre "Terminés"

### Actions
- `my-projects-create-button` : Bouton créer un projet
- `my-projects-empty-state` : État vide

## 🔄 Flux de test

1. **Création** : `dashboard/projects` → `projects/create` → sauvegarder
2. **Édition** : `dashboard/projects` → `projects/:id/edit` → sauvegarder
3. **Publication** : `projects/:id/edit` → publier → `dashboard/projects`
4. **Suppression** : `projects/:id/edit` → supprimer → `dashboard/projects`

## 📈 Couverture

- ✅ **Création** : 12 tests
- ✅ **Édition** : 11 tests  
- ✅ **Publication** : 15 tests
- ✅ **Suppression** : 13 tests
- **Total** : **51 tests**

## 🚀 Prérequis

- Utilisateur authentifié avec rôle créateur
- Accès aux pages de création/édition
- Permissions de modification/suppression

## 📝 Notes

- Les tests utilisent des noms de projets uniques avec timestamps
- Chaque test est indépendant et crée/nettoie ses propres données
- Les tests s'adaptent à l'implémentation réelle (dialogues, messages, etc.)
- La structure est conçue pour être évolutive avec les futures fonctionnalités
