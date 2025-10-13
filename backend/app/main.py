"""
Point d'entrée principal de l'application FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.auth_routes import auth_router
from app.database.connection import engine, SessionLocal
from app.models import base
from app.database.seed import seed_biomarkers
from app.database.migrations import run_migrations

# Créer les tables au démarrage
base.Base.metadata.create_all(bind=engine)

# Exécuter les migrations pour mettre à jour le schéma si nécessaire
run_migrations()

# Initialiser les données de référence
db = SessionLocal()
try:
    seed_biomarkers(db)
finally:
    db.close()

app = FastAPI(
    title="Gula API",
    description="API pour l'analyse de bilans sanguins",
    version="1.0.0"
)

# Configuration CORS pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL du frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(router, prefix="/api")
app.include_router(auth_router, prefix="/auth")


@app.get("/")
async def root():
    """Point de terminaison racine pour vérifier que l'API fonctionne"""
    return {
        "message": "Bienvenue sur l'API Gula",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Endpoint de santé pour Docker et monitoring"""
    return {"status": "healthy"}

