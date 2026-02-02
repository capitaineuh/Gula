"""
Routes d'authentification avec FastAPI-Users
"""
from fastapi import APIRouter
from app.services.auth import auth_backend, fastapi_users
from app.models.auth_schemas import UserRead, UserCreate, UserUpdate

# Router principal pour l'authentification
auth_router = APIRouter()

# Exposer UNIQUEMENT les routes JWT de FastAPI-Users pour éviter les doublons
auth_router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/jwt",
    tags=["auth"]
)

