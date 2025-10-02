"""
Service de génération de PDF pour les résultats d'analyse de bilans sanguins
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from io import BytesIO
from datetime import datetime
from typing import List, Dict, Any


class PDFGenerator:
    """Classe pour générer des PDF de résultats d'analyse"""
    
    def __init__(self):
        self.buffer = BytesIO()
        self.page_width, self.page_height = A4
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Configurer des styles personnalisés pour le PDF"""
        # Style pour le titre principal
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            textColor=colors.HexColor('#0369a1'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Style pour les sous-titres
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#0ea5e9'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Style pour le texte normal
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=14,
            alignment=TA_JUSTIFY,
            spaceAfter=10
        ))
        
        # Style pour les conseils
        self.styles.add(ParagraphStyle(
            name='AdviceStyle',
            parent=self.styles['Normal'],
            fontSize=9,
            leading=12,
            leftIndent=10,
            rightIndent=10,
            spaceAfter=8
        ))
    
    def generate_analysis_pdf(self, results: Dict[str, Any]) -> BytesIO:
        """
        Générer un PDF complet avec les résultats d'analyse
        
        Args:
            results: Dictionnaire contenant les résultats d'analyse
            
        Returns:
            BytesIO contenant le PDF généré
        """
        # Créer le document
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        # Construire le contenu
        story = []
        
        # En-tête
        story.extend(self._create_header())
        
        # Résumé
        story.extend(self._create_summary(results))
        
        # Tableau des résultats
        story.extend(self._create_results_table(results))
        
        # Détails pour chaque biomarqueur
        story.extend(self._create_detailed_results(results))
        
        # Avertissement médical
        story.extend(self._create_disclaimer())
        
        # Pied de page
        story.extend(self._create_footer())
        
        # Générer le PDF
        doc.build(story)
        self.buffer.seek(0)
        return self.buffer
    
    def _create_header(self) -> List:
        """Créer l'en-tête du PDF"""
        elements = []
        
        # Logo/Titre
        title = Paragraph("🩺 Healer - Analyse de Bilan Sanguin", self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 0.3*cm))
        
        # Date et heure
        date_text = f"<b>Date de l'analyse :</b> {datetime.now().strftime('%d/%m/%Y à %H:%M')}"
        date_para = Paragraph(date_text, self.styles['CustomBody'])
        elements.append(date_para)
        elements.append(Spacer(1, 0.5*cm))
        
        # Ligne de séparation
        elements.append(Spacer(1, 0.2*cm))
        
        return elements
    
    def _create_summary(self, results: Dict[str, Any]) -> List:
        """Créer le résumé statistique"""
        elements = []
        
        # Titre de section
        summary_title = Paragraph("📊 Résumé de l'analyse", self.styles['CustomHeading'])
        elements.append(summary_title)
        
        summary = results.get('summary', {})
        total = len(results.get('results', []))
        normal = summary.get('normal', 0)
        bas = summary.get('bas', 0)
        haut = summary.get('haut', 0)
        inconnu = summary.get('inconnu', 0)
        
        # Créer le tableau de résumé
        summary_data = [
            ['Indicateur', 'Nombre', 'Pourcentage'],
            ['Total analysé', str(total), '100%'],
            ['✓ Valeurs normales', str(normal), f'{(normal/total*100):.0f}%' if total > 0 else '0%'],
            ['↓ Valeurs basses', str(bas), f'{(bas/total*100):.0f}%' if total > 0 else '0%'],
            ['↑ Valeurs élevées', str(haut), f'{(haut/total*100):.0f}%' if total > 0 else '0%'],
        ]
        
        if inconnu > 0:
            summary_data.append(['? Inconnus', str(inconnu), f'{(inconnu/total*100):.0f}%'])
        
        summary_table = Table(summary_data, colWidths=[8*cm, 3*cm, 3*cm])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0ea5e9')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f9ff')]),
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 0.8*cm))
        
        return elements
    
    def _create_results_table(self, results: Dict[str, Any]) -> List:
        """Créer le tableau récapitulatif des résultats"""
        elements = []
        
        # Titre de section
        table_title = Paragraph("📋 Tableau récapitulatif", self.styles['CustomHeading'])
        elements.append(table_title)
        
        # Données du tableau
        table_data = [['Biomarqueur', 'Votre valeur', 'Plage normale', 'Statut']]
        
        for result in results.get('results', []):
            biomarker = result.get('biomarker', '')
            value = f"{result.get('value', 0)} {result.get('unit', '')}"
            normal_range = f"{result.get('min_value', 0)} - {result.get('max_value', 0)} {result.get('unit', '')}"
            status = result.get('status', '').upper()
            
            # Symbole selon le statut
            if status == 'NORMAL':
                status_symbol = '✓ Normal'
            elif status == 'BAS':
                status_symbol = '↓ Bas'
            elif status == 'HAUT':
                status_symbol = '↑ Élevé'
            else:
                status_symbol = '? Inconnu'
            
            table_data.append([biomarker, value, normal_range, status_symbol])
        
        # Créer la table
        results_table = Table(table_data, colWidths=[5*cm, 3.5*cm, 4*cm, 3*cm])
        
        # Style de la table
        table_style = [
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0ea5e9')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f9ff')]),
        ]
        
        # Colorer les statuts
        for i, result in enumerate(results.get('results', []), start=1):
            status = result.get('status', '').lower()
            if status == 'normal':
                table_style.append(('TEXTCOLOR', (3, i), (3, i), colors.HexColor('#10b981')))
            elif status == 'bas':
                table_style.append(('TEXTCOLOR', (3, i), (3, i), colors.HexColor('#f59e0b')))
            elif status == 'haut':
                table_style.append(('TEXTCOLOR', (3, i), (3, i), colors.HexColor('#ef4444')))
        
        results_table.setStyle(TableStyle(table_style))
        
        elements.append(results_table)
        elements.append(Spacer(1, 0.8*cm))
        
        return elements
    
    def _create_detailed_results(self, results: Dict[str, Any]) -> List:
        """Créer les détails pour chaque biomarqueur"""
        elements = []
        
        # Titre de section
        details_title = Paragraph("📖 Explications détaillées", self.styles['CustomHeading'])
        elements.append(details_title)
        elements.append(Spacer(1, 0.3*cm))
        
        for i, result in enumerate(results.get('results', [])):
            # Titre du biomarqueur
            biomarker_name = result.get('biomarker', '')
            status = result.get('status', '').lower()
            
            # Couleur selon le statut
            if status == 'normal':
                color = '#10b981'
            elif status == 'bas':
                color = '#f59e0b'
            elif status == 'haut':
                color = '#ef4444'
            else:
                color = '#6b7280'
            
            biomarker_title = f'<font color="{color}"><b>{i+1}. {biomarker_name}</b></font>'
            elements.append(Paragraph(biomarker_title, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.2*cm))
            
            # Explication
            explanation_text = f"<b>Qu'est-ce que c'est ?</b><br/>{result.get('explanation', '')}"
            elements.append(Paragraph(explanation_text, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.2*cm))
            
            # Conseil
            advice_text = f"<b>💡 Recommandation :</b><br/>{result.get('advice', '')}"
            elements.append(Paragraph(advice_text, self.styles['AdviceStyle']))
            elements.append(Spacer(1, 0.5*cm))
        
        return elements
    
    def _create_disclaimer(self) -> List:
        """Créer l'avertissement médical"""
        elements = []
        
        elements.append(Spacer(1, 0.5*cm))
        
        disclaimer_title = Paragraph("⚕️ Avertissement médical important", self.styles['CustomHeading'])
        elements.append(disclaimer_title)
        
        disclaimer_text = """
        <b>Ces informations sont à but éducatif uniquement.</b> Elles ne remplacent en aucun cas 
        l'avis, le diagnostic ou le traitement d'un professionnel de santé qualifié. 
        <br/><br/>
        Les plages normales indiquées sont des valeurs générales et peuvent varier selon votre âge, 
        votre sexe, votre état de santé et le laboratoire d'analyse.
        <br/><br/>
        <b>Consultez toujours votre médecin pour l'interprétation de vos résultats et tout 
        traitement éventuel.</b> N'arrêtez jamais un traitement en cours sans avis médical.
        """
        
        disclaimer_para = Paragraph(disclaimer_text, self.styles['CustomBody'])
        elements.append(disclaimer_para)
        
        return elements
    
    def _create_footer(self) -> List:
        """Créer le pied de page"""
        elements = []
        
        elements.append(Spacer(1, 1*cm))
        
        footer_text = f"""
        <br/>
        ────────────────────────────────────────────────────────────────<br/>
        <i>Document généré par Healer v1.0.0 - Plateforme éducative d'analyse de bilans sanguins</i><br/>
        <i>Date de génération : {datetime.now().strftime('%d/%m/%Y à %H:%M:%S')}</i>
        """
        
        footer_para = Paragraph(footer_text, ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        ))
        
        elements.append(footer_para)
        
        return elements


def generate_pdf_report(analysis_results: Dict[str, Any]) -> BytesIO:
    """
    Fonction helper pour générer un rapport PDF
    
    Args:
        analysis_results: Résultats de l'analyse au format AnalyzeResponse
        
    Returns:
        BytesIO contenant le PDF
    """
    generator = PDFGenerator()
    return generator.generate_analysis_pdf(analysis_results)

