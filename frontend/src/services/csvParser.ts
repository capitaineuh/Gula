/**
 * Service pour parser les fichiers CSV de bilans sanguins
 */

export interface ParsedData {
  biomarkers: Record<string, number>;
}

/**
 * Parser un fichier CSV en données de biomarqueurs
 * 
 * Format attendu du CSV:
 * biomarqueur,valeur
 * hemoglobine,13.2
 * cholesterol_total,2.3
 * 
 * @param csvText Contenu du fichier CSV
 * @returns Données parsées
 */
export function parseCSV(csvText: string): ParsedData {
  const lines = csvText.trim().split('\n');
  const biomarkers: Record<string, number> = {};
  
  // Ignorer la première ligne si c'est un header
  const startIndex = lines[0].toLowerCase().includes('biomarqueur') || 
                     lines[0].toLowerCase().includes('name') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Séparer par virgule ou point-virgule
    const parts = line.split(/[,;]/);
    if (parts.length < 2) continue;
    
    const name = parts[0].trim().toLowerCase().replace(/\s+/g, '_');
    const valueStr = parts[1].trim().replace(',', '.'); // Gérer les décimales avec virgule
    const value = parseFloat(valueStr);
    
    if (name && !isNaN(value)) {
      biomarkers[name] = value;
    }
  }
  
  return { biomarkers };
}

/**
 * Parser un fichier JSON
 * 
 * Format attendu:
 * {
 *   "hemoglobine": 13.2,
 *   "cholesterol_total": 2.3
 * }
 * 
 * OU
 * 
 * {
 *   "biomarkers": {
 *     "hemoglobine": 13.2,
 *     "cholesterol_total": 2.3
 *   }
 * }
 * 
 * @param jsonText Contenu du fichier JSON
 * @returns Données parsées
 */
export function parseJSON(jsonText: string): ParsedData {
  try {
    const data = JSON.parse(jsonText);
    
    // Si le JSON a une propriété "biomarkers", utiliser celle-ci
    if (data.biomarkers && typeof data.biomarkers === 'object') {
      return { biomarkers: data.biomarkers };
    }
    
    // Sinon, considérer que le JSON entier est la liste des biomarqueurs
    return { biomarkers: data };
  } catch (error) {
    throw new Error('Format JSON invalide');
  }
}

/**
 * Valider les données parsées
 * 
 * @param data Données à valider
 * @returns true si valide, sinon lance une erreur
 */
export function validateParsedData(data: ParsedData): boolean {
  if (!data.biomarkers || typeof data.biomarkers !== 'object') {
    throw new Error('Les données doivent contenir un objet "biomarkers"');
  }
  
  const entries = Object.entries(data.biomarkers);
  if (entries.length === 0) {
    throw new Error('Aucun biomarqueur trouvé dans les données');
  }
  
  for (const [name, value] of entries) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Valeur invalide pour le biomarqueur "${name}": ${value}`);
    }
  }
  
  return true;
}


