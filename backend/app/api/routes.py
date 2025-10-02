"""
Définition des routes API
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, BiomarkerAnalysis
from app.models.base import Biomarker
from app.services.analyzer import BiomarkerAnalyzer
from app.services.pdf_generator import generate_pdf_report
from datetime import datetime

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_blood_test(
    data: AnalyzeRequest,
    db: Session = Depends(get_db)
) -> AnalyzeResponse:
    """
    Endpoint pour analyser un bilan sanguin
    
    Args:
        data: Données du bilan sanguin avec dictionnaire de biomarqueurs
        db: Session de base de données
        
    Returns:
        Résultats de l'analyse avec comparaisons et explications
        
    Exemple de requête:
    {
        "biomarkers": {
            "hemoglobine": 13.2,
            "cholesterol_total": 2.3,
            "vitamine_d": 18
        }
    }
    """
    try:
        # Vérifier que des données sont fournies
        if not data.biomarkers:
            raise HTTPException(
                status_code=400,
                detail="Aucun biomarqueur fourni pour l'analyse"
            )
        
        # Créer l'analyseur
        analyzer = BiomarkerAnalyzer(db)
        
        # Analyser les biomarqueurs
        results, summary = analyzer.analyze(data.biomarkers)
        
        # Construire le message de réponse
        total_count = len(results)
        unknown_count = summary.get("inconnu", 0)
        
        if unknown_count == total_count:
            message = "Aucun biomarqueur reconnu. Vérifiez les noms des biomarqueurs."
        elif unknown_count > 0:
            message = f"Analyse complétée. {unknown_count} biomarqueur(s) non reconnu(s)."
        else:
            message = f"Analyse complétée avec succès ! {total_count} biomarqueur(s) analysé(s)."
        
        return AnalyzeResponse(
            status="success",
            message=message,
            results=results,
            summary=summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'analyse : {str(e)}"
        )


@router.get("/biomarkers")
async def get_biomarkers(db: Session = Depends(get_db)):
    """
    Récupérer la liste des biomarqueurs disponibles
    
    Args:
        db: Session de base de données
        
    Returns:
        Liste des biomarqueurs avec leurs plages normales et explications
    """
    try:
        biomarkers = db.query(Biomarker).all()
        
        biomarkers_list = [
            {
                "name": bm.name,
                "display_name": bm.display_name,
                "unit": bm.unit,
                "min_value": bm.min_value,
                "max_value": bm.max_value,
                "category": bm.category,
                "description": bm.description
            }
            for bm in biomarkers
        ]
        
        return {
            "status": "success",
            "count": len(biomarkers_list),
            "biomarkers": biomarkers_list
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des biomarqueurs : {str(e)}"
        )


@router.post("/export-pdf")
async def export_pdf(
    data: AnalyzeResponse,
    db: Session = Depends(get_db)
):
    """
    Générer et télécharger un rapport PDF des résultats d'analyse
    
    Args:
        data: Résultats de l'analyse (AnalyzeResponse)
        db: Session de base de données
        
    Returns:
        Fichier PDF téléchargeable
    """
    try:
        # Convertir AnalyzeResponse en dictionnaire pour le générateur PDF
        results_dict = {
            "status": data.status,
            "message": data.message,
            "results": [
                {
                    "biomarker": result.biomarker,
                    "value": result.value,
                    "unit": result.unit,
                    "status": result.status,
                    "min_value": result.min_value,
                    "max_value": result.max_value,
                    "explanation": result.explanation,
                    "advice": result.advice
                }
                for result in data.results
            ],
            "summary": data.summary
        }
        
        # Générer le PDF
        pdf_buffer = generate_pdf_report(results_dict)
        
        # Créer un nom de fichier avec la date
        filename = f"healer_analyse_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # Retourner le PDF en tant que fichier téléchargeable
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération du PDF : {str(e)}"
        )

