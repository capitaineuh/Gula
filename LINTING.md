# 🔍 Guide de Linting et Formatage - Healer

Ce document explique comment utiliser les outils de linting et de formatage du code pour le projet Healer.

## 📋 Table des matières

- [Outils installés](#outils-installés)
- [Utilisation sur Windows](#utilisation-sur-windows)
- [Utilisation sur Linux/Mac](#utilisation-sur-linuxmac)
- [Commandes disponibles](#commandes-disponibles)
- [Configuration](#configuration)

---

## 🛠️ Outils installés

### Frontend (TypeScript/Next.js)
- **ESLint** : Détection des erreurs et problèmes de code
- **Prettier** : Formatage automatique du code
- **TypeScript** : Vérification des types

### Backend (Python/FastAPI)
- **Flake8** : Analyse statique du code Python
- **Black** : Formatage automatique du code Python
- **isort** : Tri automatique des imports
- **mypy** : Vérification des types Python

---

## 💻 Utilisation sur Windows

Utilisez le script PowerShell `lint.ps1` :

```powershell
# Afficher l'aide
.\lint.ps1 help

# Vérifier la syntaxe de tout le projet
.\lint.ps1 lint

# Vérifier uniquement le frontend
.\lint.ps1 lint-frontend

# Vérifier uniquement le backend
.\lint.ps1 lint-backend

# Formater tout le code
.\lint.ps1 format

# Formater uniquement le frontend
.\lint.ps1 format-frontend

# Formater uniquement le backend
.\lint.ps1 format-backend

# Vérification complète (types + lint + format)
.\lint.ps1 check-all

# Installer les dépendances de linting
.\lint.ps1 install-deps
```

---

## 🐧 Utilisation sur Linux/Mac

Utilisez le `Makefile` :

```bash
# Afficher l'aide
make help

# Vérifier la syntaxe de tout le projet
make lint

# Vérifier uniquement le frontend
make lint-frontend

# Vérifier uniquement le backend
make lint-backend

# Formater tout le code
make format

# Formater uniquement le frontend
make format-frontend

# Formater uniquement le backend
make format-backend

# Vérification complète
make check-all

# Installer les dépendances de linting
make install-lint-deps
```

---

## 📖 Commandes disponibles

### Linting (Vérification)

| Commande | Description |
|----------|-------------|
| `lint` | Vérifie la syntaxe du frontend ET du backend |
| `lint-frontend` | Vérifie TypeScript, ESLint et les types |
| `lint-backend` | Vérifie le code Python avec Flake8 |

### Formatage

| Commande | Description |
|----------|-------------|
| `format` | Formate automatiquement tout le code |
| `format-frontend` | Formate le code frontend avec Prettier |
| `format-backend` | Formate le code backend avec Black et isort |

### Vérification complète

| Commande | Description |
|----------|-------------|
| `check-all` | Exécute types + lint + format check |

---

## ⚙️ Configuration

### Frontend

#### `.eslintrc.json`
Configuration ESLint pour Next.js avec Prettier.

#### `.prettierrc`
Règles de formatage :
- Pas de point-virgules
- Guillemets simples
- Largeur de ligne : 100 caractères
- Trailing commas ES5

#### `tsconfig.json`
Configuration TypeScript stricte avec support Next.js.

### Backend

#### `.flake8`
Configuration Flake8 :
- Longueur de ligne max : 100 caractères
- Complexité max : 10

#### `pyproject.toml`
Configuration Black et isort :
- Longueur de ligne : 100 caractères
- Python 3.11

---

## 🔄 Workflow recommandé

### Avant de commiter

```bash
# 1. Formater automatiquement votre code
.\lint.ps1 format           # Windows
make format                 # Linux/Mac

# 2. Vérifier qu'il n'y a pas d'erreurs
.\lint.ps1 check-all        # Windows
make check-all              # Linux/Mac

# 3. Commiter vos changements
git add .
git commit -m "Votre message"
```

### Configuration Git Hooks (optionnel)

Pour automatiser le linting avant chaque commit, vous pouvez installer des git hooks :

```bash
# Créer un hook pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
make lint || exit 1
EOF

chmod +x .git/hooks/pre-commit
```

---

## 🚀 Intégration CI/CD

Pour intégrer le linting dans votre pipeline CI/CD, ajoutez ces étapes :

```yaml
# Exemple pour GitHub Actions
- name: Lint Frontend
  run: cd frontend && npm run lint

- name: Check Types
  run: cd frontend && npm run type-check

- name: Lint Backend
  run: docker exec healer-backend flake8 app/
```

---

## 🐛 Résolution de problèmes

### Le linting backend ne fonctionne pas

```bash
# Installer les dépendances de linting dans le conteneur
.\lint.ps1 install-deps     # Windows
make install-lint-deps      # Linux/Mac
```

### Erreur "command not found" sur Windows

Assurez-vous d'exécuter PowerShell en tant qu'administrateur et que Docker Desktop est en cours d'exécution.

### Le formatage ne corrige pas tout

Certaines erreurs ESLint ou Flake8 doivent être corrigées manuellement. Lisez les messages d'erreur pour savoir quoi corriger.

---

## 📚 Ressources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Black Documentation](https://black.readthedocs.io/)
- [Flake8 Documentation](https://flake8.pycqa.org/)
- [Next.js ESLint](https://nextjs.org/docs/app/building-your-application/configuring/eslint)

---

## ✅ Bonnes pratiques

1. **Formatez régulièrement** : Lancez `format` avant chaque commit
2. **Vérifiez avant de push** : Exécutez `check-all` avant de pousser votre code
3. **Résolvez les warnings** : Ne laissez pas s'accumuler les avertissements
4. **Respectez les conventions** : Suivez les règles de formatage du projet
5. **Documentez votre code** : Ajoutez des commentaires explicatifs

---

**Dernière mise à jour** : 2 octobre 2025

