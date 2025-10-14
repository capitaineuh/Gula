"""
Routes d'authentification personnalisées pour compatibilité avec SQLAlchemy synchrone
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
import bcrypt
from pydantic import BaseModel, EmailStr
from app.database.connection import get_db
from app.models.auth import User
import logging

# Configuration du logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


class UserRegister(BaseModel):
    """Schéma pour l'inscription"""
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """Schéma pour la connexion"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schéma pour la réponse utilisateur"""
    id: int
    email: str
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True


def hash_password(password: str) -> str:
    """Hasher un mot de passe avec bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifier un mot de passe"""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Inscription d'un nouvel utilisateur
    """
    logger.info(f"Tentative d'inscription pour: {user_data.email}")
    
    try:
        # Vérifier si l'email existe déjà
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            logger.warning(f"Email déjà existant: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un utilisateur avec cet email existe déjà"
            )
        
        # Créer le nouvel utilisateur
        logger.info("Hashage du mot de passe...")
        hashed_password = hash_password(user_data.password)
        
        logger.info("Création de l'utilisateur dans la base...")
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            is_active=True,
            is_verified=False,
            is_superuser=False
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"Utilisateur créé avec succès: {new_user.id}")
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'inscription: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'inscription: {str(e)}"
        )


@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Connexion d'un utilisateur et retour d'un token JWT
    """
    from jose import jwt
    from datetime import datetime, timedelta
    from app.config import JWT_SECRET, JWT_EXPIRATION
    
    logger.info(f"Tentative de connexion pour: {user_data.email}")
    
    try:
        # Trouver l'utilisateur
        user = db.query(User).filter(User.email == user_data.email).first()
        if not user:
            logger.warning(f"Utilisateur non trouvé: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect"
            )
        
        if not verify_password(user_data.password, user.hashed_password):
            logger.warning(f"Mot de passe incorrect pour: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect"
            )
        
        if not user.is_active:
            logger.warning(f"Compte désactivé: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Compte désactivé"
            )
        
        # Créer le token JWT
        access_token_expires = timedelta(seconds=JWT_EXPIRATION)
        
        to_encode = {
            "sub": str(user.id),
            "email": user.email,
            "exp": datetime.utcnow() + access_token_expires
        }
        
        access_token = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
        
        logger.info(f"Connexion réussie pour: {user.email}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "is_active": user.is_active,
                "is_verified": user.is_verified
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la connexion: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la connexion: {str(e)}"
        )


@router.get("/users/me", response_model=UserResponse)
def get_current_user(
    authorization: str = Depends(lambda: None),
    db: Session = Depends(get_db)
):
    """
    Récupérer l'utilisateur actuel à partir du token JWT
    """
    from jose import jwt, JWTError
    from fastapi import Header
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )
    
    try:
        from app.config import JWT_SECRET
        
        # Extraire le token
        token = authorization.replace("Bearer ", "")
        
        # Décoder le token
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
        
        # Récupérer l'utilisateur
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur non trouvé"
            )
        
        return user
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
