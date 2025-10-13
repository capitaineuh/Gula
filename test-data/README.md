# 🧪 Fichiers de test pour Gula

Ce dossier contient des fichiers de test pour valider le fonctionnement de la plateforme Gula avec une grande variété de biomarqueurs.

## 📋 Fichiers disponibles

### 1. `bilan_normal.json` ✅
**Bilan sanguin avec toutes les valeurs dans les normes**
- **Format** : JSON
- **Biomarqueurs** : 37 (panel complet)
- **Statut attendu** : Toutes les valeurs normales
- **Utilisation** : Tester un profil en bonne santé

### 2. `bilan_excellent.json` 🌟
**Bilan sanguin excellent avec valeurs optimales**
- **Format** : JSON
- **Biomarqueurs** : 37 (panel complet)
- **Statut attendu** : Toutes les valeurs optimales
- **Utilisation** : Tester un profil de santé exceptionnelle

### 3. `bilan_anomalies.json` ⚠️
**Bilan avec plusieurs anomalies significatives**
- **Format** : JSON
- **Biomarqueurs** : 37 (panel complet)
- **Statut attendu** : Multiples valeurs anormales (basses et hautes)
- **Utilisation** : Tester la détection et les conseils pour anomalies
- **Anomalies incluses** :
  - Anémie (hémoglobine basse, ferritine basse)
  - Cholestérol élevé (LDL haut, HDL bas)
  - Carence en vitamine D
  - Glycémie élevée (pré-diabète)
  - Inflammation (CRP élevée)
  - Troubles hépatiques (transaminases élevées)

### 4. `bilan_complet_anomalies.json` 🔬
**Bilan complet avec anomalies modérées variées**
- **Format** : JSON
- **Biomarqueurs** : 37 (panel complet)
- **Statut attendu** : Mix de valeurs limites et légèrement anormales
- **Utilisation** : Tester les cas borderline et limites

### 5. `bilan_complet.csv` 📊
**Bilan complet au format CSV**
- **Format** : CSV
- **Biomarqueurs** : 37 (panel complet)
- **Statut attendu** : Toutes les valeurs normales
- **Utilisation** : Tester l'import CSV avec beaucoup de données

### 6. `bilan_simple.csv` 📄
**Bilan minimaliste au format CSV**
- **Format** : CSV
- **Biomarqueurs** : 9 (basiques)
- **Statut attendu** : Quelques valeurs limites
- **Utilisation** : Tester avec un petit échantillon de données

## 🎯 Comment utiliser ces fichiers ?

### Méthode 1 : Via l'interface web
1. Lancez l'application Gula : http://localhost:3000
2. Cliquez sur "Choisir un fichier"
3. Sélectionnez un des fichiers de test
4. Cliquez sur "Analyser maintenant"
5. Explorez les résultats et recommandations

### Méthode 2 : Via l'API directement
```bash
# Exemple avec curl
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d @test-data/bilan_normal.json
```

## 📊 Biomarqueurs disponibles (40 au total)

### Hématologie (6)
- Hémoglobine, Fer sérique, Plaquettes, Hématocrite, VGM, Érythrocytes

### Lipides (4)
- Cholestérol total, Cholestérol HDL, Cholestérol LDL, Triglycérides

### Vitamines (4)
- Vitamine D, Vitamine B12, Vitamine B9, Vitamine C

### Minéraux (6)
- Calcium, Magnésium, Potassium, Sodium, Phosphore, Zinc

### Métabolisme (1)
- Glucose (Glycémie)

### Fonction rénale (3)
- Créatinine, Urée, Acide urique

### Fonction hépatique (5)
- ALAT, ASAT, Gamma-GT, Phosphatases alcalines, Bilirubine totale

### Immunité (1)
- Leucocytes (Globules blancs)

### Hormones (3)
- TSH, Testostérone, Cortisol

### Protéines (3)
- Albumine, Protéines totales, Ferritine

### Inflammation (1)
- CRP (Protéine C-Réactive)

## 🧬 Création de vos propres fichiers de test

### Format JSON
```json
{
  "biomarqueur_1": valeur,
  "biomarqueur_2": valeur,
  "comment": "Description optionnelle"
}
```

### Format CSV
```csv
biomarqueur,valeur
hemoglobine,14.5
glucose,0.92
vitamine_d,45
```

### Noms des biomarqueurs (à utiliser exactement)
```
hemoglobine, cholesterol_total, cholesterol_hdl, cholesterol_ldl,
vitamine_d, vitamine_b12, vitamine_b9, vitamine_c,
glucose, fer_serique, ferritine, creatinine, uree, acide_urique,
leucocytes, erythrocytes, plaquettes, hematocrite, vgm,
tsh, testosterone, cortisol,
transaminases_alat, transaminases_asat, gamma_gt, 
phosphatases_alcalines, bilirubine_totale,
calcium, magnesium, potassium, sodium, phosphore, zinc,
albumine, proteines_totales, triglycerides, crp
```

## 📈 Scénarios de test recommandés

1. **Test de santé normale** : `bilan_normal.json`
2. **Test de santé optimale** : `bilan_excellent.json`
3. **Test d'anomalies multiples** : `bilan_anomalies.json`
4. **Test de cas limites** : `bilan_complet_anomalies.json`
5. **Test d'import CSV complet** : `bilan_complet.csv`
6. **Test d'import CSV minimal** : `bilan_simple.csv`

## 💡 Conseils

- Les fichiers JSON sont plus lisibles et permettent des commentaires
- Les fichiers CSV sont plus compacts et exportables depuis Excel
- Testez avec différents fichiers pour voir la variété des conseils
- Comparez les résultats entre un bilan normal et un bilan avec anomalies

---

**Tous les fichiers sont prêts à l'emploi !** 🚀
