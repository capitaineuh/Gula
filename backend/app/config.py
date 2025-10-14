"""
Configuration de l'application
"""
import os

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

