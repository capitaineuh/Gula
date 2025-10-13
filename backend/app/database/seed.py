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
        },
        # ========== VITAMINES ==========
        {
            "name": "vitamine_b12",
            "display_name": "Vitamine B12 (Cobalamine)",
            "unit": "pg/mL",
            "min_value": 200.0,
            "max_value": 900.0,
            "category": "Vitamines",
            "description": "Vitamine essentielle pour le système nerveux et la production de globules rouges",
            "explanation": "La vitamine B12 est indispensable pour fabriquer les globules rouges et maintenir votre système nerveux en bonne santé. Elle participe aussi à la production d'ADN. Les carences sont fréquentes chez les végétariens/végétaliens car elle se trouve principalement dans les produits animaux.",
            "advice_low": "Votre taux de B12 est bas. Cela peut causer fatigue, faiblesse, troubles de la mémoire et fourmillements. Consommez plus de viandes, poissons, œufs et produits laitiers. Les végétariens/végétaliens doivent envisager une supplémentation.",
            "advice_high": "Votre taux de B12 est élevé, ce qui est rare et généralement sans danger. Cela peut être dû à une supplémentation excessive. Ajustez vos compléments si nécessaire.",
            "advice_normal": "Parfait ! Votre taux de B12 est optimal. Continuez une alimentation variée ou votre supplémentation actuelle."
        },
        {
            "name": "vitamine_b9",
            "display_name": "Vitamine B9 (Folates)",
            "unit": "ng/mL",
            "min_value": 3.0,
            "max_value": 17.0,
            "category": "Vitamines",
            "description": "Vitamine cruciale pour la division cellulaire et la grossesse",
            "explanation": "Les folates (vitamine B9) sont essentiels pour créer de nouvelles cellules et réparer l'ADN. Particulièrement important pendant la grossesse pour le développement du bébé. On les trouve dans les légumes verts à feuilles.",
            "advice_low": "Votre taux de folates est bas. Augmentez votre consommation de légumes verts (épinards, brocolis), légumineuses, agrumes et céréales enrichies. Une supplémentation peut être nécessaire, surtout si vous êtes enceinte ou planifiez une grossesse.",
            "advice_high": "Votre taux de folates est élevé, souvent lié à une supplémentation. Généralement sans danger, mais consultez si vous ne prenez pas de compléments.",
            "advice_normal": "Excellent ! Votre taux de folates est idéal. Continuez à consommer des légumes verts régulièrement."
        },
        {
            "name": "vitamine_c",
            "display_name": "Vitamine C (Acide Ascorbique)",
            "unit": "mg/L",
            "min_value": 4.0,
            "max_value": 15.0,
            "category": "Vitamines",
            "description": "Antioxydant puissant et stimulant immunitaire",
            "explanation": "La vitamine C protège vos cellules contre les dommages, renforce votre système immunitaire et aide à absorber le fer. Votre corps ne peut pas la stocker, il faut donc en consommer quotidiennement via fruits et légumes frais.",
            "advice_low": "Votre taux de vitamine C est insuffisant. Augmentez votre consommation d'agrumes, kiwis, poivrons, fraises et brocolis. Une carence sévère peut causer le scorbut (rare aujourd'hui).",
            "advice_high": "Votre taux de vitamine C est très élevé, probablement dû à une supplémentation excessive. Réduisez les compléments, l'excès est éliminé dans les urines mais peut causer des troubles digestifs.",
            "advice_normal": "Parfait ! Votre taux de vitamine C est optimal. Continuez à consommer des fruits et légumes frais quotidiennement."
        },
        # ========== LIPIDES ==========
        {
            "name": "cholesterol_hdl",
            "display_name": "Cholestérol HDL (Bon Cholestérol)",
            "unit": "g/L",
            "min_value": 0.4,
            "max_value": 0.65,
            "category": "Lipides",
            "description": "Bon cholestérol qui protège les artères",
            "explanation": "Le HDL est le 'bon' cholestérol qui nettoie vos artères en récupérant l'excès de cholestérol pour le ramener au foie. Plus votre HDL est élevé, mieux c'est protégé contre les maladies cardiovasculaires.",
            "advice_low": "Votre HDL est bas, ce qui augmente le risque cardiovasculaire. Augmentez votre activité physique (30 min/jour), consommez des bonnes graisses (huile d'olive, poissons gras, noix) et arrêtez le tabac si vous fumez.",
            "advice_high": "Excellent ! Un HDL élevé est très protecteur pour votre cœur et vos artères. Continuez vos bonnes habitudes.",
            "advice_normal": "Bien ! Votre HDL est dans la norme. Maintenez une activité physique régulière et une alimentation équilibrée."
        },
        {
            "name": "cholesterol_ldl",
            "display_name": "Cholestérol LDL (Mauvais Cholestérol)",
            "unit": "g/L",
            "min_value": 0.0,
            "max_value": 1.6,
            "category": "Lipides",
            "description": "Mauvais cholestérol qui peut obstruer les artères",
            "explanation": "Le LDL est le 'mauvais' cholestérol qui peut s'accumuler dans vos artères et former des plaques, augmentant le risque d'infarctus et d'AVC. Moins vous en avez, mieux c'est.",
            "advice_low": "Excellent ! Votre LDL est très bas, ce qui est idéal pour la santé cardiovasculaire. Continuez ainsi.",
            "advice_high": "Votre LDL est trop élevé, augmentant le risque cardiovasculaire. Réduisez les graisses saturées (viandes grasses, fromages, charcuterie, pâtisseries), privilégiez les fibres et l'activité physique. Un traitement peut être nécessaire.",
            "advice_normal": "Bien ! Votre LDL est dans la norme. Maintenez une alimentation équilibrée pauvre en graisses saturées."
        },
        {
            "name": "triglycerides",
            "display_name": "Triglycérides",
            "unit": "g/L",
            "min_value": 0.0,
            "max_value": 1.5,
            "category": "Lipides",
            "description": "Graisses circulantes dans le sang",
            "explanation": "Les triglycérides sont des graisses que votre corps utilise pour l'énergie. Un excès provient souvent d'une alimentation trop riche en sucres et alcool. Des taux élevés augmentent le risque de pancréatite et de maladies cardiovasculaires.",
            "advice_low": "Excellent ! Votre taux de triglycérides est très bas. Continuez vos bonnes habitudes alimentaires.",
            "advice_high": "Vos triglycérides sont élevés. Réduisez drastiquement les sucres (sodas, bonbons, pâtisseries), l'alcool et les graisses. Augmentez l'activité physique et privilégiez les poissons gras (oméga-3). Consultez un médecin.",
            "advice_normal": "Parfait ! Vos triglycérides sont normaux. Continuez à limiter sucres et alcool."
        },
        # ========== MINÉRAUX ==========
        {
            "name": "calcium",
            "display_name": "Calcium",
            "unit": "mg/L",
            "min_value": 90.0,
            "max_value": 105.0,
            "category": "Minéraux",
            "description": "Minéral essentiel pour les os et les muscles",
            "explanation": "Le calcium construit et maintient vos os et dents solides. Il joue aussi un rôle crucial dans la contraction musculaire, la transmission nerveuse et la coagulation. 99% du calcium de votre corps est dans vos os.",
            "advice_low": "Votre calcium est bas (hypocalcémie). Augmentez les produits laitiers, eaux minérales riches en calcium, sardines, amandes. Assurez un apport suffisant en vitamine D pour mieux l'absorber. Consultez pour identifier la cause.",
            "advice_high": "Votre calcium est élevé (hypercalcémie). Cela peut indiquer un problème de parathyroïde, un excès de vitamine D ou autre. Consultez rapidement un médecin pour explorer la cause.",
            "advice_normal": "Parfait ! Votre taux de calcium est optimal. Continuez une alimentation équilibrée riche en produits laitiers."
        },
        {
            "name": "magnesium",
            "display_name": "Magnésium",
            "unit": "mg/L",
            "min_value": 18.0,
            "max_value": 24.0,
            "category": "Minéraux",
            "description": "Minéral anti-stress et régulateur énergétique",
            "explanation": "Le magnésium participe à plus de 300 réactions dans votre corps : production d'énergie, détente musculaire, régulation du stress, santé cardiaque. Les carences sont fréquentes et causent fatigue, crampes et irritabilité.",
            "advice_low": "Votre magnésium est bas. Cela peut causer fatigue, crampes, stress, troubles du sommeil. Consommez plus de légumes verts, oléagineux (amandes, noix), chocolat noir, céréales complètes et légumineuses. Une supplémentation peut aider.",
            "advice_high": "Votre magnésium est élevé, ce qui est rare. Cela peut être dû à une supplémentation excessive ou un problème rénal. Consultez un médecin.",
            "advice_normal": "Excellent ! Votre taux de magnésium est optimal. Continuez à consommer des aliments riches en magnésium."
        },
        {
            "name": "potassium",
            "display_name": "Potassium",
            "unit": "mmol/L",
            "min_value": 3.5,
            "max_value": 5.0,
            "category": "Minéraux",
            "description": "Électrolyte vital pour le cœur et les muscles",
            "explanation": "Le potassium régule les battements de votre cœur, la contraction musculaire et l'équilibre hydrique. Un déséquilibre peut être dangereux pour le cœur. On le trouve dans les fruits et légumes.",
            "advice_low": "Votre potassium est bas (hypokaliémie). Cela peut causer faiblesse musculaire, crampes, troubles du rythme cardiaque. Augmentez bananes, avocats, pommes de terre, épinards, haricots. Consultez rapidement, surtout si vous prenez des diurétiques.",
            "advice_high": "Votre potassium est élevé (hyperkaliémie). Cela peut être dangereux pour le cœur. Consultez immédiatement un médecin. Peut être lié à un problème rénal ou certains médicaments.",
            "advice_normal": "Parfait ! Votre potassium est bien équilibré. Continuez une alimentation riche en fruits et légumes."
        },
        {
            "name": "sodium",
            "display_name": "Sodium",
            "unit": "mmol/L",
            "min_value": 136.0,
            "max_value": 145.0,
            "category": "Minéraux",
            "description": "Électrolyte régulant l'équilibre hydrique",
            "explanation": "Le sodium maintient l'équilibre des fluides dans votre corps, la pression artérielle et la transmission nerveuse. Un excès est lié à l'hypertension. La plupart du sodium vient du sel de table et aliments transformés.",
            "advice_low": "Votre sodium est bas (hyponatrémie). Cela peut causer confusion, nausées, faiblesse. Peut être lié à une déshydratation, problème rénal ou hormonal. Consultez un médecin pour identifier la cause.",
            "advice_high": "Votre sodium est élevé (hypernatrémie). Cela indique souvent une déshydratation. Buvez plus d'eau et réduisez le sel dans votre alimentation. Consultez si cela persiste.",
            "advice_normal": "Parfait ! Votre sodium est bien équilibré. Continuez à limiter le sel et à bien vous hydrater."
        },
        {
            "name": "phosphore",
            "display_name": "Phosphore",
            "unit": "mg/L",
            "min_value": 25.0,
            "max_value": 45.0,
            "category": "Minéraux",
            "description": "Minéral associé au calcium pour la santé osseuse",
            "explanation": "Le phosphore travaille avec le calcium pour construire des os et dents solides. Il participe aussi à la production d'énergie (ATP) et au fonctionnement des cellules. Présent dans la plupart des aliments.",
            "advice_low": "Votre phosphore est bas, ce qui est rare car présent dans beaucoup d'aliments. Peut indiquer un problème d'absorption. Consommez produits laitiers, viandes, poissons, légumineuses. Consultez un médecin.",
            "advice_high": "Votre phosphore est élevé. Cela peut indiquer un problème rénal ou un excès de vitamine D. Limitez les sodas et aliments transformés riches en phosphates. Consultez un médecin.",
            "advice_normal": "Parfait ! Votre taux de phosphore est optimal. Continuez une alimentation équilibrée."
        },
        {
            "name": "zinc",
            "display_name": "Zinc",
            "unit": "µg/dL",
            "min_value": 70.0,
            "max_value": 120.0,
            "category": "Minéraux",
            "description": "Oligo-élément essentiel pour l'immunité",
            "explanation": "Le zinc renforce votre système immunitaire, favorise la cicatrisation, participe à la synthèse des protéines et à la croissance. Important pour le goût, l'odorat et la santé de la peau.",
            "advice_low": "Votre zinc est bas. Cela peut affaiblir votre immunité, ralentir la cicatrisation, altérer le goût. Consommez huîtres, viandes rouges, légumineuses, noix, graines. Une supplémentation peut être bénéfique.",
            "advice_high": "Votre zinc est trop élevé, souvent dû à une supplémentation excessive. L'excès peut nuire à l'absorption du cuivre et du fer. Réduisez vos compléments.",
            "advice_normal": "Excellent ! Votre taux de zinc est optimal. Continuez une alimentation variée."
        },
        # ========== HÉMATOLOGIE COMPLÉMENTAIRE ==========
        {
            "name": "hematocrite",
            "display_name": "Hématocrite",
            "unit": "%",
            "min_value": 40.0,
            "max_value": 54.0,
            "category": "Hématologie",
            "description": "Proportion de globules rouges dans le sang",
            "explanation": "L'hématocrite mesure le pourcentage de votre sang occupé par les globules rouges. Un taux bas peut indiquer une anémie, un taux élevé une déshydratation ou polyglobulie.",
            "advice_low": "Votre hématocrite est bas (anémie possible). Cela peut causer fatigue et essoufflement. Augmentez les aliments riches en fer et consultez un médecin pour identifier la cause (carence en fer, B12, saignements...).",
            "advice_high": "Votre hématocrite est élevé. Cela peut être dû à la déshydratation, au tabagisme ou à une polyglobulie. Hydratez-vous bien et consultez un médecin.",
            "advice_normal": "Parfait ! Votre hématocrite est normal. Votre sang a une composition équilibrée."
        },
        {
            "name": "vgm",
            "display_name": "VGM (Volume Globulaire Moyen)",
            "unit": "fL",
            "min_value": 80.0,
            "max_value": 100.0,
            "category": "Hématologie",
            "description": "Taille moyenne des globules rouges",
            "explanation": "Le VGM mesure la taille de vos globules rouges. Un VGM bas (microcytose) suggère souvent une carence en fer, un VGM élevé (macrocytose) peut indiquer une carence en B12 ou folates, ou une consommation excessive d'alcool.",
            "advice_low": "Votre VGM est bas (microcytose). Cela suggère souvent une carence en fer. Augmentez viandes, légumineuses, épinards et consultez pour un bilan martial (fer, ferritine).",
            "advice_high": "Votre VGM est élevé (macrocytose). Cela peut indiquer une carence en B12/folates ou une consommation excessive d'alcool. Consultez pour un bilan complet et réduisez l'alcool.",
            "advice_normal": "Parfait ! Vos globules rouges ont une taille normale. Continuez une alimentation équilibrée."
        },
        {
            "name": "erythrocytes",
            "display_name": "Érythrocytes (Globules Rouges)",
            "unit": "T/L",
            "min_value": 4.5,
            "max_value": 5.9,
            "category": "Hématologie",
            "description": "Nombre de globules rouges dans le sang",
            "explanation": "Les érythrocytes (globules rouges) transportent l'oxygène dans tout votre corps grâce à l'hémoglobine qu'ils contiennent. Leur nombre reflète votre capacité à oxygéner vos tissus.",
            "advice_low": "Votre nombre de globules rouges est bas (anémie). Cela peut causer fatigue, pâleur, essoufflement. Augmentez les aliments riches en fer et consultez pour identifier la cause.",
            "advice_high": "Votre nombre de globules rouges est élevé (polyglobulie). Cela peut être dû à la déshydratation, au tabagisme ou un problème médullaire. Consultez un médecin.",
            "advice_normal": "Excellent ! Votre nombre de globules rouges est optimal. Votre oxygénation est bonne."
        },
        # ========== FONCTION RÉNALE ==========
        {
            "name": "uree",
            "display_name": "Urée",
            "unit": "g/L",
            "min_value": 0.15,
            "max_value": 0.45,
            "category": "Fonction rénale",
            "description": "Déchet azoté éliminé par les reins",
            "explanation": "L'urée est un déchet produit lors de la dégradation des protéines, éliminé par vos reins. Son taux reflète la fonction rénale et l'apport en protéines. Un excès peut indiquer un problème rénal ou une déshydratation.",
            "advice_low": "Votre urée est basse, ce qui est rare et généralement sans gravité. Peut refléter un apport faible en protéines ou une surhydratation. Aucune action sauf si symptômes.",
            "advice_high": "Votre urée est élevée. Cela peut indiquer un problème rénal, une déshydratation ou un excès de protéines. Hydratez-vous bien, réduisez les protéines si excessives et consultez un médecin pour évaluer votre fonction rénale.",
            "advice_normal": "Parfait ! Vos reins éliminent correctement les déchets. Continuez à bien vous hydrater."
        },
        {
            "name": "acide_urique",
            "display_name": "Acide Urique",
            "unit": "mg/L",
            "min_value": 30.0,
            "max_value": 70.0,
            "category": "Fonction rénale",
            "description": "Déchet pouvant cristalliser dans les articulations",
            "explanation": "L'acide urique provient de la dégradation des purines (présentes dans certains aliments). Un excès peut cristalliser dans les articulations et causer la goutte, ou former des calculs rénaux.",
            "advice_low": "Votre acide urique est bas, ce qui est favorable et sans danger. Continuez ainsi.",
            "advice_high": "Votre acide urique est élevé (hyperuricémie). Risque de goutte et calculs rénaux. Réduisez viandes rouges, abats, fruits de mer, alcool (surtout bière). Augmentez l'eau (2L/jour), fruits et légumes. Consultez un médecin.",
            "advice_normal": "Parfait ! Votre acide urique est dans la norme. Continuez à bien vous hydrater."
        },
        # ========== FONCTION HÉPATIQUE ==========
        {
            "name": "transaminases_asat",
            "display_name": "ASAT (Transaminases)",
            "unit": "UI/L",
            "min_value": 10.0,
            "max_value": 40.0,
            "category": "Fonction hépatique",
            "description": "Enzyme présente dans le foie et le cœur",
            "explanation": "Les ASAT sont des enzymes présentes principalement dans le foie et le cœur. Leur élévation peut indiquer une souffrance hépatique (alcool, médicaments, hépatite) ou parfois cardiaque (infarctus).",
            "advice_low": "Votre taux d'ASAT est très bas, ce qui est généralement excellent. Aucune action nécessaire.",
            "advice_high": "Vos ASAT sont élevées. Cela peut indiquer une souffrance du foie ou parfois du cœur. Réduisez l'alcool, vérifiez vos médicaments et consultez un médecin pour explorer la cause.",
            "advice_normal": "Parfait ! Votre foie et votre cœur fonctionnent bien. Limitez l'alcool et maintenez une alimentation saine."
        },
        {
            "name": "gamma_gt",
            "display_name": "Gamma-GT",
            "unit": "UI/L",
            "min_value": 10.0,
            "max_value": 50.0,
            "category": "Fonction hépatique",
            "description": "Enzyme sensible à l'alcool et aux médicaments",
            "explanation": "Les gamma-GT sont des enzymes hépatiques très sensibles à l'alcool et certains médicaments. Leur élévation est un marqueur précoce de souffrance hépatique, souvent liée à la consommation d'alcool.",
            "advice_low": "Votre taux de gamma-GT est très bas, ce qui est excellent. Continuez vos bonnes habitudes.",
            "advice_high": "Vos gamma-GT sont élevées. Cela indique souvent une consommation excessive d'alcool ou une souffrance hépatique. Réduisez ou arrêtez l'alcool, perdez du poids si surpoids, et consultez un médecin.",
            "advice_normal": "Parfait ! Votre foie se porte bien. Continuez à limiter l'alcool."
        },
        {
            "name": "phosphatases_alcalines",
            "display_name": "Phosphatases Alcalines",
            "unit": "UI/L",
            "min_value": 30.0,
            "max_value": 120.0,
            "category": "Fonction hépatique",
            "description": "Enzymes du foie et des os",
            "explanation": "Les phosphatases alcalines sont des enzymes présentes dans le foie et les os. Leur élévation peut indiquer un problème hépatique (obstruction biliaire) ou osseuse (croissance, fracture, maladie osseuse).",
            "advice_low": "Votre taux de phosphatases alcalines est bas, ce qui est rare. Généralement sans gravité. Consultez si symptômes.",
            "advice_high": "Vos phosphatases alcalines sont élevées. Cela peut indiquer un problème de foie (obstruction biliaire) ou d'os. Consultez un médecin pour un bilan complet.",
            "advice_normal": "Parfait ! Vos enzymes hépatiques et osseuses sont normales."
        },
        {
            "name": "bilirubine_totale",
            "display_name": "Bilirubine Totale",
            "unit": "mg/L",
            "min_value": 3.0,
            "max_value": 12.0,
            "category": "Fonction hépatique",
            "description": "Pigment jaune résultant de la dégradation des globules rouges",
            "explanation": "La bilirubine est un pigment jaune produit lors de la dégradation des vieux globules rouges. Elle est transformée par le foie puis éliminée. Un excès cause la jaunisse (peau et yeux jaunes).",
            "advice_low": "Votre bilirubine est basse, ce qui est normal et sans danger. Aucune action nécessaire.",
            "advice_high": "Votre bilirubine est élevée (hyperbilirubinémie). Cela peut indiquer un problème de foie, une obstruction biliaire ou une destruction excessive de globules rouges. Consultez rapidement un médecin, surtout si peau ou yeux jaunâtres.",
            "advice_normal": "Parfait ! Votre foie transforme et élimine correctement la bilirubine."
        },
        # ========== PROTÉINES ==========
        {
            "name": "albumine",
            "display_name": "Albumine",
            "unit": "g/L",
            "min_value": 35.0,
            "max_value": 50.0,
            "category": "Protéines",
            "description": "Principale protéine du sang",
            "explanation": "L'albumine est la protéine la plus abondante dans votre sang, produite par le foie. Elle maintient l'eau dans les vaisseaux, transporte nutriments et médicaments. Son taux reflète votre état nutritionnel et la fonction hépatique.",
            "advice_low": "Votre albumine est basse. Cela peut indiquer une dénutrition, un problème de foie, de reins ou une maladie inflammatoire. Augmentez les protéines (viandes, poissons, œufs, légumineuses) et consultez un médecin.",
            "advice_high": "Votre albumine est élevée, souvent due à la déshydratation. Hydratez-vous mieux. Rarement un vrai problème.",
            "advice_normal": "Parfait ! Votre taux d'albumine est optimal. Votre nutrition et votre foie sont en bonne santé."
        },
        {
            "name": "proteines_totales",
            "display_name": "Protéines Totales",
            "unit": "g/L",
            "min_value": 60.0,
            "max_value": 80.0,
            "category": "Protéines",
            "description": "Ensemble des protéines du sang",
            "explanation": "Les protéines totales incluent toutes les protéines de votre sang (albumine, globulines, anticorps). Elles reflètent votre état nutritionnel, immunitaire et la fonction de votre foie.",
            "advice_low": "Vos protéines totales sont basses. Cela peut indiquer une dénutrition, un problème de foie, de reins ou une perte protéique. Augmentez les aliments protéinés et consultez un médecin.",
            "advice_high": "Vos protéines totales sont élevées. Cela peut indiquer une déshydratation ou parfois une production excessive d'anticorps. Hydratez-vous et consultez si cela persiste.",
            "advice_normal": "Parfait ! Vos protéines sanguines sont équilibrées. Votre nutrition est adéquate."
        },
        {
            "name": "ferritine",
            "display_name": "Ferritine",
            "unit": "ng/mL",
            "min_value": 30.0,
            "max_value": 300.0,
            "category": "Protéines",
            "description": "Protéine de stockage du fer",
            "explanation": "La ferritine stocke le fer dans votre corps. Son taux reflète vos réserves en fer. C'est le meilleur marqueur pour détecter une carence ou surcharge en fer, bien avant que l'anémie n'apparaisse.",
            "advice_low": "Votre ferritine est basse (réserves de fer épuisées). Même si votre hémoglobine est normale, vous risquez l'anémie. Augmentez viandes rouges, abats, légumineuses, épinards + vitamine C. Une supplémentation en fer est souvent nécessaire.",
            "advice_high": "Votre ferritine est très élevée (surcharge en fer). Cela peut être dû à une hémochromatose, inflammation chronique ou supplémentation excessive. Arrêtez les compléments en fer et consultez un médecin pour explorer la cause.",
            "advice_normal": "Excellent ! Vos réserves de fer sont optimales. Continuez une alimentation équilibrée."
        },
        # ========== INFLAMMATION ==========
        {
            "name": "crp",
            "display_name": "CRP (Protéine C-Réactive)",
            "unit": "mg/L",
            "min_value": 0.0,
            "max_value": 5.0,
            "category": "Inflammation",
            "description": "Marqueur d'inflammation dans le corps",
            "explanation": "La CRP est une protéine produite par le foie en réponse à une inflammation ou infection. Elle augmente rapidement et fortement lors d'infections, maladies inflammatoires ou après traumatismes. Un taux chroniquement élevé peut refléter une inflammation silencieuse.",
            "advice_low": "Votre CRP est très basse, ce qui est excellent. Aucune inflammation détectée. Continuez vos bonnes habitudes.",
            "advice_high": "Votre CRP est élevée, indiquant une inflammation ou infection active. Cela peut être une simple infection (rhume, grippe) ou quelque chose de plus sérieux. Consultez un médecin pour identifier la cause et traiter si nécessaire.",
            "advice_normal": "Parfait ! Votre CRP est normale. Aucune inflammation significative détectée."
        },
        # ========== HORMONES ==========
        {
            "name": "testosterone",
            "display_name": "Testostérone",
            "unit": "ng/mL",
            "min_value": 3.0,
            "max_value": 10.0,
            "category": "Hormones",
            "description": "Hormone sexuelle masculine (également présente chez les femmes)",
            "explanation": "La testostérone est l'hormone masculine principale, essentielle pour la masse musculaire, la libido, l'énergie et l'humeur. Chez les femmes, elle est produite en plus petites quantités mais reste importante. Chez les hommes, elle diminue naturellement avec l'âge.",
            "advice_low": "Votre testostérone est basse. Chez l'homme, cela peut causer fatigue, baisse de libido, perte musculaire, dépression. Améliorez sommeil, exercice (musculation), réduisez stress, perdez du poids si surpoids. Consultez un endocrinologue.",
            "advice_high": "Votre testostérone est élevée. Chez l'homme, si naturel et sans symptômes, généralement acceptable. Chez la femme, peut causer acné, pilosité excessive, troubles menstruels. Consultez pour explorer la cause (SOPK, tumeur...).",
            "advice_normal": "Parfait ! Votre taux de testostérone est optimal. Maintenez une bonne hygiène de vie."
        },
        {
            "name": "cortisol",
            "display_name": "Cortisol",
            "unit": "µg/dL",
            "min_value": 5.0,
            "max_value": 25.0,
            "category": "Hormones",
            "description": "Hormone du stress et de l'énergie",
            "explanation": "Le cortisol est l'hormone du stress, produite par vos glandes surrénales. Il régule votre métabolisme, pression artérielle, réponse au stress et système immunitaire. Il varie durant la journée (pic le matin, bas le soir).",
            "advice_low": "Votre cortisol est bas. Cela peut indiquer une insuffisance surrénalienne (maladie d'Addison) causant fatigue intense, hypotension, hypoglycémie. Consultez rapidement un endocrinologue.",
            "advice_high": "Votre cortisol est élevé. Cela peut être dû au stress chronique, syndrome de Cushing, ou médicaments (corticoïdes). Gérez votre stress (méditation, sport, sommeil), consultez si symptômes (prise de poids, hypertension, fatigue).",
            "advice_normal": "Parfait ! Votre cortisol est équilibré. Continuez à gérer votre stress efficacement."
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


