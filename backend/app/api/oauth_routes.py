"""
Routes OAuth pour Google et Apple
"""
from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.auth import User
import os
import requests
from urllib.parse import urlencode
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def get_google_oauth_config(request: Request):
    """
    Récupère la configuration Google à l'exécution pour éviter les valeurs vides
    si le module est importé avant l'injection d'environnement (Docker).
    """
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    # Autoriser la surcharge via env pour le callback (utile en prod)
    redirect_uri = os.getenv(
        "GOOGLE_REDIRECT_URI",
        "http://localhost:8000/auth/google/callback",
    )
    return client_id, client_secret, redirect_uri

# Configuration Apple OAuth (non implémentée pour l'instant)
APPLE_CLIENT_ID = os.getenv("APPLE_CLIENT_ID")
APPLE_CLIENT_SECRET = os.getenv("APPLE_CLIENT_SECRET")
APPLE_REDIRECT_URI = os.getenv(
    "APPLE_REDIRECT_URI",
    "http://localhost:8000/auth/apple/callback",
)


@router.get("/google/login")
def google_login(request: Request):
    """
    Initier la connexion Google OAuth
    """
    client_id, _client_secret, redirect_uri = get_google_oauth_config(request)

    if not client_id:
        logger.error("Google OAuth non configuré: GOOGLE_CLIENT_ID manquant")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth non configuré (GOOGLE_CLIENT_ID manquant)",
        )
    
    # Paramètres pour la requête Google
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": "openid email profile",
        "response_type": "code",
        "access_type": "offline",
        "prompt": "consent"
    }
    
    # URL Google OAuth
    google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    
    logger.info("Redirection vers Google OAuth")
    return RedirectResponse(url=google_auth_url)


@router.get("/google/callback")
def google_callback(request: Request, code: str = None, error: str = None, db: Session = Depends(get_db)):
    """
    Callback Google OAuth
    """
    if error:
        logger.error(f"Erreur Google OAuth: {error}")
        return RedirectResponse(url="http://localhost:3000/auth/error?error=OAuthSignin")
    
    if not code:
        logger.error("Code d'autorisation manquant")
        return RedirectResponse(url="http://localhost:3000/auth/error?error=OAuthSignin")
    
    try:
        client_id, client_secret, redirect_uri = get_google_oauth_config(request)

        if not client_id or not client_secret:
            logger.error(
                "Google OAuth non configuré: %s",
                "GOOGLE_CLIENT_ID manquant" if not client_id else "GOOGLE_CLIENT_SECRET manquant",
            )
            return RedirectResponse(url="http://localhost:3000/auth/error?error=OAuthSignin")

        # Échanger le code contre un token d'accès
        token_data = {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        }
        
        token_response = requests.post(
            "https://oauth2.googleapis.com/token",
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if not token_response.ok:
            logger.error(f"Erreur token Google: {token_response.text}")
            return RedirectResponse(url="http://localhost:3000/auth/error?error=OAuthSignin")
        
        token_json = token_response.json()
        access_token = token_json.get("access_token")
        
        # Récupérer les informations utilisateur
        user_response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if not user_response.ok:
            logger.error(f"Erreur récupération profil Google: {user_response.text}")
            return RedirectResponse(url="http://localhost:3000/auth/error?error=OAuthSignin")
        
        user_data = user_response.json()
        email = user_data.get("email")
        name = user_data.get("name", "")
        
        if not email:
            logger.error("Email manquant dans les données Google")
            return RedirectResponse(url="http://localhost:3000/auth/error?error=OAuthSignin")
        
        # Vérifier si l'utilisateur existe déjà
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Créer un nouvel utilisateur
            user = User(
                email=email,
                hashed_password="",  # Pas de mot de passe pour OAuth
                is_active=True,
                is_verified=True,  # Email vérifié par Google
                is_superuser=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Utilisateur Google créé: {email}")
        else:
            logger.info(f"Utilisateur Google existant: {email}")
        
        # Générer un JWT pour notre application
        from jose import jwt
        from datetime import datetime, timedelta
        from app.config import JWT_SECRET, JWT_EXPIRATION
        
        access_token_expires = timedelta(seconds=JWT_EXPIRATION)
        
        to_encode = {
            "sub": str(user.id),
            "email": user.email,
            "exp": datetime.utcnow() + access_token_expires
        }
        
        jwt_token = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
        
        # Rediriger vers le frontend avec le token
        frontend_url = f"http://localhost:3000/auth/oauth-success?token={jwt_token}&email={email}"
        return RedirectResponse(url=frontend_url)
        
    except Exception as e:
        logger.error(f"Erreur callback Google: {str(e)}", exc_info=True)
        return RedirectResponse(url="http://localhost:3000/auth/error?error=OAuthSignin")


@router.get("/apple/login")
def apple_login():
    """
    Initier la connexion Apple OAuth
    """
    # Pour l'instant, rediriger vers une page d'erreur
    # Apple OAuth est plus complexe à implémenter
    return RedirectResponse(url="http://localhost:3000/auth/error?error=OAuthSignin&message=Apple+OAuth+non+implémenté")
