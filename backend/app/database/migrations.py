"""
Gestion des migrations de schéma de base de données
"""
from sqlalchemy import inspect, text
from app.database.connection import engine
import logging

logger = logging.getLogger(__name__)


def migrate_biomarkers_table():
    """Migration pour la table biomarkers"""
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
        logger.info(f"Colonnes manquantes détectées dans biomarkers : {missing_columns}")
        
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
        logger.info("Table biomarkers à jour")


def migrate_user_profiles_table():
    """Migration pour créer la table user_profiles"""
    inspector = inspect(engine)
    
    # Vérifier si la table user_profiles existe déjà
    if 'user_profiles' in inspector.get_table_names():
        logger.info("Table user_profiles existe déjà")
        return
    
    logger.info("Création de la table user_profiles...")
    
    # SQL pour créer la table user_profiles
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        -- Informations de base
        birthdate DATE,
        biological_sex VARCHAR(20),
        height FLOAT,
        weight FLOAT,
        ethnicity VARCHAR(50),
        blood_type VARCHAR(10),
        
        -- Mode de vie
        alcohol_consumption VARCHAR(30),
        tobacco_consumption VARCHAR(30),
        diet_type VARCHAR(50),
        medications TEXT,
        supplements TEXT,
        physical_activity_level VARCHAR(30),
        
        -- Contexte physiologique lors de la prise de sang
        is_menopause BOOLEAN DEFAULT FALSE,
        is_pregnant BOOLEAN DEFAULT FALSE,
        menstrual_cycle_phase VARCHAR(30),
        blood_test_time VARCHAR(20),
        blood_test_fasting BOOLEAN DEFAULT FALSE,
        
        -- Contexte médical
        chronic_diseases TEXT,
        family_history TEXT,
        recent_infection TEXT,
        
        -- Métadonnées
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
    """
    
    try:
        with engine.connect() as conn:
            conn.execute(text(create_table_sql))
            conn.commit()
            logger.info("Table user_profiles créée avec succès")
    except Exception as e:
        logger.error(f"Erreur lors de la création de la table user_profiles: {e}")


def run_migrations():
    """
    Exécuter toutes les migrations nécessaires pour mettre à jour le schéma
    """
    logger.info("Démarrage des migrations...")
    migrate_biomarkers_table()
    migrate_user_profiles_table()
    logger.info("Migrations terminées")
