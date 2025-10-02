# 🧪 Fichiers de test pour Healer

Ce dossier contient des fichiers de test pour valider le fonctionnement de la plateforme Healer.

## Fichiers disponibles

### 1. `bilan_normal.json`
Bilan avec toutes les valeurs dans les normes.
- **Format** : JSON
- **Biomarqueurs** : 5
- **Statut attendu** : Tous normaux

### 2. `bilan_anomalies.json`
Bilan avec plusieurs anomalies (valeurs hautes et basses).
- **Format** : JSON
- **Biomarqueurs** : 10
- **Statut attendu** : Mélange de valeurs normales, basses et élevées

### 3. `bilan_complet.csv`
Bilan complet avec tous les biomarqueurs disponibles.
- **Format** : CSV
- **Biomarqueurs** : 10
- **Statut attendu** : Valeurs majoritairement normales

### 4. `bilan_simple.csv`
Bilan simple pour test rapide.
- **Format** : CSV
- **Biomarqueurs** : 3
- **Statut attendu** : 1 valeur basse (vitamine D)

## Comment utiliser ces fichiers ?

1. Lancez l'application Healer : http://localhost:3000
2. Cliquez sur "Importer votre bilan sanguin"
3. Sélectionnez un des fichiers de test
4. Cliquez sur "Analyser"

## Biomarqueurs disponibles

Les biomarqueurs suivants sont reconnus par le système :

| Nom technique | Nom d'affichage | Plage normale | Unité |
|--------------|-----------------|---------------|-------|
| `hemoglobine` | Hémoglobine | 13.0 - 17.0 | g/dL |
| `cholesterol_total` | Cholestérol Total | 1.5 - 2.0 | g/L |
| `vitamine_d` | Vitamine D | 30.0 - 100.0 | ng/mL |
| `glucose` | Glycémie | 0.7 - 1.1 | g/L |
| `fer_serique` | Fer Sérique | 60.0 - 170.0 | µg/dL |
| `creatinine` | Créatinine | 7.0 - 13.0 | mg/L |
| `leucocytes` | Leucocytes | 4.0 - 10.0 | G/L |
| `tsh` | TSH | 0.4 - 4.0 | mUI/L |
| `transaminases_alat` | ALAT | 10.0 - 40.0 | UI/L |
| `plaquettes` | Plaquettes | 150.0 - 400.0 | G/L |

## Formats supportés

### JSON
```json
{
  "hemoglobine": 13.2,
  "cholesterol_total": 2.3,
  "vitamine_d": 18
}
```

### CSV
```csv
biomarqueur,valeur
hemoglobine,13.2
cholesterol_total,2.3
vitamine_d,18
```

## Notes

- Les noms de biomarqueurs sont insensibles à la casse
- Les espaces sont convertis en underscores
- Les valeurs décimales peuvent utiliser `.` ou `,`
- Les biomarqueurs non reconnus sont marqués comme "inconnu"


