"""
Modèles SQLAlchemy pour la base de données
"""
from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Biomarker(Base):
    """
    Modèle pour stocker les biomarqueurs et leurs plages normales
    """
    __tablename__ = "biomarkers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(200), nullable=False)
    unit = Column(String(50), nullable=False)
    min_value = Column(Float, nullable=False)  # Renommé pour cohérence
    max_value = Column(Float, nullable=False)  # Renommé pour cohérence
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    explanation = Column(Text, nullable=False)  # Explication vulgarisée
    advice_low = Column(Text, nullable=True)  # Conseil si valeur basse
    advice_high = Column(Text, nullable=True)  # Conseil si valeur haute
    advice_normal = Column(Text, nullable=True)  # Conseil si valeur normale

    def __repr__(self):
        return f"<Biomarker(name='{self.name}', range={self.min_value}-{self.max_value})>"


class BloodTestResult(Base):
    """
    Modèle pour stocker les résultats d'analyse
    (optionnel pour le MVP, utile pour l'historique)
    """
    __tablename__ = "blood_test_results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    biomarker_name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    status = Column(String(50))  # "normal", "low", "high"
    
    def __repr__(self):
        return f"<BloodTestResult(biomarker='{self.biomarker_name}', value={self.value})>"

