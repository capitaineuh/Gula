"""
Gestion des migrations de schéma de base de données
"""
from sqlalchemy import inspect, text
from app.database.connection import engine
import logging

logger = logging.getLogger(__name__)


def run_migrations():
    """
    Exécuter les migrations nécessaires pour mettre à jour le schéma
    Cette fonction vérifie et ajoute les colonnes manquantes si nécessaire
    """
    inspector = inspect(engine)
    
    # Vérifier si la table biomarkers existe
    if 'biomarkers' not in inspector.get_table_names():
        logger.info("Table biomarkers n'existe pas encore, elle sera créée par create_all()")
        return
    
    # Récupérer les colonnes existantes
    existing_columns = {col['name'] for col in inspector.get_columns('biomarkers')}
    
    # Définir les colonnes requises
    required_columns = {
        'id', 'name', 'display_name', 'unit', 'min_value', 'max_value',
        'description', 'category', 'explanation', 'advice_low', 
        'advice_high', 'advice_normal'
    }
    
    # Trouver les colonnes manquantes
    missing_columns = required_columns - existing_columns
    
    if missing_columns:
        logger.info(f"Colonnes manquantes détectées : {missing_columns}")
        
        # Mapper les anciennes colonnes vers les nouvelles
        column_mapping = {
            'min_value': ('min_normal', 'FLOAT'),
            'max_value': ('max_normal', 'FLOAT'),
        }
        
        with engine.connect() as conn:
            for new_col in missing_columns:
                if new_col in ['explanation', 'advice_low', 'advice_high', 'advice_normal']:
                    # Nouvelles colonnes TEXT
                    default_value = "'Information à venir'" if new_col == 'explanation' else 'NULL'
                    query = f"ALTER TABLE biomarkers ADD COLUMN IF NOT EXISTS {new_col} TEXT DEFAULT {default_value}"
                    try:
                        conn.execute(text(query))
                        conn.commit()
                        logger.info(f"Colonne {new_col} ajoutée avec succès")
                    except Exception as e:
                        logger.warning(f"Erreur lors de l'ajout de {new_col}: {e}")
                
                elif new_col in column_mapping:
                    # Renommer les anciennes colonnes
                    old_col, col_type = column_mapping[new_col]
                    if old_col in existing_columns:
                        query = f"ALTER TABLE biomarkers RENAME COLUMN {old_col} TO {new_col}"
                        try:
                            conn.execute(text(query))
                            conn.commit()
                            logger.info(f"Colonne {old_col} renommée en {new_col}")
                        except Exception as e:
                            logger.warning(f"Erreur lors du renommage {old_col} -> {new_col}: {e}")
    else:
        logger.info("Schéma de base de données à jour, aucune migration nécessaire")
