"""
Configuration de la connexion à la base de données PostgreSQL
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os
from typing import Generator

# Récupérer l'URL de la base de données depuis les variables d'environnement
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://gula_user:gula_password@db:5432/gula_db"
)

# Créer le moteur SQLAlchemy avec pooling pour de meilleures performances
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Vérifier la connexion avant utilisation
    echo=False  # Mettre à True pour debug SQL
)

# Créer une fabrique de sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator:
    """
    Générateur de session de base de données pour FastAPI Depends
    
    Yields:
        Session SQLAlchemy
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

