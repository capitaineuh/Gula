# Script PowerShell pour le linting et le formatage
# Usage: .\lint.ps1 [commande]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "  Gula - Commandes de linting et formatage" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage: .\lint.ps1 [commande]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commandes disponibles:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  help               " -NoNewline; Write-Host "Afficher cette aide" -ForegroundColor Gray
    Write-Host "  lint               " -NoNewline; Write-Host "Vérifier la syntaxe (frontend + backend)" -ForegroundColor Gray
    Write-Host "  lint-frontend      " -NoNewline; Write-Host "Vérifier la syntaxe du frontend" -ForegroundColor Gray
    Write-Host "  lint-backend       " -NoNewline; Write-Host "Vérifier la syntaxe du backend" -ForegroundColor Gray
    Write-Host "  format             " -NoNewline; Write-Host "Formater le code (frontend + backend)" -ForegroundColor Gray
    Write-Host "  format-frontend    " -NoNewline; Write-Host "Formater le code du frontend" -ForegroundColor Gray
    Write-Host "  format-backend     " -NoNewline; Write-Host "Formater le code du backend" -ForegroundColor Gray
    Write-Host "  check-all          " -NoNewline; Write-Host "Vérification complète (types + lint + format)" -ForegroundColor Gray
    Write-Host "  install-deps       " -NoNewline; Write-Host "Installer les dépendances de linting" -ForegroundColor Gray
    Write-Host ""
}

function Lint-Frontend {
    Write-Host "🔍 Vérification du frontend (TypeScript + ESLint)..." -ForegroundColor Blue
    Push-Location frontend
    npm run type-check
    npm run lint
    Pop-Location
}

function Lint-Backend {
    Write-Host "🔍 Vérification du backend (Python + Flake8)..." -ForegroundColor Blue
    docker exec gula-backend flake8 app/
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Installez les dépendances de dev avec '.\lint.ps1 install-deps' si flake8 n'est pas trouvé" -ForegroundColor Yellow
    }
}

function Format-Frontend {
    Write-Host "✨ Formatage du frontend (Prettier)..." -ForegroundColor Green
    Push-Location frontend
    npm run format
    Pop-Location
}

function Format-Backend {
    Write-Host "✨ Formatage du backend (Black + isort)..." -ForegroundColor Green
    docker exec gula-backend black app/
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Installez les dépendances de dev avec '.\lint.ps1 install-deps' si black n'est pas trouvé" -ForegroundColor Yellow
    }
    docker exec gula-backend isort app/
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Installez les dépendances de dev avec '.\lint.ps1 install-deps' si isort n'est pas trouvé" -ForegroundColor Yellow
    }
}

function Install-Deps {
    Write-Host "📦 Installation des dépendances de linting..." -ForegroundColor Green
    Write-Host "Frontend..." -ForegroundColor Cyan
    Push-Location frontend
    npm install
    Pop-Location
    Write-Host "Backend..." -ForegroundColor Cyan
    docker exec gula-backend pip install black flake8 isort mypy
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
}

function Check-All {
    Write-Host "🔍 Vérification complète du projet..." -ForegroundColor Blue
    Push-Location frontend
    npm run check-all
    Pop-Location
    Lint-Backend
}

# Exécution de la commande
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "lint" { 
        Lint-Frontend
        Lint-Backend
    }
    "lint-frontend" { Lint-Frontend }
    "lint-backend" { Lint-Backend }
    "format" {
        Format-Frontend
        Format-Backend
    }
    "format-frontend" { Format-Frontend }
    "format-backend" { Format-Backend }
    "check-all" { Check-All }
    "install-deps" { Install-Deps }
    default {
        Write-Host "❌ Commande inconnue: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}

