"""
Schémas Pydantic pour validation des données API
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


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

