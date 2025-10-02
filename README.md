# 🩺 Healer - Plateforme d'Analyse de Bilans Sanguins

Plateforme éducative pour analyser et vulgariser les résultats de bilans sanguins, avec comparaison aux valeurs normales et recommandations générales.

## 📋 Table des matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Structure du projet](#structure-du-projet)
- [Développement](#développement)
- [Production](#production)
- [Tests](#tests)

## 🏗️ Architecture

Le projet est composé de 3 services dockerisés :

- **Frontend** : Next.js 14 + TypeScript + Tailwind CSS + Chart.js + Three.js
- **Backend** : FastAPI + Python 3.11 + SQLAlchemy + Pydantic
- **Database** : PostgreSQL 15

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Frontend       │─────▶│  Backend        │─────▶│  PostgreSQL     │
│  Next.js:3000   │      │  FastAPI:8000   │      │  :5432          │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 🔧 Prérequis

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Git**

Optionnel pour développement sans Docker :
- Node.js 20 LTS
- Python 3.11+
- PostgreSQL 15

## 📥 Installation

### 1. Cloner le repository

```bash
git clone <votre-repo>
cd healer
```

### 2. Configuration des variables d'environnement

Créer un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditer le fichier `.env` selon vos besoins :

```env
POSTGRES_USER=healer_user
POSTGRES_PASSWORD=healer_password
POSTGRES_DB=healer_db
ENV=development
DEBUG=True
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚀 Lancement

### Mode développement (recommandé)

```bash
# Lancer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

Les services seront disponibles sur :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **API Docs (Swagger)** : http://localhost:8000/docs
- **PostgreSQL** : localhost:5432

### Mode production

```bash
# Créer un fichier .env avec les variables de production
cp .env.example .env

# Lancer avec la configuration production
docker-compose -f docker-compose.prod.yml up -d
```

## 📂 Structure du projet

```
healer/
├── backend/                  # Backend FastAPI
│   ├── app/
│   │   ├── api/             # Routes et endpoints
│   │   │   ├── __init__.py
│   │   │   └── routes.py
│   │   ├── database/        # Connexion DB
│   │   │   ├── __init__.py
│   │   │   └── connection.py
│   │   ├── models/          # Modèles de données
│   │   │   ├── __init__.py
│   │   │   ├── base.py      # Modèles SQLAlchemy
│   │   │   └── schemas.py   # Schémas Pydantic
│   │   ├── __init__.py
│   │   └── main.py          # Point d'entrée
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.sample
│
├── frontend/                 # Frontend Next.js
│   ├── src/
│   │   ├── app/             # App Router Next.js 14
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/      # Composants réutilisables
│   │   └── services/        # Services API
│   │       └── api.ts
│   ├── public/              # Fichiers statiques
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── .env.sample
│
├── init-db/                 # Scripts d'initialisation DB
├── docker-compose.yml       # Orchestration dev
├── docker-compose.prod.yml  # Orchestration prod
├── .env.example
└── README.md
```

## 🛠️ Développement

### Backend

Le backend utilise FastAPI avec hot-reload activé. Les modifications dans `backend/app/` sont automatiquement prises en compte.

**Endpoints disponibles :**
- `GET /` - Page d'accueil API
- `GET /health` - Health check
- `GET /docs` - Documentation Swagger
- `POST /api/analyze` - Analyser un bilan sanguin (structure prête)
- `GET /api/biomarkers` - Liste des biomarqueurs (structure prête)

**Accéder au conteneur :**
```bash
docker-compose exec backend bash
```

**Lancer des migrations (à venir) :**
```bash
docker-compose exec backend alembic upgrade head
```

### Frontend

Le frontend utilise Next.js 14 avec hot-reload. Les modifications dans `frontend/src/` sont automatiquement prises en compte.

**Accéder au conteneur :**
```bash
docker-compose exec frontend sh
```

**Installer de nouvelles dépendances :**
```bash
docker-compose exec frontend npm install <package>
```

### Base de données

**Accéder à PostgreSQL :**
```bash
docker-compose exec db psql -U healer_user -d healer_db
```

**Backup de la base :**
```bash
docker-compose exec db pg_dump -U healer_user healer_db > backup.sql
```

**Restaurer un backup :**
```bash
docker-compose exec -T db psql -U healer_user healer_db < backup.sql
```

## 🧪 Tests

### Backend

```bash
# Lancer les tests
docker-compose exec backend pytest

# Avec coverage
docker-compose exec backend pytest --cov=app
```

### Frontend

```bash
# Lancer les tests (quand configurés)
docker-compose exec frontend npm test
```

## 🔍 Vérification du système

Une fois les services lancés, vérifiez que tout fonctionne :

1. **Backend** : http://localhost:8000/health
   ```bash
   curl http://localhost:8000/health
   # Réponse : {"status":"healthy"}
   ```

2. **Frontend** : http://localhost:3000
   - Cliquer sur "Vérifier la connexion API"
   - Le statut doit afficher "✓ API en ligne"

3. **Documentation API** : http://localhost:8000/docs
   - Explorer les endpoints disponibles

## ✅ MVP Fonctionnel

Le MVP est maintenant **complet et fonctionnel** ! Voici ce qui est implémenté :

- ✅ Import de fichiers CSV/JSON
- ✅ Analyse automatique des biomarqueurs
- ✅ Comparaison aux valeurs normales
- ✅ Visualisations avec Chart.js (graphiques comparatifs)
- ✅ Explications vulgarisées pour chaque biomarqueur
- ✅ Conseils personnalisés selon le statut
- ✅ **Export PDF professionnel** (nouveau !)
- ✅ Interface moderne et responsive
- ✅ 10 biomarqueurs pré-configurés
- ✅ Fichiers de test fournis

### 🧪 Tester le MVP

Consultez le [Guide de test complet](GUIDE_TEST.md) pour valider toutes les fonctionnalités.

**Test rapide** :
1. Ouvrir http://localhost:3000
2. Cliquer sur "Utiliser des données d'exemple"
3. Explorer les résultats et graphiques

## 📝 Prochaines étapes (Post-MVP)

- [x] **Export PDF des résultats** ✅ Implémenté !
- [ ] Intégrer une IA locale pour analyses avancées
- [ ] Créer la visualisation 3D du corps humain (Three.js)
- [ ] Ajouter plus de biomarqueurs (vitamines, minéraux, etc.)
- [ ] Implémenter l'authentification utilisateur
- [ ] Ajouter l'historique des analyses
- [ ] Mode sombre
- [ ] Multilingue (EN, FR, etc.)

## 🤝 Contribution

Ce projet est en phase de développement MVP. Les contributions seront les bienvenues après la stabilisation de l'architecture.

## 📄 Licence

À définir

## 🆘 Support

Pour toute question ou problème :
1. Vérifier les logs : `docker-compose logs -f`
2. Redémarrer les services : `docker-compose restart`
3. Reconstruire les images : `docker-compose up -d --build`

---

**Version** : 1.0.0 MVP  
**Status** : Architecture prête ✅

