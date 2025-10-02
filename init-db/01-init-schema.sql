-- Script d'initialisation de la base de données Healer
-- Ce script crée les tables si elles n'existent pas

-- Créer la table biomarkers
CREATE TABLE IF NOT EXISTS biomarkers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    min_value DOUBLE PRECISION NOT NULL,
    max_value DOUBLE PRECISION NOT NULL,
    description TEXT,
    category VARCHAR(100),
    explanation TEXT NOT NULL,
    advice_low TEXT,
    advice_high TEXT,
    advice_normal TEXT
);

-- Créer un index sur le champ name pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_biomarkers_name ON biomarkers(name);

-- Créer la table blood_test_results pour l'historique
CREATE TABLE IF NOT EXISTS blood_test_results (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    biomarker_name VARCHAR(100) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    status VARCHAR(50)
);

-- Créer un index sur session_id pour optimiser les requêtes d'historique
CREATE INDEX IF NOT EXISTS idx_blood_test_results_session ON blood_test_results(session_id);

-- Script de migration : ajouter les colonnes manquantes si elles n'existent pas déjà
DO $$
BEGIN
    -- Ajouter min_value si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'biomarkers' AND column_name = 'min_value'
    ) THEN
        ALTER TABLE biomarkers ADD COLUMN min_value DOUBLE PRECISION;
        RAISE NOTICE 'Colonne min_value ajoutée à la table biomarkers';
    END IF;

    -- Ajouter max_value si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'biomarkers' AND column_name = 'max_value'
    ) THEN
        ALTER TABLE biomarkers ADD COLUMN max_value DOUBLE PRECISION;
        RAISE NOTICE 'Colonne max_value ajoutée à la table biomarkers';
    END IF;

    -- Ajouter explanation si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'biomarkers' AND column_name = 'explanation'
    ) THEN
        ALTER TABLE biomarkers ADD COLUMN explanation TEXT;
        RAISE NOTICE 'Colonne explanation ajoutée à la table biomarkers';
    END IF;

    -- Ajouter advice_low si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'biomarkers' AND column_name = 'advice_low'
    ) THEN
        ALTER TABLE biomarkers ADD COLUMN advice_low TEXT;
        RAISE NOTICE 'Colonne advice_low ajoutée à la table biomarkers';
    END IF;

    -- Ajouter advice_high si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'biomarkers' AND column_name = 'advice_high'
    ) THEN
        ALTER TABLE biomarkers ADD COLUMN advice_high TEXT;
        RAISE NOTICE 'Colonne advice_high ajoutée à la table biomarkers';
    END IF;

    -- Ajouter advice_normal si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'biomarkers' AND column_name = 'advice_normal'
    ) THEN
        ALTER TABLE biomarkers ADD COLUMN advice_normal TEXT;
        RAISE NOTICE 'Colonne advice_normal ajoutée à la table biomarkers';
    END IF;
END $$;

