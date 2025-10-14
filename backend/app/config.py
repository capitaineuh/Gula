"""
Configuration de l'application
"""
import os
from pathlib import Path
from dotenv import load_dotenv, dotenv_values

# Charger les variables d'environnement depuis différents emplacements possibles
env_candidates = [
    Path(__file__).resolve().parent / '.env',              # backend/app/.env
    Path(__file__).resolve().parent.parent / '.env',       # backend/.env (dans le conteneur → /app/.env)
    Path.cwd() / '.env',                                   # CWD/.env (ex: /app/.env)
]

loaded_any = False
for idx, candidate in enumerate(env_candidates, start=1):
    try:
        print(f"[CONFIG] (#{idx}) Tentative de chargement: {candidate}")
        if candidate.exists():
            # override=True pour écraser d'éventuelles valeurs vides/incomplètes du processus
            load_dotenv(dotenv_path=candidate, override=True, encoding='utf-8')
            print(f"[CONFIG] ✅ .env chargé depuis: {candidate}")
            loaded_any = True
            # Log des clés présentes (pour debug)
            try:
                values = dotenv_values(candidate, encoding='utf-8')
                print(f"[CONFIG] Clés trouvées dans {candidate.name}: {list(values.keys())}")
                # Gestion d'un éventuel BOM sur la première clé (\ufeff)
                bom_key = '\ufeffGEMINI_API_KEY'
                if not os.getenv('GEMINI_API_KEY'):
                    fallback = values.get('GEMINI_API_KEY') or values.get(bom_key)
                    if fallback:
                        os.environ['GEMINI_API_KEY'] = fallback
                        print("[CONFIG] ✅ GEMINI_API_KEY définie via fallback (dotenv_values)")
            except Exception as e:
                print(f"[CONFIG] ⚠️ Impossible d'inspecter {candidate.name}: {e}")
            break  # Utiliser le premier .env trouvé et s'arrêter
        else:
            print(f"[CONFIG] ⚠️ Fichier inexistant: {candidate}")
    except Exception as e:
        print(f"[CONFIG] ❌ Erreur lors du chargement de {candidate}: {e}")

if not loaded_any:
    print("[CONFIG] ⚠️ Aucun fichier .env trouvé. On compte sur les variables d'environnement du processus (Docker / OS).")
else:
    print("[CONFIG] Variables d'environnement chargées depuis un ou plusieurs emplacements.")

# Secret pour les JWT
JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "YOUR_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION_USE_OPENSSL_RAND_HEX_32"
)

# Durée de vie du token JWT (en secondes)
JWT_EXPIRATION = int(os.getenv("JWT_EXPIRATION", 86400))  # 24 heures par défaut

# Environnement
ENV = os.getenv("ENV", "development")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# CORS
if ENV == "production":
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
else:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"[CONFIG] GEMINI_API_KEY chargée? {bool(GEMINI_API_KEY)}")
if GEMINI_API_KEY:
    print(f"[CONFIG] GEMINI_API_KEY (premiers chars): {GEMINI_API_KEY[:10]}...")
else:
    print("[CONFIG] ⚠️ GEMINI_API_KEY est None ou vide!")

