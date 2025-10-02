"""
Script de migration pour mettre à jour le schéma de la base de données
"""
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database.connection import engine


def check_column_exists(column_name: str, table_name: str = "biomarkers") -> bool:
    """
    Vérifier si une colonne existe dans une table
    
    Args:
        column_name: Nom de la colonne
        table_name: Nom de la table
        
    Returns:
        True si la colonne existe, False sinon
    """
    with engine.connect() as connection:
        result = connection.execute(text("""
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = :table_name 
                AND column_name = :column_name
            )
        """), {"table_name": table_name, "column_name": column_name})
        return result.scalar()


def run_migrations():
    """
    Exécuter les migrations nécessaires pour mettre à jour le schéma
    """
    print("🔄 Vérification des migrations de base de données...")
    
    migrations_applied = 0
    
    with engine.connect() as connection:
        # Migration 1 : Renommer min_normal -> min_value
        if check_column_exists("min_normal") and not check_column_exists("min_value"):
            try:
                connection.execute(text("ALTER TABLE biomarkers RENAME COLUMN min_normal TO min_value"))
                connection.commit()
                print(f"  ✅ Renommage de min_normal en min_value")
                migrations_applied += 1
            except Exception as e:
                print(f"  ❌ Erreur lors du renommage min_normal: {e}")
                connection.rollback()
        
        # Migration 2 : Renommer max_normal -> max_value
        if check_column_exists("max_normal") and not check_column_exists("max_value"):
            try:
                connection.execute(text("ALTER TABLE biomarkers RENAME COLUMN max_normal TO max_value"))
                connection.commit()
                print(f"  ✅ Renommage de max_normal en max_value")
                migrations_applied += 1
            except Exception as e:
                print(f"  ❌ Erreur lors du renommage max_normal: {e}")
                connection.rollback()
        
        # Migrations pour ajouter les colonnes manquantes
        migrations = [
            {
                "column": "min_value",
                "sql": "ALTER TABLE biomarkers ADD COLUMN min_value DOUBLE PRECISION",
                "description": "Ajout de la colonne min_value"
            },
            {
                "column": "max_value",
                "sql": "ALTER TABLE biomarkers ADD COLUMN max_value DOUBLE PRECISION",
                "description": "Ajout de la colonne max_value"
            },
            {
                "column": "explanation",
                "sql": "ALTER TABLE biomarkers ADD COLUMN explanation TEXT",
                "description": "Ajout de la colonne explanation"
            },
            {
                "column": "advice_low",
                "sql": "ALTER TABLE biomarkers ADD COLUMN advice_low TEXT",
                "description": "Ajout de la colonne advice_low"
            },
            {
                "column": "advice_high",
                "sql": "ALTER TABLE biomarkers ADD COLUMN advice_high TEXT",
                "description": "Ajout de la colonne advice_high"
            },
            {
                "column": "advice_normal",
                "sql": "ALTER TABLE biomarkers ADD COLUMN advice_normal TEXT",
                "description": "Ajout de la colonne advice_normal"
            }
        ]
        
        for migration in migrations:
            if not check_column_exists(migration["column"]):
                try:
                    connection.execute(text(migration["sql"]))
                    connection.commit()
                    print(f"  ✅ {migration['description']}")
                    migrations_applied += 1
                except Exception as e:
                    print(f"  ❌ Erreur lors de la migration '{migration['description']}': {e}")
                    connection.rollback()
            else:
                print(f"  ⏭️  {migration['description']} - déjà appliquée")
    
    if migrations_applied > 0:
        print(f"✅ {migrations_applied} migration(s) appliquée(s) avec succès !")
    else:
        print("✅ Aucune migration nécessaire, le schéma est à jour.")


if __name__ == "__main__":
    run_migrations()

