"""
Configuration et utilitaires pour l'authentification avec FastAPI-Users
"""
from typing import Optional
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, IntegerIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.orm import Session

from app.models.auth import User
from app.database.connection import get_db

# Secret pour les JWT (à mettre dans les variables d'environnement en production)
SECRET = "YOUR_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION_USE_OPENSSL_RAND_HEX_32"


class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    """
    Gestionnaire d'utilisateurs personnalisé
    """
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        """Callback après inscription"""
        print(f"Utilisateur {user.id} inscrit avec succès: {user.email}")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        """Callback après demande de réinitialisation de mot de passe"""
        print(f"Utilisateur {user.id} a demandé une réinitialisation de mot de passe. Token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        """Callback après demande de vérification d'email"""
        print(f"Vérification demandée pour l'utilisateur {user.id}. Token: {token}")


def get_user_db(session: Session = Depends(get_db)):
    """
    Dépendance pour obtenir la base de données utilisateur
    """
    yield SQLAlchemyUserDatabase(session, User)


async def get_user_manager(user_db=Depends(get_user_db)):
    """
    Dépendance pour obtenir le gestionnaire d'utilisateurs
    """
    yield UserManager(user_db)


# Configuration du transport Bearer (JWT dans le header Authorization)
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    """
    Stratégie JWT pour l'authentification
    """
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)


# Backend d'authentification JWT
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)


# Instance FastAPI-Users
fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)

# Dépendances pour protéger les routes
current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)

