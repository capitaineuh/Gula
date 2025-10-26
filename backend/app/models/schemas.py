"""
Schémas Pydantic pour validation des données API
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime


class BiomarkerValue(BaseModel):
    """Schéma pour une valeur de biomarqueur"""
    name: str = Field(..., description="Nom du biomarqueur")
    value: float = Field(..., description="Valeur mesurée")
    unit: Optional[str] = Field(None, description="Unité de mesure")


class AnalyzeRequest(BaseModel):
    """Schéma pour la requête d'analyse - format flexible"""
    # Accepte un dictionnaire dynamique de biomarqueurs
    # Exemple: {"hemoglobine": 13.2, "cholesterol": 2.3, "vitamine_d": 18}
    biomarkers: Dict[str, float] = Field(..., description="Dictionnaire des biomarqueurs et leurs valeurs")
    
    class Config:
        json_schema_extra = {
            "example": {
                "biomarkers": {
                    "hemoglobine": 13.2,
                    "cholesterol": 2.3,
                    "vitamine_d": 18
                }
            }
        }


class BiomarkerAnalysis(BaseModel):
    """Schéma pour le résultat d'analyse d'un biomarqueur"""
    biomarker: str = Field(..., description="Nom d'affichage du biomarqueur")
    value: float = Field(..., description="Valeur mesurée")
    unit: str = Field(..., description="Unité de mesure")
    status: str = Field(..., description="Statut: normal, bas, haut")
    min_value: float = Field(..., description="Valeur minimale normale")
    max_value: float = Field(..., description="Valeur maximale normale")
    explanation: str = Field(..., description="Explication vulgarisée du biomarqueur")
    advice: str = Field(..., description="Conseil personnalisé selon le statut")


class AnalyzeResponse(BaseModel):
    """Schéma pour la réponse d'analyse"""
    status: str = Field(..., description="Statut de la réponse")
    message: str = Field(..., description="Message descriptif")
    results: List[BiomarkerAnalysis] = Field(..., description="Liste des analyses de biomarqueurs")
    summary: Dict[str, int] = Field(..., description="Résumé des statuts")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "Analyse complétée avec succès",
                "results": [
                    {
                        "biomarker": "Vitamine D",
                        "value": 18,
                        "unit": "ng/mL",
                        "status": "bas",
                        "min_value": 30,
                        "max_value": 100,
                        "explanation": "La vitamine D aide à absorber le calcium...",
                        "advice": "Votre taux est bas. Augmentez votre exposition au soleil..."
                    }
                ],
                "summary": {
                    "normal": 2,
                    "bas": 1,
                    "haut": 0
                }
            }
        }


# ============= Schémas pour le profil utilisateur =============

class UserProfileBase(BaseModel):
    """Schéma de base pour le profil utilisateur"""
    # Informations de base
    birthdate: Optional[date] = Field(None, description="Date de naissance")
    biological_sex: Optional[str] = Field(None, description="Sexe biologique")
    height: Optional[float] = Field(None, description="Taille en cm", ge=0, le=300)
    weight: Optional[float] = Field(None, description="Poids en kg", ge=0, le=500)
    ethnicity: Optional[str] = Field(None, description="Origine ethnique")
    blood_type: Optional[str] = Field(None, description="Groupe sanguin")
    
    # Mode de vie
    alcohol_consumption: Optional[str] = Field(None, description="Consommation d'alcool")
    tobacco_consumption: Optional[str] = Field(None, description="Consommation de tabac")
    diet_type: Optional[str] = Field(None, description="Type de régime alimentaire")
    medications: Optional[str] = Field(None, description="Médicaments actuels")
    supplements: Optional[str] = Field(None, description="Compléments alimentaires")
    physical_activity_level: Optional[str] = Field(None, description="Niveau d'activité physique")
    
    # Contexte physiologique lors de la prise de sang
    is_menopause: Optional[bool] = Field(None, description="En ménopause")
    is_pregnant: Optional[bool] = Field(None, description="Enceinte")
    menstrual_cycle_phase: Optional[str] = Field(None, description="Phase du cycle menstruel")
    blood_test_time: Optional[str] = Field(None, description="Moment de la prise de sang")
    blood_test_fasting: Optional[bool] = Field(None, description="Prise de sang à jeun")
    
    # Contexte médical
    chronic_diseases: Optional[str] = Field(None, description="Maladies chroniques")
    family_history: Optional[str] = Field(None, description="Antécédents familiaux")
    recent_infection: Optional[str] = Field(None, description="Infection ou inflammation récente")


class UserProfileCreate(UserProfileBase):
    """Schéma pour la création d'un profil utilisateur"""
    pass


class UserProfileUpdate(UserProfileBase):
    """Schéma pour la mise à jour d'un profil utilisateur"""
    pass


class UserProfileResponse(UserProfileBase):
    """Schéma pour la réponse d'un profil utilisateur"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "birthdate": "1990-01-15",
                "biological_sex": "female",
                "height": 165,
                "weight": 60,
                "ethnicity": "caucasian",
                "blood_type": "A+",
                "alcohol_consumption": "occasional",
                "tobacco_consumption": "none",
                "physical_activity_level": "moderate",
                "diet_type": "vegetarian",
                "medications": "Aucun",
                "supplements": "Vitamine D, Magnésium",
                "is_menopause": False,
                "is_pregnant": False,
                "menstrual_cycle_phase": "follicular",
                "blood_test_time": "morning",
                "blood_test_fasting": True,
                "chronic_diseases": "Aucune",
                "family_history": "Diabète (grand-père paternel)",
                "recent_infection": "Rhume il y a 3 semaines",
                "created_at": "2024-01-15T10:00:00",
                "updated_at": "2024-01-20T14:30:00"
            }
        }

