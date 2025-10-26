"""
Routes API pour la gestion du profil utilisateur
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.connection import get_db
from app.models.auth import User, UserProfile
from app.models.schemas import UserProfileCreate, UserProfileUpdate, UserProfileResponse
from app.api.custom_auth_routes import get_current_user_dep

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/me", response_model=UserProfileResponse, summary="Récupérer mon profil")
async def get_my_profile(
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """
    Récupère le profil de l'utilisateur connecté.
    Si le profil n'existe pas, en crée un vide.
    """
    # Chercher le profil existant
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    # Si pas de profil, en créer un vide
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile


@router.post("/me", response_model=UserProfileResponse, summary="Créer ou mettre à jour mon profil")
async def create_or_update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """
    Crée ou met à jour le profil de l'utilisateur connecté.
    """
    # Chercher le profil existant
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    if profile:
        # Mettre à jour le profil existant
        update_data = profile_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)
    else:
        # Créer un nouveau profil
        profile = UserProfile(
            user_id=current_user.id,
            **profile_data.model_dump(exclude_unset=True)
        )
        db.add(profile)
    
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/me", response_model=UserProfileResponse, summary="Mettre à jour mon profil")
async def update_my_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """
    Met à jour le profil de l'utilisateur connecté.
    Seuls les champs fournis sont mis à jour.
    """
    # Chercher le profil existant
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    if not profile:
        # Si pas de profil, en créer un
        profile = UserProfile(
            user_id=current_user.id,
            **profile_data.model_dump(exclude_unset=True)
        )
        db.add(profile)
    else:
        # Mettre à jour uniquement les champs fournis
        update_data = profile_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT, summary="Supprimer mon profil")
async def delete_my_profile(
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db)
):
    """
    Supprime le profil de l'utilisateur connecté.
    L'utilisateur sera toujours actif mais sans données de profil.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé"
        )
    
    db.delete(profile)
    db.commit()
    return None

