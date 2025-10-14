#!/usr/bin/env python3
"""
Script de test pour vérifier la configuration Gemini
"""
import sys
import os
from pathlib import Path

print("=" * 60)
print("TEST DE CONFIGURATION GEMINI")
print("=" * 60)

# 1. Vérifier que le .env existe
print("\n[1] Vérification du fichier .env...")
env_path = Path(__file__).resolve().parent / '.env'
print(f"    Chemin: {env_path}")
if env_path.exists():
    print("    ✅ Fichier .env trouvé")
else:
    print("    ❌ Fichier .env non trouvé!")
    print("    Créez un fichier backend/.env avec GEMINI_API_KEY=votre_clé")
    sys.exit(1)

# 2. Charger le .env
print("\n[2] Chargement du .env...")
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=env_path)
    print("    ✅ .env chargé")
except Exception as e:
    print(f"    ❌ Erreur: {e}")
    sys.exit(1)

# 3. Vérifier GEMINI_API_KEY
print("\n[3] Vérification de GEMINI_API_KEY...")
gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    print(f"    ✅ GEMINI_API_KEY trouvée")
    print(f"    Longueur: {len(gemini_key)} caractères")
    print(f"    Commence par: {gemini_key[:10]}...")
else:
    print("    ❌ GEMINI_API_KEY non trouvée dans .env!")
    sys.exit(1)

# 4. Vérifier que google-generativeai est installé
print("\n[4] Vérification du module google-generativeai...")
try:
    import google.generativeai as genai
    version = genai.__version__ if hasattr(genai, '__version__') else 'inconnue'
    print(f"    ✅ Module installé (version: {version})")
except ImportError:
    print("    ❌ Module non installé!")
    print("    Exécutez: pip install google-generativeai")
    sys.exit(1)

# 5. Tester la configuration Gemini
print("\n[5] Test de configuration Gemini...")
try:
    genai.configure(api_key=gemini_key)
    print("    ✅ Configuration réussie")
except Exception as e:
    print(f"    ❌ Erreur: {e}")
    sys.exit(1)

# 6. Tester la création du modèle
print("\n[6] Test de création du modèle...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("    ✅ Modèle créé")
except Exception as e:
    print(f"    ❌ Erreur: {e}")
    sys.exit(1)

# 7. Test simple avec texte
print("\n[7] Test simple avec texte...")
try:
    response = model.generate_content("Réponds simplement 'OK' si tu me comprends")
    print(f"    ✅ Réponse reçue: {response.text[:50]}")
except Exception as e:
    print(f"    ❌ Erreur: {e}")
    print(f"    Vérifiez que votre clé API est valide")
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ TOUS LES TESTS SONT PASSÉS!")
print("=" * 60)
print("\nVotre configuration Gemini est correcte.")
print("Vous pouvez maintenant démarrer le serveur.")

