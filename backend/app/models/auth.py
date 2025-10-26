"""
Modèles SQLAlchemy pour l'authentification et profils utilisateurs
"""
from datetime import datetime
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text, Float, Date
from sqlalchemy.orm import relationship
from fastapi_users.db import SQLAlchemyBaseUserTable
from app.models.base import Base


class User(SQLAlchemyBaseUserTable[int], Base):
    """
    Modèle utilisateur avec support FastAPI-Users
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relations
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(email='{self.email}', id={self.id})>"


class OAuthAccount(Base):
    """
    Modèle pour stocker les comptes OAuth (Google, Apple, etc.)
    """
    __tablename__ = "oauth_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String(50), nullable=False)  # 'google', 'apple'
    provider_user_id = Column(String(255), nullable=False)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relations
    user = relationship("User", back_populates="oauth_accounts")
    
    def __repr__(self):
        return f"<OAuthAccount(provider='{self.provider}', user_id={self.user_id})>"


class UserProfile(Base):
    """
    Modèle pour stocker le profil détaillé de l'utilisateur
    Permet de personnaliser les conseils et analyses
    """
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Informations de base
    birthdate = Column(Date, nullable=True)
    biological_sex = Column(String(20), nullable=True)  # 'male', 'female', 'other'
    height = Column(Float, nullable=True)  # en cm
    weight = Column(Float, nullable=True)  # en kg
    ethnicity = Column(String(50), nullable=True)
    blood_type = Column(String(10), nullable=True)  # 'A+', 'O-', etc.
    
    # Mode de vie
    alcohol_consumption = Column(String(30), nullable=True)  # 'none', 'occasional', 'moderate', etc.
    tobacco_consumption = Column(String(30), nullable=True)
    diet_type = Column(String(50), nullable=True)
    medications = Column(Text, nullable=True)
    supplements = Column(Text, nullable=True)
    physical_activity_level = Column(String(30), nullable=True)
    
    # Contexte physiologique lors de la prise de sang
    is_menopause = Column(Boolean, default=False, nullable=True)
    is_pregnant = Column(Boolean, default=False, nullable=True)
    menstrual_cycle_phase = Column(String(30), nullable=True)
    blood_test_time = Column(String(20), nullable=True)  # 'morning', 'afternoon', etc.
    blood_test_fasting = Column(Boolean, default=False, nullable=True)
    
    # Contexte médical
    chronic_diseases = Column(Text, nullable=True)
    family_history = Column(Text, nullable=True)
    recent_infection = Column(Text, nullable=True)
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relations
    user = relationship("User", back_populates="profile")
    
    def __repr__(self):
        return f"<UserProfile(user_id={self.user_id})>"

