# 💰 MonÉpargne Pro

Application web complète de gestion financière pour les ménages à faible revenu, avec suivi des dépenses, budgétisation intelligente, et caisse de sécurité.

## 🌟 Fonctionnalités

### 📊 Suivi Financier
- **Transactions avec calendrier** : Enregistrez vos revenus et dépenses avec date et heure
- **Catégorisation automatique** : Organisez vos transactions par catégorie
- **Vue calendrier** : Visualisez vos opérations jour par jour
- **Traçabilité complète** : Consultez l'historique de toutes vos transactions

### 💡 Budgétisation Intelligente
- **Budgets personnalisés** : Définissez vos limites journalières, hebdomadaires et mensuelles
- **Alertes en temps réel** : Recevez des notifications quand vous dépassez votre budget
- **Analyse par catégorie** : Identifiez où va votre argent
- **Recommandations intelligentes** : Recevez des conseils personnalisés basés sur vos habitudes

### 🛡️ Caisse de Sécurité
- **Épargne d'urgence isolée** : Une réserve séparée pour les imprévus
- **Objectifs d'épargne** : Définissez et suivez vos objectifs
- **Suivi de progression** : Visualisez votre avancement vers vos objectifs

### 📈 Analyses et Statistiques
- **Graphiques interactifs** : Visualisez vos finances avec des graphiques clairs
- **Tendances sur 30 jours** : Suivez l'évolution de vos finances
- **Répartition des dépenses** : Pie charts pour comprendre vos habitudes
- **Moyennes journalières** : Comprenez vos patterns de dépenses

### 🌍 Multilingue et Multi-devises
- **2 langues** : Français 🇫🇷 et English 🇬🇧
- **10 devises** : FCFA, EUR, USD, GBP, CAD, NGN, GHS, KES, ZAR, MAD
- **Changement instantané** : Modifiez langue et devise à tout moment

### 🔐 Sécurité et Synchronisation
- **Authentification sécurisée** : Email/mot de passe avec Supabase
- **Synchronisation cloud** : Vos données sauvegardées automatiquement
- **Multi-appareils** : Accédez à vos données depuis n'importe où

### 📱 Responsive Design
- **Interface mobile** : Navigation bottom adaptée aux smartphones
- **Version desktop** : Sidebar latérale pour une expérience optimale sur grand écran
- **Tablette** : Layout adaptatif pour tous les écrans

## 🚀 Technologies

- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Edge Functions)
- **Serveur** : Hono (Edge Runtime)
- **Graphiques** : Recharts
- **Icons** : Lucide React

## 📋 Prérequis

- Compte Supabase (gratuit)
- Navigateur web moderne

## 🎯 Utilisation

### Première Connexion

1. **Inscription**
   - Cliquez sur "Inscription"
   - Entrez votre nom, email et mot de passe
   - Votre compte est créé instantanément

2. **Connexion**
   - Utilisez votre email et mot de passe
   - Vos données sont automatiquement synchronisées

### Gérer vos Transactions

1. **Ajouter une transaction**
   - Allez dans l'onglet "Opérations"
   - Cliquez sur "Ajouter"
   - Choisissez Revenu ou Dépense
   - Remplissez montant, catégorie, description, date et heure
   - Validez

2. **Vue Calendrier**
   - Basculez en mode "Calendrier"
   - Cliquez sur un jour pour voir ses transactions
   - Les points colorés indiquent les jours avec activité

### Configurer votre Budget

1. Allez dans "Budget"
2. Cliquez sur "Modifier"
3. Définissez vos limites :
   - Budget journalier
   - Budget hebdomadaire
   - Budget mensuel
4. Sauvegardez

### Utiliser la Caisse de Sécurité

1. Allez dans "Urgence"
2. Définissez votre objectif d'épargne
3. Effectuez des dépôts réguliers
4. Utilisez uniquement en cas d'urgence (santé, accident, etc.)

### Personnaliser l'Application

1. Allez dans "Paramètres"
2. **Langue** : Choisissez Français ou English
3. **Devise** : Sélectionnez votre monnaie locale
4. Cliquez sur "Sauvegarder"

## 🎨 Interface

### Mobile
- Navigation par onglets en bas d'écran
- Interface verticale optimisée pour le tactile
- Swipe et interactions mobiles

### Desktop
- Sidebar latérale permanente
- Layout multi-colonnes
- Header avec informations contextuelles
- Espace optimisé pour les graphiques

## 🔒 Sécurité

- ✅ Authentification JWT sécurisée
- ✅ Données chiffrées en transit (HTTPS)
- ✅ Tokens d'accès avec expiration
- ✅ Séparation frontend/backend
- ✅ Variables d'environnement pour les secrets

⚠️ **Important** : Cette application est un prototype. Pour une utilisation en production avec des données financières réelles, des mesures de sécurité supplémentaires sont recommandées.

## 📊 Architecture

```
Frontend (React)
    ↓
API Routes (Hono Server)
    ↓
Supabase Auth + KV Store
    ↓
PostgreSQL Database
```

### Structure des Données

```
user:{userId}:transactions   → Liste des transactions
user:{userId}:budget         → Limites de budget
user:{userId}:emergency      → Caisse de sécurité
user:{userId}:settings       → Préférences (langue, devise)
```

## 🌐 Déploiement

Cette application est déjà déployée sur Figma Make et accessible via votre URL de projet.

### Pour un déploiement personnalisé :

1. **Clone le projet**
2. **Configurez Supabase** :
   - Créez un projet sur supabase.com
   - Copiez vos clés dans les variables d'environnement
3. **Déployez** sur :
   - Vercel
   - Netlify
   - Cloudflare Pages
   - Ou tout hébergeur supportant React

## 🤝 Support

Pour toute question ou problème :
- Consultez les recommandations dans l'application
- Vérifiez que vous êtes connecté
- Assurez-vous d'avoir une connexion internet stable

## 📝 License

© 2024 MonÉpargne Pro - Application de gestion financière

---

**Fait avec ❤️ pour aider les ménages à mieux gérer leurs finances**
