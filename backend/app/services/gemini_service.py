"""
Service pour l'extraction de données de bilans sanguins via Gemini API
"""
import json
from typing import Dict, Any, Optional
from fastapi import HTTPException
from app.config import GEMINI_API_KEY

# Vérifier que google-generativeai est installé
print("[GEMINI_SERVICE] Vérification du module google.generativeai...")
try:
    import google.generativeai as genai
    print(f"[GEMINI_SERVICE] ✅ Module google.generativeai importé (version: {genai.__version__ if hasattr(genai, '__version__') else 'inconnue'})")
except ImportError as e:
    print(f"[GEMINI_SERVICE] ❌ ERREUR: Module google.generativeai non trouvé!")
    print(f"[GEMINI_SERVICE] Exécutez: pip install google-generativeai")
    raise


class GeminiService:
    """Service pour interagir avec l'API Gemini de Google"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialiser le service Gemini
        
        Args:
            api_key: Clé API Gemini (si None, utilise la configuration)
        """
        print(f"[GEMINI_SERVICE] Initialisation...")
        print(f"[GEMINI_SERVICE] api_key fourni? {bool(api_key)}")
        print(f"[GEMINI_SERVICE] GEMINI_API_KEY depuis config? {bool(GEMINI_API_KEY)}")
        
        self.api_key = api_key or GEMINI_API_KEY
        
        if not self.api_key:
            print("[GEMINI_SERVICE] ❌ Aucune clé API trouvée!")
            raise ValueError(
                "GEMINI_API_KEY non trouvée. "
                "Ajoutez GEMINI_API_KEY=votre_clé dans backend/.env"
            )
        
        print(f"[GEMINI_SERVICE] ✅ Clé API présente (premiers chars): {self.api_key[:10]}...")
        
        # Configurer Gemini
        try:
            print("[GEMINI_SERVICE] Configuration de Gemini...")
            genai.configure(api_key=self.api_key)
            print("[GEMINI_SERVICE] ✅ Gemini configuré")
        except Exception as e:
            print(f"[GEMINI_SERVICE] ❌ Erreur lors de la configuration: {e}")
            raise
        
        # Sélection dynamique du modèle disponible
        self.model_name = self._select_available_model()
        try:
            print(f"[GEMINI_SERVICE] Création du modèle: {self.model_name}...")
            self.model = genai.GenerativeModel(self.model_name)
            print("[GEMINI_SERVICE] ✅ Modèle créé avec succès")
        except Exception as e:
            print(f"[GEMINI_SERVICE] ❌ Erreur lors de la création du modèle {self.model_name}: {e}")
            raise
    
    async def extract_biomarkers_from_pdf(self, pdf_bytes: bytes) -> Dict[str, float]:
        """
        Extraire les biomarqueurs et leurs valeurs d'un PDF de bilan sanguin
        
        Args:
            pdf_bytes: Contenu du PDF en bytes
            
        Returns:
            Dictionnaire {nom_biomarqueur: valeur}
            
        Raises:
            HTTPException: En cas d'erreur lors de l'extraction
        """
        print(f"[GEMINI_SERVICE] extract_biomarkers_from_pdf appelé")
        print(f"[GEMINI_SERVICE] Taille du PDF: {len(pdf_bytes)} bytes")
        
        try:
            # Créer le prompt pour Gemini
            print("[GEMINI_SERVICE] Création du prompt...")
            prompt = self._create_extraction_prompt()
            print(f"[GEMINI_SERVICE] Prompt créé (longueur: {len(prompt)} chars)")
            
            # Préparer le fichier PDF pour Gemini
            print("[GEMINI_SERVICE] Préparation du fichier PDF...")
            pdf_file = {
                "mime_type": "application/pdf",
                "data": pdf_bytes
            }
            print("[GEMINI_SERVICE] ✅ Fichier PDF préparé")
            
            # Envoyer à Gemini
            print("[GEMINI_SERVICE] 📤 Envoi à l'API Gemini...")
            response = self.model.generate_content([prompt, pdf_file])
            print("[GEMINI_SERVICE] ✅ Réponse reçue de Gemini")
            print(f"[GEMINI_SERVICE] Réponse brute: {response.text[:200]}...")
            
            # Parser la réponse
            print("[GEMINI_SERVICE] Parsing de la réponse...")
            biomarkers = self._parse_gemini_response(response.text)
            print(f"[GEMINI_SERVICE] ✅ {len(biomarkers)} biomarqueurs extraits: {list(biomarkers.keys())}")
            
            return biomarkers
            
        except Exception as e:
            print(f"[GEMINI_SERVICE] ❌ ERREUR: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"[GEMINI_SERVICE] Traceback complet:")
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Erreur lors de l'extraction avec Gemini : {str(e)}"
            )

    def _select_available_model(self) -> str:
        """Sélectionner un modèle disponible sur l'API, avec priorité aux plus récents.
        Ordre de préférence: gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash-8b → gemini-1.5-flash.
        """
        print("[GEMINI_SERVICE] Listing des modèles disponibles...")
        preferred = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-flash",
        ]
        try:
            models = list(genai.list_models())
            names = [m.name.split('/')[-1] if hasattr(m, 'name') else str(m) for m in models]
            print(f"[GEMINI_SERVICE] Modèles retournés ({len(names)}): {names}")
            for candidate in preferred:
                if candidate in names:
                    print(f"[GEMINI_SERVICE] ✅ Modèle sélectionné: {candidate}")
                    return candidate
            # Fallback: prendre le premier modèle qui supporte generateContent
            for m in models:
                caps = getattr(m, 'supported_generation_methods', []) or []
                if 'generateContent' in caps or 'generate_content' in caps:
                    chosen = m.name.split('/')[-1]
                    print(f"[GEMINI_SERVICE] ⚠️ Fallback sur: {chosen}")
                    return chosen
        except Exception as e:
            print(f"[GEMINI_SERVICE] ⚠️ Impossible de lister les modèles: {e}")
        # Dernier recours
        print("[GEMINI_SERVICE] ⚠️ Aucun listing, fallback par défaut: gemini-2.0-flash")
        return "gemini-2.0-flash"
    
    def _create_extraction_prompt(self) -> str:
        """
        Créer le prompt optimisé pour l'extraction de biomarqueurs
        
        Returns:
            Prompt formaté pour Gemini
        """
        return """
Tu es un assistant médical spécialisé dans l'analyse de bilans sanguins.

**TÂCHE :** Extrais UNIQUEMENT les biomarqueurs et leurs valeurs numériques de ce bilan sanguin PDF.

**FORMAT DE SORTIE :**
Retourne un JSON valide avec cette structure EXACTE (pas de texte avant ou après) :
{
  "hemoglobine": 13.2,
  "cholesterol_total": 2.3,
  "vitamine_d": 18,
  "glucose": 0.95
}

**RÈGLES IMPORTANTES :**
1. Utilise les noms de biomarqueurs en minuscules, avec underscores pour les espaces
2. Extrais UNIQUEMENT les valeurs numériques (pas les unités)
3. Si plusieurs valeurs pour un biomarqueur, prends la plus récente
4. Ignore les valeurs de référence (min/max)
5. Convertis les virgules en points pour les décimales
6. Ne retourne QUE le JSON, aucun texte explicatif

**NOMS STANDARDS À UTILISER :**
- Hémoglobine → hemoglobine
- Cholestérol total → cholesterol_total
- Cholestérol HDL → cholesterol_hdl
- Cholestérol LDL → cholesterol_ldl
- Triglycérides → triglycerides
- Glucose → glucose
- Vitamine D → vitamine_d
- Fer sérique → fer_serique
- Ferritine → ferritine
- TSH → tsh
- Créatinine → creatinine
- Urée → uree
- ASAT/SGOT → asat
- ALAT/SGPT → alat
- Gamma GT → gamma_gt
- Leucocytes → leucocytes
- Plaquettes → plaquettes

Retourne maintenant le JSON des biomarqueurs extraits :
"""
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, float]:
        """
        Parser la réponse de Gemini pour extraire le JSON
        
        Args:
            response_text: Réponse brute de Gemini
            
        Returns:
            Dictionnaire des biomarqueurs
            
        Raises:
            ValueError: Si le JSON est invalide
        """
        try:
            # Nettoyer la réponse (enlever les markdown code blocks si présents)
            cleaned_text = response_text.strip()
            
            # Enlever les ```json et ``` si présents
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            
            cleaned_text = cleaned_text.strip()
            
            # Parser le JSON
            biomarkers = json.loads(cleaned_text)
            
            # Valider que c'est un dictionnaire
            if not isinstance(biomarkers, dict):
                raise ValueError("La réponse n'est pas un objet JSON valide")
            
            # Convertir toutes les valeurs en float
            parsed_biomarkers = {}
            for key, value in biomarkers.items():
                try:
                    # Normaliser le nom (minuscules, underscores)
                    normalized_key = key.lower().strip().replace(" ", "_")
                    
                    # Convertir la valeur en float
                    parsed_biomarkers[normalized_key] = float(value)
                except (ValueError, TypeError):
                    # Ignorer les valeurs non numériques
                    continue
            
            if not parsed_biomarkers:
                raise ValueError("Aucun biomarqueur valide trouvé dans la réponse")
            
            return parsed_biomarkers
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Impossible de parser le JSON de Gemini : {str(e)}")
    
    async def validate_pdf(self, pdf_bytes: bytes, max_size_mb: int = 10) -> bool:
        """
        Valider qu'un PDF est acceptable pour traitement
        
        Args:
            pdf_bytes: Contenu du PDF
            max_size_mb: Taille maximale en MB
            
        Returns:
            True si valide
            
        Raises:
            HTTPException: Si le PDF n'est pas valide
        """
        # Vérifier la taille
        size_mb = len(pdf_bytes) / (1024 * 1024)
        if size_mb > max_size_mb:
            raise HTTPException(
                status_code=400,
                detail=f"PDF trop volumineux ({size_mb:.1f} MB). Maximum : {max_size_mb} MB"
            )
        
        # Vérifier que ce n'est pas vide
        if len(pdf_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="Le fichier PDF est vide"
            )
        
        return True


# Instance singleton du service
_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """
    Obtenir l'instance singleton du service Gemini
    
    Returns:
        Instance du GeminiService
    """
    global _gemini_service
    
    print("[GET_GEMINI_SERVICE] Appel de get_gemini_service()")
    print(f"[GET_GEMINI_SERVICE] Service déjà initialisé? {_gemini_service is not None}")
    
    if _gemini_service is None:
        print("[GET_GEMINI_SERVICE] Création d'une nouvelle instance...")
        try:
            _gemini_service = GeminiService()
            print("[GET_GEMINI_SERVICE] ✅ Instance créée avec succès")
        except Exception as e:
            print(f"[GET_GEMINI_SERVICE] ❌ Erreur lors de la création: {e}")
            import traceback
            traceback.print_exc()
            raise
    else:
        print("[GET_GEMINI_SERVICE] Réutilisation de l'instance existante")
    
    return _gemini_service

