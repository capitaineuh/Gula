.PHONY: help lint lint-frontend lint-backend format format-frontend format-backend check-all install-lint-deps

# Couleurs pour l'affichage
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

help: ## Afficher l'aide
	@echo "$(BLUE)════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Healer - Commandes de développement$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ═══════════════════════════════════════════════════════════
# DOCKER - Gestion des conteneurs
# ═══════════════════════════════════════════════════════════

up: ## Démarrer tous les services Docker
	@echo "$(GREEN)🚀 Démarrage des services...$(NC)"
	docker-compose up -d

down: ## Arrêter tous les services Docker
	@echo "$(YELLOW)🛑 Arrêt des services...$(NC)"
	docker-compose down

restart: ## Redémarrer tous les services Docker
	@echo "$(YELLOW)🔄 Redémarrage des services...$(NC)"
	docker-compose restart

rebuild: ## Reconstruire et démarrer les services Docker
	@echo "$(GREEN)🔨 Reconstruction des images...$(NC)"
	docker-compose up --build -d

logs: ## Afficher les logs de tous les services
	docker-compose logs -f

logs-backend: ## Afficher les logs du backend
	docker logs healer-backend -f

logs-frontend: ## Afficher les logs du frontend
	docker logs healer-frontend -f

logs-db: ## Afficher les logs de la base de données
	docker logs healer-db -f

# ═══════════════════════════════════════════════════════════
# LINTING - Vérification du code
# ═══════════════════════════════════════════════════════════

lint: ## Vérifier la syntaxe (frontend + backend)
	@echo "$(BLUE)🔍 Vérification de la syntaxe...$(NC)"
	@$(MAKE) lint-frontend
	@$(MAKE) lint-backend

lint-frontend: ## Vérifier la syntaxe du frontend
	@echo "$(BLUE)🔍 Vérification du frontend (TypeScript + ESLint)...$(NC)"
	cd frontend && npm run type-check
	cd frontend && npm run lint

lint-backend: ## Vérifier la syntaxe du backend
	@echo "$(BLUE)🔍 Vérification du backend (Python + Flake8)...$(NC)"
	docker exec healer-backend flake8 app/ || echo "$(YELLOW)⚠️  Installez les dépendances de dev avec 'make install-lint-deps' si flake8 n'est pas trouvé$(NC)"

# ═══════════════════════════════════════════════════════════
# FORMATAGE - Auto-formatage du code
# ═══════════════════════════════════════════════════════════

format: ## Formater le code (frontend + backend)
	@echo "$(GREEN)✨ Formatage du code...$(NC)"
	@$(MAKE) format-frontend
	@$(MAKE) format-backend

format-frontend: ## Formater le code du frontend
	@echo "$(GREEN)✨ Formatage du frontend (Prettier)...$(NC)"
	cd frontend && npm run format

format-backend: ## Formater le code du backend
	@echo "$(GREEN)✨ Formatage du backend (Black + isort)...$(NC)"
	docker exec healer-backend black app/ || echo "$(YELLOW)⚠️  Installez les dépendances de dev avec 'make install-lint-deps' si black n'est pas trouvé$(NC)"
	docker exec healer-backend isort app/ || echo "$(YELLOW)⚠️  Installez les dépendances de dev avec 'make install-lint-deps' si isort n'est pas trouvé$(NC)"

# ═══════════════════════════════════════════════════════════
# VÉRIFICATIONS COMPLÈTES
# ═══════════════════════════════════════════════════════════

check-all: ## Vérifier tout (types + lint + format)
	@echo "$(BLUE)🔍 Vérification complète du projet...$(NC)"
	cd frontend && npm run check-all
	@$(MAKE) lint-backend

# ═══════════════════════════════════════════════════════════
# INSTALLATION
# ═══════════════════════════════════════════════════════════

install-frontend-deps: ## Installer les dépendances frontend
	@echo "$(GREEN)📦 Installation des dépendances frontend...$(NC)"
	cd frontend && npm install

install-lint-deps: ## Installer les outils de linting dans le backend
	@echo "$(GREEN)📦 Installation des outils de linting backend...$(NC)"
	docker exec healer-backend pip install black flake8 isort mypy

# ═══════════════════════════════════════════════════════════
# BASE DE DONNÉES
# ═══════════════════════════════════════════════════════════

db-reset: ## Réinitialiser la base de données (ATTENTION: supprime toutes les données)
	@echo "$(YELLOW)⚠️  Suppression et recréation de la base de données...$(NC)"
	docker-compose down -v
	docker-compose up -d db
	@echo "$(GREEN)✅ Base de données réinitialisée$(NC)"

db-shell: ## Ouvrir un shell PostgreSQL
	docker exec -it healer-db psql -U healer_user -d healer_db

# ═══════════════════════════════════════════════════════════
# TESTS
# ═══════════════════════════════════════════════════════════

test-backend: ## Exécuter les tests backend
	docker exec healer-backend pytest

test-all: ## Exécuter tous les tests
	@$(MAKE) test-backend

# ═══════════════════════════════════════════════════════════
# NETTOYAGE
# ═══════════════════════════════════════════════════════════

clean: ## Nettoyer les fichiers temporaires
	@echo "$(YELLOW)🧹 Nettoyage des fichiers temporaires...$(NC)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -prune -o -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)✅ Nettoyage terminé$(NC)"

clean-all: down clean ## Arrêter Docker et nettoyer tous les fichiers
	@echo "$(GREEN)✅ Nettoyage complet terminé$(NC)"

# ═══════════════════════════════════════════════════════════
# PRODUCTION
# ═══════════════════════════════════════════════════════════

prod-up: ## Démarrer en mode production
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Arrêter le mode production
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## Afficher les logs en production
	docker-compose -f docker-compose.prod.yml logs -f

