"""
Script pour pré-remplir la base de données avec des biomarqueurs de référence
"""
from sqlalchemy.orm import Session
from app.models.base import Biomarker
from app.database.connection import SessionLocal


def seed_biomarkers(db: Session):
    """
    Insérer les biomarqueurs de référence dans la base de données
    """
    biomarkers_data = [
        {
            "name": "hemoglobine",
            "display_name": "Hémoglobine",
            "unit": "g/dL",
            "min_value": 13.0,
            "max_value": 17.0,
            "category": "Hématologie",
            "description": "Protéine des globules rouges qui transporte l'oxygène",
            "explanation": "L'hémoglobine est une protéine essentielle présente dans vos globules rouges. Elle capture l'oxygène dans vos poumons et le distribue à tous vos organes et tissus. Un taux normal garantit que votre corps reçoit suffisamment d'oxygène.",
            "advice_low": "Votre taux d'hémoglobine est bas (anémie). Cela peut causer fatigue et essoufflement. Augmentez votre consommation d'aliments riches en fer (viande rouge, épinards, lentilles) et consultez un médecin pour identifier la cause.",
            "advice_high": "Votre taux d'hémoglobine est élevé. Cela peut être dû à la déshydratation, au tabagisme ou à l'altitude. Assurez-vous de bien vous hydrater et consultez si cela persiste.",
            "advice_normal": "Excellent ! Votre taux d'hémoglobine est dans la norme. Continuez une alimentation équilibrée riche en fer."
        },
        {
            "name": "cholesterol_total",
            "display_name": "Cholestérol Total",
            "unit": "g/L",
            "min_value": 1.5,
            "max_value": 2.0,
            "category": "Lipides",
            "description": "Graisse essentielle pour les cellules et hormones",
            "explanation": "Le cholestérol est une graisse indispensable pour construire vos cellules et produire des hormones. Cependant, un excès peut s'accumuler dans vos artères et augmenter le risque cardiovasculaire.",
            "advice_low": "Votre cholestérol est bas, ce qui est généralement favorable. Assurez-vous simplement d'avoir une alimentation équilibrée incluant des bonnes graisses (huile d'olive, poissons gras).",
            "advice_high": "Votre cholestérol est élevé. Réduisez les graisses saturées (charcuterie, fromages gras, pâtisseries) et privilégiez les fibres (légumes, fruits, céréales complètes). Une activité physique régulière aide aussi. Consultez un médecin.",
            "advice_normal": "Parfait ! Votre taux de cholestérol est optimal. Maintenez une alimentation équilibrée et une activité physique régulière."
        },
        {
            "name": "vitamine_d",
            "display_name": "Vitamine D",
            "unit": "ng/mL",
            "min_value": 30.0,
            "max_value": 100.0,
            "category": "Vitamines",
            "description": "Vitamine essentielle pour les os et l'immunité",
            "explanation": "La vitamine D aide votre corps à absorber le calcium pour des os solides. Elle joue aussi un rôle crucial dans votre système immunitaire et votre humeur. Votre peau la produit grâce au soleil.",
            "advice_low": "Votre taux de vitamine D est insuffisant. Exposez-vous au soleil 15-20 minutes par jour (bras et visage), consommez des poissons gras (saumon, maquereau) et envisagez une supplémentation après avis médical.",
            "advice_high": "Votre taux de vitamine D est très élevé, ce qui est rare et peut être dû à une supplémentation excessive. Consultez un médecin pour ajuster votre dosage.",
            "advice_normal": "Excellent ! Votre taux de vitamine D est idéal. Continuez à vous exposer raisonnablement au soleil et à consommer des aliments riches en vitamine D."
        },
        {
            "name": "glucose",
            "display_name": "Glycémie (Glucose)",
            "unit": "g/L",
            "min_value": 0.7,
            "max_value": 1.1,
            "category": "Métabolisme",
            "description": "Taux de sucre dans le sang à jeun",
            "explanation": "Le glucose est le carburant principal de votre corps, spécialement pour votre cerveau. Un taux stable est essentiel. Trop de glucose peut endommager vos vaisseaux sanguins (diabète).",
            "advice_low": "Votre glycémie est basse (hypoglycémie). Évitez les jeûnes prolongés, mangez régulièrement avec des glucides complexes (pain complet, légumineuses) et consultez si cela se répète.",
            "advice_high": "Votre glycémie est élevée. Cela peut indiquer un pré-diabète ou diabète. Réduisez les sucres rapides (sodas, bonbons, pâtisseries), privilégiez les fibres, faites de l'exercice et consultez rapidement un médecin.",
            "advice_normal": "Parfait ! Votre glycémie est normale. Maintenez une alimentation équilibrée et limitez les sucres raffinés."
        },
        {
            "name": "fer_serique",
            "display_name": "Fer Sérique",
            "unit": "µg/dL",
            "min_value": 60.0,
            "max_value": 170.0,
            "category": "Hématologie",
            "description": "Quantité de fer circulant dans le sang",
            "explanation": "Le fer est indispensable pour fabriquer l'hémoglobine. Sans fer suffisant, vous ne pouvez pas produire assez de globules rouges, ce qui cause fatigue et pâleur.",
            "advice_low": "Votre fer est bas (carence martiale). Augmentez les aliments riches en fer (viande rouge, abats, légumes verts, légumineuses) et associez-les à de la vitamine C pour mieux l'absorber. Un complément peut être nécessaire.",
            "advice_high": "Votre fer est élevé. Cela peut indiquer une surcharge en fer. Évitez les suppléments en fer et consultez un médecin pour identifier la cause (hémochromatose possible).",
            "advice_normal": "Très bien ! Votre taux de fer est optimal. Continuez une alimentation variée."
        },
        {
            "name": "creatinine",
            "display_name": "Créatinine",
            "unit": "mg/L",
            "min_value": 7.0,
            "max_value": 13.0,
            "category": "Fonction rénale",
            "description": "Marqueur de la fonction des reins",
            "explanation": "La créatinine est un déchet produit par vos muscles et éliminé par vos reins. Son taux dans le sang reflète l'efficacité de vos reins à filtrer les déchets.",
            "advice_low": "Votre créatinine est basse, ce qui est rare et généralement sans gravité. Cela peut refléter une faible masse musculaire. Aucune action nécessaire sauf si d'autres symptômes.",
            "advice_high": "Votre créatinine est élevée, ce qui peut indiquer un problème rénal. Hydratez-vous bien, réduisez les protéines si vous en consommez beaucoup et consultez un médecin rapidement pour évaluer votre fonction rénale.",
            "advice_normal": "Excellent ! Vos reins fonctionnent parfaitement. Continuez à bien vous hydrater (1,5 à 2L d'eau par jour)."
        },
        {
            "name": "leucocytes",
            "display_name": "Leucocytes (Globules Blancs)",
            "unit": "G/L",
            "min_value": 4.0,
            "max_value": 10.0,
            "category": "Immunité",
            "description": "Cellules de défense immunitaire",
            "explanation": "Les leucocytes sont les soldats de votre système immunitaire. Ils défendent votre corps contre les infections (bactéries, virus). Leur nombre varie selon votre état de santé.",
            "advice_low": "Votre taux de leucocytes est bas (leucopénie). Cela peut affaiblir votre immunité. Évitez les lieux bondés, soignez votre sommeil, gérez le stress et consultez un médecin pour identifier la cause.",
            "advice_high": "Votre taux de leucocytes est élevé. Cela indique souvent une infection ou inflammation en cours. Reposez-vous, hydratez-vous et consultez un médecin pour identifier la cause et traiter si nécessaire.",
            "advice_normal": "Parfait ! Votre système immunitaire fonctionne bien. Maintenez un mode de vie sain (sommeil, alimentation équilibrée, gestion du stress)."
        },
        {
            "name": "tsh",
            "display_name": "TSH (Hormone Thyroïdienne)",
            "unit": "mUI/L",
            "min_value": 0.4,
            "max_value": 4.0,
            "category": "Hormones",
            "description": "Hormone de régulation de la thyroïde",
            "explanation": "La TSH régule votre thyroïde, glande qui contrôle votre métabolisme (énergie, poids, température). Un déséquilibre peut affecter votre forme physique et mentale.",
            "advice_low": "Votre TSH est basse (hyperthyroïdie possible). Cela peut causer agitation, perte de poids, palpitations. Consultez un endocrinologue pour un bilan complet de la thyroïde.",
            "advice_high": "Votre TSH est élevée (hypothyroïdie possible). Cela peut causer fatigue, prise de poids, frilosité. Consultez un médecin pour évaluer votre fonction thyroïdienne et envisager un traitement.",
            "advice_normal": "Excellent ! Votre thyroïde fonctionne normalement. Continuez à surveiller votre énergie et votre poids."
        },
        {
            "name": "transaminases_alat",
            "display_name": "ALAT (Transaminases)",
            "unit": "UI/L",
            "min_value": 10.0,
            "max_value": 40.0,
            "category": "Fonction hépatique",
            "description": "Enzyme reflétant la santé du foie",
            "explanation": "Les ALAT sont des enzymes présentes dans votre foie. Quand le foie est endommagé (alcool, médicaments, virus), ces enzymes se libèrent dans le sang. C'est un indicateur de santé hépatique.",
            "advice_low": "Votre taux d'ALAT est très bas, ce qui est généralement excellent. Aucune action nécessaire.",
            "advice_high": "Vos ALAT sont élevées (souffrance hépatique). Réduisez ou arrêtez l'alcool, évitez les aliments gras, vérifiez vos médicaments et consultez un médecin pour explorer la cause (hépatite, stéatose...).",
            "advice_normal": "Parfait ! Votre foie fonctionne bien. Limitez l'alcool et maintenez une alimentation saine."
        },
        {
            "name": "plaquettes",
            "display_name": "Plaquettes",
            "unit": "G/L",
            "min_value": 150.0,
            "max_value": 400.0,
            "category": "Hématologie",
            "description": "Cellules responsables de la coagulation",
            "explanation": "Les plaquettes sont de petites cellules qui colmatent les blessures et arrêtent les saignements. Trop peu augmente le risque d'hémorragie, trop peut favoriser la formation de caillots.",
            "advice_low": "Votre taux de plaquettes est bas (thrombopénie). Attention aux saignements et ecchymoses. Évitez les sports à risque et consultez rapidement un médecin pour identifier la cause.",
            "advice_high": "Votre taux de plaquettes est élevé. Cela peut être réactionnel (infection, inflammation) ou indiquer un trouble sanguin. Consultez un médecin pour un bilan complet.",
            "advice_normal": "Excellent ! Votre coagulation fonctionne normalement. Aucune action particulière nécessaire."
        }
    ]
    
    # Vérifier si les données existent déjà
    existing = db.query(Biomarker).count()
    if existing > 0:
        print(f"⚠️  {existing} biomarqueurs déjà présents en base. Seed ignoré.")
        return
    
    # Insérer les biomarqueurs
    for data in biomarkers_data:
        biomarker = Biomarker(**data)
        db.add(biomarker)
    
    db.commit()
    print(f"✅ {len(biomarkers_data)} biomarqueurs insérés avec succès !")


def main():
    """Point d'entrée du script de seed"""
    print("🌱 Début du seed de la base de données...")
    db = SessionLocal()
    try:
        seed_biomarkers(db)
    except Exception as e:
        print(f"❌ Erreur lors du seed : {e}")
        db.rollback()
    finally:
        db.close()
    print("✅ Seed terminé !")


if __name__ == "__main__":
    main()


