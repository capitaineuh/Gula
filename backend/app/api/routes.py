"""
Définition des routes API
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, BiomarkerAnalysis
from app.models.base import Biomarker
from app.services.analyzer import BiomarkerAnalyzer
from app.services.pdf_generator import generate_pdf_report
from app.services.gemini_service import get_gemini_service
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


@router.post("/analyze-pdf", response_model=AnalyzeResponse)
async def analyze_pdf_blood_test(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> AnalyzeResponse:
    """
    Endpoint pour analyser un bilan sanguin à partir d'un PDF
    
    Args:
        file: Fichier PDF uploadé contenant le bilan sanguin
        db: Session de base de données
        
    Returns:
        Résultats de l'analyse avec comparaisons et explications
        
    Raises:
        HTTPException: Si le fichier n'est pas un PDF ou en cas d'erreur
    """
    print(f"\n[ROUTES] ===== DÉBUT ANALYZE-PDF =====")
    print(f"[ROUTES] Fichier reçu: {file.filename}")
    print(f"[ROUTES] Content-Type: {file.content_type}")
    
    try:
        # Vérifier que c'est bien un PDF
        if file.content_type != "application/pdf":
            print(f"[ROUTES] ❌ Mauvais type de fichier: {file.content_type}")
            raise HTTPException(
                status_code=400,
                detail="Le fichier doit être un PDF"
            )
        
        print("[ROUTES] ✅ Type de fichier validé")
        
        # Lire le contenu du PDF
        print("[ROUTES] Lecture du contenu du PDF...")
        pdf_bytes = await file.read()
        print(f"[ROUTES] ✅ PDF lu: {len(pdf_bytes)} bytes")
        
        # Obtenir le service Gemini
        print("[ROUTES] Obtention du service Gemini...")
        try:
            gemini_service = get_gemini_service()
            print("[ROUTES] ✅ Service Gemini obtenu")
        except Exception as e:
            print(f"[ROUTES] ❌ Erreur lors de l'obtention du service: {e}")
            raise
        
        # Valider le PDF
        print("[ROUTES] Validation du PDF...")
        await gemini_service.validate_pdf(pdf_bytes, max_size_mb=10)
        print("[ROUTES] ✅ PDF validé")
        
        # Extraire les biomarqueurs avec Gemini
        print("[ROUTES] Extraction des biomarqueurs...")
        biomarkers_data = await gemini_service.extract_biomarkers_from_pdf(pdf_bytes)
        print(f"[ROUTES] ✅ Biomarqueurs extraits: {biomarkers_data}")
        
        # Vérifier que des données ont été extraites
        if not biomarkers_data:
            raise HTTPException(
                status_code=400,
                detail="Aucun biomarqueur n'a pu être extrait du PDF. "
                       "Assurez-vous que le PDF contient un bilan sanguin valide."
            )
        
        # Créer l'analyseur
        analyzer = BiomarkerAnalyzer(db)
        
        # Analyser les biomarqueurs extraits
        results, summary = analyzer.analyze(biomarkers_data)
        
        # Construire le message de réponse
        total_count = len(results)
        unknown_count = summary.get("inconnu", 0)
        extracted_count = len(biomarkers_data)
        
        if unknown_count == total_count:
            message = (
                f"{extracted_count} biomarqueur(s) extrait(s) du PDF, "
                f"mais aucun n'est reconnu dans notre base. "
                f"Vérifiez le format du document."
            )
        elif unknown_count > 0:
            message = (
                f"Analyse complétée ! {extracted_count} biomarqueur(s) extrait(s) du PDF. "
                f"{unknown_count} non reconnu(s) dans notre base."
            )
        else:
            message = (
                f"Analyse complétée avec succès ! "
                f"{extracted_count} biomarqueur(s) extrait(s) et analysé(s)."
            )
        
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
            detail=f"Erreur lors de l'analyse du PDF : {str(e)}"
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
        filename = f"gula_analyse_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
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

