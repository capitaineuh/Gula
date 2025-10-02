"""
Service d'analyse des biomarqueurs
"""
from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from app.models.base import Biomarker
from app.models.schemas import BiomarkerAnalysis


class BiomarkerAnalyzer:
    """Classe pour analyser les biomarqueurs"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def analyze(self, biomarkers_data: Dict[str, float]) -> Tuple[List[BiomarkerAnalysis], Dict[str, int]]:
        """
        Analyser les biomarqueurs en comparant aux valeurs normales
        
        Args:
            biomarkers_data: Dictionnaire {nom_biomarqueur: valeur}
            
        Returns:
            Tuple contenant:
            - Liste des analyses de biomarqueurs
            - Résumé des statuts (normal, bas, haut)
        """
        results = []
        summary = {"normal": 0, "bas": 0, "haut": 0, "inconnu": 0}
        
        for biomarker_name, value in biomarkers_data.items():
            # Normaliser le nom (minuscules, espaces en underscores)
            normalized_name = biomarker_name.lower().strip().replace(" ", "_")
            
            # Rechercher le biomarqueur dans la base
            biomarker_ref = self.db.query(Biomarker).filter(
                Biomarker.name == normalized_name
            ).first()
            
            if not biomarker_ref:
                # Biomarqueur non trouvé dans la base
                results.append(self._create_unknown_analysis(biomarker_name, value))
                summary["inconnu"] += 1
                continue
            
            # Déterminer le statut
            status = self._determine_status(value, biomarker_ref.min_value, biomarker_ref.max_value)
            
            # Choisir le conseil approprié
            advice = self._get_advice(status, biomarker_ref)
            
            # Créer l'analyse
            analysis = BiomarkerAnalysis(
                biomarker=biomarker_ref.display_name,
                value=value,
                unit=biomarker_ref.unit,
                status=status,
                min_value=biomarker_ref.min_value,
                max_value=biomarker_ref.max_value,
                explanation=biomarker_ref.explanation,
                advice=advice
            )
            
            results.append(analysis)
            summary[status] += 1
        
        return results, summary
    
    @staticmethod
    def _determine_status(value: float, min_value: float, max_value: float) -> str:
        """
        Déterminer le statut d'un biomarqueur
        
        Args:
            value: Valeur mesurée
            min_value: Valeur minimale normale
            max_value: Valeur maximale normale
            
        Returns:
            Statut: "bas", "normal", ou "haut"
        """
        if value < min_value:
            return "bas"
        elif value > max_value:
            return "haut"
        else:
            return "normal"
    
    @staticmethod
    def _get_advice(status: str, biomarker: Biomarker) -> str:
        """
        Récupérer le conseil approprié selon le statut
        
        Args:
            status: Statut du biomarqueur
            biomarker: Objet Biomarker de référence
            
        Returns:
            Conseil personnalisé
        """
        if status == "bas":
            return biomarker.advice_low or "Consultez un professionnel de santé pour plus d'informations."
        elif status == "haut":
            return biomarker.advice_high or "Consultez un professionnel de santé pour plus d'informations."
        else:
            return biomarker.advice_normal or "Vos valeurs sont dans la norme. Continuez ainsi !"
    
    @staticmethod
    def _create_unknown_analysis(biomarker_name: str, value: float) -> BiomarkerAnalysis:
        """
        Créer une analyse pour un biomarqueur inconnu
        
        Args:
            biomarker_name: Nom du biomarqueur
            value: Valeur mesurée
            
        Returns:
            BiomarkerAnalysis avec statut inconnu
        """
        return BiomarkerAnalysis(
            biomarker=biomarker_name,
            value=value,
            unit="N/A",
            status="inconnu",
            min_value=0.0,
            max_value=0.0,
            explanation="Ce biomarqueur n'est pas encore référencé dans notre base de données.",
            advice="Consultez un professionnel de santé pour interpréter cette valeur."
        )


